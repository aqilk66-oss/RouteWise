/**
 * Time utility: Convert 'HH:mm' or 'hh:mm AM/PM' to minutes from midnight
 */
export const timeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const clean = timeStr.trim();
  
  // Format '14:30'
  if (clean.includes(':') && !clean.toLowerCase().includes('am') && !clean.toLowerCase().includes('pm')) {
    const [h, m] = clean.split(':').map(Number);
    if (!isNaN(h) && !isNaN(m)) return h * 60 + m;
  }

  // Format '07:30 AM' or '03:15 PM'
  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridiem = match[3] ? match[3].toLowerCase() : null;

    if (meridiem === 'pm' && hours < 12) hours += 12;
    if (meridiem === 'am' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  return null;
};

/**
 * Checks if two time spans [start1, end1] and [start2, end2] overlap
 */
export const doTimeSpansOverlap = (start1Min, end1Min, start2Min, end2Min) => {
  if (start1Min === null || end1Min === null || start2Min === null || end2Min === null) return false;
  // Overlap condition: max(start1, start2) < min(end1, end2)
  return Math.max(start1Min, start2Min) < Math.min(end1Min, end2Min);
};

/**
 * Checks if two day-of-week sets share any overlapping operating day
 */
export const doDaysOverlap = (days1 = [], days2 = []) => {
  if (!Array.isArray(days1) || !Array.isArray(days2)) return false;
  return days1.some((day) => days2.includes(day));
};

/**
 * Comprehensive Schedule & Operational Conflict Detection Engine
 * Validates Driver, Bus, and Route overlap against existing schedules and active trips.
 *
 * @param {Object} params
 * @param {string} params.busId
 * @param {string} params.driverId
 * @param {string} params.routeId
 * @param {string} params.startTime - format '07:15'
 * @param {string} params.endTime - format '08:15'
 * @param {Array<string>} params.operatingDays - e.g. ['Monday', 'Tuesday']
 * @param {Array<Object>} params.existingSchedules - list of all active schedules
 * @param {string} [params.targetScheduleId] - optional id to exclude when editing
 * @returns {{ hasConflict: boolean, conflicts: Array<{ type: 'driver'|'bus'|'route', message: string, entityId: string, timeSpan: string }> }}
 */
export const detectScheduleConflicts = ({
  busId = null,
  driverId = null,
  routeId = null,
  startTime,
  endTime,
  operatingDays = [],
  existingSchedules = [],
  targetScheduleId = null,
}) => {
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  const conflicts = [];

  if (startMin === null || endMin === null || startMin >= endMin) {
    return {
      hasConflict: true,
      conflicts: [{
        type: 'route',
        message: 'Invalid schedule timeframe: start time must precede end time.',
        entityId: routeId || 'unassigned',
        timeSpan: `${startTime || 'N/A'} - ${endTime || 'N/A'}`,
      }],
    };
  }

  for (const item of existingSchedules) {
    // Skip self when updating an existing schedule
    if (targetScheduleId && (item.id === targetScheduleId || item.scheduleId === targetScheduleId)) {
      continue;
    }

    // Only compare if schedules share at least one active operating day
    const itemDays = item.operatingDays || [];
    if (!doDaysOverlap(operatingDays, itemDays)) {
      continue;
    }

    const itemStartMin = timeToMinutes(item.startTime);
    const itemEndMin = timeToMinutes(item.endTime);

    if (!doTimeSpansOverlap(startMin, endMin, itemStartMin, itemEndMin)) {
      continue;
    }

    const overlappingTimeSpan = `${item.startTime} - ${item.endTime}`;

    // 1. Bus Conflict: Bus cannot be assigned to overlapping schedules
    if (busId && (item.busId === busId)) {
      conflicts.push({
        type: 'bus',
        message: `Bus assignment conflict: Bus is already scheduled on Route ${item.routeId || item.name || 'another trip'} from ${overlappingTimeSpan}.`,
        entityId: busId,
        timeSpan: overlappingTimeSpan,
      });
    }

    // 2. Driver Conflict: Driver cannot drive two buses at once
    if (driverId && (item.driverId === driverId)) {
      conflicts.push({
        type: 'driver',
        message: `Driver schedule conflict: Driver is already assigned to a trip from ${overlappingTimeSpan}.`,
        entityId: driverId,
        timeSpan: overlappingTimeSpan,
      });
    }

    // 3. Route Conflict: A route cannot have overlapping operational windows
    if (routeId && (item.routeId === routeId)) {
      conflicts.push({
        type: 'route',
        message: `Route overlap conflict: Route ${routeId} already has an active schedule operating from ${overlappingTimeSpan}.`,
        entityId: routeId,
        timeSpan: overlappingTimeSpan,
      });
    }
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
  };
};

export const conflictService = {
  timeToMinutes,
  doTimeSpansOverlap,
  doDaysOverlap,
  detectScheduleConflicts,
};

export default conflictService;
