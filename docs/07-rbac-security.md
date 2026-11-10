# 07 — RBAC, SECURITY & AUDIT

## 1. Authentication
- Passwords: bcrypt (cost ≥ 12) or argon2id; min length 10, complexity check, breached-list check optional.
- Access token JWT (15 min) kept **in memory** on the client; refresh token (7 days) in `httpOnly; Secure; SameSite=Lax` cookie, **rotated on every refresh**, stored hashed server-side; reuse of an old refresh token revokes the whole family.
- Lockout: 5 failures → 15 min lock (`AUTH_LOCKED`); generic error messages (no user enumeration).
- Forced password change on first login for admin-created accounts (`mustChangePassword`).
- Password reset: single-use token, 30 min expiry, hashed in DB.
- Rate limit: `/auth/*` 10/min/IP; global 300/min/IP.

## 2. Authorization model
Three checks on every request, in this order:
1. **Authenticated** (`auth` middleware).
2. **Permitted** — `permit('module:action')` against `role defaults ∪ user.permissions`.
3. **In scope** — service-layer `buildScopeFilter` / `assertInScope(user, resource)`.

### Default permission matrix (seed; editable by Admin in Role & Permission Management)

| Permission | S | G | CH | D | ST | A |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| profile:read/update (own) | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| registration:submit | ✔ | ✔ | | | | |
| registration:verify | | | ✔(guideship) | ✔ | ✔ | ✔ |
| application:create/cancel (own) | ✔ | | | | | |
| application:verify/forward/reject | | ✔ | ✔ | ✔ | ✔ | ✔ |
| application:reply / status:update | | | | | ✔ | ✔ |
| scholar:read | own | assigned | | dept | centres | all |
| guide:read | | own | centre | dept | centres | all |
| certificate:generate | | | | | ✔ | ✔ |
| certificate-template:manage | | | | | | ✔ |
| notification:send | | | | | ✔ (individual) | ✔ (all/scheduled) |
| report:view | | | | ✔ | ✔ | ✔ |
| report:export | | | | ✔ | ✔ | ✔ |
| user/role/master/settings/audit:manage | | | | | | ✔ |
| equipment:browse | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| equipment-request:create/cancel (own) | ✔ | | | | | |
| equipment:manage (dept) | | | | ✔ | | |
| equipment-request:review/allocate/return (dept) | | | | ✔ | | |
| equipment:monitor (all) | | | | | | ✔ |

### Scope rules
- Scholar: `scholarId = user.scholarProfile`.
- Guide: scholars where `guide == user.guideProfile` (or coGuide).
- Centre Head: guideship applications where `researchCentre == user.researchCentre`.
- DRC Convenor: `department == user.department`.
- Staff: `researchCentre ∈ user.assignedCentres` (empty list ⇒ all, configurable).
- Admin: unrestricted.
- Return **404** (not 403) for out-of-scope single-resource reads to avoid leaking existence; use `SCOPE_VIOLATION` (403) only for write actions where it helps debugging — pick one policy and document it.

## 3. Input & output safety
- Zod validation on every body/query/params; strip unknown keys.
- **SQL injection:** Sequelize parameter binding only; never interpolate user input into raw SQL; `ORDER BY` columns and directions via a **whitelist**; `LIMIT/OFFSET` coerced to bounded integers; `LIKE` terms escaped (`%`, `_`). Never pass raw `req.query` into `where`.
- **Public signup abuse:** rate limit (5/hour/IP), honeypot field, email verification before the application is submitted to approvers (optional setting), no user enumeration on `EMAIL_TAKEN` beyond what UX requires.
- **Pending-account gate:** users with `status != ACTIVE` can only call `/auth/me`, `/registration/*` and logout.
- Scope for approvers is enforced via the application's **snapshot step** + scope rule (`05` §4), not just role.
- XSS: React escapes by default; sanitize any admin-authored HTML (certificate/email templates) with DOMPurify/sanitize-html on save **and** render server-side only from trusted templates.
- Helmet, CORS allow-list from env, CSRF protection for cookie-based refresh endpoint (SameSite + custom header check).
- Do not return `passwordHash`, token hashes, or internal flags (`select: false`).

## 4. File uploads
- Multer to temp → validate real MIME by magic bytes (`file-type`) → extension whitelist (`pdf, jpg, jpeg, png, webp, doc, docx, xls, xlsx`) → size caps (doc 10 MB default, image 5 MB) → randomised name → move to `UPLOAD_DIR/<yyyy>/<mm>/` outside web root.
- Download only via authenticated endpoint that re-checks scope on the **owning** record.
- Optional ClamAV hook (interface only in v1).

## 5. Audit logging
Log (append-only): login success/failure, password change/reset, user/role/permission changes, master-data changes, settings changes, workflow definition changes, application status changes (also in ApplicationHistory), certificate generate/revoke, equipment inventory edits/allocations/returns/overrides, report exports, backup actions.
Fields: actor, role, action, entity, before/after (redact secrets), ip, user-agent, requestId, timestamp. Admin UI: filter by actor/entity/action/date, export CSV.
Retention setting (default 2 years).

## 6. Privacy & data protection
- Scholar personal data visible only per scope; reports exports are audited.
- Mask phone/email in lists for roles that don't need them (configurable).
- Backups encrypted at rest if the host supports it; restore procedure documented in README.

## 7. Security tests required
Auth lockout · refresh rotation & reuse detection · each role denied on another role's endpoints · scope isolation (DRC A cannot read dept B, Guide cannot read unassigned scholar, Scholar cannot read others' applications/equipment requests) · upload rejection of disguised files · SQL injection payloads rejected (sort/filter/search params) · audit entries exist for sensitive actions.
