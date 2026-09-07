import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { 
  INCIDENT_TYPES, 
  INCIDENT_SEVERITY, 
  INCIDENT_STATUS, 
  INCIDENT_SOURCES,
  ALLOWED_STATUS_TRANSITIONS 
} from '../../constants/incidentConstants';
import { notificationService } from '../firestore/notificationService';
import { emailNotificationService } from '../email/emailNotificationService';
import { NOTIFICATION_TYPE, NOTIFICATION_PRIORITY } from '../../constants/collections';

const INCIDENTS_COLLECTION = 'incidents';
const CONTACTS_COLLECTION = 'emergency_contacts';

// In-memory idempotency cache for incident creation
const recentSubmissionCache = new Set();

/**
 * RouteWise Incident & Emergency Response Service
 */
export const incidentService = {
  /**
   * Create an incident record with idempotency and notifications
   */
  createIncident: async ({
    type = INCIDENT_TYPES.OTHER,
    severity = INCIDENT_SEVERITY.MEDIUM,
    description = '',
    trip = null,
    bus = null,
    route = null,
    driver = null,
    location = null, // { latitude, longitude, accuracy }
    source = INCIDENT_SOURCES.DRIVER,
    reportedBy = null,
    clientSubmissionId = null,
  }) => {
    // 1. Idempotency Guard (prevent double-clicks)
    const dedupKey = clientSubmissionId || `${type}-${trip?.id || 'notrip'}-${reportedBy?.uid || 'nouser'}-${Math.floor(Date.now() / 15000)}`;
    if (recentSubmissionCache.has(dedupKey)) {
      console.warn('Duplicate incident submission suppressed:', dedupKey);
      return { id: dedupKey, status: 'already_submitted' };
    }
    recentSubmissionCache.add(dedupKey);
    setTimeout(() => recentSubmissionCache.delete(dedupKey), 60000);

    const incidentId = `INC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const incidentDocRef = doc(db, INCIDENTS_COLLECTION, incidentId);

    const safePayload = {
      incidentId,
      type: Object.values(INCIDENT_TYPES).includes(type) ? type : INCIDENT_TYPES.OTHER,
      severity: Object.values(INCIDENT_SEVERITY).includes(severity) ? severity : INCIDENT_SEVERITY.MEDIUM,
      status: INCIDENT_STATUS.REPORTED,
      source,
      description: description.trim().substring(0, 500),
      
      // Entity References
      tripId: trip?.id || null,
      tripName: trip?.routeName || route?.name || 'Transit Run',
      busId: bus?.id || trip?.busId || null,
      busNumber: bus?.busNumber || trip?.busNumber || 'Fleet Vehicle',
      routeId: route?.id || trip?.routeId || null,
      routeName: route?.name || trip?.routeName || 'Campus Corridor',
      driverId: driver?.id || driver?.uid || reportedBy?.uid || null,
      driverName: driver?.fullName || reportedBy?.fullName || 'Transit Operator',

      // Location Details (Zero continuous tracking loop)
      location: location?.latitude && location?.longitude ? {
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        accuracy: location.accuracy ? Number(location.accuracy) : null,
        capturedAt: new Date().toISOString(),
      } : null,

      reportedBy: {
        uid: reportedBy?.uid || 'unknown',
        email: reportedBy?.email || '',
        fullName: reportedBy?.fullName || 'Reporter',
      },

      timeline: [
        {
          status: INCIDENT_STATUS.REPORTED,
          timestamp: new Date().toISOString(),
          note: `Incident initially filed as ${type} (${severity} severity).`,
          actor: reportedBy?.fullName || 'Reporter',
        }
      ],

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      acknowledgedAt: null,
      resolvedAt: null,
      closedAt: null,
      resolutionNotes: '',
    };

    // 2. Persist to Firestore
    await setDoc(incidentDocRef, safePayload);

    // 3. Dispatch High-Priority In-App Notification (Stage 12 Integration)
    try {
      const isCritical = severity === INCIDENT_SEVERITY.CRITICAL || type === INCIDENT_TYPES.EMERGENCY;
      await notificationService.createNotification({
        userId: 'all',
        title: isCritical 
          ? `CRITICAL EMERGENCY ALERT: ${safePayload.busNumber}` 
          : `Transport Safety Notice: ${safePayload.busNumber}`,
        message: `${safePayload.type.toUpperCase()} reported on ${safePayload.routeName} by ${safePayload.driverName}. Status: Under Operational Review.`,
        type: NOTIFICATION_TYPE.SAFETY,
        priority: isCritical ? NOTIFICATION_PRIORITY.URGENT : NOTIFICATION_PRIORITY.IMPORTANT,
        recipientRole: 'all',
        relatedTripId: safePayload.tripId,
        relatedBusId: safePayload.busId,
        relatedRouteId: safePayload.routeId,
        eventId: incidentId,
      });
    } catch (notifErr) {
      console.warn('Safety in-app alert notification notice:', notifErr.message);
    }

    // 4. Dispatch Email Alert (Stage 12 EmailJS Integration)
    try {
      if (severity === INCIDENT_SEVERITY.CRITICAL || severity === INCIDENT_SEVERITY.HIGH) {
        await emailNotificationService.sendTransportAlertEmail({
          recipientEmail: 'dispatch@routewise.app',
          recipientName: 'Safety Operations Center',
          eventType: `Safety Alert: ${safePayload.type}`,
          routeName: safePayload.routeName,
          busNumber: safePayload.busNumber,
          scheduledTime: 'Immediate Response Required',
          message: `Incident ${incidentId}: ${safePayload.description || 'Driver triggered transport safety event.'}`,
          eventId: incidentId,
        });
      }
    } catch (emailErr) {
      console.warn('Safety email notice:', emailErr.message);
    }

    return { ...safePayload, id: incidentId };
  },

  /**
   * Fetch single incident by ID
   */
  getIncidentById: async (incidentId) => {
    if (!incidentId) return null;
    const docRef = doc(db, INCIDENTS_COLLECTION, incidentId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    return null;
  },

  /**
   * Fetch active incidents with optional real-time snapshot listener
   */
  subscribeActiveIncidents: (onUpdate, onError) => {
    const activeStatuses = [
      INCIDENT_STATUS.REPORTED,
      INCIDENT_STATUS.ACKNOWLEDGED,
      INCIDENT_STATUS.INVESTIGATING,
      INCIDENT_STATUS.RESPONDING,
    ];

    const q = query(
      collection(db, INCIDENTS_COLLECTION),
      where('status', 'in', activeStatuses),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      onUpdate(items);
    }, (err) => {
      console.warn('Active incidents subscription notice:', err.message);
      if (onError) onError(err);
    });
  },

  /**
   * Fetch incidents list with search, filter, and pagination
   */
  getIncidents: async ({
    status = null,
    severity = null,
    type = null,
    driverId = null,
    tripId = null,
    limitCount = 50,
  } = {}) => {
    try {
      let q = collection(db, INCIDENTS_COLLECTION);
      const constraints = [];

      if (status && status !== 'all') {
        constraints.push(where('status', '==', status));
      }
      if (severity && severity !== 'all') {
        constraints.push(where('severity', '==', severity));
      }
      if (type && type !== 'all') {
        constraints.push(where('type', '==', type));
      }
      if (driverId) {
        constraints.push(where('driverId', '==', driverId));
      }
      if (tripId) {
        constraints.push(where('tripId', '==', tripId));
      }

      constraints.push(orderBy('createdAt', 'desc'));
      constraints.push(limit(limitCount));

      const finalQuery = query(q, ...constraints);
      const snapshot = await getDocs(finalQuery);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.warn('Fetch incidents query warning:', err.message);
      // Fallback query if compound index is pending
      const fallbackSnap = await getDocs(query(collection(db, INCIDENTS_COLLECTION), limit(limitCount)));
      return fallbackSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  },

  /**
   * Transition incident status with validation and timeline update
   */
  updateIncidentStatus: async (incidentId, newStatus, { note = '', user = null } = {}) => {
    if (!incidentId || !newStatus) throw new Error('Incident ID and status are required.');

    const docRef = doc(db, INCIDENTS_COLLECTION, incidentId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error('Incident not found.');

    const currentData = snap.data();
    const currentStatus = currentData.status;

    // Validate transition
    const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Cannot transition incident from '${currentStatus}' to '${newStatus}'.`);
    }

    const actorName = user?.fullName || user?.email || 'Operations Staff';
    const nowIso = new Date().toISOString();

    const timelineEntry = {
      status: newStatus,
      timestamp: nowIso,
      note: note || `Status transitioned to ${newStatus}`,
      actor: actorName,
    };

    const updates = {
      status: newStatus,
      timeline: [...(currentData.timeline || []), timelineEntry],
      updatedAt: serverTimestamp(),
    };

    if (newStatus === INCIDENT_STATUS.ACKNOWLEDGED) {
      updates.acknowledgedAt = nowIso;
      updates.acknowledgedBy = actorName;
    } else if (newStatus === INCIDENT_STATUS.RESOLVED) {
      updates.resolvedAt = nowIso;
      updates.resolvedBy = actorName;
      if (note) updates.resolutionNotes = note;
    } else if (newStatus === INCIDENT_STATUS.CLOSED) {
      updates.closedAt = nowIso;
      updates.closedBy = actorName;
    }

    await updateDoc(docRef, updates);
    return { ...currentData, ...updates };
  },

  /**
   * Emergency Contacts Directory Helper
   */
  getEmergencyContacts: async () => {
    try {
      const q = query(collection(db, CONTACTS_COLLECTION), orderBy('name', 'asc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
      // Safe fallback institutional contacts
      return [
        {
          id: 'ec-1',
          name: 'Transportation Dispatch Central',
          role: 'Operations Desk',
          phone: '+1 (555) 019-4820',
          type: 'School Office',
          hours: '06:00 AM – 06:30 PM',
          isDirectDispatch: true,
        },
        {
          id: 'ec-2',
          name: 'Lincoln Heights Main Office',
          role: 'District Administration',
          phone: '+1 (555) 438-9021',
          type: 'School Office',
          hours: '07:30 AM – 04:30 PM',
        },
        {
          id: 'ec-3',
          name: 'Emergency Medical & Paramedic Dispatch',
          role: 'Emergency Services (911)',
          phone: '911',
          type: 'Emergency Service',
          hours: '24/7 Priority Emergency',
          isUrgent: true,
        },
        {
          id: 'ec-4',
          name: 'Campus Safety & Fleet Security',
          role: 'Security Department',
          phone: '+1 (555) 912-3840',
          type: 'Security',
          hours: '24/7 Patrol',
        },
      ];
    } catch (e) {
      console.warn('Emergency contacts query note:', e.message);
      return [];
    }
  },

  /**
   * Add emergency contact
   */
  addEmergencyContact: async (contactData) => {
    const contactId = `EC-${Date.now()}`;
    const docRef = doc(db, CONTACTS_COLLECTION, contactId);
    const payload = {
      ...contactData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(docRef, payload);
    return { id: contactId, ...payload };
  },

  /**
   * Delete emergency contact
   */
  deleteEmergencyContact: async (contactId) => {
    if (!contactId) return;
    const docRef = doc(db, CONTACTS_COLLECTION, contactId);
    await updateDoc(docRef, { isArchived: true, updatedAt: serverTimestamp() });
  }
};

export default incidentService;
