# RouteWise — Disaster Recovery & Emergency Operations Runbook (Stage 26)

## 1. Scope & Authority
This runbook establishes deterministic recovery procedures for the RouteWise platform during critical data corruption, catastrophic deletion, bulk failure, or infrastructure compromise.

**Strict Governance**: Disaster recovery procedures may **only** be authorized and executed by certified **Super Administrators (`superAdmin`)** following multi-party incident triage.

---

## 2. Emergency Contacts & Incident Escalation

| Incident Tier | Severity Description | Lead Contact | Escalation SLA |
| :--- | :--- | :--- | :--- |
| **P1 - Catastrophic** | Total database corruption, active ransomware/compromise, complete data wipe | Chief Information Security Officer & Super Admin | 15 Minutes |
| **P2 - Major Operational** | Bulk incorrect deletion of active routes/buses affecting school morning run | Lead Platform Architect / Super Admin | 30 Minutes |
| **P3 - Localized Defect** | Accidental archiving of an individual bus, driver, or stop record | School Transport Admin via Recovery Bin | 2 Hours |

---

## 3. Seven Specific Disaster Scenarios & Playbooks

### Scenario A: Accidental Record Deletion (Individual Bus / Route / Driver)
* **Impact**: Dispatcher or operator accidentally archives a route or vehicle during business hours.
* **Remediation**:
  1. Navigate to `/super-admin/recovery` (Operational Recovery Bin).
  2. Locate the entity by category (`routes`, `buses`, `drivers`, `schools`).
  3. Click **Restore Entity**.
  4. The system automatically runs **Relational Integrity Validation**:
     - For Routes: Verifies assigned `schoolId` and active stops exist.
     - For Buses: Verifies vehicle registration is not already claimed by another active unit.
  5. Confirm restoration. The record is restored to the active collection with status `active` and full audit trail logged.

### Scenario B: Bad Bulk Update / Faulty Automation Script
* **Impact**: A malformed script or API sync overwrites fields across hundreds of records.
* **Remediation**:
  1. Freeze incoming dispatch modifications by placing the portal in maintenance mode.
  2. Take a **Pre-Restore Safety Snapshot** immediately:
     ```bash
     gcloud firestore export gs://routewise-backups-prod/pre-restore-safety-$(date +%s)
     ```
  3. Locate the latest trusted manifest in `/super-admin/backups`.
  4. Review the **Restore Dry-Run Preview** (`/super-admin/backups/:backupId`) to inspect the diff of documents to be overwritten.
  5. Select targeted collection restore (e.g. only `routes` or `trips`) to avoid touching unrelated collections.

### Scenario C: Firestore Corruption or Schema Inconsistency
* **Impact**: Inconsistent database state causing UI crashes or failed queries.
* **Remediation**:
  1. Run integrity validation on the most recent backup manifest.
  2. Verify payload checksum matches manifest SHA-256.
  3. Execute import in an **isolated staging environment** first:
     ```bash
     gcloud firestore import gs://routewise-backups-prod/snapshots/[TRUSTED_ID] --project=routewise-staging
     ```
  4. Verify application smoke tests pass on staging before promoting recovery to production.

### Scenario D: Failed Production Deployment
* **Impact**: New application bundle fails to communicate with Firestore or crashes on critical workflows.
* **Remediation**:
  1. Immediate Vercel/Cloud Hosting rollback to previous verified release tag (instant static asset rollback).
  2. If data migrations were applied during release, refer to migration rollback scripts documented in release notes.

### Scenario E: Storage Attachment Loss (Vehicle Documents / Defect Photos)
* **Impact**: Media files deleted from Firebase Storage bucket.
* **Remediation**:
  1. Storage metadata remains preserved in Firestore `maintenanceRecords` and `vehicleInspections`.
  2. Restore object versions from the replication bucket:
     ```bash
     gsutil -m rsync -r -d gs://routewise-backups-prod/storage-mirror/ gs://routewise-prod-firebase.appspot.com/
     ```

### Scenario F: Compromised Administrator Account
* **Impact**: Super Admin or School Admin account credentials exposed.
* **Remediation**:
  1. **Immediate Revocation**: In Firebase Authentication Console, disable the user account and revoke refresh tokens (`revokeRefreshTokens(uid)`).
  2. **Audit Inspection**: Review `/super-admin/audit` filtering by the compromised `actorId` for the previous 48 hours.
  3. **Snapshot Freeze**: Generate an emergency safety backup snapshot to preserve evidentiary audit state.
  4. **Targeted Recovery**: Use the Recovery Bin to un-delete any maliciously dropped records.

### Scenario G: System Configuration Mistake
* **Impact**: Geofence thresholds, alert channels, or system settings corrupted.
* **Remediation**:
  1. Restore the `systemSettings` collection from the latest configuration backup scope without touching operational transit data.

---

## 4. Controlled Restoration Workflow

```text
1. Incident Declared
       ↓
2. Identify Target Snapshot in `/super-admin/backups`
       ↓
3. Verify Checksum & Integrity Status
       ↓
4. MANDATORY: Create Pre-Restore Safety Snapshot
       ↓
5. Run Dry-Run Preview & Diff Review
       ↓
6. Restrict Access & Place App in Maintenance Mode
       ↓
7. Execute Server-Side Restoration (`gcloud firestore import`)
       ↓
8. Post-Recovery Smoke Testing (Stage 20 QA Test Suite)
       ↓
9. Log Disaster Recovery Audit Ledger Record
       ↓
10. Resume Normal Transport Operations
```

---

## 5. Post-Recovery Smoke Test Checklist
After completing any database restoration, the following 10 checks **must** be verified before restoring public access:

- [ ] **Authentication**: Super Admin, Admin, Driver, and Parent accounts can authenticate cleanly.
- [ ] **Role Routing**: Dynamic route guard directs each role to their designated dashboard.
- [ ] **Fleet Status**: Buses reflect valid statuses (`available`, `maintenance`, `assigned`).
- [ ] **Route Sequencing**: Stops remain ordered by index; school geofences match GPS coordinates.
- [ ] **Trip Attendance**: Historical attendance registers match past dispatch logs.
- [ ] **Safety & Incidents**: Open safety defects reflect current physical vehicle status.
- [ ] **Live Telematics**: GPS tracking listeners connect without reading historical points as current locations.
- [ ] **Notification Templates**: Broadcast alerts are not duplicated or re-sent upon restoration.
- [ ] **Audit Trail**: Restoration event itself is registered in the permanent `auditLedger`.
- [ ] **Recovery Bin**: Clean state with zero corrupted orphans.
