import createFirestoreService from './baseFirestoreService';
import { COLLECTIONS, RECORD_STATUS } from '../../constants/collections';

const baseService = createFirestoreService(COLLECTIONS.SCHEDULES);

/**
 * Schedule Domain Firestore Service
 * Relationships: routeId, busId, driverId, schoolId, operatingDays[], startTime, endTime
 */
export const scheduleService = {
  ...baseService,

  /**
   * Create a new recurring transport schedule
   */
  createSchedule: async (data) => {
    if (!data.routeId) {
      throw new Error('A route must be selected for the schedule.');
    }
    if (!data.operatingDays || data.operatingDays.length === 0) {
      throw new Error('At least one operating day must be selected.');
    }
    if (!data.startTime || !data.endTime) {
      throw new Error('Start time and end time are required.');
    }

    const scheduleRecord = {
      scheduleId: data.scheduleId || `SCH-${Date.now().toString().slice(-6)}`,
      routeId: data.routeId,
      busId: data.busId || null,
      driverId: data.driverId || null,
      schoolId: data.schoolId || 'main-campus',
      name: data.name?.trim() || `Schedule for Route ${data.routeId}`,
      operatingDays: data.operatingDays, // ['Monday', 'Tuesday', ...]
      startTime: data.startTime, // '07:15'
      endTime: data.endTime,     // '08:15'
      effectiveFrom: data.effectiveFrom || new Date().toISOString().split('T')[0],
      effectiveUntil: data.effectiveUntil || null,
      status: data.status || RECORD_STATUS.ACTIVE,
      notes: data.notes || '',
    };

    return baseService.create(scheduleRecord);
  },

  /**
   * Get active schedules for a specific route
   */
  getByRouteId: async (routeId) => {
    return baseService.getAll({
      filters: [
        ['routeId', '==', routeId],
        ['status', '==', RECORD_STATUS.ACTIVE]
      ],
      sortBy: 'startTime',
      sortDirection: 'asc',
    });
  },

  /**
   * Get active schedules for a specific bus
   */
  getByBusId: async (busId) => {
    return baseService.getAll({
      filters: [
        ['busId', '==', busId],
        ['status', '==', RECORD_STATUS.ACTIVE]
      ],
      sortBy: 'startTime',
      sortDirection: 'asc',
    });
  },

  /**
   * Get active schedules for a specific driver
   */
  getByDriverId: async (driverId) => {
    return baseService.getAll({
      filters: [
        ['driverId', '==', driverId],
        ['status', '==', RECORD_STATUS.ACTIVE]
      ],
      sortBy: 'startTime',
      sortDirection: 'asc',
    });
  },
};

export default scheduleService;
