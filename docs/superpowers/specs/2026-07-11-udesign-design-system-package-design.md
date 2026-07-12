# UDesign Design System Package: Design Spec

**Goal:** Stand up `udesign-design-system` as a standalone, versioned package that becomes the single source of truth for UDesign's brand tokens (color, type, spacing, radius, shadow), consumable by any repo (starting with `globalvision`, then `udesign-website`) via a git dependency: plus a self-contained "kitchen sink" showcase page that can visually replay any past version of the brand.

**Architecture:** DTCG-spec JSON is the only hand-edited source of truth. A Style Dictionary build compiles it to CSS custom properties, committed to `dist/` so consumers never need a working build toolchain just to install. Every release also freezes a copy of that version's compiled CSS under `history/vX.Y.Z/`. A single static showcase page renders every token/component against whichever version's CSS is selected from a dropdown: same markup, different `<link>` target.

**Tech stack:** Plain Node.js + Style Dictionary (DTCG-native). No framework, no bundler, no registry. Zero runtime dependencies for consumers: they get plain CSS custom properties.

## Global Constraints

- Token source format: DTCG 2025.10 (`$schema`, `$type`, `$value`, `$description`): matches the existing `udesignpages` tokens file this package is seeded from.
- Token tiers: primitive → semantic → component. Consumers must be steered toward consuming semantic tokens (`--primary`, `--background`), never primitives (`--ud-accent-400`) or raw hex, in any documentation or example.
- Distribution: git dependency only. No npm publish, no private registry, no auth setup.
- `dist/tokens.css` is committed to git on every release: never gitignored.
- Showcase page (`showcase/index.html`) uses only relative paths to its CSS: udesignpages already hit a bug where an absolute path silently broke font loading outside the production host; this package must not repeat it.
- Versioning: semver. Patch = value tweak. Minor = additive token. Major = renamed/removed token (breaking).
- Banned design artifacts (carried over from the udesignpages system, since this package is the canonical source for that rule too): em-dash `—`; slate hex (`#f8fafc`, `#0f172a`, `#64748b`, etc.); `backdrop-filter`/glassmorphism; mono ALL-CAPS wide-tracked labels; gradient-clip-text headlines.

---

## 1. Repository layout

```
udesign-design-system/
├── package.json
├── README.md
├── CHANGELOG.md
├── .gitignore
├── tokens/
│   └── udesign.tokens.json
├── style-dictionary.config.mjs
├── scripts/
│   └── release.mjs
├── dist/
│   └── tokens.css
├── history/
│   └── v1.0.0/
│       └── tokens.css
├── showcase/
│   └── index.html
└── docs/
    └── superpowers/
        ├── specs/
        └── plans/
```

## 2. Token source (`tokens/udesign.tokens.json`)

Ported verbatim from `udesignpages/public/design-system/udesign.tokens.json` as the v1.0.0 baseline: that file is already the approved, brand-researched, DTCG-valid source (accent `#c79f6b`, cream/ink neutrals, warm-stone panel scale, Montserrat/JetBrains Mono type tokens, radius/space/shadow scales). No new colors or values are invented in this package; it's a faithful relocation of an already-approved system into a shareable, versioned home.

## 3. Build (`style-dictionary.config.mjs` + `dist/tokens.css`)

Style Dictionary reads `tokens/udesign.tokens.json` (DTCG format, native support) and emits one CSS file: `dist/tokens.css`, functionally equivalent in content/shape to the hand-compiled `udesign-tokens.css` already shipping in `udesignpages` (primitives, semantic roles, typography helper classes, radius/space/shadow scale): so a consuming app's integration work is a drop-in swap, not a redesign.

`npm run build` runs the compile. This is the only command that touches `dist/`.

## 4. Release flow (`scripts/release.mjs`)

`npm run release -- <patch|minor|major>`:
1. Bumps `package.json`'s version in place (patch/minor/major, following semver: no git tag created by this step).
2. Runs the Style Dictionary build against the newly-bumped version.
3. Copies the freshly built `dist/tokens.css` into `history/v<new-version>/tokens.css`.
4. Appends a line to `CHANGELOG.md` (version, date, one-line description prompted from the user or passed as an arg).
5. Regenerates `showcase/versions.json` (the list of available versions the showcase page's dropdown reads) so the showcase always lists every released version without hand-editing HTML.

## 5. Showcase / kitchen sink page (`showcase/index.html`)

A single static page, opens directly via `file://` (relative paths only), no build step to view:

- **Header**: page title, a `<select>` populated from `showcase/versions.json`, defaulting to the latest version. Changing it swaps the `<link rel="stylesheet">` `href` to point at the matching `history/vX.Y.Z/tokens.css` (falls back to `dist/tokens.css` for the "current/unreleased" option) and re-renders nothing else: the whole point is the same markup looks different.
- **Color**: swatch grid for every primitive and semantic color token, each labeled with its CSS variable name.
- **Type scale**: display/h1/h2/h3/body/label/data, each rendered at real size next to its variable name.
- **Buttons**: primary/secondary/outline, default + hover + focus-visible states.
- **Badge, header lockup, confidential footer**: the same canonical patterns already established in `udesignpages/public/design-system/patterns.html`, so this page doubles as a living copy of that reference.
- **Spacing & radius scale**: a visual ruler (boxes sized to each `--space-*` / `--radius-*` value, labeled).

This page is descriptive documentation, not a test suite: it has no assertions, just visual rendering. (This matches how real design systems use a "kitchen sink" page: a canonical rendered reference, not automated verification. Automated visual-regression testing, if ever wanted, is a separate future concern and out of scope here.)

## 6. `package.json`

```json
{
  "name": "udesign-design-system",
  "version": "1.0.0",
  "private": true,
  "description": "UDesign brand design tokens: single source of truth, consumed via git dependency.",
  "main": "dist/tokens.css",
  "files": ["dist", "tokens", "README.md", "CHANGELOG.md"],
  "scripts": {
    "build": "style-dictionary build --config style-dictionary.config.mjs",
    "release": "node scripts/release.mjs"
  },
  "devDependencies": {
    "style-dictionary": "^4"
  }
}
```

No `publishConfig`, no registry fields: this package is never `npm publish`ed.

## 7. README.md contents

- What this is and why it exists (one paragraph: single source of truth for UDesign's brand across repos).
- The token-tier model explained (primitive → semantic → component) with the rule: consumers use semantic tokens only, never primitives or raw hex.
- Install: `npm install github:7KMANN/udesign-design-system` (or the equivalent `"udesign-design-system": "github:7KMANN/udesign-design-system"` line for `package.json`).
- Consuming in a Tailwind v4 app: import `dist/tokens.css`, then map Tailwind's `@theme` block onto the CSS variables (`--color-accent: var(--ud-accent);`), with a short real example.
- How to cut a new version (`npm run release -- <bump>`), and where to view the showcase page.
- Explicit "Do not source from Icitte" note, carried over from the `udesignpages` README, since that sub-brand warning applies org-wide, not just to one repo.

## 8. CHANGELOG.md

Starts with a single `## 1.0.0: 2026-07-11` entry: "Initial release. Ported from the udesignpages design system (Studio White + Cream Atelier)."

## 9. Out of scope (explicitly, for this spec)

- Publishing to a real npm/GitHub Packages registry.
- A shared React component library (buttons/cards as actual components): each consuming app keeps its own components; only tokens are shared.
- Automated visual regression testing (Chromatic/Percy/Playwright screenshot diffing): noted as a reasonable future addition, not built here.
- Wiring this package into `globalvision` or `udesign-website`: that happens in a later, separate task (possibly a different agent, per the user's stated intent).
