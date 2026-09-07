import createFirestoreService from './baseFirestoreService';
import { COLLECTIONS, BUS_STATUS } from '../../constants/collections';

const baseService = createFirestoreService(COLLECTIONS.BUSES);

/**
 * Bus Fleet Domain Firestore Service
 * Relationships: assignedDriverId, assignedRouteId, currentTripId
 */
export const busService = {
  ...baseService,

  createBus: async (data) => {
    if (!data.busNumber?.trim() || !data.registrationNumber?.trim()) {
      throw new Error('Bus number and registration plate are required.');
    }

    const busRecord = {
      busId: data.busId || `BUS-${data.busNumber.replace(/\D/g, '') || Date.now().toString().slice(-4)}`,
      busNumber: data.busNumber.trim(),
      registrationNumber: data.registrationNumber.trim().toUpperCase(),
      capacity: Number(data.capacity) || 30,
      model: data.model || 'Standard School Transit Coach',
      manufacturer: data.manufacturer || 'Volvo',
      year: Number(data.year) || new Date().getFullYear(),
      assignedDriverId: data.assignedDriverId || null,
      assignedRouteId: data.assignedRouteId || null,
      currentTripId: data.currentTripId || null,
      status: data.status || BUS_STATUS.ACTIVE,
      lastKnownLocation: data.lastKnownLocation || {
        latitude: 40.7128,
        longitude: -74.0060,
        updatedAt: new Date().toISOString(),
      },
    };

    return baseService.create(busRecord);
  },

  getActiveBuses: async () => {
    return baseService.getAll({
      filters: [['status', '==', BUS_STATUS.ACTIVE]],
      sortBy: 'busNumber',
      sortDirection: 'asc',
    });
  },
};

export default busService;
