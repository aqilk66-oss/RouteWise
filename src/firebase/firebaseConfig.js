import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAHXQX5PZOEKVUaSAtGect5Z5MaNwvH7D8',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'routewise-b4741.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'routewise-b4741',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'routewise-b4741.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '806918370452',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:806918370452:web:74e02e0d6f8b42c45c7081',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-R4L0F4V4GS',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://routewise-b4741-default-rtdb.firebaseio.com/',
};

// Validate that required keys are present
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);

export const isRtdbConfigured = Boolean(firebaseConfig.databaseURL);

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

// Initialize Firebase Realtime Database (RTDB) for Live High-Frequency GPS Tracking
export const rtdb = getDatabase(app, firebaseConfig.databaseURL);

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
