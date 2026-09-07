# RouteWise — Data Model & Collection Specifications

## Overview
RouteWise uses Google Cloud Firestore for its primary real-time operational database. All document schemas adhere to strict data validation, audit timestamps, and relational integrity.

---

## 1. Primary Collections

### `users`
- **Document ID**: Firebase Auth `uid`
- **Fields**:
  - `uid` (string): Unique user identifier
  - `email` (string): Verified email address
  - `fullName` (string): Full name
  - `role` (string): `super_admin` | `admin` | `transport_manager` | `driver` | `parent` | `student` | `user`
  - `status` (string): `active` | `suspended` | `disabled`
  - `schoolId` (string, optional): Associated school campus
  - `phone` (string, optional): Contact number
  - `createdAt` (timestamp): Document creation time
  - `updatedAt` (timestamp): Last profile modification time

### `schools`
- **Document ID**: Generated unique ID (e.g. `school_01`)
- **Fields**:
  - `name` (string): Institutional name (e.g. "Springfield Academy")
  - `code` (string): Short institutional code
  - `address` (string): Physical campus address
  - `contactEmail` (string): Administrative email
  - `contactPhone` (string): Campus dispatch hotline
  - `active` (boolean): Operating status
  - `createdAt` (timestamp)

### `buses`
- **Document ID**: Vehicle ID or generated ID (e.g. `bus_101`)
- **Fields**:
  - `busNumber` (string): Vehicle fleet number (e.g. "RW-101")
  - `plateNumber` (string): Legal registration plate
  - `capacity` (number): Maximum seating capacity
  - `model` (string): Bus manufacturer and year
  - `status` (string): `active` | `assigned` | `maintenance` | `deactivated`
  - `schoolId` (string): Owning campus ID
  - `currentDriverId` (string, optional): Assigned driver UID
  - `assignedRouteId` (string, optional): Assigned route corridor ID
  - `lastInspectionDate` (timestamp, optional): Most recent safety check
  - `updatedAt` (timestamp)

### `routes`
- **Document ID**: Route identifier (e.g. `route_north_01`)
- **Fields**:
  - `name` (string): Route corridor name (e.g. "North Sector Morning Run")
  - `code` (string): Short code (e.g. "RW-R01")
  - `schoolId` (string): Associated campus ID
  - `status` (string): `active` | `draft` | `archived`
  - `assignedBusId` (string, optional): Bus assigned to route
  - `assignedDriverId` (string, optional): Driver assigned to route
  - `stops` (array of objects): Ordered sequence of waypoints:
    - `stopId` (string): Unique stop ID
    - `name` (string): Stop title (e.g. "Pinecrest Avenue")
    - `lat` (number): Latitude coordinate
    - `lng` (number): Longitude coordinate
    - `scheduledTime` (string): Planned arrival time (e.g. "07:35 AM")
    - `sequence` (number): Order index
  - `totalDistanceKm` (number): Calculated path distance
  - `estimatedDurationMinutes` (number): Planned travel duration

### `trips`
- **Document ID**: Generated trip ID (e.g. `trip_20260907_01`)
- **Fields**:
  - `routeId` (string): Target route reference
  - `busId` (string): Dispatched bus reference
  - `driverId` (string): Operating driver UID
  - `schoolId` (string): Campus ID
  - `status` (string): `scheduled` | `inProgress` | `completed` | `delayed` | `cancelled`
  - `scheduledDate` (string): Date in YYYY-MM-DD format
  - `scheduledStartTime` (string): Planned departure (e.g. "07:15")
  - `actualStartTime` (timestamp, optional): Real departure timestamp
  - `actualEndTime` (timestamp, optional): Real completion timestamp
  - `currentStopIndex` (number, optional): Current progression along route
  - `currentLocation` (object, optional):
    - `lat` (number): Current latitude
    - `lng` (number): Current longitude
    - `speed` (number): Vehicle speed in km/h
    - `heading` (number): Directional bearing (0-360)
    - `timestamp` (timestamp): Telemetry freshness

### `attendance`
- **Document ID**: Unique record ID
- **Fields**:
  - `tripId` (string): Associated operational run
  - `studentId` (string): Passenger student UID
  - `schoolId` (string): Campus ID
  - `status` (string): `boarded` | `absent` | `dropped_off` | `pending`
  - `boardedAt` (timestamp, optional): Boarding time
  - `droppedOffAt` (timestamp, optional): Drop-off time
  - `recordedBy` (string): Driver UID who checked the student in
  - `stopId` (string, optional): Boarding location ID

### `incidents`
- **Document ID**: Generated incident ID
- **Fields**:
  - `title` (string): Incident summary
  - `description` (string): Detailed explanation
  - `severity` (string): `low` | `medium` | `high` | `critical`
  - `status` (string): `reported` | `under_review` | `resolved`
  - `tripId` (string, optional): Associated trip
  - `busId` (string, optional): Involved vehicle
  - `reportedBy` (string): User UID
  - `resolvedAt` (timestamp, optional)
  - `correctiveAction` (string, optional)
  - `createdAt` (timestamp)

### `auditLogs` (Append-Only)
- **Document ID**: Auto-generated ID
- **Security Rule**: Explicitly forbidden to update or delete (`allow update, delete: if false;`)
- **Fields**:
  - `action` (string): Event name (e.g. `USER_ROLE_UPDATED`, `ROUTE_CREATED`, `BUS_DEACTIVATED`)
  - `category` (string): `security` | `auth` | `fleet` | `route` | `system`
  - `performedBy` (string): User UID
  - `userEmail` (string): Operator email
  - `targetId` (string, optional): Target resource document ID
  - `metadata` (object): Contextual details
  - `timestamp` (timestamp): Server timestamp

---

## 2. Relational Hierarchy
```
schools
  ├── users (admins, drivers, parents, students)
  ├── buses
  │     ├── maintenance
  │     ├── inspections
  │     └── documents
  └── routes
        ├── stops
        └── trips
              ├── attendance
              ├── incidents
              └── tracking updates
```
