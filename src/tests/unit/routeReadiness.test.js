import { describe, it, expect } from 'vitest';
import { evaluateRouteReadiness } from '../../services/planning/routeReadinessService';

describe('Deterministic Route Readiness Validation (routeReadinessService)', () => {
  const validRoute = {
    id: 'rt-101',
    routeId: 'rt-101',
    name: 'East Campus Express',
    routeCode: 'ECE-01',
    schoolId: 'school-main',
  };

  const validStops = [
    { id: 'stp-1', stopId: 'stp-1', name: 'Oak Street', sequence: 1, latitude: 40.7128, longitude: -74.0060 },
    { id: 'stp-2', stopId: 'stp-2', name: 'Pine Avenue', sequence: 2, latitude: 40.7200, longitude: -74.0100 },
  ];

  const validBus = {
    busId: 'bus-01',
    busNumber: 'RW-101',
    capacity: 40,
    status: 'active',
  };

  const validDriver = {
    driverId: 'drv-01',
    fullName: 'Robert Wilson',
    status: 'active',
  };

  it('marks a fully configured route as Ready for Activation', () => {
    const result = evaluateRouteReadiness({
      route: validRoute,
      stops: validStops,
      bus: validBus,
      driver: validDriver,
      assignedStudentsCount: 20,
      conflicts: [],
    });

    expect(result.isReady).toBe(true);
    expect(result.issues.length).toBe(0);
  });

  it('detects missing stop coordinates and blocks activation', () => {
    const stopsWithMissingCoords = [
      { id: 'stp-1', name: 'Oak Street', sequence: 1, latitude: 40.7128, longitude: -74.0060 },
      { id: 'stp-2', name: 'Broken Waypoint', sequence: 2, latitude: null, longitude: null },
    ];

    const result = evaluateRouteReadiness({
      route: validRoute,
      stops: stopsWithMissingCoords,
      bus: validBus,
      driver: validDriver,
      assignedStudentsCount: 15,
    });

    expect(result.isReady).toBe(false);
    expect(result.issues.some((i) => i.includes('missing valid latitude/longitude'))).toBe(true);
  });

  it('detects over-capacity condition and blocks activation', () => {
    const result = evaluateRouteReadiness({
      route: validRoute,
      stops: validStops,
      bus: validBus,
      driver: validDriver,
      assignedStudentsCount: 50, // exceeds capacity of 40
    });

    expect(result.isReady).toBe(false);
    expect(result.issues.some((i) => i.includes('exceed bus design limit'))).toBe(true);
  });

  it('blocks activation if active dispatch conflicts are present', () => {
    const result = evaluateRouteReadiness({
      route: validRoute,
      stops: validStops,
      bus: validBus,
      driver: validDriver,
      assignedStudentsCount: 10,
      conflicts: [{ type: 'driver', message: 'Driver schedule overlap.' }],
    });

    expect(result.isReady).toBe(false);
    expect(result.issues.some((i) => i.includes('schedule overlap'))).toBe(true);
  });
});
