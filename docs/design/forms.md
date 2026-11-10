# D6 — Form Design Specification

## 1. Universal Form Principles
1. **Single Column Layout:** Multi-column forms increase cognitive fatigue and visual saccades. All forms follow a strictly single-column vertical flow with a maximum content width of `1200px` (or `680px` for dialogs/signups).
2. **Top-Aligned Labels:** Labels sit directly above the input fields with clear `14px` weight 500 typography.
3. **Stepper for Multi-Stage Submissions:** Lengthy forms use a persistent top stepper ("Step 2 of 4 · Academic Details") indicating clear forward progress.
4. **Draft Autosave:** Complex scholar service applications and multi-step registration forms autosave locally/remotely with a quiet timestamp note: *"Saved 14:22"*.
5. **Pre-Submission Approval Transparency:** The review step of any signup or service application MUST visually render the exact approval sequence resolved for the chosen institution before the user hits submit.

---

## 2. Guide Registration Form (`/signup/guide`)

### Stage 1: Institutional Affiliation
- **Department Selection:** Dropdown of all university research departments (e.g. Physics, History, Botany).
- **Research Centre Selection:** Dropdown populated based on chosen department.
  - Displays badge: `[University Department]` or `[Affiliated College]`.
- **Dynamic Institutional Notice:**
  - If `AFFILIATED_COLLEGE`: *"Note: Affiliated college guideship applications require approval by the Research Centre Head before proceeding to DRC Convenor."*
  - If `UNIVERSITY_DEPARTMENT`: *"Note: Applications route directly to the DRC Convenor."*

### Stage 2: Personal & Academic Credentials
- Full Name (as recorded in official university register)
- Official Institutional Email & Phone Number
- Designation (Assistant Professor, Associate Professor, Professor)
- Highest Academic Qualification (PhD awarding university, year of award, registration number)
- Research Specialization & Areas of Competence (Tags/comma-delimited)

### Stage 3: Mandatory Document Uploads
- PhD Degree Certificate (PDF, max 5MB)
- Guideship Eligibility / Recognition Order from Kannur University (if renewing/porting)
- No Objection Certificate (NOC) from Head of Current Institution (PDF, max 5MB)
- Identity Proof (Institutional ID card / Aadhaar / Passport)

### Stage 4: Review & Live Approval Path Preview
- Summary definition list of all entered facts.
- **Approval Path Preview Banner:**
  - Case 1 (Affiliated): `Applicant -> Research Centre Head (Dr. X) -> DRC Convenor (Dr. Y) -> Active Guide Account`
  - Case 2 (University Dept): `Applicant -> DRC Convenor (Dr. Y) -> Active Guide Account`
- Declaration checkbox: *"I hereby confirm that all information provided is accurate according to Kannur University R&D regulations."*
- Primary Action: `[Submit guideship application]`

---

## 3. Scholar Registration Form (`/signup/scholar`)

### Stage 1: Department & Research Centre Selection
- Research Department (e.g., Department of Chemistry)
- Research Centre (Filtered by department). Visual tag indicates `[University Department]` or `[Affiliated College]`.

### Stage 2: Guide Selection (Capacity Constrained)
- Searchable combobox listing **only approved guides** with available scholar quota.
- Guide card preview upon selection:
  ```
  +---------------------------------------------------------------------------------+
  | Dr. K. Raman (Associate Professor, Dept of Chemistry)                           |
  | Specialization: Organic Catalysis, Polymer Chemistry                            |
  | Capacity: 6 / 8 Scholars Allocated · [2 Slots Available]                        |
  +---------------------------------------------------------------------------------+
  ```
- *Edge case lock:* If a guide has 0 available slots, the option is disabled with reason *"Capacity limit reached (8/8)"*.

### Stage 3: Research Topic & Admission Particulars
- Proposed Research Topic / Provisional Title (Text input, max 200 chars)
- Admission Category (Full-Time, Part-Time, JRF/NET Qualified, Fellowship Holder)
- Date of Admission / Joining Research Centre (Datepicker)
- Fellowship Particulars (Fellowship agency name, sanction order number, duration)

### Stage 4: Mandatory Document Uploads
- Post-Graduate Degree Certificate & Mark Sheets (PDF, max 5MB)
- National Eligibility Test (NET / JRF / GATE) Scorecard / Order (PDF, max 5MB)
- Joining Report signed by Guide and Centre Head (PDF, max 5MB)
- Fee Payment Voucher / Challan Receipt (PDF, max 5MB)

### Stage 5: Final Review & Live Approval Chain Preview
- Comprehensive summary list of all uploaded documents and data.
- **Approval Path Preview Banner:**
  - Case A (Affiliated): `Scholar -> Guide (Dr. K. Raman) -> Centre Head (Dr. S. Nambiar) -> DRC Convenor (Dr. V. Menon) -> Active Scholar Account`
  - Case B (University Dept): `Scholar -> Guide (Dr. K. Raman) -> DRC Convenor (Dr. V. Menon) -> Active Scholar Account`
- Submission CTA: `[Submit scholar registration]`

---

## 4. Scholar Service Application Forms (`/services/:type/new`)

The 8 statutory service application types share a unified dynamic form architecture:
1. **RAC / Three-Member Committee Review** (Milestone report, progress presentation slide deck upload, publication count)
2. **Title Change Application** (Existing title, proposed new title, technical justification, RAC recommendation document)
3. **Research Centre Change** (Current centre, proposed centre, NOC from existing centre head, NOC from receiving centre head)
4. **Guide Change** (Current guide, proposed new guide, reason for transfer, NOC from current guide, consent letter from new guide)
5. **Leave Request** (Leave category: maternity, medical, duty; from date, to date, total days, medical or duty certificate)
6. **Extension Request** (Current registration expiry date, requested extension period: 6/12 months, work completion percentage, chapter status, RAC minutes)
7. **Condonation Request** (Period of gap/shortage, detailed reason, supporting medical/administrative evidence, penalty payment voucher)
8. **Pre-Submission Application** (Draft thesis summary/synopsis, 2 peer-reviewed published journal papers, course work completion marklist, RAC pre-submission approval minutes)

### Standard Service Form Layout:
- Top: Service title, eligibility criteria, and fee requirement note.
- Middle: Structured inputs (dates, textfields, selectors).
- Required Documents Slot: Enforced via `FileUploader` with client-side magic-byte check.
- Live Approval Chain: `Guide -> [Centre Head if Affiliated] -> DRC Convenor -> Staff (Official Processing & Order Generation)`.
- Bottom Action Bar: `[Save Draft]` (quiet feedback) and `[Submit to Guide]`.

---

## 5. Research Equipment Request Form (`/equipment/:id/request`)
Per Module 11 rules:
- **Selected Instrument Summary:** Name, Model, Department, Location, Custodian DRC Convenor.
- **Current Availability Banner:** e.g. `[• 2 of 3 units available]`.
- **Booking Period:**
  - Start Date & Time
  - End Date & Time
  - Validation: Cannot exceed maximum reservation duration (e.g. 14 consecutive days).
- **Research Purpose Justification:** Textarea (min 50 chars).
- **Consumables / Sample Details:** Sample nature, hazardous chemicals checklist, required safety protocol compliance.
- **Guide Endorsement Consent:** Checkbox acknowledging guide has sanctioned this experimental run.
- **Submit Action:** Validates active allocation quota (prevents booking if scholar has already reached max active loans).

