# Component Specification: FormField

## 1. Purpose
`FormField` is the unified container for all form inputs (text, numbers, selects, textareas, datepickers, radios). It provides consistent label placement, mandatory field indicators, contextual helper text, character counts, and localized validation error messages.

---

## 2. Anatomy
```
Research Centre *                                           <-- Label (14px, weight 500, #1C1C1A)
+---------------------------------------------------------+
| Govt. College Kasaragod (Affiliated College)         [v] | <-- Input Field (40px height, #FFFFFF, 1px border)
+---------------------------------------------------------+
Note: Affiliated college registrations require Centre Head  <-- Helper Text (13px, #5E5D58)
verification before reaching DRC.
```

When in error state:
```
Guide Allotment *
+---------------------------------------------------------+
| Select an approved guide                             [v] | <-- Border: 1px solid #B71C1C
+---------------------------------------------------------+
Please select an approved research guide from the list.     <-- Error Text (13px, #B71C1C)
```

---

## 3. Props Interface
```typescript
interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  optionalLabel?: boolean; // Renders "(optional)" next to label
  helperText?: string;
  error?: string | null;
  className?: string;
  children: React.ReactNode;
  hintSlot?: React.ReactNode; // e.g. "Step 1 of 4" or character count
}
```

---

## 4. States
- **Default:** Label text primary (`#1C1C1A`), input border `--color-border-default` (`#DCDAD4`), background white (`#FFFFFF`).
- **Focus Within:** Input border becomes 2px solid `--color-border-focus` (`#1F3A5F`). Label text remains distinct.
- **Hover:** Input border darkens slightly to `--color-border-strong` (`#BCBAB2`).
- **Disabled:** Input background `--color-surface-subtle` (`#F3F3EF`), text `--color-text-tertiary` (`#8C8A82`), border `--color-border-subtle` (`#EBEAE5`), cursor `not-allowed`.
- **Error:**
  - Input border becomes 1px solid `--color-danger-text` (`#B71C1C`).
  - Error message displayed immediately beneath input in 13px red text with alert icon (14px, Lucide).
  - Screen reader announcement on focus.

---

## 5. Keyboard Behaviour
- FormField is a layout wrapper; inner inputs receive standard HTML keyboard events (`Tab`, `Space`, `Enter`, arrows for select/radio).
- Focus navigation flows strictly top-to-bottom in standard form order.

---

## 6. ARIA & Accessibility
- Field wrapper uses standard `<label htmlFor={id}>` association.
- Mandatory fields render `<span aria-hidden="true" class="text-danger">*</span>` and the input receives `aria-required="true"`.
- If helper text exists: input receives `aria-describedby={`${id}-hint`}`.
- If error exists: input receives `aria-invalid="true"` and `aria-describedby={`${id}-error`}`.

---

## 7. Do / Don't
- **DO:** Always place labels above the input field for maximum readability and vertical scanning.
- **DO:** Provide plain-language error explanations that state how to resolve the problem (e.g. "Select a date on or after registration date").
- **DON'T:** Use placeholder text as a replacement for visible labels.
- **DON'T:** Use floating animated labels that shrink and slide (distracting and inconsistent with institutional software).

