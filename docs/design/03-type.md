# D3 — Typography System Specification

## 1. Type Families & Philosophy
- **Primary Body / UI Font:** `Source Sans 3` (Humanist sans-serif)
  - Characteristics: Exceptional clarity in dense tables, open counters, distinguished letterforms (I, l, 1), and clean numeric rendering.
  - Fallback: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
  - Loading: Self-hosted WOFF2, `font-display: swap`.
- **Institutional Page Title Font:** `Source Serif 4`
  - Characteristics: Authoritative, formal academic serif. Used **strictly** for top-level page headers (`h1`) and official document headers.
  - Fallback: `Georgia, "Times New Roman", Times, serif`
  - Weight: 600 only.
- **Monospace / Code / Reference IDs:**
  - Font: `ui-monospace, "SF Mono", "Cascadia Code", Consolas, Menlo, monospace`
  - Used for: Registration numbers, application tracking numbers (`KU-RD-2026-0042`), file hashes, dates.

---

## 2. Type Weights & Hard Caps
To maintain institutional restraint, font weights are strictly capped:
- `400` (Regular): All standard body text, table cell values, descriptive descriptions.
- `500` (Medium): Form field labels, table column headers, status text, tab labels, primary navigation links.
- `600` (Semibold): Section headings (`h2`, `h3`), page titles (`h1`), modal headers, emphasis in timelines.
- ❌ **Hard Ban:** No weights `>= 700` (Bold / Black / Heavy) anywhere in the application.

---

## 3. Typographic Scale

| Level | Size (px) | Rem | Line Height | Tracking | Weight | Recommended Element / Context |
|---|---|---|---|---|---|---|
| **Display / Page Title** | `30px` | `1.875rem` | `1.25` (`38px`) | `-0.015em` | `600` (Serif) | `h1` Top-level page title in `PageHeader` |
| **Section Title**        | `24px` | `1.500rem` | `1.25` (`30px`) | `-0.01em`  | `600` (Sans)  | `h2` Major section headings, modal dialog titles |
| **Subsection Header**    | `20px` | `1.250rem` | `1.30` (`26px`) | `-0.005em` | `600` (Sans)  | `h3` Subsection titles, card group titles |
| **Body Large / Forms**   | `16px` | `1.000rem` | `1.45` (`24px`) | `0`        | `400` / `500`| Form inputs, form labels, prominent introductory text |
| **Body Default / Tables**| `14px` | `0.875rem` | `1.45` (`20px`) | `0`        | `400` / `500`| Standard body copy, table cell content, nav links |
| **Meta / Secondary**     | `13px` | `0.8125rem`| `1.40` (`18px`) | `+0.005em` | `400` / `500`| Table column headers, helper text, breadcrumbs |
| **Caption / Badge**      | `12px` | `0.750rem` | `1.35` (`16px`) | `+0.01em`  | `500`        | Status chip text, input counter, timeline timestamps |

---

## 4. Institutional Formatting Rules
1. **Tabular Numerals (`tabular-nums`):**
   - All tables, counters, currency/fee indicators, serial numbers, and dashboard KPI summary strips MUST use `font-variant-numeric: tabular-nums` to ensure exact column alignment.
2. **Prose Line Length:**
   - Long-form prose (remarks, guidelines, help text) must have a maximum width of `70ch` to prevent eye tracking fatigue.
3. **Casing & Punctuation:**
   - Strict **Sentence case** across all UI surfaces: "Add new scholar", "Download certificate", "Research centre details" (Never Title Case or UPPERCASE).
   - Zero exclamation marks.
   - Verbs on all actionable buttons: "Approve application", "Return to scholar", "Allocate equipment".

