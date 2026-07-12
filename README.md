# UDesign Design System

The single source of truth for UDesign's brand tokens: color, type, spacing, radius, shadow. Every repo that renders UDesign-branded UI (`udesignpages`, `globalvision`, `udesign-website`, ...) consumes this package instead of hand-maintaining its own copy of the palette.

Do not source brand values from "Icitte": that is a separate product line with its own identity, not part of UDesign's brand.

## For AI agents (read this first)

If you are an agent working in a repo that consumes this package:

1. **Never hardcode a hex value, an `--ud-*` primitive, or a raw size.** Use a semantic token (`--primary`, `--background`, `--muted-foreground`, `--client`, etc.) in component code.
2. **No semantic token for what you need?** Don't invent one locally and don't reach for a primitive. Add the semantic token here, in `tokens/udesign.tokens.json`, run `npm run build`, commit, then consume it from the app repo.
3. **Never hand-edit `dist/tokens.css` or anything under `history/`.** Both are generated. The only hand-edited file in this repo is `tokens/udesign.tokens.json`.
4. **Install via git, not npm registry:** `"udesign-design-system": "github:7KMANN/udesign-design-system"` in `dependencies`, then one `@import "udesign-design-system/dist/tokens.css";` near the app root. There is no published npm package.
5. **Never source brand values from "Icitte"** — unrelated product line, wrong palette.
6. **Bumping this package's own version?** Don't hand-edit `package.json` or `CHANGELOG.md`. Run `npm run release -- <patch|minor|major> "what changed and why"` from inside this repo.

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

## Releasing a new version

Only when the brand itself changes (new accent shade, new type scale value, a renamed token):

```bash
npm run release -- <patch|minor|major> "what changed and why"
```

This bumps `package.json`'s version, rebuilds `dist/tokens.css`, freezes a copy of it under `history/vX.Y.Z/tokens.css`, appends an entry to `CHANGELOG.md`, and regenerates the showcase page's version list. Semver: patch for a value tweak, minor for an additive token, major for a rename or removal (breaking for consumers).

## Showcase

`showcase/index.html` is a kitchen-sink page: every color, type style, button, badge, and spacing/radius value rendered together as the canonical visual reference. Open it directly in a browser (no build step, no server needed). A version dropdown at the top swaps between every released version's tokens against the same markup, so picking an older version visually replays what the brand looked like then.

## Out of scope (for now)

- Publishing to npm or GitHub Packages: this stays a git dependency.
- A shared React component library. Each consuming app keeps its own components; only tokens are shared.
- Automated visual regression testing. The showcase page is a visual reference, not a test suite.
