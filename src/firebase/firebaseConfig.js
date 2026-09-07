import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validate that required keys are present
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);

if (!isFirebaseConfigured && import.meta.env.DEV) {
  console.warn("RouteWise Firebase Warning: Firebase configuration keys are incomplete. Please check your Vite environment variables.");
}

// Singleton Firebase initialization pattern
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication with local session persistence
export const auth = getAuth(app);
try {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn("Session persistence warning:", err.message);
  });
} catch (e) {
  // Graceful fallback if persistence is restricted by browser sandbox
}

// Initialize Firestore & Storage
export const db = getFirestore(app);
export const storage = getStorage(app);

// Graceful Analytics initialization (Optional, never crashes if unsupported)
export let analytics = null;
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics unavailable, safe no-op
  });
}

export default app;
