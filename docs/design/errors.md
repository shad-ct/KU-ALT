# D8 — Error Flows & Exception Recovery

## 1. Guiding Error UX Principles
1. **Never Blame the User:** Explain clearly what happened in plain institutional language without technical jargon.
2. **Always Provide a Recovery Action:** Every error banner or modal must offer a direct remedy ("Edit application", "Retry upload", "Contact R&D Cell Desk").
3. **No Unhandled Crashes:** All API error codes map to predictable UI states.
4. **Preserve Form Data:** Never discard filled inputs when an error occurs. Form drafts remain safely intact.

---

## 2. Core Error Scenarios & Recovery Flows

### Scenario 1: Application Returned for Changes (`RETURNED`)
- **Trigger:** Approving authority clicks "Return to scholar" and submits mandatory revision remarks.
- **Scholar User Journey:**
  1. Scholar receives urgent in-app notification & email alert: *"Action required: Your RAC application has been returned for revisions by Dr. Raman."*
  2. Scholar logs in; application status displays amber chip: `[• Returned for changes]`.
  3. Detail page displays highlighted amber alert box at top:
     ```
     +------------------------------------------------------------------------------------+
     | Action Required: Corrections Requested                                            |
     | Returned by Dr. K. Raman (Research Guide) on 14 Oct 2026:                          |
     | "Please provide the updated synopsis signed by the co-guide. Page 4 lacks seal."  |
     |                                                      [Edit and resubmit]          |
     +------------------------------------------------------------------------------------+
     ```
  4. Clicking `[Edit and resubmit]` unblocks the form with all previous data preserved.
  5. Scholar replaces the specified PDF attachment and submits. Status returns to `IN_PROGRESS`.

---

### Scenario 2: Application Rejected (`REJECTED`)
- **Trigger:** Approving officer rejects application with official justification.
- **Applicant Experience:**
  - Status transitions permanently to red chip: `[• Rejected]`.
  - An official rejection notice is displayed at the top of the detail view with the officer's full signed remarks.
  - Form inputs are rendered read-only.
  - Recovery CTA: `[Download formal rejection memo]` or `[Submit new application]`.

---

### Scenario 3: Missing Approver / Vacant Chair (`MISSING_APPROVER`)
- **Trigger:** A scholar from an affiliated college submits an application, but the university database has not yet appointed a `CENTRE_HEAD` for that college, or a department has no `DRC_CONVENOR`.
- **System Guard:** Pre-submission check warns applicant:
  ```
  +------------------------------------------------------------------------------------+
  | Institutional Notice: Approving Authority Unassigned                               |
  | The selected research centre (Govt College Kasaragod) does not currently have an   |
  | active Research Centre Head recorded in the university portal.                     |
  |                                                                                    |
  | You cannot submit this application until the R&D Cell designates an authority.     |
  | Your application has been saved as a Draft.                                        |
  | Action: [Contact R&D Cell Administrative Staff]                                    |
  +------------------------------------------------------------------------------------+
  ```
- **Admin Alert:** An automated critical ticket is generated in the Admin "Missing Approvers" audit report.

---

### Scenario 4: Step Mismatch / Concurrency Conflict (`STEP_MISMATCH` / `409 CONFLICT`)
- **Trigger:** Two DRC convenors open the same pending application concurrently; Officer A approves it, then Officer B attempts to approve it 10 seconds later from a stale browser tab.
- **Resolution:**
  - The backend `act()` service employs optimistic concurrency (`expectedStepIndex`) and row locks (`SELECT ... FOR UPDATE`).
  - Officer B's submission is intercepted and rejected with `409 Conflict: Application has already been acted upon`.
  - Officer B's UI displays a modal:
    ```
    +---------------------------------------------------------------------+
    | Application Updated Concurrently                                    |
    | This application was approved by Dr. V. Menon at 11:42 AM while you |
    | were reviewing it. Your action was not applied.                     |
    |                                                                     |
    |                                                [Refresh application]|
    +---------------------------------------------------------------------+
    ```
  - Clicking `[Refresh application]` reloads the latest state without corrupting the audit history.

---

### Scenario 5: Equipment Double-Allocation Race (`EQUIPMENT_UNAVAILABLE`)
- **Trigger:** Two scholars attempt to book the last available spectrophotometer unit for the identical time slot at the exact same instant.
- **Resolution:**
  - Database row locking on the unit table ensures serial execution. The first transaction wins; the second transaction fails with `EQUIPMENT_UNAVAILABLE`.
  - The second scholar is presented with an inline notice:
    ```
    +---------------------------------------------------------------------+
    | Instrument Unavailable for Selected Slot                            |
    | The requested unit was reserved by another researcher moments ago.  |
    | Next available date for this instrument: 24 Oct 2026.               |
    |                                                                     |
    | [Choose alternative date range]       [View alternative equipment]  |
    +---------------------------------------------------------------------+
    ```

---

### Scenario 6: Upload Validation & MIME Rejection (`UPLOAD_REJECTED`)
- **Trigger:** An applicant attempts to upload a `.exe` disguised as `.pdf`, a file exceeding 5MB, or experiences a severed internet connection mid-upload.
- **Handling:**
  - Magic-byte detection rejects spoofed files before saving to disk.
  - Form displays an immediate inline error below the specific file row:
    - *Size breach:* `"File size (7.2 MB) exceeds the allowable 5 MB limit. Please compress the document."`
    - *Corrupt / Spoofed MIME:* `"File verification failed. The document does not appear to be a genuine PDF."`
    - *Network timeout:* `"Upload interrupted. Check your network connection and click Retry."`
  - All other already-uploaded files and text inputs remain preserved.

