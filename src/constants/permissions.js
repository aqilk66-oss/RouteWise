import { USER_ROLES } from '../constants/collections';

/**
 * RouteWise Centralized Permission Matrix
 * Maps discrete system permissions to user roles.
 */
export const PERMISSIONS = {
  // Super Admin & General Users
  USERS_READ: 'users.read',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  USERS_MANAGE: 'users.manage',
  ADMINS_MANAGE: 'admins.manage',
  ROLES_MANAGE: 'roles.manage',
  SETTINGS_MANAGE: 'settings.manage',
  AUDIT_READ: 'audit.read',

  // Schools & System
  SCHOOLS_READ: 'schools.read',
  SCHOOLS_MANAGE: 'schools.manage',
  SYSTEM_CONFIG: 'system.config',
  SYSTEM_HEALTH: 'system.health',
  SECURITY_MANAGE: 'security.manage',

  // Operational Transport Domain
  BUSES_MANAGE: 'buses.manage',
  BUSES_READ: 'buses.read',
  ROUTES_MANAGE: 'routes.manage',
  ROUTES_READ: 'routes.read',
  STOPS_MANAGE: 'stops.manage',
  DRIVERS_MANAGE: 'drivers.manage',
  DRIVERS_READ: 'drivers.read',
  STUDENTS_MANAGE: 'students.manage',
  STUDENTS_READ: 'students.read',
  PARENTS_MANAGE: 'parents.manage',
  PARENTS_READ: 'parents.read',
  BOOKINGS_MANAGE: 'bookings.manage',
  TRIPS_MANAGE: 'trips.manage',
  TRIPS_READ: 'trips.read',
  TRACKING_READ: 'tracking.read',
  TRACKING_BROADCAST: 'tracking.broadcast',
  REPORTS_READ: 'reports.read',
  REPORTS_EXPORT: 'reports.export',
  SAFETY_MANAGE: 'safety.manage',
  ATTENDANCE_READ: 'attendance.read',
  ATTENDANCE_MANAGE: 'attendance.manage',
  NOTIFICATIONS_READ: 'notifications.read',
  NOTIFICATIONS_BROADCAST: 'notifications.broadcast',

  // Role-Scoped Permissions
  PROFILE_READ_OWN: 'profile.read_own',
  PROFILE_UPDATE_OWN: 'profile.update_own',
  CHILDREN_READ_OWN: 'children.read_own',
  BOOKINGS_READ_OWN: 'bookings.read_own',
  TRACKING_READ_ASSIGNED: 'tracking.read_assigned',
  NOTIFICATIONS_READ_OWN: 'notifications.read_own',
  TRIP_READ_ASSIGNED: 'trip.read_assigned',
  TRIP_UPDATE_ASSIGNED: 'trip.update_assigned',
  LOCATION_UPDATE_OWN: 'location.update_own',
  STUDENTS_READ_ASSIGNED: 'students.read_assigned',
  TRANSPORT_READ_OWN: 'transport.read_own',
  APPLICATIONS_CREATE_OWN: 'applications.create_own',
  APPLICATIONS_READ_OWN: 'applications.read_own',
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [USER_ROLES.ADMIN]: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.STUDENTS_MANAGE,
    PERMISSIONS.STUDENTS_READ,
    PERMISSIONS.PARENTS_MANAGE,
    PERMISSIONS.PARENTS_READ,
    PERMISSIONS.DRIVERS_MANAGE,
    PERMISSIONS.DRIVERS_READ,
    PERMISSIONS.BUSES_MANAGE,
    PERMISSIONS.BUSES_READ,
    PERMISSIONS.ROUTES_MANAGE,
    PERMISSIONS.ROUTES_READ,
    PERMISSIONS.STOPS_MANAGE,
    PERMISSIONS.BOOKINGS_MANAGE,
    PERMISSIONS.TRIPS_MANAGE,
    PERMISSIONS.TRIPS_READ,
    PERMISSIONS.TRACKING_READ,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.SAFETY_MANAGE,
    PERMISSIONS.ATTENDANCE_READ,
    PERMISSIONS.ATTENDANCE_MANAGE,
    PERMISSIONS.NOTIFICATIONS_READ,
    PERMISSIONS.NOTIFICATIONS_BROADCAST,
    PERMISSIONS.SCHOOLS_READ,
    PERMISSIONS.PROFILE_READ_OWN,
    PERMISSIONS.PROFILE_UPDATE_OWN,
  ],
  [USER_ROLES.PARENT]: [
    PERMISSIONS.PROFILE_READ_OWN,
    PERMISSIONS.PROFILE_UPDATE_OWN,
    PERMISSIONS.CHILDREN_READ_OWN,
    PERMISSIONS.BOOKINGS_READ_OWN,
    PERMISSIONS.TRACKING_READ_ASSIGNED,
    PERMISSIONS.TRACKING_READ,
    PERMISSIONS.NOTIFICATIONS_READ_OWN,
    PERMISSIONS.NOTIFICATIONS_READ,
  ],
  [USER_ROLES.DRIVER]: [
    PERMISSIONS.PROFILE_READ_OWN,
    PERMISSIONS.TRIPS_READ,
    PERMISSIONS.TRIP_READ_ASSIGNED,
    PERMISSIONS.TRIP_UPDATE_ASSIGNED,
    PERMISSIONS.LOCATION_UPDATE_OWN,
    PERMISSIONS.STUDENTS_READ_ASSIGNED,
    PERMISSIONS.TRACKING_READ,
    PERMISSIONS.TRACKING_BROADCAST,
    PERMISSIONS.ATTENDANCE_MANAGE,
    PERMISSIONS.ATTENDANCE_READ,
    PERMISSIONS.NOTIFICATIONS_READ,
    PERMISSIONS.SAFETY_MANAGE,
  ],
  [USER_ROLES.STUDENT]: [
    PERMISSIONS.PROFILE_READ_OWN,
    PERMISSIONS.TRANSPORT_READ_OWN,
    PERMISSIONS.TRACKING_READ_ASSIGNED,
    PERMISSIONS.TRACKING_READ,
    PERMISSIONS.NOTIFICATIONS_READ_OWN,
    PERMISSIONS.NOTIFICATIONS_READ,
  ],
  [USER_ROLES.USER]: [
    PERMISSIONS.PROFILE_READ_OWN,
    PERMISSIONS.PROFILE_UPDATE_OWN,
    PERMISSIONS.APPLICATIONS_CREATE_OWN,
    PERMISSIONS.APPLICATIONS_READ_OWN,
  ],
};

/**
 * Checks if a given role has a required permission
 */
export function hasPermission(role, permission) {
  if (!role || !permission) return false;
  // Support legacy or snake_case super_admin
  if (role === USER_ROLES.SUPER_ADMIN || role === 'superAdmin') return true;
  const normalizedRole = role === 'transportManager' ? USER_ROLES.ADMIN : role;
  const perms = ROLE_PERMISSIONS[normalizedRole] || [];
  return perms.includes(permission);
}
