import { describe, it, expect } from 'vitest';
import { evaluateBusReadiness } from '../../services/fleet/busReadinessService';
import { BUS_STATUS, DOCUMENT_STATUS } from '../../constants/collections';

describe('Bus Operational Readiness Evaluation (busReadinessService)', () => {
  const validBus = {
    busId: 'bus-101',
    busNumber: 'RW-101',
    registrationNumber: 'KAS-921',
    capacity: 36,
    status: BUS_STATUS.AVAILABLE,
  };

  const validDocuments = [
    { documentId: 'doc-1', documentType: 'Registration', status: DOCUMENT_STATUS.VALID },
    { documentId: 'doc-2', documentType: 'Insurance', status: DOCUMENT_STATUS.VALID },
  ];

  const validInspections = [
    { inspectionId: 'insp-1', result: 'passed', inspectionDate: '2026-09-01' },
  ];

  it('approves an active, inspected bus with valid documents', () => {
    const result = evaluateBusReadiness({
      bus: validBus,
      documents: validDocuments,
      inspections: validInspections,
      defects: [],
    });

    expect(result.isReady).toBe(true);
    expect(result.issues.length).toBe(0);
  });

  it('rejects a vehicle currently flagged under maintenance', () => {
    const maintenanceBus = { ...validBus, status: BUS_STATUS.MAINTENANCE };
    const result = evaluateBusReadiness({
      bus: maintenanceBus,
      documents: validDocuments,
      inspections: validInspections,
      defects: [],
    });

    expect(result.isReady).toBe(false);
    expect(result.issues.some((i) => i.includes('marked as maintenance'))).toBe(true);
  });

  it('blocks a vehicle with unresolved critical defects', () => {
    const criticalDefect = [
      { defectId: 'def-1', severity: 'critical', status: 'open', description: 'Brake line leak' },
    ];
    const result = evaluateBusReadiness({
      bus: validBus,
      documents: validDocuments,
      inspections: validInspections,
      defects: criticalDefect,
    });

    expect(result.isReady).toBe(false);
    expect(result.issues.some((i) => i.includes('Critical safety defects'))).toBe(true);
  });

  it('blocks a vehicle with expired registration or insurance', () => {
    const expiredDocs = [
      { documentId: 'doc-1', documentType: 'Insurance Policy', status: DOCUMENT_STATUS.EXPIRED },
    ];
    const result = evaluateBusReadiness({
      bus: validBus,
      documents: expiredDocs,
      inspections: validInspections,
      defects: [],
    });

    expect(result.isReady).toBe(false);
    expect(result.issues.some((i) => i.includes('Expired vehicle documentation'))).toBe(true);
  });
});
