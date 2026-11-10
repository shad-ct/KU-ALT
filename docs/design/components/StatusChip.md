# Component Specification: StatusChip

## 1. Purpose
`StatusChip` is the universal, standardized status indicator across the portal. It communicates application states, equipment availability, and account status with institutional quietness: an 8px circular dot, 12px/13px medium weight label, and an explicit indication of the current waiting authority.

---

## 2. Anatomy
```
+-------------------------------------------------------------+
|  (•) In progress · Waiting on Research Centre Head          |
+-------------------------------------------------------------+
    ^                           ^
  8px solid dot             Text label (Sentence case)
  (Color-coded)             Secondary text italicized
```

---

## 3. Props Interface
```typescript
export type ApplicationStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'IN_PROGRESS'
  | 'RETURNED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export type EquipmentStatus = 
  | 'PENDING'
  | 'APPROVED'
  | 'ALLOCATED'
  | 'RETURNED'
  | 'OVERDUE'
  | 'CANCELLED';

interface StatusChipProps {
  status: ApplicationStatus | EquipmentStatus | string;
  currentActorRole?: 'GUIDE' | 'CENTRE_HEAD' | 'DRC_CONVENOR' | 'STAFF' | null;
  overdueDays?: number;
  availableCount?: number;
  totalCount?: number;
  variant?: 'inline' | 'bordered'; // 'inline' for tables, 'bordered' for page headers
  size?: 'sm' | 'md';              // sm: 12px (tables), md: 13px (headers/detail)
}
```

---

## 4. States & Color Mappings
| State | Dot Token | Text / Role Token | Border Token (if bordered) | Display Output Example |
|---|---|---|---|---|
| **Draft** | `--color-neutral-text` (`#5E5D58`) | `--color-text-secondary` | `--color-border-default` | `• Draft` |
| **In Progress** | `--color-accent-default` (`#1F3A5F`) | `--color-accent-default` | `--color-accent-border` | `• In progress · Waiting on Guide` |
| **Returned** | `--color-warning-text` (`#8A5300`) | `--color-warning-text` | `--color-warning-border` | `• Returned for changes` |
| **Approved** | `--color-success-text` (`#1B5E20`) | `--color-success-text` | `--color-success-border` | `• Approved` |
| **Rejected** | `--color-danger-text` (`#B71C1C`) | `--color-danger-text` | `--color-danger-border` | `• Rejected` |
| **Cancelled** | `--color-text-tertiary` (`#8C8A82`) | `--color-text-secondary` | `--color-border-subtle` | `• Cancelled` |
| **Equip: Overdue**| `--color-danger-text` (`#B71C1C`) | `--color-danger-text` | `--color-danger-border` | `• Overdue (3 days)` |
| **Equip: Available**| `--color-success-text` (`#1B5E20`) | `--color-text-primary` | `--color-border-default` | `• 4 of 6 available` |

- **Hover/Active:** Non-interactive status chip has no hover change. If clickable (e.g. opens timeline history drawer), cursor becomes pointer and background gains a 4% neutral tint.
- **Focus:** If focusable, shows 2px solid `--color-border-focus`.

---

## 5. Keyboard Behaviour
- Standard display status chip is non-focusable.
- When rendered as an interactive filter trigger: `Tab` to navigate, `Enter` / `Space` to activate.

---

## 6. ARIA & Accessibility
- Must not rely on color alone. Screen reader text announces full descriptive status:
  ```html
  <span class="status-chip" role="status" aria-label="Status: In progress, waiting on Research Centre Head">
    <span class="status-dot" aria-hidden="true"></span>
    <span class="status-text">In progress · <em>Waiting on Research Centre Head</em></span>
  </span>
  ```

---

## 7. Do / Don't
- **DO:** Always display the current reviewer's role when in progress.
- **DO:** Use sentence case: "Returned for changes" (not "RETURNED").
- **DON'T:** Use large, fully-saturated neon pill badges that dominate the screen.
- **DON'T:** Use emoji symbols (e.g. ⚠️, ❌, ✅) instead of official typography and color dots.

