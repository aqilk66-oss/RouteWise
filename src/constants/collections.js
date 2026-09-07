/**
 * RouteWise Core Firestore Domain Constants & Controlled Status Vocabularies
 */

export const COLLECTIONS = {
  USERS: 'users',
  STUDENTS: 'students',
  PARENTS: 'parents',
  DRIVERS: 'drivers',
  BUSES: 'buses',
  ROUTES: 'routes',
  STOPS: 'stops',
  TRIPS: 'trips',
  NOTIFICATIONS: 'notifications',
  ATTENDANCE: 'attendance',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  SCHOOLS: 'schools',
  AUDIT_LOGS: 'auditLogs',
  SYSTEM_CONFIG: 'systemConfig',
  SCHEDULES: 'schedules',
  MAINTENANCE_RECORDS: 'maintenanceRecords',
  VEHICLE_INSPECTIONS: 'vehicleInspections',
  VEHICLE_DOCUMENTS: 'vehicleDocuments',
  DEFECTS: 'defects',
  BACKUP_MANIFESTS: 'backupManifests',
  RECOVERY_BIN: 'recoveryBin',
};

// Backup and Disaster Recovery Statuses
export const BACKUP_STATUS = {
  QUEUED: 'queued',
  RUNNING: 'running',
  COMPLETED: 'completed',
  PARTIAL: 'partial',
  FAILED: 'failed',
  VERIFIED: 'verified',
};

export const BACKUP_SCOPE = {
  FULL_SYSTEM: 'full_system',
  OPERATIONAL_FIRESTORE: 'operational_firestore',
  CONFIGURATION_ONLY: 'configuration_only',
  AUDIT_LEDGER: 'audit_ledger',
  STORAGE_METADATA: 'storage_metadata',
};

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  PARENT: 'parent',
  DRIVER: 'driver',
  STUDENT: 'student',
  USER: 'user',
  // Backward compatibility alias during migration
  TRANSPORT_MANAGER: 'admin',
};

export const DEFAULT_ROLE = USER_ROLES.USER;

export const PRIVILEGED_ROLES = [
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.ADMIN,
  USER_ROLES.DRIVER,
];

export const ROLE_LABELS = {
  [USER_ROLES.SUPER_ADMIN]: 'Super Administrator',
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.PARENT]: 'Parent / Guardian',
  [USER_ROLES.DRIVER]: 'Bus Driver',
  [USER_ROLES.STUDENT]: 'Student',
  [USER_ROLES.USER]: 'Normal User',
};

// Account Status Vocabularies
export const USER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
  DISABLED: 'disabled',
  // Backward compatibility aliases
  INACTIVE: 'disabled',
  ARCHIVED: 'disabled',
};

// Bus Operational Statuses (Standardized Lifecycle)
export const BUS_STATUS = {
  AVAILABLE: 'available',
  ASSIGNED: 'assigned',
  IN_SERVICE: 'inService',
  MAINTENANCE: 'maintenance',
  INSPECTION_REQUIRED: 'inspectionRequired',
  OUT_OF_SERVICE: 'outOfService',
  RETIRED: 'retired',
  // Backward compatibility alias
  ACTIVE: 'available',
  INACTIVE: 'outOfService',
};

// Maintenance Record Statuses
export const MAINTENANCE_STATUS = {
  REPORTED: 'reported',
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'inProgress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Maintenance & Defect Priorities
export const MAINTENANCE_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// Vehicle Inspection Results
export const INSPECTION_RESULT = {
  PASSED: 'passed',
  PASSED_WITH_ISSUES: 'passedWithIssues',
  FAILED: 'failed',
  PENDING: 'pending',
};

// Vehicle Document Expiry Statuses
export const DOCUMENT_STATUS = {
  VALID: 'valid',
  EXPIRING_SOON: 'expiringSoon',
  EXPIRED: 'expired',
  MISSING: 'missing',
};

// Route Statuses
export const ROUTE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DRAFT: 'draft',
  ARCHIVED: 'archived',
};

// Stop Statuses
export const STOP_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SKIPPED: 'skipped',
};

// Trip Operational Statuses
export const TRIP_STATUS = {
  SCHEDULED: 'scheduled',
  READY: 'ready',
  IN_PROGRESS: 'inProgress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DELAYED: 'delayed',
};

// Attendance Statuses
export const ATTENDANCE_STATUS = {
  BOARDED: 'boarded',
  ABSENT: 'absent',
  DROPPED_OFF: 'droppedOff',
  NOT_RECORDED: 'notRecorded',
};

// Notification Types
export const NOTIFICATION_TYPE = {
  TRIP: 'trip',
  ARRIVAL: 'arrival',
  DELAY: 'delay',
  CANCELLATION: 'cancellation',
  SAFETY: 'safety',
  SCHEDULE: 'schedule',
  ROUTE: 'route',
  SYSTEM: 'system',
  GENERAL: 'general',
};

// Notification Priority
export const NOTIFICATION_PRIORITY = {
  NORMAL: 'normal',
  IMPORTANT: 'important',
  URGENT: 'urgent',
};

// Common Statuses
export const RECORD_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
};
