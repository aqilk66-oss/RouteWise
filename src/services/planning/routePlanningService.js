import { routeService } from '../firestore/routeService';
import { stopService } from '../firestore/stopService';
import { studentService } from '../firestore/studentService';
import { auditService } from '../admin/auditService';
import { evaluateRouteReadiness } from './routeReadinessService';
import { ROUTE_STATUS } from '../../constants/collections';

/**
 * Route Planning Domain Service
 * Encapsulates atomic stop sequencing, activation enforcement, and student assignment.
 */
export const routePlanningService = {
  /**
   * Reorder stops sequentially and update their sequence in Firestore
   *
   * @param {string} routeId
   * @param {Array<Object>} reorderedStops - stops in their new desired order
   * @param {Object} actor - credentials of user performing the reordering
   */
  updateStopSequences: async (routeId, reorderedStops, actor = { uid: 'system', name: 'Admin', role: 'admin' }) => {
    if (!routeId || !Array.isArray(reorderedStops)) {
      throw new Error('Valid routeId and ordered stops array are required.');
    }

    const updates = [];
    const newStopIds = [];

    reorderedStops.forEach((stop, index) => {
      const newSeq = index + 1;
      const stopId = stop.id || stop.stopId;
      newStopIds.push(stopId);

      if (stop.sequence !== newSeq) {
        updates.push(
          stopService.update(stopId, { sequence: newSeq })
        );
      }
    });

    // Also persist stopIds array order on the route document
    updates.push(
      routeService.update(routeId, { stopIds: newStopIds })
    );

    await Promise.all(updates);

    // Audit log
    await auditService.logEvent({
      actorUserId: actor.uid,
      actorName: actor.name || 'Transport Planner',
      actorRole: actor.role || 'admin',
      action: 'STOP_SEQUENCE_REORDERED',
      resourceType: 'route',
      resourceId: routeId,
      description: `Reordered ${reorderedStops.length} stops on route ${routeId}.`,
      severity: 'info',
      metadata: {
        newOrder: newStopIds,
      },
    });

    return { success: true, count: reorderedStops.length };
  },

  /**
   * Assign or unassign a student to a route and specific stops
   */
  assignStudentToRoute: async ({
    studentId,
    routeId,
    busId = null,
    pickupStopId = null,
    dropoffStopId = null,
    actor = { uid: 'system', name: 'Admin', role: 'admin' },
  }) => {
    if (!studentId) throw new Error('Student ID is required.');

    const updatePayload = {
      routeId: routeId || null,
      busId: busId || null,
      pickupStopId: pickupStopId || null,
      dropoffStopId: dropoffStopId || null,
    };

    const updated = await studentService.update(studentId, updatePayload);

    await auditService.logEvent({
      actorUserId: actor.uid,
      actorName: actor.name || 'Transport Planner',
      actorRole: actor.role || 'admin',
      action: 'STUDENT_ROUTE_ASSIGNMENT_CHANGED',
      resourceType: 'student',
      resourceId: studentId,
      description: routeId 
        ? `Student assigned to route ${routeId} (Bus: ${busId || 'N/A'}).`
        : `Student removed from route.`,
      severity: 'info',
      metadata: updatePayload,
    });

    return updated;
  },

  /**
   * Attempt to activate a route. Validates all readiness criteria before changing status.
   */
  activateRoute: async ({
    route,
    stops,
    bus,
    driver,
    assignedStudentsCount,
    conflicts = [],
    actor = { uid: 'system', name: 'Admin', role: 'admin' },
  }) => {
    const readiness = evaluateRouteReadiness({
      route,
      stops,
      bus,
      driver,
      assignedStudentsCount,
      conflicts,
    });

    if (!readiness.isReady) {
      throw new Error(`Cannot activate route: ${readiness.issues.join('; ')}`);
    }

    const routeId = route.id || route.routeId;
    const updated = await routeService.update(routeId, {
      status: ROUTE_STATUS.ACTIVE,
      assignedBusId: bus?.id || bus?.busId || null,
      assignedDriverId: driver?.id || driver?.driverId || null,
    });

    await auditService.logEvent({
      actorUserId: actor.uid,
      actorName: actor.name || 'Transport Planner',
      actorRole: actor.role || 'admin',
      action: 'ROUTE_ACTIVATED',
      resourceType: 'route',
      resourceId: routeId,
      description: `Route ${route.name} (${route.routeCode}) activated successfully.`,
      severity: 'info',
      metadata: {
        assignedBusId: bus?.busId,
        assignedDriverId: driver?.driverId,
      },
    });

    return updated;
  },

  /**
   * Deactivate or set route to draft
   */
  setRouteStatus: async (routeId, newStatus, reason = '', actor = { uid: 'system', name: 'Admin', role: 'admin' }) => {
    const updated = await routeService.update(routeId, {
      status: newStatus,
      deactivationReason: reason || null,
    });

    await auditService.logEvent({
      actorUserId: actor.uid,
      actorName: actor.name || 'Transport Planner',
      actorRole: actor.role || 'admin',
      action: `ROUTE_STATUS_CHANGED_${newStatus.toUpperCase()}`,
      resourceType: 'route',
      resourceId: routeId,
      description: `Route status changed to ${newStatus}. Reason: ${reason || 'Operational adjustment'}`,
      severity: 'info',
      metadata: { newStatus, reason },
    });

    return updated;
  },
};

export default routePlanningService;
