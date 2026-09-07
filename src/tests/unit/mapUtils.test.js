import { describe, it, expect } from 'vitest';
import { isValidCoordinate } from '../../utils/mapUtils';

describe('Geospatial Coordinate Validation', () => {
  it('should accept valid latitude and longitude coordinates', () => {
    expect(isValidCoordinate(40.7128, -74.0060)).toBe(true); // New York
    expect(isValidCoordinate(51.5074, -0.1278)).toBe(true);  // London
    expect(isValidCoordinate(33.6844, 73.0479)).toBe(true);  // Islamabad
    expect(isValidCoordinate(0, 0)).toBe(true);              // Equator/Prime Meridian
    expect(isValidCoordinate('34.0522', '-118.2437')).toBe(true); // String numbers
  });

  it('should reject out-of-range coordinates', () => {
    expect(isValidCoordinate(95.0, 10.0)).toBe(false);   // Lat > 90
    expect(isValidCoordinate(-95.0, 10.0)).toBe(false);  // Lat < -90
    expect(isValidCoordinate(40.0, 195.0)).toBe(false);  // Lng > 180
    expect(isValidCoordinate(40.0, -195.0)).toBe(false); // Lng < -180
  });

  it('should reject invalid or missing coordinate types', () => {
    expect(isValidCoordinate(null, null)).toBe(false);
    expect(isValidCoordinate(undefined, undefined)).toBe(false);
    expect(isValidCoordinate('invalid', 'coord')).toBe(false);
    expect(isValidCoordinate(NaN, 10)).toBe(false);
    expect(isValidCoordinate(10, NaN)).toBe(false);
  });
});
