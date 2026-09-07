import { describe, it, expect, vi } from 'vitest';
import { ROUTE_REGISTRY } from '../../routes/routeConfig';
import { USER_ROLES } from '../../constants/collections';

describe('Privilege Escalation & Route Clearance Test Suite', () => {
  it('should restrict /super-admin solely to USER_ROLES.SUPER_ADMIN', () => {
    const superAdminRoute = ROUTE_REGISTRY['/super-admin'];
    expect(superAdminRoute).toBeDefined();
    expect(superAdminRoute.roles).toEqual([USER_ROLES.SUPER_ADMIN]);
    expect(superAdminRoute.roles).not.toContain(USER_ROLES.ADMIN);
    expect(superAdminRoute.roles).not.toContain(USER_ROLES.TRANSPORT_MANAGER);
    expect(superAdminRoute.roles).not.toContain(USER_ROLES.DRIVER);
    expect(superAdminRoute.roles).not.toContain(USER_ROLES.PARENT);
    expect(superAdminRoute.roles).not.toContain(USER_ROLES.STUDENT);
  });

  it('should restrict /super-admin/configuration solely to USER_ROLES.SUPER_ADMIN', () => {
    const configRoute = ROUTE_REGISTRY['/super-admin/configuration'];
    expect(configRoute).toBeDefined();
    expect(configRoute.roles).toEqual([USER_ROLES.SUPER_ADMIN]);
    expect(configRoute.roles).not.toContain(USER_ROLES.ADMIN);
  });

  it('should restrict /super-admin/audit-logs solely to USER_ROLES.SUPER_ADMIN', () => {
    const auditRoute = ROUTE_REGISTRY['/super-admin/audit-logs'];
    expect(auditRoute).toBeDefined();
    expect(auditRoute.roles).toEqual([USER_ROLES.SUPER_ADMIN]);
    expect(auditRoute.roles).not.toContain(USER_ROLES.ADMIN);
  });

  it('should restrict /admin solely to ADMIN and TRANSPORT_MANAGER roles', () => {
    const adminRoute = ROUTE_REGISTRY['/admin'];
    expect(adminRoute).toBeDefined();
    expect(adminRoute.roles).toContain(USER_ROLES.ADMIN);
    expect(adminRoute.roles).toContain(USER_ROLES.TRANSPORT_MANAGER);
    expect(adminRoute.roles).not.toContain(USER_ROLES.DRIVER);
    expect(adminRoute.roles).not.toContain(USER_ROLES.PARENT);
    expect(adminRoute.roles).not.toContain(USER_ROLES.STUDENT);
  });

  it('should restrict /driver solely to DRIVER role', () => {
    const driverRoute = ROUTE_REGISTRY['/driver'];
    expect(driverRoute).toBeDefined();
    expect(driverRoute.roles).toEqual([USER_ROLES.DRIVER]);
    expect(driverRoute.roles).not.toContain(USER_ROLES.PARENT);
    expect(driverRoute.roles).not.toContain(USER_ROLES.STUDENT);
  });

  it('should restrict /parent solely to PARENT role', () => {
    const parentRoute = ROUTE_REGISTRY['/parent'];
    expect(parentRoute).toBeDefined();
    expect(parentRoute.roles).toEqual([USER_ROLES.PARENT]);
    expect(parentRoute.roles).not.toContain(USER_ROLES.STUDENT);
    expect(parentRoute.roles).not.toContain(USER_ROLES.DRIVER);
  });

  it('should restrict /student solely to STUDENT role', () => {
    const studentRoute = ROUTE_REGISTRY['/student'];
    expect(studentRoute).toBeDefined();
    expect(studentRoute.roles).toEqual([USER_ROLES.STUDENT]);
    expect(studentRoute.roles).not.toContain(USER_ROLES.PARENT);
    expect(studentRoute.roles).not.toContain(USER_ROLES.DRIVER);
  });
});
