import {
  tripService,
  routeService,
  busService,
  driverService,
  studentService,
  attendanceService,
} from '../firestore';
import { incidentService } from '../safety/incidentService';
import { maintenanceService } from '../firestore/maintenanceService';
import { inspectionService } from '../firestore/inspectionService';
import { notificationService } from '../firestore/notificationService';
import {
  calculateCompletionRate,
  calculateCancellationRate,
  calculateDelayRate,
  calculateAverageDelayMinutes,
  calculateCapacityUtilization,
  calculateAttendanceRate,
  calculateTrend,
  evaluateTripReliability,
} from './kpiDefinitions';

/**
 * RouteWise Analytics Aggregation & Operational Intelligence Service
 * 
 * Efficiently computes aggregated intelligence across all operational domains.
 * Enforces date boundaries and deterministic attention rules.
 */
export const analyticsService = {
  /**
   * Fetch core dataset with optional date boundary filtering
   */
  fetchAnalyticsDataset: async ({ startDate = null, endDate = null, schoolId = null } = {}) => {
    try {
      const [
        trips,
        routes,
        buses,
        drivers,
        students,
        attendances,
        incidents,
        maintenance,
        inspections,
        notifications,
      ] = await Promise.all([
        tripService.getAll({ max: 500 }),
        routeService.getAll({ max: 200 }),
        busService.getAll({ max: 200 }),
        driverService.getAll({ max: 200 }),
        studentService.getAll({ max: 500 }),
        attendanceService.getAll({ max: 500 }),
        incidentService.getAll ? incidentService.getAll({ max: 200 }) : Promise.resolve([]),
        maintenanceService.getAll({ max: 200 }),
        inspectionService.getAll({ max: 200 }),
        notificationService.getAll({ max: 200 }),
      ]);

      // Filter trips by date range if provided
      const filteredTrips = trips.filter((trip) => {
        if (!startDate && !endDate) return true;
        const tripDateStr = trip.date || (trip.scheduledStartTime ? trip.scheduledStartTime.split('T')[0] : null);
        if (!tripDateStr) return true;
        if (startDate && tripDateStr < startDate) return false;
        if (endDate && tripDateStr > endDate) return false;
        return true;
      });

      // Filter attendance by date range
      const filteredAttendance = attendances.filter((att) => {
        if (!startDate && !endDate) return true;
        const attDateStr = att.date || (att.timestamp ? att.timestamp.split('T')[0] : null);
        if (!attDateStr) return true;
        if (startDate && attDateStr < startDate) return false;
        if (endDate && attDateStr > endDate) return false;
        return true;
      });

      // Filter incidents by date range
      const filteredIncidents = incidents.filter((inc) => {
        if (!startDate && !endDate) return true;
        const incDateStr = inc.date || (inc.reportedAt ? inc.reportedAt.split('T')[0] : null);
        if (!incDateStr) return true;
        if (startDate && incDateStr < startDate) return false;
        if (endDate && incDateStr > endDate) return false;
        return true;
      });

      return {
        trips: filteredTrips,
        allTrips: trips,
        routes,
        buses,
        drivers,
        students,
        attendance: filteredAttendance,
        incidents: filteredIncidents,
        maintenance,
        inspections,
        notifications,
      };
    } catch (err) {
      console.error('analyticsService.fetchAnalyticsDataset error:', err);
      throw err;
    }
  },

  /**
   * Computes high-level platform KPIs for the Overview Dashboard
   */
  computeOverviewKPIs: (dataset) => {
    const { trips, buses, routes, students, attendance, incidents, maintenance, inspections } = dataset;

    const totalTrips = trips.length;
    const completedTrips = trips.filter((t) => (t.status || '').toLowerCase() === 'completed').length;
    const delayedTrips = trips.filter((t) => (t.status || '').toLowerCase() === 'delayed' || (t.delayMinutes && t.delayMinutes > 0)).length;
    const cancelledTrips = trips.filter((t) => (t.status || '').toLowerCase() === 'cancelled').length;

    const completionRate = calculateCompletionRate(completedTrips, totalTrips);
    const cancellationRate = calculateCancellationRate(cancelledTrips, totalTrips);
    const delayRate = calculateDelayRate(delayedTrips, totalTrips);
    const averageDelay = calculateAverageDelayMinutes(trips.filter((t) => (t.status || '').toLowerCase() === 'delayed' || (t.delayMinutes && t.delayMinutes > 0)));

    // Fleet state
    const totalBuses = buses.length;
    const maintenanceBuses = buses.filter((b) => b.status === 'maintenance').length;
    const outOfServiceBuses = buses.filter((b) => b.status === 'outOfService' || b.status === 'out_of_service').length;
    const availableBuses = buses.filter((b) => b.status === 'available' || b.status === 'active').length;
    const assignedBuses = buses.filter((b) => b.status === 'assigned' || b.status === 'inService').length;

    // Attendance
    const totalBoarded = attendance.filter((a) => a.status === 'boarded').length;
    const totalAbsent = attendance.filter((a) => a.status === 'absent').length;
    const expectedAttendance = attendance.length;
    const attendanceRate = calculateAttendanceRate(totalBoarded, totalAbsent, expectedAttendance);

    // Incidents
    const totalIncidents = incidents.length;
    const unresolvedIncidents = incidents.filter((i) => (i.status || '').toLowerCase() !== 'resolved' && (i.status || '').toLowerCase() !== 'closed').length;

    // Reliability breakdown
    const reliabilityCounts = {
      on_schedule: 0,
      delayed: 0,
      cancelled: 0,
      incomplete: 0,
    };
    trips.forEach((t) => {
      const rel = evaluateTripReliability(t);
      if (reliabilityCounts[rel] !== undefined) {
        reliabilityCounts[rel]++;
      } else {
        reliabilityCounts.incomplete++;
      }
    });

    return {
      trips: {
        total: totalTrips,
        completed: completedTrips,
        delayed: delayedTrips,
        cancelled: cancelledTrips,
        completionRate,
        cancellationRate,
        delayRate,
        averageDelay,
        reliabilityCounts,
      },
      fleet: {
        total: totalBuses,
        available: availableBuses,
        assigned: assignedBuses,
        maintenance: maintenanceBuses,
        outOfService: outOfServiceBuses,
        availabilityRate: totalBuses > 0 ? Math.round(((availableBuses + assignedBuses) / totalBuses) * 100) : null,
      },
      attendance: {
        totalRecords: expectedAttendance,
        boarded: totalBoarded,
        absent: totalAbsent,
        completionRate: attendanceRate,
      },
      safety: {
        totalIncidents,
        unresolved: unresolvedIncidents,
      },
    };
  },

  /**
   * Generates Route Performance Intelligence Matrix
   */
  computeRouteAnalytics: (dataset) => {
    const { routes, trips, students, incidents, buses } = dataset;

    const busMap = new Map(buses.map((b) => [b.id, b]));

    return routes.map((route) => {
      const routeTrips = trips.filter((t) => t.routeId === route.id);
      const totalTrips = routeTrips.length;
      const completed = routeTrips.filter((t) => (t.status || '').toLowerCase() === 'completed').length;
      const delayed = routeTrips.filter((t) => (t.status || '').toLowerCase() === 'delayed' || (t.delayMinutes && t.delayMinutes > 0)).length;
      const cancelled = routeTrips.filter((t) => (t.status || '').toLowerCase() === 'cancelled').length;

      // Assigned students
      const assignedStudents = students.filter((s) => s.routeId === route.id);
      const studentCount = assignedStudents.length;

      // Assigned bus capacity
      const assignedBus = route.assignedBusId ? busMap.get(route.assignedBusId) : null;
      const capacityInfo = calculateCapacityUtilization(studentCount, assignedBus?.capacity);

      // Route incidents
      const routeIncidents = incidents.filter((i) => i.routeId === route.id).length;

      return {
        id: route.id,
        name: route.name || route.routeName || 'Unnamed Route',
        code: route.routeCode || 'RTE',
        status: route.status || 'active',
        totalTrips,
        completedTrips: completed,
        delayedTrips: delayed,
        cancelledTrips: cancelled,
        completionRate: calculateCompletionRate(completed, totalTrips),
        delayRate: calculateDelayRate(delayed, totalTrips),
        studentCount,
        busNumber: assignedBus?.busNumber || 'Unassigned',
        busCapacity: assignedBus?.capacity || null,
        capacityUtilization: capacityInfo.rate,
        capacityStatus: capacityInfo.status,
        incidentCount: routeIncidents,
      };
    });
  },

  /**
   * Computes Fleet Operational Intelligence & Reliability metrics
   */
  computeFleetAnalytics: (dataset) => {
    const { buses, trips, maintenance, inspections, routes } = dataset;

    return buses.map((bus) => {
      const busTrips = trips.filter((t) => t.busId === bus.id);
      const totalTrips = busTrips.length;
      const delayedTrips = busTrips.filter((t) => (t.status || '').toLowerCase() === 'delayed' || (t.delayMinutes && t.delayMinutes > 0)).length;

      const busMaintenance = maintenance.filter((m) => m.busId === bus.id);
      const activeWorkOrders = busMaintenance.filter((m) => m.status === 'inProgress' || m.status === 'scheduled').length;

      const busInspections = inspections.filter((i) => i.busId === bus.id);
      const failedInspections = busInspections.filter((i) => i.result === 'failed' || i.status === 'failed').length;

      // Check if bus is assigned to a route
      const assignedRoute = routes.find((r) => r.assignedBusId === bus.id);

      return {
        id: bus.id,
        busNumber: bus.busNumber || 'Bus',
        plateNumber: bus.plateNumber || 'N/A',
        status: bus.status || 'available',
        capacity: bus.capacity || null,
        totalTrips,
        delayedTrips,
        totalMaintenanceCount: busMaintenance.length,
        activeWorkOrders,
        totalInspections: busInspections.length,
        failedInspections,
        assignedRouteName: assignedRoute?.name || assignedRoute?.routeName || null,
      };
    });
  },

  /**
   * Generates Deterministic Operational Attention Insights
   */
  generateOperationalAttentionItems: (dataset) => {
    const { routes, buses, trips, incidents, inspections } = dataset;
    const attentionItems = [];

    // 1. Capacity Overflows
    const busMap = new Map(buses.map((b) => [b.id, b]));
    routes.forEach((r) => {
      const assignedBus = r.assignedBusId ? busMap.get(r.assignedBusId) : null;
      if (assignedBus?.capacity && r.assignedStudentsCount && r.assignedStudentsCount > assignedBus.capacity) {
        attentionItems.push({
          id: `CAP-${r.id}`,
          type: 'capacity_overflow',
          severity: 'high',
          title: `Route Over Capacity: ${r.name || r.routeName}`,
          message: `${r.assignedStudentsCount} students assigned to Bus ${assignedBus.busNumber} with capacity ${assignedBus.capacity} (${Math.round((r.assignedStudentsCount / assignedBus.capacity) * 100)}%).`,
          drillDownUrl: `/admin/planning/routes/${r.id}`,
          actionLabel: 'Adjust Route Capacity',
        });
      }
    });

    // 2. High Delay Corridors (>25% trips delayed)
    routes.forEach((r) => {
      const routeTrips = trips.filter((t) => t.routeId === r.id);
      if (routeTrips.length >= 4) {
        const delayedCount = routeTrips.filter((t) => (t.status || '').toLowerCase() === 'delayed' || (t.delayMinutes && t.delayMinutes > 0)).length;
        const rate = (delayedCount / routeTrips.length) * 100;
        if (rate >= 25) {
          attentionItems.push({
            id: `DELAY-${r.id}`,
            type: 'chronic_delay',
            severity: 'medium',
            title: `Frequent Delays: ${r.name || r.routeName}`,
            message: `${delayedCount} of ${routeTrips.length} trips (${Math.round(rate)}%) reported transit delays during the period.`,
            drillDownUrl: `/admin/analytics/trips?routeId=${r.id}`,
            actionLabel: 'Inspect Trip Schedules',
          });
        }
      }
    });

    // 3. Vehicles in Maintenance Downtime
    const maintenanceBuses = buses.filter((b) => b.status === 'maintenance');
    if (maintenanceBuses.length > 0) {
      attentionItems.push({
        id: 'FLEET-MAINT',
        type: 'maintenance_downtime',
        severity: 'medium',
        title: `${maintenanceBuses.length} Vehicles Undergoing Maintenance`,
        message: `Buses ${maintenanceBuses.map((b) => b.busNumber).join(', ')} are currently grounded and unavailable for route assignment.`,
        drillDownUrl: '/admin/fleet/maintenance',
        actionLabel: 'Review Work Orders',
      });
    }

    // 4. Critical Unresolved Safety Incidents
    const unresolvedCriticalIncidents = incidents.filter(
      (i) => (i.severity === 'critical' || i.severity === 'high') && (i.status || '').toLowerCase() !== 'resolved'
    );
    if (unresolvedCriticalIncidents.length > 0) {
      attentionItems.push({
        id: 'SAFETY-CRIT',
        type: 'safety_incident',
        severity: 'critical',
        title: `${unresolvedCriticalIncidents.length} Unresolved High-Severity Safety Incident(s)`,
        message: 'Investigation notes and supervisor action required to close outstanding safety reports.',
        drillDownUrl: '/admin/incidents',
        actionLabel: 'Investigate Incidents',
      });
    }

    // 5. Recent Failed Pre-Trip Inspections
    const recentFailed = inspections.filter((ins) => ins.result === 'failed');
    if (recentFailed.length > 0) {
      attentionItems.push({
        id: 'INSPECT-FAIL',
        type: 'failed_inspection',
        severity: 'high',
        title: `${recentFailed.length} Vehicle Safety Inspection Failure(s)`,
        message: 'Walkaround audits identified critical defects requiring mechanical clearance.',
        drillDownUrl: '/admin/fleet/inspections',
        actionLabel: 'View Inspection Logs',
      });
    }

    return attentionItems;
  },
};

export default analyticsService;
