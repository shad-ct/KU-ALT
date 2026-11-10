# 09 — BUILD PLAN & PER-PHASE PROMPTS

Rule: **one phase per session.** Start each with:
*"Read /docs/00–08. Work only on Phase N below. Follow the Delivery Rules in 00. Whole files only."*
Commit after each phase. After every UI-bearing phase, run `/visual-critique:critique-screen` (see `08` §1) and fix high-severity items.

## Overview

| Phase | Name | Depends on | Exit check |
|---|---|---|---|
| **D** | **Design system (before any UI code)** | — | `docs/design/*` + `tokens.css` exist; checklist in `08` §9 agreed |
| 0 | Repo, Docker (MySQL), config, migrations, app shell | D | `docker compose up` → `/api/health/db` OK; shell renders with tokens |
| 1 | Auth, users, roles, RBAC, audit | 0 | Login for seeded roles; permission + scope tests pass |
| 2 | Master data (departments, centres w/ institution type), settings, files, notifications core | 1 | CRUD works; inbox + mail (mailhog) works |
| 3 | Workflow engine (conditional chains) + applications framework | 2 | `05` tests 1–10 pass |
| 4 | **Public signup + registration flows** (guide, scholar) + registration-status | 3 | Both branches end-to-end |
| 5 | Scholar service applications (8 types) + RAC + timeline | 3, 4 | Each type full flow |
| 6 | Role dashboards + people management | 4, 5 | Counters match DB |
| 7 | Staff processing, replies, certificates | 5 | PDF + reply with attachment |
| 8 | **Equipment module (Module 11)** | 2, 6 | `06` tests green |
| 9 | Reports & exports | 5–8 | PDF/Excel |
| 10 | Admin settings, jobs, backups, hardening | all | Jobs idempotent; security tests pass |
| 11 | Polish, a11y, E2E, docs | all | Definition of Done in `00` |

---

## Phase prompts

### Phase D — Design system (run inside Claude Code with designer-skills installed)
```
Read /docs/00 and /docs/08. Do NOT write application code.
Run the design steps D1–D9 from 08 §1 in order, saving outputs to docs/design/.
Constraints: minimal, professional, flat, one accent colour, no gradients/shadows/emoji, obey the "Anti-AI-look" bans in 08 §2.
Produce client/src/styles/tokens.css and a Tailwind theme extending only those tokens (no default Tailwind palette in use).
For each component in D5 write: purpose, anatomy, props, states (default/hover/focus/disabled/error/loading), keyboard behaviour, ARIA, do/don't.
End with a one-page summary of decisions and anything you need from me (logo, brand colours, official letterhead).
```

### Phase 0 — Foundation
```
Phase 0 only. Create the monorepo per 02. Server: Express, Sequelize v6 + mysql2, umzug migrations, Pino, Zod env validation,
error middleware (map Sequelize unique/FK errors), response envelope, asyncHandler, pagination + sort-whitelist utils, withTx helper with deadlock retry (3x).
docker-compose: mysql:8.0 (utf8mb4, strict mode, healthcheck), api (runs migrations), web (nginx), mailhog.
Client: Vite + React + Tailwind using tokens.css from Phase D; AppShell (sidebar + top bar) with role-based menu config, PageHeader, empty page placeholders.
GET /api/v1/health and /health/db. README quickstart. Whole files.
```

### Phase 1 — Auth & RBAC
```
Phase 1 only. Migrations + models: users, roles, permissions, role_permissions, user_roles, user_permissions, refresh_tokens, password_resets, audit_logs.
Implement 07: login/refresh (rotation + reuse detection)/logout/change/forgot/reset, lockout, rate limits, auth + permit + scope middleware, buildScope helper.
Account status gate: users.status != ACTIVE → only /auth/me and /registration-status allowed (ACCOUNT_NOT_ACTIVE).
Seed roles, permission matrix, and one ACTIVE demo user per role. Client: AuthProvider, ProtectedRoute, Can, login/forgot/change-password pages (design system), role menus.
Tests: lockout, refresh reuse, role denial, scope helper, pending-user gate.
```

### Phase 2 — Master data, settings, files, notifications
```
Phase 2 only. Migrations/models/CRUD (admin): departments (with DRC convenor), research_centres (institution_type + centre head; block signups for AFFILIATED_COLLEGE without head),
programmes, academic_years, designations, certificate_types, application_types. Settings service with cache. File upload/download pipeline per 07.
Notifications: per-recipient rows, bell + inbox, email via Nodemailer. Admin master-data pages using DataTable/FormField from the design system.
Seed: 3 departments; per department 1 university-department centre + 1–2 affiliated colleges with heads. Tests: upload rejection, notification delivery, centre-head requirement.
```

### Phase 3 — Workflow engine
```
Phase 3 only. Implement 05 fully: workflow_definitions/steps with institution_type conditions, resolver that snapshots workflow_instance_steps at submit,
assignee resolution (GUIDE/CENTRE_HEAD/DRC/STAFF + scope rules), act() with FOR UPDATE + expectedStep + history + hooks registry + deadlock retry,
availableActions, counters-based application numbers. Seed chains exactly as in 05 §2. Generic application endpoints (04). Client: shared ApplicationDetail with Timeline (shows full chain incl. future steps), Action panel, RemarksDialog.
Write all 10 tests in 05 §10 against a real MySQL test database.
```

### Phase 4 — Signup & registrations
```
Phase 4 only. Public endpoints + pages for guide signup and scholar signup per 05 §5 and 08 §6 (department → centre → guide selection for scholars; approved guides with free capacity only).
Review step must show the exact approval path for the chosen centre. Creates user(PENDING_APPROVAL)+profile+application and submits.
Registration-status page (timeline, remarks, edit-and-resubmit when returned). Approvals inbox for Guide, Centre Head, DRC with filters.
Hooks: activate account, grant role, registration_no, scholar_timeline, notify guide of new scholar.
Seed: guides/scholars at every stage in both institution types. Tests: all four registration paths end-to-end, capacity limit, rejection and return/resubmit.
```

### Phase 5 — Scholar service applications
```
Phase 5 only. 8 service types via application_types.form_schema + dynamic form renderer; required-docs enforcement; autosave drafts; cancel; return/resubmit; hooks per 05 §8.
Chain for services: Guide → [Centre Head if affiliated] → DRC → Staff. Scholar pages: Apply for Services, My Applications (tabs), Research Timeline with RAC schedule.
Approvals inbox for each approver role. Tests per type: happy path (both institution types), one rejection, one return.
```

### Phase 6 — Dashboards & people management
```
Phase 6 only. GET /dashboard role-aware, returning EXACTLY the counters in 01 per role plus "Needs your action" and recent activity (compact summary strip UI, no tile grid).
Scholar/Guide management lists + detail pages for DRC, Staff, Admin, Centre Head; Guide "My Scholars" (All/Active/Completed); date-of-submission management; RAC schedule editor.
Tests: counters equal DB aggregates; scope isolation.
```

### Phase 7 — Staff processing & certificates
```
Phase 7 only. Staff application processing: status updates, rejection reasons, official remarks, official replies with attachments (RAC reply), history.
Certificates: templates with placeholders (sanitised HTML), PDF generation, numbering via counters, history, download, revoke (admin). Staff notification sender + history.
```

### Phase 8 — Equipment (Module 11)
```
Phase 8 only. Treat 06 as the single source of truth (incl. its "MySQL implementation" section).
Migrations/models per 03 §6 including the generated-column unique index. Services: transactional allocation with SELECT … FOR UPDATE on the unit row, BULK guarded UPDATE,
state machine E4, validation E11, notifications E12, uploads E14, dashboards (06 §4), full API from 04, UI for Scholar / DRC / Admin per 06 §5 and the design system.
Overdue + due-soon jobs (idempotent via job_runs). Seed per 06 §7. Implement ALL tests in 06 §6, especially concurrent double-allocation using two real DB connections.
```

### Phase 9 — Reports
```
Phase 9 only. Report keys in 04 with SQL aggregations (indexed, parameterised), JSON + PDF + Excel export, audited exports, role-scoped pages (DRC own dept, Staff assigned centres, Admin all). Minimal charts.
```

### Phase 10 — Admin, jobs, hardening
```
Phase 10 only. Role & permission editor, staff–centre assignment, workflow definition editor (versioned; warns that in-flight snapshots are unaffected),
"Missing approver" report (centres/departments without head/convenor), settings groups, audit viewer + CSV export, backup trigger, cron jobs from 02 §6.
Security review against 07 (SQL injection attempts on sort/filter params, scope leaks, upload bypass).
```

### Phase 11 — Polish & delivery
```
Phase 11 only. Run /ui-design:responsive-audit and /visual-critique:critique-screen on every role's main screens and fix findings. A11y pass, empty/error/loading states, i18n keys,
Playwright E2E (two flows in 08 §10), README (setup, env, seed users, architecture, backup/restore), ADR.md, deployment guide.
Output a traceability table: every bullet in 01 and 06 → route + UI page.
```

---

## Reusable prompts

**Review (after each phase)**
```
Review Phase N against 00–08. Report only: (1) missed requirements, (2) scope/RBAC leaks, (3) missing validation, (4) missing audit/history, (5) untested branches,
(6) anything violating the Anti-AI-look rules or design checklist (08 §2, §9). Do not fix yet.
```
**Bug fix**
```
Context: phase, module. Symptom, expected, steps, logs. Explain root cause first, then whole corrected files and a regression test.
```
**Traceability**
```
Map every feature bullet in 01 and 06 to route, service function and UI page. Flag gaps.
```

## Remaining questions (answer when convenient — defaults in `00` apply until then)
1. Affiliated-college **scholar**: DRC final after Centre Head? (assumed yes)
2. Are service applications (RAC, title change…) also routed Guide → Centre Head (if affiliated) → DRC → Staff? (assumed yes)
3. Is Staff only involved in service applications and certificates, not registrations? (assumed yes)
4. Department vs research centre model (A4) correct?
5. Logo / brand colours / official letterhead for certificates?
6. Equipment: per-unit tracking for everything, or are consumables (bulk) in scope?
