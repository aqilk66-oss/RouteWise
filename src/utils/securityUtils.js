/**
 * RouteWise Security & Sanitization Utilities (Stage 27)
 * 
 * Provides defense-in-depth protections:
 * - HTML entity escaping to prevent cross-site scripting (XSS)
 * - Spreadsheet formula injection sanitization for CSV/export datasets
 * - Safe file name normalization preventing path traversal
 * - Coordinate boundary & precision validation
 */

/**
 * Escapes dangerous HTML characters to prevent XSS injection
 */
export const sanitizeHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Sanitizes field values for CSV / Spreadsheet export to mitigate Formula Injection (CSV Injection).
 * Any cell value starting with '=', '+', '-', '@', '\t', '\r' is prefixed with an apostrophe.
 */
export const sanitizeCsvCell = (value) => {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  const dangerousChars = ['=', '+', '-', '@', '\t', '\r'];
  
  if (dangerousChars.some((char) => stringValue.startsWith(char))) {
    return `'${stringValue}`;
  }
  return stringValue;
};

/**
 * Sanitizes uploaded or referenced filenames to prevent directory traversal or script execution
 */
export const sanitizeFileName = (fileName) => {
  if (typeof fileName !== 'string') return 'attachment';
  // Strip paths, control characters, and replace hazardous chars with underscore
  const baseName = fileName.split(/[\\/]/).pop();
  return baseName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/^\.+/, '')
    .slice(0, 100) || 'file';
};

/**
 * Checks if a coordinate pair falls strictly within standard WGS84 geographic limits
 */
export const validateCoordinates = (lat, lng) => {
  if (lat === null || lat === undefined || lng === null || lng === undefined) return false;
  const numLat = Number(lat);
  const numLng = Number(lng);
  
  if (isNaN(numLat) || isNaN(numLng)) return false;
  return numLat >= -90 && numLat <= 90 && numLng >= -180 && numLng <= 180;
};
