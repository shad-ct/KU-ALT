# 00 — UI Teardown: Eliminating the "AI-Generated" SaaS Aesthetic

This document audits the legacy UI shown in the screenshots and codebase, specifically identifying every generic "AI tell", the exact file and component responsible, and the replacement strategy under the **University Registry & Official Records Office** visual language.

---

## 1. Inventory of AI Tells in Current Implementation

| # | AI Tell Observed | Component & File | Specific Evidence in Code / Screenshot | Antidote (Official Registry Direction) |
|---|---|---|---|---|
| 1 | **Floating card in a void** | `LoginPage` (`client/src/pages/LoginPage.jsx`) | `<div className="w-full max-w-[420px] bg-surface-card border border-border-default rounded p-8">` centered in `min-h-screen flex items-center justify-center`. Looks like a generic SaaS template login. | Ground the screen with an official University Registry folio layout: crisp ledger masthead, formal seal/emblem rule, left-aligned docket structure, and sharp hairline dividers. |
| 2 | **Icons next to every label & nav item** | `AppShell` (`client/src/components/layout/AppShell.jsx`) | `ROLE_NAV_CONFIG` maps every link to Lucide icons (`LayoutDashboard`, `ClipboardCheck`, `FileText`, `Users`, `GraduationCap`, `Microscope`, `Bell`, `Settings`). Rendered in nav list `<Icon size={16} />`. | Ban icons from navigation labels and section headers. Reserve 16px icons strictly for functional ambiguity reduction (sort, close, search, download). |
| 3 | **Rounded pill highlight on active nav** | `AppShell` (`client/src/components/layout/AppShell.jsx`) | `className="flex items-center ... rounded text-sm bg-accent-subtle text-accent border-l-2 border-accent"`. Generic SaaS pill active state. | Replace with clean rectangular ledger item: left ink rule, no rounded corners, authentic typography weight shift. |
| 4 | **Row of equal stat-tile cards with filler copy** | `DashboardPage` (`client/src/pages/DashboardPage.jsx`) | `<div className="bg-surface-card border border-border-default rounded grid grid-cols-2 lg:grid-cols-4...">` with 4 identical cards and generic "Updated in real-time" subtitle. | Abolish stat tiles entirely. Replace with a single ruled ledger tally line: `"14 awaiting you · 3 overdue · 92 scholars"`. |
| 5 | **Every section boxed into identical rounded cards** | `DashboardPage`, `ApplicationDetail`, `ApplicationsPage` | Every section wrapped in `bg-surface-card border border-border-default rounded p-4/p-6` with equal padding and soft corners. | Separate sections with hairline rules and typographic hierarchy, not standalone floating cards. White only for working tables and forms; warm paper off-white page background. |
| 6 | **Circle dots & pill-shaped status badges** | `StatusChip` (`client/src/components/ui/StatusChip.jsx`) | `<span className="w-2 h-2 rounded-full flex-shrink-0 ${dotColor}" />`. Common generic badge pattern. | Use crisp text paired with a 6px square marker (`rounded-[1px]`), accompanied by exact official role titles ("Waiting on Research Centre Head"). |
| 7 | **Centred layout & huge barren whitespace** | `NotFoundPage` (`client/src/pages/NotFoundPage.jsx`), `DashboardPage` | Content centered in a giant empty void (`text-center`, `max-w-md mx-auto`) with little information density. | High information density: left-aligned, asymmetric, compact 40px table rows, ruled definition lists, official reference numbers in monospace. |
| 8 | **Unchecked formatting bugs ("Invalid Date")** | `DashboardPage` (`client/src/pages/DashboardPage.jsx`) | `{new Date(app.updated_at || app.created_at).toLocaleDateString()}` prints "Invalid Date" in screenshot when timestamps are null or missing. | Bulletproof date formatting helper with fallback em-dash (`—`) and standardized Indian gazette format (`12 Nov 2026`). |
| 9 | **Generic blue & soft radius** | `tokens.css`, `tailwind.config.js` | Generic blues, 4px-8px radius, standard SaaS palette. | Strict maximum 2px radius, hairline 1px rules, deep ink-navy institutional colour (`#182B42`), muted vermilion signal (`#A8332A`), warm paper background (`#F7F6F2`). |
| 10 | **Absence of authentic institutional authority** | Global components | Missing docket stamps, ledger timelines, small-caps headers, and official reference typography. | Introduce 3 distinct official details: ruled horizontal approval ledger, ink stamp-like status text (`APPROVED 12 Nov 2026`), and small-caps university masthead top rule. |

---

## 2. Mandatory Rules for the Redesign

1. **Surfaces**: Page is warm paper off-white (`#F7F6F2`); working surfaces (tables, forms) are pure white (`#FFFFFF`). No floating rounded cards.
2. **Typography**: `Source Serif 4` for page titles and major section headings; `Source Sans 3` for UI and body text; uppercase tracked small-caps for table headers and field labels; tabular numerals everywhere.
3. **Shape**: Max 2px corner radius (`rounded-[2px]`). 1px hairline rules. Zero drop shadows except dropdowns and modal dialogs.
4. **Colour**: Deep ink-navy (`#182B42`) as the single institutional accent; muted vermilion (`#A8332A`) as the single signal colour for urgent attention; ink (`#1A1A18`) for text; warm bone/ivory neutrals.
5. **Layout**: Asymmetric, left-aligned, information-dense. 40px table rows with sticky headers; two-column definition lists for records; horizontal ledger for approval chains.

