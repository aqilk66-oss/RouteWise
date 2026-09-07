import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { COLLECTIONS } from '../../constants/collections';

/**
 * Super Admin Governance User Management Service
 * Supports viewing, updating account status, and role management.
 * Passwords are never queried or handled here.
 */
export const adminUserService = {
  /**
   * Fetches users with optional limit
   */
  getAllUsers: async (maxLimit = 100) => {
    try {
      const q = query(collection(db, COLLECTIONS.USERS), limit(maxLimit));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        uid: docSnap.id,
        ...docSnap.data(),
        createdAtDate: docSnap.data().createdAt?.toDate ? docSnap.data().createdAt.toDate() : null,
      }));
    } catch (err) {
      console.warn('Failed to fetch system users:', err.message);
      return [];
    }
  },

  /**
   * Fetches detailed user information by UID
   */
  getUserById: async (uid) => {
    if (!uid) return null;
    try {
      const docRef = doc(db, COLLECTIONS.USERS, uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          uid: docSnap.id,
          ...docSnap.data(),
        };
      }
      return null;
    } catch (err) {
      console.warn(`Failed to fetch user ${uid}:`, err.message);
      return null;
    }
  },

  /**
   * Updates user status (active, suspended, pending, disabled)
   */
  setUserStatus: async (uid, newStatus, actorUid = 'admin', reason = '') => {
    if (!uid) throw new Error('User UID is required.');
    const validStatuses = ['active', 'suspended', 'pending', 'disabled'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    const docRef = doc(db, COLLECTIONS.USERS, uid);
    await updateDoc(docRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });

    // Write immutable audit log
    try {
      const { auditService } = await import('./auditService');
      await auditService.logEvent({
        actorUserId: actorUid,
        action: 'USER_STATUS_CHANGED',
        resourceType: 'user',
        resourceId: uid,
        description: `Account status updated to '${newStatus}'. Reason: ${reason || 'Administrative update'}`,
        severity: newStatus === 'suspended' || newStatus === 'disabled' ? 'warning' : 'info',
        metadata: { targetUid: uid, newStatus, reason },
      });
    } catch (e) {
      console.warn('Status audit logging warning:', e.message);
    }

    return { uid, status: newStatus };
  },

  /**
   * Modifies user role with strict governance checks and audit logging
   * Only Super Admin can assign privileged roles or change roles.
   */
  setUserRole: async (uid, newRole, actorUid = 'admin', actorRole = 'super_admin') => {
    if (!uid) throw new Error('User UID is required.');
    
    // Privilege escalation guard: Only super_admin can modify roles
    const isSuperAdmin = actorRole === 'super_admin' || actorRole === 'superAdmin';
    if (!isSuperAdmin) {
      throw new Error('Unauthorized: Only Super Administrator can modify user roles.');
    }

    const validRoles = ['super_admin', 'admin', 'parent', 'driver', 'student', 'user'];
    if (!validRoles.includes(newRole)) {
      throw new Error(`Invalid role: ${newRole}. Allowed: ${validRoles.join(', ')}`);
    }

    const docRef = doc(db, COLLECTIONS.USERS, uid);
    await updateDoc(docRef, {
      role: newRole,
      updatedAt: serverTimestamp(),
    });

    // Write immutable audit log
    try {
      const { auditService } = await import('./auditService');
      await auditService.logEvent({
        actorUserId: actorUid,
        actorRole: actorRole,
        action: 'ROLE_CHANGED',
        resourceType: 'user',
        resourceId: uid,
        description: `User role changed to '${newRole}' by ${actorRole}`,
        severity: newRole === 'super_admin' || newRole === 'admin' ? 'critical' : 'info',
        metadata: { targetUid: uid, assignedRole: newRole },
      });
    } catch (e) {
      console.warn('Role audit logging warning:', e.message);
    }

    return { uid, role: newRole };
  },
};

export default adminUserService;
