# Changelog

## 3.3.0 (2026-10-26)

Boutique's appearance findings ship: fluid page titles, a badge that wraps, a choice group, spacing on the roles with a checker rule, a header, a contact footer and a compact section edge for presentation pages, one gallery for React and static pages, a description list, a skeleton inside a button, and an Alert that announces only when asked.

Decisions and measurements: `docs/v2/DECISIONS.md` round 19 (D-46 to D-58), from Boutique's appearance findings, two items its builder added, and Kaleb's compact section edge. Every rule they add to `DESIGN.md` carries `NEEDS-APPROVAL` until Kaleb answers.

### Visible on upgrade

- **`Alert` is not a live region by default** (proposed; Kaleb decides the default with D-48). It rendered `role="status"`, so every banner shown with the page was announced. An alert whose appearance is the news passes `live` (`role="status"`) or `live="assertive"` (`role="alert"`); an explicit `role` still wins. Remove the `role="presentation"` that only kept an alert quiet. Re-add `alert` to pick it up (D-48).
- **Page titles follow the screen.** `.ud-display` and `.ud-h1` read `--text-display-fluid` and `--text-h1-fluid`: in `presentation`, 40px and 28px on a phone, 56px and 40px from 800px; `operations` does not move. A presentation page that uses either class without a size of its own gets the smaller title below 800px. To hold one title at its fixed size, set the role on the element: `[--text-h1-fluid:var(--text-h1)]` (D-46).
- **Headers space on the roles.** `DialogHeader`, `SheetHeader` and `CardHeader` put 8px between a title and its description (was 6px); a dialog's description still starts 4px under the close icon. Re-add `dialog`, `sheet` and `card` (D-50).
- **`udesign-check` flags spacing off the roles (`spacing-role`, ban 33).** A gap, a stack or a margin between the roles is a finding: 20px, 48px, a stack spaced 2px or 6px. Padding, an icon beside its label, an icon's nudge, a negative margin, `var()` and the primitive folders are left alone (D-50).
- **An item that uses another takes it from your `@udesign` namespace.** `button`, `alert`, `icon-button`, `status-badge`, `metric-card` and `rolling-consistency-chip` named it by a URL pinned to v1.3.0, v1.3.1 or v1.5.0, so adding `alert` over a current `badge` put the v1.3.0 badge back (no `wrap`), and `icon-button` the v1.3.0 button (no `pending`, no spinner). They now name `@udesign/<name>`, the release `components.json` points at. Without that namespace, adding one of them stops before it writes a file; `core` and the items that use no other still install from their URL. Boutique and GlobalVision both set it.
- **`press-missing`** reads a primitive that wears `ud-btn`, `ud-pressable` or `ud-gallery-thumb`, the static classes of `dist/tokens.css` with a press of their own, as pressed. Any other `ud-` class lends none.
- **`dist/tokens.css` grows** by the gallery skin, `ud-page-header`, `ud-contact-footer`, the compact section edges, `ud-description-list`, and `ChoiceGroup`'s container queries: inert until used.
- **The reference screens.** The presentation one opens with `PageHeader` and one action (it had three navigation links), meets its first band at a compact edge, announces the proof's approval in a status after the action row, and ends with `ContactFooter`; the operations one renders no count for a section with none; the static one uses `ud-page-header` and `ud-contact-footer`.

### Additive

- **`choice-group`**, in `core`: one choice shown as buttons, for sizes, options and colour swatches (`variant="swatch"`). One Tab stop, arrow keys that move, choose and stop at the group, a choice that cannot be had saying so in words, a note under the group tied by `aria-describedby`, and explicit columns by container query: one row when every choice gets 4rem, otherwise rows of one count, the last at most one shorter, never one alone (D-49).
- **`gallery`**, installed on its own (it adds `swiper@14.3.0`), and **`dist/ud-gallery.js`** for pages without React: one gallery, one skin (`ud-gallery` in the tokens) and one behaviour (`gallery-core.ts`). It keeps UDesign Pages' `ud-gallery.js` markup and API byte for byte. The arrow keys move only the gallery in focus or under the pointer, and Page Up and Page Down scroll the page (D-54, D-55).
- **`PageHeader`** and **`ContactFooter`**, in `page-canvas`, with `ud-page-header` and `ud-contact-footer`: the lockup and at most one action in one row a touch target high, and the public contact the page supplies (D-52, D-53).
- **`PageSection compact="top" | "bottom" | "both"`**, with `ud-page-section-compact-top` and `-bottom`: a short head and its first band meet at `--space-8` each, 64px at every width instead of 129px on a desktop (D-56).
- **`description-list`**, in `core`, with `ud-description-list`: labels beside their values, as UDesign Pages sets its specifications (D-57).
- **`Badge wrap`**, for a long label in a narrow container; one line stays the default (D-47). **`Skeleton asChild`**, for a placeholder where only phrasing content may go, such as a price inside a `Pressable` (D-58).
- **`DESIGN.md`**: the fluid title roles, a badge that wraps, choosing one of a few, the spacing roles and ban 33, nothing empty takes room (D-51), the page header and contact footer, compact section edges, showing photos, listing specifications, and the alert's live region.
- **Tests.** The fluid roles in every block and helper; the badge, alert, skeleton and description list in jsdom with the real utilities where it matters; `ChoiceGroup`'s column rule for every count to 16 in every range, its keys, note and swatches; the checker's new rule and its calibration cases; the gallery's build, markup parity, API and key routing; the clean install of the gallery; and in Chromium: the titles, the badge in a narrow card, choice-group rows, both gallery builds (keys, Page Down, copies and alt text, centred arrows whichever stylesheet loads last, motion, no layout shift, a drag), the description list, the header, footer and compact edge, and a nothing-empty audit of the reference screens.

### For Boutique

Each item replaces a bridge; move to v3.3.0, re-add the changed registry components (`alert`, `badge`, `card`, `dialog`, `sheet`, `skeleton`, `page-canvas`) and add the new ones (`choice-group`, `description-list`, `gallery`).

- Titles: drop `DISPLAY_SIZE` (`Frame.tsx`) and `NAME_SIZE` (`ItemView.tsx`); the opening skeleton can read `h-[var(--text-display-fluid)]`.
- Badge: replace `BADGE_WRAPS` (`src/app/lib/badge.ts`) with `<Badge wrap>`.
- Choices: replace `choiceClass` and `radioKeys` (`SizePicker.tsx`), the column part of `sizes.ts` (`FITS`, `sizeColumns`, `sizeColumnVars`) and `choices.css` with `ChoiceGroup`, passing `sizeNote(...)` as its `note`; `ColourPicker` becomes `variant="swatch"`. `sizeNote` and `surchargeOf` stay: they are Boutique's data.
- Spacing: B6 drops its dialog-header exemption; `udesign-check` now reports seven spacing findings on its operations screens (`KitGrid.tsx`, `ShopList.tsx`, `BoutiqueList.tsx`, `Blocks.tsx`, `Organizers.tsx`).
- Header and footer: `Header` and `Footer` in `Frame.tsx` become `PageHeader` (the lockup as children, "Ce n’est pas vous ?" as `action`) and `ContactFooter` fed by `contact.ts`.
- Compact edge: drop the local padding override between the head and the items band; `compact="bottom"` on the head (beside `FIRST_SECTION`) and `compact="top"` on the band.
- Gallery: drop `src/app/styles/ud-gallery.css`, its import, `tests/unit/gallery-copy.test.ts` with `scripts/lib/gallery-copy.ts`, and the Swiper code in `Gallery.tsx` (`SwipeGallery`, `speed`, `a11y`, the `keyboard` prop and `pageUpDown: false`); `Gallery.tsx` maps its slides onto the registry `Gallery`. Keep `@import "swiper/css/bundle"`.
- Alerts: drop `role="presentation"` on its 22 alerts; add `live` to `JoinForm.tsx`'s closed or unreachable notice, the one alert that relied on the old default.
- Specifications: `SpecsList`'s `dl` becomes `DescriptionList`.
- Price placeholder: the tile's `<Skeleton className="h-5 w-16" />`, a div inside a button, becomes `<Skeleton asChild><span className="inline-block h-5 w-16" /></Skeleton>`.
- Its appearance standard's rules marked "To move to DESIGN.md" (2, 6, 7, 10, 11 and 21) become pointers to `DESIGN.md`, and rule 16 points at the design system's gallery instead of UDesign Pages' README.

### For GlobalVision

- It pins v3.1.2, so nothing changes until it moves. Then `udesign-check` reports 142 `spacing-role` findings in `app`, `components`, `lib` and `hooks`, its only findings: 126 stacks spaced 2px or 6px and 16 gaps from 10px to 80px (`docs/checker-rules.md` has the breakdown; D-50 leaves the 2px and 6px stacks open for Kaleb). Its `alert.tsx` is a local fork that defaults to `role="alert"`, and 33 of its 58 alerts rely on that default, 15 of them danger alerts shown on a failure. Before it re-adds `alert` or `core`, which replace the fork, it passes `live="assertive"` on those 33 (every `<Alert` with no `role` in `app`, `components`, `lib` and `hooks`), or they stop being announced and nothing fails. Kaleb decides the default with D-48. `operations` titles do not move.

### For `udesignpages`

- Sync `dist/tokens.css` (and `tokens-functional.css`) into a new `public/design-system/v3.3.0/`. Its 1,500 or so product pages whose `.ud-h1` has no size of its own get the fluid title on phones; the 44 pages that set the clamp by hand see no change and can drop it.
- The gallery: copy `dist/ud-gallery.js` beside the tokens, drop the `ud-gallery.css` link (the skin is in the tokens) and point the script at the copy in `scrapers/shared/ud_gallery.py` `head()`, then regenerate. Keep `swiper-14.3.0/`. The markup does not change: `ud_gallery.gallery()` and `udGallery.markup()` already write what the new file reads.
- Optional, by hand: `ud-page-header`, `ud-contact-footer` and `ud-description-list` replace the header, footer and `.specs` CSS its generators write.

## 3.2.0 (2026-10-26)

Boutique's registry findings ship: a native select for long lists, dense grids and phones, dialogs and sheets that hold or drop their close button, a pending button that keeps its name, a press that eases under Tailwind 4, and a shell that keeps its toolbar height on a short phone page.

Decisions and measurements: `docs/v2/DECISIONS.md` round 18 (D-38 to D-45), from Boutique's registry findings (issue #1). Every rule they add to `DESIGN.md` carries `NEEDS-APPROVAL` until Kaleb answers.

### Visible changes

- **The press eases under Tailwind 4.** The nine press-scaled controls transitioned `transform` only, and Tailwind 4 compiles `scale-*` to the separate `scale` property, so the press jumped. They transition both now; re-add `button`, `checkbox`, `dialog`, `pressable`, `select`, `sheet`, `slider`, `switch` and `tabs` to pick it up (D-38).
- **A pending `Button` keeps its accessible name.** The label turns transparent instead of `visibility: hidden`, so it still holds the width and is still read. Remove any `aria-label` added only to name a pending button (D-39).
- **Dialog and sheet headers.** The close button's room moves from `DialogHeader` and `SheetHeader` to `DialogTitle` and `SheetTitle`, so the description and a block placed in it run out to the footer's edge. In `operations` a one-line title row is 9px taller, so the description starts below the button's icon (D-41).
- **`AppShell` below `md`.** The rows are `auto minmax(0, 1fr)` at every width, in `AppShell` and in `ud-app-shell`, so a short phone page no longer stretches the toolbar. Remove a `max-md:grid-rows-[auto_minmax(0,1fr)]` override (D-42).
- **Fields.** `SelectTrigger` answers hover with `--interactive-hover`. `Input`, `Textarea`, `SelectTrigger` and `NativeSelect` draw their border in `--tone-danger-foreground` under `aria-invalid="true"`, so a field already marked invalid now shows it (D-44).

### Additive

- **`native-select`**, in `core`: the platform's own select, dressed as `SelectTrigger`, for long lists, dense grids of many selects and phones. It changes nothing on `<body>` when it opens. `DESIGN.md` "Choosing a select" says when to use it over `Select` (D-43).
- **`closeDisabled` and `hideClose`** on `DialogContent` and `SheetContent`. Escape and a press outside still call `onOpenChange(false)`: the caller decides there (D-40).
- **`dist/tokens.css` registers `--removed-body-scroll-bar-size`** as a property that does not inherit, from the new source `css/registry.css`. A `Select` choice costs one full-page style pass less, three down to two (measured on a 4,146-element page); `Dialog` and `Sheet` share the same scroll lock. Read the property on `<body>` only; below it, it is now `0px` (D-45).
- **Tests.** A press-scale check over the registry, the examples and the static classes; the pending button's name asserted with the real utilities applied in jsdom and in Chromium; the held dialog, the title row's geometry and the native select's untouched `<body>` measured in the showcase; both shells measured on a short phone page; the invalid border's contrast on every field surface.

### For Boutique

- Remove the `aria-label` that only repeats a pending button's label, the DOM guard on the dialog's close button (`HeldDialog.tsx`, `SendDialog.tsx`: pass `closeDisabled={busy}`), the `AppShell` row override in `Shell.tsx`, and its own `@property` rule in `operations.css`.
- Re-add the registry components for the press transition. Its own `Gallery.tsx`, `KitProduct.tsx`, `pickers.tsx` and `SizePicker.tsx` press with a scale and transition `transform` only: add `scale` to each list.

### For GlobalVision

- It pins this package by tag, so nothing changes until it moves to v3.2.0. Its shadcn copies of `select`, `input` and `textarea` pick up the hover and invalid states only when re-added.

## 3.1.2 (2026-09-29)

The checker reads a primitive that renders through a sibling's variants helper as having that helper's press.

## 3.1.1 (2026-09-29)

The checker no longer flags linear in an infinite animation: a continuous loop has no other correct curve.

## 3.1.0 (2026-09-29)

Accent text and icons get their own role, --primary-text: the accent's darker shade in light themes and its lighter shade in dark. The checker names the replacement for every fill used as text.

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
