# 00 — MASTER PROMPT: Kannur University R&D Cell Unified Portal

> Paste this file FIRST into your AI coding tool (Claude Code recommended), then attach files 01–09.
> Build in the order defined in `09-build-plan-and-agent-prompts.md`. Do NOT build everything in one shot.
> **Design comes before UI code** — see `08-frontend-ui-design.md` (Phase D in `09`).

---

## ROLE

You are a senior full-stack engineer. You are building the **Kannur University – Research and Development Cell Unified Portal**: a role-based web system for scholar registration, guide registration, scholar service applications (RAC, title change, etc.), certificates, notifications, reports, and research equipment management.

## READ ORDER (mandatory before writing code)

1. `01-product-requirements.md` — roles, modules, features, **registration & approval flow (binding)**
2. `02-architecture.md` — stack, folder structure, layering rules
3. `03-database-schema.md` — MySQL tables, constraints, indexes
4. `04-api-spec.md` — REST endpoints
5. `05-workflow-engine.md` — conditional approval chains
6. `06-equipment-module.md` — Module 11
7. `07-rbac-security.md` — auth, permissions, audit, uploads
8. `08-frontend-ui-design.md` — design principles, tokens, screens, designer-skills workflow
9. `09-build-plan-and-agent-prompts.md` — phases and per-phase prompts

Conflict rule: lower number wins, EXCEPT `06` wins for equipment and `05` wins for approval flow.

## TECH STACK (fixed)

- **Frontend:** React 18 + Vite, React Router, TanStack Query, React Hook Form + Zod, Tailwind CSS (custom tokens, see 08), Radix primitives for dialogs/menus/tabs. Charts: minimal (Recharts, 2–3 charts total).
- **Backend:** Node.js 20 + Express, **Sequelize v6 + mysql2** with migrations (umzug/sequelize-cli), Zod validation, JWT (access + refresh), Multer, Nodemailer, node-cron, Pino.
- **Database:** **MySQL 8.0**, InnoDB, `utf8mb4`, strict SQL mode, timezone stored UTC.
- **Reports/Certificates:** Puppeteer (HTML→PDF), ExcelJS.
- **Tests:** Vitest/Jest + Supertest (run against a real MySQL test DB, not mocks), Playwright for 2 E2E flows.
- **Infra:** Docker Compose (api, web, mysql, mailhog), `.env` driven.

## THE APPROVAL FLOW (binding — memorise this)

The portal has two kinds of institutions, stored as `research_centres.institution_type`:
- `UNIVERSITY_DEPARTMENT`
- `AFFILIATED_COLLEGE`

**Guide account (registration):**
- Guide signs up → if centre is `AFFILIATED_COLLEGE`: **Research Centre Head** approves → then **DRC Convenor** approves.
- If centre is `UNIVERSITY_DEPARTMENT`: **DRC Convenor** approves directly.

**Scholar account (registration):**
- Scholar signs up and **selects their guide** (only already-approved guides are selectable).
- **Guide** approves first.
- Then, if `AFFILIATED_COLLEGE`: **Research Centre Head** approves → then **DRC Convenor** (assumed final, same as guide flow — see Assumption A5).
- If `UNIVERSITY_DEPARTMENT`: **DRC Convenor** approves after the guide.

The account becomes fully active only after the **final** approval. Before that the user can log in but sees only a "Registration status" page. Details in `05`.

## NON-NEGOTIABLE RULES

1. **Role-based everything.** Every route: auth → permission → scope. Never trust the client for role/ownership.
2. **Scope in the service layer** (SQL `WHERE` built by `buildScope(user, resource)`), not just the UI.
3. **Workflow is data.** Chains live in `workflow_definitions/workflow_steps` with `institution_type` conditions; engine resolves and snapshots steps per application (see `05`). Never hard-code "guide → centre head → DRC" in controllers.
4. **Every state change is logged** (`application_history` / `audit_logs`): who, what, when, from→to, remarks.
5. **No double allocation** of equipment — row locks + generated-column unique index (see `06`, `03`).
6. **Soft delete / deactivate** for users, equipment, master data. Never hard-delete rows with history. Use `ON DELETE RESTRICT` on foreign keys.
7. **Validation twice:** Zod client + server. Server is the authority.
8. **Layering:** `routes → controller → service → model`. No logic in controllers; no `req/res` in services.
9. **API envelope:** `{ success, data, message, errors?, meta? }`; lists paginate with `meta:{page,limit,total}`.
10. **SQL safety:** parameterised queries only (Sequelize binds); no string-concatenated SQL; whitelist sortable columns.
11. **Migrations only.** No `sequelize.sync()` outside tests. Every schema change = a migration file.
12. **Transactions** for anything touching more than one row that must stay consistent (workflow `act`, allocation, return, registration approval).
13. **Uploads:** MIME whitelist by magic bytes, size caps, random filenames, outside web root, served via authenticated route.
14. **UI is minimal and professional** — follow the anti-"AI look" rules in `08`. If a UI choice isn't in the design system, add it to the design system first.

## DELIVERY RULES FOR YOU (THE AI)

- Work phase by phase. End each phase with: files created, how to run, how to test, what's deferred.
- Give **whole files**, not diffs.
- Seed script: one demo user per role, both institution types (a university department and an affiliated college), sample guides/scholars at each approval stage, so every dashboard shows real numbers.
- If ambiguous: check ASSUMPTIONS; if still unclear, ask ONE batched list of questions before coding that part.
- Don't invent requirements outside `01`/`06`; list extras under "Optional improvements".

## ASSUMPTIONS (confirm or override)

| # | Assumption |
|---|-----------|
| A1 | One university, single deployment, self-hosted. |
| A2 | Login with email + password; public self-signup for Scholar and Guide only. All other roles are created by Admin. |
| A3 | A user may hold multiple roles (`user_roles`), UI offers a role switcher only when >1. |
| A4 | **Data model:** `departments` = subject research departments (e.g. Physics), each with one DRC Convenor. `research_centres` belong to a department; each is either the university department itself or an affiliated college centre (with a Centre Head). DRC scope = department; Centre Head scope = research centre. |
| A5 | For affiliated-college scholars the DRC Convenor is the final approver after the Centre Head (mirrors the guide flow). |
| A6 | Scholar service applications (RAC, title change, …) follow the same branching: Guide → [Centre Head if affiliated] → DRC → Staff (final processing/official reply). |
| A7 | Section Staff / Thapal Officer is **not** an approver in registration; Staff reads registrations/records and processes service applications and certificates. |
| A8 | Guideship application = Guide registration (one form, one flow). No separate guideship flow. |
| A9 | Equipment: scholars request only from their own department unless setting `equipment.allowCrossDepartment=true`. |
| A10 | Notifications: in-app + email. English UI; i18n keys from day one. |

## DEFINITION OF DONE

- Every role can log in, see a correct dashboard, and complete its main flow end-to-end.
- Both approval branches (university dept vs affiliated college) pass automated tests for guide and scholar registration.
- Seed + README get a new developer running in under 10 minutes.
- Tests cover auth, RBAC scoping, workflow branching, equipment double-allocation.
- UI passes the design checklist in `08` §9.
