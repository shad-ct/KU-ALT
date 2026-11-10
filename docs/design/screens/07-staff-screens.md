# Screen Blueprint: Section Staff / Thapal Officer Screens

## 1. Context & Scope
`STAFF` users handle university-level administrative processing, official communication, formal order generation, date-of-submission recording, and certificate generation. They do NOT act as approvers during scholar/guide signup registration (Assumption A7), but process completed service applications and issue certificates.

---

## 2. Staff Dashboard (`/dashboard`)

### Layout & Blueprint
- **Layout:** PageHeader -> Metric Strip -> "Applications awaiting official processing" -> Recent certificate issuances.

```
+-------------------------------------------------------------------------------------------------------+
| Section Staff / Administrative Operations Dashboard                                                  |
| R&D Cell Section Desk · Kannur University Administrative Complex                                      |
+-------------------------------------------------------------------------------------------------------+
| TOTAL APPLICATIONS  | PENDING PROCESSING  | CERTIFICATES ISSUED | THESIS CLEARANCES   | DISPATCH TODAY|
| 318                 | 12 Files            | 84 Issued           | 6 Pending           | 9 Files       |
| Current term        | Action required     | Ph.D. / Coursework  | Date-of-Submission  | Due by 5:00 PM|
+-------------------------------------------------------------------------------------------------------+
| APPLICATIONS AWAITING ADMINISTRATIVE PROCESSING & ORDER ISSUANCE                                     |
| +---------------------------------------------------------------------------------------------------+ |
| | Ref ID   | Scholar Name    | Type                | Department      | DRC Endorsement | Action      | |
| |----------+-----------------+---------------------+-----------------+-----------------+-------------| |
| | APP-0810 | Deepa V. K.     | RAC Review #3       | Chemistry       | Approved 02 Nov | [Process]   | |
| | APP-0792 | Rahul M. Nair   | Extension Request   | Physics         | Approved 01 Nov | [Process]   | |
| | APP-0785 | Anjali Mohan    | Pre-Submission      | Botany          | Approved 29 Oct | [Process]   | |
| +---------------------------------------------------------------------------------------------------+ |
+-------------------------------------------------------------------------------------------------------+
```

---

## 3. Application Processing & Official Reply Screen (`/applications/:id`)

### Layout & Blueprint
- Detailed application dossier with DRC Convenor signature and remarks.
- **Administrative Processing Panel:**
  ```
  +-----------------------------------------------------------------------------------------+
  | OFFICIAL ADMINISTRATIVE ACTION & REPLY                                                  |
  |                                                                                         |
  | Action Taken: [Mark as Processed / Approved v]                                          |
  | Official File Number / Despatch Number: [ KU/RD/PHD/CHEM/2026/0891                    ] |
  |                                                                                         |
  | Official University Remarks / Minute Entry *                                            |
  | +-------------------------------------------------------------------------------------+ |
  | | Approved by the Vice-Chancellor / Director R&D. RAC Review 3 recommendations noted.  | |
  | | Course work completed with Grade 'A'. Permission granted to proceed with synthesis. | |
  | +-------------------------------------------------------------------------------------+ |
  |                                                                                         |
  | Attach Official Signed Order / Form (PDF) *                                             |
  | +-------------------------------------------------------------------------------------+ |
  | | [Upload Signed Order PDF]  Max 5MB                                                  | |
  | +-------------------------------------------------------------------------------------+ |
  |                                                                                         |
  | [X] Transmit official reply and attached order to Scholar and Guide via email alert     |
  |                                                                                         |
  | [Save Draft Processing]                          [Issue Official University Order]      |
  +-----------------------------------------------------------------------------------------+
  ```

---

## 4. Certificate Generation & Management (`/certificates`)

### Layout & Blueprint
- **Certificate Templates:**
  - Bona Fide Research Scholar Certificate
  - Course Work Completion Certificate
  - Guideship Recognition Certificate
  - No Objection Certificate (NOC) for External Grants
- **Generation Flow:**
  1. Select Certificate Type -> Search Scholar/Guide by Reg No.
  2. Pre-populates scholar facts, admission date, department, guide name.
  3. Previews HTML/PDF certificate layout using university letterhead template.
  4. Generates unique verified serial number via database counter (`KU-CERT-2026-0129`).
  5. Action: `[Generate & Issue Certificate]`. Generates PDF via Puppeteer and files into scholar profile.

