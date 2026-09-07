import createFirestoreService from './baseFirestoreService';
import { COLLECTIONS, RECORD_STATUS } from '../../constants/collections';

const baseService = createFirestoreService(COLLECTIONS.STUDENTS);

/**
 * Student Domain Firestore Service
 * Relationships: parentIds, primaryParentId, routeId, busId, pickupStopId, dropoffStopId
 */
export const studentService = {
  ...baseService,

  /**
   * Create student with relationship and data validation
   */
  createStudent: async (data) => {
    if (!data.firstName?.trim() || !data.lastName?.trim()) {
      throw new Error('Student first and last names are required.');
    }

    const studentRecord = {
      studentId: data.studentId || `STU-${Date.now().toString().slice(-6)}`,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      fullName: `${data.firstName.trim()} ${data.lastName.trim()}`,
      grade: data.grade || '',
      className: data.className || '',
      schoolName: data.schoolName || 'District Main Campus',
      schoolId: data.schoolId || 'main-campus',
      parentIds: data.parentIds || (data.primaryParentId ? [data.primaryParentId] : []),
      primaryParentId: data.primaryParentId || null,
      routeId: data.routeId || null,
      busId: data.busId || null,
      pickupStopId: data.pickupStopId || null,
      dropoffStopId: data.dropoffStopId || null,
      status: data.status || RECORD_STATUS.ACTIVE,
      photoURL: data.photoURL || null,
    };

    return baseService.create(studentRecord);
  },

  /**
   * Query students by Parent ID
   */
  getByParentId: async (parentId) => {
    return baseService.getAll({
      filters: [['primaryParentId', '==', parentId]],
      sortBy: 'fullName',
      sortDirection: 'asc',
    });
  },

  /**
   * Query students by Route ID
   */
  getByRouteId: async (routeId) => {
    return baseService.getAll({
      filters: [['routeId', '==', routeId]],
      sortBy: 'fullName',
      sortDirection: 'asc',
    });
  },

  /**
   * Query students by Bus ID
   */
  getByBusId: async (busId) => {
    return baseService.getAll({
      filters: [['busId', '==', busId]],
      sortBy: 'fullName',
      sortDirection: 'asc',
    });
  },
};

export default studentService;
