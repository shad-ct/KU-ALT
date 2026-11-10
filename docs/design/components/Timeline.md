# Component Specification: Timeline

## 1. Purpose
The `Timeline` displays the sequential approval chain and audit history of an application or registration. It renders past completed actions, the current active step, and muted future milestones so applicants and officers clearly understand where the application stands in the full institutional pipeline.

---

## 2. Anatomy
```
[o]  Submitted by Rahul M. Nair (Scholar) ---------------- 12 Oct 2026, 10:15 AM
 |
[o]  Approved by Dr. K. Raman (Guide) ------------------- 14 Oct 2026, 03:30 PM
 |   Remarks: "Topic and preliminary literature review verified."
 |
[*]  Research Centre Head (Current Step) ----------------- Pending action
 |   Assigned to: Dr. S. Nambiar (Govt College Kasaragod)
 |
[ ]  DRC Convenor ---------------------------------------- Future step
 |
[ ]  Staff Processing (Issuance) ------------------------- Future step
```

---

## 3. Props Interface
```typescript
export interface TimelineEvent {
  id: string;
  stepNumber: number;
  stepName: string;
  actorRole: string;
  actorName?: string;
  actionTaken: 'SUBMITTED' | 'APPROVED' | 'RETURNED' | 'REJECTED' | 'PENDING' | 'FUTURE';
  timestamp?: string | Date;
  remarks?: string;
  officialReplyAttachment?: {
    name: string;
    url: string;
    sizeBytes: number;
  };
}

interface TimelineProps {
  events: TimelineEvent[];
  orientation?: 'vertical' | 'horizontal'; // Vertical is primary; horizontal used for brief header stepper
  isBranchingAffiliated?: boolean;
}
```

---

## 4. States
- **Completed Step (`APPROVED` / `SUBMITTED`):**
  - Dot: 8px solid `--color-accent-default` or `--color-success-text`.
  - Connecting Line: 2px solid `--color-border-default`.
  - Title: `--color-text-primary`, weight 500.
  - Timestamp: `--color-text-secondary`, font size 12px, tabular numerals.
  - Remarks box: Inset box with left border 2px solid `--color-border-subtle`, background `--color-surface-subtle`.
- **Current Step (`PENDING`):**
  - Dot: 10px ring with inner dot (Accent blue `--color-accent-default`).
  - Connecting Line: 2px dashed `--color-border-default`.
  - Title: `--color-accent-default`, weight 600, badge "In progress".
  - Subtext: Identifies assigned office or officer name.
- **Future Step (`FUTURE`):**
  - Dot: 6px hollow circle with border `--color-border-strong`.
  - Connecting Line: 1px dotted `--color-border-subtle`.
  - Title & Text: `--color-text-tertiary`, weight 400.
- **Returned Step (`RETURNED`):**
  - Dot: Solid amber `--color-warning-text`.
  - Remarks: Highlighted with amber border (`--color-warning-border`) and text explaining requested revisions.
- **Rejected Step (`REJECTED`):**
  - Dot: Solid red `--color-danger-text`.
  - Remarks: Highlighted with danger border (`--color-danger-border`).

---

## 5. Keyboard Behaviour
- Expandable remarks or attached document links are keyboard focusable (`Tab`).
- `Enter` / `Space` opens preview or downloads attached official orders/replies.

---

## 6. ARIA & Accessibility
- Wrapped in `<ol aria-label="Application approval history" class="timeline">`.
- Each milestone is an `<li>` element.
- Current active step indicated via `aria-current="step"`.
- Hidden screen reader text clarifies progress: e.g. `<span class="sr-only">Completed on 14 Oct 2026: </span>`.

---

## 7. Do / Don't
- **DO:** Always display future steps in muted styling so applicants know the remaining approval pipeline.
- **DO:** Indent official remarks and file attachments directly under the approving officer's entry.
- **DON'T:** Hide previous rejection/return loops; preserve all historical cycles chronologically.
- **DON'T:** Use animated bouncy icons or celebratory confetti graphics upon final approval.

