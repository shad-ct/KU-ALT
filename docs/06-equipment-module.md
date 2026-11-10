# 06 — MODULE 11: RESEARCH EQUIPMENT MANAGEMENT

**Purpose:** To provide a centralized equipment management and allocation system where Research Department Heads (DRC Convenors) can manage departmental equipment inventories, scholars can request equipment, and administrators can monitor equipment availability and requests across all departments.

> This module is **additive**: it plugs into existing roles (Scholar, DRC Convenor, Administrator), the notification service, the audit log, reports/export, and the scheduler. Do not modify other modules' behaviour.

---

## 0. MySQL implementation (BINDING — supersedes the Mongo-style wording in E6 and §3)

Schema is in `03` §6. Equipment is owned by a **department** (managed by that department's DRC Convenor).

**Double-allocation prevention, 3 layers:**
1. Run allocation inside `withTx` (retry on deadlock 1213).
2. `SELECT * FROM equipment_units WHERE id=? AND equipment_id=? FOR UPDATE`; if `status <> 'AVAILABLE'` → `EQUIPMENT_ALREADY_ALLOCATED`. If no `unitId` given, pick the next unit with `SELECT … WHERE status='AVAILABLE' ORDER BY id LIMIT 1 FOR UPDATE SKIP LOCKED`.
3. DB guarantee: `equipment_allocations.active_unit_id` is a generated column (`unit_id` while status is ACTIVE/OVERDUE, else NULL) with a **UNIQUE** index → a second live allocation for the same unit fails with `ER_DUP_ENTRY`, mapped to `EQUIPMENT_ALREADY_ALLOCATED`.

**BULK items:** `UPDATE equipment SET available_quantity = available_quantity - :q WHERE id=? AND available_quantity >= :q`; 0 affected rows → `EQUIPMENT_UNAVAILABLE`. Return does the inverse `+ :q`. `CHECK (available_quantity >= 0)` backs it up.

**Allocation steps (inside one transaction):** lock request row (`status='APPROVED'` else `INVALID_TRANSITION`) → assert caller is the DRC of `request.department_id` → validate dates vs `max_loan_days` → lock/pick unit (or decrement BULK) → insert `equipment_allocations(status='ACTIVE')` → set unit `ALLOCATED` → set request `ALLOCATED` → insert `equipment_request_history` + audit → commit → notify scholar with usage instructions.

**Concurrency test (required):** two separate DB connections allocate the same unit simultaneously; exactly one succeeds, the other gets `EQUIPMENT_ALREADY_ALLOCATED`; final DB state has one ACTIVE allocation.

**Overdue job:** `UPDATE equipment_allocations SET status='OVERDUE' WHERE status='ACTIVE' AND expected_return_date < CURDATE()` (+ matching requests, `was_overdue=1`), guarded by a `job_runs` row so it runs once per day.

**Counter consistency check (test):** `available + allocated + under_maintenance + retired = total units` per department.

---

## 1. Feature specification (verbatim from requirements)

### 11.1 Scholar Module – Equipment Requests
- View the list of available research equipment.
- Browse equipment by department and category.
- View complete equipment details: Equipment Name; Description and Specifications; Department / Research Centre; Availability Status; Usage Instructions (if applicable).
- Submit equipment requests.
- Specify the purpose of the request.
- Select the required duration or expected return date.
- View submitted equipment requests.
- Track request status (Pending, Approved, Rejected, Allocated, Returned).
- View allocation details and instructions.
- Receive notifications regarding request approval and allocation.
- View equipment request history.

### 11.2 DRC Convenor Module – Equipment Management
**Equipment Inventory Management:** add new equipment; edit/update details; delete or deactivate records; manage categories; add specifications and descriptions; upload equipment images and supporting documents; maintain quantity and availability; update condition and maintenance status.

**Equipment Request Management:** view all requests from scholars in the department; view individual scholar & request details; approve or reject; add remarks or rejection reasons; allot available equipment to scholars; specify allocation date and expected return date; manage allocation records; update equipment status (Allocated, Returned, Under Maintenance); view currently allocated equipment; maintain allocation and return history.

**Dashboard:** total equipment count; available; allocated; under maintenance; total requests received; pending requests; approved and rejected requests; currently allocated equipment.

### 11.3 Administrator Module – Centralized Equipment Monitoring
**Department Management:** list all research departments and centres; department-wise inventory; department-wise availability; access equipment details across all departments.

**Equipment Monitoring:** complete list across departments; individual details; filter by department, category, availability; monitor allocation and usage; allocated equipment with assigned scholars; monitor maintenance status.

**Equipment Request Monitoring:** all requests across departments; scholar details and requested equipment; filter by department, scholar, equipment, request status; view pending/approved/rejected/allocated; monitor allocation history; view return status and **overdue allocations**.

**Dashboard:** total research departments; total equipment across departments; total available; total allocated; total under maintenance; total scholar equipment requests; department-wise equipment statistics; pending requests; currently allocated equipment.

### 11.4 Workflow
1. **Scholar** — browse equipment and submit a request
2. **DRC Convenor / Research Department Head** — review and approve or reject
3. **Equipment Allocation** — allot equipment and specify allocation & return dates
4. **Equipment Return** — record return and update availability

**ADMINISTRATOR – CENTRALIZED MONITORING:** monitors all departments, inventories, scholar requests, allocations, and return records.

### 11.5 Request statuses
| Status | Description |
|---|---|
| Pending | Request submitted by scholar. |
| Approved | Request approved by department head. |
| Rejected | Request rejected with remarks. |
| Allocated | Equipment allotted to scholar. |
| Returned | Equipment returned successfully. |
| Overdue | Equipment not returned by the expected date. |
| Cancelled | Request cancelled. |

**Binding recommendation:** department-wise inventory with **individual equipment records and allocation history** → monitor utilization, prevent double allocation, maintain transparency.

---

## 2. Design decisions (implement exactly)

| # | Decision |
|---|---|
| E1 | **Two-level model:** `Equipment` (catalog/model, e.g. "Centrifuge XYZ") and `EquipmentUnit` (physical asset with `assetTag`). `trackingMode: SERIALIZED` ⇒ each allocation binds to one unit. `BULK` ⇒ consumables/identical items tracked by quantity only (no units). Default SERIALIZED. |
| E2 | **Availability is computed, never hand-edited:** SERIALIZED → count of units with `status=AVAILABLE`; BULK → `totalQuantity − Σ active allocation quantities − underMaintenanceQty`. Expose `availableCount` and `availabilityStatus: AVAILABLE | LIMITED (≤ threshold) | UNAVAILABLE`. |
| E3 | **Scope:** Scholars browse all departments' equipment (read-only) but may **request** only from their own department unless `allowCrossDepartmentRequests` is true (then the request is routed to the **owning** department's DRC Convenor). DRC Convenor manages only own department. Admin is read-only monitoring (+ optional audited override flag). |
| E4 | **Request lifecycle (state machine):** `PENDING → APPROVED → ALLOCATED → RETURNED`; exits: `PENDING → REJECTED`, `PENDING/APPROVED → CANCELLED`, `ALLOCATED → OVERDUE → RETURNED`. Any other transition ⇒ `INVALID_TRANSITION`. |
| E5 | **Approve ≠ Allocate.** Approval records intent and reserves nothing; allocation picks the actual unit/quantity and sets dates. (Optional setting `equipment.autoAllocateOnApprove=false` default.) |
| E6 | **Double-allocation prevention (3 layers):** (a) allocate inside a transaction; (b) atomic `findOneAndUpdate({_id: unitId, status: 'AVAILABLE'}, {status:'ALLOCATED', currentAllocation})` — if null ⇒ `EQUIPMENT_ALREADY_ALLOCATED`; (c) partial unique index on `EquipmentAllocation.unit` where status in `[ACTIVE, OVERDUE]`. For BULK use `$inc` with a guard `availableQty >= requested`. |
| E7 | **Maintenance:** a unit `UNDER_MAINTENANCE` cannot be allocated. Moving an `ALLOCATED` unit to maintenance is blocked (must be returned first) unless force flag + remarks. Maintenance log entries are append-only. |
| E8 | **Deactivate instead of delete.** Blocked when any unit is ALLOCATED or any request is PENDING/APPROVED (offer to reject/cancel them first). |
| E9 | **Overdue:** daily job sets `Allocation.status=OVERDUE` and `Request.status=OVERDUE` when `expectedReturnDate < today` and not returned; notifies scholar + DRC Convenor (+ optional reminder N days before due via `equipment.dueReminderDays`). Returning an overdue item moves request to `RETURNED` (keep an `wasOverdue` flag + days overdue for reports). |
| E10 | **Return:** DRC records `returnedOn`, `returnCondition`, notes. Unit goes to `AVAILABLE` (or `UNDER_MAINTENANCE` if condition is DAMAGED/POOR and DRC chooses so). |
| E11 | **Validation rules:** `expectedReturnDate` ≥ requestedFrom/today and ≤ today + `equipment.maxLoanDays` (per-equipment override); purpose min 10 chars; scholar cannot hold more than `equipment.maxActivePerScholar` active allocations (setting, default 3); scholar must have `registration.status=APPROVED` and `status=ACTIVE`. |
| E12 | **Notifications (type EQUIPMENT):** to DRC on new request; to scholar on approve/reject/allocate/overdue/return-recorded; to DRC+scholar on overdue; deep-link to request page. |
| E13 | **History:** every transition writes `EquipmentRequestHistory` and `AuditLog`. Inventory edits write `AuditLog` with before/after. |
| E14 | **Uploads:** images (jpg/png/webp ≤ 5 MB, max 6), documents (pdf ≤ 10 MB). Images served through authenticated route with caching headers. |

---

## 3. Allocation algorithm (reference)

```
allocate(requestId, actor, {unitId?, quantity?, allocatedOn, expectedReturnDate}):
  start transaction
    req = Request.findOne({_id, status:'APPROVED'})         else INVALID_TRANSITION
    assert actor is DRC of req.department (scope)
    assert expectedReturnDate >= allocatedOn and <= maxLoan
    if equipment.trackingMode == SERIALIZED:
        unit = EquipmentUnit.findOneAndUpdate(
            {_id: unitId, equipment: req.equipment, status:'AVAILABLE'},
            {$set:{status:'ALLOCATED'}}, {session})
        if !unit → EQUIPMENT_ALREADY_ALLOCATED
        (if unitId omitted: pick first AVAILABLE by FIFO / lowest usage — same atomic update with find criteria)
    else (BULK):
        update Equipment where availableQty >= qty with $inc availableQty:-qty
        if no match → EQUIPMENT_UNAVAILABLE
    alloc = Allocation.create({... status:'ACTIVE'})
    unit.currentAllocation = alloc._id
    req.status='ALLOCATED'; req.allocation = alloc._id
    history + audit
  commit
  after commit: notify scholar (+ include usage instructions)
```

## 4. Dashboard counters (exact definitions)

**DRC (own department):** `totalEquipment` (units or bulk qty, active), `available`, `allocated`, `underMaintenance`, `totalRequests`, `pendingRequests`, `approvedRequests`, `rejectedRequests`, `currentlyAllocated` (+ `overdue` badge).
**Admin (all):** `totalDepartments` (with equipment), `totalEquipment`, `totalAvailable`, `totalAllocated`, `totalUnderMaintenance`, `totalScholarRequests`, `pendingRequests`, `currentlyAllocated`, `departmentWise[]` = `{department, total, available, allocated, maintenance, pending, overdue}`.
Charts: department-wise stacked bar (available/allocated/maintenance), requests-by-status donut, requests over time line.
Ensure `available + allocated + underMaintenance (+ retired) = total` — add a test.

## 5. UI requirements (see also `08`)

**Scholar:** `/equipment` (grid/list toggle, filters: department, category, availability, search) → `/equipment/:id` (gallery, specs table, availability badge, usage instructions, "Request" button disabled with reason when not allowed) → request form dialog (purpose, expected return date picker, quantity if BULK) → `/equipment/requests` (tabs by status, status chips, timeline) → request detail (allocation dates, assigned unit tag, instructions, history).
**DRC:** `/drc/equipment` dashboard · inventory table (add/edit/deactivate, units sub-table, condition & maintenance modal) · requests queue (filters, row actions approve/reject/allocate) · allocation page (current + history tabs, "Record return" modal, overdue highlighted red) · categories manager.
**Admin:** `/admin/equipment` dashboard · departments table → drill-down inventory · all-equipment explorer · all-requests monitor · allocations (with "Overdue only" toggle) · maintenance list · export buttons.

## 6. Tests required
1. Two DRC clicks allocating the same unit concurrently → exactly one succeeds (`Promise.all` test).
2. BULK over-allocation rejected.
3. Cross-department DRC cannot approve/allocate (SCOPE_VIOLATION).
4. Scholar cannot see/cancel another scholar's request.
5. Deactivate blocked with active allocation.
6. Overdue job idempotent; flips correct records only.
7. Return restores availability; counters stay consistent.
8. Maintenance unit not allocatable.
9. Max active per scholar enforced.

## 7. Seed data
3 departments · 4 categories · 12 equipment (mix SERIALIZED/BULK) · ~30 units · 15 requests across all statuses incl. 2 overdue.
