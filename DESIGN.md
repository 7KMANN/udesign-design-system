---
version: alpha
name: UDesign
description: A high-contrast, functionally dense interface where clean geometric 
  Montserrat display headers meet Geist Sans data grids. Elements float on a 
  warm cream canvas separated by hairline borders, with all primary brand actions 
  focusing on a warm, metallic Gold accent.

colors:
  primary: "#c79f6b"            # The UDesign Gold accent
  primary-hover: "#9e7545"      # WCAG-safe dark gold accent (3:1 contrast on cream)
  ink: "#1b1b1b"                # Deep charcoal for text and primary elements
  body: "#1b1b1b"               # Standard body text
  muted: "#8a8172"              # Warm stone neutral for secondary details
  canvas: "#F4ECe1"             # Warm cream page canvas floor
  surface-card: "#ffffff"       # Pure white for floated cards
  hairline: "#e4ded0"           # 1px border separator
  destructive: "#b23a2f"        # Crimson red for warnings/errors
  on-primary: "#1b1b1b"         # Dark text on top of gold accent

typography:
  display-lg:
    fontFamily: "Montserrat, sans-serif"
    fontSize: 48px
    fontWeight: 900
    lineHeight: 1.05
    letterSpacing: -1px
  body-md:
    fontFamily: "Geist Sans, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.55
    letterSpacing: 0px
  data-mono:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0px
  button:
    fontFamily: "Montserrat, sans-serif"
    fontSize: 14.5px
    fontWeight: 600
    lineHeight: 1
    letterSpacing: 0px

rounded:
  none: 0px
  sm: 6px
  md: 10px
  lg: 16px
  full: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 12px
  base: 16px
  lg: 24px
  xl: 32px
  section: 64px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "11px 20px"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "11px 20px"
    border: "1px solid {colors.hairline}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    border: "1.5px solid {colors.ink}"
    padding: "11px 20px"
  header-lockup:
    fontFamily: "Montserrat, sans-serif"
    fontWeight: 900
    textColor: "{colors.ink}"
  status-badge:
    fontFamily: "Montserrat, sans-serif"
    fontWeight: 600
    fontSize: "11.5px"
    rounded: "{rounded.full}"
    padding: "5px 11px"
  confidential-footer:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.muted}"
    borderTop: "1px solid {colors.hairline}"
    padding: "28px 24px"
  card:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.md}"
    border: "1px solid {colors.hairline}"
    padding: "20px"
---

## Overview

uDesign's interface guidelines bridge the gap between B2B dashboard functionality and high-impact visual design. The brand is built on a design philosophy of **"Geometric Brutalism meets Functional Precision."**

Every page displays a calm, warm-toned canvas of cream `{colors.canvas}`, providing a soft visual environment. Elements stack in flat cards without standard drop shadows, separating themselves from the page via custom `1px` `{colors.hairline}` borders. Hierarchy is set through tight, bold geometric Montserrat titles and dense Geist Sans data layouts, accented by a single high-voltage Gold `{colors.primary}` brand tone.

**Key Characteristics:**
- **Single Brand Accent:** Gold `{colors.primary}` (#c79f6b) is the sole brand highlight. It carries primary buttons, hover/focus rings, and brand logos.
- **Bold/Fine Typographic Contrast:** Geometric headers use heavy weights (Montserrat Black 900) and tight tracking, while data cells and form fields rely on functional interface types (Geist Sans/JetBrains Mono).
- **Hairline Border Separators:** Components separate using thin lines (`1px {colors.hairline}`), bypassing standard soft shadow elevations.
- **Contrasting Background Tints:** Low-contrast status badges use transparent backdrops to prevent visual noise.

## Brand Layout Styles: Impactful vs. Functional

uDesign enforces a **Dual Design Architecture** compiled into `dist/tokens.css` and `dist/tokens-functional.css`, supporting two runtime profiles:

*   **Impactful Layout Style (`[data-design="brand"]` or Default)**:
    *   Designed for public-facing websites and luxury marketing presentations (`udesign-website`).
    *   Characterized by massive geometric titles (`Montserrat Black`), spacious gaps (`64px` section margins), curved radii (`10px/16px`), and soft `--shadow-2` overlays on a warm cream canvas floor (`#f4ece1`).
*   **Functional Layout Style (`[data-design="functional"]` - Geometric Brutalist Wire)**:
    *   Designed for high-density, transaction-heavy internal ERPs and operational command systems (`GlobalVision`).
    *   **Tense & Simplistic Philosophy**: Employs fewer steps to achieve operational goals instead of fewer tools (`Option 1 Geometric Wire`).
    *   **Geometric Wireframe Overrides**: Cards and tables sit inside sharp `1px` hairline boxes (`#d6cdb9`) with tight radii (`2px/3px/4px`) and zero drop-shadows (`none`).
    *   **Technical Typography**: Maps `--font-display` and `--font-body` to `Geist Sans` to eliminate wide tracking across dense table cells and controls, while `.ud-lock` and `.ud-display` retain `Montserrat Black` for punchy brand headers.
    *   **Stable Floor**: Shifts the canvas floor to a crisp, high-contrast warm stone panel (`#f4f1ea`) while keeping pure white cards (`#ffffff`) and our iconic **Gold (`#c79f6b`)** primary accent intact.

## Colors

### Brand & Accent
- **Gold** (`{colors.primary}` - #c79f6b): The brand accent. Used for primary CTAs, active indicators, and highlight points.
- **Gold Dark** (`{colors.primary-hover}` - #9e7545): The dark shade used for WCAG-safe link tags and hover states on cream/white canvases.

### Surface
- **Canvas** (`{colors.canvas}` - #F4ECe1): The default page floor. A warm cream color rather than white, which reduces user eye fatigue during long sessions.
- **Surface Card** (`{colors.surface-card}` - #ffffff): Pure white panels that house widgets, bento layouts, and tables, floating above the cream floor.

### Hairlines
- **Hairline Border** (`{colors.hairline}` - #e4ded0): The default border separator for panels, table cells, and buttons. Enforces flat layouts.

### Text
- **Ink** (`{colors.ink}` - #1b1b1b): Deep charcoal rather than pure black. Enforced for display titles, default page text, and outlines.
- **Muted** (`{colors.muted}` - #8a8172): Warm stone color used for description tags, dates, and non-action labels.

### Semantic
- **Destructive** (`{colors.destructive}` - #b23a2f): Deep red color indicating warnings, invalid form fields, or dangerous actions.

---

## Typography

### Hierarchy Scale

| Title | Font | Size | Weight | Line Height | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **display-lg** | Montserrat | 48px | 900 | 1.05 | -1px | Huge hero displays & titles |
| **body-md** | Geist Sans | 14px | 500 | 1.55 | 0px | Paragraphs, tables, sidebars |
| **data-mono** | JetBrains Mono | 12px | 400 | 1.4 | 0px | SKU codes, coordinates, numbers |
| **button** | Montserrat | 14.5px | 600 | 1.0 | 0px | Button triggers & badges |

### Principles
Montserrat is used exclusively for headers, titles, metrics, and actions to convey a heavy, bold look. Geist Sans handles body text, menus, and labels to keep them readable at high densities. JetBrains Mono is strictly used for database parameters and raw numbers.
Labels must stay in title-case or sentence-case. Do not convert secondary labels into wide-tracked, uppercase monospace text.

---

## Layout

The spacing scale utilizes discrete 4px increments to structure layouts:
- **xs (4px) / sm (8px):** Padding inside buttons, items inside grid lists.
- **md (12px) / base (16px):** Padding inside default cards, margins between sections.
- **lg (24px) / xl (32px):** Padding inside sections, bento gap columns.
- **section (64px):** Major vertical spacing between distinct blocks.

Display text and primary button elements use fluid scaling (`clamp()`) to resize dynamically across screen bounds, while general margins, radii, and grids use fixed tokens.

---

## Elevation

UDesign features a flat design system that relies on borders rather than shadows.
- **Zero-Shadow Rule:** Content cards, sidebars, and panels are flat, separated from the canvas using a solid `1px` `{colors.hairline}` border.
- **Overlay Exceptions:** Drop shadows (`--shadow-2` and `--shadow-3`) are strictly reserved for modal overlay elements, popover menus, and selector dropdowns that need to float above the canvas.

---

## Components

**`button-primary`** - The primary CTA button. Uses background `{colors.primary}`, text `{colors.on-primary}`, font `{typography.button}`, and rounded `{rounded.md}`. Press state shifts background to `{colors.primary-hover}`.

**`button-secondary`** - Used for standard secondary actions. Uses background `{colors.canvas}`, border `1px solid {colors.hairline}`, text `{colors.ink}`, font `{typography.button}`, and rounded `{rounded.md}`. Hover state shifts background to a slightly darker neutral tint.

**`button-outline`** - Used for optional tech readouts. Uses background `transparent`, border `1.5px solid {colors.ink}`, text `{colors.ink}`, font `{typography.button}`, and rounded `{rounded.md}`. Hover fills background with `{colors.ink}` and flips text color to white.

**`header-lockup`** - Mapped to `.ud-lock`. Montserrat font, weight 900. Spells out "UDesign" with a lead geometric box containing the letter "U" styled in `{colors.ink}` background and `{colors.primary}` text.

**`status-badge`** - Small state indicator badge. Montserrat font, weight 600, size 11.5px, rounded `{rounded.full}` (pill shape). Background utilizes low-opacity tints (see State Badges below).

**`confidential-footer`** - Mapped to `.ud-footer`. Page-width footer with background `{colors.canvas}`, text `{colors.muted}`, border top `1px solid {colors.hairline}`. Displays uppercase crimson red `{colors.destructive}` confidentiality labels.

**`card`** - Standard card container. Uses background `{colors.surface-card}`, rounded `{rounded.md}`, padding 20px, and a `1px` `{colors.hairline}` border.

---

## Functional Layout Patterns

### A. Compact Data Tables
*   **Grid Structure:** Table grids use compact padding (`py-1.5 px-2`) to maximize information density.
*   **Sticky headers:** Table heads stick (`sticky top-0`) and separate using a subtle bottom border.
*   **Highlight marks:** Search results highlight matches using `<mark className="bg-yellow-200/80 dark:bg-yellow-700/60 rounded-[2px] px-0">` with normalized (accents-stripped) strings.
*   **Scrollbars:** Custom webkit scrollbar overlay: thumb transitions from a muted 20% opacity (`oklch(0.553 0.013 58.071 / 20%)`) to 40% on hover.

### B. Bento Detail Panel
*   **Grid Allocation:** Complex detail pages employ a 12-column bento system:
    *   Left main layout spans 8 columns (`col-span-8`), housing high-density description fields.
    *   Right layout spans 4 columns (`col-span-4`), housing key metadata parameters.
*   **Separators:** Internal sections divide cleanly using hairline rules.

### C. Low-Opacity State Badges
*   To avoid visual noise, alert levels and status badges use transparent background tints matching the text color role:
    *   *Warning / Queued:* `bg-yellow-100/50 text-yellow-700 border-yellow-200`
    *   *Critical / Alert:* `bg-red-100/50 text-red-700 border-red-200`
    *   *Success / Online / Sent:* `bg-emerald-100/50 text-emerald-700 border-emerald-200`
    *   *Updating / Working:* `bg-sky-100/50 text-sky-700 border-sky-200`
    *   *Canceled / Inactive:* `bg-slate-100/50 text-slate-700 border-slate-200`

### D. Urgent Alerts / "Rush" States
*   Layout cells flagged as urgent (such as "Rush" orders) get visual overrides:
    *   Card containers receive `border: 2px solid #ef4444` and a subtle red outer glow.
    *   Header nodes append a pulsing red state indicator.
    *   Table rows receive a soft red background tint (`oklch(0.577 0.245 27.325 / 5%)`) and thick top/bottom red borders.

### E. Standardized Entity Color Mappings
To maintain consistency in relational maps and dashboards, core business entities are color-coded:
*   **Organizations**: Purple/Violet (`text-purple-600` or `bg-purple-100/50` / `text-purple-700`) representing company/client groups.
*   **Contacts**: Blue (`text-blue-600` or `bg-blue-100/50` / `text-blue-700`) representing people.
*   **Leads**: Emerald/Green (`text-emerald-600` or `bg-emerald-100/50` / `text-emerald-700`) representing sales prospects.

### F. Dark Console / Log Cards
*   Logs, raw output displays, and JSON previews use a dark console theme to distinguish terminal operations from standard app content:
    *   Background container uses a flat dark theme (`bg-zinc-950`).
    *   Text uses monospace font (JetBrains Mono) and status-based line colors (red for errors, amber for warnings, emerald for success).

### G. Action Button Standards
*   Buttons should strictly use standard UI library variants to prevent visual clutter:
    *   *Primary Actions*: default variant (gold background `{colors.primary}`, dark text).
    *   *Secondary Actions*: secondary or outline variant (gray/neutral border).
    *   *Destructive Actions*: red/destructive variant (crimson background).
    *   Avoid using custom-colored action buttons (like emerald for message sends or blue for standard syncs).

---

## Responsive Behavior

| Name | Width | Key Changes |
|---|---|---|
| Mobile | < 768px | Hamburger mobile toolbar; display headings shrink; layout containers stack 1-up. |
| Tablet | 768px - 1024px | Dynamic card layouts 2-up; sidebar switches to collapsible overlay mode. |
| Desktop | > 1024px | Fixed left sidebar visible; multi-column layout grid. |

### Touch Targets
- Actionable buttons must maintain height bounds of `≥ 44px` on mobile displays.
- Input elements default to `md:text-sm text-base` (16px text height on mobile to disable native Safari automatic zoom shifts).

---

## Known Gaps

- **Dark Mode:** Standard design specs cover light theme details only. Dark theme variables exist in the token JSON but layouts are not documented.
- **Animation curves:** Micro-interactions (hover ease-in curves) are out of scope for this revision.
