import { isValidCoordinate } from '../../utils/mapUtils';
import { validateCapacity } from './capacityService';

/**
 * Deterministic Route Readiness Validation Checklist
 * Replaces arbitrary percentages with strict, verifiable operational preconditions.
 *
 * @param {Object} params
 * @param {Object} params.route - route data record
 * @param {Array<Object>} params.stops - associated ordered stops
 * @param {Object} [params.bus] - assigned bus record
 * @param {Object} [params.driver] - assigned driver record
 * @param {number} [params.assignedStudentsCount] - total students assigned to route
 * @param {Array<Object>} [params.conflicts] - active schedule/assignment conflicts
 * @returns {{ isReady: boolean, checks: Array<{ id: string, label: string, passed: boolean, detail: string, required: boolean }>, issues: string[], warnings: string[] }}
 */
export const evaluateRouteReadiness = ({
  route,
  stops = [],
  bus = null,
  driver = null,
  assignedStudentsCount = 0,
  conflicts = [],
}) => {
  const issues = [];
  const warnings = [];
  const checks = [];

  // Check 1: Route Identity
  const hasRouteIdentity = Boolean(route?.name?.trim() && route?.routeCode?.trim());
  checks.push({
    id: 'route_identity',
    label: 'Route Identity & Code',
    passed: hasRouteIdentity,
    detail: hasRouteIdentity 
      ? `${route.name} (${route.routeCode})` 
      : 'Route name and unique code are missing.',
    required: true,
  });
  if (!hasRouteIdentity) issues.push('Route requires a valid name and route code.');

  // Check 2: School Association
  const hasSchool = Boolean(route?.schoolId);
  checks.push({
    id: 'school_association',
    label: 'Campus Association',
    passed: hasSchool,
    detail: hasSchool ? `Assigned to school campus (${route.schoolId})` : 'No school campus assigned.',
    required: true,
  });
  if (!hasSchool) issues.push('Route must be linked to a valid school campus.');

  // Check 3: Stop Count (Minimum 2 waypoints for a transit corridor)
  const hasMinStops = stops.length >= 2;
  checks.push({
    id: 'stop_count',
    label: 'Minimum Stop Waypoints',
    passed: hasMinStops,
    detail: `${stops.length} stop(s) configured (minimum 2 required).`,
    required: true,
  });
  if (!hasMinStops) issues.push(`Route must have at least 2 stops configured (currently ${stops.length}).`);

  // Check 4: Geospatial Coordinates Validation on all Stops
  const invalidStops = stops.filter((s) => !isValidCoordinate(s.latitude, s.longitude));
  const stopsValid = stops.length > 0 && invalidStops.length === 0;
  checks.push({
    id: 'coordinates_valid',
    label: 'Stop Geospatial Coordinates',
    passed: stopsValid,
    detail: stopsValid 
      ? 'All stop waypoints possess valid geographical coordinates.' 
      : `${invalidStops.length} stop(s) missing valid GPS coordinates.`,
    required: true,
  });
  if (!stopsValid && stops.length > 0) {
    issues.push(`Geospatial error: ${invalidStops.map((s) => s.name || 'Stop').join(', ')} missing valid latitude/longitude.`);
  }

  // Check 5: Sequential Stop Indexing
  const sequences = stops.map((s) => Number(s.sequence)).filter((n) => !isNaN(n));
  const hasDuplicateSeq = new Set(sequences).size !== sequences.length;
  checks.push({
    id: 'sequence_order',
    label: 'Sequential Stop Ordering',
    passed: !hasDuplicateSeq && sequences.length === stops.length,
    detail: !hasDuplicateSeq ? 'Stop order is strictly sequential.' : 'Duplicate stop sequence numbers detected.',
    required: true,
  });
  if (hasDuplicateSeq) issues.push('Stops contain duplicate sequence order numbers.');

  // Check 6: Vehicle Fleet Assignment
  const isBusBlocked = bus && ['maintenance', 'outOfService', 'retired', 'inactive'].includes(bus.status);
  const hasBus = Boolean(bus && bus.busId && !isBusBlocked);
  checks.push({
    id: 'bus_assigned',
    label: 'Vehicle Fleet Assignment',
    passed: hasBus,
    detail: hasBus 
      ? `Bus ${bus.busNumber} (${bus.registrationNumber || 'Operational'})` 
      : isBusBlocked 
      ? `Assigned Bus ${bus.busNumber} is ${bus.status} and cannot operate.` 
      : 'No active vehicle assigned.',
    required: true,
  });
  if (isBusBlocked) {
    issues.push(`Bus ${bus.busNumber} is currently marked as ${bus.status} and cannot be assigned to active routes.`);
  } else if (!hasBus) {
    issues.push('An active bus must be assigned to the route.');
  }

  // Check 7: Driver Assignment
  const hasDriver = Boolean(driver && driver.driverId && driver.status !== 'suspended');
  checks.push({
    id: 'driver_assigned',
    label: 'Driver Crew Assignment',
    passed: hasDriver,
    detail: hasDriver ? `Driver: ${driver.fullName}` : 'No active driver assigned.',
    required: true,
  });
  if (!hasDriver) issues.push('An active driver must be assigned to the route.');

  // Check 8: Vehicle Capacity Check
  if (bus) {
    const capResult = validateCapacity({
      busCapacity: bus.capacity,
      assignedStudentsCount,
    });
    const capPassed = !capResult.isOverCapacity;
    checks.push({
      id: 'capacity_limit',
      label: 'Vehicle Capacity & Occupancy',
      passed: capPassed,
      detail: capResult.message,
      required: true,
    });
    if (!capPassed) issues.push(capResult.message);
    if (capResult.isNearCapacity) warnings.push(capResult.message);
  }

  // Check 9: Schedule Conflicts
  const hasConflicts = Array.isArray(conflicts) && conflicts.length > 0;
  checks.push({
    id: 'schedule_conflicts',
    label: 'Fleet Schedule Conflicts',
    passed: !hasConflicts,
    detail: !hasConflicts 
      ? 'Zero overlapping dispatch conflicts detected.' 
      : `${conflicts.length} schedule conflict(s) detected.`,
    required: true,
  });
  if (hasConflicts) {
    conflicts.forEach((c) => issues.push(`Conflict: ${c.message}`));
  }

  const isReady = issues.length === 0;

  return {
    isReady,
    statusText: isReady ? 'Ready for Activation' : `Requires Attention (${issues.length} issue${issues.length > 1 ? 's' : ''})`,
    checks,
    issues,
    warnings,
  };
};

export const routeReadinessService = {
  evaluateRouteReadiness,
};

export default routeReadinessService;
