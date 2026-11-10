# 08 — Frontend, UI & UX Design System Specification

## Calm, Modern, Trustworthy Academic Product Direction

**Goal**: A modern, clean, accessible, and trustworthy digital service for Kannur University's Research & Development Cell. Built with the visual clarity, generous spacing, and purposeful typography of premier public digital services (such as GOV.UK and modern higher-education portals), combined with modern web ergonomics.

This specification supersedes all prior prototype aesthetics, decorative pseudo-statutory styling, and generic UI kit defaults.

---

## 1. Visual Philosophy & Core Principles

1. **Clarity Over Costume**:
   - No faux-legal jargon or mock docket aesthetic ("statutory", "docket", "dossier", "registry sign-in", "authorized credentials").
   - Clear, everyday sentence-case language tailored for scholars, faculty guides, centre heads, and administrators.
   - Generous breathing room, clear typographic hierarchy, and responsive layouts.

2. **Unified Typographic Voice**:
   - **One Sans-Serif Family**: `Public Sans` (self-hosted Google Font, variable weights 400, 500, 600) with fallbacks `Noto Sans`, `Noto Sans Malayalam`, and `system-ui`.
   - **Monospace for Data Codes Only**: `JetBrains Mono` (13px, muted) strictly reserved for machine-readable reference numbers (e.g., `KU-RDC/2026/RAC/00012`) and asset tags. Never for human prose, labels, dates, or venues.
   - **Strict Ban on Pseudo-Official Letter-Spacing**: No all-caps micro-labels (`text-transform: uppercase`), no artificial wide letter-spacing (`tracking-wider` / `tracking-widest`).
   - **Tabular Numerals**: `font-variant-numeric: tabular-nums` applied across all data tables, stat counts, timestamps, and dates.

3. **Single Institutional Accent & Subdued Surfaces**:
   - **Canvas Background**: Warm calm off-white paper canvas (`#F7F7F5`).
   - **Working Surfaces**: Clean white (`#FFFFFF`) panels and table containers with a subtle 1px border (`#E4E4DF`).
   - **One Institutional Accent**: Deep University Navy (`#1F4E8C`), with dedicated hover and background tints (`#183F73`, `#EEF3FA`).
   - **Restrained Status Signaling**: Soft tinted background pills with high-contrast text and a 6px status indicator dot.

4. **Modern Ergonomic Sizing & 4px Grid**:
   - Spacing scale follows a strict 4px grid (4, 8, 12, 16, 20, 24, 32, 40, 48, 64px).
   - Touch targets and desktop controls are generously sized: inputs $\ge$ 40px height (16px base font size to prevent mobile browser zooming), standard buttons $\ge$ 36px height, primary authentication buttons 48px height.
   - Soft rounded corners: 6px (`radius-sm`), 8px (`radius-md`), 12px (`radius-lg`), and 9999px (`radius-full`). Zero harsh 0px/2px edges; zero floating box-shadows on flat panels.

5. **Indian Date & Number Standards**:
   - Dates explicitly formatted as `dd MMM yyyy` (e.g., `15 Dec 2026`) or `dd/mm/yyyy`. Eliminates ambiguous US `mm/dd/yyyy` formatting across all screens.

---

## 2. Design Tokens (`tokens.css`)

### Color Palette

```css
:root {
  /* Surfaces & Canvas */
  --color-bg: #F7F7F5;
  --color-surface: #FFFFFF;
  --color-surface-sub: #F2F2EF;
  --color-border: #E4E4DF;
  --color-border-strong: #CFCFC8;

  /* Text & Ink */
  --color-text: #1A1A18;
  --color-text-muted: #5F5F59;
  --color-text-subtle: #8A8A83;

  /* Institutional Accent */
  --color-accent-50: #EEF3FA;
  --color-accent-100: #DCE7F5;
  --color-accent-600: #1F4E8C;
  --color-accent-700: #183F73;

  /* Accessible Status Colors (60-30-10 soft badges) */
  --color-success-text: #1B6B3A;
  --color-success-bg: #E8F4EC;
  --color-warning-text: #8A5A00;
  --color-warning-bg: #FDF3DC;
  --color-danger-text: #B3261E;
  --color-danger-bg: #FBEAE8;
  --color-info-text: #1F4E8C;
  --color-info-bg: #EEF3FA;
  --color-neutral-text: #5F5F59;
  --color-neutral-bg: #F0F0EC;
}
```

### Typography Scale

| Token | Size / Line-Height | Weight | Applied Usage |
|---|---|---|---|
| `display` | 32px / 40px | 600 | Public hero / Login title |
| `h1` | 28px / 36px | 600 | Page titles |
| `h2` | 20px / 28px | 600 | Section titles |
| `h3` | 16px / 24px | 600 | Card & panel titles |
| `body` | 15px / 24px | 400 | Default body text, descriptions, table rows |
| `form` | 16px / 24px | 400 | Form inputs (16px base prevents mobile zoom) |
| `label` | 14px / 20px | 500 | Field labels, sentence case |
| `small` | 13px / 20px | 400 / 500 | Helper text, table headers (500), captions |
| `mono` | 13px / 20px | 400 | Tabular reference IDs (`JetBrains Mono`) |

### Shapes, Radii & Elevation

- `radius-sm` (6px): Status chips, small badges, checkboxes.
- `radius-md` (8px): Inputs, buttons, segmented controls, select menus, table container outer corners.
- `radius-lg` (12px): Panels, modals, application dossiers, detail cards.
- `radius-full` (9999px): User profile avatar circles, icon indicators.
- **Elevation**: Flat surfaces without drop shadows (`box-shadow: none`). Floating menus and modals utilize a restrained drop shadow: `0 8px 24px rgba(20, 20, 18, 0.10)`.

---

## 3. Layout Grid & Responsive Architecture

### Desktop & Mobile Breakpoints

- **Max Content Width**: 1160px (`max-w-[1160px] mx-auto`).
- **Desktop ( $\ge$ 1024px)**:
  - Fixed 248px left navigation sidebar with sticky top header.
  - Page padding: 32px horizontal, 32px vertical (`p-8`).
  - Section vertical rhythm: 32px gap between major blocks.
- **Mobile ( $<$ 1024px)**:
  - Slide-in navigation drawer with 248px width and smooth backdrop overlay (`bg-black/40`).
  - Top header bar with hamburger menu toggle (`44x44px` touch target) and University brand mark.
  - Page padding: 16px horizontal, 20px vertical (`px-4 py-5`).
  - Horizontal scrollbars on tables encapsulated inside `overflow-x-auto` wrappers with preserved column min-widths.

---

## 4. Key Component Specifications

### 1. Application Shell (`AppShell.jsx`)
- **Desktop Sidebar**: 248px width, `#FFFFFF` background, right border `1px solid #E4E4DF`.
- **Navigation Groups**: Grouped cleanly into sentence-case sections ("Research", "Account", "Administration").
- **Nav Items**: 40px height, 8px radius, 10px gap between 18px stroke icon and label. Active link rendered with `bg-accent-50 text-accent-700 font-medium`.
- **User Footer**: Current user avatar initials (`bg-accent-50 text-accent-700 font-semibold`), full name, role badge, and accessible sign-out button.
- **Mobile Drawer**: Off-canvas transition with accessible trap focus and dismiss buttons.

### 2. Page Header (`PageHeader.jsx`)
- Title: 28px/36px weight 600 in sentence case.
- Description: 13px/20px weight 400 in muted text (`#5F5F59`), positioned exactly 4px beneath the title.
- Actions: Flexible container supporting React element buttons or declarative action objects.
- Spacing: 24px bottom margin before page content. **No horizontal rules separating title from content**.

### 3. Stat Strip (`DashboardPage.jsx`)
- Horizontal panel with clean 1px border dividers separating metrics.
- Vertically stacked layout per metric: Large tabular number (28px weight 600), followed by 4px gap, followed by caption (13px text-muted).
- Never inline or touching captions; clear visual hierarchy.

### 4. Data Table (`DataTable.jsx`)
- Header: 44px height, background `surface-sub` (`#F2F2EF`), text `small` (13px, weight 500, sentence case, `text-muted`).
- Rows: 56px height, 15px font size, subtle bottom divider (`#E4E4DF`).
- Hover: Soft background change to `surface-sub`.
- Numeric Data & Dates: Formatted with `tabular-nums`, right-aligned headers and cells.
- References: Styled in `font-mono text-[13px] text-text-muted`.
- Row Interactivity: Whole row clickable when action callback is provided.

### 5. Status Chip (`StatusChip.jsx`)
- Height: 24px, 6px corner radius, padding `px-2.5 py-0.5`.
- Visual Indicator: 6px circular dot (`w-1.5 h-1.5 rounded-full`) aligned with 6px gap to label.
- Color Pairings:
  - **In progress**: `bg-info-bg text-info-text`
  - **Approved**: `bg-success-bg text-success-text`
  - **Returned for changes**: `bg-warning-bg text-warning-text`
  - **Rejected**: `bg-danger-bg text-danger-text`
  - **Draft**: `bg-neutral-bg text-neutral-text`
  - **Scheduled**: `bg-accent-50 text-accent-700`

### 6. Filter Bar (`FilterBar.jsx`)
- Segmented control style tabs with active indicator (`bg-white shadow-sm text-text font-medium`).
- Tabular count badges inside each tab item showing counts (e.g., `All 14`, `In progress 5`).
- Search input: 40px height, 8px radius, debounced search callback with search icon.

### 7. Form Controls (`base.css` & Page Forms)
- Inputs, selects, and textareas: Minimum 40px height, 16px font size, 8px radius, 1px border (`#E4E4DF`).
- Focus state: `2px solid rgba(31, 78, 140, 0.40)` with 2px offset.
- Spacing: 20px gap between form rows; 6px gap between label and input; 6px gap to helper/error text.

---

## 5. Screen Inventory & Specifications

| Screen | Route | Key Features & Layout |
|---|---|---|
| **Sign In** | `/login` | Centered 400px panel, 48px submit button, show/hide password toggle, collapsed `<details>` demo credentials for development, university postal address footer. |
| **Scholar Dashboard** | `/dashboard` | Stat strip panel with dividers, next RAC meeting reminder panel, recent applications table (5 rows max with whole-row click). |
| **Research Timeline** | `/timeline` | Scholar dossier with academic definition list, RAC review history (distinct dates across 2025–2027), role-gated buttons (scholars do not see guide actions). |
| **Applications Directory** | `/applications` | Filter bar with status segmentation, search filter, responsive table, application detail drilldown. |
| **Application Detail** | `/applications/:id` | Reference header, 2-column fact definition list, review controls, document list, 3-step approval ledger with actors and dates. |
| **Equipment Booking** | `/equipment` | Lab instrument catalog table, availability status chips, loan request modal with date pickers. |
| **Approvals Queue** | `/approvals` | Dedicated reviewer inbox for Guides, Centre Heads, and DRC Convenors with endorsement workflows. |
| **Scholar Signup** | `/signup/scholar` | 5-step structured application stepper with clear progress indicator and validation. |
| **Design System Styleguide**| `/dev/styleguide` | Living reference showing all typography scales, color palettes, status chips, buttons, inputs, and tables. |

---

## 6. Language & Copywriting Rules

### Strictly Prohibited Legalese Terms
- Banned: *"Statutory"*, *"Docket"*, *"Dossier"*, *"Registry Sign-in"*, *"Authorized Credentials"*, *"Petitions"*, *"Parameters"*, *"Endorsed into Registry"*, *"Fast-access identity"*.

### Approved Sentence-Case Terminology
- Use: *"Apply for services"* (instead of *"Statutory Research Services"*).
- Use: *"Research timeline"* (instead of *"Scholar Dossier"*).
- Use: *"Research guide"* (instead of *"Supervising Authority"*).
- Use: *"Sign in to your account"* (instead of *"Official Registry Sign-In"*).
- Use: *"Returned for changes"* (instead of *"Defective / Remediation Required"*).
- Use: *"Waiting on Research Centre Head"* (instead of *"Pending Stage 2 Stat. Endorsement"*).

---

## 7. Quality Assurance & Regression Verification

Automated compliance is validated via Playwright test suites (`ui-spec.spec.js`):
1. **Viewport Verification**: Complete layout and functionality tested at 1440x900 (desktop) and 390x844 (mobile).
2. **Typography & Contrast**: Validated against WCAG 2.1 AA standards; no body text smaller than 13px, form inputs strictly $\ge$ 16px.
3. **No Horizontal Scrolling**: Clean reflow at 390px mobile viewport without accidental horizontal viewport overflow.
4. **Touch & Click Target Sizes**: All interactive controls conform to $\ge$ 40px desktop / $\ge$ 44px mobile touch zones.
