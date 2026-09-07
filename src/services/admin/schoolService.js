import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { COLLECTIONS } from '../../constants/collections';

/**
 * School Management Service
 * Manages institutional profiles, codes, zones, and addresses.
 * Archival/deactivation is preferred over physical deletion to protect operational integrity.
 */
export const schoolService = {
  /**
   * Retrieves all schools ordered by name
   */
  getAllSchools: async () => {
    try {
      const q = query(collection(db, COLLECTIONS.SCHOOLS), orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
    } catch (err) {
      console.warn('Failed to fetch schools:', err.message);
      return [];
    }
  },

  /**
   * Retrieves a single school record by ID
   */
  getSchoolById: async (schoolId) => {
    if (!schoolId) return null;
    try {
      const docRef = doc(db, COLLECTIONS.SCHOOLS, schoolId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (err) {
      console.warn(`Failed to fetch school ${schoolId}:`, err.message);
      return null;
    }
  },

  /**
   * Creates a new school/institution record
   */
  createSchool: async (schoolData) => {
    const payload = {
      name: schoolData.name || 'New Campus',
      code: (schoolData.code || 'SCH-01').toUpperCase().trim(),
      address: schoolData.address || '',
      city: schoolData.city || '',
      contactEmail: schoolData.contactEmail || '',
      contactPhone: schoolData.contactPhone || '',
      principalName: schoolData.principalName || '',
      timezone: schoolData.timezone || 'America/New_York',
      status: schoolData.status || 'active', // 'active' | 'inactive' | 'archived'
      studentCount: 0,
      busCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.SCHOOLS), payload);
    return { id: docRef.id, ...payload, createdAt: new Date() };
  },

  /**
   * Updates an existing school record
   */
  updateSchool: async (schoolId, updates) => {
    if (!schoolId) throw new Error('School ID is required.');
    const docRef = doc(db, COLLECTIONS.SCHOOLS, schoolId);
    const safeUpdates = {
      ...updates,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(docRef, safeUpdates);
    return { id: schoolId, ...safeUpdates };
  },

  /**
   * Toggles school status safely (deactivation/reactivation instead of hard delete)
   */
  setSchoolStatus: async (schoolId, newStatus) => {
    if (!schoolId) throw new Error('School ID is required.');
    const docRef = doc(db, COLLECTIONS.SCHOOLS, schoolId);
    await updateDoc(docRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
    return { id: schoolId, status: newStatus };
  },
};

export default schoolService;
