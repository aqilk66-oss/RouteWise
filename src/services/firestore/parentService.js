import createFirestoreService from './baseFirestoreService';
import { COLLECTIONS, RECORD_STATUS } from '../../constants/collections';

const baseService = createFirestoreService(COLLECTIONS.PARENTS);

/**
 * Parent Domain Firestore Service
 * Relationships: userId (references Auth UID), studentIds[]
 */
export const parentService = {
  ...baseService,

  createParent: async (data) => {
    if (!data.fullName?.trim() || !data.email?.trim()) {
      throw new Error('Parent full name and email are required.');
    }

    const parentRecord = {
      parentId: data.parentId || `PAR-${Date.now().toString().slice(-6)}`,
      userId: data.userId || null,
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      phone: data.phone || '',
      studentIds: data.studentIds || [],
      emergencyContact: data.emergencyContact || '',
      status: data.status || RECORD_STATUS.ACTIVE,
    };

    return baseService.create(parentRecord, data.userId || null);
  },

  getByUserId: async (userId) => {
    if (!userId) return null;
    const parentDoc = await baseService.getById(userId);
    if (parentDoc) return parentDoc;

    const list = await baseService.getAll({
      filters: [['userId', '==', userId]],
      max: 1,
    });
    return list[0] || null;
  },
};

export default parentService;
