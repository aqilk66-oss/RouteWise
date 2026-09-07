# RouteWise Firestore Schema & Entity Relationships

This document outlines the authoritative Cloud Firestore data architecture for the RouteWise platform established in Stage 6.

---

## 1. Core Collections

| Collection | Key Strategy | Primary Purpose |
| :--- | :--- | :--- |
| `users` | `users/{firebaseAuthUid}` | Authentication identity, role assignment, and base profile |
| `students` | `students/{autoId}` | Student riders, grade, parent relations, and route assignments |
| `parents` | `parents/{autoId or uid}` | Guardian accounts, contact channels, and linked child IDs |
| `drivers` | `drivers/{autoId or uid}` | Certified operators, CDL credentials, and vehicle bindings |
| `buses` | `buses/{autoId}` | Fleet vehicles, passenger capacity, plate numbers, and status |
| `routes` | `routes/{autoId}` | Transit lines, estimated runtimes, distances, and stop arrays |
| `stops` | `stops/{autoId}` | Waypoints, sequence numbers, geo-coordinates, and times |
| `trips` | `trips/{autoId}` | Daily morning/afternoon runs, active delays, and progress |
| `notifications` | `notifications/{autoId}` | User-specific alert dispatches, arrival pings, and emergencies |
| `attendance` | `attendance/{autoId}` | Daily boarding timestamps and checkpoint verifications |
| `reports` | `reports/{autoId}` | Institutional fleet audit logs and compliance summaries |
| `settings` | `settings/{autoId}` | District safety thresholds, geofence radius, and speed limits |

---

## 2. Entity Relationship Diagram

```text
User (Auth UID)
  ├── Profile: users/{uid} (role: admin | transportManager | driver | parent | student)
  │
  ├── Parent: parents/{id} (userId: uid)
  │     └── studentIds: [ studentId_A, studentId_B ]
  │
  ├── Driver: drivers/{id} (userId: uid)
  │     ├── assignedBusId: busId
  │     └── assignedRouteId: routeId
  │
  └── Student: students/{id}
        ├── primaryParentId: parentId
        ├── busId: busId
        ├── routeId: routeId
        ├── pickupStopId: stopId
        └── dropoffStopId: stopId

Route: routes/{routeId}
  ├── stopIds: [ stopId_1, stopId_2, stopId_3 ]
  ├── assignedBusId: busId
  └── assignedDriverId: driverId

Trip: trips/{tripId}
  ├── routeId: routeId
  ├── busId: busId
  ├── driverId: driverId
  ├── studentIds: [ studentId_A, ... ]
  └── currentStopId: stopId
```

---

## 3. Security Principles
- **No Client Privilege Escalation**: Normal users cannot self-assign `admin` or `transportManager` roles.
- **Strict Data Scoping**: Parents only query children where `primaryParentId == auth.uid`.
- **Soft Deletion**: Records default to `status: 'archived'` instead of physical deletion to protect historical student transit audit trails.
- **Optimized Queries**: Queries explicitly bound with `where`, `orderBy`, and `limit` to prevent full table downloads.
