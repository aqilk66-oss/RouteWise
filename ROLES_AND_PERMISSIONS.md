# RouteWise — Roles & Permissions Matrix

## Overview
RouteWise enforces a six-tier Role-Based Access Control (RBAC) hierarchy. Roles are stored in the user document (`users/{uid}`) in Cloud Firestore and verified on both the frontend (`RouteGuards.jsx`) and backend (`firestore.rules`).

---

## 1. Role Definitions

| Role Constant | Canonical Name | Clearance Scope |
| :--- | :--- | :--- |
| `super_admin` | Super Administrator | Complete multi-tenant platform governance, security telemetry, audit ledgers, institutional school creation, system configuration, backup verification. |
| `admin` | School Administrator | Institutional campus management, bus/driver/student rosters, incident handling, reports, communications, dispatch supervision. |
| `transport_manager` | Transport Operations Manager | Route corridor design, bus scheduling, driver assignments, vehicle maintenance and inspections, operational analytics. |
| `driver` | Bus Driver / Operator | Daily assigned trip execution, vehicle pre-trip safety checklist, passenger manifest check-in, real-time GPS telemetry broadcasting, SOS panic dispatch. |
| `parent` | Parent / Legal Guardian | Live tracking of enrolled children's school bus, trip ETA, attendance notification, emergency contact verification. |
| `student` | Enrolled Student | Digital student transit pass, assigned morning/afternoon bus schedule, personal boarding history. |
| `user` | Registered General User | Default read-only onboarding profile awaiting campus verification or role assignment. |

---

## 2. Granular Permissions Matrix

| Feature / Domain | Super Admin | School Admin | Transport Manager | Bus Driver | Parent | Student |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Platform System Health & Config** | ✅ Full | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied |
| **Audit Logs (Append-Only View)** | ✅ Full | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied |
| **Coldline Backup Verification** | ✅ Full | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied |
| **Multi-School Campus Creation** | ✅ Full | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied |
| **User Role Assignment** | ✅ Full | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied |
| **Bus & Vehicle Fleet Management** | ✅ Full | ✅ Campus | ✅ Campus | 👁️ Assigned | ❌ Denied | ❌ Denied |
| **Driver CDL & Licensing Records** | ✅ Full | ✅ Campus | ✅ Campus | 👁️ Self | ❌ Denied | ❌ Denied |
| **Route Corridor Builder & Stops** | ✅ Full | ✅ Campus | ✅ Campus | 👁️ Assigned | ❌ Denied | ❌ Denied |
| **Trip Dispatch & Daily Generator** | ✅ Full | ✅ Campus | ✅ Campus | ❌ Denied | ❌ Denied | ❌ Denied |
| **GPS Location Broadcast (Write)** | ❌ Denied | ❌ Denied | ❌ Denied | ✅ Assigned | ❌ Denied | ❌ Denied |
| **Real-Time GPS Map View (Read)** | ✅ Full | ✅ Campus | ✅ Campus | ✅ Assigned | 👁️ Child Only | 👁️ Self Only |
| **Student Boarding Check-In (Write)**| ❌ Denied | ✅ Campus | ✅ Campus | ✅ Assigned | ❌ Denied | ❌ Denied |
| **Student Attendance View (Read)** | ✅ Full | ✅ Campus | ✅ Campus | ✅ Assigned | 👁️ Child Only | 👁️ Self Only |
| **Emergency SOS Panic Trigger** | ❌ Denied | ❌ Denied | ❌ Denied | ✅ Full | ❌ Denied | ❌ Denied |
| **Safety Incident Resolution** | ✅ Full | ✅ Campus | ✅ Campus | ❌ Denied | ❌ Denied | ❌ Denied |
| **Broadcast Announcements (Write)** | ✅ Global | ✅ Campus | ✅ Campus | ❌ Denied | ❌ Denied | ❌ Denied |

---

## 3. Enforcement Layers
1. **Routing Guard (`RouteGuards.jsx`)**:
   - Evaluates `useAuth()` user profile.
   - Redirects unauthenticated users to `/login`.
   - Diverts unauthorized clearance attempts to `/unauthorized`.
2. **Database Security Rules (`firestore.rules`)**:
   - `isSuperAdmin()`: Checks if caller possesses `super_admin` role in `users/{auth.uid}`.
   - `isAdmin()`: Validates `admin`, `transport_manager`, or `super_admin` credentials.
   - `isDriver()`: Grants write privileges strictly to assigned trip document.
   - `isParent()`: Scopes read queries strictly to matching children's `parentId`.
   - `isStudent()`: Restricts access strictly to matching `studentId`.
