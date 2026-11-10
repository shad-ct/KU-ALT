# Component Specification: RemarksDialog

## 1. Purpose
The `RemarksDialog` is a critical decision modal triggered whenever an authority takes an action requiring formal documentation—most notably **Return for changes**, **Reject application**, or **Official staff endorsement**. In institutional governance, decisions without recorded reasoning are prohibited; this component ensures remarks are captured, audited, and formatted cleanly.

---

## 2. Anatomy
```
+-----------------------------------------------------------------------+
| Return application to scholar                                     [X] | <-- Header (16px semibold)
+-----------------------------------------------------------------------+
| Please specify the corrections required. The scholar will receive    | <-- Context Subtitle
| your remarks and will be allowed to resubmit the application.         |
|                                                                       |
| Remarks / Justification *                                            | <-- Form Label
| +-------------------------------------------------------------------+ |
| | Please provide the updated synopsis signed by the co-guide. The   | | <-- Textarea (min-h: 100px)
| | previous page 4 is missing the signature seal.                    | |
| +-------------------------------------------------------------------+ |
| 112 / 1000 characters                                                 | <-- Counter
|                                                                       |
| [ ] Notify applicant immediately by email (Enabled by default)        | <-- Checkbox
+-----------------------------------------------------------------------+
|                                        [Cancel]  [Return application] | <-- Action Footer
+-----------------------------------------------------------------------+
```

---

## 3. Props Interface
```typescript
interface RemarksDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  actionType: 'RETURN' | 'REJECT' | 'APPROVE' | 'REVOKE';
  actionLabel: string;
  isSubmitting?: boolean;
  error?: string | null;
  minLength?: number; // Default 10 characters for Return/Reject
  maxLength?: number; // Default 1000 characters
  onSubmit: (data: { remarks: string; notifyEmail: boolean }) => Promise<void>;
}
```

---

## 4. States
- **Open / Default:** Centered overlay (`z-index: 50`). Backdrop with 40% black opacity (`rgba(28, 28, 26, 0.4)`). White card surface (`--color-surface-card`), 1px border (`--color-border-default`), elevation `--shadow-dialog`.
- **Textarea Focus:** 2px solid border (`--color-border-focus`), label transitions to weight 500.
- **Validation Error:**
  - If submission attempted with empty or whitespace-only remarks: input border turns red (`--color-danger-text`), inline error: "A detailed remark is required when returning or rejecting an application."
- **Submitting (Loading):**
  - Primary button shows subtle loading state ("Processing...", spinner icon, disabled).
  - Cancel button disabled to prevent accidental abort during active transaction.
- **Action Variants:**
  - `RETURN`: Primary button styled as solid warning/accent button ("Return application").
  - `REJECT`: Primary button styled with danger accent (`--color-danger-text` background or bordered danger button).
  - `APPROVE`: Primary button styled with academic blue accent (`--color-accent-default`).

---

## 5. Keyboard Behaviour
- Focus trapped within modal while open (using Radix UI Dialog primitive).
- Initial focus placed on textarea.
- `Escape`: Closes modal (if not currently submitting).
- `Tab`: Cycles through textarea -> notification checkbox -> Cancel button -> Submit button.
- `Ctrl + Enter` / `Cmd + Enter`: Fast submission shortcut from inside the textarea.

---

## 6. ARIA & Accessibility
- Container: `role="dialog"`, `aria-modal="true"`.
- Linked title: `aria-labelledby="remarks-dialog-title"`.
- Linked description: `aria-describedby="remarks-dialog-desc"`.
- Textarea marked with `aria-required="true"`.
- Character count has `aria-live="polite"` update frequency.

---

## 7. Do / Don't
- **DO:** Mandate a minimum character count (minimum 10 characters) for rejection and return actions to prevent empty or unhelpful remarks like "No" or "Fix".
- **DO:** Explicitly state the consequences of the action in the modal header description.
- **DON'T:** Use generic confirmation boxes ("Are you sure you want to proceed?").
- **DON'T:** Allow submission of whitespace-only strings.

