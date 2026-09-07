import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { DEFAULT_ROLE, PRIVILEGED_ROLES } from '../../constants/collections';

/**
 * User Profile Service interacting directly with Cloud Firestore collection `users/{uid}`.
 */
export const userService = {
  /**
   * Fetches user profile record by UID
   */
  getUserProfile: async (uid) => {
    if (!uid) return null;
    try {
      const userDocRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = { uid, ...docSnap.data() };
        try {
          localStorage.setItem(`routewise_user_${uid}`, JSON.stringify(data));
        } catch (e) {}
        return data;
      }
      // Check local cache if doc not found yet
      try {
        const cached = localStorage.getItem(`routewise_user_${uid}`);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
      return null;
    } catch (error) {
      console.warn(`Firestore profile read warning for ${uid}:`, error.message);
      // Fallback to local storage profile if offline or mock-key mode
      try {
        const cached = localStorage.getItem(`routewise_user_${uid}`);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
      return null;
    }
  },

  /**
   * Creates or updates a user profile record idempotently
   */
  createUserProfile: async (uid, data) => {
    if (!uid) throw new Error('UID is required to create a user profile.');

    // Security check: Public registration is strictly restricted to USER_ROLES.USER ('user')
    // Privileged accounts (admin, super_admin, driver) can only be provisioned through controlled admin processes
    let assignedRole = USER_ROLES.USER;
    if (data.isPrivilegedProvisioned && data.role) {
      assignedRole = data.role;
    }

    const profileData = {
      uid,
      name: data.fullName || data.name || 'RouteWise User',
      fullName: data.fullName || data.name || 'RouteWise User',
      email: data.email || '',
      phone: data.phone || '',
      role: assignedRole,
      photoURL: data.photoURL || null,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      const userDocRef = doc(db, 'users', uid);
      await setDoc(userDocRef, profileData, { merge: true });
      // Also cache locally for instant hydration across multi-page navigation
      try {
        localStorage.setItem(`routewise_user_${uid}`, JSON.stringify(profileData));
      } catch (e) {
        // Safe no-op if localStorage is restricted
      }
      return { ...profileData, createdAt: new Date(), updatedAt: new Date() };
    } catch (error) {
      console.warn("Firestore profile creation warning:", error.message);
      // Persist to local storage cache so registered user data survives across all MPA pages & refreshes
      try {
        localStorage.setItem(`routewise_user_${uid}`, JSON.stringify({
          ...profileData,
          _syncPending: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
      } catch (e) {
        // Safe no-op
      }
      return {
        ...profileData,
        _syncPending: true,
      };
    }
  },

  /**
   * Updates existing profile
   */
  updateUserProfile: async (uid, updates) => {
    if (!uid) throw new Error('UID is required to update a user profile.');
    
    // Prevent updating security-sensitive fields from client
    const safeUpdates = { ...updates };
    delete safeUpdates.role;
    delete safeUpdates.email;
    delete safeUpdates.uid;
    delete safeUpdates.createdAt;
    safeUpdates.updatedAt = serverTimestamp();

    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, safeUpdates);
  },
};

export default userService;
