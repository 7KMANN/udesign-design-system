# UDesign Interactive Showcase & Agent Rules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a high-fidelity interactive preview system in the UDesign showcase and configure strict IDE agent rules to guarantee DESIGN.md is applied correctly every time.

**Architecture:** 
1. Expand `showcase/index.html` with a viewport container that hosts different preview modes: Kitchen Sink, B2B Login, Admin Dashboard, and Analytics views. 
2. Create `.cursorrules` and `.gemini/rules` configuration files at the root of the project containing strict instruction pipelines for AI coding agents.

**Tech Stack:** Plain HTML5, Vanilla CSS custom properties, SVG graphics, zero-dependency ES6 Javascript.

## Global Constraints

*   No cool slate grays (only warm stone neutrals and UDesign Gold).
*   No glassmorphism or backdrop-filters.
*   No uppercase wide-tracked mono labels.
*   No text-gradient headlines (Montserrat Black 900 or outlines only).
*   No em-dashes (`—`).
*   Showcase must work fully via `file://` (no server build or dev steps required to view).

---

### Task 1: Re-skin and Expand the Showcase Previewer

**Files:**
- Modify: `showcase/index.html`

**Interfaces:**
- Swaps style configurations by updating the href attribute of the stylesheet `<link id="tokens-link">`.

- [ ] **Step 1: Update main layout shell of `showcase/index.html`**
  Modify the top header styling to include view mode selectors (Desktop / Tablet / Mobile), page selectors (Kitchen Sink / Login Canvas / Admin Dashboard / Analytics), and the version selector. Add viewport classes to simulate screen limits.

- [ ] **Step 2: Add CSS Viewport Resizing Styles**
  Add styles inside the showcase header to allow scaling the preview canvas:
  ```css
  #preview-viewport { transition: width 0.3s ease; margin: 0 auto; border: 1px solid var(--border-color); background: var(--background); }
  #preview-viewport.desktop { width: 100%; max-width: 1200px; }
  #preview-viewport.tablet { width: 768px; }
  #preview-viewport.mobile { width: 375px; }
  ```

- [ ] **Step 3: Implement Login Canvas View**
  Add a container `<div id="view-login" class="preview-page" style="display:none">` housing:
  *   Centered geometric card with a Montserrat display header.
  *   B2B login form with Geist Sans text inputs and outline labels.
  *   Gold primary CTA button (`.ud-btn-primary`).

- [ ] **Step 4: Implement Admin Dashboard View**
  Add a container `<div id="view-dashboard" class="preview-page" style="display:none">` housing:
  *   Left sidebar dashboard navigation using warm stone borders.
  *   Bento metric grid (3 columns: Total Leads, Revenue, Conversion) using flat white cards with hairline borders.
  *   Compact high-density table structure (`py-1.5 px-2` paddings) displaying data records (SKUs in JetBrains Mono).
  *   One critical highlighted row containing class `.rush-row` (red background tint and solid red borders).

- [ ] **Step 5: Implement Analytics & Charts View**
  Add a container `<div id="view-analytics" class="preview-page" style="display:none">` housing:
  *   SVG line chart and bar chart graphics colored dynamically using CSS variables: `stroke="var(--primary)"` and `fill="var(--ud-success-bg)"`.

- [ ] **Step 6: Update JavaScript View Router**
  Update the script block at the bottom of `showcase/index.html` to toggle active view divs based on dropdown page selections, and apply simulated viewport class toggles.

- [ ] **Step 7: Run verification check**
  Open the showcase in a browser and verify that swapping views and swapping versions dynamically re-skins all UI elements cleanly.

---

### Task 2: Configure Workspace Rules for AI Coding Agents

**Files:**
- Create: `.cursorrules`
- Create: `.gemini/rules`

- [ ] **Step 1: Create the `.cursorrules` file at the repository root**
  Write the cursor rules block instructing AI models to check `DESIGN.md` and enforce the banned styles:
  ```markdown
  # UDesign Agent Rules (Cursor)
  
  You must adhere to the design system rules defined in `DESIGN.md` at all times:
  
  ## General Styling Rules
  - Never hardcode color hex codes. Always use CSS variables mapped to the semantic tokens (e.g. `var(--primary)`, `var(--background)`).
  - Never introduce cool slate colors (#f8fafc, #0f172a, etc.). Use warm stone neutrals only.
  - Never use backdrop-filter or glassmorphism. Layouts must stay flat and solid.
  - No text-gradient-clip headlines. Use solid colors or hollow webkit strokes.
  
  ## Typography Rules
  - Display headers must use Montserrat (heavy weights, tight tracking).
  - Normal UI text & forms must use Geist Sans.
  - Technical parameters, SKUs, and coordinates must use JetBrains Mono.
  - Labels must be title-cased sans-serif. No wide-tracked uppercase mono labels.
  
  ## Verification Pipeline
  - Before claiming any styling or design system task is complete, you MUST run:
    `node scripts/lint-design.mjs`
  - Ensure the command passes with 0 errors.
  ```

- [ ] **Step 2: Create the `.gemini/rules` file at the repository root**
  Write the equivalent Gemini workspace instructions mirroring the same validation pipeline.

- [ ] **Step 3: Commit all files to the repository**
  Add all new and modified files to git staging and commit.
  ```bash
  git add showcase/index.html .cursorrules .gemini/rules
  git commit -m "feat: add interactive showcase previews and workspace rules for AI agents"
  ```
