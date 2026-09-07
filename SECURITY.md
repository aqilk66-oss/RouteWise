# RouteWise — Platform Security & Hardening Architecture (Stage 27)

## 1. Threat Model & Security Posture
RouteWise is designed to protect vulnerable student identity data, driver rosters, real-time GPS locations, and transport compliance assets from unauthorized access, privilege escalation, and malicious disruption.

### 1.1 Threat Matrix

| Threat ID | Threat Description | Affected Resources | Protection Mechanism | Residual Risk |
| :--- | :--- | :--- | :--- | :--- |
| **TH-01** | **Account Takeover / Stolen Credentials** | User profiles, student rosters, driver dispatch | Firebase Authentication with rate limiting, password reset flows, session revocation on disable. | Weak user passwords mitigated by password complexity enforcement. |
| **TH-02** | **Privilege Escalation via Direct Writes** | `users` collection, custom claims | Firestore rules forbid self-assigning or modifying `role` or `email`; SuperAdminRoute enforces clearance on routing tier. | Compromised Super Admin requires emergency incident runbook. |
| **TH-03** | **Unauthorized Cross-School Access** | `schools`, `students`, `buses`, `routes`, `trips` | Database rules enforce `isSuperAdmin()` or school-matching criteria; front-end filters enforce institutional context. | Single multi-school transport contractors require scoped assignments. |
| **TH-04** | **Insecure Direct Object Reference (IDOR)** | `/parent/trips/:id`, `/admin/students/:id` | Independent backend validation in Firestore rules; parents can read only documents where `primaryParentId == auth.uid`. | Aggressive URL scraping mitigated by strict rule denies. |
| **TH-05** | **Tracking Telematics Eavesdropping** | Real-time GPS coordinates, vehicle speed | Location broadcast restricted strictly to active trips; listeners terminated upon trip conclusion and user logout. | Driver phone device GPS spoofing mitigated by speed anomaly alerts. |
| **TH-06** | **Stored / Reflected Cross-Site Scripting (XSS)** | Incident descriptions, route names, driver bulletins | Automated entity escaping via `sanitizeHtml`; zero usage of un-sanitized `dangerouslySetInnerHTML`. | Third-party dependencies audited via lockfile integrity. |
| **TH-07** | **Spreadsheet Formula Injection (CSV)** | Exported rosters, attendance records, audit logs | Formula prefix escaping (`sanitizeCsvCell`) neutralizes `'='`, `'+'`, `'-'`, `'@'` triggers. | User software override of spreadsheet warning dialogs. |
| **TH-08** | **Audit Trail Manipulation** | `auditLogs` collection | Strict Firestore rules deny both `update` and `delete` (`allow update, delete: if false;`). | None (Immutable append-only ledger). |
| **TH-09** | **Clickjacking & MIME-Sniffing** | All application views and assets | HTTP headers `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, restrictive Content Security Policy. | Legacy browser non-compliance. |

---

## 2. Trust Boundaries & Least Privilege
1. **Public Client**: Untrusted. Cannot read routes, stops, or rosters without authentication.
2. **Authenticated Account**: Authenticated but strictly bound to role (`parent`, `student`, `driver`, `admin`, `superAdmin`).
3. **Institutional Boundary**: Data scoped to `schoolId`. A school administrator cannot query entities belonging to other schools.
4. **Backend Security Boundary**: Firestore Security Rules enforce all permissions. The frontend never acts as the authoritative gatekeeper.

---

## 3. Secret Management & Third-Party Isolation
- **Client Configuration**: Only public `VITE_FIREBASE_*` client identifiers and `VITE_EMAILJS_PUBLIC_KEY` are packaged in the build.
- **Zero Admin SDK in Browser**: Firebase Admin SDK and Service Account keys are never bundled in Vite client code.
- **Content Security Policy (CSP)**:
  - Scripts restricted to `'self'` and Google API endpoints.
  - Connect-src restricted to Firebase RTDB/Firestore, Google APIs, and EmailJS.
  - Media/Images restricted to OpenStreetMap tiles, Firebase Storage, and Unsplash.
