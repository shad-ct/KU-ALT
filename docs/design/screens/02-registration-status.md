# Screen Blueprint: Registration Status (`/registration-status`)

## 1. Context & Route Guards
This is the exclusive, mandatory landing page for any authenticated user whose status is `PENDING_APPROVAL`. Any attempt by this user to navigate to `/dashboard`, `/applications`, or other protected routes is intercepted by the route guard and redirected here with a clear banner.

---

## 2. Blueprint & Layout (Max Content Width: 880px)

```
+---------------------------------------------------------------------------------------------------+
| KANNUR UNIVERSITY · Research & Development Cell                           [deepa@gmail.com] [Sign Out]
+---------------------------------------------------------------------------------------------------+
| 
| Registration Application Status
| Application Ref: KU-REG-SCH-2026-0042 · Submitted on 12 Oct 2026
|
| +-----------------------------------------------------------------------------------------------+ |
| | CURRENT APPLICATION STATUS                                                                    | |
| | (•) In progress · Waiting on DRC Convenor                                                     | |
| | Your registration has been verified by your Research Guide and Centre Head. It is currently   | |
| | queued for final approval by the Departmental Research Committee Convenor.                   | |
| +-----------------------------------------------------------------------------------------------+ |
|
| APPROVAL TIMELINE & AUDIT TRAIL
|
|   [o] 1. Scholar Registration Form Submitted ----------------- 12 Oct 2026, 11:20 AM
|    |     Submitted by Deepa V. K.
|    |
|   [o] 2. Endorsed by Research Guide -------------------------- 14 Oct 2026, 04:15 PM
|    |     Dr. K. Raman (Associate Professor)
|    |     Remarks: "All PG credentials and JRF award letter verified in original."
|    |
|   [o] 3. Endorsed by Research Centre Head -------------------- 16 Oct 2026, 02:40 PM
|    |     Dr. S. Nambiar (Govt College Kasaragod)
|    |     Remarks: "Laboratory seat and infrastructure allotment confirmed."
|    |
|   [*] 4. Departmental Research Committee Convenor ------------ (Current Step · Pending)
|    |     Assigned to: Dr. V. Menon (DRC Convenor, Department of Chemistry)
|    |
|   [ ] 5. Official Registration Order Issued ------------------ Future Step
|          Kannur University Permanent Scholar Registration Number Allotment
|
| +-----------------------------------------------------------------------------------------------+ |
| | SUBMITTED PARTICULARS & DOCUMENTS                                                             | |
| | Guide: Dr. K. Raman                 | Programme: Ph.D. Chemistry (Full-Time)                  | |
| | Topic: Green Synthesis of Mesoporous Metal-Organic Frameworks                                 | |
| | Documents: [PG_Degree.pdf]  [JRF_Award.pdf]  [Joining_Report.pdf]                             | |
| +-----------------------------------------------------------------------------------------------+ |
+---------------------------------------------------------------------------------------------------+
```

---

## 3. Returned State Variant (Action Required)
When the application is returned by an approver:
- Top banner turns amber (`--color-warning-bg`, 1px solid `--color-warning-border`).
- Text explicitly displays the reviewer's mandatory remark.
- Primary CTA rendered: `[Edit registration and resubmit]`. Clicking this opens the editable form stepper with all previous entries pre-populated.

