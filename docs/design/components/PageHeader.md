# Component Specification: PageHeader

## 1. Purpose
The `PageHeader` establishes the context for every screen in the portal. It provides an institutional page title (using `Source Serif 4`), a concise one-line operational description, breadcrumb hierarchy, status badges where applicable, and the primary call-to-action button aligned to the right.

---

## 2. Anatomy
```
Research & Development  /  Applications  /  KU-APP-2026-0891                     <-- Breadcrumbs (13px, #5E5D58)
+-------------------------------------------------------------------------------+
| Research Advisory Committee (RAC) Application               [Return] [Approve] | <-- Title (30px Serif) + Primary Actions
| Submitted by Rahul M. Nair · Date of Registration: 14 Aug 2024                 | <-- Context Subtitle (14px, #5E5D58)
+-------------------------------------------------------------------------------+
```

---

## 3. Props Interface
```typescript
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string | React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  statusChip?: React.ReactNode;
  actions?: PageHeaderAction[];
  className?: string;
}
```

---

## 4. States
- **Default:** Clean vertical block. Title in `Source Serif 4`, 30px (`1.875rem`), weight 600, color `--color-text-primary`. Subtitle in `Source Sans 3`, 14px, color `--color-text-secondary`.
- **With Status Chip:** StatusChip displayed adjacent to title or immediately below title with clean 8px gap.
- **Action Buttons:**
  - `primary`: Background `--color-accent-default` (`#1F3A5F`), text white, 40px height, 4px border radius.
  - `secondary`: Background white, 1px border `--color-border-default`, text `--color-text-primary`.
  - `danger`: Background white, 1px border `--color-danger-border`, text `--color-danger-text`.
- **Loading:** Title and breadcrumbs rendered with neutral skeleton rectangles.

---

## 5. Keyboard Behaviour
- Standard tab progression: Breadcrumbs -> Title link (if any) -> Action buttons.
- Action buttons trigger on `Enter` or `Space`.

---

## 6. ARIA & Accessibility
- Title rendered with semantic `<h1>`.
- Breadcrumbs rendered inside `<nav aria-label="Breadcrumb">` containing an `<ol>` with `aria-current="page"` on the leaf item.
- Primary actions grouped in an `<aside>` or `<div>` with `aria-label="Page actions"`.

---

## 7. Do / Don't
- **DO:** Keep descriptions strictly operational (e.g. "Manage PhD guides and allocation quotas for the Department of Physics").
- **DO:** Limit primary high-emphasis buttons to one per screen.
- **DON'T:** Use decorative welcome messages ("Welcome back, Dr. Raman 👋").
- **DON'T:** Use banner images, gradient backgrounds, or photo illustrations behind the header.

