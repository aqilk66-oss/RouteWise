import { describe, it, expect } from 'vitest';
import { USER_ROLES, ROLE_LABELS, USER_STATUS } from '../../constants/collections';
import { PERMISSIONS, ROLE_PERMISSIONS, hasPermission } from '../../constants/permissions';

describe('Role and Permission Security Matrix', () => {
  it('should define all 6 official RouteWise roles', () => {
    expect(USER_ROLES.SUPER_ADMIN).toBe('superAdmin');
    expect(USER_ROLES.ADMIN).toBe('admin');
    expect(USER_ROLES.TRANSPORT_MANAGER).toBe('transportManager');
    expect(USER_ROLES.DRIVER).toBe('driver');
    expect(USER_ROLES.PARENT).toBe('parent');
    expect(USER_ROLES.STUDENT).toBe('student');
  });

  it('should provide clear readable labels for all roles', () => {
    expect(ROLE_LABELS[USER_ROLES.SUPER_ADMIN]).toBe('Super Administrator');
    expect(ROLE_LABELS[USER_ROLES.ADMIN]).toBe('Administrator');
    expect(ROLE_LABELS[USER_ROLES.TRANSPORT_MANAGER]).toBe('Transport Manager');
    expect(ROLE_LABELS[USER_ROLES.DRIVER]).toBe('Bus Driver');
    expect(ROLE_LABELS[USER_ROLES.PARENT]).toBe('Parent / Guardian');
    expect(ROLE_LABELS[USER_ROLES.STUDENT]).toBe('Student');
  });

  it('should define standardized account statuses', () => {
    expect(USER_STATUS.ACTIVE).toBe('active');
    expect(USER_STATUS.INACTIVE).toBe('inactive');
    expect(USER_STATUS.SUSPENDED).toBe('suspended');
    expect(USER_STATUS.PENDING).toBe('pending');
    expect(USER_STATUS.ARCHIVED).toBe('archived');
  });

  it('should grant Super Admin system governance permissions', () => {
    expect(hasPermission(USER_ROLES.SUPER_ADMIN, PERMISSIONS.SYSTEM_CONFIG)).toBe(true);
    expect(hasPermission(USER_ROLES.SUPER_ADMIN, PERMISSIONS.SECURITY_MANAGE)).toBe(true);
    expect(hasPermission(USER_ROLES.SUPER_ADMIN, PERMISSIONS.AUDIT_READ)).toBe(true);
    expect(hasPermission(USER_ROLES.SUPER_ADMIN, PERMISSIONS.SCHOOLS_MANAGE)).toBe(true);
    expect(hasPermission(USER_ROLES.SUPER_ADMIN, PERMISSIONS.USERS_MANAGE)).toBe(true);
  });

  it('should DENY normal admin from privileged system governance', () => {
    expect(hasPermission(USER_ROLES.ADMIN, PERMISSIONS.SYSTEM_CONFIG)).toBe(false);
    expect(hasPermission(USER_ROLES.ADMIN, PERMISSIONS.SECURITY_MANAGE)).toBe(false);
    expect(hasPermission(USER_ROLES.ADMIN, PERMISSIONS.AUDIT_READ)).toBe(false);
    expect(hasPermission(USER_ROLES.ADMIN, PERMISSIONS.SCHOOLS_MANAGE)).toBe(false);
  });

  it('should grant normal admin operational management permissions', () => {
    expect(hasPermission(USER_ROLES.ADMIN, PERMISSIONS.STUDENTS_MANAGE)).toBe(true);
    expect(hasPermission(USER_ROLES.ADMIN, PERMISSIONS.DRIVERS_MANAGE)).toBe(true);
    expect(hasPermission(USER_ROLES.ADMIN, PERMISSIONS.BUSES_MANAGE)).toBe(true);
    expect(hasPermission(USER_ROLES.ADMIN, PERMISSIONS.ROUTES_MANAGE)).toBe(true);
    expect(hasPermission(USER_ROLES.ADMIN, PERMISSIONS.TRIPS_MANAGE)).toBe(true);
    expect(hasPermission(USER_ROLES.ADMIN, PERMISSIONS.SAFETY_MANAGE)).toBe(true);
  });

  it('should strictly limit driver permissions to operational execution', () => {
    expect(hasPermission(USER_ROLES.DRIVER, PERMISSIONS.TRIPS_READ)).toBe(true);
    expect(hasPermission(USER_ROLES.DRIVER, PERMISSIONS.TRACKING_BROADCAST)).toBe(true);
    expect(hasPermission(USER_ROLES.DRIVER, PERMISSIONS.ATTENDANCE_MANAGE)).toBe(true);
    expect(hasPermission(USER_ROLES.DRIVER, PERMISSIONS.SAFETY_MANAGE)).toBe(true);
    expect(hasPermission(USER_ROLES.DRIVER, PERMISSIONS.USERS_MANAGE)).toBe(false);
    expect(hasPermission(USER_ROLES.DRIVER, PERMISSIONS.BUSES_MANAGE)).toBe(false);
    expect(hasPermission(USER_ROLES.DRIVER, PERMISSIONS.ROUTES_MANAGE)).toBe(false);
  });

  it('should strictly limit parent and student permissions to read-only tracking', () => {
    expect(hasPermission(USER_ROLES.PARENT, PERMISSIONS.TRACKING_READ)).toBe(true);
    expect(hasPermission(USER_ROLES.PARENT, PERMISSIONS.TRIPS_MANAGE)).toBe(false);
    expect(hasPermission(USER_ROLES.PARENT, PERMISSIONS.ATTENDANCE_MANAGE)).toBe(false);
    expect(hasPermission(USER_ROLES.STUDENT, PERMISSIONS.TRACKING_READ)).toBe(true);
    expect(hasPermission(USER_ROLES.STUDENT, PERMISSIONS.SAFETY_MANAGE)).toBe(false);
  });
});
