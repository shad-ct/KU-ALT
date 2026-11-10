# 05 — WORKFLOW ENGINE & REGISTRATION FLOW

## 1. Purpose
One engine moves every "approvable thing" — **guide registration, scholar registration, and the 8 scholar service applications** — through steps that depend on the applicant's `institution_type`. Equipment requests use their own small state machine (see `06`) but share logging and notifications.

## 2. The chains (seed these; Admin can edit)

Legend: `[AC]` = only if centre is `AFFILIATED_COLLEGE`. Steps without a tag apply to both institution types.

| Application | Step 1 | Step 2 | Step 3 | Step 4 (final) |
|---|---|---|---|---|
| **GUIDE_REGISTRATION** | Research Centre Head `[AC]` | **DRC Convenor** (final) | | |
| **SCHOLAR_REGISTRATION** | **Guide** (the one selected at signup) | Research Centre Head `[AC]` | **DRC Convenor** (final) | |
| RAC / Title Change / Centre Change / Guide Change / Leave / Extension / Condonation / Pre-Submission | Guide | Research Centre Head `[AC]` | DRC Convenor | **Staff** (process, official reply, final) |

Resulting paths:
- Guide, **university dept:** DRC. Guide, **affiliated college:** Centre Head → DRC.
- Scholar, **university dept:** Guide → DRC. Scholar, **affiliated college:** Guide → Centre Head → DRC.
- Service application, university dept: Guide → DRC → Staff. Affiliated: Guide → Centre Head → DRC → Staff.

> Assumptions A5/A6/A7 in `00`: DRC is the final approver for affiliated scholars (mirrors guides); service applications reuse the same branching; Staff is only in the service-application tail. Keep chains data-driven so a change is a DB edit, not a code change.

## 3. Resolving the chain (key mechanism)

At **submit**:
1. Load `application_type.workflow_definition` and its `workflow_steps`.
2. Read the applicant's `research_centre.institution_type`.
3. Keep steps where `step.institution_type IN ('ANY', centre.institution_type)`.
4. **Renumber** the kept steps 1..n and write them to `workflow_instance_steps` (snapshot). Set step 1 `ACTIVE`, others `WAITING`.
5. Set `applications.status='IN_PROGRESS'`, `current_step_order=1`, `current_role_code=step1.role`.
6. Notify the step-1 approver(s) (see §4 for who "the approver" is).

Because the snapshot is stored, later edits to a definition never change in-flight applications.

## 4. Who may act on a step (assignee resolution)

| `role_code` | `scope_rule` | Eligible user |
|---|---|---|
| GUIDE | ASSIGNED_GUIDE | the guide on `scholars.guide_id` (or co-guide if enabled) |
| CENTRE_HEAD | SAME_CENTRE | `research_centres.centre_head_user_id` of the applicant's centre |
| DRC_CONVENOR | SAME_DEPARTMENT | `departments.drc_convenor_user_id` of the applicant's department |
| STAFF | SAME_CENTRE | any Staff whose `staff_centres` contains the centre (or all, if none configured) |

If no eligible user exists for a step (e.g. a centre has no head) → block **submit** with a clear error (`WORKFLOW_NO_ASSIGNEE`) and show Admin a "Missing approver" list.

## 5. Signup + registration specifics

**Guide signup (public):** choose department → research centre → fill profile, qualifications, specialization, upload documents → creates `users(status=PENDING_APPROVAL)` + `guides(registration_status=PENDING)` + `applications(type=GUIDE_REGISTRATION)` and submits it immediately.

**Scholar signup (public):** choose department → centre → **guide** (dropdown lists only `guides.registration_status='APPROVED'` of that centre with free capacity `< max_scholars`) → programme, topic, qualifications, documents → creates `users(PENDING_APPROVAL)` + `scholars(PENDING)` + `applications(SCHOLAR_REGISTRATION)` submitted.

While `PENDING_APPROVAL`: user may log in but only sees **Registration status** (current step, who it's waiting on, remarks, edit-and-resubmit if returned). All other routes return `403 ACCOUNT_NOT_ACTIVE`.

**On final approval (hook `onApproved`):**
- GUIDE_REGISTRATION → `users.status=ACTIVE`, `guides.registration_status=APPROVED`, `approved_at`, role `GUIDE` granted, notify guide.
- SCHOLAR_REGISTRATION → `users.status=ACTIVE`, `scholars.registration_status=APPROVED`, `status=ACTIVE`, assign `registration_no` (counter), create `scholar_timeline` with `date_of_registration`, grant `SCHOLAR`, notify scholar + guide ("new scholar assignment").
**On reject:** `users.status=REJECTED` (account kept for audit), remarks shown; user may re-apply with the same email via "Resubmit" only if the rejecting step allows `RETURN` — otherwise Admin must reopen.
**On return:** application → `RETURNED`; applicant edits and resubmits; **resumes at the same step**, snapshot unchanged.

## 6. Actions & status model

`DRAFT → SUBMITTED → IN_PROGRESS → APPROVED | REJECTED`; side exits `RETURNED` (to applicant), `CANCELLED` (applicant, before decision).

- `VERIFY` / `FORWARD` (same transition internally; both labels kept for UI/history): mark step `DONE`, activate the next snapshot step. If the step `is_final`, behave as `APPROVE`.
- `APPROVE` (final step): status `APPROVED`, run `onApproved` hook.
- `REJECT`: remarks required if `require_remarks_on_reject`; status `REJECTED`.
- `RETURN`: remarks required; status `RETURNED`.
- `REPLY` (Staff): adds `official_replies` row (+ files); does not change status.

## 7. Engine API (service layer)

```js
workflowService.submit(applicationId, actor)        // §3, in a transaction
workflowService.act(applicationId, actor, { action, remarks, attachmentFileIds, expectedStep })
workflowService.availableActions(application, actor)  // drives UI buttons
workflowService.reassignStep(applicationId, stepOrder, newUserId) // [A] only, audited
```

`act()` algorithm (one DB transaction, with `withTx` + retry on deadlock):
1. `SELECT … FROM applications WHERE id=? FOR UPDATE`.
2. Load the ACTIVE snapshot step; check `expectedStep === current_step_order` else `WORKFLOW_STEP_MISMATCH`.
3. Assert actor holds `step.role_code` **and** passes the scope rule (§4) else `FORBIDDEN`/`SCOPE_VIOLATION`.
4. Assert `action ∈ step.allowed_actions`; remarks if required.
5. Compute next state; update snapshot step (`DONE`, `acted_by`, `acted_at`), next step → `ACTIVE`, bump `applications.version`.
6. Insert `application_history`.
7. If final → run `hooks[typeCode].onApproved(application, tx)`.
8. Commit, then (outside the tx) send notifications + audit entry.

## 8. Side-effect hooks on APPROVE (registry `hooks/<TYPE>.js`)

| Type | Effect |
|---|---|
| GUIDE_REGISTRATION | activate user, approve guide profile, grant role |
| SCHOLAR_REGISTRATION | activate user, `registration_no`, timeline, grant role, notify guide |
| TITLE_CHANGE | update `scholars.research_title` (previous title kept in history) |
| GUIDE_CHANGE | update `scholars.guide_id`; notify old and new guide |
| CENTRE_CHANGE | update scholar centre/department; **re-check institution_type for future applications** |
| EXTENSION | update `scholar_timeline.submission_due_date` |
| LEAVE | add leave record to timeline |
| CONDONATION | record condonation |
| RAC | Staff sets/updates `rac_schedule` entry |
| PRE_SUBMISSION | enable `date_of_submission` entry |

## 9. SLA & reminders
`sla_days` per step. Daily job notifies the eligible approver when `now − step_activated_at > sla_days`. Dashboards' "Pending tasks" use the same query.

## 10. Required tests
1. Guide registration: university dept → only DRC step exists; affiliated → Centre Head then DRC (assert snapshot rows).
2. Scholar registration: both branches, including that Guide is always step 1.
3. Scholar signup lists only APPROVED guides with free capacity from the chosen centre.
4. Wrong role / wrong centre's head / other department's DRC → denied.
5. Reject without remarks → validation error when required.
6. Return → edit → resubmit resumes at the same step; snapshot unchanged.
7. Concurrent `act()` on the same step → exactly one wins (`WORKFLOW_STEP_MISMATCH` for the other).
8. Editing a definition does not alter in-flight snapshots.
9. Centre without a head blocks submit with `WORKFLOW_NO_ASSIGNEE`.
10. Pending-approval user cannot access anything except registration status.
