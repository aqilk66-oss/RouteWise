# RouteWise — Architecture & Technical Specifications

## 1. Architectural Principles
RouteWise is designed as a secure, distributed **Multi-Page Application (MPA)** using React Router 7 with code-split views, centralized Firebase backend integration, and a decoupled four-tier structure:

```
[Presentation Layer: MPA Views & Layouts]
                │
[State & Observer Layer: Contexts & Custom Hooks]
                │
[Service Layer: Domain Business Logic & Rules]
                │
[Infrastructure Layer: Firebase Auth, Cloud Firestore, Firebase Storage]
```

---

## 2. Multi-Page Application (MPA) URL Structure

Each portal represents a dedicated workspace that maintains its own layout, breadcrumbs, and permission guards:

### Public Pages
- `/` — Homepage & Interactive 3D Fleet Viewer
- `/features` — Operational Capabilities & Technical Specifications
- `/tracking` — Public Real-Time Vehicle Telemetry Preview
- `/safety` — Student Transit Protocols & Compliance
- `/privacy` — Student Data Privacy Policy
- `/terms` — Terms of Service & Acceptable Use
- `/login` — Secure Account Authentication & 1-Click Role Switcher
- `/register` — Institutional User Account Registration
- `/unauthorized` — Security 403 Clearance Boundary
- `/404` — Missing Route Page

### Super Admin Governance Portal (`/super-admin`)
- `/super-admin` — Executive Platform Governance Console
- `/super-admin/users` — User Account Management & Status
- `/super-admin/users/:userId` — Granular User Profile & Security Audit
- `/super-admin/roles` — Role Definition & Clearance Policies
- `/super-admin/schools` — Institutional Multi-School Directory
- `/super-admin/security` — Perimeter Security & Access Monitoring
- `/super-admin/audit-logs` — Append-Only Immutable Compliance Ledger
- `/super-admin/backups` — Coldline GCP Backup & Integrity Manifests
- `/super-admin/recovery` — Operational Disaster Recovery & Soft-Deleted Bins
- `/super-admin/configuration` — Global Emergency Hotlines & System Toggles
- `/super-admin/system-health` — Infrastructure Latency & Database Telemetry
- `/super-admin/profile` — Super Admin Security Credentials
- `/super-admin/settings` — Governance Terminal Preferences

### School Admin Command Center (`/admin`)
- `/admin` — Fleet Operations Command Center & Live Network Telemetry
- `/admin/safety` — Safety Protocol Dashboard & Hotlines
- `/admin/incidents` — Fleet Incidents & Incident Resolution
- `/admin/incidents/:id` — Incident Detail & Corrective Action Log
- `/admin/tracking` — Live Multi-Bus Geospatial Tracking Map
- `/admin/attendance` — Student Transit Attendance Monitor
- `/admin/planning` — Route Corridor & Scheduling Dispatch Terminal
- `/admin/planning/routes` — Route Creation & Waypoint Corridor Builder
- `/admin/planning/routes/:routeId` — Route Geometry, Sequencing & Stops
- `/admin/planning/schedules` — Time Tables & Bus Departure Calendars
- `/admin/planning/trips` — Automated Daily Trip Generator
- `/admin/fleet` — Vehicle Registry, Readiness & Maintenance
- `/admin/fleet/bus/:busId` — Vehicle Diagnostics, Documents & Service History
- `/admin/fleet/maintenance` — Work Orders & Repair Logs
- `/admin/fleet/inspections` — Daily Pre-Trip Inspection Audit
- `/admin/fleet/documents` — Registration, Insurance & Permit SLA Expirations
- `/admin/fleet/compliance` — Institutional Fleet Safety Audits
- `/admin/students` — Student Manifest Directory
- `/admin/parents` — Parent & Guardian Directory
- `/admin/drivers` — Certified Bus Operator Registry
- `/admin/buses` — Bus Inventory Management
- `/admin/routes` — Route Corridor Directory
- `/admin/stops` — Transit Stops & Geofenced Waypoints
- `/admin/trips` — Daily Dispatched Trips
- `/admin/analytics` — Transport Intelligence & On-Time Performance
- `/admin/notifications` — Campus-Wide Broadcast Announcements
- `/admin/reports` — Operational Transport Reports & CSV Export
- `/admin/settings` — Campus Fleet Settings & Admin Profile

### Driver Portal & HUD (`/driver`)
- `/driver` — Real-Time Driver Console & Active Trip HUD
- `/driver/safety` — Emergency Hotline & Instant SOS Panic Dispatch
- `/driver/incidents` — Mechanical & Operational Incident Filing
- `/driver/attendance` — Student Stop-by-Stop Boarding Check-In
- `/driver/tracking` — GPS Beacon Broadcaster
- `/driver/vehicle` — Assigned Bus Specifications & Fuel Status
- `/driver/fleet/inspections` — Interactive Digital Pre-Trip Checklist
- `/driver/fleet/issues` — Vehicle Defect & Road Repair Reporting
- `/driver/trips` — Assigned Trip Schedule
- `/driver/route` — Stop Sequence, Navigation & Geofences
- `/driver/students` — Passenger Manifest & Guardian Contact
- `/driver/notifications` — Dispatcher Broadcast Bulletins
- `/driver/profile` — Commercial Driver License Credentials
- `/driver/settings` — Driver Audio & UI Preferences

### Parent Portal (`/parent`)
- `/parent` — Family Transport Overview
- `/parent/safety` — Transport Security Hotlines & Driver Contact
- `/parent/attendance` — Student Boarding History & Verification
- `/parent/children` — Children Roster & Assigned School Bus
- `/parent/tracking` — Real-Time Live Bus GPS Tracker
- `/parent/trips` — Scheduled & Completed Runs
- `/parent/notifications` — School Dispatch Bulletins & Arrival Notices
- `/parent/profile` — Guardian Contact Information & Emergency Contacts
- `/parent/settings` — SMS & Push Notification Preferences

### Student Transit Pass (`/student`)
- `/student` — Digital Transit Pass Dashboard
- `/student/safety` — Student Riding Rules & Emergency Guidance
- `/student/attendance` — Personal Boarding & Drop-Off Records
- `/student/transport` — Assigned Bus, Driver & Morning Schedule
- `/student/trips` — Daily Ride History
- `/student/notifications` — School Delays & Route Updates
- `/student/profile` — Student Transit Pass Credentials
- `/student/settings` — Pass Display & Theme Preferences

---

## 3. Data Flow & Security Model
1. **Identity & Authentication**: Firebase Authentication handles JWT token lifecycle. Client state is verified through centralized `AuthContext`.
2. **Authorization Enforcement**: Dual-layer defense:
   - **Frontend**: `RouteGuards.jsx` verifies active session and role clearance before rendering any protected route.
   - **Backend**: Cloud Firestore Security Rules (`firestore.rules`) enforce strict RBAC, institution scoping, and ownership permissions at database level.
3. **Telemetry & GPS Pipeline**: Driver HUD streams GPS coordinates to `locationManager.js`, which sanitizes and throttles updates to Firestore every 3-5 seconds. Real-time snapshots update parent and admin maps with stale-data detection flags (>60s).
