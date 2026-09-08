import { doc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ref, set, update, onValue, serverTimestamp as rtdbServerTimestamp } from 'firebase/database';
import { db, rtdb, isRtdbConfigured } from '../../firebase/firebaseConfig';
import { COLLECTIONS, TRIP_STATUS, BUS_STATUS } from '../../constants/collections';

/**
 * Tracking Status Controlled Vocabulary
 */
export const TRACKING_STATUS = {
  ACTIVE: 'active',
  WAITING: 'waiting',
  STALE: 'stale',
  OFFLINE: 'offline',
  STOPPED: 'stopped',
  PERMISSION_REQUIRED: 'permission_required',
};

/**
 * Freshness Thresholds (milliseconds) with dynamic settings fallback
 */
export let TRACKING_THRESHOLDS = {
  FRESH_MAX_MS: 20000,    // < 20s: Live / Fresh
  RECENT_MAX_MS: 60000,   // 20s–60s: Recent / Minor delay
  STALE_MIN_MS: 60000,    // > 60s: Stale (show "Location update delayed")
};

// Listen to runtime transport settings updates
if (typeof window !== 'undefined') {
  window.addEventListener('routewise:settings_updated', (e) => {
    if (e.detail?.category === 'transport' && e.detail?.settings?.trackingFreshnessSeconds) {
      const sec = Number(e.detail.settings.trackingFreshnessSeconds);
      if (sec > 0) {
        TRACKING_THRESHOLDS = {
          FRESH_MAX_MS: (sec / 2) * 1000,
          RECENT_MAX_MS: sec * 1000,
          STALE_MIN_MS: sec * 1000,
        };
      }
    }
  });
}

/**
 * Categorize tracking freshness based on last updated timestamp
 */
export const getTrackingFreshness = (timestamp) => {
  if (!timestamp) return TRACKING_STATUS.OFFLINE;
  const timeMs = typeof timestamp === 'number' ? timestamp : timestamp.toMillis ? timestamp.toMillis() : Date.now();
  const diff = Date.now() - timeMs;

  if (diff <= TRACKING_THRESHOLDS.FRESH_MAX_MS) return TRACKING_STATUS.ACTIVE;
  if (diff <= TRACKING_THRESHOLDS.RECENT_MAX_MS) return 'recent';
  return TRACKING_STATUS.STALE;
};

// Track in-memory throttle for Firestore persistence to control cloud write costs
const lastFirestoreSyncMap = new Map();
const FIRESTORE_SYNC_THROTTLE_MS = 25000; // Save to Firestore every 25s for business history

/**
 * Production-Oriented Real-Time Tracking Service
 * Wraps Firebase Realtime Database for high-frequency GPS live streaming (liveTracking/{tripId})
 * and Firestore for persistent business records and graceful offline fallback.
 */
export const trackingService = {
  /**
   * Publish an updated location record from the Driver's GPS
   * 1. High-frequency live stream -> Firebase Realtime Database (liveTracking/{tripId})
   * 2. Periodic state sync -> Firestore trips/{tripId} (throttled)
   */
  publishDriverLocation: async (tripId, locationData, { busId = null, driverId = null, routeId = null, schoolId = null } = {}) => {
    if (!tripId) throw new Error('Trip ID is required to publish tracking location.');

    const safeLocationPayload = {
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      accuracy: locationData.accuracy || null,
      isLowAccuracy: Boolean(locationData.isLowAccuracy),
      heading: locationData.heading !== undefined ? locationData.heading : null,
      speed: locationData.speed !== undefined ? locationData.speed : null,
      deviceTimestamp: locationData.timestamp || Date.now(),
    };

    // 1. High-frequency write to Firebase Realtime Database (RTDB)
    if (isRtdbConfigured && rtdb) {
      try {
        const liveTrackingRef = ref(rtdb, `liveTracking/${tripId}`);
        const rtdbPayload = {
          tripId,
          ...(busId && { busId }),
          ...(driverId && { driverId }),
          ...(routeId && { routeId }),
          ...(schoolId && { schoolId }),
          latitude: safeLocationPayload.latitude,
          longitude: safeLocationPayload.longitude,
          accuracy: safeLocationPayload.accuracy,
          isLowAccuracy: safeLocationPayload.isLowAccuracy,
          heading: safeLocationPayload.heading,
          speed: safeLocationPayload.speed,
          deviceTimestamp: safeLocationPayload.deviceTimestamp,
          timestamp: rtdbServerTimestamp(),
          status: TRACKING_STATUS.ACTIVE,
        };
        await set(liveTrackingRef, rtdbPayload);
      } catch (rtdbErr) {
        console.warn('Realtime Database GPS write warning (falling back to Firestore):', rtdbErr.message);
      }
    }

    // 2. Throttled persistent write to Firestore to save costs and update operational documents
    const now = Date.now();
    const lastSync = lastFirestoreSyncMap.get(tripId) || 0;
    const shouldSyncFirestore = (now - lastSync) >= FIRESTORE_SYNC_THROTTLE_MS;

    if (shouldSyncFirestore) {
      lastFirestoreSyncMap.set(tripId, now);
      try {
        const tripDocRef = doc(db, COLLECTIONS.TRIPS, tripId);
        const updatePayload = {
          currentLocation: safeLocationPayload,
          trackingStatus: TRACKING_STATUS.ACTIVE,
          lastTrackingUpdate: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await updateDoc(tripDocRef, updatePayload);

        // Synchronize bus operational coordinates if busId is provided
        if (busId) {
          const busDocRef = doc(db, COLLECTIONS.BUSES, busId);
          await updateDoc(busDocRef, {
            lastKnownLocation: {
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              updatedAt: Date.now(),
            },
            status: BUS_STATUS.ACTIVE,
            updatedAt: serverTimestamp(),
          }).catch((busErr) => {
            console.warn('TrackingService: Bus location sync note:', busErr.message);
          });
        }
      } catch (firestoreErr) {
        console.warn('TrackingService Firestore sync warning:', firestoreErr.message);
      }
    }

    return safeLocationPayload;
  },

  /**
   * Mark trip tracking as stopped in both RTDB and Firestore
   */
  stopTripTracking: async (tripId) => {
    if (!tripId) return;

    // 1. Update RTDB status
    if (isRtdbConfigured && rtdb) {
      try {
        const liveTrackingRef = ref(rtdb, `liveTracking/${tripId}`);
        await update(liveTrackingRef, {
          status: TRACKING_STATUS.STOPPED,
          timestamp: rtdbServerTimestamp(),
        });
      } catch (rtdbErr) {
        console.warn('RTDB stopTracking note:', rtdbErr.message);
      }
    }

    // 2. Update Firestore trip
    try {
      const tripDocRef = doc(db, COLLECTIONS.TRIPS, tripId);
      await updateDoc(tripDocRef, {
        trackingStatus: TRACKING_STATUS.STOPPED,
        updatedAt: serverTimestamp(),
      });
    } catch (fsErr) {
      console.warn('Firestore stopTracking note:', fsErr.message);
    }
  },

  /**
   * Finalize tracking upon trip completion or cancellation
   */
  finalizeTripTracking: async (tripId, status = TRIP_STATUS.COMPLETED) => {
    if (!tripId) return;

    // 1. Update RTDB status to completed
    if (isRtdbConfigured && rtdb) {
      try {
        const liveTrackingRef = ref(rtdb, `liveTracking/${tripId}`);
        await update(liveTrackingRef, {
          status: status === TRIP_STATUS.COMPLETED ? 'completed' : TRACKING_STATUS.STOPPED,
          timestamp: rtdbServerTimestamp(),
        });
      } catch (rtdbErr) {
        console.warn('RTDB finalizeTripTracking note:', rtdbErr.message);
      }
    }

    // 2. Finalize Firestore trip
    try {
      const tripDocRef = doc(db, COLLECTIONS.TRIPS, tripId);
      await updateDoc(tripDocRef, {
        status,
        trackingStatus: TRACKING_STATUS.STOPPED,
        actualEndTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        updatedAt: serverTimestamp(),
      });
    } catch (fsErr) {
      console.warn('Firestore finalizeTripTracking note:', fsErr.message);
    }
  },

  /**
   * Subscribe to a single trip's live tracking stream
   * Primary: Firebase Realtime Database (low latency, high frequency)
   * Fallback: Firestore document onSnapshot (if RTDB offline or initial bootstrap)
   * Guaranteed unsubscribe function returned.
   */
  subscribeToTripTracking: (tripId, onUpdate, onError) => {
    if (!tripId) {
      if (onUpdate) onUpdate(null);
      return () => {};
    }

    let firestoreUnsubscribe = null;
    let rtdbOffFunction = null;
    let hasRtdbData = false;

    // 1. Fallback / base subscription via Firestore doc
    const tripDocRef = doc(db, COLLECTIONS.TRIPS, tripId);
    firestoreUnsubscribe = onSnapshot(
      tripDocRef,
      (docSnap) => {
        if (!docSnap.exists()) {
          if (!hasRtdbData && onUpdate) onUpdate(null);
          return;
        }

        const data = docSnap.data();
        const tripData = {
          id: docSnap.id,
          ...data,
        };

        // If RTDB hasn't delivered fresh high-frequency coordinates, emit Firestore data
        if (!hasRtdbData && onUpdate) {
          onUpdate(tripData);
        }
      },
      (error) => {
        console.warn(`TrackingService Firestore snapshot note on trip [${tripId}]:`, error.message);
        if (onError && !hasRtdbData) onError(error);
      }
    );

    // 2. High-frequency subscription via Firebase Realtime Database
    if (isRtdbConfigured && rtdb) {
      try {
        const liveTrackingRef = ref(rtdb, `liveTracking/${tripId}`);
        rtdbOffFunction = onValue(
          liveTrackingRef,
          (snapshot) => {
            const val = snapshot.val();
            if (val) {
              hasRtdbData = true;
              const liveData = {
                id: tripId,
                trackingStatus: val.status || TRACKING_STATUS.ACTIVE,
                lastTrackingUpdate: val.timestamp || val.deviceTimestamp || Date.now(),
                currentLocation: {
                  latitude: val.latitude,
                  longitude: val.longitude,
                  accuracy: val.accuracy || null,
                  isLowAccuracy: Boolean(val.isLowAccuracy),
                  heading: val.heading !== undefined ? val.heading : null,
                  speed: val.speed !== undefined ? val.speed : null,
                  deviceTimestamp: val.deviceTimestamp || Date.now(),
                },
                ...(val.busId && { busId: val.busId }),
                ...(val.routeId && { routeId: val.routeId }),
              };

              if (onUpdate) {
                onUpdate(liveData);
              }
            }
          },
          (rtdbError) => {
            console.warn(`TrackingService RTDB listener warning on trip [${tripId}]:`, rtdbError.message);
            // Non-fatal, Firestore fallback remains active
          }
        );
      } catch (setupErr) {
        console.warn('TrackingService RTDB setup warning:', setupErr.message);
      }
    }

    // Cleanup both subscriptions cleanly on unmount
    return () => {
      if (firestoreUnsubscribe) firestoreUnsubscribe();
      if (rtdbOffFunction) rtdbOffFunction();
    };
  },
};

export default trackingService;
