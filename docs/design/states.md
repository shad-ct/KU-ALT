# D7 — State Machine & Lifecycle Specifications

## 1. Universal Workflow State Machine (Applications & Registrations)

Every scholar registration, guideship application, and scholar service application runs through the database-backed workflow state machine documented in `05-workflow-engine.md`.

### State Diagram & Transition Matrix
```
 +-------------------------------------------------------------------------+
 |                                                                         |
 v                                                                         |
[DRAFT] --(submit)--> [IN_PROGRESS] --(return)--> [RETURNED] --(resubmit)--+
                           |
                           +--(approve next step)--> [IN_PROGRESS (step N+1)]
                           |
                           +--(final approval)-----> [APPROVED]
                           |
                           +--(reject)-------------> [REJECTED]
                           |
                           +--(cancel by owner)----> [CANCELLED]
```

### Detailed Transition Rules:
| Current State | Event / Trigger | Triggering Actor | Pre-Conditions | Next State | System Actions & Hooks |
|---|---|---|---|---|---|
| `DRAFT` | `SUBMIT` | Applicant (Scholar / Guide) | All mandatory fields populated, documents uploaded, valid CSRF. | `IN_PROGRESS` | Snapshots `workflow_instance_steps`, resolves Step 1 assignee, notifies Step 1 reviewer. |
| `IN_PROGRESS` | `APPROVE` | Current Step Assignee | User holds matching role and department/centre scope. | `IN_PROGRESS` (if intermediate) or `APPROVED` (if final) | Records history; increments `current_step_index`. If final: activates account, assigns registration no, generates timeline. |
| `IN_PROGRESS` | `RETURN` | Current Step Assignee | Remarks provided (min 10 characters). | `RETURNED` | Records remarks in history; unblocks applicant editing; sends notification to applicant. |
| `RETURNED` | `RESUBMIT` | Applicant | Corrections applied. | `IN_PROGRESS` | Re-evaluates approval step (returns to the officer who requested changes); updates history. |
| `IN_PROGRESS` | `REJECT` | Current Step Assignee | Remarks provided (min 10 characters). | `REJECTED` | Terminal state; records rejection reason; notifies applicant. |
| `DRAFT` / `RETURNED` | `CANCEL` | Applicant | Application in draft or returned state. | `CANCELLED` | Terminal state; archives file; releases reserved quotas if any. |

---

## 2. Equipment Request Lifecycle Machine (Module 11)

Governed by `06-equipment-module.md` to prevent double-booking and track physical asset custody:

```
[PENDING] --(DRC Approve)--> [APPROVED] --(Physical Handover)--> [ALLOCATED] --(Check-in)--> [RETURNED]
    |                            |                                   |
    +--(DRC Reject)--> [REJECTED] +--(Cancel)--> [CANCELLED]         +--(Due Date Pass)--> [OVERDUE]
                                                                                             |
                                                                             (Late Check-in)-+
```

### Transition Specifications:
| State | Trigger | Actor | Pre-condition | Next State | Guard / Consistency Rule |
|---|---|---|---|---|---|
| `PENDING` | Submit Request | Scholar | Scholar active, <= max active loans, dates available. | `PENDING` | Inserts equipment request record; notifies DRC Convenor. |
| `PENDING` | Approve | DRC Convenor | Unit inventory exists in department. | `APPROVED` | Validates availability for date window; reserves unit reservation. |
| `PENDING` | Reject | DRC Convenor | Remarks provided. | `REJECTED` | Releases pending reservation queue; notifies scholar. |
| `APPROVED` | Allocate (Handover) | DRC Convenor / Lab Staff | Scholar presents physical ID; specific `equipment_unit_id` selected. | `ALLOCATED` | Row lock `SELECT ... FOR UPDATE` on unit; generated-column unique index prevents double allocation; sets actual checkout timestamp. |
| `ALLOCATED` | Return (Check-in) | DRC Convenor / Lab Staff | Equipment inspected for damage; remarks optional. | `RETURNED` | Clears active allocation flag on unit; marks request completed; updates usage metrics. |
| `ALLOCATED` | Midnight Cron Job | System `node-cron` | Current UTC date > scheduled return date. | `OVERDUE` | Sets status to OVERDUE; fires automated email and portal alert to scholar and DRC; logs job run. |
| `OVERDUE` | Late Return Check-in | DRC Convenor / Lab Staff | Physical item received; condition remarks logged. | `RETURNED` | Clears overdue flag; logs late return delta (days overdue). |

---

## 3. Account Lifecycle States (`users.status`)

| Status | Permitted Routes & Capabilities | Transition Event |
|---|---|---|
| `PENDING_APPROVAL` | Can authenticate with email/password. Restricted strictly to `/auth/me` and `/registration-status`. Attempting to access dashboard returns `403 ACCOUNT_NOT_ACTIVE`. | Assigned on public signup. Transitions to `ACTIVE` upon final registration approval. |
| `ACTIVE` | Full role-based access to dashboard, applications, equipment, and profile. | Final registration approval by DRC Convenor. |
| `SUSPENDED` | Read-only or full lockout. Login blocked with message: *"Account suspended. Contact R&D Cell."* | Admin action. |
| `DEACTIVATED` | Inactive/alumni. Credentials invalid. | Scholar completion or guide retirement. |

