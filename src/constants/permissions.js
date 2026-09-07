import { USER_ROLES } from '../constants/collections';

/**
 * RouteWise Centralized Permission Matrix
 * Maps discrete system permissions to user roles.
 */
export const PERMISSIONS = {
  // User Management
  USERS_READ: 'users.read',
  USERS_MANAGE: 'users.manage',
  USERS_STATUS: 'users.status',

  // Role Governance
  ROLES_READ: 'roles.read',
  ROLES_MANAGE: 'roles.manage',

  // Institution & School Scoping
  SCHOOLS_READ: 'schools.read',
  SCHOOLS_MANAGE: 'schools.manage',

  // Transport Operational Domain
  STUDENTS_READ: 'students.read',
  STUDENTS_MANAGE: 'students.manage',
  DRIVERS_READ: 'drivers.read',
  DRIVERS_MANAGE: 'drivers.manage',
  BUSES_READ: 'buses.read',
  BUSES_MANAGE: 'buses.manage',
  ROUTES_READ: 'routes.read',
  ROUTES_MANAGE: 'routes.manage',
  TRIPS_READ: 'trips.read',
  TRIPS_MANAGE: 'trips.manage',
  TRACKING_READ: 'tracking.read',
  TRACKING_BROADCAST: 'tracking.broadcast',
  ATTENDANCE_READ: 'attendance.read',
  ATTENDANCE_MANAGE: 'attendance.manage',

  // Communications & Analytics
  NOTIFICATIONS_READ: 'notifications.read',
  NOTIFICATIONS_BROADCAST: 'notifications.broadcast',
  REPORTS_READ: 'reports.read',
  REPORTS_EXPORT: 'reports.export',
  SAFETY_MANAGE: 'safety.manage',
  SETTINGS_MANAGE: 'settings.manage',

  // System Governance & Audit
  AUDIT_READ: 'audit.read',
  SYSTEM_CONFIG: 'system.config',
  SYSTEM_HEALTH: 'system.health',
  SECURITY_MANAGE: 'security.manage',
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS), // Super Admin possesses all permissions
  [USER_ROLES.ADMIN]: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.SCHOOLS_READ,
    PERMISSIONS.STUDENTS_READ,
    PERMISSIONS.STUDENTS_MANAGE,
    PERMISSIONS.DRIVERS_READ,
    PERMISSIONS.DRIVERS_MANAGE,
    PERMISSIONS.BUSES_READ,
    PERMISSIONS.BUSES_MANAGE,
    PERMISSIONS.ROUTES_READ,
    PERMISSIONS.ROUTES_MANAGE,
    PERMISSIONS.TRIPS_READ,
    PERMISSIONS.TRIPS_MANAGE,
    PERMISSIONS.TRACKING_READ,
    PERMISSIONS.ATTENDANCE_READ,
    PERMISSIONS.ATTENDANCE_MANAGE,
    PERMISSIONS.NOTIFICATIONS_READ,
    PERMISSIONS.NOTIFICATIONS_BROADCAST,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.SAFETY_MANAGE,
    PERMISSIONS.SETTINGS_MANAGE,
  ],
  [USER_ROLES.TRANSPORT_MANAGER]: [
    PERMISSIONS.STUDENTS_READ,
    PERMISSIONS.DRIVERS_READ,
    PERMISSIONS.BUSES_READ,
    PERMISSIONS.BUSES_MANAGE,
    PERMISSIONS.ROUTES_READ,
    PERMISSIONS.ROUTES_MANAGE,
    PERMISSIONS.TRIPS_READ,
    PERMISSIONS.TRIPS_MANAGE,
    PERMISSIONS.TRACKING_READ,
    PERMISSIONS.ATTENDANCE_READ,
    PERMISSIONS.ATTENDANCE_MANAGE,
    PERMISSIONS.NOTIFICATIONS_READ,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.SAFETY_MANAGE,
  ],
  [USER_ROLES.DRIVER]: [
    PERMISSIONS.TRIPS_READ,
    PERMISSIONS.TRACKING_READ,
    PERMISSIONS.TRACKING_BROADCAST,
    PERMISSIONS.ATTENDANCE_READ,
    PERMISSIONS.ATTENDANCE_MANAGE,
    PERMISSIONS.NOTIFICATIONS_READ,
    PERMISSIONS.SAFETY_MANAGE,
  ],
  [USER_ROLES.PARENT]: [
    PERMISSIONS.STUDENTS_READ,
    PERMISSIONS.TRIPS_READ,
    PERMISSIONS.TRACKING_READ,
    PERMISSIONS.ATTENDANCE_READ,
    PERMISSIONS.NOTIFICATIONS_READ,
  ],
  [USER_ROLES.STUDENT]: [
    PERMISSIONS.TRIPS_READ,
    PERMISSIONS.TRACKING_READ,
    PERMISSIONS.ATTENDANCE_READ,
    PERMISSIONS.NOTIFICATIONS_READ,
  ],
};

/**
 * Checks if a given role has a required permission
 */
export function hasPermission(role, permission) {
  if (!role || !permission) return false;
  if (role === USER_ROLES.SUPER_ADMIN) return true;
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes(permission);
}
