import { describe, it, expect } from 'vitest';
import { evaluateDocumentExpiry } from '../../services/firestore/vehicleDocumentService';
import { DOCUMENT_STATUS } from '../../constants/collections';

describe('Document Expiration Evaluation (vehicleDocumentService)', () => {
  it('identifies an expired document correctly', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 5);
    const result = evaluateDocumentExpiry(yesterday.toISOString().split('T')[0]);

    expect(result.status).toBe(DOCUMENT_STATUS.EXPIRED);
    expect(result.daysRemaining).toBeLessThan(0);
    expect(result.label).toBe('Expired');
  });

  it('identifies a document expiring within 30 days as expiringSoon', () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 14);
    const result = evaluateDocumentExpiry(nextWeek.toISOString().split('T')[0]);

    expect(result.status).toBe(DOCUMENT_STATUS.EXPIRING_SOON);
    expect(result.daysRemaining).toBeGreaterThan(0);
    expect(result.daysRemaining).toBeLessThanOrEqual(30);
    expect(result.label).toBe('Expiring Soon');
  });

  it('identifies documents beyond 30 days as valid', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 90);
    const result = evaluateDocumentExpiry(futureDate.toISOString().split('T')[0]);

    expect(result.status).toBe(DOCUMENT_STATUS.VALID);
    expect(result.daysRemaining).toBeGreaterThan(30);
    expect(result.label).toBe('Valid');
  });

  it('handles missing dates gracefully', () => {
    const result = evaluateDocumentExpiry(null);
    expect(result).toBe(DOCUMENT_STATUS.MISSING);
  });
});
