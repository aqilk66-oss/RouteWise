# RouteWise — Enterprise Backup & Data Protection Strategy (Stage 26)

## 1. Executive Overview & Purpose
RouteWise supports safety-critical school transport infrastructure where student rosters, driver assignments, vehicle telematics, maintenance defect logs, and emergency incident records must be protected from accidental deletion, malicious tampering, hardware failure, or corrupt bulk operations.

This document outlines the authentic data backup, archival, storage separation, and integrity verification architecture implemented across the platform.

---

## 2. Core Principles & Boundaries
1. **Zero Browser-Side Credential Exposure**:
   - The React browser application **never** performs bulk raw exports of the complete production Firestore database directly into memory, nor does it hold GCP Service Account credentials or Firebase Admin SDK tokens.
   - Live database snapshots are orchestrated via Google Cloud Platform server-side IAM, Cloud Scheduler, and Cloud Storage buckets (`gs://routewise-backups-prod/...`).
2. **Deterministic Status & Health Tracking**:
   - Manifests are tracked deterministically using SHA-256 integrity hashes, byte sizes, exact record counts, and granular resource manifests.
   - Backup age health is classified systematically:
     - **Current**: $\le 24$ hours
     - **Aging**: $> 24$ hours and $\le 72$ hours
     - **Overdue**: $> 72$ hours (triggers visual alerts and administrator notifications)
3. **Multi-Tiered Protection**:
   - Distinct classification between disaster-level database snapshots and day-to-day administrative soft-deletion recovery (Recovery Bin).

---

## 3. Data Classification & Protection Tiers

| Data Category | Collections / Buckets | Classification | Frequency / RPO | Retention Period | Recovery Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Authentication & Accounts** | Firebase Auth (metadata only), `users` | Critical | Daily Snapshot (24h RPO) | 90 Days | Priority 1 |
| **Core Operational Roster** | `schools`, `buses`, `drivers`, `routes`, `stops`, `students`, `parents` | Critical | Continuous writes + Daily Snapshot | 365 Days | Priority 2 |
| **Active Dispatch & Attendance** | `trips`, `tripAttendance`, `alerts` | Critical | Hourly delta / Daily roll | 180 Days | Priority 3 |
| **Compliance & Safety** | `safetyIncidents`, `vehicleInspections`, `maintenanceRecords`, `complianceDocuments` | Critical / Compliance | Daily Snapshot | 7 Years (Archival) | Priority 4 |
| **System Governance & Audit** | `auditLedger`, `systemSettings`, `backupManifests` | Critical (Immutable) | Continuous Append / Append-Only | Indefinite / 7 Years | Priority 5 |
| **Documents & Attachments** | Firebase Storage (`bus-docs/`, `defects/`, `incidents/`) | Important | Daily Cloud Storage bucket replication | 3 Years | Priority 6 |
| **Analytics Aggregates** | Local component caches, temporary counters | Rebuildable | On-Demand Regeneration | N/A (Derived) | Priority 7 |

> [!NOTE]
> Rebuildable aggregates (e.g. daily trip on-time percentages or summary counters) can be deterministically re-calculated from primary trip logs; they are not duplicated into backup snapshots to economize storage capacity.

---

## 4. Server-Side Automated Backup Architecture

### 4.1 Production Firestore Export Command (GCP Cloud Shell / CI/CD)
To trigger an authenticated snapshot of all RouteWise collections to the isolated cold-storage bucket:

```bash
# Set Google Cloud Project
gcloud config set project routewise-prod-firebase

# Initiate complete server-side managed export
gcloud firestore export gs://routewise-backups-prod/snapshots/$(date +%Y-%m-%d-%H%M%S) \
  --collection-ids='users,schools,buses,drivers,routes,stops,students,parents,trips,tripAttendance,safetyIncidents,vehicleInspections,maintenanceRecords,auditLedger,systemSettings'
```

### 4.2 Automated Cloud Scheduler & Cloud Function Pipeline
1. **Cloud Scheduler**: Configured with cron `0 2 * * *` (Daily at 02:00 UTC).
2. **Cloud Pub/Sub Target**: Topic `projects/routewise-prod-firebase/topics/firestore-backup-trigger`.
3. **Cloud Function**: Invokes Firestore Admin API `projects.databases.exportDocuments`.
4. **Manifest Webhook**: Upon export completion, writes a verified manifest record to `backupManifests` with byte size, duration, GCS URI, and SHA-256 payload checksum.

---

## 5. Backup Manifest Schema
Every snapshot registered in the RouteWise console contains:

```json
{
  "id": "RW-BU-2026-09-07-001",
  "name": "RouteWise Production Full Daily Snapshot",
  "scope": "full_system",
  "status": "completed",
  "verificationStatus": "verified",
  "createdAt": "2026-09-07T02:00:00Z",
  "completedAt": "2026-09-07T02:04:12Z",
  "durationSeconds": 252,
  "recordCount": 14280,
  "fileCount": 142,
  "sizeBytes": 48234496,
  "checksum": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "storageLocation": "gs://routewise-backups-prod/snapshots/2026-09-07-020000",
  "createdBy": "system_cloud_scheduler",
  "isAutomated": true,
  "environment": "production"
}
```

---

## 6. Storage Separation & Cold Archival
* **Operational Bucket**: `gs://routewise-prod-firebase.appspot.com` (Multi-region standard storage).
* **Disaster Backup Bucket**: `gs://routewise-backups-prod` (Isolated GCP project, Dual-region Nearline/Coldline storage with Object Lifecycle Policies).
  - Lifecycle: Downgrades to Archive storage after 90 days.
  - Immutability: Object Versioning and Retention Lock enabled to prevent ransomware tampering.

---

## 7. Operational Roles & Permissions
- **Super Administrator (`superAdmin`)**:
  - Full access to `/super-admin/backups` and `/super-admin/recovery`.
  - Authorized to trigger manual manifest staging, execute checksum verifications, view dry-run restore previews, and restore soft-deleted records.
- **School Administrator / Transport Manager (`admin`, `transportManager`)**:
  - **No access** to disaster backup manifests or raw storage buckets.
  - Allowed only to submit operational correction requests or archive individual assets in their assigned school.
