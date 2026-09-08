# RouteWise — Realtime Database Security Architecture

## 1. Overview
Stage 31 implements real-time bus tracking utilizing **Firebase Realtime Database (RTDB)** for low-latency, high-frequency GPS coordinate streams (`liveTracking/{tripId}`) and **Cloud Firestore** for transactional business records (trips, rosters, students, audit logs).

RTDB Database URL:
`https://routewise-b4741-default-rtdb.firebaseio.com/`

---

## 2. Realtime Database Security Principles

### A. Deny by Default
The root rules explicitly deny all global reads and writes:
```json
{
  "rules": {
    ".read": false,
    ".write": false
  }
}
```
No anonymous or public access is permitted. Live telemetry is never exposed through unauthenticated endpoints, QR codes, or public maps.

### B. Node Scoping: `liveTracking/{tripId}`
All live stream data is isolated under trip-scoped keys:
- Only current live telemetry is stored in RTDB.
- Historical breadcrumbs are not accumulated indefinitely in RTDB, preventing write abuse and unbounded database storage growth.

### C. Driver Write Authorization
A driver can only publish live GPS coordinates if:
1. The driver has an active authenticated session (`auth != null`).
2. The `driverId` written matches the driver's authentication UID, or the user is an authorized admin.
3. The coordinate boundaries adhere to real geographical constraints:
   - `latitude` must be between -90.0 and +90.0.
   - `longitude` must be between -180.0 and +180.0.
4. Status must belong to the controlled tracking states (`active`, `waiting`, `stale`, `stopped`, `completed`, `offline`).

### D. Viewer Read Authorization
Authorized parents, students, drivers, and transport administrators:
- Must have an authenticated session (`auth != null`).
- Client pages enforce strict role and vehicle scope:
  - **Parents**: Only subscribe to `liveTracking/{childTripId}` for their own enrolled children.
  - **Students**: Only subscribe to `liveTracking/{assignedTripId}` for their specific route.
  - **Drivers**: Only stream and observe their own active assigned vehicle.
  - **Transport Managers & Admins**: Supervise authorized school fleet vehicles within their district domain.

---

## 3. Security Rules Definition (`database.rules.json`)
```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "liveTracking": {
      "$tripId": {
        ".read": "auth != null",
        ".write": "auth != null && (data.val() == null || data.child('driverId').val() == auth.uid || newData.child('driverId').val() == auth.uid || auth.token.role == 'admin' || auth.token.role == 'superadmin')",
        ".validate": "newData.hasChildren(['latitude', 'longitude', 'status']) && newData.child('latitude').isNumber() && newData.child('latitude').val() >= -90 && newData.child('latitude').val() <= 90 && newData.child('longitude').isNumber() && newData.child('longitude').val() >= -180 && newData.child('longitude').val() <= 180 && (newData.child('status').val() == 'active' || newData.child('status').val() == 'waiting' || newData.child('status').val() == 'stale' || newData.child('status').val() == 'stopped' || newData.child('status').val() == 'completed' || newData.child('status').val() == 'offline')",
        "latitude": {
          ".validate": "newData.isNumber() && newData.val() >= -90 && newData.val() <= 90"
        },
        "longitude": {
          ".validate": "newData.isNumber() && newData.val() >= -180 && newData.val() <= 180"
        },
        "accuracy": {
          ".validate": "newData.val() == null || (newData.isNumber() && newData.val() >= 0)"
        },
        "heading": {
          ".validate": "newData.val() == null || (newData.isNumber() && newData.val() >= 0 && newData.val() <= 360)"
        },
        "speed": {
          ".validate": "newData.val() == null || (newData.isNumber() && newData.val() >= 0)"
        },
        "status": {
          ".validate": "newData.isString() && (newData.val() == 'active' || newData.val() == 'waiting' || newData.val() == 'stale' || newData.val() == 'stopped' || newData.val() == 'completed' || newData.val() == 'offline')"
        }
      }
    }
  }
}
```

---

## 4. Verification and Security Test Matrix
| Scenario | Action | Expected Result |
|---|---|---|
| Unauthenticated read | Query `liveTracking/{tripId}` without token | **PERMISSION_DENIED** |
| Unauthenticated write | Push coordinates without token | **PERMISSION_DENIED** |
| Unauthorized trip write | Driver A writes to Driver B's active trip | **PERMISSION_DENIED** |
| Malformed latitude | Write latitude `140.23` (> 90.0) | **VALIDATION_FAILED** |
| Malformed longitude | Write longitude `-250.0` (< -180.0) | **VALIDATION_FAILED** |
| Legitimate driver write | Driver writes valid GPS update for assigned trip | **ALLOWED** |
| Authorized parent read | Enrolled parent subscribes to child trip stream | **ALLOWED** |
