import { tripService } from '../firestore/tripService';
import { auditService } from '../admin/auditService';
import { TRIP_STATUS } from '../../constants/collections';

/**
 * Mapping of Day of Week names to JS Date day index (0 = Sunday, 1 = Monday, ...)
 */
const DAY_INDEX_MAP = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

/**
 * Format a Date object as 'YYYY-MM-DD'
 */
const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Trip Generation & Preview Engine
 * Generates individual operational trip documents from recurring schedule patterns.
 */
export const tripGenerationService = {
  /**
   * Previews trips to be generated within a date range without modifying Firestore.
   *
   * @param {Object} params
   * @param {Object} params.schedule - the parent schedule configuration
   * @param {string} params.startDate - 'YYYY-MM-DD'
   * @param {string} params.endDate - 'YYYY-MM-DD'
   * @param {Array<Object>} params.existingTrips - all trips currently stored
   * @returns {Array<{ date: string, dayOfWeek: string, status: 'to_create'|'duplicate_skipped', existingTripId?: string }>}
   */
  previewTripGeneration: ({
    schedule,
    startDate,
    endDate,
    existingTrips = [],
  }) => {
    if (!schedule || !schedule.routeId || !startDate || !endDate) {
      return [];
    }

    const operatingDays = (schedule.operatingDays || []).map((d) => d.toLowerCase());
    const start = new Date(startDate);
    const end = new Date(endDate);
    const previewList = [];

    // Loop through each calendar day in the range
    const current = new Date(start);
    while (current <= end) {
      const dayIdx = current.getDay();
      const dayName = Object.keys(DAY_INDEX_MAP).find((k) => DAY_INDEX_MAP[k] === dayIdx);
      const dateStr = formatDate(current);

      if (dayName && operatingDays.includes(dayName)) {
        // Check if a trip already exists for this route, date, and schedule time
        const duplicate = existingTrips.find((t) => 
          t.routeId === schedule.routeId &&
          t.date === dateStr &&
          (t.scheduledStartTime === schedule.startTime || t.scheduleId === schedule.scheduleId)
        );

        if (duplicate) {
          previewList.push({
            date: dateStr,
            dayOfWeek: dayName.charAt(0).toUpperCase() + dayName.slice(1),
            status: 'duplicate_skipped',
            existingTripId: duplicate.id || duplicate.tripId,
            scheduledStartTime: schedule.startTime,
            scheduledEndTime: schedule.endTime,
          });
        } else {
          previewList.push({
            date: dateStr,
            dayOfWeek: dayName.charAt(0).toUpperCase() + dayName.slice(1),
            status: 'to_create',
            scheduledStartTime: schedule.startTime,
            scheduledEndTime: schedule.endTime,
          });
        }
      }

      current.setDate(current.getDate() + 1);
    }

    return previewList;
  },

  /**
   * Executes deterministic batch creation of trips for a confirmed schedule preview
   *
   * @param {Object} params
   * @param {Object} params.schedule
   * @param {Array<Object>} params.previewItems - list of previewed items
   * @param {Array<string>} [params.studentIds] - enrolled students to associate
   * @param {Object} params.actor - current user credentials
   * @returns {Promise<{ createdCount: number, skippedCount: number, failedCount: number, createdTrips: Array }>}
   */
  generateTrips: async ({
    schedule,
    previewItems = [],
    studentIds = [],
    actor = { uid: 'system', name: 'Admin', role: 'admin' },
  }) => {
    let createdCount = 0;
    let skippedCount = 0;
    let failedCount = 0;
    const createdTrips = [];

    const itemsToCreate = previewItems.filter((item) => item.status === 'to_create');
    skippedCount = previewItems.length - itemsToCreate.length;

    for (const item of itemsToCreate) {
      try {
        const tripData = {
          routeId: schedule.routeId,
          busId: schedule.busId || null,
          driverId: schedule.driverId || null,
          scheduleId: schedule.scheduleId || null,
          schoolId: schedule.schoolId || 'main-campus',
          date: item.date,
          scheduledStartTime: item.scheduledStartTime || schedule.startTime,
          scheduledEndTime: item.scheduledEndTime || schedule.endTime,
          status: TRIP_STATUS.SCHEDULED,
          studentIds: studentIds,
          currentStopId: null,
          trackingStatus: 'inactive',
        };

        const created = await tripService.createTrip(tripData);
        createdTrips.push(created);
        createdCount++;
      } catch (err) {
        console.error(`Failed to generate trip for date ${item.date}:`, err);
        failedCount++;
      }
    }

    // Log to immutable audit ledger
    await auditService.logEvent({
      actorUserId: actor.uid,
      actorName: actor.name || actor.email || 'Transport Admin',
      actorRole: actor.role || 'admin',
      action: 'TRIP_BATCH_GENERATION',
      resourceType: 'trip',
      resourceId: schedule.scheduleId || schedule.routeId,
      description: `Generated ${createdCount} operational trips for schedule ${schedule.name || schedule.scheduleId} (${skippedCount} duplicates skipped, ${failedCount} failures).`,
      schoolId: schedule.schoolId || 'main-campus',
      severity: 'info',
      metadata: {
        routeId: schedule.routeId,
        createdCount,
        skippedCount,
        failedCount,
        datesGenerated: itemsToCreate.map((i) => i.date),
      },
    });

    return {
      createdCount,
      skippedCount,
      failedCount,
      createdTrips,
    };
  },
};

export default tripGenerationService;
