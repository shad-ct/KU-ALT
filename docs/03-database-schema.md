# 03 — DATABASE SCHEMA (MySQL 8 / InnoDB / utf8mb4)

Conventions
- PK: `id BIGINT UNSIGNED AUTO_INCREMENT`. FKs `ON DELETE RESTRICT ON UPDATE CASCADE` unless stated.
- Every table: `created_at DATETIME(3)`, `updated_at DATETIME(3)` (UTC). Deactivatable tables: `is_active TINYINT(1) DEFAULT 1`.
- ENUMs are used for small closed sets; anything admin-editable is a lookup table, not an ENUM.
- `UQ` = unique, `IX` = index. JSON columns are for form payloads only.

---

## 1. Identity & access

**users** — `email` UQ, `password_hash`, `full_name`, `phone`, `status ENUM('PENDING_APPROVAL','ACTIVE','REJECTED','INACTIVE')`, `must_change_password`, `email_verified_at`, `failed_login_count`, `locked_until`, `last_login_at`, `department_id` FK null, `research_centre_id` FK null. IX(status), IX(department_id), IX(research_centre_id).
**roles** — `code` UQ (`SCHOLAR, GUIDE, CENTRE_HEAD, DRC_CONVENOR, STAFF, ADMIN` + custom), `name`, `is_system`.
**permissions** — `code` UQ (`module:action`).
**role_permissions** — (`role_id`,`permission_id`) PK.
**user_roles** — (`user_id`,`role_id`) PK.
**user_permissions** — extra grants: (`user_id`,`permission_id`) PK.
**staff_centres** — (`user_id`,`research_centre_id`) PK; centres a Staff user handles.
**refresh_tokens** — `user_id`, `family_id`, `token_hash` UQ, `expires_at`, `revoked_at`, `replaced_by`, `user_agent`, `ip`. IX(user_id,family_id).
**password_resets** — `user_id`, `token_hash` UQ, `expires_at`, `used_at`.
**audit_logs** — `actor_user_id`, `actor_role`, `action`, `entity_type`, `entity_id`, `before_json`, `after_json`, `ip`, `user_agent`, `request_id`, `at`. IX(entity_type,entity_id), IX(actor_user_id), IX(at). Append-only (no UPDATE/DELETE grant for the app user on this table if possible).

---

## 2. Master data

**departments** — `name`, `code` UQ, `drc_convenor_user_id` FK users null, `is_active`.
**research_centres** — `name`, `code` UQ, `department_id` FK, **`institution_type ENUM('UNIVERSITY_DEPARTMENT','AFFILIATED_COLLEGE') NOT NULL`**, `centre_head_user_id` FK null (required when AFFILIATED_COLLEGE), `college_name` null, `is_active`. IX(department_id), IX(institution_type).
 - Rule (service-level + CHECK): `institution_type='AFFILIATED_COLLEGE'` ⇒ `centre_head_user_id IS NOT NULL` before it can accept signups.
**research_programmes** — `name`, `code` UQ, `duration_years`, `is_active`.
**academic_years** — `label` UQ, `start_date`, `end_date`, `is_current`.
**designations** — `name` UQ.
**certificate_types** — `code` UQ, `name`, `template_id` FK null.
**application_types** — `code` UQ, `name`, `kind ENUM('REGISTRATION','SERVICE')`, `form_schema JSON`, `required_docs JSON`, `workflow_definition_id` FK, `is_active`.
 - Seeded codes: `SCHOLAR_REGISTRATION`, `GUIDE_REGISTRATION` (REGISTRATION); `RAC`, `TITLE_CHANGE`, `CENTRE_CHANGE`, `GUIDE_CHANGE`, `LEAVE`, `EXTENSION`, `CONDONATION`, `PRE_SUBMISSION` (SERVICE).

---

## 3. People

**guides** — `user_id` UQ FK, `designation_id`, `department_id`, `research_centre_id`, `registration_status ENUM('PENDING','APPROVED','REJECTED')`, `approved_at`, `valid_till` null, `max_scholars` INT, `phone_alt`, `bio` null. IX(research_centre_id, registration_status).
**guide_qualifications** — `guide_id`, `degree`, `institution`, `year`. **guide_specializations** — `guide_id`, `area`.
**scholars** — `user_id` UQ FK, `registration_no` UQ null (assigned on final approval), `programme_id`, `department_id`, `research_centre_id`, `guide_id` FK (selected at signup), `co_guide_id` null, `research_topic`, `research_title`, `research_area`, `dob`, `gender`, `address`, `status ENUM('PENDING','ACTIVE','COMPLETED','WITHDRAWN','SUSPENDED')`, `registration_status ENUM('PENDING','APPROVED','REJECTED')`. IX(guide_id), IX(research_centre_id), IX(department_id), IX(status).
**scholar_qualifications** — `scholar_id`, `degree`, `institution`, `year`, `percentage`.
**scholar_timeline** — `scholar_id` UQ, `date_of_registration`, `commencement_date`, `submission_due_date`, `date_of_submission`.
**scholar_milestones** — `scholar_id`, `label`, `due_date`, `completed_at`, `notes`.
**rac_schedule** — `scholar_id`, `meeting_date`, `venue`, `type`, `status ENUM('SCHEDULED','DONE','CANCELLED')`, `minutes_file_id` null. IX(meeting_date).

---

## 4. Workflow & applications (one engine for registrations AND service applications)

**workflow_definitions** — `code` UQ, `name`, `version`, `is_active`.
**workflow_steps** — `definition_id`, `step_order`, `name`, `role_code`, `institution_type ENUM('ANY','UNIVERSITY_DEPARTMENT','AFFILIATED_COLLEGE') DEFAULT 'ANY'`, `scope_rule ENUM('ASSIGNED_GUIDE','SAME_CENTRE','SAME_DEPARTMENT','ANY')`, `allowed_actions SET('VERIFY','FORWARD','REJECT','RETURN','APPROVE','REPLY')`, `require_remarks_on_reject`, `sla_days`, `is_final`. UQ(definition_id,step_order).
 - `institution_type='AFFILIATED_COLLEGE'` ⇒ step only exists for affiliated-college applications. `'ANY'` ⇒ always.
**applications** — `application_no` UQ, `application_type_id`, `scholar_id` null, `guide_id` null, `subject_user_id` (who the application is about), `department_id`, `research_centre_id`, `institution_type` (snapshot), `form_data JSON`, `status ENUM('DRAFT','SUBMITTED','IN_PROGRESS','RETURNED','APPROVED','REJECTED','CANCELLED')`, `current_step_order` null, `current_role_code` null, `rejection_reason`, `submitted_at`, `decided_at`, `version INT` (optimistic lock). IX(status, current_role_code), IX(department_id), IX(research_centre_id), IX(scholar_id), IX(application_type_id).
**workflow_instance_steps** — **snapshot of resolved steps at submit time**: `application_id`, `step_order` (re-numbered 1..n), `name`, `role_code`, `scope_rule`, `allowed_actions`, `is_final`, `sla_days`, `status ENUM('WAITING','ACTIVE','DONE','SKIPPED')`, `acted_by`, `acted_at`. UQ(application_id,step_order).
**application_documents** — `application_id`, `doc_key`, `label`, `file_id`.
**application_history** (append-only) — `application_id`, `step_order`, `action`, `from_status`, `to_status`, `actor_user_id`, `actor_role`, `remarks`, `at`. IX(application_id, at).
**official_replies** — `application_id`, `by_user_id`, `text`, `visible_to_scholar`, `sent_at`; **official_reply_files** — `reply_id`, `file_id`.

---

## 5. Files, certificates, notifications, settings

**file_assets** — `original_name`, `stored_name` UQ, `mime_type`, `size_bytes`, `checksum_sha256`, `uploaded_by`, `owner_type`, `owner_id`, `storage_path`. IX(owner_type,owner_id).
**certificate_templates** — `type_code`, `name`, `html_body MEDIUMTEXT`, `placeholders JSON`, `is_active`.
**certificates** — `certificate_no` UQ, `template_id`, `scholar_id` null, `guide_id` null, `data_snapshot JSON`, `file_id`, `generated_by`, `generated_at`, `revoked_at`.
**notification_broadcasts** — `type`, `title`, `body`, `audience JSON` (roles / departments / user ids / all), `channels SET('INAPP','EMAIL')`, `scheduled_for`, `sent_at`, `created_by`.
**notifications** — one row per recipient: `recipient_user_id`, `broadcast_id` null, `type ENUM('GENERAL','INDIVIDUAL','APPLICATION_STATUS','RAC_ALERT','ANNOUNCEMENT','EQUIPMENT')`, `title`, `body`, `link`, `read_at`, `created_at`. IX(recipient_user_id, read_at).
**settings** — `key` UQ, `group`, `value JSON`, `updated_by`.
**counters** — `key` PK, `seq BIGINT`.
**job_runs** — `job_key`, `run_date`, `started_at`, `finished_at`, `status`; UQ(job_key,run_date).

---

## 6. Equipment (Module 11)

**equipment_categories** — `name`, `department_id` null (null = global), `is_active`. UQ(department_id,name).
**equipment** — `department_id`, `research_centre_id` null, `category_id`, `name`, `code`, `description`, `usage_instructions`, `specifications JSON`, `tracking_mode ENUM('SERIALIZED','BULK') DEFAULT 'SERIALIZED'`, `total_quantity` (BULK only), `available_quantity` (BULK only, `CHECK (available_quantity >= 0)`), `max_loan_days` null, `requires_training`, `is_active`. UQ(department_id, code). IX(department_id, category_id).
**equipment_files** — `equipment_id`, `file_id`, `kind ENUM('IMAGE','DOCUMENT')`, `sort_order`.
**equipment_units** — `equipment_id`, `asset_tag` UQ, `serial_no`, `status ENUM('AVAILABLE','ALLOCATED','UNDER_MAINTENANCE','RETIRED')`, `condition ENUM('NEW','GOOD','FAIR','POOR','DAMAGED')`, `purchase_date`, `warranty_until`. IX(equipment_id,status).
**equipment_maintenance_log** (append-only) — `unit_id`, `logged_at`, `type`, `notes`, `by_user_id`, `next_due`.
**equipment_requests** — `request_no` UQ, `scholar_id`, `guide_id`, `department_id` (owning), `equipment_id`, `quantity DEFAULT 1`, `purpose TEXT`, `requested_from DATE`, `expected_return_date DATE`, `status ENUM('PENDING','APPROVED','REJECTED','ALLOCATED','RETURNED','OVERDUE','CANCELLED')`, `remarks`, `decided_by`, `decided_at`, `was_overdue`, `version`. IX(department_id,status), IX(scholar_id,status), IX(equipment_id).
**equipment_allocations** — `request_id` UQ, `equipment_id`, `unit_id` null (SERIALIZED), `quantity`, `scholar_id`, `allotted_by`, `allocated_on DATE`, `expected_return_date DATE`, `returned_on` null, `return_condition` null, `return_notes`, `received_by`, `status ENUM('ACTIVE','OVERDUE','RETURNED')`,
 **`active_unit_id BIGINT UNSIGNED GENERATED ALWAYS AS (IF(status IN ('ACTIVE','OVERDUE'), unit_id, NULL)) STORED`**, **`UNIQUE KEY uq_one_active_allocation_per_unit (active_unit_id)`** ← DB-level guarantee that one physical unit can't have two live allocations (MySQL permits many NULLs in a unique index, so returned rows never collide).
**equipment_request_history** (append-only) — `request_id`, `from_status`, `to_status`, `actor_user_id`, `remarks`, `at`.

---

## 7. Migration order
1 identity → 2 master data → 3 people → 4 workflow/applications → 5 files/notifications/settings → 6 equipment → 7 seed (roles, permissions, workflow definitions & steps, application types, demo data).

## 8. Constraint checklist (tests must prove)
- Duplicate email rejected (UQ).
- Affiliated-college centre without a head cannot accept signups (service rule).
- Two concurrent allocations of the same unit → exactly one succeeds (row lock + unique index).
- BULK `available_quantity` never negative (CHECK + guarded UPDATE).
- Deleting a department/centre/equipment with history is blocked (RESTRICT).
- `application_no` / `request_no` / `certificate_no` unique under concurrent creation.
