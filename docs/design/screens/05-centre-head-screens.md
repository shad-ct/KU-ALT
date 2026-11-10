# Screen Blueprint: Research Centre Head Screens

## 1. Context & Scope
The `CENTRE_HEAD` represents an **Affiliated College Research Centre** (e.g. Govt. College Kasaragod, St. Joseph's College Pilathara). Their scope is strictly restricted to guides, scholars, and applications linked to their specific research centre.

---

## 2. Centre Head Dashboard (`/dashboard`)

### Layout & Blueprint
- **Layout:** PageHeader -> Metric Strip -> "Needs your action" approvals inbox -> Centre Guide roster.

```
+-------------------------------------------------------------------------------------------------------+
| Research Centre Head Dashboard                                                                        |
| Dr. S. Nambiar · Centre Head · Govt. College Kasaragod (Affiliated College)                            |
+-------------------------------------------------------------------------------------------------------+
| REGISTERED GUIDES   | ACTIVE SCHOLARS     | PENDING ENDORSEMENTS | FORWARDED TO DRC    | REJECTED     |
| 14                  | 38                  | 4 Files              | 112 Total           | 3 Total      |
| In 4 departments    | Across all guides   | Action required      | Academic year 26-27 | All time     |
+-------------------------------------------------------------------------------------------------------+
| APPLICATIONS PENDING CENTRE HEAD ENDORSEMENT                                                          |
| +---------------------------------------------------------------------------------------------------+ |
| | Ref ID   | Applicant Name  | Type                | Guide Name      | Submitted   | Action         | |
| |----------+-----------------+---------------------+-----------------+-------------+----------------| |
| | REG-0042 | Dr. T. Mathew   | Guideship Reg       | N/A (Guide App) | 03 Nov 2026 | [Review File]  | |
| | APP-0810 | Deepa V. K.     | RAC Review #3       | Dr. K. Raman    | 02 Nov 2026 | [Review File]  | |
| | APP-0801 | Rajesh K.       | Centre Change       | Dr. M. Joseph   | 31 Oct 2026 | [Review File]  | |
| +---------------------------------------------------------------------------------------------------+ |
+-------------------------------------------------------------------------------------------------------+
```

---

## 3. Centre Head Approvals Inbox & Review Detail (`/approvals/:id`)

### Layout & Blueprint
- **Approvals List (`/approvals`):**
  - Displays all pending items originating from this affiliated college (Guide registrations, Scholar registrations, and Scholar service requests).
  - Filter by Application Type and Department.

- **Review Detail (`/approvals/:id`):**
  - Left Column (65%): Applicant profile, affiliation details, submitted documents, lab seat allotment declaration.
  - Right Column (35%):
    - Full Workflow Timeline: Displays applicant submission -> Guide endorsement (if scholar) -> Current Step (Centre Head) -> Next Step (DRC Convenor).
    - **Actions:**
      - Primary: `[Endorse & Forward to DRC Convenor]`
      - Warning: `[Return for Changes]`. Opens `RemarksDialog`.
      - Danger: `[Reject Application]`. Opens `RemarksDialog`.

