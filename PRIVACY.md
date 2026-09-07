# RouteWise — Privacy, Data Minimization & Retention Architecture (Stage 27)

## 1. Data Minimization Principles
RouteWise treats student and transportation telemetry data with elevated care. The platform adheres to four cardinal rules:
1. **Collect Only What Is Needed**: Student records require only full name, school ID, grade, and assigned bus stop coordinates. No medical histories, biometric identifiers, or financial information are stored.
2. **Limit Real-Time Exposure**: Vehicle GPS telemetry is acquired strictly during active, driver-dispatched trips.
3. **Automatic Teardown**: Location listeners in the client are terminated upon trip conclusion and upon session logout (`locationManager.stopWatching()`).
4. **Scoping by Default**: Parents can view data only for their registered children; drivers view only their active manifest.

---

## 2. Retention & Deletion Schedule

| Category | Retention Period | Deletion / Archival Strategy | Governance Note |
| :--- | :--- | :--- | :--- |
| **Active Trip Telematics** | 90 Days active | Archived to Coldline storage | Granular waypoints consolidated into daily summary logs. |
| **Student Attendance Registers** | Current School Year (365 Days) | Preserved for compliance reporting | Historical attendance immutable to prevent record alteration. |
| **Safety & Incident Reports** | 7 Years | Archival / Status `closed` | Required for institutional safety audit compliance; physical delete denied. |
| **Vehicle Inspection Records** | 3 Years | Archival | Vehicle compliance records maintained for transit authority audits. |
| **Audit Logs** | 7 Years | Immutable Append-Only | Hard delete denied (`allow delete: if false;`). |
| **Deactivated User Accounts** | Immediate deactivation | Soft deletion / marked `inactive` | Retains audit actor attribution (`Former User`) without orphaning historical rosters. |

---

## 3. Public Disclosure & Transparency
RouteWise provides public disclosures accessible to all guardians and transport staff:
- **Privacy Policy**: Accessible at `/privacy`.
- **Terms of Service**: Accessible at `/terms`.
- **District Agreements**: Specific institutional agreements (such as FERPA or state-level Student Data Privacy Agreements) must be executed at the district administration level.
