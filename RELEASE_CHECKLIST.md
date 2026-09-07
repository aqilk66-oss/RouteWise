# RouteWise — Production Release & Deployment Checklist

This document provides a comprehensive pre-deployment and release checklist for the **RouteWise — School Transport & Bus Tracking Portal (v1.0.0)**.

---

## 1. Environment & Secrets Validation
- [x] Confirm all required frontend Vite environment variables in `.env`:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`
- [x] Optional EmailJS integration variables:
  - `VITE_EMAILJS_SERVICE_ID`
  - `VITE_EMAILJS_TEMPLATE_ID`
  - `VITE_EMAILJS_PUBLIC_KEY`
  - *(When absent, application displays truthful "Not Configured" state)*
- [x] Ensure no production private service accounts, service credentials, or secrets are bundled into client code.

---

## 2. Multi-Page Application (MPA) Routing & Fallbacks
- [x] Verify SPA/MPA fallback configuration in hosting files:
  - `firebase.json`: Single-page rewrite to `/index.html` configured for nested deep links (`/parent/tracking`, `/admin/students`, `/super-admin/audit-logs`).
  - `vercel.json`: Clean URL rewrites configured for direct navigation.
- [x] Test direct URL entry on protected routes:
  - Visiting `/super-admin` as a non-superAdmin redirects to `/unauthorized`.
  - Visiting any protected route unauthenticated redirects to `/login` with redirect state preserved.

---

## 3. Database Security Rules Deployment
- [x] Deploy `firestore.rules` to the target Firebase project:
  ```bash
  firebase deploy --only firestore:rules
  ```
- [x] Verify rule assertions:
  - Users cannot self-assign `superAdmin`, `admin`, or `transportManager`.
  - `auditLogs` is strictly append-only: `allow update, delete: if false;`.
  - `systemConfig` and `schools` require `isSuperAdmin()`.

---

## 4. Automated Testing & Quality Assurance
- [x] Run unit & component test suite:
  ```bash
  npm test
  ```
- [x] Confirm 100% test pass rate across all suites:
  - `formatters.test.js` (email, phone, speed, and date validations)
  - `permissions.test.js` (role model and permission matrix verification)
  - `Loader.test.jsx` (RouteWise branded professional loader and loading states)
  - `auditService.test.js` (immutable append-only ledger verification)
  - `routeGuards.test.js` (privilege escalation and route clearance protection)

---

## 5. Production Build Verification
- [x] Run production build command:
  ```bash
  npm run build
  ```
- [x] Ensure build completes with 0 errors.
- [x] Verify single professional RouteWise loader is active (basic loader deleted).
- [x] Check for horizontal page overflow on viewports ranging from 320px to 2560px.

---

## 6. Post-Deployment Smoke Test Protocol
1. **Public Navigation**: Visit `/`, verify Three.js 3D globe / bus scene, responsive header, and footer links.
2. **Authentication**: Register a test parent account; verify account is created with `parent` role (not privileged).
3. **Role Routing**: Log in as each role (`superAdmin`, `admin`, `transportManager`, `driver`, `parent`, `student`) and confirm correct dashboard redirection.
4. **Privilege Isolation**: Attempt manual navigation to `/super-admin/users` as a parent; confirm access is denied with `/unauthorized`.
5. **Operational Tracking**: Open Driver tracking and verify geolocation permissions fail gracefully when denied.
6. **Audit Trail**: Trigger a configuration change as Super Admin and inspect `/super-admin/audit-logs` to confirm the record appears.
