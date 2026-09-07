import { describe, it, expect } from 'vitest';
import { 
  validateEmail, 
  validatePhone, 
  validateSpeedThreshold, 
  formatDate, 
  formatTime 
} from '../../utils/formatters';

describe('Validation and Formatting Utilities', () => {
  it('should validate RFC-compliant email formats', () => {
    expect(validateEmail('parent@example.com')).toBe(true);
    expect(validateEmail('admin.transport@routewise.app')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('@missing-user.com')).toBe(false);
    expect(validateEmail('user@.com')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });

  it('should validate standard telephone formats', () => {
    expect(validatePhone('+1 (555) 019-2834')).toBe(true);
    expect(validatePhone('555-019-2834')).toBe(true);
    expect(validatePhone('+92 300 1234567')).toBe(true);
    expect(validatePhone('123')).toBe(false);
    expect(validatePhone('abc-phone')).toBe(false);
  });

  it('should validate transit speed thresholds safely', () => {
    expect(validateSpeedThreshold(25)).toBe(true);
    expect(validateSpeedThreshold(55)).toBe(true);
    expect(validateSpeedThreshold(10)).toBe(false); // Below school bus safety lower limit
    expect(validateSpeedThreshold(95)).toBe(false); // Above highway safety governor limit
    expect(validateSpeedThreshold('invalid')).toBe(false);
  });

  it('should handle dates and timestamps gracefully without exceptions', () => {
    const testDate = new Date('2026-09-06T14:30:00Z');
    expect(formatDate(testDate)).toBeTruthy();
    expect(formatTime(testDate)).toBeTruthy();
    expect(formatDate(null)).toBe('N/A');
    expect(formatTime(null)).toBe('N/A');
    expect(formatDate(undefined)).toBe('N/A');
  });
});
