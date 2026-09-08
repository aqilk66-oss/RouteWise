# RouteWise — Every Route, Under Control.

**Enterprise School Transport Operations & Real-Time GPS Tracking Platform — Version 1.0.0**

---

## 🚌 Overview
**RouteWise** is an enterprise-grade school transport operations and student safety portal built as a high-performance **Multi-Page Application (MPA)**. It connects school administrations, fleet dispatchers, bus drivers, parents, and students within a unified, real-time command structure.

### Core Capabilities
- **Institutional Multi-Campus Fleet Operations**: Manage buses, drivers, attendants, routes, and stops across institutional campus boundaries.
- **Real-Time GPS Bus Tracking**: Leaflet/OpenStreetMap geospatial tracking with telemetry freshness monitoring, bearing-aligned vehicle markers, and breadcrumb trails.
- **Role-Based Access Control (RBAC)**: Strict role-separated interfaces across six distinct user tiers: `Super Admin`, `Admin`, `Transport Manager`, `Driver`, `Parent`, and `Student`.
- **Student Boarding & Attendance Verification**: Digital passenger manifests with NFC/manual attendance check-in, check-out, and automated parent arrival notifications.
- **Safety, Incident & SOS Management**: Instant driver SOS panic alerts, incident classification, digital vehicle pre-trip checklists, and emergency communications.
- **Automated Route Planning & Conflict Engine**: Corridor sequencing, vehicle capacity validation, and automated schedule conflict detection.
- **Enterprise Governance & Coldline Backup**: Tamper-proof append-only audit logging, institutional system configuration, and GCP disaster recovery.

---

## 🛠️ Technology Stack
- **Frontend Core**: React 19, Vite 8, React Router 7 (Multi-Page Architecture)
- **Styling & Design System**: Tailwind CSS, Lucide Icons, Glassmorphic & Spatial UI Tokens
- **Animations & 3D**: GSAP (GreenSock) with ScrollTrigger, Three.js & React Three Fiber
- **Geospatial Mapping**: Leaflet, React-Leaflet, OpenStreetMap
- **Backend & Real-Time Services**: Firebase Authentication, Cloud Firestore, Firebase Storage
- **Testing & Quality Assurance**: Vitest, Happy-DOM, Testing Library
- **CI/CD & Hosting**: GitHub Actions, Vercel & Firebase Hosting

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x, 20.x, or 22.x LTS
- npm 9.x+

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/aqilk66-oss/RouteWise.git
cd RouteWise
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your Firebase project credentials:
```bash
cp .env.example .env
```

Required environment variables:
```env
# Firebase Web Client Configuration
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=806918370452
VITE_FIREBASE_APP_ID=1:806918370452:web:...
VITE_FIREBASE_MEASUREMENT_ID=G-...

# Firebase Realtime Database (Stage 31 Live Tracking)
VITE_FIREBASE_DATABASE_URL=https://routewise-b4741-default-rtdb.firebaseio.com/

# Optional EmailJS Client Dispatch
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=
```

### 3. Run Locally (Development)
```bash
npm run dev
```
Navigate to `http://localhost:5173` to explore RouteWise.

---

## 🧪 Testing & Code Quality
RouteWise includes a comprehensive automated test suite spanning unit, component, integration, and security checks:
```bash
# Run all automated tests
npm test

# Run Oxlint static analysis
npm run lint

# Run production build validation
npm run build
```

---

## 🛡️ User Roles & MPA Portal Architecture

| Role | Portal Path | Purpose & Clearance |
| :--- | :--- | :--- |
| **Super Admin** | `/super-admin/*` | Platform governance, multi-school administration, audit trails, backups, system health. |
| **School Admin** | `/admin/*` | Campus transport operations, student rosters, driver management, vehicle assignments. |
| **Transport Manager**| `/admin/planning/*`| Route corridor builder, vehicle schedule planning, trip generation, fleet maintenance. |
| **Bus Driver** | `/driver/*` | Real-time GPS broadcaster, digital pre-trip inspection, student boarding attendance, SOS alert. |
| **Parent / Guardian**| `/parent/*` | Real-time child transit tracking, pickup ETA, attendance verification, driver contact. |
| **Student** | `/student/*` | Digital transit pass, route map, daily schedule, boarding history. |

---

## 📦 Deployment & Production Security
RouteWise is pre-configured with zero-trust production response headers in both `vercel.json` and `firebase.json`:
- **Content Security Policy (CSP)**: Strictly limits scripts, frames, and connections to verified endpoints.
- **Frame & Sniffing Protection**: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.
- **Asset Caching**: Immutable 1-year HTTP caching on all `/assets/*` bundles.
- **Deep MPA Links**: Single-origin rewrites preventing 404s on browser reloads.

---

## 🎨 Hero Visual Source & Licensing
- **Asset**: `public/assets/hero_transport_illustration.jpg`
- **Asset Description**: Clean, modern SaaS vector-styled technology illustration featuring a yellow school bus traveling along an illuminated smart route corridor with glowing GPS waypoint pins on a crisp, light background.
- **Licensing / Status**: Custom high-resolution digital illustration generated specifically for the RouteWise open-source educational transport portal. Completely free of watermarks, third-party logos, or copyrighted promotional art.
- **Optimization**: Clean raster asset replacing heavy WebGL/Three.js render loops, reducing initial landing page JS payload and eliminating GPU overhead.

## 📄 License
Proprietary & Confidential — RouteWise Technologies Inc. Every Route, Under Control.
