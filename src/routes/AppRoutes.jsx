import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Loader from '../components/ui/Loader';
import { ProtectedRoute, RoleRoute, PublicRoute, SuperAdminRoute } from './RouteGuards';
import { USER_ROLES } from '../constants/collections';
import { ParentTransportProvider } from '../context/ParentTransportContext';
import { DriverTransportProvider } from '../context/DriverTransportContext';
import { StudentTransportProvider } from '../context/StudentTransportContext';
import usePageTitle from '../hooks/usePageTitle';

// Lazy loaded page components
const HomePage = lazy(() => import('../pages/HomePage'));
const FeaturesPage = lazy(() => import('../pages/public/FeaturesPage'));
const LiveTrackingPage = lazy(() => import('../pages/public/LiveTrackingPage'));
const SafetyPage = lazy(() => import('../pages/public/SafetyPage'));
const PrivacyPage = lazy(() => import('../pages/public/PrivacyPage'));
const TermsPage = lazy(() => import('../pages/public/TermsPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const UserDashboardPage = lazy(() => import('../pages/user/UserDashboardPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('../pages/UnauthorizedPage'));

// Super Admin Governance Sub-Routes
const SuperAdminDashboardPage = lazy(() => import('../pages/superadmin/SuperAdminDashboardPage'));
const SuperAdminUsersPage = lazy(() => import('../pages/superadmin/SuperAdminUsersPage'));
const SuperAdminUserDetailPage = lazy(() => import('../pages/superadmin/SuperAdminUserDetailPage'));
const SuperAdminRolesPage = lazy(() => import('../pages/superadmin/SuperAdminRolesPage'));
const SuperAdminSchoolsPage = lazy(() => import('../pages/superadmin/SuperAdminSchoolsPage'));
const SuperAdminConfigPage = lazy(() => import('../pages/superadmin/SuperAdminConfigPage'));
const SuperAdminNotificationsPage = lazy(() => import('../pages/superadmin/SuperAdminNotificationsPage'));
const SuperAdminAuditLogsPage = lazy(() => import('../pages/superadmin/SuperAdminAuditLogsPage'));
const SuperAdminSecurityPage = lazy(() => import('../pages/superadmin/SuperAdminSecurityPage'));
const SuperAdminSystemHealthPage = lazy(() => import('../pages/superadmin/SuperAdminSystemHealthPage'));
const SuperAdminActivityPage = lazy(() => import('../pages/superadmin/SuperAdminActivityPage'));
const SuperAdminProfilePage = lazy(() => import('../pages/superadmin/SuperAdminProfilePage'));
const SuperAdminSettingsPage = lazy(() => import('../pages/superadmin/SuperAdminSettingsPage'));
const SuperAdminBackupsPage = lazy(() => import('../pages/superadmin/SuperAdminBackupsPage'));
const SuperAdminBackupDetailPage = lazy(() => import('../pages/superadmin/SuperAdminBackupDetailPage'));
const SuperAdminRecoveryPage = lazy(() => import('../pages/superadmin/SuperAdminRecoveryPage'));

// Admin & Transport Manager Sub-Routes
const AdminOverviewPage = lazy(() => import('../pages/admin/AdminOverviewPage'));
const AdminAttendancePage = lazy(() => import('../pages/admin/AdminAttendancePage'));
const StudentsManagementPage = lazy(() => import('../pages/admin/StudentsManagementPage'));
const ParentsManagementPage = lazy(() => import('../pages/admin/ParentsManagementPage'));
const DriversManagementPage = lazy(() => import('../pages/admin/DriversManagementPage'));
const BusesManagementPage = lazy(() => import('../pages/admin/BusesManagementPage'));
const RoutesManagementPage = lazy(() => import('../pages/admin/RoutesManagementPage'));
const StopsManagementPage = lazy(() => import('../pages/admin/StopsManagementPage'));
const TripsManagementPage = lazy(() => import('../pages/admin/TripsManagementPage'));
const NotificationsPage = lazy(() => import('../pages/admin/NotificationsPage'));
const ReportsPage = lazy(() => import('../pages/admin/ReportsPage'));
const TripReportsPage = lazy(() => import('../pages/admin/reports/TripReportsPage'));
const AttendanceReportsPage = lazy(() => import('../pages/admin/reports/AttendanceReportsPage'));
const BusReportsPage = lazy(() => import('../pages/admin/reports/BusReportsPage'));
const RouteReportsPage = lazy(() => import('../pages/admin/reports/RouteReportsPage'));
const DriverReportsPage = lazy(() => import('../pages/admin/reports/DriverReportsPage'));
const StudentReportsPage = lazy(() => import('../pages/admin/reports/StudentReportsPage'));
const SettingsPage = lazy(() => import('../pages/admin/SettingsPage'));
const AdminProfilePage = lazy(() => import('../pages/admin/settings/AdminProfilePage'));
const TransportSettingsPage = lazy(() => import('../pages/admin/settings/TransportSettingsPage'));
const NotificationSettingsPage = lazy(() => import('../pages/admin/settings/NotificationSettingsPage'));
const SystemSettingsPage = lazy(() => import('../pages/admin/settings/SystemSettingsPage'));
const SecuritySettingsPage = lazy(() => import('../pages/admin/settings/SecuritySettingsPage'));
const AdminTrackingPage = lazy(() => import('../pages/admin/AdminTrackingPage'));
const AdminSafetyPage = lazy(() => import('../pages/admin/safety/AdminSafetyPage'));
const AdminIncidentsPage = lazy(() => import('../pages/admin/safety/AdminIncidentsPage'));
const AdminIncidentDetailPage = lazy(() => import('../pages/admin/safety/AdminIncidentDetailPage'));
const EmergencyContactsPage = lazy(() => import('../pages/admin/safety/EmergencyContactsPage'));

// Stage 22 Transport Planning & Scheduling Pages
const PlanningOverviewPage = lazy(() => import('../pages/admin/planning/PlanningOverviewPage'));
const RoutesPlanningListPage = lazy(() => import('../pages/admin/planning/RoutesPlanningListPage'));
const RouteCreatePage = lazy(() => import('../pages/admin/planning/RouteCreatePage'));
const RoutePlanningDetailPage = lazy(() => import('../pages/admin/planning/RoutePlanningDetailPage'));
const SchedulePlanningPage = lazy(() => import('../pages/admin/planning/SchedulePlanningPage'));
const TripGenerationPage = lazy(() => import('../pages/admin/planning/TripGenerationPage'));

// Stage 23 Fleet Operations & Compliance Pages
const FleetDashboardPage = lazy(() => import('../pages/admin/fleet/FleetDashboardPage'));
const BusDetailHubPage = lazy(() => import('../pages/admin/fleet/BusDetailHubPage'));
const FleetMaintenancePage = lazy(() => import('../pages/admin/fleet/FleetMaintenancePage'));
const FleetInspectionsPage = lazy(() => import('../pages/admin/fleet/FleetInspectionsPage'));
const FleetDocumentsPage = lazy(() => import('../pages/admin/fleet/FleetDocumentsPage'));
const FleetCompliancePage = lazy(() => import('../pages/admin/fleet/FleetCompliancePage'));
const DriverVehicleHubPage = lazy(() => import('../pages/driver/fleet/DriverVehicleHubPage'));
const DriverPreTripInspectionPage = lazy(() => import('../pages/driver/fleet/DriverPreTripInspectionPage'));
const DriverIssueReportPage = lazy(() => import('../pages/driver/fleet/DriverIssueReportPage'));

// Stage 25 Transport Analytics & Operational Intelligence Pages
const AnalyticsOverviewPage = lazy(() => import('../pages/admin/analytics/AnalyticsOverviewPage'));
const RouteAnalyticsPage = lazy(() => import('../pages/admin/analytics/RouteAnalyticsPage'));
const TripAnalyticsPage = lazy(() => import('../pages/admin/analytics/TripAnalyticsPage'));
const FleetAnalyticsPage = lazy(() => import('../pages/admin/analytics/FleetAnalyticsPage'));
const AttendanceAnalyticsPage = lazy(() => import('../pages/admin/analytics/AttendanceAnalyticsPage'));
const SafetyAnalyticsPage = lazy(() => import('../pages/admin/analytics/SafetyAnalyticsPage'));
const CommunicationAnalyticsPage = lazy(() => import('../pages/admin/analytics/CommunicationAnalyticsPage'));
const SuperAdminAnalyticsPage = lazy(() => import('../pages/superadmin/SuperAdminAnalyticsPage'));

// Parent Portal Sub-Routes
const ParentOverviewPage = lazy(() => import('../pages/parent/ParentOverviewPage'));
const ParentAttendancePage = lazy(() => import('../pages/parent/ParentAttendancePage'));
const ChildrenProfilePage = lazy(() => import('../pages/parent/ChildrenProfilePage'));
const TrackingPage = lazy(() => import('../pages/parent/TrackingPage'));
const ParentTripsPage = lazy(() => import('../pages/parent/ParentTripsPage'));
const ParentNotificationsPage = lazy(() => import('../pages/parent/ParentNotificationsPage'));
const ParentProfilePage = lazy(() => import('../pages/parent/ParentProfilePage'));
const ParentSettingsPage = lazy(() => import('../pages/parent/ParentSettingsPage'));
const ParentSafetyPage = lazy(() => import('../pages/parent/ParentSafetyPage'));

// Driver Portal MPA Sub-Routes
const DriverOverviewPage = lazy(() => import('../pages/driver/DriverOverviewPage'));
const DriverAttendancePage = lazy(() => import('../pages/driver/DriverAttendancePage'));
const DriverTrackingPage = lazy(() => import('../pages/driver/DriverTrackingPage'));
const DriverTripsPage = lazy(() => import('../pages/driver/DriverTripsPage'));
const DriverTripDetailPage = lazy(() => import('../pages/driver/DriverTripDetailPage'));
const DriverRoutePage = lazy(() => import('../pages/driver/DriverRoutePage'));
const DriverStudentsPage = lazy(() => import('../pages/driver/DriverStudentsPage'));
const DriverNotificationsPage = lazy(() => import('../pages/driver/DriverNotificationsPage'));
const DriverProfilePage = lazy(() => import('../pages/driver/DriverProfilePage'));
const DriverSettingsPage = lazy(() => import('../pages/driver/DriverSettingsPage'));
const DriverSafetyPage = lazy(() => import('../pages/driver/DriverSafetyPage'));
const DriverEmergencyPage = lazy(() => import('../pages/driver/DriverEmergencyPage'));
const DriverIncidentsPage = lazy(() => import('../pages/driver/DriverIncidentsPage'));

// Student Portal MPA Sub-Routes
const StudentOverviewPage = lazy(() => import('../pages/student/StudentOverviewPage'));
const StudentAttendancePage = lazy(() => import('../pages/student/StudentAttendancePage'));
const StudentTransportPage = lazy(() => import('../pages/student/StudentTransportPage'));
const StudentTripsPage = lazy(() => import('../pages/student/StudentTripsPage'));
const StudentTripDetailPage = lazy(() => import('../pages/student/StudentTripDetailPage'));
const StudentNotificationsPage = lazy(() => import('../pages/student/StudentNotificationsPage'));
const StudentProfilePage = lazy(() => import('../pages/student/StudentProfilePage'));
const StudentSettingsPage = lazy(() => import('../pages/student/StudentSettingsPage'));
const StudentSafetyPage = lazy(() => import('../pages/student/StudentSafetyPage'));

// Context wrapper for parent subroutes
const ParentRouteWrapper = () => (
  <ParentTransportProvider>
    <Outlet />
  </ParentTransportProvider>
);

// Context wrapper for driver subroutes
const DriverRouteWrapper = () => (
  <DriverTransportProvider>
    <Outlet />
  </DriverTransportProvider>
);

// Context wrapper for student subroutes
const StudentRouteWrapper = () => (
  <StudentTransportProvider>
    <Outlet />
  </StudentTransportProvider>
);

export const AppRoutes = () => {
  // Synchronize document.title across all public and protected routes
  usePageTitle();

  return (
    <Suspense fallback={<Loader variant="page" text="Loading RouteWise portal..." />}>
      <Routes>
        {/* Public Marketing & Legal MPA Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/tracking" element={<LiveTrackingPage />} />
        <Route path="/safety" element={<SafetyPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />

        {/* Public Auth Routes (Redirects to /dashboard if already logged in) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Security & Error Routes */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/404" element={<NotFoundPage />} />

        {/* Protected Dashboard Route Group */}
        <Route element={<ProtectedRoute />}>
          {/* Smart role redirection root */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Super Admin Protected Governance Routes (/super-admin/* and /admin/super-admin/*) */}
          <Route element={<SuperAdminRoute />}>
            <Route path="/super-admin" element={<SuperAdminDashboardPage />} />
            <Route path="/admin/super-admin" element={<SuperAdminDashboardPage />} />
            <Route path="/super-admin/users" element={<SuperAdminUsersPage />} />
            <Route path="/super-admin/users/:userId" element={<SuperAdminUserDetailPage />} />
            <Route path="/super-admin/roles" element={<SuperAdminRolesPage />} />
            <Route path="/super-admin/schools" element={<SuperAdminSchoolsPage />} />
            <Route path="/super-admin/configuration" element={<SuperAdminConfigPage />} />
            <Route path="/super-admin/notifications" element={<SuperAdminNotificationsPage />} />
            <Route path="/super-admin/audit-logs" element={<SuperAdminAuditLogsPage />} />
            <Route path="/super-admin/security" element={<SuperAdminSecurityPage />} />
            <Route path="/super-admin/system-health" element={<SuperAdminSystemHealthPage />} />
            <Route path="/super-admin/activity" element={<SuperAdminActivityPage />} />
            {/* Stage 25 Super Admin Analytics Sub-Routes */}
            <Route path="/super-admin/analytics" element={<SuperAdminAnalyticsPage />} />
            <Route path="/super-admin/analytics/overview" element={<SuperAdminAnalyticsPage />} />
            <Route path="/super-admin/analytics/routes" element={<RouteAnalyticsPage />} />
            <Route path="/super-admin/analytics/trips" element={<TripAnalyticsPage />} />
            <Route path="/super-admin/analytics/fleet" element={<FleetAnalyticsPage />} />
            <Route path="/super-admin/analytics/attendance" element={<AttendanceAnalyticsPage />} />
            <Route path="/super-admin/analytics/safety" element={<SafetyAnalyticsPage />} />
            <Route path="/super-admin/analytics/communication" element={<CommunicationAnalyticsPage />} />
            {/* Stage 26 Backup & Disaster Recovery Sub-Routes */}
            <Route path="/super-admin/backups" element={<SuperAdminBackupsPage />} />
            <Route path="/super-admin/backups/:backupId" element={<SuperAdminBackupDetailPage />} />
            <Route path="/super-admin/recovery" element={<SuperAdminRecoveryPage />} />
            <Route path="/super-admin/profile" element={<SuperAdminProfilePage />} />
            <Route path="/super-admin/settings" element={<SuperAdminSettingsPage />} />
            <Route path="/super-admin/404" element={<NotFoundPage />} />
          </Route>

          {/* Normal User Protected Routes (/user/*) */}
          <Route element={<RoleRoute allowedRoles={[USER_ROLES.USER]} />}>
            <Route path="/user" element={<UserDashboardPage />} />
            <Route path="/user/dashboard" element={<UserDashboardPage />} />
          </Route>

          {/* Admin & Transport Manager Protected Routes (/admin/*) */}
          <Route element={<RoleRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.TRANSPORT_MANAGER]} />}>
            <Route path="/admin" element={<AdminOverviewPage />} />
            <Route path="/admin/attendance" element={<AdminAttendancePage />} />
            <Route path="/admin/tracking" element={<AdminTrackingPage />} />
            <Route path="/admin/students" element={<StudentsManagementPage />} />
            <Route path="/admin/parents" element={<ParentsManagementPage />} />
            <Route path="/admin/drivers" element={<DriversManagementPage />} />
            <Route path="/admin/buses" element={<BusesManagementPage />} />
            <Route path="/admin/routes" element={<RoutesManagementPage />} />
            <Route path="/admin/stops" element={<StopsManagementPage />} />
            <Route path="/admin/trips" element={<TripsManagementPage />} />
            <Route path="/admin/notifications" element={<NotificationsPage />} />
            <Route path="/admin/reports" element={<ReportsPage />} />
            <Route path="/admin/reports/overview" element={<ReportsPage />} />
            <Route path="/admin/reports/trips" element={<TripReportsPage />} />
            <Route path="/admin/reports/attendance" element={<AttendanceReportsPage />} />
            <Route path="/admin/reports/buses" element={<BusReportsPage />} />
            <Route path="/admin/reports/routes" element={<RouteReportsPage />} />
            <Route path="/admin/reports/drivers" element={<DriverReportsPage />} />
            <Route path="/admin/reports/students" element={<StudentReportsPage />} />
            <Route path="/admin/settings" element={<SettingsPage />} />
            <Route path="/admin/settings/profile" element={<AdminProfilePage />} />
            <Route path="/admin/settings/transport" element={<TransportSettingsPage />} />
            <Route path="/admin/settings/notifications" element={<NotificationSettingsPage />} />
            <Route path="/admin/settings/system" element={<SystemSettingsPage />} />
            <Route path="/admin/settings/security" element={<SecuritySettingsPage />} />

            {/* Safety & Emergency Sub-Routes */}
            <Route path="/admin/safety" element={<AdminSafetyPage />} />
            <Route path="/admin/emergency" element={<AdminSafetyPage />} />
            <Route path="/admin/incidents" element={<AdminIncidentsPage />} />
            <Route path="/admin/incidents/:incidentId" element={<AdminIncidentDetailPage />} />
            <Route path="/admin/emergency-contacts" element={<EmergencyContactsPage />} />

            {/* Stage 22 Transport Planning & Scheduling Routes */}
            <Route path="/admin/planning" element={<PlanningOverviewPage />} />
            <Route path="/admin/planning/routes" element={<RoutesPlanningListPage />} />
            <Route path="/admin/planning/routes/new" element={<RouteCreatePage />} />
            <Route path="/admin/planning/routes/:routeId" element={<RoutePlanningDetailPage />} />
            <Route path="/admin/planning/routes/:routeId/edit" element={<RoutePlanningDetailPage />} />
            <Route path="/admin/planning/schedules" element={<SchedulePlanningPage />} />
            <Route path="/admin/planning/trips" element={<TripGenerationPage />} />

            {/* Stage 23 Fleet Operations & Compliance Routes */}
            <Route path="/admin/fleet" element={<FleetDashboardPage />} />
            <Route path="/admin/fleet/buses" element={<BusesManagementPage />} />
            <Route path="/admin/fleet/buses/:busId" element={<BusDetailHubPage />} />
            <Route path="/admin/fleet/buses/:busId/edit" element={<BusDetailHubPage />} />
            <Route path="/admin/fleet/maintenance" element={<FleetMaintenancePage />} />
            <Route path="/admin/fleet/maintenance/:recordId" element={<FleetMaintenancePage />} />
            <Route path="/admin/fleet/inspections" element={<FleetInspectionsPage />} />
            <Route path="/admin/fleet/inspections/:inspectionId" element={<FleetInspectionsPage />} />
            <Route path="/admin/fleet/documents" element={<FleetDocumentsPage />} />
            <Route path="/admin/fleet/compliance" element={<FleetCompliancePage />} />

            {/* Stage 25 Analytics & Operational Intelligence Sub-Routes */}
            <Route path="/admin/analytics" element={<AnalyticsOverviewPage />} />
            <Route path="/admin/analytics/overview" element={<AnalyticsOverviewPage />} />
            <Route path="/admin/analytics/routes" element={<RouteAnalyticsPage />} />
            <Route path="/admin/analytics/trips" element={<TripAnalyticsPage />} />
            <Route path="/admin/analytics/fleet" element={<FleetAnalyticsPage />} />
            <Route path="/admin/analytics/attendance" element={<AttendanceAnalyticsPage />} />
            <Route path="/admin/analytics/safety" element={<SafetyAnalyticsPage />} />

            {/* Transport Manager Mirror Route Redirects */}
            <Route path="/transport" element={<Navigate to="/admin" replace />} />
            <Route path="/transport/attendance" element={<Navigate to="/admin/attendance" replace />} />
            <Route path="/transport/tracking" element={<Navigate to="/admin/tracking" replace />} />
            <Route path="/transport/planning" element={<PlanningOverviewPage />} />
            <Route path="/transport/planning/routes" element={<RoutesPlanningListPage />} />
            <Route path="/transport/planning/routes/new" element={<RouteCreatePage />} />
            <Route path="/transport/planning/routes/:routeId" element={<RoutePlanningDetailPage />} />
            <Route path="/transport/planning/routes/:routeId/edit" element={<RoutePlanningDetailPage />} />
            <Route path="/transport/planning/schedules" element={<SchedulePlanningPage />} />
            <Route path="/transport/planning/trips" element={<TripGenerationPage />} />

            {/* Transport Manager Fleet Mirror Routes */}
            <Route path="/transport/fleet" element={<FleetDashboardPage />} />
            <Route path="/transport/fleet/buses" element={<BusesManagementPage />} />
            <Route path="/transport/fleet/buses/:busId" element={<BusDetailHubPage />} />
            <Route path="/transport/fleet/maintenance" element={<FleetMaintenancePage />} />
            <Route path="/transport/fleet/inspections" element={<FleetInspectionsPage />} />
            <Route path="/transport/fleet/documents" element={<FleetDocumentsPage />} />
            <Route path="/transport/fleet/compliance" element={<FleetCompliancePage />} />

            {/* Transport Manager Analytics Sub-Routes */}
            <Route path="/transport/analytics" element={<AnalyticsOverviewPage />} />
            <Route path="/transport/analytics/overview" element={<AnalyticsOverviewPage />} />
            <Route path="/transport/analytics/routes" element={<RouteAnalyticsPage />} />
            <Route path="/transport/analytics/trips" element={<TripAnalyticsPage />} />
            <Route path="/transport/analytics/fleet" element={<FleetAnalyticsPage />} />
            <Route path="/transport/analytics/attendance" element={<AttendanceAnalyticsPage />} />
            <Route path="/transport/analytics/safety" element={<SafetyAnalyticsPage />} />

            <Route path="/transport/safety" element={<AdminSafetyPage />} />
            <Route path="/transport/emergency" element={<AdminSafetyPage />} />
            <Route path="/transport/incidents" element={<AdminIncidentsPage />} />
            <Route path="/transport/incidents/:incidentId" element={<AdminIncidentDetailPage />} />
            <Route path="/transport/emergency-contacts" element={<EmergencyContactsPage />} />
            <Route path="/transport/reports" element={<Navigate to="/admin/reports" replace />} />
            <Route path="/transport/reports/overview" element={<Navigate to="/admin/reports/overview" replace />} />
            <Route path="/transport/reports/trips" element={<Navigate to="/admin/reports/trips" replace />} />
            <Route path="/transport/reports/attendance" element={<Navigate to="/admin/reports/attendance" replace />} />
            <Route path="/transport/reports/buses" element={<Navigate to="/admin/reports/buses" replace />} />
            <Route path="/transport/reports/routes" element={<Navigate to="/admin/reports/routes" replace />} />
            <Route path="/transport/reports/drivers" element={<Navigate to="/admin/reports/drivers" replace />} />
            <Route path="/transport/reports/students" element={<Navigate to="/admin/reports/students" replace />} />
            <Route path="/transport/settings" element={<SettingsPage />} />
            <Route path="/transport/settings/profile" element={<AdminProfilePage />} />
            <Route path="/transport/settings/transport" element={<TransportSettingsPage />} />
            <Route path="/transport/settings/notifications" element={<NotificationSettingsPage />} />
            <Route path="/transport/*" element={<Navigate to="/admin" replace />} />
          </Route>

          {/* Parent Protected Routes (/parent/*) */}
          <Route element={<RoleRoute allowedRoles={[USER_ROLES.PARENT]} />}>
            <Route element={<ParentRouteWrapper />}>
              <Route path="/parent" element={<ParentOverviewPage />} />
              <Route path="/parent/safety" element={<ParentSafetyPage />} />
              <Route path="/parent/emergency" element={<ParentSafetyPage />} />
              <Route path="/parent/attendance" element={<ParentAttendancePage />} />
              <Route path="/parent/children" element={<ChildrenProfilePage />} />
              <Route path="/parent/tracking" element={<TrackingPage />} />
              <Route path="/parent/trips" element={<ParentTripsPage />} />
              <Route path="/parent/notifications" element={<ParentNotificationsPage />} />
              <Route path="/parent/profile" element={<ParentProfilePage />} />
              <Route path="/parent/settings" element={<ParentSettingsPage />} />
            </Route>
          </Route>

          {/* Driver Protected MPA Routes (/driver/*) */}
          <Route element={<RoleRoute allowedRoles={[USER_ROLES.DRIVER]} />}>
            <Route element={<DriverRouteWrapper />}>
              <Route path="/driver" element={<DriverOverviewPage />} />
              <Route path="/driver/safety" element={<DriverSafetyPage />} />
              <Route path="/driver/emergency" element={<DriverEmergencyPage />} />
              <Route path="/driver/incidents" element={<DriverIncidentsPage />} />
              <Route path="/driver/attendance" element={<DriverAttendancePage />} />
              <Route path="/driver/tracking" element={<DriverTrackingPage />} />
              <Route path="/driver/trips" element={<DriverTripsPage />} />
              <Route path="/driver/trips/:tripId" element={<DriverTripDetailPage />} />
              <Route path="/driver/route" element={<DriverRoutePage />} />
              <Route path="/driver/students" element={<DriverStudentsPage />} />
              <Route path="/driver/notifications" element={<DriverNotificationsPage />} />
              <Route path="/driver/profile" element={<DriverProfilePage />} />
              <Route path="/driver/settings" element={<DriverSettingsPage />} />

              {/* Driver Vehicle Operations (Stage 23) */}
              <Route path="/driver/vehicle" element={<DriverVehicleHubPage />} />
              <Route path="/driver/vehicle/inspection" element={<DriverPreTripInspectionPage />} />
              <Route path="/driver/vehicle/issues" element={<DriverIssueReportPage />} />
            </Route>
          </Route>

          {/* Student Protected MPA Routes (/student/*) */}
          <Route element={<RoleRoute allowedRoles={[USER_ROLES.STUDENT]} />}>
            <Route element={<StudentRouteWrapper />}>
              <Route path="/student" element={<StudentOverviewPage />} />
              <Route path="/student/safety" element={<StudentSafetyPage />} />
              <Route path="/student/emergency" element={<StudentSafetyPage />} />
              <Route path="/student/attendance" element={<StudentAttendancePage />} />
              <Route path="/student/transport" element={<StudentTransportPage />} />
              <Route path="/student/tracking" element={<StudentTransportPage />} />
              <Route path="/student/trips" element={<StudentTripsPage />} />
              <Route path="/student/trips/:tripId" element={<StudentTripDetailPage />} />
              <Route path="/student/notifications" element={<StudentNotificationsPage />} />
              <Route path="/student/profile" element={<StudentProfilePage />} />
              <Route path="/student/settings" element={<StudentSettingsPage />} />
            </Route>
          </Route>
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
