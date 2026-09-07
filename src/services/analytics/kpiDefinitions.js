/**
 * RouteWise Centralized KPI & Operational Intelligence Calculation Engine
 * 
 * Pure, deterministic mathematical formulas for transport performance.
 * Adheres strictly to Stage 25 standards:
 * - No fake numbers or synthetic smoothing
 * - Safe handling of zero denominators
 * - Missing timestamp tolerance
 * - Transparent definitions
 */

/**
 * Calculates trip completion rate as a percentage
 * Formula: (completed valid trips / eligible scheduled trips) * 100
 */
export function calculateCompletionRate(completedCount, totalEligible) {
  if (!totalEligible || totalEligible <= 0) return null;
  const completed = Math.max(0, Number(completedCount) || 0);
  const total = Number(totalEligible);
  return Math.round((completed / total) * 1000) / 10; // 1 decimal place (e.g. 94.5)
}

/**
 * Calculates trip cancellation rate as a percentage
 * Formula: (cancelled valid trips / eligible scheduled trips) * 100
 */
export function calculateCancellationRate(cancelledCount, totalEligible) {
  if (!totalEligible || totalEligible <= 0) return null;
  const cancelled = Math.max(0, Number(cancelledCount) || 0);
  const total = Number(totalEligible);
  return Math.round((cancelled / total) * 1000) / 10;
}

/**
 * Calculates delay rate as a percentage
 * Formula: (delayed valid trips / eligible scheduled trips) * 100
 */
export function calculateDelayRate(delayedCount, totalEligible) {
  if (!totalEligible || totalEligible <= 0) return null;
  const delayed = Math.max(0, Number(delayedCount) || 0);
  const total = Number(totalEligible);
  return Math.round((delayed / total) * 1000) / 10;
}

/**
 * Computes average delay in minutes from trips with recorded start timestamps
 * If trips lack timestamps, returns null to avoid inventing minutes
 */
export function calculateAverageDelayMinutes(tripsWithDelayTimes) {
  if (!Array.isArray(tripsWithDelayTimes) || tripsWithDelayTimes.length === 0) {
    return null;
  }

  let totalDelayMs = 0;
  let validCount = 0;

  tripsWithDelayTimes.forEach((trip) => {
    const scheduled = trip.scheduledStartTimestamp || (trip.scheduledStartTime ? new Date(trip.scheduledStartTime).getTime() : null);
    const actual = trip.actualStartTimestamp || (trip.actualStartTime ? new Date(trip.actualStartTime).getTime() : null);

    if (scheduled && actual && actual > scheduled) {
      totalDelayMs += (actual - scheduled);
      validCount++;
    } else if (typeof trip.delayMinutes === 'number' && trip.delayMinutes > 0) {
      totalDelayMs += trip.delayMinutes * 60000;
      validCount++;
    }
  });

  if (validCount === 0) return null;
  const avgMinutes = totalDelayMs / (validCount * 60000);
  return Math.round(avgMinutes * 10) / 10; // Round to 1 decimal place
}

/**
 * Computes bus capacity utilization
 * Formula: (assigned students / configured bus capacity) * 100
 */
export function calculateCapacityUtilization(assignedStudentsCount, configuredBusCapacity) {
  const capacity = Number(configuredBusCapacity);
  if (!capacity || capacity <= 0) {
    return {
      rate: null,
      status: 'unavailable',
      label: 'Capacity Unconfigured',
    };
  }

  const students = Math.max(0, Number(assignedStudentsCount) || 0);
  const rate = Math.round((students / capacity) * 1000) / 10;

  let status = 'optimal';
  if (rate > 100) status = 'over_capacity';
  else if (rate >= 90) status = 'near_capacity';
  else if (rate < 40) status = 'under_utilized';

  return {
    rate,
    status,
    students,
    capacity,
    availableSeats: Math.max(0, capacity - students),
    excessStudents: Math.max(0, students - capacity),
  };
}

/**
 * Calculates transport passenger attendance completion rate
 * Formula: (recorded boardings + documented absences) / expected riders * 100
 */
export function calculateAttendanceRate(boardedCount, absentCount, expectedCount) {
  if (!expectedCount || expectedCount <= 0) return null;
  const recorded = (Number(boardedCount) || 0) + (Number(absentCount) || 0);
  const expected = Number(expectedCount);
  return Math.round((recorded / expected) * 1000) / 10;
}

/**
 * Deterministic period trend comparison calculation
 * Returns percentage change and direction
 */
export function calculateTrend(currentValue, previousValue) {
  const current = Number(currentValue);
  const previous = Number(previousValue);

  if (isNaN(current) || isNaN(previous)) {
    return { changePct: null, direction: 'unknown', label: 'No comparison data' };
  }

  if (previous === 0) {
    if (current === 0) return { changePct: 0, direction: 'neutral', label: 'No change' };
    return { changePct: null, direction: 'up', label: 'New activity' };
  }

  const diff = current - previous;
  const pct = Math.round((diff / previous) * 1000) / 10;

  let direction = 'neutral';
  if (pct > 0) direction = 'up';
  else if (pct < 0) direction = 'down';

  return {
    changePct: Math.abs(pct),
    rawPct: pct,
    direction,
    isPositive: pct > 0,
    label: pct === 0 ? 'No change' : `${pct > 0 ? '+' : ''}${pct}% vs prior period`,
  };
}

/**
 * Evaluates operational reliability category for an individual trip
 */
export function evaluateTripReliability(trip) {
  if (!trip) return 'unknown';

  const status = (trip.status || '').toLowerCase();

  if (status === 'cancelled') return 'cancelled';
  if (status === 'delayed' || (trip.delayMinutes && trip.delayMinutes > 0)) return 'delayed';
  if (status === 'completed' || status === 'in_progress' || status === 'inprogress') {
    // Check if timestamp shows delay
    const scheduled = trip.scheduledStartTimestamp || (trip.scheduledStartTime ? new Date(trip.scheduledStartTime).getTime() : null);
    const actual = trip.actualStartTimestamp || (trip.actualStartTime ? new Date(trip.actualStartTime).getTime() : null);
    if (scheduled && actual && (actual - scheduled) > 5 * 60000) {
      return 'delayed'; // Over 5 min threshold
    }
    return 'on_schedule';
  }
  if (status === 'scheduled') return 'scheduled';

  return 'incomplete';
}
