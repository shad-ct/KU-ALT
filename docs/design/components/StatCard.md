# Component Specification: StatCard (Summary Metric Strip)

## 1. Purpose
`StatCard` provides instant, scannable awareness of key operational counts (e.g. "Total scholars", "Pending verification", "Approved", "Active allocations") without resort to colorful dashboard "toy tiles". It renders as a unified, hairline-separated horizontal summary strip with large tabular numerals, plain labels, and direct click-through to pre-filtered list views.

---

## 2. Anatomy
```
+-------------------------------------------------------------------------------------------------------------------------+
| TOTAL SCHOLARS          | PENDING VERIFICATION   | APPROVED THIS TERM     | ACTIVE ALLOCATIONS     | OVERDUE ITEMS      |
| 142                     | 8                      | 64                     | 19                     | 2                  |
| 12 affiliated centres   | Waiting on DRC action  | Academic Year 2026-27  | 84% utilization rate   | Action required    |
+-------------------------------------------------------------------------------------------------------------------------+
       ^                         ^
  Column 1                  Column 2 (Clickable filter tile)
```

Each column in the strip:
- Top: Metric label (12px, uppercase / medium, secondary text `--color-text-secondary`)
- Middle: Metric count (24px, semibold, tabular figures `font-variant-numeric: tabular-nums`, `--color-text-primary`)
- Bottom: Contextual subline (12px, regular, muted secondary text `--color-text-secondary`)

---

## 3. Props Interface
```typescript
export interface MetricItem {
  id: string;
  label: string;
  value: number | string;
  subtext?: string;
  tone?: 'default' | 'accent' | 'warning' | 'danger';
  filterHref?: string;
  onClick?: () => void;
}

interface StatCardProps {
  metrics: MetricItem[];
  isLoading?: boolean;
}
```

---

## 4. States
- **Default:** Clean white strip background (`#FFFFFF`), 1px outer border (`--color-border-default`), 1px vertical hairline dividers (`--color-border-subtle`) between metric cells.
- **Hover (Clickable Item):** Background transitions slightly to `--color-surface-bg` (`#FAFAF8`). Top border or text gains subtle accent highlight.
- **Focus Visible:** Cell receives 2px solid `--color-border-focus` inside cell boundary.
- **Tones (Muted text only):**
  - `default`: Number is `#1C1C1A`.
  - `accent`: Number is `#1F3A5F` (e.g. items waiting on user action).
  - `warning`: Number is `#8A5300` (e.g. pending items approaching SLA).
  - `danger`: Number is `#B71C1C` (e.g. overdue equipment or rejected files).
- **Loading:** Display 24px gray placeholder bar for numerals with subtle shimmer.

---

## 5. Keyboard Behaviour
- If `filterHref` or `onClick` is provided, the metric cell acts as a link/button.
- `Tab` navigates between metric cells.
- `Enter` / `Space` activates the filter and routes to the corresponding data table view.

---

## 6. ARIA & Accessibility
- Container has `role="region"` and `aria-label="Key performance indicators"`.
- If clickable: wrapped in `<a href={filterHref}>` or `<button>` with clear aria label (e.g. `"Pending verification: 8 items. View filtered list."`).
- Tabular figures rendered with CSS `tabular-nums` ensuring consistent spacing.

---

## 7. Do / Don't
- **DO:** Group 3 to 6 metrics into a single unified hairline-separated strip.
- **DO:** Ensure every count is clickable to the underlying records matching that condition.
- **DON'T:** Create separate floating rounded-2xl cards with heavy drop shadows for each metric.
- **DON'T:** Place bright multicolored icons inside colored circles next to each number.
- **DON'T:** Display decorative upward/downward percentage arrows if historical trends are unverified.

