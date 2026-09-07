import { describe, it, expect } from 'vitest';
import {
  calculateCompletionRate,
  calculateCancellationRate,
  calculateDelayRate,
  calculateAverageDelayMinutes,
  calculateCapacityUtilization,
  calculateAttendanceRate,
  calculateTrend,
  evaluateTripReliability,
} from '../../services/analytics/kpiDefinitions';

describe('Stage 25: KPI Definitions & Operational Intelligence Engine', () => {
  describe('calculateCompletionRate', () => {
    it('accurately calculates completion percentage', () => {
      expect(calculateCompletionRate(18, 20)).toBe(90.0);
      expect(calculateCompletionRate(47, 50)).toBe(94.0);
    });

    it('handles zero or negative denominators gracefully without dividing by zero', () => {
      expect(calculateCompletionRate(0, 0)).toBeNull();
      expect(calculateCompletionRate(5, -10)).toBeNull();
      expect(calculateCompletionRate(5, null)).toBeNull();
    });
  });

  describe('calculateCancellationRate', () => {
    it('calculates cancellation rate correctly', () => {
      expect(calculateCancellationRate(2, 50)).toBe(4.0);
      expect(calculateCancellationRate(0, 25)).toBe(0.0);
    });

    it('handles zero denominator gracefully', () => {
      expect(calculateCancellationRate(0, 0)).toBeNull();
    });
  });

  describe('calculateDelayRate', () => {
    it('calculates delay rate correctly', () => {
      expect(calculateDelayRate(5, 20)).toBe(25.0);
    });
  });

  describe('calculateAverageDelayMinutes', () => {
    it('calculates average delay from trip timestamps and delayMinutes', () => {
      const trips = [
        { delayMinutes: 10 },
        { delayMinutes: 20 },
      ];
      expect(calculateAverageDelayMinutes(trips)).toBe(15.0);
    });

    it('returns null if no trips have valid delay timestamps', () => {
      expect(calculateAverageDelayMinutes([])).toBeNull();
      expect(calculateAverageDelayMinutes(null)).toBeNull();
      expect(calculateAverageDelayMinutes([{ delayMinutes: 0 }])).toBeNull();
    });
  });

  describe('calculateCapacityUtilization', () => {
    it('detects optimal capacity utilization', () => {
      const res = calculateCapacityUtilization(35, 50);
      expect(res.rate).toBe(70.0);
      expect(res.status).toBe('optimal');
      expect(res.availableSeats).toBe(15);
      expect(res.excessStudents).toBe(0);
    });

    it('detects over-capacity condition', () => {
      const res = calculateCapacityUtilization(55, 50);
      expect(res.rate).toBe(110.0);
      expect(res.status).toBe('over_capacity');
      expect(res.excessStudents).toBe(5);
    });

    it('flags unavailable capacity when bus capacity is missing or 0', () => {
      const res = calculateCapacityUtilization(25, 0);
      expect(res.status).toBe('unavailable');
      expect(res.rate).toBeNull();
    });
  });

  describe('calculateAttendanceRate', () => {
    it('calculates verified attendance (boarded + absent) over expected', () => {
      expect(calculateAttendanceRate(45, 5, 50)).toBe(100.0);
      expect(calculateAttendanceRate(40, 2, 50)).toBe(84.0);
    });

    it('returns null when expected attendance is 0', () => {
      expect(calculateAttendanceRate(0, 0, 0)).toBeNull();
    });
  });

  describe('calculateTrend', () => {
    it('calculates upward percentage trend', () => {
      const res = calculateTrend(120, 100);
      expect(res.changePct).toBe(20.0);
      expect(res.direction).toBe('up');
      expect(res.isPositive).toBe(true);
    });

    it('calculates downward percentage trend', () => {
      const res = calculateTrend(80, 100);
      expect(res.changePct).toBe(20.0);
      expect(res.direction).toBe('down');
      expect(res.isPositive).toBe(false);
    });

    it('handles zero previous period cleanly', () => {
      const res = calculateTrend(10, 0);
      expect(res.direction).toBe('up');
      expect(res.changePct).toBeNull();
    });
  });

  describe('evaluateTripReliability', () => {
    it('categorizes cancelled and delayed trips', () => {
      expect(evaluateTripReliability({ status: 'cancelled' })).toBe('cancelled');
      expect(evaluateTripReliability({ status: 'delayed' })).toBe('delayed');
      expect(evaluateTripReliability({ status: 'completed' })).toBe('on_schedule');
    });

    it('detects delay if timestamp difference exceeds 5 minutes', () => {
      const delayedTrip = {
        status: 'completed',
        scheduledStartTimestamp: 1000000,
        actualStartTimestamp: 1000000 + (6 * 60000), // 6 mins late
      };
      expect(evaluateTripReliability(delayedTrip)).toBe('delayed');
    });
  });
});
