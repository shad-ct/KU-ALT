# Component Specification: DataTable

## 1. Purpose
The `DataTable` is the core operational workhorse of the portal. It presents tabular institutional records (scholars, guides, applications, equipment units, audit logs) with predictable density, sticky headers, server-side sorting, pagination, and direct row navigation.

---

## 2. Anatomy
```
+---------------------------------------------------------------------------------------------------+
| [Filter Bar / Search / Column Visibility Slot]                                                    |
+---------------------------------------------------------------------------------------------------+
| [Checkbox] | Column Header 1 (Sortable ^) | Column Header 2 | Column Header 3 (Right) | [Actions] | <-- Sticky Header (36px, #F3F3EF)
+------------+------------------------------+-----------------+-------------------------+-----------+
| [ ]        | KU-SCH-2026-0012             | Deepa V. K.     | Physics                 | View ->   | <-- Row (40px height, #FFFFFF)
+------------+------------------------------+-----------------+-------------------------+-----------+
| [ ]        | KU-SCH-2026-0013             | Rahul M. Nair   | Chemistry               | View ->   | <-- Hairline divider (#EBEAE5)
+------------+------------------------------+-----------------+-------------------------+-----------+
| Showing 1–25 of 142 items                                        [< Previous] [Page 1 of 6] [Next >] | <-- Pagination Footer
+---------------------------------------------------------------------------------------------------+
```

---

## 3. Props Interface
```typescript
interface ColumnDef<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  width?: string;
  minWidth?: string;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  error?: string | null;
  onRowClick?: (item: T) => void;
  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (columnId: string, order: 'asc' | 'desc') => void;
  // Pagination
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (newPage: number) => void;
  // Selection
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  // Empty State
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: { label: string; onClick: () => void };
}
```

---

## 4. States
- **Default:** Clean white background (`#FFFFFF`), 1px bottom border on rows (`#EBEAE5`). Headers on subtle grey (`#F3F3EF`), font weight 500, font size 13px.
- **Hover (Row):** Subtle tint change to `#FAFAF8` (warm off-white), cursor `pointer` if `onRowClick` is provided.
- **Focus (Row / Action):** 2px solid `#1F3A5F` outline ring (`outline-offset: -2px`).
- **Selected (Row):** `#EEF2F6` (light academic blue tint), checkbox checked.
- **Loading:** Render 5–8 skeleton rows matching column widths with subtle opacity pulse (no spinning circles blocking the view).
- **Error:** Centered banner within table boundary displaying error message with a "Retry" button.
- **Empty:** Clear single-sentence explanation ("No applications match your filter.") + primary call-to-action button if applicable.

---

## 5. Keyboard Behaviour
- `Tab` / `Shift+Tab`: Moves focus through sortable headers, filter controls, row action buttons, and pagination controls.
- `Enter` / `Space` on Header: Toggles sort direction (Ascending -> Descending -> Default).
- `Enter` on focused row: Triggers `onRowClick` (opens detail drawer or routes to detail page).
- `ArrowDown` / `ArrowUp`: Navigates through table rows when row navigation is active.

---

## 6. ARIA & Accessibility
- Table container wrapped in `<div role="region" aria-label="[Table Title]" tabindex="0">` for horizontal scroll keyboard accessibility.
- Table uses standard `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`.
- Sortable headers: `aria-sort="ascending" | "descending" | "none"`.
- Row checkboxes: `<input type="checkbox" aria-label={`Select ${rowIdentifier}`} />`.
- Numeric columns formatted with `font-variant-numeric: tabular-nums` and `text-align: right`.

---

## 7. Do / Don't
- **DO:** Right-align all numeric quantities, dates, counts, and financial values.
- **DO:** Keep row height strictly at 40px for data density without crowding.
- **DO:** Use sentence case for headers ("Application date", "Guide name", "Status").
- **DON'T:** Use alternating zebra stripes (odd/even rows); use clean hairline dividers instead.
- **DON'T:** Truncate text with ellipses without providing full text on keyboard focus/hover tooltip.
- **DON'T:** Use colorful badge backgrounds inside table cells; use muted `StatusChip` with dot indicators.

