import { describe, it, expect } from 'vitest';
import { 
  timeToMinutes, 
  doTimeSpansOverlap, 
  doDaysOverlap, 
  detectScheduleConflicts 
} from '../../services/planning/conflictService';

describe('Schedule Conflict Engine (conflictService)', () => {
  it('correctly converts time strings to minutes from midnight', () => {
    expect(timeToMinutes('07:15')).toBe(7 * 60 + 15);
    expect(timeToMinutes('14:30')).toBe(14 * 60 + 30);
    expect(timeToMinutes('07:15 AM')).toBe(7 * 60 + 15);
    expect(timeToMinutes('02:30 PM')).toBe(14 * 60 + 30);
    expect(timeToMinutes('12:00 AM')).toBe(0);
    expect(timeToMinutes('12:00 PM')).toBe(12 * 60);
    expect(timeToMinutes('invalid')).toBe(null);
  });

  it('correctly detects overlapping and non-overlapping time spans', () => {
    // 07:00 - 08:00 vs 07:30 - 08:30 (Overlap)
    expect(doTimeSpansOverlap(420, 480, 450, 510)).toBe(true);

    // 07:00 - 08:00 vs 08:00 - 09:00 (Edge touch - no overlap)
    expect(doTimeSpansOverlap(420, 480, 480, 540)).toBe(false);

    // 07:00 - 08:00 vs 09:00 - 10:00 (Completely separate)
    expect(doTimeSpansOverlap(420, 480, 540, 600)).toBe(false);
  });

  it('correctly identifies overlapping days of the week', () => {
    expect(doDaysOverlap(['Monday', 'Wednesday'], ['Wednesday', 'Friday'])).toBe(true);
    expect(doDaysOverlap(['Monday', 'Tuesday'], ['Thursday', 'Friday'])).toBe(false);
  });

  it('detects bus and driver conflicts against existing schedules', () => {
    const existingSchedules = [
      {
        id: 'sch-1',
        scheduleId: 'sch-1',
        busId: 'bus-101',
        driverId: 'drv-201',
        routeId: 'rt-1',
        operatingDays: ['Monday', 'Tuesday', 'Wednesday'],
        startTime: '07:00',
        endTime: '08:00',
      },
    ];

    // Conflict: Same bus at overlapping time on shared day
    const busConflict = detectScheduleConflicts({
      busId: 'bus-101',
      driverId: 'drv-999',
      routeId: 'rt-2',
      startTime: '07:30',
      endTime: '08:30',
      operatingDays: ['Monday'],
      existingSchedules,
    });
    expect(busConflict.hasConflict).toBe(true);
    expect(busConflict.conflicts.some((c) => c.type === 'bus')).toBe(true);

    // Conflict: Same driver at overlapping time on shared day
    const driverConflict = detectScheduleConflicts({
      busId: 'bus-999',
      driverId: 'drv-201',
      routeId: 'rt-2',
      startTime: '07:15',
      endTime: '07:45',
      operatingDays: ['Tuesday'],
      existingSchedules,
    });
    expect(driverConflict.hasConflict).toBe(true);
    expect(driverConflict.conflicts.some((c) => c.type === 'driver')).toBe(true);

    // No conflict: Different day entirely
    const diffDay = detectScheduleConflicts({
      busId: 'bus-101',
      driverId: 'drv-201',
      routeId: 'rt-1',
      startTime: '07:00',
      endTime: '08:00',
      operatingDays: ['Friday'],
      existingSchedules,
    });
    expect(diffDay.hasConflict).toBe(false);

    // No conflict: Self-exclusion when editing
    const selfExclude = detectScheduleConflicts({
      busId: 'bus-101',
      driverId: 'drv-201',
      routeId: 'rt-1',
      startTime: '07:00',
      endTime: '08:00',
      operatingDays: ['Monday'],
      existingSchedules,
      targetScheduleId: 'sch-1',
    });
    expect(selfExclude.hasConflict).toBe(false);
  });
});
