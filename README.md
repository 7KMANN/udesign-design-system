# UDesign Design System

The single source of truth for UDesign's brand tokens: color, type, spacing, radius, shadow. Every repo that renders UDesign-branded UI (`udesignpages`, `globalvision`, `udesign-website`, ...) consumes this package instead of hand-maintaining its own copy of the palette.

Do not source brand values from "Icitte": that is a separate product line with its own identity, not part of UDesign's brand.

**License:** proprietary, uDesign Productions only. See [LICENSE.md](LICENSE.md). This repository being publicly visible does not grant any right to use it.

## For AI agents (read this first)

If you are an agent working directly in this repository:

1. **Read `DESIGN.md` in the root first.** It contains UDesign's core brand rules, typography constraints, and a list of **Banned Design Patterns** (such as a hard ban on cool slate hexes, glassmorphism/translucency, uppercase mono labels, and em-dashes).
2. **Run validation before completing tasks:** You MUST run the linter to verify `DESIGN.md` spec-compliance:
   ```bash
   node scripts/lint-design.mjs
   ```
   Ensure it passes with 0 errors. If you change tokens, compile them with `npm run build`, run the React dev server using `npm run dev`, and verify they look correct in the browser at `http://localhost:3000/`.

If you are an agent working in a repo that consumes this package:

1. **Never hardcode a hex value, an `--ud-*` primitive, or a raw size.** Use a semantic token (`--primary`, `--background`, `--muted-foreground`, `--client`, etc.) in component code.
2. **No semantic token for what you need?** Don't invent one locally and don't reach for a primitive. Add the semantic token here, in `tokens/udesign.tokens.json`, run `npm run build`, commit, then consume it from the app repo.
3. **Never hand-edit `dist/tokens.css`, anything under `history/`, or `showcase/public/versions.js`.** All of them are generated/managed automatically. The only hand-edited source files are `tokens/udesign.tokens.json` and `DESIGN.md`.
4. **Install via git, not npm registry:** `"udesign-design-system": "github:7KMANN/udesign-design-system"` in `dependencies`, then one `@import "udesign-design-system/dist/tokens.css";` near the app root. There is no published npm package.
5. **Never source brand values from "Icitte"** — unrelated product line, wrong palette.
6. **Changing a token value?** Follow the exact steps in [Updating tokens & releasing a version](#updating-tokens--releasing-a-version) below, in order. Don't skip the semver decision, don't skip the showcase check, don't forget the git tag.

## The token model

Tokens are layered in three tiers. Consuming code should only ever reach for the top tier.

1. **Primitive**: raw values, no meaning attached (`--ud-accent-400`, `--ud-panel`). Defined once, here, and nowhere else.
2. **Semantic** (a.k.a. "role"): functional aliases that express intent (`--primary`, `--background`, `--muted-foreground`). These point at primitives and are what components should actually use.
3. **Component**: a consuming app's own per-component overrides, scoped to that app. Not defined in this package; this is where `globalvision`'s dashboard components and `udesign-website`'s marketing components stay free to differ from each other without touching the shared brand.

**Rule: consume semantic tokens, never primitives, never raw hex.** If a component needs a color the semantic layer doesn't have a name for yet, that's a sign to add a new semantic token here, not to reach for a primitive or a literal hex value.

One token is intentionally adaptive: `--client`. It defaults to the UDesign accent but is meant to be overridden per client page/project with that client's own brand color, while every other token stays fixed. This is how `udesignpages` shows each client their own accent without touching UDesign's identity.

## Source of truth

`tokens/udesign.tokens.json`: [DTCG 2025.10](https://www.designtokens.org/) format. This is the only file you hand-edit. Everything else is generated from it.

## Building

```bash
npm install
npm run build
```

Compiles `tokens/udesign.tokens.json` into `dist/tokens.css` via Style Dictionary. `dist/tokens.css` is committed to git (not gitignored) so consuming apps never need a working Style Dictionary toolchain just to install this package.

## Installing in another repo

No npm registry, no publish step. Add it straight from git:

```json
{
  "dependencies": {
    "udesign-design-system": "github:7KMANN/udesign-design-system"
  }
}
```

Then import the compiled CSS once, near the root of the app:

```css
@import "udesign-design-system/dist/tokens.css";
```

### Consuming in a Tailwind v4 app

Tailwind v4's `@theme` block maps directly onto CSS custom properties: point it at the token variables instead of re-declaring values:

```css
@import "tailwindcss";
@import "udesign-design-system/dist/tokens.css";

@theme {
  --color-accent: var(--ud-accent);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-display: var(--font-display);
}
```

This gets you Tailwind utilities (`bg-accent`, `text-foreground`, `font-display`) that resolve to the shared brand tokens, while the app's own components stay entirely its own.

## Updating tokens & releasing a version

The current released version is **v1.0.0**, tagged in git — that's the official baseline every consuming repo builds against. Every change to the brand follows the same path to become the next official version. Do the steps in this order, every time, and don't skip any of them:

### 1. Decide the semver bump *before* you touch anything

| Bump | When | Example |
|---|---|---|
| **patch** | An existing token's *value* changes, meaning stays the same | Nudging `--ud-accent-400`'s hex a few shades warmer |
| **minor** | A *new* token is added, nothing existing changes or breaks | Adding a `--warning-foreground` semantic role that didn't exist before |
| **major** | A token is *renamed* or *removed*, or its meaning changes | Renaming `--ud-panel` to `--ud-surface`, or repurposing `--client` |

If you're unsure between two, pick the higher one — consumers can absorb an unnecessary minor bump silently; they can't absorb a missed breaking change.

### 2. Edit the source, and only the source

Hand-edit `tokens/udesign.tokens.json` and the brand configuration/prose in `DESIGN.md`. Never touch `dist/tokens.css`, anything under `history/`, or `showcase/public/versions.js` directly — all of these are generated or updated during the build/release process.

### 3. Build and visually verify

Verify all rules, tokens, and layouts are fully valid and compilable:
```bash
# 1. Compile tokens
npm run build

# 2. Run design linter to ensure DESIGN.md compliance
node scripts/lint-design.mjs

# 3. Verify showcase application compiles without errors
npm run build-showcase

# 4. Spin up the dev server for visual inspection at http://localhost:3000/
npm run dev
```

### 4. Cut the release

```bash
npm run release -- <patch|minor|major> "what changed and why"
```

This command runs automated pre-flight checks first (design linter, token build, and showcase compilation). If all checks pass, it bumps `package.json`'s version, rebuilds `dist/tokens.css`, freezes a copy under `history/vX.Y.Z/tokens.css`, appends a dated entry to `CHANGELOG.md`, and regenerates the dropdown configurations in `showcase/public/versions.js`. If any pre-flight check fails, the release process aborts immediately. It does **not** commit or tag anything — that's steps 5 and 6, on you (or the agent doing this).

### 5. Commit everything the release step touched, in one commit

```bash
git add tokens/udesign.tokens.json dist/tokens.css package.json CHANGELOG.md history/ showcase/versions.js
git commit -m "release: vX.Y.Z — what changed and why"
```

### 6. Tag the commit and push both

```bash
git tag vX.Y.Z
git push origin master --tags
```

The git tag is what makes a version *official* — `package.json`'s number alone is not enough, since it can drift out of sync with what's actually pushed. Every released version must have a matching tag. If a version in `CHANGELOG.md` or `history/` doesn't have one, that's a bug to fix, not a pattern to repeat.

## Showcase

The showcase is a modern React + Vite + TypeScript + Tailwind CSS application located in `showcase/`. To run the preview locally, run `npm run dev` and open `http://localhost:3000/`. To compile the app for production, run `npm run build-showcase`. A dropdown at the top dynamically loads previous token releases from `history/` so you can compare design changes.

## Out of scope (for now)

- Publishing to npm or GitHub Packages: this stays a git dependency.
- A shared React component library. Each consuming app keeps its own components; only tokens are shared.
- Automated visual regression testing. The showcase page is a visual reference, not a test suite.
