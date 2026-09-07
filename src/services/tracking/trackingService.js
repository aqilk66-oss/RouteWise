import { doc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
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

/**
 * Production-Oriented Real-Time Tracking Service
 * Wraps Firestore real-time subscriptions and throttled driver updates.
 */
export const trackingService = {
  /**
   * Publish an updated location record to an active trip in Firestore
   * Throttled updates ensure we don't spam database writes.
   */
  publishDriverLocation: async (tripId, locationData, { busId = null } = {}) => {
    if (!tripId) throw new Error('Trip ID is required to publish tracking location.');

    const tripDocRef = doc(db, COLLECTIONS.TRIPS, tripId);

    const safeLocationPayload = {
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      accuracy: locationData.accuracy || null,
      isLowAccuracy: Boolean(locationData.isLowAccuracy),
      heading: locationData.heading !== undefined ? locationData.heading : null,
      speed: locationData.speed !== undefined ? locationData.speed : null,
      deviceTimestamp: locationData.timestamp || Date.now(),
    };

    const updatePayload = {
      currentLocation: safeLocationPayload,
      trackingStatus: TRACKING_STATUS.ACTIVE,
      lastTrackingUpdate: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await updateDoc(tripDocRef, updatePayload);

    // If busId is supplied, synchronize bus operational coordinates
    if (busId) {
      try {
        const busDocRef = doc(db, COLLECTIONS.BUSES, busId);
        await updateDoc(busDocRef, {
          lastKnownLocation: {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            updatedAt: Date.now(),
          },
          status: BUS_STATUS.ACTIVE,
          updatedAt: serverTimestamp(),
        });
      } catch (busErr) {
        // Non-fatal bus update warning
        console.warn('TrackingService: Bus location sync note:', busErr.message);
      }
    }

    return safeLocationPayload;
  },

  /**
   * Mark trip tracking as stopped
   */
  stopTripTracking: async (tripId) => {
    if (!tripId) return;
    const tripDocRef = doc(db, COLLECTIONS.TRIPS, tripId);
    await updateDoc(tripDocRef, {
      trackingStatus: TRACKING_STATUS.STOPPED,
      updatedAt: serverTimestamp(),
    });
  },

  /**
   * Finalize tracking upon trip completion or cancellation
   */
  finalizeTripTracking: async (tripId, status = TRIP_STATUS.COMPLETED) => {
    if (!tripId) return;
    const tripDocRef = doc(db, COLLECTIONS.TRIPS, tripId);
    await updateDoc(tripDocRef, {
      status,
      trackingStatus: TRACKING_STATUS.STOPPED,
      actualEndTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      updatedAt: serverTimestamp(),
    });
  },

  /**
   * Subscribe to a single trip's live tracking document via onSnapshot
   * Guaranteed unsubscribe function returned.
   */
  subscribeToTripTracking: (tripId, onUpdate, onError) => {
    if (!tripId) {
      if (onUpdate) onUpdate(null);
      return () => {};
    }

    const tripDocRef = doc(db, COLLECTIONS.TRIPS, tripId);

    const unsubscribe = onSnapshot(
      tripDocRef,
      (docSnap) => {
        if (!docSnap.exists()) {
          if (onUpdate) onUpdate(null);
          return;
        }

        const data = docSnap.data();
        const tripData = {
          id: docSnap.id,
          ...data,
        };

        if (onUpdate) {
          onUpdate(tripData);
        }
      },
      (error) => {
        console.warn(`TrackingService snapshot error on trip [${tripId}]:`, error.message);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  },
};

export default trackingService;
