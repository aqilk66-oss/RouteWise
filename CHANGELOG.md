# CHANGELOG — RouteWise Platform

All notable changes to the RouteWise School Transport & Bus Tracking Platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-09-07 (Official 1.0.0 Production Release — Complete 30 Stages)

### Added
- **Stage 21: Advanced Maps, Geospatial Visualization & Intelligence**: OpenStreetMap integration, Leaflet custom vehicle markers, turn-by-turn waypoint polylines, real-time bus headings.
- **Stage 22: Advanced Route Planning & Fleet Assignment**: Overlapping schedule conflict detection, capacity overload warnings, automated daily trip generator.
- **Stage 23: Fleet Operations, Maintenance & Compliance**: Digital pre-trip inspection checklists, mechanical defect tracking, vehicle document expiration SLA monitoring.
- **Stage 24: Omnichannel Transport Updates & Bulletins**: EmailJS emergency broadcast alerts, operational dispatch bulletins, priority communication queues.
- **Stage 25: Advanced Transport Analytics & Operational Intelligence**: On-time dispatch percentage, fleet utilization KPIs, safety incident rate telemetry, driver work logs.
- **Stage 26: Backup, Data Recovery, Archival & Disaster Readiness**: Coldline GCP backup manifests, backup age health SLA monitor, operational Recovery Bin with relational validation.
- **Stage 27: Advanced Security, Privacy & Compliance Hardening**: Firestore rule tightening, XSS entity escaping, CSV formula injection defense, Content Security Policy, public `/privacy` & `/terms` pages, and compliance posture checklist.
- **Stage 28: Production Deployment, Domain, HTTPS & Infrastructure**: Custom domain DNS architecture, automated SSL/TLS certificates, immutable asset edge caching.
- **Stage 29: Final UI/UX Polish, Micro-Animations & Cross-Device Optimization**: 44x44px minimum touch target optimization, internal table horizontal scrolling (320px-2560px), micro-interactions.
- **Stage 30: Final End-to-End Validation & 1.0 Release**: 15 automated test suites (86 passing tests), clean production build in 17s.

## [0.20.0] — 2026-09-06 (Stage 20 Production Candidate)

### Added
- **Super Admin Governance Tier**: Introduced `superAdmin` role and dedicated `/super-admin/*` Multi-Page Application hierarchy (13 standalone page views).
- **Append-Only Immutable Audit System**: Real-time compliance logging for all state-changing operational and administrative actions (`auditLogs` collection) with zero edit/delete capabilities.
- **Institutional Campus Scoping**: Multi-campus association and management (`schools` collection) supporting student, route, driver, and bus affiliation.
- **Platform Configuration & Maintenance**: Platform branding, emergency SOS hotlines, telemetry threshold settings, and maintenance mode toggles.
- **Threat & Security Center**: Dedicated perimeter telemetry, unauthorized access monitoring, and account suspension workflows.
- **Automated Testing & QA Suite**: Integrated Vitest runner with Happy-DOM, unit test coverage for permissions and validators, and integration tests for route guards and audit logging.
- **Release Documentation**: Production deployment checklist (`RELEASE_CHECKLIST.md`) and deployment configuration verification for Firebase and Vercel.

### Security
- Hardened Firestore security rules with `isSuperAdmin()` verification.
- Prohibited users from self-assigning privileged roles (`superAdmin`, `admin`, `transportManager`) upon registration.
- Restricted `auditLogs` to append-only: updates and deletes explicitly forbidden (`allow update, delete: if false;`).
- Locked down `schools` and `systemConfig` collections to Super Admin access.
- Implemented `SuperAdminRoute` terminating unauthorized direct URL navigation and redirecting to `/unauthorized`.

### Performance & Hardening
- Optimized client-side bundle splitting across all MPA page routes.
- Maintained single, professional RouteWise loader with animated SVG pulse (basic loader removed).
- Ensured 100% truthful data presentation with genuine empty states, avoiding fabricated telemetry or simulated GPS.
