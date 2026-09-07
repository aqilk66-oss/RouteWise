import createFirestoreService from './baseFirestoreService';
import { COLLECTIONS, BUS_STATUS } from '../../constants/collections';
import { busService } from './busService';

const baseService = createFirestoreService(COLLECTIONS.DEFECTS);

/**
 * Vehicle Defect Domain Firestore Service
 * Tracks reported safety defects, mechanical issues, and their resolutions.
 */
export const defectService = {
  ...baseService,

  /**
   * Report a defect (e.g. from driver pre-trip inspection or maintenance check)
   */
  reportDefect: async (data) => {
    if (!data.busId || !data.description?.trim()) {
      throw new Error('Defect report requires busId and description.');
    }

    const defectRecord = {
      defectId: data.defectId || `DFT-${Date.now().toString().slice(-6)}`,
      busId: data.busId,
      inspectionId: data.inspectionId || null,
      category: data.category || 'mechanical',
      severity: data.severity || 'medium', // 'minor' | 'major' | 'critical'
      description: data.description.trim(),
      status: data.status || 'open', // 'open' | 'in_review' | 'resolved'
      reportedBy: data.reportedBy || 'Driver',
      reportedAt: data.reportedAt || new Date().toISOString(),
      resolvedAt: null,
      resolvedBy: null,
      resolutionNotes: '',
      schoolId: data.schoolId || 'main-campus',
    };

    const created = await baseService.create(defectRecord);

    // If critical defect, immediately mark bus outOfService
    if (defectRecord.severity === 'critical') {
      try {
        await busService.update(defectRecord.busId, {
          status: BUS_STATUS.OUT_OF_SERVICE,
        });
      } catch (err) {
        console.warn('Could not update bus status on critical defect:', err.message);
      }
    }

    return created;
  },

  /**
   * Resolve a defect
   */
  resolveDefect: async (defectId, busId, resolutionData = {}) => {
    return baseService.update(defectId, {
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
      ...resolutionData,
    });
  },

  /**
   * Get active/unresolved defects for a bus
   */
  getOpenByBusId: async (busId) => {
    return baseService.getAll({
      filters: [
        ['busId', '==', busId],
        ['status', '!=', 'resolved']
      ],
      sortBy: 'reportedAt',
      sortDirection: 'desc',
    });
  },
};

export default defectService;
