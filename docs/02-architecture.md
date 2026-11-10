# 02 — ARCHITECTURE

## 1. High-level

```
Browser (React SPA)
   │ HTTPS, JSON, JWT (access in memory, refresh in httpOnly cookie)
   ▼
Nginx (reverse proxy + static)
   ▼
Express API ── Zod validation ── auth / permit / scope middleware
   │ routes → controllers → services → Sequelize models
   ├── Workflow Engine (resolves conditional chains, runs transitions in a transaction)
   ├── Notification Service (in-app rows + email)
   ├── Certificate/Report Service (Puppeteer, ExcelJS)
   ├── Scheduler (node-cron)
   └── Audit Logger
   ▼
MySQL 8 (InnoDB)  +  local private file storage (/data/uploads)
```

## 2. Repository layout

```
kannur-rd-portal/
├── docker-compose.yml            # mysql, api, web, mailhog
├── .env.example  README.md
├── docs/                         # these md files + docs/design/ (design outputs)
├── server/
│   ├── package.json  .sequelizerc
│   ├── migrations/               # one file per schema change (ordered)
│   ├── seeders/
│   └── src/
│       ├── app.js  server.js
│       ├── config/               # env (Zod-validated), db, constants, mail
│       ├── db/                   # sequelize instance, model loader, transaction helper
│       ├── middleware/           # auth, permit, validate, upload, error, rateLimit
│       ├── utils/                # ApiError, asyncHandler, response, pagination, scope, dates, sortWhitelist
│       ├── modules/
│       │   ├── auth/  signup/  users/  roles/  masterdata/
│       │   ├── scholars/  guides/
│       │   ├── workflow/         # definitions, resolver, engine, hooks/
│       │   ├── applications/     # registrations + service applications share this
│       │   ├── certificates/  notifications/  reports/
│       │   ├── equipment/  settings/  audit/
│       ├── jobs/  templates/
│   └── tests/
└── client/
    └── src/
        ├── main.jsx  App.jsx
        ├── styles/               # tokens.css (from design system), base.css
        ├── api/  auth/  lib/  i18n/
        ├── components/           # ui/ (primitives), layout/, data/ (DataTable…), feedback/
        └── features/             # signup, scholar, guide, centreHead, drc, staff, admin, equipment
```
Each server module: `*.routes.js, *.controller.js, *.service.js, *.model.js, *.validation.js, *.test.js`.

## 3. Layer contracts

| Layer | Allowed | Forbidden |
|---|---|---|
| routes | path + middleware chain (`auth → permit → validate`) | logic |
| controller | read req, call service, shape response | DB access, rules |
| service | rules, scoping, transactions, other services | `req`/`res` |
| model | columns, associations, indexes | cross-module logic |

**Scoping helper** `buildScope(user, resource)` returns a Sequelize `where` fragment:
- Scholar → `scholar.user_id = me`
- Guide → `scholar.guide_id = myGuideId`
- Centre Head → `research_centre_id = myCentre`
- DRC → `department_id = myDepartment`
- Staff → `research_centre_id IN assigned_centres` (none assigned ⇒ all, configurable)
- Admin → none
Every service list/get calls it. Single-resource out-of-scope reads → **404**.

## 4. MySQL specifics (read carefully)

- **Pool:** mysql2 pool (10–20), `timezone: '+00:00'`, `dateStrings` for DATE columns, `charset utf8mb4`.
- **Transactions:** helper `withTx(fn)` using Sequelize managed transactions. Default isolation `REPEATABLE READ`; use explicit **`SELECT … FOR UPDATE`** (`lock: t.LOCK.UPDATE`) on the rows you decide on (application row, equipment unit row).
- **Deadlock handling:** retry a transaction up to 3 times on `ER_LOCK_DEADLOCK` (1213) with jitter; always lock in a consistent order (application → instance → unit).
- **JSON columns** (`form_data`, `form_schema`, `settings.value`) for flexible, per-application-type form content; everything queried/filtered/reported on must be real columns.
- **Generated columns** for DB-level invariants (see double-allocation in `03`/`06`).
- **Sequences:** `counters` table; `UPDATE counters SET seq = LAST_INSERT_ID(seq + 1) WHERE key=?` then `SELECT LAST_INSERT_ID()` for gap-safe, race-safe application/certificate numbers.
- **Text search:** `LIKE 'term%'` on indexed columns + FULLTEXT on names where needed. No `%term%` on big tables without FULLTEXT.
- **Migrations:** forward-only in prod; each has `up` and `down`. Test DB is rebuilt from migrations in CI.
- **Backups:** nightly `mysqldump --single-transaction --routines`; restore documented in README.

## 5. Cross-cutting

- **Errors:** `ApiError(status, code, message, details)`; error middleware maps Zod, Sequelize (`UniqueConstraintError`, `ForeignKeyConstraintError`), JWT errors to the envelope.
- **Config:** `config/env.js` validates env with Zod; app refuses to boot on invalid env.
- **Logging:** Pino with request id; never log passwords/tokens.
- **Pagination:** `?page&limit&sort&q` + filters; sort columns via whitelist.
- **Time:** DB UTC; display `Asia/Kolkata`. Date-only fields (`date_of_registration`, `expected_return_date`) are `DATE`, never `DATETIME`.
- **i18n:** UI strings through keys.
- **Settings:** `settings` table with cached reads; invalidate on write.

## 6. Background jobs (node-cron; idempotent)

| Job | Schedule | Action |
|---|---|---|
| `racAlerts` | daily 08:00 | notify scholar/guide of RAC within lead days |
| `pendingReminders` | daily 09:00 | remind approvers when step SLA exceeded |
| `equipmentOverdue` | daily 00:30 | ACTIVE→OVERDUE where `expected_return_date < CURDATE()`; notify |
| `equipmentDueSoon` | daily 08:30 | remind N days before due |
| `scheduledNotifications` | every 5 min | send due scheduled broadcasts |
| `backup` | nightly (optional) | mysqldump to configured path |

Use a `job_runs` row with a unique key per run-date (`INSERT IGNORE`) so two API instances never run the same job twice.

## 7. Docker Compose notes
`mysql:8.0` with `--character-set-server=utf8mb4 --collation-server=utf8mb4_0900_ai_ci --sql-mode=STRICT_ALL_TABLES,...`, healthcheck, named volume; `api` waits for healthy mysql, runs migrations on start (`npm run migrate`), health endpoints `/api/health`, `/api/health/db`.

## 8. Decisions to record in `docs/ADR.md`
1. Sequelize over Prisma (native row-locking, managed transactions, JSON columns).
2. Registrations and service applications share one `applications` table + one engine.
3. Conditional workflow steps by `institution_type`, snapshotted per application.
4. Equipment tracked per unit; DB-enforced single active allocation.
5. JavaScript + JSDoc (switch to TypeScript only if requested).
