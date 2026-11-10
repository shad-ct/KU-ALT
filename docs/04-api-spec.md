# 04 — API SPECIFICATION

Base: `/api/v1`. Auth: `Authorization: Bearer <access>`; refresh via httpOnly cookie. Envelope: `{ success, data, message, errors?, meta? }`.
Legend: **[S]** Scholar · **[G]** Guide · **[CH]** Centre Head · **[D]** DRC Convenor · **[ST]** Staff · **[A]** Admin.
All lists accept `page, limit, sort, q` + listed filters. All scoped per `02-architecture.md §3`.

## Auth
| Method | Path | Notes |
|---|---|---|
| POST | /auth/login | rate-limited; lockout after N failures |
| POST | /auth/refresh | rotates refresh token |
| POST | /auth/logout | revoke refresh |
| POST | /auth/change-password | all roles |
| POST | /auth/forgot-password, /auth/reset-password | email token |
| GET | /auth/me | user + permissions + profile ids |

## Profile (all roles)
`GET/PATCH /profile` · scholar-specific `GET/PATCH /profile/academic|research` · guide-specific `GET/PATCH /profile/qualifications|specialization`.

## Public signup (no auth, rate-limited, CAPTCHA/honeypot recommended)
| Method | Path | Notes |
|---|---|---|
| GET | /public/departments | active departments |
| GET | /public/centres?departmentId= | returns `institution_type` so the UI can preview the approval path |
| GET | /public/guides?centreId= | **only APPROVED guides with free capacity**; minimal fields (name, designation, specialization, free slots) |
| GET | /public/approval-path?centreId=&as=GUIDE\|SCHOLAR | ordered list of approver roles for the review step |
| POST | /public/signup/guide | multipart; creates user (PENDING_APPROVAL) + guide + application, submits it |
| POST | /public/signup/scholar | multipart; requires `guideId` belonging to `centreId` and approved; same creation + submit |
| GET | /registration/status | [pending user] own chain, current approver, remarks |
| PATCH | /registration/resubmit | [pending user] when status RETURNED |

Errors: `GUIDE_NOT_AVAILABLE`, `CENTRE_NOT_ACCEPTING_SIGNUPS` (e.g. affiliated centre without head), `EMAIL_TAKEN`, `WORKFLOW_NO_ASSIGNEE`, `ACCOUNT_NOT_ACTIVE`.

## Approvals inbox (all approver roles)
`GET /approvals?type=&status=&q=` — everything currently waiting on the caller (resolved via snapshot steps + scope rules) · `POST /applications/:id/actions` performs the step action (see below). Registrations and service applications use the same endpoints.

## Registration management (post-signup)
| | Path | Who |
|---|---|---|
|---|---|---|
| POST | /scholar-registrations | [S] create/save draft; `POST /:id/submit` |
| GET | /scholar-registrations, /:id | [S] own · [D] dept · [ST][A] all |
| POST | /scholar-registrations/:id/(verify\|reject\|forward\|return) | [D][ST][A] per workflow |
| POST | /guide-registrations … same pattern | [G] submit · [D] verify |
| POST | /guideship-applications … same pattern | [G] submit · [CH] verify/forward · [D][ST] next steps |

## Applications (generic)
| Method | Path | Notes |
|---|---|---|
| GET | /application-types | active types + form schema + required docs |
| POST | /applications | [S] create draft `{type, formData}` |
| PATCH | /applications/:id | [S] edit draft/returned |
| POST | /applications/:id/documents | multipart upload |
| POST | /applications/:id/submit | starts workflow instance |
| GET | /applications | filters: `type,status,scholar,guide,department,centre,from,to` |
| GET | /applications/:id | full detail + documents + history |
| GET | /applications/:id/timeline | history events |
| POST | /applications/:id/actions | `{action: VERIFY\|REJECT\|FORWARD\|RETURN\|APPROVE, remarks, attachments?}` — **single endpoint driven by workflow engine** |
| POST | /applications/:id/replies | [ST][A] official reply, optional attachments (RAC reply) |
| PATCH | /applications/:id/status | [ST][A] manual status update (audited) |
| POST | /applications/:id/cancel | [S] if still cancellable |
| GET | /applications/:id/documents/:fileId/download | auth + scope check |

## People management
- `GET /scholars`, `GET /scholars/:id`, `PATCH /scholars/:id/submission-date` [ST][A], `PATCH /scholars/:id/timeline`, `PUT /scholars/:id/rac-schedule` [ST][D][A], `GET /scholars/:id/applications`
- `GET /guides`, `GET /guides/:id`, `GET /guides/:id/scholars`, `PATCH /guides/:id/assign-scholar` [D][A]
- `GET /dashboard` — role-aware; returns exactly the counters listed in `01` for the caller's role.

## Certificates [ST][A]
`GET/POST/PATCH /certificate-templates` [A] · `POST /certificates` (generate `{type, scholarId|guideId}`) · `GET /certificates` · `GET /certificates/:id/download` · `POST /certificates/:id/revoke` [A].

## Notifications
`GET /notifications` (own inbox, `unread=true`) · `PATCH /notifications/:id/read` · `PATCH /notifications/read-all` · `POST /notifications` [ST][A] (individual/group; `scheduledFor` optional [A]) · `GET /notifications/history` [ST][A].

## Reports [D][ST][A]
`GET /reports/:reportKey?…filters` returns JSON; `GET /reports/:reportKey/export?format=pdf|xlsx`.
Keys: `scholar-registration, guide-registration, application-status, centre-wise, guide-wise-scholars, application-processing, pending-applications, date-of-submission, equipment-utilization, equipment-department-wise`.

## Admin
- Users: `GET/POST /admin/users`, `PATCH /admin/users/:id`, `POST /admin/users/:id/(activate|deactivate|reset-password)`
- Roles: `GET/POST/PATCH /admin/roles`, `PUT /admin/users/:id/roles`
- Staff: `POST /admin/staff`, `PUT /admin/staff/:id/centres`
- Master data: `/admin/master/(departments|centres|programmes|application-types|academic-years|designations|certificate-types)` — CRUD + deactivate
- Workflows: `/admin/workflows` CRUD with versioning
- Settings: `GET/PATCH /admin/settings/:group` (portal, email, notifications, workflow, rac-alerts, security)
- Audit: `GET /admin/audit-logs`
- Backup: `POST /admin/backup`, `GET /admin/backup`

---

## Equipment API (Module 11)

### Shared / Scholar [S]
| Method | Path | Notes |
|---|---|---|
| GET | /equipment | browse; filters `department, category, availability(AVAILABLE\|UNAVAILABLE), q` |
| GET | /equipment/:id | full details, availability count, usage instructions |
| GET | /equipment-categories | |
| POST | /equipment-requests | `{equipmentId, quantity?, purpose, requestedFrom?, expectedReturnDate}` |
| GET | /equipment-requests/mine | + `status` filter; includes history |
| GET | /equipment-requests/:id | with allocation details + instructions |
| POST | /equipment-requests/:id/cancel | only while PENDING (or APPROVED not yet allocated) |

### DRC Convenor [D] (department-scoped)
| Method | Path | Notes |
|---|---|---|
| POST | /drc/equipment | add equipment (+units) |
| PATCH | /drc/equipment/:id | edit |
| POST | /drc/equipment/:id/deactivate | soft delete; blocked if active allocations |
| POST | /drc/equipment/:id/images, /documents | uploads |
| CRUD | /drc/equipment-categories | |
| POST | /drc/equipment/:id/units, PATCH /drc/equipment-units/:unitId | condition, maintenance status, maintenance log |
| GET | /drc/equipment-requests | dept requests; filters `status, scholar, equipment` |
| GET | /drc/equipment-requests/:id | scholar + request detail |
| POST | /drc/equipment-requests/:id/approve | `{remarks?}` |
| POST | /drc/equipment-requests/:id/reject | `{remarks}` required |
| POST | /drc/equipment-requests/:id/allocate | `{unitId? , quantity?, allocatedOn, expectedReturnDate}` — **atomic** |
| POST | /drc/equipment-allocations/:id/return | `{returnedOn, returnCondition, notes}` |
| GET | /drc/equipment-allocations | `status=ACTIVE\|RETURNED\|OVERDUE` (current + history) |
| GET | /drc/equipment/dashboard | counters (see `06` §4) |

### Administrator [A] (read-only monitoring, all departments)
| Method | Path | Notes |
|---|---|---|
| GET | /admin/equipment/dashboard | totals + department-wise stats |
| GET | /admin/equipment/departments | list with inventory counts |
| GET | /admin/equipment/departments/:id/equipment | dept inventory + availability |
| GET | /admin/equipment | all; filters `department, category, availability, status` |
| GET | /admin/equipment/:id | details + allocations |
| GET | /admin/equipment-requests | filters `department, scholar, equipment, status, from, to` |
| GET | /admin/equipment-allocations | allocated + assigned scholars; `overdue=true` |
| GET | /admin/equipment/maintenance | units under maintenance |
| GET | /admin/equipment/export | PDF/Excel |

> Admin may also override (force-return, reassign) only if setting `equipment.adminOverride=true`; every override is audited.

## Error codes (stable, machine-readable)
`AUTH_INVALID`, `AUTH_LOCKED`, `FORBIDDEN`, `SCOPE_VIOLATION`, `VALIDATION_ERROR`, `NOT_FOUND`, `INVALID_TRANSITION`, `WORKFLOW_STEP_MISMATCH`, `EQUIPMENT_UNAVAILABLE`, `EQUIPMENT_ALREADY_ALLOCATED`, `REQUEST_NOT_CANCELLABLE`, `UPLOAD_REJECTED`, `RATE_LIMITED`.
