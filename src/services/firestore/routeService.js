import createFirestoreService from './baseFirestoreService';
import { COLLECTIONS, ROUTE_STATUS } from '../../constants/collections';

const baseService = createFirestoreService(COLLECTIONS.ROUTES);

/**
 * Route Management Domain Firestore Service
 * Relationships: schoolId, assignedBusId, assignedDriverId, stopIds[]
 */
export const routeService = {
  ...baseService,

  createRoute: async (data) => {
    if (!data.name?.trim() || !data.routeCode?.trim()) {
      throw new Error('Route name and unique route code are required.');
    }

    const routeRecord = {
      routeId: data.routeId || `RT-${data.routeCode.toUpperCase()}`,
      routeCode: data.routeCode.trim().toUpperCase(),
      name: data.name.trim(),
      description: data.description || '',
      schoolId: data.schoolId || 'main-campus',
      assignedBusId: data.assignedBusId || null,
      assignedDriverId: data.assignedDriverId || null,
      status: data.status || ROUTE_STATUS.ACTIVE,
      estimatedDuration: data.estimatedDuration || '45 mins',
      distance: data.distance || '12.4 miles',
      stopIds: data.stopIds || [],
    };

    return baseService.create(routeRecord);
  },

  getActiveRoutes: async () => {
    return baseService.getAll({
      filters: [['status', '==', ROUTE_STATUS.ACTIVE]],
      sortBy: 'name',
      sortDirection: 'asc',
    });
  },
};

export default routeService;
