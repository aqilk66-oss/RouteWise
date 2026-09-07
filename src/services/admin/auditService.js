import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { COLLECTIONS } from '../../constants/collections';

/**
 * Audit Logging Service
 * Provides append-only, immutable audit trail tracking all state-changing operational and governance events.
 * No updates or deletes are permitted on this collection.
 */
export const auditService = {
  /**
   * Records an immutable audit log entry
   */
  logEvent: async ({
    actorUserId = null,
    actorName = 'System',
    actorRole = 'system',
    action,
    resourceType,
    resourceId = null,
    description,
    schoolId = null,
    severity = 'info', // 'info' | 'warning' | 'critical' | 'security'
    metadata = {},
  }) => {
    try {
      const logData = {
        actorUserId: actorUserId || 'anonymous',
        actorName: actorName || 'System',
        actorRole: actorRole || 'system',
        action,
        resourceType,
        resourceId: resourceId ? String(resourceId) : null,
        description: description || `Action ${action} performed on ${resourceType}`,
        schoolId: schoolId || 'global',
        severity,
        metadata: metadata || {},
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.AUDIT_LOGS), logData);
      return { id: docRef.id, ...logData };
    } catch (err) {
      console.warn('Audit logging error:', err.message);
      return null;
    }
  },

  /**
   * Retrieves audit logs with optional filtering and pagination limit
   */
  getAuditLogs: async (filters = {}, maxLimit = 50) => {
    try {
      const constraints = [orderBy('timestamp', 'desc'), limit(maxLimit)];

      if (filters.action) {
        constraints.unshift(where('action', '==', filters.action));
      }
      if (filters.resourceType) {
        constraints.unshift(where('resourceType', '==', filters.resourceType));
      }
      if (filters.severity) {
        constraints.unshift(where('severity', '==', filters.severity));
      }
      if (filters.actorRole) {
        constraints.unshift(where('actorRole', '==', filters.actorRole));
      }

      const q = query(collection(db, COLLECTIONS.AUDIT_LOGS), ...constraints);
      const snapshot = await getDocs(q);

      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        timestampDate: docSnap.data().timestamp?.toDate 
          ? docSnap.data().timestamp.toDate() 
          : (docSnap.data().createdAt ? new Date(docSnap.data().createdAt) : new Date()),
      }));
    } catch (err) {
      console.warn('Failed to fetch audit logs:', err.message);
      return [];
    }
  },

  /**
   * Retrieves single audit log record by ID
   */
  getAuditLogById: async (id) => {
    try {
      const docRef = doc(db, COLLECTIONS.AUDIT_LOGS, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (err) {
      console.warn('Failed to fetch audit log by ID:', err.message);
      return null;
    }
  },
};

export default auditService;
