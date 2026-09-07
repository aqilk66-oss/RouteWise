import createFirestoreService from './baseFirestoreService';
import { COLLECTIONS, INSPECTION_RESULT, BUS_STATUS } from '../../constants/collections';
import { busService } from './busService';

const baseService = createFirestoreService(COLLECTIONS.VEHICLE_INSPECTIONS);

/**
 * Standard pre-trip and periodic safety inspection checklist items
 */
export const STANDARD_INSPECTION_CHECKLIST = [
  { id: 'brakes', label: 'Braking System & Air Pressure', category: 'mechanical', critical: true },
  { id: 'tires', label: 'Tires, Rims & Tread Depth', category: 'exterior', critical: true },
  { id: 'lights', label: 'Headlights, Turn Signals & Hazard Flashers', category: 'electrical', critical: true },
  { id: 'mirrors', label: 'Rearview & Convex Side Mirrors', category: 'visibility', critical: false },
  { id: 'doors', label: 'Passenger Entrance & Emergency Exits', category: 'safety', critical: true },
  { id: 'emergency_equipment', label: 'Fire Extinguisher, First Aid Kit & Reflective Triangles', category: 'safety', critical: true },
  { id: 'seat_belts', label: 'Driver & Passenger Restraints', category: 'interior', critical: false },
  { id: 'horn', label: 'Warning Horn & Reverse Alarm', category: 'safety', critical: false },
  { id: 'fluids', label: 'Oil, Coolant & Washer Fluid Levels', category: 'mechanical', critical: false },
  { id: 'cleanliness', label: 'Interior Aisle Free of Obstructions', category: 'interior', critical: false },
];

/**
 * Vehicle Inspection Domain Firestore Service
 */
export const inspectionService = {
  ...baseService,

  /**
   * Submit an inspection report (Pre-Trip, Safety, or Periodic)
   */
  createInspection: async (data) => {
    if (!data.busId) {
      throw new Error('Inspection requires an associated busId.');
    }

    const inspectionRecord = {
      inspectionId: data.inspectionId || `INSP-${Date.now().toString().slice(-6)}`,
      busId: data.busId,
      inspectionType: data.inspectionType || 'pre-trip',
      inspectorId: data.inspectorId || 'driver',
      inspectorName: data.inspectorName || 'Vehicle Operator',
      inspectionDate: data.inspectionDate || new Date().toISOString(),
      result: data.result || INSPECTION_RESULT.PASSED,
      odometer: Number(data.odometer) || null,
      checklist: data.checklist || {},
      defects: data.defects || [],
      notes: data.notes || '',
      schoolId: data.schoolId || 'main-campus',
    };

    const created = await baseService.create(inspectionRecord);

    // If critical defect or failed inspection, transition bus status
    if (inspectionRecord.result === INSPECTION_RESULT.FAILED) {
      try {
        await busService.update(inspectionRecord.busId, {
          status: BUS_STATUS.OUT_OF_SERVICE,
          lastInspectionAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Could not flag bus out of service:', err.message);
      }
    } else {
      try {
        await busService.update(inspectionRecord.busId, {
          lastInspectionAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Could not update lastInspectionAt:', err.message);
      }
    }

    return created;
  },

  /**
   * Get recent inspections for a specific bus
   */
  getByBusId: async (busId) => {
    return baseService.getAll({
      filters: [['busId', '==', busId]],
      sortBy: 'inspectionDate',
      sortDirection: 'desc',
    });
  },
};

export default inspectionService;
