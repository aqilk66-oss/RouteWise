import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

/**
 * Higher-order Firestore Generic Service Generator
 * Standardizes Create, Read, List, Query, Update, and Soft-Delete across RouteWise entities.
 */
export const createFirestoreService = (collectionName, options = {}) => {
  const colRef = collection(db, collectionName);

  return {
    collectionName,

    /**
     * Create a new document with server timestamps
     */
    create: async (data, customId = null) => {
      const docData = {
        ...data,
        status: data.status || 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (customId) {
        const docRef = doc(db, collectionName, customId);
        await setDoc(docRef, docData, { merge: true });
        return { id: customId, ...docData };
      } else {
        const docRef = await addDoc(colRef, docData);
        return { id: docRef.id, ...docData };
      }
    },

    /**
     * Retrieve a single document by ID
     */
    getById: async (id) => {
      if (!id) return null;
      const docRef = doc(db, collectionName, id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() };
      }
      return null;
    },

    /**
     * Query all active documents with optional filters and sorting
     */
    getAll: async ({ filters = [], sortBy = 'createdAt', sortDirection = 'desc', max = 50 } = {}) => {
      try {
        const queryConstraints = [];

        filters.forEach(([field, op, val]) => {
          if (val !== undefined && val !== null && val !== '') {
            queryConstraints.push(where(field, op, val));
          }
        });

        if (sortBy) {
          queryConstraints.push(orderBy(sortBy, sortDirection));
        }

        if (max) {
          queryConstraints.push(limit(max));
        }

        const q = query(colRef, ...queryConstraints);
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      } catch (err) {
        console.warn(`Firestore query warning on [${collectionName}]:`, err.message);
        return [];
      }
    },

    /**
     * Update an existing document
     */
    update: async (id, updates) => {
      if (!id) throw new Error('ID required for update operation');
      const docRef = doc(db, collectionName, id);
      const safeUpdates = {
        ...updates,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(docRef, safeUpdates);
      return { id, ...safeUpdates };
    },

    /**
     * Soft delete / Archive document to preserve transport history
     */
    archive: async (id) => {
      if (!id) throw new Error('ID required for archive operation');
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        status: 'archived',
        updatedAt: serverTimestamp(),
      });
      return { id, status: 'archived' };
    },

    /**
     * Permanent hard delete (Reserved for disposable or draft data)
     */
    hardDelete: async (id) => {
      if (!id) throw new Error('ID required for hard delete');
      const docRef = doc(db, collectionName, id);
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(docRef);
      return { id, deleted: true };
    },
  };
};

export default createFirestoreService;
