# Component Specification: FilterBar

## 1. Purpose
The `FilterBar` allows administrative staff, convenors, and guides to rapidly narrow extensive record sets (e.g. applications by status, centre, academic year, or date range). It sits directly above data tables without displacing table column alignments.

---

## 2. Anatomy
```
+-------------------------------------------------------------------------------------------------------------+
| [Search by scholar name or reg no...] | Centre: [All Centres v] | Status: [Pending v] | Date: [Current Term v] | [Clear] |
+-------------------------------------------------------------------------------------------------------------+
```

---

## 3. Props Interface
```typescript
export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterField {
  id: string;
  label: string;
  type: 'search' | 'select' | 'date-range';
  placeholder?: string;
  options?: FilterOption[];
  value: any;
  onChange: (val: any) => void;
}

interface FilterBarProps {
  fields: FilterField[];
  onReset?: () => void;
  activeFilterCount?: number;
  className?: string;
}
```

---

## 4. States
- **Default:** Integrated horizontal bar directly above table or inside table card header. Surface `--color-surface-subtle` or clean white with 1px border `--color-border-default`. Height 48px.
- **Search Input:** 36px height, text `--color-text-primary`, search icon (16px, Lucide) on left, clear cross button on right when populated.
- **Select Dropdowns:** 36px height, 1px border `--color-border-default`, chevron icon right.
- **Active Filters:** Active select boxes show border `--color-accent-border` and font weight 500. A "Clear filters" text button appears when filters are active.

---

## 5. Keyboard Behaviour
- `Tab` navigates through Search -> Select 1 -> Select 2 -> Clear button.
- Search input triggers debounced filtering (300ms) or on `Enter`.
- Dropdown opens on `Space` or `DownArrow`.

---

## 6. ARIA & Accessibility
- Wrapped in `<search>` or `<form role="search" aria-label="Filter records">`.
- Inputs have explicit `aria-label` matching filter purpose.
- Active filter count announced to screen readers.

---

## 7. Do / Don't
- **DO:** Include instantaneous text debounce (300ms) on text search to prevent jerky server queries.
- **DO:** Provide a visible "Clear all filters" button whenever any non-default filter is engaged.
- **DON'T:** Hide essential filters behind nested multi-click drawer popovers unless secondary.
- **DON'T:** Use brightly colored filter pills that distract from the tabular data below.

