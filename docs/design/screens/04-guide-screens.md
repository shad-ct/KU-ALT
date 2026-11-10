# Screen Blueprint: Guide Screens

## 1. Guide Dashboard (`/dashboard`)

### Layout & Blueprint
- **Layout:** PageHeader -> Metric Summary Strip -> "Needs your action" priority table -> Recent scholar updates.

```
+-------------------------------------------------------------------------------------------------------+
| Research Guide Dashboard                                                                              |
| Dr. K. Raman · Associate Professor · Dept of Chemistry · Centre: University Campus (University Dept)    |
+-------------------------------------------------------------------------------------------------------+
| ASSIGNED SCHOLARS   | ACTIVE SCHOLARS     | VACANT QUOTA SLOTS  | PENDING YOUR REVIEW | PROCESSED     |
| 6                   | 5                   | 2 Slots Remaining   | 3 Applications      | 28 Total      |
| Statutory Limit: 8  | Full-time: 4, PT: 1 | Max capacity: 8     | Action required     | All time      |
+-------------------------------------------------------------------------------------------------------+
| NEEDS YOUR ACTION (APPLICATIONS PENDING VERIFICATION)                                [View all ->]    |
| +---------------------------------------------------------------------------------------------------+ |
| | Ref ID   | Scholar Name    | Application Type    | Submitted   | Waiting Since | Action           | |
| |----------+-----------------+---------------------+-------------+---------------+------------------| |
| | APP-0819 | Deepa V. K.     | RAC Review #3       | 04 Nov 2026 | 2 days ago    | [Review File ->] | |
| | APP-0814 | Anoop M.        | Leave Request       | 02 Nov 2026 | 4 days ago    | [Review File ->] | |
| | REG-0044 | Haritha P.      | Scholar Registration| 01 Nov 2026 | 5 days ago    | [Review File ->] | |
| +---------------------------------------------------------------------------------------------------+ |
+-------------------------------------------------------------------------------------------------------+
```

---

## 2. Approvals Inbox (`/approvals`) & Review Detail (`/approvals/:id`)

### Layout & Blueprint
- **Approvals List (`/approvals`):**
  - Unified table containing everything waiting on *this guide*: candidate scholar registrations and service applications.
  - FilterBar: Filter by Type (Scholar Registration, RAC, Title Change, Leave), Search by scholar name.
  - Columns: Reference ID, Scholar Name, Application Type, Date Submitted, Action link.

- **Review Detail (`/approvals/:id`):**
  - Left Column (65%): Scholar facts, academic records, submitted application data, document previewers.
  - Right Column (35%):
    - Sequential Approval Timeline (showing Guide as current step, then next approver DRC Convenor or Centre Head).
    - **Action Panel:**
      - Button 1 (Primary): `[Verify & Forward to DRC Convenor]` (or `[Verify & Forward to Centre Head]`).
      - Button 2 (Secondary Warning): `[Return for Changes]`. Opens `RemarksDialog` (mandatory remarks).
      - Button 3 (Danger): `[Reject Application]`. Opens `RemarksDialog` (mandatory justification).

---

## 3. My Scholars (`/scholars`) & Scholar Detail (`/scholars/:id`)

### Layout & Blueprint
- **Scholars List:**
  - Segmented control tabs: `All Scholars (6)` | `Active (5)` | `Completed / Awarded (1)`.
  - DataTable columns: Registration Number, Scholar Name, Category (Full-Time / Part-Time), Admission Date, RAC Stage, Progress Status, Action.
- **Scholar Detail (`/scholars/:id`):**
  - Academic Profile, Topic, Fellowship details.
  - Comprehensive history of all applications submitted by this scholar.
  - RAC Milestone Schedule with status (Completed, Due, Overdue).

