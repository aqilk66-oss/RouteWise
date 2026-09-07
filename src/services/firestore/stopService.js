import createFirestoreService from './baseFirestoreService';
import { COLLECTIONS, STOP_STATUS } from '../../constants/collections';

const baseService = createFirestoreService(COLLECTIONS.STOPS);

/**
 * Route Stops Domain Firestore Service
 * Relationships: routeId, sequence index, latitude/longitude
 */
export const stopService = {
  ...baseService,

  createStop: async (data) => {
    if (!data.name?.trim() || !data.routeId) {
      throw new Error('Stop name and associated routeId are required.');
    }

    const stopRecord = {
      stopId: data.stopId || `STP-${Date.now().toString().slice(-6)}`,
      name: data.name.trim(),
      address: data.address || '',
      latitude: Number(data.latitude) || 40.7128,
      longitude: Number(data.longitude) || -74.0060,
      sequence: Number(data.sequence) || 1,
      routeId: data.routeId,
      pickupTime: data.pickupTime || '07:30 AM',
      dropoffTime: data.dropoffTime || '03:45 PM',
      status: data.status || STOP_STATUS.ACTIVE,
    };

    return baseService.create(stopRecord);
  },

  getStopsByRoute: async (routeId) => {
    return baseService.getAll({
      filters: [['routeId', '==', routeId]],
      sortBy: 'sequence',
      sortDirection: 'asc',
    });
  },
};

export default stopService;
