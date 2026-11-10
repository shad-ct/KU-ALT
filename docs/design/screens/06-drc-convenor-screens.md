# Screen Blueprint: DRC Convenor Screens

## 1. Context & Scope
The `DRC_CONVENOR` heads the Departmental Research Committee for a subject department (e.g. Department of Chemistry). Their scope spans all research centres (both the university department and affiliated colleges) offering research in their discipline. They also hold custodial authority over departmental research equipment.

---

## 2. DRC Dashboard (`/dashboard`)

### Layout & Blueprint
- **Layout:** PageHeader -> Metric Strip -> "Needs your action" approvals inbox -> Department Equipment Status -> Minimal Trend Chart.

```
+-------------------------------------------------------------------------------------------------------+
| Departmental Research Committee (DRC) Dashboard                                                       |
| Dr. V. Menon · DRC Convenor · Department of Chemistry                                                  |
+-------------------------------------------------------------------------------------------------------+
| TOTAL GUIDES        | TOTAL SCHOLARS      | PENDING REGISTRATIONS| PENDING SERVICES  | ACTIVE EQUIPMENT|
| 28                  | 74                  | 3 (1 Guide, 2 Schol) | 5 Applications    | 8 Units on Loan |
| Across 5 centres    | 48 FT, 26 PT        | Action required      | Action required   | 2 Overdue       |
+-------------------------------------------------------------------------------------------------------+
| PENDING DEPARTMENT APPROVALS                                                         [View inbox ->]  |
| +---------------------------------------------------------------------------------------------------+ |
| | Ref ID   | Applicant Name  | Type                | Research Centre         | Status               | |
| |----------+-----------------+---------------------+-------------------------+----------------------| |
| | REG-0042 | Dr. T. Mathew   | Guide Registration  | Govt College Kasaragod  | Waiting DRC Approval | |
| | REG-0045 | Deepa V. K.     | Scholar Registration| Dept of Chemistry (Uni) | Waiting DRC Approval | |
| | APP-0810 | Rahul M. Nair   | Pre-Submission      | Nehru Arts & Science    | Waiting DRC Approval | |
| +---------------------------------------------------------------------------------------------------+ |
+-------------------------------------------------------------------------------------------------------+
```

---

## 3. Department Approvals Inbox (`/approvals`) & Decision View (`/approvals/:id`)

### Layout & Blueprint
- Shows all items in the department currently at the DRC approval step.
- Review view shows full dossier: qualifications, guide endorsement remarks, centre head remarks (if affiliated), and thesis synopsis.
- Actions:
  - For Registrations: `[Approve Registration (Final)]` (triggers user activation, assigns permanent registration number).
  - For Service Applications: `[Approve & Forward to Section Staff]` (for official order/reply generation).
  - `[Return for Changes]` / `[Reject Application]` (via `RemarksDialog`).

---

## 4. Equipment Management Screens (Module 11.2)

### 4.1 Equipment Inventory (`/equipment/inventory`)
- DataTable listing every physical unit owned by the department:
  - Columns: Asset Tag, Instrument Name, Model / Manufacturer, Serial Number, Purchase Year, Custodian Lab, Operational Status (`AVAILABLE`, `ALLOCATED`, `MAINTENANCE`), Action (`[View History]`, `[Edit Unit]`).
  - Action Button top-right: `[+ Add Equipment Unit]`.

### 4.2 Allocation Requests Inbox (`/equipment/requests`)
- DataTable of scholar equipment booking requests:
  - Columns: Request ID, Scholar Name, Instrument, Requested Period (Start -> End), Total Hours, Guide Endorsement Status, Action.
  - Review Modal:
    - Verifies scholar active loan limit (max 2 active loans).
    - Checks conflict calendar for requested date window.
    - Action: `[Approve Reservation]` or `[Reject with Remarks]`.

### 4.3 Active Allocations & Handover (`/equipment/allocations`)
- Operational check-out and check-in desk:
  - Tab 1: `Ready for Handover` -> Officer records physical handover, triggers `ALLOCATED` state.
  - Tab 2: `Active Loans` -> Lists currently borrowed units with due dates and countdown.
  - Tab 3: `Overdue Items` -> Highlighted red badge with days overdue, triggers email warning.
  - Action on check-in: `[Process Return]` -> logs condition (Normal / Damaged), clears allocation flag.

