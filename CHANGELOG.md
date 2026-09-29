# Changelog

## 3.0.0 (2026-09-29)

The brand and functional aliases are removed, and GlobalVision's recommendations ship: focus, hover and Switch states that meet their contrast rules, phone navigation in a sheet, compact desktop toolbars, composition bans 28 to 32 with new checker rules, and a measured layout audit.

Decisions and measurements: `docs/v2/DECISIONS.md` round 16 (D-33 to D-36, Δ-22 to Δ-28).

### Pairing

- `udesign-docs` needs its own release beside this one: `standards/design/udesign-contract.md` (ratified decision 1) and the GlobalVision overlay still say `data-design="functional"`. Move both pins in one change.

### Breaking or visible changes

- **Profile aliases removed.** `data-design="brand"` and `"functional"` select nothing; write `presentation` and `operations`. `udesign-check` flags a root still on the old names.
- **Phone navigation.** `AppShellSidebar` hides below `md`. Render the same nav in a `Sheet` (`side="left"`) opened from a menu `Button` first in the toolbar, as `examples/operations-queue.tsx` does. Static HTML: add `popover` and an `id` to `ud-app-shell-sidebar`, and a `ud-app-shell-menu` button with `popovertarget` (D-36).
- **Compact toolbars on a desktop mouse.** From `md` on a fine pointer, every control inside `AppShellToolbar` (and `ud-app-shell-toolbar`) is 36px; touch keeps 44px. Ban 20 is now a touch rule (D-33). Remove any per-route compact recipe.
- **Focus.** Light themes draw focus in the deep accent (`--interactive-focus`, `--ring`, `--sidebar-ring`): the accent base was 2.1 to 2.4:1. Fields ring inside their border; other controls draw an outline with a transparent gap instead of Tailwind's white ring offset.
- **Hover and pressed** step off the page floor, `--secondary` and each other in every profile and theme: operations light hover was invisible on the floor, presentation hover invisible on a secondary button.
- **Switch** off state: `--muted` track, `--muted-foreground` border and thumb. **Checkbox and Switch** change colour on press. **Tabs** no longer shift 2px on selection.
- **Select and Tooltip** float on `--shadow-3`, visible in `operations`. **`SheetContent`** is a flex column, so content starts at the top of a side sheet. **Dialog and Sheet headers** reserve the close button's space.
- **Button `size="compact"`** keeps its touch floor under Tailwind 3 too: `[@media(pointer:coarse)]:` replaces `pointer-coarse:`, which Tailwind 3 dropped.

### Additive

- **`--highlight`** marks matched text. Never a tone family.
- **`Card`** carries `data-slot="card"`. **`Slider`** forwards `aria-valuetext` to its thumbs. `closeLabel` and `scrollLabel` document their English defaults.
- **`DESIGN.md`**: fill and foreground roles, one `h1` per screen, "Containment" and "Card grids" promoted from GlobalVision, and bans 28 to 32 (D-35).
- **Checker**: `fill-as-text` (ban 28), `toolbar-wrap` (ban 30), `press-missing` (ban 16, primitive folders only); `raw-motion` also flags framer-motion literals, `delay-<n>`, `duration-[<n>]` and `--animate-*`; `div-onclick` covers `motion.div`; `em-dash` catches the `\u2014` escape.
- **`tests/e2e/layout-audit.spec.ts`** measures stretched cards, toolbar edges and phone overflow on the reference screens, served at `showcase/examples.html`.

### For GlobalVision

- Retire the workarounds for the toolbar tokens (`components/app-toolbar.tsx`), field rings (`input`, `textarea`, `select`, `input-group`, combobox), `switch.tsx`, `tabs.tsx`, `components/highlight-text.tsx` (use `--highlight`) and the Slider `aria-valuetext` forward. Its shadcn copies pick up the new `--ring` automatically.
- Expect about 180 `fill-as-text` findings, each a contrast failure in one theme, 1 `press-missing` (`toggle-group.tsx`) and 2 new `raw-motion`.

### For `udesignpages`

- Resync `dist/tokens.css`. Four page stylesheets use `color: var(--destructive)` or `color: var(--primary)` (ban 28).

## 2.1.0 (2026-09-26)

CardTitle takes an as prop for its heading level, the showcase shows the v2 type scale and compares v1 snapshots correctly, and line endings are pinned to LF.

## 2.0.0 (2026-09-26)

Two profiles that differ in structure, a merged ban list, a portable checker, static component classes, and reference screens.

Start at `AGENTS.md`: six rules, then the checker. Two profiles that differ in structure, not zoom: `presentation` in `PageCanvas`, `operations` in `AppShell`. A merged, numbered ban list in `DESIGN.md`. A portable checker (`npx udesign-check <paths>`). Static-HTML component classes inside `dist/tokens.css`. Reference screens in `examples/`: one per profile and one static page.

### Pairing

- `udesign-docs` `v0.9.0` pairs with this release. A product pinned below `v2.0.0` stays on `udesign-docs` `v0.8.0` or earlier; move both pins in one change. At `v0.9.0` the design contract no longer carries the ban list or the token vocabulary: they live here.

### Breaking or visible changes

- **Profile names.** `data-design` values are `presentation` and `operations`. `brand` and `functional` still resolve as aliases for this release; update before v3.
- **Type scale shape forks.** `presentation` headings gain contrast against the body, `operations` headings lose it and rank by weight. The scale is emitted as `--text-display`, `--text-h1`, `--text-h2`, `--text-h3`, `--text-body`. `CardTitle`, `DialogTitle`, `SheetTitle` read `--text-h3`: 20px in `presentation` (was 18px), 15px in `operations`. `.ud-display` is 56px in `presentation`, 24px in `operations`. Move hand-sized headings to `--text-*`.
- **Radius.** `operations` corners are 0px, not 2px; pills stay round. Registry components read `--radius*` instead of Tailwind's `rounded-sm/md/lg`, so `presentation` controls that were `rounded-md` move from Tailwind's 6px to the documented 10px. Re-add the components to pick it up. Consumers hard-coding radius should use `--radius-*`.
- **Elevation.** `presentation` cards float on `--shadow-2` (visible: a soft drop shadow on `Card` and `MetricCard`). `operations` resolves `--shadow-1` and `--shadow-2` to `none`.
- **Figures** resolve through `--font-numeric` and `--font-numeric-variant`. `presentation` metric values and ring labels move from JetBrains Mono to proportional Geist; `operations` keeps tabular mono. `TableHead` and `TableCell` gain a `numeric` prop.
- **Padding.** `Card`, `Dialog`, `Sheet`, and `TableCell` vertical padding read `--surface-padding`: 12px in `operations`, unchanged in `presentation`. A single `p-0` now wins completely, so a `p-0 sm:p-0 gap-0` workaround reduces to `p-0`. To get 24px back in `operations`, set `--surface-padding: 24px` on the root.
- **`DESIGN.md` component frontmatter** now matches the registry: `button-secondary` has no border, `button-outline` is a 1px `--border`, buttons use the body face (Geist 500), cards have 16px corners and `--surface-padding`.

### Additive

- **`PageCanvas` and `AppShell`** (registry `page-canvas`, `app-shell`, both in `core`). A screen composed outside its profile's shell does not conform (ban 27), and the checker says so.
- **Static-HTML component classes** in `dist/tokens.css` and `dist/tokens-functional.css`: `ud-btn` (primary, secondary, outline, ghost), `ud-card`, `ud-badge`, `ud-table`, `ud-table-scroll`, `ud-input`, `ud-empty-state`, `ud-pressable`, and the shell classes (`ud-page-canvas`, `ud-page-section`, `ud-app-shell` and its parts). Inert in a React consumer: no registry component uses a `ud-` class name.
- **The checker**, `bin/udesign-check.mjs`. What it flags and what it leaves to reading: `docs/checker-rules.md`.
- **`examples/`** ships in the package.

### Bans

- One numbered list in `DESIGN.md` "Banned design patterns". Bans 1-19 keep their numbers from the contract, so every existing citation still resolves; 20-27 are new.
- Ban 4 is scoped by profile: `presentation` may elevate cards, `operations` keeps shadows for true overlays (ban 21). Bans 1 and 2 lost wording that applied to one consumer only; the banned artifacts are unchanged.

### Documents that moved or changed in `udesign-docs`

- The motion reference moved into this repository as `docs/motion-contract.md`, with eleven values corrected to match `dist/tokens.css`. Code that matched `dist/tokens.css` was always right; code that matched the old document was not.
- `udesign-contract.md` lost about 70 lines of GlobalVision implementation detail. Recover them from the `udesign-docs` `v0.6.0` tag and re-home them in GlobalVision; its contract has a hole until it does.
- GlobalVision's own repin test will report its four documentation pins as changed.

### For `udesignpages`

- Sync `dist/tokens.css` byte-identically over `public/design-system/udesign-tokens.css` and assert identity. Syncing alone is nearly invisible but not a no-op: the layer's `min-height: 44px` reaches every `ud-btn` (38.5px to 44px), and the one `ud-badge` on `patterns.html` gains a 1px border. Then delete the inline `.ud-btn`, `.ud-badge`, card and swatch rules page by page, which removes their raw `100ms ease` transitions. Once deleted, `ud-btn-secondary` loses its hairline border, `ud-btn-outline` goes from a 1.5px ink border to 1px `--border`, and buttons take the body face. Rebuild cards as `ud-card`, clickable cards as `<a class="ud-pressable ud-card">`.
- `public/design-system/patterns.html` is superseded by the component layer; its `.ud-btn` has no pressed state (ban 16).

### For GlobalVision

- Its `components/ui/card.tsx` and `dialog.tsx` are local forks, not the registry versions, so the padding and radius fixes reach it only once it re-adds those components from the registry.
- The compiled token files grew by the component block. Nothing to do.

## 1.5.0 (2026-08-20)

Feedback floor: an open motion duration vocabulary, press and pending states on every interactive primitive, and spinner, skeleton, and pressable in core.

## 1.4.0 (2026-08-17)

Motion token layer, capped intensity scale, data-game gamification scoping, and three motion primitives (progress ring, rolling-consistency chip, moment)

## 1.3.1 (2026-07-18)

Patch registry button/checkbox/switch/dialog upstream bugs and add Slider primitive

## 1.3.0 (2026-07-15)

Expand semantic tokens and add the UDesign source registry.

## 1.2.0 (2026-07-14)

- Added the functional design profile with compact Geist typography, sharper geometry, stronger warm-stone borders, and flat operational surfaces.
- Compiled the brand and functional profiles into the combined token stylesheet and added a functional-only stylesheet.
- Added live brand and functional profile switching to the showcase.
- Updated release snapshots to preserve both combined and functional-only token output.
- Documented the dual-profile architecture, build process, and verification flow.

## 1.1.0 (2026-07-13)

- Added the canonical `DESIGN.md` specification and automated design-rule validation.
- Rebuilt the showcase as a React, Vite, TypeScript, and Tailwind application with interactive page and viewport previews.
- Added impactful and functional layout guidance plus standardized entity-color roles.
- Added release preflight checks, version history previews, and the reusable consumer handoff guide.

## 1.0.0 (2026-07-11)

Initial release. Ported from the udesignpages design system (Studio White + Cream Atelier): brand accent, warm-stone neutral scale, status colors, functional role aliases, Montserrat/JetBrains Mono type scale, radius/space/shadow scales.
