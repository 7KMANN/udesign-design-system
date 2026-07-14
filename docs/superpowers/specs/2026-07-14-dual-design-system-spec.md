# Dual Design System Specification: Impactful Show-Off vs. Brutalist Functional

**Date:** 2026-07-14  
**Author:** Antigravity & Kaleb  
**Status:** Approved  
**Repository:** `udesign-design-system` (`github:7KMANN/udesign-design-system`)

---

## 1. Overview & Objectives

The `udesign-design-system` serves as the single source of truth for UDesign's brand identity. Historically, the package enforced a single set of visual properties across all consuming repositories: warm cream canvas floors (`#f4ece1`), Montserrat display headers, curved `10px/16px` radii, and soft `--shadow-2` overlays. 

While ideal for public marketing presentations (`udesign-website`, `udesignpages`), this profile creates friction inside high-density operational applications (`globalvision`), where factory operators, DTF/embroidery schedulers, and accounting managers require high contrast, compact wireframe grids, technical typography (`Geist`), and geometric brutalist clarity ("fewer steps to achieve the goal instead of fewer tools").

This specification formalizes a **Dual Design Architecture**:
1. **Impactful Show-Off (`[data-design="brand"]`)**: The canonical UDesign luxury/marketing presentation profile.
2. **Brutalist Functional (`[data-design="functional"]`)**: A high-tension, geometric brutalist wireframe profile optimized for operational ERPs (`GlobalVision`), retaining UDesign's signature warm stone neutrals and high-voltage Gold (`#c79f6b`) brand accent.

---

## 2. Token Layer Architecture

### 2.1 Source Files
We will split and structure our DTCG token definitions under `tokens/`:
- **`tokens/udesign.tokens.json`** — The baseline (Brand / Show-Off) DTCG token tree.
- **`tokens/functional.tokens.json`** — The Functional / Brutalist override DTCG tree.

### 2.2 Functional Profile Token Mapping (Option 1 Wire Geometry)
When `[data-design="functional"]` is active, the following overrides take precedence over the base roles:

| Category | Token Variable | Brand Profile Value (`brand`) | Functional Profile Value (`functional`) | Rationale |
|---|---|---|---|---|
| **Canvas** | `--background` | `var(--ud-cream)` (`#f4ece1`) | `var(--ud-panel)` (`#f4f1ea`) | Crisp, stable warm stone floor for dense data grids |
| **Surface** | `--card` | `var(--ud-white)` (`#ffffff`) | `var(--ud-white)` (`#ffffff`) | Pure white floated panels inside hairline boxes |
| **Primary** | `--primary` | `var(--ud-accent)` (`#c79f6b`) | `var(--ud-accent)` (`#c79f6b`) | UDesign Gold remains the sole brand action indicator |
| **Borders** | `--border-color` | `var(--ud-border)` (`#e4ded0`) | `var(--ud-border-strong)` (`#d6cdb9`) | Sharper, higher-tension hairline separation |
| **Radius** | `--radius-sm`<br>`--radius`<br>`--radius-lg` | `7px`<br>`10px`<br>`16px` | `2px`<br>`3px`<br>`4px` | Geometric brutalist wire corners (`Option 1`) |
| **Type** | `--font-display`<br>`--font-body` | `'Montserrat'`<br>`'Montserrat'` | `'Geist'`<br>`'Geist'` | Eliminates wide horizontal tracking for compact ERP data cells while `.ud-lock` and `.ud-display` retain Montserrat |
| **Shadows** | `--shadow-1`<br>`--shadow-2`<br>`--shadow-3` | `rgba(27,27,27,0.05)...`<br>`rgba(27,27,27,0.28)...` | `none`<br>`none`<br>`none` | Enforces pure 1px flat wireframe borders without soft shadows |

---

## 3. Build & Compilation Pipeline (`scripts/build.mjs`)

`scripts/build.mjs` will be upgraded to process both token files and output two clean deliverables in `dist/`:
1. **`dist/tokens.css`**: Contains `:root` and `:root[data-design="brand"]` with base tokens, AND appends `:root[data-design="functional"], .design-functional` containing the functional token overrides. Consuming apps that `@import "udesign-design-system/dist/tokens.css";` immediately gain access to runtime mode-switching via `<html data-design="functional">`.
2. **`dist/tokens-functional.css`**: A standalone compiled stylesheet defining `:root` directly with the functional overrides, allowing dedicated operational apps (`GlobalVision`) to opt-in at the root CSS layer without requiring HTML attributes.

---

## 4. DESIGN.md & Linter Updates (`scripts/lint-design.mjs`)

### 4.1 DESIGN.md Specification
`DESIGN.md` will be updated to:
- Document the two official modes under `## Brand Layout Styles: Impactful vs. Functional`.
- Maintain the strict ban on cold slate hexes (`#0f172a`, `#e2e8f0`, etc.), glassmorphism, and em-dashes across both profiles.
- Define `button-primary`, `button-secondary`, `status-badge`, and table grid rules for both profiles.

### 4.2 Linter Rigor (`scripts/lint-design.mjs`)
The automated linter will scan `tokens/udesign.tokens.json` AND `tokens/functional.tokens.json`, ensuring neither file violates brand constraints (no slate hexes, valid DTCG formatting, exact primary gold match `#c79f6b`).

---

## 5. React Showcase Integration (`showcase/`)

To verify and demonstrate both styles side-by-side:
- **`showcase/src/App.tsx`**: Add a toggle in the topbar: `[ ✦ Brand Show-Off ]` vs `[ ⚡ Brutalist Functional ]`.
- Toggling shifts `document.documentElement.setAttribute('data-design', mode)` live.
- Both the `KitchenSink.tsx` and `Dashboard.tsx` pages will dynamically demonstrate the transition from soft Montserrat curves to sharp Geist hairline boxes.

---

## 6. Verification & Release Process

Before cutting the release, all verification gates must pass:
1. `npm run build` — Compiles both `dist/tokens.css` and `dist/tokens-functional.css`.
2. `node scripts/lint-design.mjs` — Validates 0 errors against brand guidelines.
3. `npm run build-showcase` — Verifies showcase TypeScript and Tailwind v4 compatibility.
4. `npm run release -- minor "feat(tokens): add dual styling with geometric brutalist functional profile"` — Bumps version to next minor release and updates history/changelog.
