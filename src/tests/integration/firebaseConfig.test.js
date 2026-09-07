import { describe, it, expect } from 'vitest';
import { app, auth, db, storage, isFirebaseConfigured } from '../../firebase/firebaseConfig';

describe('Firebase Modular SDK Connection Suite', () => {
  it('correctly loads VITE_ environment variables via import.meta.env', () => {
    expect(import.meta.env.VITE_FIREBASE_API_KEY).toBe('AIzaSyAHXQX5PZOEKVUaSAtGect5Z5MaNwvH7D8');
    expect(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN).toBe('routewise-b4741.firebaseapp.com');
    expect(import.meta.env.VITE_FIREBASE_PROJECT_ID).toBe('routewise-b4741');
    expect(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET).toBe('routewise-b4741.firebasestorage.app');
    expect(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID).toBe('806918370452');
    expect(import.meta.env.VITE_FIREBASE_APP_ID).toBe('1:806918370452:web:74e02e0d6f8b42c45c7081');
    expect(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID).toBe('G-R4L0F4V4GS');
  });

  it('verifies that isFirebaseConfigured evaluates to true', () => {
    expect(isFirebaseConfigured).toBe(true);
  });

  it('verifies Firebase App instance is successfully initialized', () => {
    expect(app).toBeDefined();
    expect(app.name).toBe('[DEFAULT]');
    expect(app.options.projectId).toBe('routewise-b4741');
  });

  it('verifies Firebase Auth instance is properly initialized with modular SDK', () => {
    expect(auth).toBeDefined();
    expect(auth.app).toBe(app);
  });

  it('verifies Cloud Firestore instance is properly initialized with modular SDK', () => {
    expect(db).toBeDefined();
    expect(db.app).toBe(app);
    expect(db.type).toBe('firestore');
  });

  it('verifies Firebase Storage instance is properly initialized with modular SDK', () => {
    expect(storage).toBeDefined();
    expect(storage.app).toBe(app);
  });
});
