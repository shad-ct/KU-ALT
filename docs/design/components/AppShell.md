# Component Specification: AppShell & Navigation

## 1. Purpose
The `AppShell` establishes the primary viewport frame for all authenticated users. It consists of a fixed left sidebar (width 232px) for hierarchical role-based navigation, a slim top bar (height 52px) for breadcrumbs, system alerts, and user profiles, and a main scrollable viewport constrained to 1200px max width for forms and 100% width for data tables.

---

## 2. Anatomy
```
+----------------------------------------------------------------------------------------------------+
| [Logo] KANNUR UNIVERSITY R&D  | Breadcrumb: Research > Scholars             [Bell (3)] [Dr. Raman v] | <-- Top Bar (52px, #FFFFFF)
+-------------------------------+--------------------------------------------------------------------+
| NAVIGATION                    |                                                                    |
| Dashboard                     | Page Header Content                                                |
| Approvals (4)                 |                                                                    |
| My Scholars                   | Main Viewport                                                      |
| Research Equipment            | (Max 1200px for forms, 100% for tables)                            |
| Notifications                 |                                                                    |
|                               |                                                                    |
| -- SYSTEM --                  |                                                                    |
| Profile & Settings            |                                                                    |
| Sign Out                      |                                                                    |
|                               |                                                                    |
| Left Sidebar (232px, #FFFFFF) |                                                                    |
+-------------------------------+--------------------------------------------------------------------+
```

---

## 3. Props & Navigation Configuration Interface
```typescript
export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon?: string; // Lucide icon name (stroke 1.5, 16px)
  badgeCount?: number;
  badgeTone?: 'accent' | 'warning' | 'danger';
  requiredPermission?: string;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

interface AppShellProps {
  user: {
    name: string;
    email: string;
    activeRole: string;
    availableRoles: string[];
  };
  navigation: NavSection[];
  unreadNotificationCount: number;
  onRoleSwitch?: (newRole: string) => void;
  onSignOut: () => void;
  children: React.ReactNode;
}
```

---

## 4. States & Responsive Layout
- **Desktop (>= 1024px):**
  - Sidebar: Fixed width 232px, fixed position left, background white, 1px right border (`--color-border-subtle`).
  - Active Nav Item: Accent text color (`--color-accent-default`), font weight 500, with a 2px solid left accent bar (`--color-accent-default`) and 4% accent background tint (`--color-accent-subtle`).
  - Hover Nav Item: Background `--color-surface-hover` (`#ECEBE6`), text `--color-text-primary`.
  - Inactive Nav Item: Text `--color-text-secondary` (`#5E5D58`), font weight 400.
- **Mobile / Tablet (< 1024px):**
  - Sidebar collapses into a slide-over drawer triggered by a hamburger button in the top bar.
  - Backdrop overlay with 40% opacity.
- **Top Bar:**
  - Height: 52px. Sticky top.
  - Left: Institutional breadcrumb or section indicator.
  - Right: Notification bell with unread count indicator (small dot or count) + User avatar/name dropdown menu with role switcher (only shown when user holds >1 role per Assumption A3).

---

## 5. Keyboard Behaviour
- `Tab`: First moves focus to "Skip to main content" link (hidden until focused), then through top bar controls, then sidebar items.
- Inside sidebar: Arrow up / Arrow down allows rapid movement between menu links.
- Role switcher dropdown: Standard ARIA combobox / menu keyboard navigation (`Enter`, `Escape`, `ArrowDown`).

---

## 6. ARIA & Accessibility
- Sidebar wrapped in `<nav aria-label="Main Navigation">`.
- Active link receives `aria-current="page"`.
- Badges with counts receive accessible labels: e.g. `<span aria-label="4 pending approval items">4</span>`.
- Top bar contains `<header role="banner">`.
- Main content wrapped in `<main id="main-content" tabIndex="-1">`.

---

## 7. Do / Don't
- **DO:** Include the pending count badge directly on "Approvals" so officers immediately notice waiting files.
- **DO:** Provide a role switcher in the user menu if a user has dual roles (e.g. Guide and Centre Head).
- **DON'T:** Use dark black/navy backgrounds for the sidebar; maintain a consistent warm-neutral/white surface.
- **DON'T:** Use large whimsical animated 3D icons in navigation items; use 16px Lucide icons (stroke 1.5).

