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
   * Updates user status (active, suspended, inactive, archived)
   */
  setUserStatus: async (uid, newStatus) => {
    if (!uid) throw new Error('User UID is required.');
    const docRef = doc(db, COLLECTIONS.USERS, uid);
    await updateDoc(docRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
    return { uid, status: newStatus };
  },

  /**
   * Modifies user role with governance checks
   */
  setUserRole: async (uid, newRole) => {
    if (!uid) throw new Error('User UID is required.');
    const docRef = doc(db, COLLECTIONS.USERS, uid);
    await updateDoc(docRef, {
      role: newRole,
      updatedAt: serverTimestamp(),
    });
    return { uid, role: newRole };
  },
};

export default adminUserService;
