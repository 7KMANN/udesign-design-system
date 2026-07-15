# UDesign Design System

UDesign provides the semantic design foundation and source-owned React components used across UDesign products. The package supplies DTCG tokens and compiled CSS. Its shadcn-compatible registry supplies component source that each application owns after installation.

Do not source brand values from Icitte. It is a separate product line with its own identity.

**License:** proprietary, uDesign Productions only. See [LICENSE.md](LICENSE.md). Public visibility does not grant permission to use the work.

## What ships in 1.3.0

- A semantic token foundation for light and dark themes.
- Brand and functional density profiles selected at runtime.
- Tone roles for neutral, info, success, warning, danger, progress, and brand states.
- Metric, chart, entity, interaction, surface, and responsive roles.
- A shadcn source registry with 15 base components, five application patterns, and a `core` bundle.
- A responsive showcase that exercises the full theme and profile matrix.

This is not a bundled React runtime library. Registry components are copied into the consuming repository so the application can inspect, adapt, and test its own source while the shared semantic contract remains stable.

## Rules for contributors and agents

Before changing this repository:

1. Read [DESIGN.md](DESIGN.md).
2. Use semantic variables in component and application code. Primitive `--ud-*` variables belong only to token definitions and generated output.
3. Do not hardcode colors in components. If the semantic contract is missing a role, add the role here rather than bypassing it in a consumer.
4. Keep labels in sentence case. Do not use wide-tracked uppercase utility labels.
5. Do not hand-edit generated token CSS, version snapshots, `showcase/public/versions.js`, or registry JSON under `public/r/`.
6. Run the complete build, contract, component, registry type, showcase, and Playwright checks before release.
7. Verify light and dark themes in both brand and functional profiles, including the 375px preview.

## Architecture

The system has three layers:

1. **Primitive tokens** store raw values. They are implementation details and use the `--ud-*` namespace in compiled CSS.
2. **Semantic tokens** describe intent, such as `--background`, `--tone-warning-surface`, `--data-3`, or `--interactive-focus`. Product code consumes this layer.
3. **Registry components** consume semantic roles and are copied into an application through shadcn. Applications can extend those components without changing the shared tokens.

The primitive layer can change while semantic meaning remains stable. A component that reaches through to a primitive defeats that contract.

## Install the tagged token package

Pin the Git dependency to a release tag. Do not install from a moving branch.

```json
{
  "dependencies": {
    "udesign-design-system": "github:7KMANN/udesign-design-system#v1.3.0"
  }
}
```

Import the combined stylesheet once near the application root:

```css
@import "udesign-design-system/dist/tokens.css";
```

`tokens.css` supports all four runtime combinations:

```html
<html data-design="brand" data-theme="light">
<html data-design="brand" data-theme="dark">
<html data-design="functional" data-theme="light">
<html data-design="functional" data-theme="dark">
```

If the attributes are absent, the stylesheet uses the brand and light defaults. Set both attributes before first paint when possible to avoid a visible theme change during hydration.

`dist/tokens-functional.css` remains available for applications that only need the functional profile. Applications that switch profiles at runtime should use the combined stylesheet.

## Install registry components

Initialize shadcn in the consuming application and add the tagged namespace to `components.json`:

```json
{
  "registries": {
    "@udesign": "https://raw.githubusercontent.com/7KMANN/udesign-design-system/v1.3.0/public/r/{name}.json"
  }
}
```

Install the complete supported source set through the public `@udesign/core` item:

```bash
npx shadcn@latest add @udesign/core
```

The direct tagged URL remains available when a consumer does not configure a namespace:

```bash
npx shadcn@latest add https://raw.githubusercontent.com/7KMANN/udesign-design-system/v1.3.0/public/r/core.json
```

Install a single item by replacing `core` with its registry name:

```bash
npx shadcn@latest add https://raw.githubusercontent.com/7KMANN/udesign-design-system/v1.3.0/public/r/button.json
```

Available base items:

`button`, `badge`, `alert`, `card`, `input`, `textarea`, `select`, `checkbox`, `switch`, `field`, `dialog`, `sheet`, `tooltip`, `tabs`, and `table`.

Available patterns:

`icon-button`, `status-badge`, `metric-card`, `empty-state`, and `responsive-collection`.

Generated JSON under `public/r/` is release output. Edit the registry source and rebuild instead of patching generated JSON.

## Semantic consumption

Use the role that matches the content. Do not choose a token because its current color looks convenient.

```css
.notice {
  color: var(--tone-info-foreground);
  background: var(--tone-info-surface);
  border-color: var(--tone-info-border);
}

.notice:focus-visible {
  outline: 2px solid var(--interactive-focus);
  outline-offset: 2px;
}
```

Tone families use the same shape:

```text
--tone-{neutral|info|success|warning|danger|progress|brand}-foreground
--tone-{neutral|info|success|warning|danger|progress|brand}-surface
--tone-{neutral|info|success|warning|danger|progress|brand}-border
--tone-{neutral|info|success|warning|danger|progress|brand}-solid
--tone-{neutral|info|success|warning|danger|progress|brand}-solid-foreground
```

Use surface roles for elevation and workspace context:

- `--surface-raised` and `--surface-raised-foreground`
- `--surface-sunken` and `--surface-sunken-foreground`
- `--surface-overlay` and `--surface-overlay-foreground`
- `--surface-console` and `--surface-console-foreground`
- `--backdrop` for modal and sheet scrims

Use interaction roles for state rather than opacity-only feedback:

- `--interactive-hover`
- `--interactive-pressed`
- `--interactive-selected`, `--interactive-selected-foreground`, and `--interactive-selected-border`
- `--interactive-focus`
- `--interactive-disabled` and `--interactive-disabled-foreground`

## Metrics, charts, and entities

Metrics distinguish direction from status:

- Positive metrics use `--metric-positive-*`.
- Negative metrics use `--metric-negative-*`.
- Neutral metrics use `--metric-neutral-*`.

Each family supplies `foreground`, `surface`, and `border` roles.

Charts use `--data-1` through `--data-8`, plus `--data-muted`, `--data-grid`, `--data-axis`, `--data-tooltip`, and `--data-tooltip-foreground`. Always pair chart color with labels, values, patterns, or direct annotations. Color alone must not carry meaning.

Entity families use `--entity-1-*` through `--entity-4-*`, with `foreground`, `surface`, `border`, and `solid` roles. Assign an entity family consistently within a product. Do not assume an entity number has the same business meaning in every application.

## Responsive and mobile contract

Registry controls and patterns use the shared responsive variables:

- `--touch-target-min`
- `--control-height`
- `--control-height-compact`
- `--content-gutter-mobile`
- `--dialog-inline-size-mobile`
- `--dialog-block-size-max`
- `--safe-area-bottom`

Interactive targets must be at least `--touch-target-min`. On narrow screens, collections should switch from dense tables to cards or provide deliberate horizontal scrolling with useful sticky context. Dialogs must respect the mobile inline and block-size roles. Bottom actions must include the safe-area inset.

## Tailwind compatibility

The semantic CSS works without Tailwind. Registry source is compatible with Tailwind 3 and Tailwind 4 because state and color decisions resolve through CSS variables instead of framework palette names.

For Tailwind 4, map only semantic roles:

```css
@import "tailwindcss";
@import "udesign-design-system/dist/tokens.css";

@theme {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-primary: var(--primary);
  --color-border: var(--border-color);
  --color-focus: var(--interactive-focus);
}
```

Do not expose primitives through Tailwind theme aliases.

## Compatibility target

- React 18 and React 19 source projects.
- Next.js 15 and 16 App Router projects.
- Vite React projects.
- Tailwind CSS 3.4 and 4.x.
- Modern evergreen browsers with CSS custom properties and container-query support.

Interactive registry components include their required client boundary. The token package itself is plain CSS and is safe to import from server-rendered applications.

The release pipeline compiles the source against React 18 and Tailwind 3, performs a shadcn 3.5 namespaced clean install, and runs browser checks in Chromium. React 19, Tailwind 4, and framework-specific applications remain supported source targets and should run their own production build after installation.

## Source of truth and generated files

- `tokens/udesign.tokens.json` defines shared primitives and semantic roles.
- `tokens/functional.tokens.json` defines functional-profile overrides.
- `registry.json` defines the shadcn manifest and `registry/new-york/ui/` contains the component and pattern source.
- `DESIGN.md` defines usage rules and accessibility expectations.
- `dist/`, `history/`, `public/r/`, and `showcase/public/versions.js` are generated or release-managed output.

## Build and verify

```bash
npm install
npm run build
node scripts/lint-design.mjs
npm run build:registry
npm test
npm run typecheck:registry
npm run build-showcase
npm run test:e2e
```

Run `npm run dev` for visual review. Check every design and theme combination at desktop, tablet, and 375px mobile widths. Keyboard through all controls and confirm that focus remains visible.

## Versioning and release

Use semantic versioning:

- Patch: fixes that preserve existing semantic meaning and component APIs.
- Minor: additive tokens, components, variants, or compatible behavior.
- Major: removed or renamed roles, changed meaning, or breaking component APIs.

Release URLs and Git dependencies must use the same tag as `package.json`, `CHANGELOG.md`, history snapshots, and registry output. The release command prepares artifacts but does not replace the required commit, tag, and push checks.

```bash
npm run release -- <patch|minor|major> "what changed and why"
git tag vX.Y.Z
git push origin master --tags
```

## Showcase

The Vite showcase demonstrates tokens and registry patterns across light and dark themes, brand and functional profiles, and responsive widths. It is a review surface, not a substitute for automated interaction, accessibility, and visual regression tests.
