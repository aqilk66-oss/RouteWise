import createFirestoreService from './baseFirestoreService';
import { COLLECTIONS, MAINTENANCE_STATUS, MAINTENANCE_PRIORITY, BUS_STATUS } from '../../constants/collections';
import { busService } from './busService';

const baseService = createFirestoreService(COLLECTIONS.MAINTENANCE_RECORDS);

/**
 * Maintenance Domain Firestore Service
 * Tracks work orders, repairs, preventative service, and vehicle mechanical downtime.
 */
export const maintenanceService = {
  ...baseService,

  /**
   * Creates a new maintenance record and optionally updates the bus status
   */
  createRecord: async (data) => {
    if (!data.busId) {
      throw new Error('Maintenance record requires a target busId.');
    }
    if (!data.title?.trim()) {
      throw new Error('Maintenance title/description is required.');
    }

    const record = {
      maintenanceId: data.maintenanceId || `MNT-${Date.now().toString().slice(-6)}`,
      busId: data.busId,
      type: data.type || 'routine service',
      title: data.title.trim(),
      description: data.description || '',
      priority: data.priority || MAINTENANCE_PRIORITY.MEDIUM,
      status: data.status || MAINTENANCE_STATUS.SCHEDULED,
      reportedAt: data.reportedAt || new Date().toISOString(),
      scheduledAt: data.scheduledAt || new Date().toISOString(),
      startedAt: data.startedAt || null,
      completedAt: data.completedAt || null,
      odometer: Number(data.odometer) || null,
      performedBy: data.performedBy || 'Fleet Workshop',
      vendor: data.vendor || '',
      cost: Number(data.cost) || null,
      notes: data.notes || '',
      schoolId: data.schoolId || 'main-campus',
    };

    const created = await baseService.create(record);

    // If scheduled or in-progress, automatically update bus status to maintenance
    if (record.status === MAINTENANCE_STATUS.SCHEDULED || record.status === MAINTENANCE_STATUS.IN_PROGRESS) {
      try {
        await busService.update(record.busId, {
          status: BUS_STATUS.MAINTENANCE,
          lastMaintenanceAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Could not update bus status on maintenance creation:', err.message);
      }
    }

    return created;
  },

  /**
   * Complete maintenance and restore bus to available if no other blockers
   */
  completeRecord: async (recordId, busId, completionData = {}) => {
    const updated = await baseService.update(recordId, {
      status: MAINTENANCE_STATUS.COMPLETED,
      completedAt: new Date().toISOString(),
      ...completionData,
    });

    if (busId) {
      try {
        await busService.update(busId, {
          status: BUS_STATUS.AVAILABLE,
          lastMaintenanceAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Could not update bus status on maintenance completion:', err.message);
      }
    }

    return updated;
  },

  /**
   * Get active / open maintenance records for a specific bus
   */
  getByBusId: async (busId) => {
    return baseService.getAll({
      filters: [['busId', '==', busId]],
      sortBy: 'reportedAt',
      sortDirection: 'desc',
    });
  },
};

export default maintenanceService;
