import { BUS_STATUS, DOCUMENT_STATUS } from '../../constants/collections';

/**
 * Deterministic Bus Operational Readiness Checklist
 * Verifies mechanical, inspection, and document preconditions before vehicle can be assigned to routes or dispatch.
 *
 * @param {Object} params
 * @param {Object} params.bus - bus data record
 * @param {Array<Object>} [params.documents] - associated vehicle documents
 * @param {Array<Object>} [params.defects] - open/unresolved defects
 * @param {Array<Object>} [params.inspections] - recent inspection reports
 * @returns {{ isReady: boolean, checks: Array<{ id: string, label: string, passed: boolean, detail: string, critical: boolean }>, issues: string[], warnings: string[] }}
 */
export const evaluateBusReadiness = ({
  bus,
  documents = [],
  defects = [],
  inspections = [],
}) => {
  const issues = [];
  const warnings = [];
  const checks = [];

  if (!bus) {
    return {
      isReady: false,
      checks: [],
      issues: ['No vehicle record specified.'],
      warnings: [],
      statusText: 'No Vehicle Specified',
    };
  }

  // Check 1: Operational Status (Must not be maintenance, outOfService, or retired)
  const isBlockedStatus = [
    BUS_STATUS.MAINTENANCE, 
    BUS_STATUS.OUT_OF_SERVICE, 
    BUS_STATUS.RETIRED,
    'maintenance',
    'outOfService',
    'retired',
    'inactive'
  ].includes(bus.status);

  const statusPassed = !isBlockedStatus;
  checks.push({
    id: 'status_operational',
    label: 'Operational Status',
    passed: statusPassed,
    detail: statusPassed 
      ? `Status is operational (${bus.status || 'available'}).` 
      : `Vehicle is currently flagged as ${bus.status || 'out of service'}.`,
    critical: true,
  });
  if (!statusPassed) {
    issues.push(`Bus is currently marked as ${bus.status} and cannot operate.`);
  }

  // Check 2: Critical Defects
  const criticalDefects = defects.filter((d) => d.status !== 'resolved' && d.severity === 'critical');
  const defectsPassed = criticalDefects.length === 0;
  checks.push({
    id: 'zero_critical_defects',
    label: 'Critical Safety Defects',
    passed: defectsPassed,
    detail: defectsPassed
      ? 'Zero unresolved critical defects.'
      : `${criticalDefects.length} critical defect(s) unresolved.`,
    critical: true,
  });
  if (!defectsPassed) {
    issues.push(`Critical safety defects pending repair: ${criticalDefects.map((d) => d.description).join('; ')}`);
  }

  // Check 3: Safety Inspection
  const latestInspection = inspections.length > 0 ? inspections[0] : null;
  const inspectionFailed = latestInspection?.result === 'failed';
  const inspectionPassed = !inspectionFailed;
  checks.push({
    id: 'inspection_valid',
    label: 'Safety Inspection Status',
    passed: inspectionPassed,
    detail: inspectionPassed
      ? (latestInspection ? `Passed inspection on ${latestInspection.inspectionDate?.split('T')[0] || 'record'}.` : 'Inspection requirement clear.')
      : 'Latest vehicle inspection was marked FAILED.',
    critical: true,
  });
  if (!inspectionPassed) {
    issues.push('Latest vehicle inspection failed safety criteria.');
  }

  // Check 4: Documentation (Insurance & Registration)
  const expiredDocs = documents.filter((d) => d.status === DOCUMENT_STATUS.EXPIRED);
  const expiringDocs = documents.filter((d) => d.status === DOCUMENT_STATUS.EXPIRING_SOON);
  const docsPassed = expiredDocs.length === 0;

  checks.push({
    id: 'documents_valid',
    label: 'Registration & Insurance Validity',
    passed: docsPassed,
    detail: docsPassed
      ? `${documents.length} document(s) on file; 0 expired.`
      : `${expiredDocs.length} required document(s) expired.`,
    critical: true,
  });
  if (!docsPassed) {
    issues.push(`Expired vehicle documentation: ${expiredDocs.map((d) => d.documentType).join(', ')}.`);
  }
  if (expiringDocs.length > 0) {
    warnings.push(`${expiringDocs.length} document(s) expiring within 30 days.`);
  }

  // Check 5: Passenger Design Capacity
  const hasCapacity = Number(bus.capacity) > 0;
  checks.push({
    id: 'capacity_configured',
    label: 'Passenger Seating Capacity',
    passed: hasCapacity,
    detail: hasCapacity 
      ? `Rated for ${bus.capacity} passenger seats.` 
      : 'Bus capacity is unconfigured or zero.',
    critical: false,
  });
  if (!hasCapacity) {
    warnings.push('Vehicle capacity is not configured.');
  }

  const isReady = issues.length === 0;

  return {
    isReady,
    statusText: isReady ? 'Ready for Assignment' : `Not Ready (${issues.length} issue${issues.length > 1 ? 's' : ''})`,
    checks,
    issues,
    warnings,
  };
};

export const busReadinessService = {
  evaluateBusReadiness,
};

export default busReadinessService;
