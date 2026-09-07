import createFirestoreService from './baseFirestoreService';
import { COLLECTIONS, TRIP_STATUS } from '../../constants/collections';

const baseService = createFirestoreService(COLLECTIONS.TRIPS);

/**
 * Trip Domain Firestore Service
 * Relationships: routeId, busId, driverId, studentIds[], currentStopId
 */
export const tripService = {
  ...baseService,

  createTrip: async (data) => {
    if (!data.routeId || !data.busId || !data.driverId) {
      throw new Error('Trips require routeId, busId, and driverId.');
    }

    const tripRecord = {
      tripId: data.tripId || `TRP-${Date.now().toString().slice(-6)}`,
      routeId: data.routeId,
      busId: data.busId,
      driverId: data.driverId,
      date: data.date || new Date().toISOString().split('T')[0],
      scheduledStartTime: data.scheduledStartTime || '07:15 AM',
      scheduledEndTime: data.scheduledEndTime || '08:15 AM',
      actualStartTime: data.actualStartTime || null,
      actualEndTime: data.actualEndTime || null,
      status: data.status || TRIP_STATUS.SCHEDULED,
      currentStopId: data.currentStopId || null,
      studentIds: data.studentIds || [],
    };

    return baseService.create(tripRecord);
  },

  getTripsByDriver: async (driverId) => {
    return baseService.getAll({
      filters: [['driverId', '==', driverId]],
      sortBy: 'date',
      sortDirection: 'desc',
    });
  },

  getActiveTrips: async () => {
    return baseService.getAll({
      filters: [['status', '==', TRIP_STATUS.IN_PROGRESS]],
      sortBy: 'scheduledStartTime',
      sortDirection: 'asc',
    });
  },

  updateCurrentLocation: async (tripId, locationData) => {
    return baseService.update(tripId, {
      currentLocation: locationData,
      trackingStatus: 'active',
      lastTrackingUpdate: new Date().toISOString(),
    });
  },
};

export default tripService;
