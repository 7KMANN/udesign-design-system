# Dual Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Dual Design Architecture (`Impactful Show-Off` vs `Brutalist Functional - Geometric Wire`) in `udesign-design-system`, including functional token overrides, build pipeline enhancements, linter updates, interactive showcase toggle, and official release.

**Architecture:** We add `tokens/functional.tokens.json` to define the Option 1 Geometric Brutalist Wire overrides (sharp `2px/3px` hairlines, Geist sans font mappings, `var(--ud-panel)` stone canvas, zero shadows). We update `scripts/build.mjs` to output both `dist/tokens.css` (with `:root[data-design="functional"]` selectors bundled) and `dist/tokens-functional.css` (for root-level functional opt-in). We update `DESIGN.md` and `scripts/lint-design.mjs`, then update `showcase/src/App.tsx` with a live mode switcher before cutting the minor semver release.

**Tech Stack:** Style Dictionary, Node.js (`ESM`), DTCG 2025.10 Token Schema, React + Vite + TypeScript + Tailwind CSS v4 (Showcase).

## Global Constraints

- Never hardcode a hex value, `--ud-*` primitive, or raw size in component code; always use semantic tokens.
- No cool slate hexes (`#f8fafc`, `#0f172a`, etc.), no glassmorphism/backdrop-filter, no uppercase mono labels, no em-dashes (`—`).
- UDesign Gold (`#c79f6b`) remains the sole primary brand accent (`--primary`) across both profiles.
- Strict versioning (`vX.Y.Z`) with tag generation and pre-flight validation before cutting releases.

---

### Task 1: Create Functional Profile Tokens (`tokens/functional.tokens.json`)

**Files:**
- Create: `tokens/functional.tokens.json`
- Modify: `tokens/udesign.tokens.json` (ensure clean DTCG baseline without touching existing keys)
- Test: `node scripts/build.mjs` (preliminary check)

**Interfaces:**
- Produces: `tokens/functional.tokens.json` (DTCG format with functional overrides for `canvas`, `card`, `border`, `radius`, `font`, and `shadow`).

- [ ] **Step 1: Write `tokens/functional.tokens.json`**

Create `tokens/functional.tokens.json` containing the Option 1 Geometric Wire overrides:
```json
{
  "$schema": "https://www.designtokens.org/schemas/2025.10/format.json",
  "$description": "UDesign Functional Profile overrides (Geometric Brutalist Wire - Option 1). High-tension ERP wireframes with Geist typography, hairline stone borders, and zero shadows.",

  "role": {
    "$type": "color",
    "background":        { "$value": "{color.neutral.panel}" },
    "foreground":        { "$value": "{color.ink}" },
    "card":              { "$value": "{color.white}" },
    "card-foreground":   { "$value": "{color.ink}" },
    "primary":           { "$value": "{color.accent.base}" },
    "primary-foreground":{ "$value": "{color.ink}" },
    "primary-hover":     { "$value": "{color.accent.deep}" },
    "secondary":         { "$value": "{color.neutral.panel-2}" },
    "secondary-foreground": { "$value": "{color.ink}" },
    "muted":             { "$value": "{color.neutral.panel-2}" },
    "muted-foreground":  { "$value": "{color.neutral.muted}" },
    "border":            { "$value": "{color.neutral.border-strong}" },
    "border-strong":     { "$value": "{color.neutral.muted}" },
    "ring":              { "$value": "{color.accent.base}" },
    "destructive":       { "$value": "{color.status.danger}" },
    "client":            { "$value": "{color.accent.base}" }
  },

  "font": {
    "family": {
      "$type": "fontFamily",
      "display": { "$description": "Functional display uses Geist Sans to eliminate wide Montserrat tracking in dense ERP views.", "$value": ["Geist", "sans-serif"] },
      "data":    { "$description": "Technical readouts only.", "$value": ["JetBrains Mono", "monospace"] }
    }
  },

  "typography": {
    "$type": "typography",
    "display": { "$value": { "fontFamily": ["Montserrat", "sans-serif"], "fontWeight": "{font.weight.black}", "fontSize": { "value": 2.5, "unit": "rem" }, "lineHeight": 1.05, "letterSpacing": { "value": -0.02, "unit": "em" } } },
    "h1":      { "$value": { "fontFamily": "{font.family.display}", "fontWeight": "{font.weight.bold}", "fontSize": { "value": 1.8, "unit": "rem" }, "lineHeight": 1.1, "letterSpacing": { "value": -0.01, "unit": "em" } } },
    "h2":      { "$value": { "fontFamily": "{font.family.display}", "fontWeight": "{font.weight.semibold}", "fontSize": { "value": 1.4, "unit": "rem" }, "lineHeight": 1.15, "letterSpacing": { "value": -0.01, "unit": "em" } } },
    "h3":      { "$value": { "fontFamily": "{font.family.display}", "fontWeight": "{font.weight.semibold}", "fontSize": { "value": 1.1, "unit": "rem" }, "lineHeight": 1.2, "letterSpacing": { "value": 0, "unit": "em" } } },
    "body":    { "$value": { "fontFamily": "{font.family.display}", "fontWeight": "{font.weight.regular}", "fontSize": { "value": 0.875, "unit": "rem" }, "lineHeight": 1.5, "letterSpacing": { "value": 0, "unit": "em" } } },
    "label":   { "$value": { "fontFamily": "{font.family.display}", "fontWeight": "{font.weight.medium}", "fontSize": { "value": 0.75, "unit": "rem" }, "lineHeight": 1.25, "letterSpacing": { "value": 0, "unit": "em" } } },
    "data":    { "$value": { "fontFamily": "{font.family.data}", "fontWeight": "{font.weight.regular}", "fontSize": { "value": 0.8125, "unit": "rem" }, "lineHeight": 1.4, "letterSpacing": { "value": 0, "unit": "em" } } }
  },

  "radius": {
    "$type": "dimension",
    "sm":   { "$value": { "value": 2, "unit": "px" } },
    "base": { "$value": { "value": 3, "unit": "px" } },
    "lg":   { "$value": { "value": 4, "unit": "px" } },
    "pill": { "$value": { "value": 999, "unit": "px" } }
  },

  "shadow": {
    "$type": "shadow",
    "1": { "$value": { "color": { "colorSpace": "srgb", "components": [0, 0, 0], "alpha": 0, "hex": "#000000" }, "offsetX": { "value": 0, "unit": "px" }, "offsetY": { "value": 0, "unit": "px" }, "blur": { "value": 0, "unit": "px" }, "spread": { "value": 0, "unit": "px" } } },
    "2": { "$value": { "color": { "colorSpace": "srgb", "components": [0, 0, 0], "alpha": 0, "hex": "#000000" }, "offsetX": { "value": 0, "unit": "px" }, "offsetY": { "value": 0, "unit": "px" }, "blur": { "value": 0, "unit": "px" }, "spread": { "value": 0, "unit": "px" } } },
    "3": { "$value": { "color": { "colorSpace": "srgb", "components": [0.106, 0.106, 0.106], "alpha": 0.20, "hex": "#1b1b1b" }, "offsetX": { "value": 0, "unit": "px" }, "offsetY": { "value": 12, "unit": "px" }, "blur": { "value": 32, "unit": "px" }, "spread": { "value": -8, "unit": "px" } } }
  }
}
```

- [ ] **Step 2: Verify JSON syntax validity**

Run: `node -e "console.log('JSON valid:', Boolean(require('./tokens/functional.tokens.json')))"`
Expected: `JSON valid: true`

- [ ] **Step 3: Commit Task 1**

```bash
git add tokens/functional.tokens.json
git commit -m "feat(tokens): define functional brutalist wire overrides in tokens/functional.tokens.json"
```

---

### Task 2: Upgrade Build Script (`scripts/build.mjs`) for Dual Style CSS Generation

**Files:**
- Modify: `scripts/build.mjs:1-187`
- Test: `node scripts/build.mjs`

**Interfaces:**
- Consumes: `tokens/udesign.tokens.json`, `tokens/functional.tokens.json`
- Produces: `dist/tokens.css` (bundled base + `[data-design="functional"]` selectors) and `dist/tokens-functional.css` (root-level functional styles).

- [ ] **Step 1: Update `scripts/build.mjs` to register dual CSS formatters and platforms**

Modify `scripts/build.mjs` so it reads both token dictionaries or formats `dist/tokens.css` with a bundled `[data-design="functional"]` block and outputs `dist/tokens-functional.css`:

```javascript
import StyleDictionary from 'style-dictionary';
import fs from 'fs';
import path from 'path';

const BRAND_VAR = {
  'color.accent.wash': '--ud-accent-wash',
  'color.accent.300': '--ud-accent-300',
  'color.accent.400': '--ud-accent-400',
  'color.accent.base': '--ud-accent',
  'color.accent.deep': '--ud-accent-deep',
  'color.cream': '--ud-cream',
  'color.ink': '--ud-ink',
  'color.white': '--ud-white',
};

const NEUTRAL_VAR = {
  'color.neutral.panel': '--ud-panel',
  'color.neutral.panel-2': '--ud-panel-2',
  'color.neutral.border': '--ud-border',
  'color.neutral.border-strong': '--ud-border-strong',
  'color.neutral.muted': '--ud-muted',
  'color.neutral.muted-soft': '--ud-muted-soft',
};

const STATUS_VAR = {
  'color.status.success': '--ud-success',
  'color.status.success-bg': '--ud-success-bg',
  'color.status.warning': '--ud-warning',
  'color.status.warning-bg': '--ud-warning-bg',
  'color.status.danger': '--ud-danger',
  'color.status.danger-bg': '--ud-danger-bg',
};

const ROLE_VAR = {
  background: '--background',
  foreground: '--foreground',
  card: '--card',
  'card-foreground': '--card-foreground',
  primary: '--primary',
  'primary-foreground': '--primary-foreground',
  'primary-hover': '--primary-hover',
  secondary: '--secondary',
  'secondary-foreground': '--secondary-foreground',
  muted: '--muted',
  'muted-foreground': '--muted-foreground',
  border: '--border-color',
  'border-strong': '--border-strong',
  ring: '--ring',
  destructive: '--destructive',
  client: '--client',
};

const RADIUS_VAR = { sm: '--radius-sm', base: '--radius', lg: '--radius-lg', pill: '--radius-pill' };

function getPath(tree, dotted) {
  return dotted.split('.').reduce((node, key) => node?.[key], tree);
}

function dim(d) {
  if (!d) return '0px';
  return `${d.value}${d.unit}`;
}

function rgba(color) {
  if (!color || !color.components) return 'rgba(0,0,0,0)';
  const [r, g, b] = color.components.map((c) => Math.round(c * 255));
  return `rgba(${r},${g},${b},${color.alpha})`;
}

const GENERIC_FONT_KEYWORDS = new Set(['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui']);
function fontFamilyCss(list) {
  if (!list || !Array.isArray(list)) return 'sans-serif';
  return list.map((f) => (GENERIC_FONT_KEYWORDS.has(f) ? f : `'${f}'`)).join(', ');
}

// Helper to format CSS block from a dictionary tree
function formatVarsBlock(t, baseTree, selector, isOverride = false) {
  const L = [];
  L.push(`${selector} {`);

  if (!isOverride) {
    L.push('  /* Primitives: brand */');
    for (const [path, name] of Object.entries(BRAND_VAR)) {
      L.push(`  ${name}: ${getPath(t, path).$value.hex};`);
    }
    L.push('');
    L.push('  /* Primitives: warm stone neutrals */');
    for (const [path, name] of Object.entries(NEUTRAL_VAR)) {
      L.push(`  ${name}: ${getPath(t, path).$value.hex};`);
    }
    L.push('');
    L.push('  /* Primitives: status */');
    for (const [path, name] of Object.entries(STATUS_VAR)) {
      L.push(`  ${name}: ${getPath(t, path).$value.hex};`);
    }
    L.push('');
  }

  L.push('  /* Functional roles */');
  for (const [key, name] of Object.entries(ROLE_VAR)) {
    const token = t.role?.[key] || baseTree.role?.[key];
    if (!token) continue;
    
    // Check if token value is a reference string like "{color.neutral.panel}"
    let valStr = token.$value;
    if (typeof valStr === 'string' && valStr.startsWith('{') && valStr.endsWith('}')) {
      const refPath = valStr.slice(1, -1);
      const primitiveVar = { ...BRAND_VAR, ...NEUTRAL_VAR, ...STATUS_VAR }[refPath];
      if (primitiveVar) {
        L.push(`  ${name}: var(${primitiveVar});`);
        continue;
      }
    }
    
    // Fallback resolving by hex against base tree
    const hexVal = token.$value?.hex || token.$value;
    const primitivePath = Object.keys(BRAND_VAR).concat(Object.keys(NEUTRAL_VAR), Object.keys(STATUS_VAR))
      .find((p) => getPath(baseTree, p)?.$value?.hex === hexVal);
    const primitiveVar = { ...BRAND_VAR, ...NEUTRAL_VAR, ...STATUS_VAR }[primitivePath];
    if (primitiveVar) {
      L.push(`  ${name}: var(${primitiveVar});`);
    } else if (hexVal) {
      L.push(`  ${name}: ${hexVal};`);
    }
  }

  if (!isOverride) {
    L.push('  /* --client overrides per page: :root{ --client:#E23A2E } */');
  }

  L.push('');
  L.push('  /* Type */');
  const fontDisplay = t.font?.family?.display?.$value || baseTree.font.family.display.$value;
  const fontData = t.font?.family?.data?.$value || baseTree.font.family.data.$value;
  L.push(`  --font-display: ${fontFamilyCss(fontDisplay)};`);
  L.push(`  --font-data: ${fontFamilyCss(fontData)};`);
  
  if (!isOverride) {
    const weightLine = Object.entries(baseTree.font.weight)
      .map(([key, token]) => `--fw-${key}:${token.$value}`)
      .join('; ');
    L.push(`  ${weightLine};`);
  }

  L.push('');
  L.push('  /* Radius */');
  for (const [key, name] of Object.entries(RADIUS_VAR)) {
    const rTok = t.radius?.[key] || baseTree.radius[key];
    L.push(`  ${name}: ${dim(rTok.$value)};`);
  }

  if (!isOverride) {
    L.push('');
    L.push('  /* Space */');
    const spaceLine = Object.entries(baseTree.space)
      .map(([key, token]) => `--space-${key}:${dim(token.$value)}`)
      .join('; ');
    L.push(`  ${spaceLine};`);
  }

  L.push('');
  L.push('  /* Elevation */');
  const shadowSource = t.shadow || baseTree.shadow;
  for (const [key, token] of Object.entries(shadowSource)) {
    const s = token.$value;
    if (s.alpha === 0 || s.blur?.value === 0) {
      L.push(`  --shadow-${key}: none;`);
    } else {
      L.push(`  --shadow-${key}: ${dim(s.offsetX)} ${dim(s.offsetY)} ${dim(s.blur)} ${dim(s.spread)} ${rgba(s.color)};`);
    }
  }

  L.push('}');
  return L.join('\n');
}

function formatTypographyHelpers(t, baseTree) {
  const L = [];
  L.push('/* Typography helpers */');
  const typoSource = t.typography || baseTree.typography;
  for (const [key, token] of Object.entries(typoSource)) {
    const v = token.$value;
    let fontVar = '--font-display';
    if (Array.isArray(v.fontFamily) && v.fontFamily[0] === 'JetBrains Mono') {
      fontVar = '--font-data';
    }
    const weightName = Object.entries(baseTree.font.weight).find(([, w]) => {
      const wVal = typeof v.fontWeight === 'string' && v.fontWeight.startsWith('{')
        ? getPath(baseTree, v.fontWeight.slice(1, -1)).$value
        : v.fontWeight;
      return w.$value === wVal;
    })?.[0] || 'regular';

    const extra = key === 'label' ? ';color:var(--muted-foreground)' : '';
    const comment = key === 'label' ? ' /* Title case, no uppercase/tracking */' : '';
    L.push(
      `.ud-${key}{font-family:var(${fontVar});font-weight:var(--fw-${weightName});font-size:${dim(v.fontSize)};line-height:${v.lineHeight};letter-spacing:${dim(v.letterSpacing)}${extra}}${comment}`
    );
  }
  return L.join('\n');
}

// Build standard dist/tokens.css bundling base + functional overrides
StyleDictionary.registerFormat({
  name: 'ud/css-dual',
  format: ({ dictionary }) => {
    const baseTree = JSON.parse(fs.readFileSync(path.resolve('tokens/udesign.tokens.json'), 'utf8'));
    let functionalTree = {};
    if (fs.existsSync(path.resolve('tokens/functional.tokens.json'))) {
      functionalTree = JSON.parse(fs.readFileSync(path.resolve('tokens/functional.tokens.json'), 'utf8'));
    }

    const L = [];
    L.push('/*');
    L.push(' * UDesign design tokens (Dual Style: Brand & Functional). Compiled from DTCG sources.');
    L.push(' * Do not hand-edit this file: edit the token source and run `npm run build`.');
    L.push(' */');
    
    // Base :root (Brand Show-Off)
    L.push(formatVarsBlock(baseTree, baseTree, ':root, :root[data-design="brand"]', false));
    L.push('');
    
    // Functional override :root[data-design="functional"]
    L.push(formatVarsBlock(functionalTree, baseTree, ':root[data-design="functional"], .design-functional', true));
    L.push('');
    
    // Typography helpers
    L.push(formatTypographyHelpers(baseTree, baseTree));
    L.push('');

    return L.join('\n');
  },
});

// Build standalone dist/tokens-functional.css for direct root functional usage
StyleDictionary.registerFormat({
  name: 'ud/css-functional-only',
  format: () => {
    const baseTree = JSON.parse(fs.readFileSync(path.resolve('tokens/udesign.tokens.json'), 'utf8'));
    const functionalTree = JSON.parse(fs.readFileSync(path.resolve('tokens/functional.tokens.json'), 'utf8'));
    
    const mergedTree = JSON.parse(JSON.stringify(baseTree));
    Object.assign(mergedTree.role, functionalTree.role);
    Object.assign(mergedTree.font, functionalTree.font);
    Object.assign(mergedTree.radius, functionalTree.radius);
    Object.assign(mergedTree.shadow, functionalTree.shadow);
    Object.assign(mergedTree.typography, functionalTree.typography);

    const L = [];
    L.push('/* Standalone UDesign Functional Brutalist Wire Tokens */');
    L.push(formatVarsBlock(mergedTree, baseTree, ':root', false));
    L.push('');
    L.push(formatTypographyHelpers(mergedTree, baseTree));
    L.push('');
    return L.join('\n');
  },
});

const sd = new StyleDictionary({
  source: ['tokens/**/*.json'],
  usesDtcg: true,
  platforms: {
    css: {
      files: [
        { destination: 'dist/tokens.css', format: 'ud/css-dual' },
        { destination: 'dist/tokens-functional.css', format: 'ud/css-functional-only' }
      ],
    },
  },
});

await sd.hasInitialized;
await sd.buildAllPlatforms();
```

- [ ] **Step 2: Run `node scripts/build.mjs` and verify output**

Run: `node scripts/build.mjs`
Expected: Successfully generates `dist/tokens.css` and `dist/tokens-functional.css` without errors.

Verify tokens generated:
Run: `node -e "const css = fs.readFileSync('dist/tokens.css', 'utf8'); console.log('Has root:', css.includes(':root, :root[data-design=\"brand\"]')); console.log('Has functional:', css.includes(':root[data-design=\"functional\"]')); console.log('Has radius-sm override:', css.includes('--radius-sm: 2px'));"`
Expected: `true`, `true`, `true`.

- [ ] **Step 3: Commit Task 2**

```bash
git add scripts/build.mjs dist/tokens.css dist/tokens-functional.css
git commit -m "feat(build): upgrade build.mjs to generate dual tokens.css and tokens-functional.css"
```

---

### Task 3: Update `DESIGN.md` & Upgrade Linter (`scripts/lint-design.mjs`)

**Files:**
- Modify: `DESIGN.md`
- Modify: `scripts/lint-design.mjs`
- Test: `node scripts/lint-design.mjs`

**Interfaces:**
- Consumes: `tokens/udesign.tokens.json`, `tokens/functional.tokens.json`, `DESIGN.md`
- Produces: 100% spec-compliant verification pass across both modes.

- [ ] **Step 1: Update `DESIGN.md` to formally describe Dual Design Architecture**

Modify `DESIGN.md` under `## Brand Layout Styles: Impactful vs. Functional` to detail the dual profiles and exact variable overrides (`Option 1 Geometric Brutalist Wire`). Replace em-dashes if any exist with hyphens/colons to satisfy linter rules.

- [ ] **Step 2: Update `scripts/lint-design.mjs` to cross-check both token files**

Modify `scripts/lint-design.mjs` so that when checking `tokens/udesign.tokens.json`, it also checks `tokens/functional.tokens.json` (ensuring 0 banned slate hex codes and valid DTCG structure in both).

- [ ] **Step 3: Run `node scripts/lint-design.mjs`**

Run: `node scripts/lint-design.mjs`
Expected: `Validation PASSED with 0 errors and X warning(s). DESIGN.md is spec-compliant!`

- [ ] **Step 4: Commit Task 3**

```bash
git add DESIGN.md scripts/lint-design.mjs
git commit -m "docs: formalize dual styling architecture in DESIGN.md and update linter"
```

---

### Task 4: Interactive Showcase Mode Switcher (`showcase/src/App.tsx`)

**Files:**
- Modify: `showcase/src/App.tsx`
- Test: `npm run build-showcase`

**Interfaces:**
- Consumes: `dist/tokens.css` (via `@import "udesign-design-system/dist/tokens.css"` in `showcase/src/index.css` or `App.tsx`)
- Produces: Live UI toggle switching between `data-design="brand"` and `data-design="functional"`.

- [ ] **Step 1: Add state and header toggle in `showcase/src/App.tsx`**

Modify `showcase/src/App.tsx` to include `designMode` state (`'brand' | 'functional'`) toggling `document.documentElement.setAttribute('data-design', designMode)` on effect/change, with a toggle button in the header nav:
```tsx
<button
  onClick={() => setDesignMode(designMode === 'brand' ? 'functional' : 'brand')}
  className="px-3 py-1 text-xs font-semibold rounded-[var(--radius-sm)] border border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--primary)] hover:text-white transition-colors"
>
  {designMode === 'brand' ? '✦ Brand Show-Off' : '⚡ Brutalist Functional'}
</button>
```

- [ ] **Step 2: Verify showcase compilation**

Run: `npm run build-showcase`
Expected: Builds `dist-showcase/` cleanly with 0 TypeScript or Vite errors.

- [ ] **Step 3: Commit Task 4**

```bash
git add showcase/src/App.tsx
git commit -m "feat(showcase): add live dual design switcher (Brand vs Functional)"
```

---

### Task 5: Pre-Flight Check & Version Bump Preparation

**Files:**
- Check: all modified files (`git status`)
- Test: full pre-flight verification sequence (`npm run build && node scripts/lint-design.mjs && npm run build-showcase`)

**Interfaces:**
- Produces: Ready-to-release package state.

- [ ] **Step 1: Run complete pre-flight suite**

Run:
```bash
npm run build
node scripts/lint-design.mjs
npm run build-showcase
```
Expected: All 3 commands succeed cleanly with 0 errors.

- [ ] **Step 2: Check git status and commit any lingering build artifacts**

Run: `git status`
Expected: Clean working tree or only `dist/` updates ready for release.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-14-dual-design-system.md`. Two execution options:

1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
