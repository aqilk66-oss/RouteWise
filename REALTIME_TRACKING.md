# RouteWise — Real-Time GPS Live Tracking Engine (Stage 31)

## 1. Primary Architecture Overview
Stage 31 upgrades RouteWise from periodic polling to **browser-based live GPS tracking** powered by Firebase Realtime Database.

```text
Driver Device GPS
      ↓
Browser Geolocation (navigator.geolocation.watchPosition)
      ↓
LocationManager (Boundary Check, Accuracy Filter, Haversine Movement Filter)
      ↓
TrackingService (Time-based Throttle & Dual Database Routing)
      ↓
Firebase Realtime Database (liveTracking/{tripId})
      ↓
Realtime Listener (onValue subscription)
      ↓
Authorized RouteWise User (Driver / Parent / Student / Admin)
      ↓
RouteWiseMap (Interactive Leaflet Marker, Smooth Telemetry, Freshness Badge)
```

---

## 2. Telemetry Ingestion & Filtering Pipeline

### A. Explicit Driver Action
- Tracking is never automatically started in the background merely by opening the dashboard.
- The driver must explicitly click **Start Live Tracking** on `/driver/tracking`.
- Stopping tracking prompts a confirmation modal to avoid accidental disconnection.

### B. Geolocation Options & Battery Awareness
The browser Geolocation API is initialized with balanced options:
- `enableHighAccuracy: true` (ensures satellite/network GPS hardware fix)
- `maximumAge: 5000` (allows maximum 5s cached position to prevent stale location injection)
- `timeout: 15000` (avoids hanging requests on low-signal corridors)

### C. Validation & Accuracy Filtering
- **Latitude / Longitude Check**: Rejects NaN, non-numeric values, or coordinates outside [-90, 90] and [-180, 180].
- **Accuracy Threshold**: Readings with accuracy radius > 200m are flagged as low accuracy (`isLowAccuracy: true`) and presented honestly in the UI.

### D. Distance Threshold & Jitter Suppression (Haversine Formula)
- **Minimum Distance**: 15 meters movement required between updates unless maximum interval is exceeded.
- **Minimum Time Interval**: 6,000 ms (6 seconds) minimum interval to avoid spamming the database with stationary jitter.
- **Maximum Time Interval**: 25,000 ms (25 seconds) heartbeat update when vehicle is slow or stationary to prove active connection.

---

## 3. Database Layering

| Storage Engine | Node / Collection | Purpose |
|---|---|---|
| **Firebase Realtime Database** | `liveTracking/{tripId}` | High-frequency live GPS coordinates (latitude, longitude, speed, heading, accuracy, timestamp, status) |
| **Cloud Firestore** | `trips/{tripId}` | Transactional business records, persistent itinerary, driver assignments, roster, stops |

---

## 4. Freshness & Stale Detection
Tracking freshness is evaluated continuously:
- **Live / Active**: Last update received within 20 seconds.
- **Recent**: Last update between 20 and 60 seconds ago.
- **Stale**: No update for > 60 seconds (displays `Location update delayed`).
- **Stopped / Offline**: Driver clicked Stop Tracking or trip is finalized.

---

## 5. Browser Limitations & Production Notice
- Standard web browsers rely on tab activity; when a mobile device screen locks or the tab is deeply backgrounded, modern operating systems (iOS/Android) throttle or suspend JavaScript execution.
- If mission-critical 24/7 background driver tracking with screen locked is required, a dedicated native/mobile background-location wrapper (e.g. Capacitor, React Native) should be deployed.
