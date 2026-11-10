# D2 — Colour Palette Specification

## 1. Design Direction & Palette Principles
- **Atmosphere:** Restrained, academic, authoritative. Light mode only for v1.
- **Surface Neutrals:** Warm neutral tones (not cool blue-greys), mimicking clean archival paper and academic stationery.
- **Single Accent:** Deep Academic Blue (`#1F3A5F`) serves as the singular brand identifier, reserved exclusively for primary actions, active navigational states, and authoritative links.
- **Zero Decorative Color:** Color is never used for decorative cards, colored icon badges, or multi-colored section headers.

---

## 2. Core Palette Matrix

### 2.1 Surfaces & Neutrals
| Token Name | Hex Value | Purpose & Usage | Contrast Ratio (vs #1C1C1A) |
|---|---|---|---|
| `--color-surface-bg` | `#FAFAF8` | Page viewport background (warm off-white) | 16.2:1 (Pass AAA) |
| `--color-surface-card` | `#FFFFFF` | Primary content panels, tables, dialog surfaces | 17.5:1 (Pass AAA) |
| `--color-surface-subtle`| `#F3F3EF` | Table header background, hover row background | 15.0:1 (Pass AAA) |
| `--color-border-subtle` | `#EBEAE5` | Table row dividers, hairline separators | N/A (Non-text) |
| `--color-border-default`| `#DCDAD4` | Card outlines, form input borders (1px flat) | 3.5:1 (UI components AA) |
| `--color-border-strong` | `#BCBAB2` | Focused borders, active tabs, prominent dividers | 5.2:1 (Pass AA) |

### 2.2 Text & Typography
| Token Name | Hex Value | Purpose & Usage | Contrast Ratio (vs #FFFFFF) |
|---|---|---|---|
| `--color-text-primary` | `#1C1C1A` | Headings, body text, primary table cells | 17.5:1 (Pass AAA) |
| `--color-text-secondary`| `#5E5D58` | Subtitles, table headers, helper labels, meta info | 5.8:1 (Pass AA) |
| `--color-text-tertiary` | `#8C8A82` | Disabled text, placeholder text | 3.1:1 (Non-essential/placeholder) |
| `--color-text-inverse`  | `#FFFFFF` | Text on primary accent buttons | 10.5:1 vs #1F3A5F (Pass AAA) |

### 2.3 Brand Accent (Single Accent Hierarchy)
| Token Name | Hex Value | Role / Interaction State |
|---|---|---|
| `--color-accent-subtle`  | `#EEF2F6` | Subtle tint for active menu indicators (tint: ~10%) |
| `--color-accent-border`  | `#9FB3C8` | Border for active selection states |
| `--color-accent-default` | `#1F3A5F` | Primary buttons, active nav indicators, text links |
| `--color-accent-hover`   | `#162B47` | Hover state for primary buttons |
| `--color-accent-active`  | `#101F33` | Pressed/active state for primary actions |

---

## 3. Semantic & Status Tints (Muted)
Semantic colors are strictly muted. They are never rendered as loud saturated blocks. Each status consists of:
1. Solid status dot (`8px`)
2. Text label (`13px / 14px`)
3. Optional 12% background tint + border for chip badges.

| Semantic Tone | Base / Text Hex | 12% Background Tint | Border Step Hex | Usage / Association |
|---|---|---|---|---|
| **Success (Green)** | `#1B5E20` | `#EDF7ED` | `#C8E6C9` | Approved, Completed, Verified, Allocated |
| **Warning (Amber)** | `#8A5300` | `#FFF8E1` | `#FFE082` | Returned for changes, Pending verification, Due soon |
| **Danger (Red)**    | `#B71C1C` | `#FFEBEE` | `#FFCDD2` | Rejected, Overdue, Cancelled, Revoked |
| **Info / Progress** | `#1F3A5F` | `#EEF2F6` | `#C5D5E4` | In progress, Waiting on approver, Submitted |
| **Neutral (Grey)**  | `#5E5D58` | `#F3F3EF` | `#DCDAD4` | Draft, Inactive, Superseded |

---

## 4. StatusChip Exact Mapping
Single source of truth for UI status representations across all modules:

```
[• Draft]                           -> Grey dot (#5E5D58)     + Text "Draft"
[• In progress · Waiting on Guide]  -> Accent blue (#1F3A5F)   + Text "In progress · Waiting on Guide"
[• In progress · Waiting on Centre Head] -> Accent blue (#1F3A5F) + Text "In progress · Waiting on Centre Head"
[• In progress · Waiting on DRC]    -> Accent blue (#1F3A5F)   + Text "In progress · Waiting on DRC Convenor"
[• Returned for changes]            -> Amber dot (#8A5300)    + Text "Returned for changes"
[• Approved]                        -> Green dot (#1B5E20)    + Text "Approved"
[• Rejected]                        -> Red dot (#B71C1C)      + Text "Rejected"
[• Cancelled]                       -> Grey dot (#8C8A82)     + Text "Cancelled"
[• Equipment: Available (3 of 5)]   -> Green dot (#1B5E20)    + Text "3 of 5 available"
[• Equipment: Overdue (4 days)]     -> Red dot (#B71C1C)      + Text "Overdue (4 days)"
```

---

## 5. Chart Palette (Institutional Restraint)
For the minimal chart visualizations (max 2 charts on Admin/DRC):
- Series 1: Primary Accent `#1F3A5F`
- Series 2: Secondary Slate Neutral `#5E5D58`
- Series 3: Light Neutral `#BCBAB2`
- Series 4: Muted Amber `#8A5300`
(Zero rainbow gradients, zero saturated neons).

