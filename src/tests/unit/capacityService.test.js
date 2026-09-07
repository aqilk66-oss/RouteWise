import { describe, it, expect } from 'vitest';
import { validateCapacity } from '../../services/planning/capacityService';

describe('Fleet Capacity Validation Engine (capacityService)', () => {
  it('identifies safe occupancy within vehicle limits', () => {
    const result = validateCapacity({ busCapacity: 40, assignedStudentsCount: 25 });
    expect(result.status).toBe('within');
    expect(result.isOverCapacity).toBe(false);
    expect(result.isNearCapacity).toBe(false);
    expect(result.remainingSeats).toBe(15);
    expect(result.utilizationRate).toBe(63);
  });

  it('triggers near-capacity warning at 90% threshold', () => {
    const result = validateCapacity({ busCapacity: 40, assignedStudentsCount: 37 });
    expect(result.status).toBe('near');
    expect(result.isNearCapacity).toBe(true);
    expect(result.isOverCapacity).toBe(false);
    expect(result.remainingSeats).toBe(3);
  });

  it('triggers over-capacity critical alert when limit is exceeded', () => {
    const result = validateCapacity({ busCapacity: 30, assignedStudentsCount: 35 });
    expect(result.status).toBe('over');
    expect(result.isOverCapacity).toBe(true);
    expect(result.remainingSeats).toBe(-5);
    expect(result.utilizationRate).toBe(117);
  });

  it('handles unconfigured or zero capacity gracefully', () => {
    const result = validateCapacity({ busCapacity: 0, assignedStudentsCount: 10 });
    expect(result.status).toBe('unknown');
    expect(result.isOverCapacity).toBe(false);
  });
});
