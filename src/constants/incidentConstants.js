/**
 * RouteWise Controlled Incident & Emergency Constants
 */

export const INCIDENT_TYPES = {
  EMERGENCY: 'emergency',
  ACCIDENT: 'accident',
  MEDICAL: 'medical',
  VEHICLE_ISSUE: 'vehicleIssue',
  ROAD_HAZARD: 'roadHazard',
  SECURITY: 'security',
  DELAY: 'delay',
  OTHER: 'other',
};

export const INCIDENT_TYPE_LABELS = {
  [INCIDENT_TYPES.EMERGENCY]: 'SOS / Emergency',
  [INCIDENT_TYPES.ACCIDENT]: 'Traffic Collision / Accident',
  [INCIDENT_TYPES.MEDICAL]: 'Medical Emergency',
  [INCIDENT_TYPES.VEHICLE_ISSUE]: 'Mechanical / Vehicle Fault',
  [INCIDENT_TYPES.ROAD_HAZARD]: 'Road Hazard / Obstruction',
  [INCIDENT_TYPES.SECURITY]: 'Security / Safety Concern',
  [INCIDENT_TYPES.DELAY]: 'Severe Route Delay',
  [INCIDENT_TYPES.OTHER]: 'Other Incident',
};

export const INCIDENT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

export const INCIDENT_SEVERITY_LABELS = {
  [INCIDENT_SEVERITY.LOW]: 'Low',
  [INCIDENT_SEVERITY.MEDIUM]: 'Medium',
  [INCIDENT_SEVERITY.HIGH]: 'High',
  [INCIDENT_SEVERITY.CRITICAL]: 'Critical',
};

export const INCIDENT_STATUS = {
  REPORTED: 'reported',
  ACKNOWLEDGED: 'acknowledged',
  INVESTIGATING: 'investigating',
  RESPONDING: 'responding',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  CANCELLED: 'cancelled',
};

export const INCIDENT_STATUS_LABELS = {
  [INCIDENT_STATUS.REPORTED]: 'Reported',
  [INCIDENT_STATUS.ACKNOWLEDGED]: 'Acknowledged',
  [INCIDENT_STATUS.INVESTIGATING]: 'Investigating',
  [INCIDENT_STATUS.RESPONDING]: 'Responding',
  [INCIDENT_STATUS.RESOLVED]: 'Resolved',
  [INCIDENT_STATUS.CLOSED]: 'Closed',
  [INCIDENT_STATUS.CANCELLED]: 'Cancelled',
};

export const INCIDENT_SOURCES = {
  DRIVER: 'driver',
  ADMIN: 'admin',
  TRANSPORT_MANAGER: 'transportManager',
  SYSTEM: 'system',
};

/**
 * Valid Status Transitions Matrix
 */
export const ALLOWED_STATUS_TRANSITIONS = {
  [INCIDENT_STATUS.REPORTED]: [
    INCIDENT_STATUS.ACKNOWLEDGED,
    INCIDENT_STATUS.INVESTIGATING,
    INCIDENT_STATUS.CANCELLED,
  ],
  [INCIDENT_STATUS.ACKNOWLEDGED]: [
    INCIDENT_STATUS.INVESTIGATING,
    INCIDENT_STATUS.RESPONDING,
    INCIDENT_STATUS.RESOLVED,
    INCIDENT_STATUS.CANCELLED,
  ],
  [INCIDENT_STATUS.INVESTIGATING]: [
    INCIDENT_STATUS.RESPONDING,
    INCIDENT_STATUS.RESOLVED,
    INCIDENT_STATUS.CANCELLED,
  ],
  [INCIDENT_STATUS.RESPONDING]: [
    INCIDENT_STATUS.RESOLVED,
    INCIDENT_STATUS.INVESTIGATING,
  ],
  [INCIDENT_STATUS.RESOLVED]: [
    INCIDENT_STATUS.CLOSED,
    INCIDENT_STATUS.INVESTIGATING, // Re-open if necessary
  ],
  [INCIDENT_STATUS.CLOSED]: [],
  [INCIDENT_STATUS.CANCELLED]: [],
};

/**
 * Safety Disclosure Notice for UI
 */
export const EMERGENCY_DISCLAIMER = 'RouteWise is a school transportation coordination system and is not an emergency dispatch service. For life-threatening emergencies or immediate physical danger, dial 911 or your local emergency services directly.';
