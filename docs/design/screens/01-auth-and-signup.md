# Screen Blueprint: Auth & Public Signups

## 1. Login Screen (`/login`)

### Layout & Blueprint
- **Layout:** Centered single panel (max-width 400px), vertically centered on warm-neutral viewport (`--color-surface-bg`).
- **Header:** Official university emblem/wordmark, page title "Research & Development Cell", subtitle "Sign in to your university portal account".

```
+-------------------------------------------------------------+
|               KANNUR UNIVERSITY                             |
|          Research and Development Cell                      |
|                                                             |
| Email address *                                             |
| [ scholar@kannur.ac.in                                    ] |
|                                                             |
| Password *                                                  |
| [ ******************                                      ] |
|                                                             |
| [Forgot password?]                                          |
|                                                             |
| [  Sign in to portal  ]   (Accent Blue #1F3A5F)             |
|                                                             |
| ----------------------------------------------------------- |
| New to the R&D Cell?                                        |
| [Apply for Scholar Registration] · [Apply for Guideship]     |
+-------------------------------------------------------------+
```

### Constraints & Anti-"AI-look" rules:
- No illustration on the left, no decorative 3D shapes or floating cards.
- 1px flat border (`--color-border-default`), 4px border radius.
- On error (e.g. invalid credentials or account locked): clean inline red alert (`--color-danger-bg` with 1px `--color-danger-border`).

---

## 2. Guide Registration Screen (`/signup/guide`)

### Layout & Blueprint
- **Layout:** Stepper layout, max width 680px, centered.
- **Top Bar:** "Step 1 of 4: Research Centre Affiliation" -> "Step 2: Credentials" -> "Step 3: Uploads" -> "Step 4: Review".

```
+-----------------------------------------------------------------------------------------+
| Step 4 of 4 · Review & Live Approval Path                                               |
| Review your application details before final submission.                                |
|                                                                                         |
| Candidate: Dr. Thomas Mathew · Assistant Professor                                      |
| Department: Department of Physics                                                       |
| Selected Centre: Govt. College Kasaragod (Affiliated College)                           |
| Specialization: Condensed Matter Physics, Nanomaterials                                 |
|                                                                                         |
| +-------------------------------------------------------------------------------------+ |
| | RESOLVED APPROVAL PATHWAY FOR THIS REGISTRATION:                                    | |
| | [1. Applicant (You)]  ->  [2. Centre Head (Govt College)]  ->  [3. DRC Convenor]    | |
| | Note: Because this centre is an Affiliated College, the Research Centre Head        | |
| | will verify your credentials prior to Departmental Research Committee approval.     | |
| +-------------------------------------------------------------------------------------+ |
|                                                                                         |
| [X] I declare that all academic credentials and uploads provided are true and verified.  |
|                                                                                         |
| [< Back to Documents]                                [Submit Guideship Application]     |
+-----------------------------------------------------------------------------------------+
```

---

## 3. Scholar Registration Screen (`/signup/scholar`)

### Layout & Blueprint
- **Layout:** 5-step structured application form (max width 720px).
- **Interactive Guide Selection Step:**
  - Department: `Department of Chemistry`
  - Centre: `University Campus Research Centre (University Department)`
  - Search Guide: Filterable combobox showing only recognized guides with vacant quota.
  - Selected Guide Card: Shows Guide Name, Title, Specialization, and capacity `4 of 8 scholars allocated`.

```
+-----------------------------------------------------------------------------------------+
| Step 5 of 5 · Final Review & Sequential Chain Preview                                   |
| Review all submitted information before initiating your registration file.              |
|                                                                                         |
| Scholar: Deepa V. K. · Admission Category: Full-time JRF                                |
| Department: Department of Chemistry                                                     |
| Research Centre: Department of Chemistry, University Campus (University Department)     |
| Allocated Guide: Dr. K. Raman (Associate Professor)                                     |
| Proposed Topic: "Green Synthesis of Mesoporous Metal-Organic Frameworks"                |
| Uploaded Documents: PG_Marks.pdf, JRF_Award_Letter.pdf, Joining_Report.pdf              |
|                                                                                         |
| +-------------------------------------------------------------------------------------+ |
| | RESOLVED APPROVAL PATHWAY:                                                          | |
| | [1. You (Scholar)]  ->  [2. Guide (Dr. K. Raman)]  ->  [3. DRC Convenor (Dr. Menon)] | |
| | Note: Because this centre is a University Department, the application routes        | |
| | directly from your Guide to the DRC Convenor without an intermediate college head.  | |
| +-------------------------------------------------------------------------------------+ |
|                                                                                         |
| [< Edit Details]                                       [Submit Scholar Registration]    |
+-----------------------------------------------------------------------------------------+
```

