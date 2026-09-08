import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import locationManager, {
  calculateDistanceMeters,
  isValidCoordinates,
  LOCATION_PERMISSION_STATE,
  LOCATION_ERROR_CODES,
} from '../../services/tracking/locationManager';
import trackingService, {
  TRACKING_STATUS,
  getTrackingFreshness,
  TRACKING_THRESHOLDS,
} from '../../services/tracking/trackingService';

describe('Stage 31 Real-Time GPS & LocationManager Unit Suite', () => {
  describe('Geographic coordinate bounds validation', () => {
    it('accepts valid coordinates within boundaries', () => {
      expect(isValidCoordinates(40.7128, -74.006)).toBe(true);
      expect(isValidCoordinates(0, 0)).toBe(true);
      expect(isValidCoordinates(-90, -180)).toBe(true);
      expect(isValidCoordinates(90, 180)).toBe(true);
    });

    it('rejects out-of-boundary latitudes and longitudes', () => {
      expect(isValidCoordinates(91, 0)).toBe(false);
      expect(isValidCoordinates(-91, 0)).toBe(false);
      expect(isValidCoordinates(0, 181)).toBe(false);
      expect(isValidCoordinates(0, -181)).toBe(false);
    });

    it('rejects non-numeric and NaN coordinates', () => {
      expect(isValidCoordinates(NaN, 50)).toBe(false);
      expect(isValidCoordinates(40, NaN)).toBe(false);
      expect(isValidCoordinates('40', '50')).toBe(false);
      expect(isValidCoordinates(null, undefined)).toBe(false);
    });
  });

  describe('Haversine distance calculation', () => {
    it('returns 0 for identical coordinates', () => {
      expect(calculateDistanceMeters(40.7128, -74.006, 40.7128, -74.006)).toBe(0);
    });

    it('calculates accurate distance between known waypoints', () => {
      // New York to Philadelphia (~130 km)
      const dist = calculateDistanceMeters(40.7128, -74.006, 39.9526, -75.1652);
      expect(dist).toBeGreaterThan(125000);
      expect(dist).toBeLessThan(135000);
    });

    it('calculates small meter displacements correctly', () => {
      // Approximate 100m displacement along longitude at equator
      const dist = calculateDistanceMeters(0, 0, 0, 0.001);
      expect(dist).toBeGreaterThan(100);
      expect(dist).toBeLessThan(120);
    });
  });

  describe('Tracking Freshness & Stale Detection', () => {
    it('identifies fresh timestamp under 20 seconds as active', () => {
      const now = Date.now();
      expect(getTrackingFreshness(now - 5000)).toBe(TRACKING_STATUS.ACTIVE);
      expect(getTrackingFreshness(now - 15000)).toBe(TRACKING_STATUS.ACTIVE);
    });

    it('identifies timestamp between 20s and 60s as recent', () => {
      const now = Date.now();
      expect(getTrackingFreshness(now - 30000)).toBe('recent');
      expect(getTrackingFreshness(now - 55000)).toBe('recent');
    });

    it('identifies timestamp older than 60 seconds as stale', () => {
      const now = Date.now();
      expect(getTrackingFreshness(now - 65000)).toBe(TRACKING_STATUS.STALE);
      expect(getTrackingFreshness(now - 120000)).toBe(TRACKING_STATUS.STALE);
    });

    it('returns offline for null or undefined timestamps', () => {
      expect(getTrackingFreshness(null)).toBe(TRACKING_STATUS.OFFLINE);
      expect(getTrackingFreshness(undefined)).toBe(TRACKING_STATUS.OFFLINE);
    });
  });

  describe('LocationManager Lifecycle & Duplicate Watcher Prevention', () => {
    afterEach(() => {
      locationManager.stopWatching();
    });

    it('handles stopWatching cleanly when inactive', () => {
      expect(() => locationManager.stopWatching()).not.toThrow();
      expect(locationManager.isWatching).toBe(false);
      expect(locationManager.watchId).toBeNull();
    });
  });
});
