import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import userService from '../user/userService';

/**
 * Authentication service isolating Firebase Auth calls from visual UI components
 */
export const authService = {
  /**
   * Register new user with email and password, update auth displayName, and create Firestore profile
   */
  register: async ({ email, password, fullName, phone, role }) => {
    // 1. Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // 2. Set Firebase Auth displayName
    if (fullName) {
      await updateProfile(firebaseUser, { displayName: fullName }).catch((e) => {
        console.warn("Display name update non-fatal error:", e.message);
      });
    }

    // 3. Create Firestore User Profile record
    const profile = await userService.createUserProfile(firebaseUser.uid, {
      fullName,
      email,
      phone,
      role,
    });

    return { user: firebaseUser, profile };
  },

  /**
   * Log in user with email and password
   */
  login: async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Fetch user profile from Firestore
    let profile = await userService.getUserProfile(firebaseUser.uid);
    if (!profile) {
      // Graceful creation if profile document was missing
      profile = await userService.createUserProfile(firebaseUser.uid, {
        fullName: firebaseUser.displayName || 'RouteWise User',
        email: firebaseUser.email,
      });
    }

    return { user: firebaseUser, profile };
  },

  /**
   * Log out user
   */
  logout: async () => {
    return signOut(auth);
  },

  /**
   * Send password reset email
   */
  resetPassword: async (email) => {
    return sendPasswordResetEmail(auth, email);
  },
};

export default authService;
