# D1 — Problem Framing: Kannur University R&D Cell Unified Portal

## 1. Problem Statement
The Kannur University Research & Development Cell coordinates PhD scholars, research guides, departmental research committees (DRC), affiliated research centres, administrative staff, and university leadership. Previously fragmented, paper-reliant, or disparate workflows created bottlenecks in registration approvals, statutory committee (RAC) tracking, scholar service processing, and high-value research equipment utilization.

The Unified Portal consolidates all academic research lifecycles into a single authoritative, role-based system. The primary goal of the interface is **high efficiency, absolute clarity, and quiet institutional reliability**.

---

## 2. Target Roles & User Profiles

| Role Code | Primary Users | Primary Tasks | Core UX Priorities |
|---|---|---|---|
| `SCHOLAR` | PhD Research Scholars | Public registration, progress tracking, RAC milestone reporting, service applications (title change, extension, etc.), equipment requests. | Frictionless status visibility, clear requirement checklists, transparent approval progression. |
| `GUIDE` | Recognized Research Guides | Self-registration, vetting candidate scholars, supervising progress, endorsing scholar applications. | Quick triage of pending items, scholar capacity visibility, distraction-free endorsement forms. |
| `CENTRE_HEAD` | Heads of Affiliated Research Centres | Endorsing guideship and scholar applications originating from their affiliated institution. | Simple approval inbox, institutional affiliation verification, clear routing onwards to DRC. |
| `DRC_CONVENOR` | University Department Heads / DRC Convenors | Department-level gatekeeping for guides and scholars, service endorsements, department equipment inventory and allocation management. | Fast batch or line-item review, departmental scholar/guide metrics, equipment conflict prevention. |
| `STAFF` | Section Staff / Thapal Officers | Administrative processing, official replies, RAC document issuance, certificate generation, date-of-submission recording. | High-density data tables, fast search/filter, official remark logging, PDF generation tools. |
| `ADMIN` | Super Administrators | Master data, user account lifecycle, role-permission matrix, workflow definition editing, global equipment monitoring, audit log review. | Granular control, safety confirmations on structural changes, clear audit trails. |

---

## 3. Institutional Branching & Workflow Dynamics
A critical complexity is institutional dual-branching based on `research_centres.institution_type`:
1. `UNIVERSITY_DEPARTMENT`: The department itself is the research centre. Approvals route directly between Guide and DRC Convenor.
2. `AFFILIATED_COLLEGE`: The research centre is an external college affiliated with Kannur University. Approvals require an intermediate verification by the **Research Centre Head** before proceeding to the **DRC Convenor**.

### Approval Pathways:
- **Guide Registration:**
  - `UNIVERSITY_DEPARTMENT` -> DRC Convenor
  - `AFFILIATED_COLLEGE` -> Centre Head -> DRC Convenor
- **Scholar Registration:**
  - `UNIVERSITY_DEPARTMENT` -> Guide -> DRC Convenor
  - `AFFILIATED_COLLEGE` -> Guide -> Centre Head -> DRC Convenor
- **Scholar Service Applications (RAC, Title Change, Leaves, etc.):**
  - Guide -> [Centre Head if Affiliated] -> DRC Convenor -> Staff (Final processing/issuance)

---

## 4. Usability & Cognitive Load Constraints
- **Zero Clutter:** Institutional users handle hundreds of applications per academic cycle. Visual gimmicks (gradients, cards-in-cards, colorful badges, illustrations) cause fatigue and obscure actionable data.
- **Single Source of Current State:** Every application must explicitly name who is currently holding the file (e.g., *"In progress · Waiting on Research Centre Head"*).
- **Proactive Transparency:** During signup and application creation, applicants must see the exact sequential path their application will traverse *before* they click submit.
- **Strict Data Density:** Data tables and audit logs require compact row heights (40px), tabular numerals, and direct access to actions without unnecessary modal hopping.

