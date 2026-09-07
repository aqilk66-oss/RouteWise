# RouteWise — Security Verification & Testing Guide (Stage 27)

## 1. Automated Security Test Suite
The security test suite evaluates authorization boundaries, privilege escalation prevention, formula injection sanitization, and input validation without modifying production records.

Run the security unit suite:
```bash
npx vitest run src/tests/unit/securitySanitizer.test.js
```

Run all unit & integration tests:
```bash
npx vitest run
```

---

## 2. Manual & Penetration Testing Procedures

### Test 1: Privilege Escalation Attempt (Parent -> Super Admin)
- **Objective**: Ensure a parent or driver cannot elevate their account role via direct Firestore mutation.
- **Procedure**:
  1. Authenticate as a user with role `parent`.
  2. Attempt a Firestore document update on `/users/{uid}` setting `role: "superAdmin"`.
  3. **Expected Result**: Denied by Firestore rule `!request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'email'])`. Error returned: `PERMISSION_DENIED`.

### Test 2: Insecure Direct Object Reference (IDOR) on Student Rosters
- **Objective**: Ensure a parent cannot read or mutate another guardian's child.
- **Procedure**:
  1. Authenticate as Parent A.
  2. Attempt a read on `/students/{Student_B_ID}` where `Student_B_ID` belongs to Parent B.
  3. **Expected Result**: Denied by rule requiring `primaryParentId == auth.uid` or `parentIds.hasAny([auth.uid])`.

### Test 3: Unauthenticated Route & Stop Inspection
- **Objective**: Verify that public unauthenticated users cannot read bus stop coordinates or corridor routes.
- **Procedure**:
  1. Execute a query against `/routes` or `/stops` with `auth = null`.
  2. **Expected Result**: Denied by hardened Stage 27 rule `allow read: if isAuthenticated();`.

### Test 4: Geolocation Watcher Teardown on Logout
- **Objective**: Ensure background GPS tracking terminates when a driver signs out.
- **Procedure**:
  1. Sign in as a driver and start a trip tracking session.
  2. Click **Sign Out** in the user menu.
  3. Inspect `locationManager.isWatching` and browser geolocation handles.
  4. **Expected Result**: `locationManager.stopWatching()` executes cleanly; watcher ID is cleared and geolocation listener is dismantled.

### Test 5: CSV Formula Injection Defense
- **Objective**: Ensure exported spreadsheets cannot execute arbitrary formulas in Microsoft Excel or Google Sheets.
- **Procedure**:
  1. Pass a malicious string `=cmd|'/C calc'!A0` to `sanitizeCsvCell()`.
  2. **Expected Result**: Returned as `'=cmd|'/C calc'!A0` (prefixed with apostrophe, rendering as text rather than an active formula).
