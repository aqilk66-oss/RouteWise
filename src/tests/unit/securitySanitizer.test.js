import { describe, it, expect } from 'vitest';
import { 
  sanitizeHtml, 
  sanitizeCsvCell, 
  sanitizeFileName, 
  validateCoordinates 
} from '../../utils/securityUtils';

describe('Security & Sanitization Utilities (Stage 27)', () => {
  describe('HTML Entity Sanitization (XSS Prevention)', () => {
    it('escapes dangerous HTML script tags and attribute characters', () => {
      const dirty = '<script>alert("XSS")</script>';
      const clean = sanitizeHtml(dirty);
      expect(clean).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
      expect(clean).not.toContain('<script>');
    });

    it('handles non-string values gracefully', () => {
      expect(sanitizeHtml(null)).toBeNull();
      expect(sanitizeHtml(undefined)).toBeUndefined();
      expect(sanitizeHtml(123)).toBe(123);
    });
  });

  describe('CSV Formula Injection Defense', () => {
    it('escapes values beginning with dangerous formula characters', () => {
      expect(sanitizeCsvCell('=SUM(A1:A10)')).toBe("'=SUM(A1:A10)");
      expect(sanitizeCsvCell('+cmd|')).toBe("'+cmd|");
      expect(sanitizeCsvCell('-100')).toBe("'-100");
      expect(sanitizeCsvCell('@IMPORTXML')).toBe("'@IMPORTXML");
    });

    it('leaves standard benign strings and numbers unchanged', () => {
      expect(sanitizeCsvCell('Route 102 - North Oak')).toBe('Route 102 - North Oak');
      expect(sanitizeCsvCell('John Doe')).toBe('John Doe');
      expect(sanitizeCsvCell(42)).toBe('42');
    });

    it('handles null and undefined values cleanly', () => {
      expect(sanitizeCsvCell(null)).toBe('');
      expect(sanitizeCsvCell(undefined)).toBe('');
    });
  });

  describe('Filename Sanitization', () => {
    it('strips path traversal patterns and dangerous characters', () => {
      expect(sanitizeFileName('../../etc/passwd')).toBe('passwd');
      expect(sanitizeFileName('..\\windows\\system32\\cmd.exe')).toBe('cmd.exe');
      expect(sanitizeFileName('report;rm -rf.pdf')).toBe('report_rm_-rf.pdf');
    });

    it('provides a safe default if input is empty or invalid', () => {
      expect(sanitizeFileName('')).toBe('file');
      expect(sanitizeFileName(null)).toBe('attachment');
    });
  });

  describe('Coordinate Boundary Validation', () => {
    it('accepts valid latitude and longitude coordinates', () => {
      expect(validateCoordinates(40.7128, -74.006)).toBe(true); // NYC
      expect(validateCoordinates(-33.8688, 151.2093)).toBe(true); // Sydney
      expect(validateCoordinates('0', '0')).toBe(true); // Equator / Prime Meridian
    });

    it('rejects coordinates that exceed geographic limits', () => {
      expect(validateCoordinates(95.0, 10.0)).toBe(false); // Lat > 90
      expect(validateCoordinates(-91.0, 10.0)).toBe(false); // Lat < -90
      expect(validateCoordinates(45.0, 185.0)).toBe(false); // Lng > 180
      expect(validateCoordinates(45.0, -181.0)).toBe(false); // Lng < -180
      expect(validateCoordinates('invalid', 50.0)).toBe(false); // NaN
    });
  });
});
