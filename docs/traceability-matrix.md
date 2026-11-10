# Kannur University R&D Cell Unified Portal — Traceability Matrix

This document provides complete end-to-end requirement traceability mapping specifications in `docs/01-product-requirements.md`, `docs/05-workflow-engine.md`, and `docs/06-equipment-module.md` to backend models, REST API endpoints, frontend UI screens, and verification test suites.

---

## 1. Statutory Role Capabilities (Spec 01)

| Requirement Code | Description | Backend Model(s) | API Endpoint(s) | Frontend View / Component | Automated Test Suite |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-AUTH-01** | Multi-role JWT auth with token rotation & lockout | `User`, `Role`, `UserRole`, `RefreshToken` | `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout` | `LoginPage.jsx`, `AuthContext.jsx` | `server/tests/auth.test.js` |
| **REQ-SCHOLAR-SIGNUP** | Ph.D. registration signup with auto-draft application | `User`, `Scholar`, `Application`, `WorkflowInstanceStep` | `POST /api/v1/public/signup/scholar` | `ScholarSignupPage.jsx` | `server/tests/phase4.test.js` |
| **REQ-GUIDE-SIGNUP** | Research Guide signup with qualification records | `User`, `Guide`, `GuideQualification`, `GuideSpecialization` | `POST /api/v1/public/signup/guide` | `GuideSignupPage.jsx` | `server/tests/phase4.test.js` |
| **REQ-PENDING-STATUS** | Pending applicant queries own status while blocked from portal | `User`, `Application` | `GET /api/v1/public/registration-status` | `RegistrationStatusPage.jsx` | `server/tests/phase4.test.js` |
| **REQ-DASHBOARD-KPI** | Role-tailored summary metrics & "Needs your action" strip | `Application`, `Scholar`, `Guide`, `WorkflowInstanceStep` | `GET /api/v1/dashboard` | `DashboardPage.jsx` | `server/tests/phase6.test.js` |
| **REQ-SCHOLAR-DOSSIER** | Comprehensive scholar academic dossier & milestones | `Scholar`, `ScholarMilestone`, `RacSchedule`, `Application` | `GET /api/v1/scholars/:id/dossier` | `ScholarDossierPage.jsx` | `server/tests/phase6.test.js` |
| **REQ-SUBMISSION-DATES**| Record synopsis and thesis submission dates | `Scholar` | `PATCH /api/v1/scholars/:id/submission-date` | `ScholarDossierPage.jsx` | `server/tests/phase6.test.js` |
| **REQ-GUIDE-CAPACITY** | Quota check blocking allocation when guide quota is full | `Guide`, `Scholar` | `GET /api/v1/public/guides?centreId=`, Capacity Check Guard | `GuidesListPage.jsx` | `server/tests/phase4.test.js` |
| **REQ-PROFILE-MGMT** | Personal and academic communication profile updates | `User`, `Scholar` | `GET /api/v1/profile`, `PATCH /api/v1/profile` | `ProfilePage.jsx` | `server/tests/phase6.test.js` |

---

## 2. Dynamic Workflow Engine (Spec 05)

| Requirement Code | Description | Backend Model(s) | API Endpoint(s) | Frontend View / Component | Automated Test Suite |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-WF-SUBMIT** | Submit draft application into dynamic workflow | `Application`, `WorkflowChain`, `WorkflowStep`, `WorkflowInstanceStep` | `POST /api/v1/applications/:id/submit` | `ApplicationsPage.jsx` | `server/tests/workflow.test.js` |
| **REQ-WF-ACTION** | Reviewer Approve / Recommend / Return / Reject | `Application`, `ApplicationHistory`, `WorkflowInstanceStep` | `POST /api/v1/applications/:id/action` | `ApprovalsPage.jsx`, `RemarksDialog.jsx` | `server/tests/workflow.test.js` |
| **REQ-WF-RESUBMIT** | Resubmit returned application to resume approval chain | `Application`, `ApplicationHistory` | `POST /api/v1/applications/:id/resubmit` | `ApplicationsPage.jsx` | `server/tests/phase4.test.js` |
| **REQ-WF-CANCEL** | Applicant cancels application while in progress | `Application`, `ApplicationHistory` | `POST /api/v1/applications/:id/cancel` | `ApplicationsPage.jsx` | `server/tests/phase5.test.js` |
| **REQ-WF-OFFICIAL-REPLY**| Reviewer issues formal directive with attachments | `OfficialReply`, `OfficialReplyFile`, `FileAsset` | `POST /api/v1/applications/:id/replies` | `ApplicationDetail.jsx` | `server/tests/workflow.test.js` |

---

## 3. Statutory Scholar Services & RAC Reviews (Spec 01 & 05)

| Service Type | Key Features | Backend Handler | API Endpoint | Frontend Component | Test Suite |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TITLE_CHANGE` | Title amendment with RAC minutes | `applyService` | `POST /api/v1/applications/services/TITLE_CHANGE` | `ServicesCatalogPage.jsx` | `phase5.test.js` |
| `CENTRE_CHANGE` | Research centre transfer with NOC | `applyService` | `POST /api/v1/applications/services/CENTRE_CHANGE` | `ServicesCatalogPage.jsx` | `phase5.test.js` |
| `GUIDE_CHANGE` | Guide reassignment or Co-Guide addition | `applyService` | `POST /api/v1/applications/services/GUIDE_CHANGE` | `ServicesCatalogPage.jsx` | `phase5.test.js` |
| `LEAVE` | Sanctioned academic / medical leave | `applyService` | `POST /api/v1/applications/services/LEAVE` | `ServicesCatalogPage.jsx` | `phase5.test.js` |
| `EXTENSION` | Ph.D. duration extension beyond limits | `applyService` | `POST /api/v1/applications/services/EXTENSION` | `ServicesCatalogPage.jsx` | `phase5.test.js` |
| `CONDONATION` | Attendance or delay penalty condonation | `applyService` | `POST /api/v1/applications/services/CONDONATION` | `ServicesCatalogPage.jsx` | `phase5.test.js` |
| `PRE_SUBMISSION` | Pre-submission seminar clearance | `applyService` | `POST /api/v1/applications/services/PRE_SUBMISSION` | `ServicesCatalogPage.jsx` | `phase5.test.js` |
| `RAC` | Half-yearly RAC review scheduling & minutes | `createScholarRacSchedule`, `uploadRacMinutes` | `POST /api/v1/scholars/:id/rac-schedule`, `POST .../minutes` | `ScholarDossierPage.jsx` | `phase5.test.js` |

---

## 4. Certificates Engine (Phase 7)

| Requirement Code | Description | Backend Model(s) | API Endpoint(s) | Frontend View / Component | Automated Test Suite |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-CERT-GEN** | Issue verifiable registration certificate (`KU-CERT-YYYY-NNNNN`) | `Certificate`, `CertificateTemplate` | `POST /api/v1/certificates/generate` | `CertificatesListPage.jsx` | `server/tests/phase7.test.js` |
| **REQ-CERT-VIEW** | View certificate HTML preview and download | `Certificate` | `GET /api/v1/certificates/:id`, `GET /certificates/:id/download` | `CertificatesListPage.jsx` | `server/tests/phase7.test.js` |
| **REQ-CERT-REVOKE** | Admin / Staff revocation with statutory reason | `Certificate` | `POST /api/v1/certificates/:id/revoke` | `CertificatesListPage.jsx` | `server/tests/phase7.test.js` |
| **REQ-CERT-VERIFY** | Public online QR verification endpoint | `Certificate` | `GET /api/v1/public/verify-certificate/:certificateNo` | Public JSON & Verification Page | `server/tests/phase7.test.js` |

---

## 5. Research Equipment Management (Module 11 & Spec 06)

| Requirement Code | Description | Backend Model(s) | API Endpoint(s) | Frontend View / Component | Automated Test Suite |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-EQ-CATALOG** | Equipment catalog with computed availability status | `Equipment`, `EquipmentCategory`, `EquipmentUnit` | `GET /api/v1/equipment` | `EquipmentPage.jsx` | `server/tests/phase8.test.js` |
| **REQ-EQ-REQUEST** | Scholar submits equipment loan requisition | `EquipmentRequest`, `EquipmentRequestHistory` | `POST /api/v1/equipment-requests` | `EquipmentPage.jsx` | `server/tests/phase8.test.js` |
| **REQ-EQ-APPROVE** | DRC Convenor approves loan request | `EquipmentRequest`, `EquipmentRequestHistory` | `POST /api/v1/drc/equipment-requests/:id/approve` | `EquipmentPage.jsx` | `server/tests/phase8.test.js` |
| **REQ-EQ-ALLOCATE** | 3-layer atomic allocation prevention of unit | `EquipmentAllocation`, `EquipmentUnit` (Stored generated col `active_unit_id` & `SELECT FOR UPDATE`) | `POST /api/v1/drc/equipment-requests/:id/allocate` | `EquipmentPage.jsx` | `server/tests/phase8.test.js` |
| **REQ-EQ-RETURN** | Check-in return with condition inspection | `EquipmentAllocation`, `EquipmentUnit`, `Equipment` | `POST /api/v1/drc/equipment-allocations/:id/return` | `EquipmentPage.jsx` | `server/tests/phase8.test.js` |
| **REQ-EQ-OVERDUE** | Idempotent overdue checker job | `EquipmentAllocation`, `JobRun` | `POST /api/v1/drc/equipment/run-overdue-check` | Automated CRON / Admin Trigger | `server/tests/phase8.test.js` |

---

## 6. Reports & Analytics (Phase 9)

| Report Key | Target Aggregation | Backend Handler | API Endpoint | CSV Export | Test Suite |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `active-scholars` | Active registered scholars | `getActiveScholarsReport` | `GET /reports/active-scholars` | `GET /reports/active-scholars/export` | `phase9_10.test.js` |
| `vacancies` | Guide vacancies & remaining slots | `getVacanciesReport` | `GET /reports/vacancies` | `GET /reports/vacancies/export` | `phase9_10.test.js` |
| `fellowships` | Scholarship distribution | `getFellowshipsReport` | `GET /reports/fellowships` | `GET /reports/fellowships/export` | `phase9_10.test.js` |
| `turnaround` | Workflow turnaround time (SLA) | `getTurnaroundReport` | `GET /reports/turnaround` | `GET /reports/turnaround/export` | `phase9_10.test.js` |
| `at-risk` | Scholars past statutory tenure | `getAtRiskReport` | `GET /reports/at-risk` | `GET /reports/at-risk/export` | `phase9_10.test.js` |
| `guide-scholars` | Guide to scholar supervisory list | `getGuideScholarsReport` | `GET /reports/guide-scholars` | `GET /reports/guide-scholars/export` | `phase9_10.test.js` |
| `centre-wise` | Research centre census | `getCentreWiseReport` | `GET /reports/centre-wise` | `GET /reports/centre-wise/export` | `phase9_10.test.js` |
| `stage-distribution` | Milestone progress distribution | `getStageDistributionReport` | `GET /reports/stage-distribution` | `GET /reports/stage-distribution/export` | `phase9_10.test.js` |

---

## 7. System Administration & Diagnostics (Phase 10)

| Requirement Code | Description | Backend Model(s) | API Endpoint(s) | Frontend View / Component | Automated Test Suite |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-ADMIN-DIAG** | Missing approvers diagnostic report (Centres & Depts) | `ResearchCentre`, `Department`, `UserRole` | `GET /api/v1/admin/reports/missing-approvers` | `AdminPanelPage.jsx` | `server/tests/phase9_10.test.js` |
| **REQ-ADMIN-USERS** | User lifecycle management (Create, Activate, Deactivate) | `User`, `Role`, `UserRole` | `GET /api/v1/admin/users`, `POST /admin/users/:id/activate`, `POST .../deactivate` | `AdminPanelPage.jsx` | `server/tests/phase9_10.test.js` |
| **REQ-ADMIN-STAFF** | Centre staff scope assignment | `StaffCentre`, `ResearchCentre` | `POST /api/v1/admin/staff-centres` | `AdminPanelPage.jsx` | `server/tests/phase9_10.test.js` |
| **REQ-ADMIN-BACKUP** | On-demand database state snapshot backup | Storage filesystem | `POST /api/v1/admin/backup` | `AdminPanelPage.jsx` | `server/tests/phase9_10.test.js` |

