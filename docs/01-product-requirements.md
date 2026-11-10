# 01 — PRODUCT REQUIREMENTS

Portal: **Kannur University – Research and Development Cell: Student and Guide Portal (Unified Portal Revamping)**

## Roles

| Code | Role | Scope |
|------|------|-------|
| `SCHOLAR` | Research Scholar | Own data only |
| `GUIDE` | Research Guide | Assigned scholars |
| `CENTRE_HEAD` | Research Centre Head | Guideship applications of own centre |
| `DRC_CONVENOR` | DRC Convenor / Research Department Head | Own department/centre |
| `STAFF` | Section Staff / Thapal Officer | Processing, records, certificates, notifications (centre assignments apply) |
| `ADMIN` | Super Administrator | Everything |

## Registration & Approval Flow (BINDING — overrides anything below that implies otherwise)

Centres are either `UNIVERSITY_DEPARTMENT` or `AFFILIATED_COLLEGE`.

| Who signs up | University department | Affiliated college |
|---|---|---|
| **Guide** | DRC Convenor | Research Centre Head → DRC Convenor |
| **Scholar** (selects an approved guide at signup) | Guide → DRC Convenor | Guide → Research Centre Head → DRC Convenor |

- Guide and Scholar create their own accounts (public signup). Accounts stay `PENDING_APPROVAL` until the final approver approves.
- "Guide registration" and "Guideship application" are the same thing (one form, one flow).
- Service applications (RAC, title change, …) follow the same branching, ending with Staff processing. Full detail: `05-workflow-engine.md`.

---

## 1. Scholar Module

**Dashboard:** Total / Pending / Approved / Rejected applications; Registration status; Upcoming RAC alerts; Recent notifications.

**My Profile:** View, Edit, Academic details, Research details, Guide details, Research centre details, Change password.

**My Registration:** Scholar registration form; registration status; registration remarks; view submitted documents.

**Apply for Services:** RAC / Three-Member Committee · Title Change · Research Centre Change · Guide Change · Leave Request · Extension Request · Condonation Request · Pre-Submission Application.

**My Applications:** All / Pending / Approved / Rejected; application details; application timeline; staff remarks and replies; download application documents.

**Notifications:** General, individual, application status alerts, RAC alerts & reminders, important announcements.

**Research Timeline:** Date of registration, research commencement date, RAC schedule, research progress milestones, date of submission.

**Equipment (Module 11.1):** see section 11.

---

## 2. Guide Module

**Dashboard:** Total assigned scholars; Active scholars; Total applications received; Pending verification; Approved; Recent activities; Pending tasks.

**My Profile:** View, Edit, Academic qualifications, Research specialization, Research centre details, Change password.

**Guide Registration (Guideship application):** Registration form; upload required documents; registration status; verification remarks.

**My Scholars:** All assigned / Active / Completed; individual scholar details; research progress; application history.

**Scholar Applications:** All / Pending verification / Verified / Rejected; view details; view attached documents; Verify; Reject with remarks; Forward to next authority.

**Notifications:** Scholar application alerts; new scholar assignments; university notifications; pending-action reminders.

---

## 3. Research Centre Head Module

**Dashboard:** Total guideship applications; Pending; Approved; Rejected; Recent activities.

**Guideship Applications:** All / New / Pending verification / Approved / Rejected.

**Application Review:** View applicant details, academic qualifications, research specialization, uploaded documents; Verify; Reject with remarks; Forward to DRC Convenor / next authority.

**Guide Records:** Approved guides; guide details; guide registration history.

**Notifications:** New guideship applications; pending verification alerts; university announcements.

---

## 4. DRC Convenor Module

**Dashboard:** Total guides; Total scholars; Pending guide registrations; Pending scholar registrations; Pending scholar applications; Approved; Rejected; Recent activities.

**Guide Management:** All guides; registration applications; pending verification; approved; rejected; view details; verify/reject registration; add verification remarks.

**Scholar Management:** All scholars; registration applications; pending verification; approved; rejected; view details; verify/reject registration; add verification remarks.

**Scholar Applications:** All; RAC/Three-Member Committee; Title Change; Research Centre Change; Guide Change; Leave; Extension; Condonation; Pre-Submission; view details; verify/reject; forward to next authority.

**Reports:** Guide registration report; scholar registration report; application status report; research-centre-wise report.

**Notifications:** Registration alerts; pending application alerts; university notifications.

**Equipment Management (Module 11.2):** see section 11.

---

## 5. Section Staff / Thapal Officer Module

Focus: application processing, record management, communication, administrative operations.

**Dashboard:** Total scholars; Total guides; Total applications; Pending; Under processing; Approved; Rejected; Recent activities.

**Guideship Management:** All; pending; processed; view complete application; update application status; search & filter.

**Guide Management:** All guides; details; academic & research details; registration history; search & filter.

**Scholar Registration Management:** All; pending; approved; rejected; individual scholar profile; view submitted documents; search & filter.

**Scholar Management:** All scholars; details; guide & research centre details; individual application history; research progress; **date of submission management**; search & filter.

**Application Processing:** All forms; pending; under processing; approved; rejected; view complete details; update status; add rejection reasons; add official remarks; send official replies; **reply with attachments (RAC)**; processing history.

**Certificate Management:** Generate; view generated; download; history.

**Notifications:** Send individual notifications; application status notifications; notification history.

**Reports:** Scholar; Guide; Application; Pending application; Date-of-submission reports.

---

## 6. Administrator Module

Full control over portal configuration, users, workflows, applications, system settings.

**Dashboard:** Total registered scholars; guides; research centres; total applications; pending; approved; rejected; application statistics; user activity overview.

**User Management:** All users; Scholar / Guide / Staff / Centre Head / DRC Convenor accounts; create; edit; activate/deactivate; reset password.

**Role & Permission Management:** Create roles; assign roles; manage permissions; module-wise access control; staff access management.

**Guide Management:** All guides; guideship applications; registration status; details; search & filter.

**Scholar Management:** All scholars; registration applications; profiles; individual application history; research records; date-of-submission management; search & filter.

**Application Management:** All forms; each type (RAC, Title Change, Centre Change, Guide Change, Leave, Extension, Condonation, Pre-Submission); application status management; rejection reasons & remarks; official replies & attachments; workflow history.

**Certificate Management:** Templates; generate; manage generated; history.

**Staff Management:** Add staff; manage accounts; assign roles & permissions; assign research centres; activate/deactivate.

**Notification Management:** General (all users); individual scholar; guide; staff; application-related; RAC alerts & reminders; schedule notifications; history.

**Master Data Management:** Research centres; departments; research programmes; application types; academic years; designations; certificate types.

**Reports & Analytics:** Scholar registration; guide registration; application; research-centre-wise; guide-wise scholar; application processing; **export PDF / Excel**.

**System Settings:** Portal settings; email configuration; notification configuration; application workflow configuration; RAC alert configuration; audit logs; backup & security settings.

**Equipment Monitoring (Module 11.3):** see section 11.

---

## 11. Research Equipment Management Module (NEW)

**Purpose:** Centralized equipment management & allocation: DRC Convenors manage departmental inventories; scholars request equipment; administrators monitor availability and requests across all departments.

Full feature list for 11.1 (Scholar), 11.2 (DRC Convenor), 11.3 (Administrator), workflow 11.4 and statuses 11.5 → implemented per `06-equipment-module.md`. The complete original feature text is reproduced there so nothing is lost.

**Key recommendation (binding):** maintain a department-wise equipment inventory with **individual equipment records and allocation history** to monitor utilization, prevent double allocation, and ensure transparency.
