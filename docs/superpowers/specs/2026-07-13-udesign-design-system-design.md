# UDesign Design System: Design Spec

**Date:** 2026-07-13  
**Status:** Approved  
**Version:** v1.0.0 (True Baseline)

This document defines the unified design language for the UDesign brand, merging the high-impact visual brutalism of `udesign-website` with the functional density and precision of the `globalvision` admin interface. It establishes a single source of truth for both developers and AI styling agents.

---

## 1. Core Visual Theme & Philosophy

**"Geometric Brutalism meets Functional Precision."**
*   **Atmosphere:** Clean, confident, and utilitarian. Layouts are flat and structured, using hard outlines (hairlines) instead of smooth drop shadows.
*   **Intentional Contrast:** Massive, bold geometric displays stand in sharp contrast to compact, highly efficient data tables and interface forms. 
*   **Single Accent Focus:** The interface is built on a neutral warm-cream canvas, using deep charcoal for reading, and a single warm metallic Gold accent for primary action states.

## 2. Banned Design Patterns & Gaps
To prevent "generic average" AI designs, the following elements are strictly forbidden in all UDesign code and styles:
1.  **No Cool Slate/Blue Grays:** Do not use Tailwind slate (`#f8fafc`, `#0f172a`, etc.). All neutrals must be warm stone or warm charcoal tones.
2.  **No Backdrop Filter / Glassmorphism:** Layout layers must be flat, solid, and high-performance. Translucency is banned.
3.  **No Uppercase Wide-Tracked Mono Labels:** System labels must be Montserrat, title-cased or sentence-cased. Never wide-tracked uppercase monospace.
4.  **No Text-Gradient Headlines:** All displays and headings must use solid colors or hollow webkit strokes. Gradients inside typography are banned.
5.  **No Em-Dashes:** Do not use `—` for punctuation; use simple hyphens `-` or en-dashes.

---

## 3. Design Tokens (DTCG Specification)

The YAML front matter below represents the canonical configuration for downstream build compilation tools and AI linting parsers:

```yaml
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
```

---

## 4. Design Guidelines (Prose Explanations)

### Colors

*   **Gold (`{colors.primary}` - #c79f6b):** The brand's signature accent. Reserved for primary calls to action, focus states, active menu highlights, and decorative dots.
*   **Gold Dark (`{colors.primary-hover}` - #9e7545):** Explicitly mapped to pass WCAG 3:1 text contrast checks on light cream/white floors. Used as the hover state for text links or buttons.
*   **Cream (`{colors.canvas}` - #F4ECe1):** The primary floor background of B2B pages. It provides a softer, warmer, lower-glare interface compared to stark white.
*   **Card Background (`{colors.surface-card}` - #ffffff):** Pure white panels that float a half-step above the cream canvas.

### Typography

*   **Primary Display (Montserrat):** Used exclusively for headers, titles, metrics, and actions (buttons/badges). Characterized by tight tracking (`-1px` on large text) and heavy weights (800/900) to convey structural impact.
*   **Functional Interface (Geist Sans):** Enforced for body content, form fields, layout copy, and sidebar navigations to ensure high-density readability.
*   **Technical Data (JetBrains Mono):** Reserved for coordinate parameters, SKUs, identifiers, prices, and numbers.
*   **Banned Upper-Case Monospace:** Do not use all-caps tracked-out mono font styles for small badges or system tags. Use small Montserrat semibold instead.

### Spacing & Spacing Scale

*   **Static Grid Scale:** Radii and layout containers use discrete increments based on the 4px scale (`xs: 4px`, `sm: 8px`, `md: 12px`, `base: 16px`, `lg: 24px`).
*   **Fluid Typography:** Massive display headlines (above `h1`) and button elements scale fluidly based on viewport screen size using CSS `clamp()` ratios.

### Elevation & Borders

*   **Flat Hairline Aesthetic:** Cards and panels are separated from the canvas using a solid `1px` `{colors.hairline}` border.
*   **Shadow Exclusions:** Standard layout cards must not feature drop shadows.
*   **Overlay Shadow Exception:** Drop shadows (`--shadow-2` and `--shadow-3`) are strictly reserved for modal overlay elements, popup sheets, and selector dropdowns to visually stack floating elements above the grid.

---

## 5. Functional Layout Patterns (Admin Guidelines)

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
    *   *Warning:* `bg-yellow-100/50 text-yellow-700 border-yellow-200`
    *   *Critical/Alert:* `bg-red-100/50 text-red-700 border-red-200`
    *   *Success:* `bg-emerald-100/50 text-emerald-700 border-emerald-200`

### D. Urgent Alerts / "Rush" States
*   Layout cells flagged as urgent (such as "Rush" orders) get visual overrides:
    *   Card containers receive `border: 2px solid #ef4444` and a subtle red outer glow.
    *   Header nodes append a pulsing red state indicator.
    *   Table rows receive a soft red background tint (`oklch(0.577 0.245 27.325 / 5%)`) and thick top/bottom red borders.
