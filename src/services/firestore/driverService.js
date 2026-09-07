import createFirestoreService from './baseFirestoreService';
import { COLLECTIONS, RECORD_STATUS } from '../../constants/collections';

const baseService = createFirestoreService(COLLECTIONS.DRIVERS);

/**
 * Driver Domain Firestore Service
 * Relationships: userId, assignedBusId, assignedRouteId
 */
export const driverService = {
  ...baseService,

  createDriver: async (data) => {
    if (!data.fullName?.trim() || !data.phone?.trim()) {
      throw new Error('Driver name and phone number are required.');
    }

    const driverRecord = {
      driverId: data.driverId || `DRV-${Date.now().toString().slice(-6)}`,
      userId: data.userId || null,
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || '',
      licenseNumber: data.licenseNumber || 'CDL-PENDING',
      licenseExpiry: data.licenseExpiry || null,
      assignedBusId: data.assignedBusId || null,
      assignedRouteId: data.assignedRouteId || null,
      status: data.status || RECORD_STATUS.ACTIVE,
    };

    return baseService.create(driverRecord, data.userId || null);
  },

  getByUserId: async (userId) => {
    if (!userId) return null;
    const driverDoc = await baseService.getById(userId);
    if (driverDoc) return driverDoc;

    const list = await baseService.getAll({
      filters: [['userId', '==', userId]],
      max: 1,
    });
    return list[0] || null;
  },
};

export default driverService;
