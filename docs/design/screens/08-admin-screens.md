# Screen Blueprint: Super Administrator Screens

## 1. Context & Scope
The `ADMIN` possesses global supervisory access. The Admin interface prioritizes system health, data integrity, user lifecycle management, master data governance, dynamic workflow chain versioning, and compliance auditability.

---

## 2. Administrator Dashboard (`/dashboard`)

### Layout & Blueprint
- **Layout:** PageHeader -> Global KPI Metric Strip -> System Operational Alerts ("Missing Approvers") -> Quick Management Links.

```
+-------------------------------------------------------------------------------------------------------+
| System Administration & Governance Dashboard                                                          |
| Kannur University R&D Cell Unified System Core                                                        |
+-------------------------------------------------------------------------------------------------------+
| TOTAL SCHOLARS      | RECOGNIZED GUIDES   | ACTIVE CENTRES      | TOTAL APPLICATIONS| SYSTEM ALERTS   |
| 342                 | 89                  | 24 (6 Uni, 18 Coll) | 1,489             | 1 Alert         |
| Active in system    | Active supervisors  | Department-linked   | All academic years| Missing Approver|
+-------------------------------------------------------------------------------------------------------+
| SYSTEM GOVERNANCE ALERTS                                                            [Review all (1)]  |
| +---------------------------------------------------------------------------------------------------+ |
| | [!] Affiliated Centre Missing Centre Head: St. Joseph's College, Pilathara (Dept of History)       | |
| | Candidate signups for this centre are currently held in draft status.  [Assign Centre Head ->]    | |
+---------------------------------------------------------------------------------------------------+ |
+-------------------------------------------------------------------------------------------------------+
```

---

## 3. Master Data Management (`/master/*`)

### 3.1 Research Centres Management (`/master/centres`)
- DataTable listing all university centres:
  - Columns: Centre Code, Centre Name, Department, Type (`UNIVERSITY_DEPARTMENT` / `AFFILIATED_COLLEGE`), Assigned Centre Head, Status (Active/Inactive), Actions (`[Edit]`, `[Assign Head]`).
  - Validation Warning: Prevents activating an `AFFILIATED_COLLEGE` without an assigned `CENTRE_HEAD`.

### 3.2 Departments Management (`/master/departments`)
- Lists academic subject departments with assigned DRC Convenor.

---

## 4. User & Role Lifecycle Management (`/users`)
- DataTable listing all portal users:
  - Columns: Name, Official Email, Roles (Pills: Guide, DRC Convenor), Department / Centre, Account Status (`ACTIVE`, `PENDING_APPROVAL`, `SUSPENDED`, `DEACTIVATED`), Last Login, Actions.
  - Action Drawer: Reset Password, Deactivate / Suspend Account, Assign / Revoke Secondary Roles.

---

## 5. Workflow Engine Editor (`/workflows`)
- Visual display of active database-backed workflow definitions (`workflow_definitions` and `workflow_steps`):
  - Rule: Explicit institutional branching rules preview (`institution_type == 'AFFILIATED_COLLEGE'` vs `'UNIVERSITY_DEPARTMENT'`).
  - Immutability Notice: In-flight applications maintain snapshot steps (`workflow_instance_steps`); edits create a new version of the workflow definition without corrupting active applications.

---

## 6. Audit Log Viewer (`/audit-logs`)
- High-density tabular stream of all system state changes:
  - Columns: Timestamp (UTC / IST), Actor Name, Role, Action Taken (`APPROVE`, `RETURN`, `REJECT`, `ALLOCATE`, `LOGIN`), Resource (`Application #0812`), IP Address, User Agent, Changes (Old -> New values).
  - Export: `[Export Filtered Audit Log to CSV]`.

