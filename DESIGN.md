---
version: alpha
name: UDesign
description: A semantic design foundation for expressive brand surfaces and dense operational interfaces across light and dark themes.

colors:
  primary: "#c79f6b"
  primary-hover: "#9e7545"
  ink: "#1b1b1b"
  body: "#1b1b1b"
  muted: "#8a8172"
  canvas: "#F4ECe1"
  surface-card: "#ffffff"
  hairline: "#e4ded0"
  destructive: "#b23a2f"
  on-primary: "#1b1b1b"

typography:
  display-lg:
    fontFamily: "Montserrat, sans-serif"
    fontSize: 56px
    fontWeight: 900
    lineHeight: 1
    letterSpacing: -1.4px
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
---

## Purpose

UDesign supports two visual jobs with one semantic contract:

- Public and presentation surfaces need recognizable brand impact.
- Operational tools need clear state and dependable information density, built from structure (a fixed-viewport shell, compact surface padding, a flat type scale) rather than from controls smaller than the 44px touch floor.

Components must describe intent through semantic variables. Primitive values are token implementation details. Applications do not select a primitive because it happens to look correct in one profile.

## Profiles

Pick the profile with one question: **is this screen presented to someone, or operated by someone?**

- `data-design="presentation"`: presented. Marketing, proposals, client portals, and presentation-led screens.
- `data-design="operations"`: operated. Production, scheduling, accounting, and administration.

A screen that is genuinely both is a question for the owner, not a mix.

**Each profile has its own page shell and its own source of hierarchy.** `APPROVED 2026-09-02 D-19, D-20`

- `presentation` draws hierarchy from space and elevation. The screen sits in `PageCanvas`: the page scrolls, each `PageSection` holds a centered column with generous space around it, and cards float on `--shadow-2` over the field. `APPROVED 2026-09-02 D-19`, `APPROVED 2026-09-26 D-27` for the shadow
- `operations` draws hierarchy from structure. The screen sits in `AppShell`: a persistent sidebar, a toolbar, and panes that scroll inside a fixed viewport, butting against each other on hairline borders with square corners and no elevation. `APPROVED 2026-09-02 D-19`
- The type scale forks with them: `presentation` display is 3.5x its body, `operations` display is 1.7x its body and its headings rank by weight. Read sizes from `--text-display`, `--text-h1`, `--text-h2`, `--text-h3` and `--text-body`. `APPROVED 2026-09-26 D-27`
- A screen composed outside its shell does not conform (ban 27). `APPROVED 2026-09-02 D-20`

**Pin once.** One profile per document, declared once on the document root, never nested, never switched at runtime. The only exception is a review or documentation surface whose job is to show both profiles, such as the showcase.

`data-design="brand"` and `data-design="functional"` still resolve, as aliases of `presentation` and `operations`, for one release. Write the new names.

Each profile combines with `data-theme="light"` or `data-theme="dark"`. Presentation and light are the defaults when the attributes are absent.

### Presentation profile

The presentation profile uses Montserrat for strong display moments, a high-contrast type scale, the full radius scale, and cards that float on `--shadow-2`. Its signature is the contrast between a quiet warm field and a compact geometric UDesign lockup.

### Operations profile

The operations profile uses Geist for dense interface typography, a flat type scale, square corners, stronger boundaries, flat surfaces, 12px padding inside cards, dialogs and sheets, and tabular mono figures. Montserrat remains reserved for the UDesign lockup and rare display moments.

### Theme behavior

Theme changes alter semantic color assignments, not component APIs. Dark theme uses solid surfaces with clear separation. Raised, sunken, overlay, and console surfaces remain distinguishable without relying on transparency. A theme may be nested inside another application surface; a profile may not.

Set both attributes before first paint when server rendering. A theme control must expose its current state, update the document attribute, and preserve the user choice according to the host application's preference policy.

## Visual conviction

Every sentence in this section and the next carries its provenance. `CANON` cites the canon line it restates. `APPROVED` carries the date the owner approved an inference, recorded in `docs/v2/DECISIONS.md`.

- UDesign's visual position translates its business one: it "does not position itself as the cheapest option", and its tone is "premium, honest, direct, transparent". `CANON udesign-ground-truth.md:139-142` for the quotes, `APPROVED 2026-09-01 D-11` for reading them as a visual position
- Considered, not decorated: premium shows through restraint and precision, never through ornament. `APPROVED 2026-09-01 D-11`
- Nothing on the screen is there to look impressive; everything is there because it is doing a job. `APPROVED 2026-09-01 D-11`
- Simplicity over minimalism: a dense working screen is correct, and "simple" means legible and direct, not sparse. `APPROVED 2026-09-01 D-11`
- Never cheap, generic, or template-made: a screen never looks like it came out of a template someone else also bought. `APPROVED 2026-09-01 D-11`
- Never provisional, unfinished, or uncertain: nothing floating, nothing thin, no dead controls, and no state that leaves you unsure the click registered. `APPROVED 2026-09-01 D-11`
- The accent is called the accent in docs, code, class names, and interface copy, never by a colour name. `APPROVED 2026-09-01 D-13`
- The visual tells of machine-generated UI are refused outright; they are bans 5, 6, 25, and 26 in "Banned design patterns". `APPROVED 2026-09-01 D-10`

## Voice in the interface

Interface copy follows `udesign-ground-truth.md` §5 verbatim; the lines below point at it and add nothing. `CANON udesign-ground-truth.md:142-147`

- Tone: premium, honest, direct, transparent, with results over promises. `CANON udesign-ground-truth.md:142`
- The brand name is always "UDesign". `CANON udesign-ground-truth.md:143`
- Customer-facing copy uses no corporate jargon, such as "B2B", "MOQ", or "digitizing raster matrix". `CANON udesign-ground-truth.md:144-145`
- Copy has no AI clichés and no AI-sounding phrasing, including em-dashes. `CANON udesign-ground-truth.md:145-146`
- Copy makes no false claims, such as same-day turnaround, free digitizing on a one-piece order, or price matching. `CANON udesign-ground-truth.md:146-147`

## Semantic color system

### Core roles

Use `--background`, `--foreground`, `--card`, `--card-foreground`, `--primary`, `--primary-foreground`, `--primary-hover`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--border-color`, `--border-strong`, `--ring`, `--destructive`, and `--client` for their named purposes.

The accent is not safe as small text merely because it is a brand color. Filled primary controls pair `--primary` with `--primary-foreground`. Links and text must use a semantic foreground whose contrast has been verified against the actual surface.

### Tone roles

Neutral, info, success, warning, danger, progress, and brand tones each provide:

- `foreground` for text and icons on neutral application surfaces.
- `surface` for a low-emphasis status region.
- `border` for status boundaries.
- `solid` for high-emphasis fills.
- `solid-foreground` for content placed on the solid fill.

The canonical shape is `--tone-{name}-{role}`. Use the full family rather than mixing a surface from one tone with text from another. Tones are for statuses only; a category that is not a status uses an entity family.

Success confirms completion or a healthy condition. Warning identifies a condition that needs attention. Danger identifies failure, destructive action, or an urgent block. Info provides neutral guidance. Progress communicates active work. Brand identifies UDesign or a selected branded action. Neutral covers passive state.

### Metric roles

Metrics describe direction, not general status. Positive, negative, and neutral metric families each expose `foreground`, `surface`, and `border` roles. A directional delta uses a metric family, never `--tone-success-*` or `--tone-danger-*`.

- Positive means movement in the desired direction.
- Negative means movement away from the desired direction.
- Neutral means unchanged, unknown, or not directionally judged.

Always pair the tone with a signed value, arrow, word, or other non-color cue.

### Data visualization roles

Charts use `--data-1` through `--data-8`. Supporting roles are `--data-muted`, `--data-grid`, `--data-axis`, `--data-tooltip`, and `--data-tooltip-foreground`.

Series order must remain stable within one chart. Do not attach permanent business meaning to a numbered data role. Use direct labels where space allows. Legends, tooltips, and values must make the chart understandable without color perception.

### Entity roles

Entity families `--entity-1-*` through `--entity-4-*` provide `foreground`, `surface`, `border`, and `solid` roles. They distinguish recurring record types such as clients, contacts, orders, or jobs.

An application owns the mapping between a business entity and a numbered family. Keep that mapping stable inside the application and document it near the consuming feature.

### Surface roles

Use `--surface-raised`, `--surface-sunken`, `--surface-overlay`, and `--surface-console` with their matching foreground roles.

- Raised surfaces contain grouped content above the page floor.
- Sunken surfaces contain wells, tracks, and recessed regions.
- Overlay surfaces contain dialogs, menus, and popovers.
- Console surfaces contain preview tools and technical workspaces.

`--backdrop` is the theme-stable scrim base behind dialogs and sheets. Apply opacity to the dedicated overlay element. Do not derive a scrim from `--foreground`, which becomes light in dark themes.

Profile and theme determine the visual treatment. Component code selects only the intent.

## Interaction states

Use `--interactive-hover`, `--interactive-pressed`, `--interactive-selected`, `--interactive-selected-foreground`, `--interactive-selected-border`, `--interactive-focus`, `--interactive-disabled`, and `--interactive-disabled-foreground`.

Hover is supplemental. Every action must also work by keyboard and touch. Selected state needs more than a subtle color shift. Use a clear boundary, marker, or text state. Pressed state should be immediate and should not move surrounding layout.

Focus indicators must remain visible in every profile and theme. Use at least a 2px outline with separation from the component edge when the surrounding colors could merge. Do not remove the browser outline without supplying an equivalent `:focus-visible` treatment.

Disabled controls use the disabled surface and foreground roles, preserve readable labels, and expose native `disabled` or `aria-disabled` semantics. Opacity alone is not a complete disabled treatment.

## Contrast and accessibility

Target WCAG 2.2 AA:

- Normal text needs at least 4.5:1 contrast.
- Large text and meaningful interface boundaries need at least 3:1.
- Focus indicators need at least 3:1 against adjacent colors.
- Status, metrics, entities, and charts need a non-color cue.

Contrast belongs to a foreground and background pair. Do not label one color universally accessible. The darkened accent can support large text and interface boundaries on some light surfaces, but it is not automatically valid for small text in every context.

Controls require accessible names. Form fields require programmatic labels and clear error relationships. Dialogs require a title, description when helpful, focus containment, Escape behavior, and focus restoration. Tables require useful headers and should include a caption when surrounding context does not name the dataset.

Respect `prefers-reduced-motion`. Animation may clarify a transition or progress state, but must not be the only indication that state changed.

## Typography

Montserrat carries the UDesign lockup, display headings, and high-value calls to action in the presentation profile. Geist carries interface text and dense operations layouts. JetBrains Mono is limited to codes, identifiers, timestamps, and aligned numeric readouts.

Figures go through one pair of roles, `--font-numeric` and `--font-numeric-variant`: `operations` renders them in JetBrains Mono with tabular figures so columns align, `presentation` keeps them proportional in Geist. In the registry, mark a column of figures with `TableHead numeric` and `TableCell numeric`. `APPROVED 2026-09-02 D-19`

Labels use sentence case with normal tracking. Do not turn metadata, navigation, or field labels into wide-tracked uppercase mono text. Body copy uses the semantic foreground. Muted foreground is for secondary information only after its contrast has been verified on the selected surface.

Display type may scale fluidly. Controls and body text must remain readable without horizontal zoom at 375px.

## Layout and responsive behavior

Use the shared spacing roles for component rhythm. The space scale and control height are the same in both profiles; the shells and one padding role make the difference. `PageSection` separates presentation blocks generously. In operations, `AppShell` panes butt against each other and `--surface-padding` sets 12px inside `Card`, `Dialog` and `Sheet`, while every control keeps the 44px touch floor. `APPROVED 2026-09-25 D-22`, `APPROVED 2026-09-26 D-27`

The responsive contract includes:

- `--touch-target-min`
- `--control-height`
- `--control-height-compact`
- `--content-gutter-mobile`
- `--dialog-inline-size-mobile`
- `--dialog-block-size-max`
- `--safe-area-bottom`
- `--surface-padding` (set by `operations` only; unset, `Card` pads 24px and `Dialog`/`Sheet` 16px on phones, 24px from `sm`)

Interactive controls need a minimum inline and block target of `--touch-target-min`. Compact controls can reduce their visible field height while preserving the touch area around the trigger.

At narrow widths:

- Multi-column forms collapse to one column.
- Dense tables switch to a card collection or use deliberate horizontal scrolling with useful sticky context.
- Dialogs use the mobile inline-size and maximum block-size roles.
- Bottom actions include the safe-area inset.
- Primary actions remain reachable without covering required content.

Full-height mobile layouts use small viewport units. Validate at 375px, not only at a desktop browser narrowed by eye.

## Elevation

Presentation cards float on `--shadow-2` and overlays use `--shadow-3`. Operations content stays flat: its `--shadow-1` and `--shadow-2` resolve to `none`, and only true overlays take `--shadow-3` (ban 21).

Shadows do not replace boundaries or focus treatment. Dark theme overlays must remain distinguishable from both the page floor and raised cards.

## Motion

Duration and easing are semantic roles, selected by intent, the same way every other token family here is. Component code selects the intent, never a millisecond value or a curve.

| Intent | Duration | Use |
| --- | --- | --- |
| `instant` | 70ms | Press compression, toggle flip |
| `fast` | 150ms | Hover, focus, in-place swap, small state change |
| `standard` | 250ms | Panels, dialogs, list enter and exit, tab change |
| `emphasis` | 280ms | Intensity-2 reaction inside the acting component |
| `slow` | 350ms | Route transition, shared-element morph. **The interaction ceiling.** |
| `ambient` | 1200ms | One period of a continuous loop (shimmer, pulse). Not an interaction duration. |

Easing: `standard` (ease-out, the default), `enter` (decelerate, for arrivals), `exit` (accelerate, for departures), `emphasis` (a small settle-in overshoot, intensity 2 only - never an exit, never a layout-bounded element). `fast` remains published as a compatibility alias of `standard`.

Also published: `--motion-delay-indicator` (hold before revealing a pending indicator, so a quick operation never flashes a spinner), `--motion-loop-spin` (one rotation of a busy indicator), and `--motion-press-scale` / `--motion-press-scale-subtle` (the pressed-control transform, at bare `:root` - press feedback is a floor for every application, not a gamification opt-in).

**The duration vocabulary is open; the reaction magnitude is capped.** These are two axes. A component that needs an intent the system does not publish is how a system ends up with 22 of 24 components hardcoding their own values, so a genuinely needed intent is added here. Magnitude is a separate question and does not move: **0 the minimum in-control reaction, 1 routine feedback, 2 a closed loop. Intensity 3 does not exist and is not reachable through any combination of published tokens** - no screen-level celebration, no overlay, no particle burst. `--moment-intensity-1-scale` and `--moment-intensity-2-scale` compile only inside `[data-game="on"]` (see `data-game` below); nothing larger is published. Level 0 is the *smallest* reaction, never the absence of one - a control that changes nothing on press is a defect at every level.

**Intensity is identical in the presentation and operations profiles.** The operations profile is not a quieter variant because it is "for work," and the presentation profile is not a louder variant because it is presentational - both render the same reaction. The build enforces this structurally: the compiled motion values are read from one source tree only, with no per-profile override path to diverge through.

`prefers-reduced-motion: reduce` is baked into the compiled token layer itself - `--motion-duration-*` and `--motion-loop-*` collapse to `0ms`, `--motion-press-scale*` and `--moment-intensity-*-scale` collapse to `1` automatically, so a consuming component gets correct behavior by default without writing its own media query. Two things deliberately do **not** collapse: `--motion-delay-indicator`, which suppresses a spinner flash rather than moving anything, and every interaction colour including `--interactive-pressed` - reduced motion removes the movement, not the feedback. A control still darkens on press, still shows its focus ring, and still reports `aria-busy`. Motion is still never the only indicator of a state change: a component using these tokens for its sole signal of "something changed" is incomplete regardless of the reduced-motion question.

### `data-game`

`data-game="on"` is a build-time attribute declared once at the document root, alongside `data-design`. It is not a user preference - no setting, cookie, or runtime code may read or write it as state. Gamification tokens and the three motion primitives below are inert without it: their custom properties simply do not exist outside a `[data-game="on"]` selector, so an application that never declares the attribute gets the non-gamified fallback through plain CSS cascade, not a runtime check.

### Motion primitives

Three generic, domain-flavorless primitives ship in the registry:

- **Progress ring** (`progress-ring`) - truthful completion of a bounded set. Always renders the real numbers as text; never color or arc angle alone. Not gated behind `data-game` - it is broadly useful, not gamification-exclusive.
- **Rolling-consistency chip** (`rolling-consistency-chip`) - "4 of the last 7." Composes `Badge` with a tone that never varies with the count. Not a streak: no chain, no repair/grace/freeze mechanic, no fire icon.
- **Moment** (`moment`) - wraps `children` and applies a bounded `transform`/`opacity` reaction at the given `intensity` (1 or 2) when `active` becomes true. Renders no icon or text of its own - the caller's `children` carries the actual state change, which is what still communicates closure when the animation is removed under reduced motion. No portal, no fixed positioning, no overlay, no sound, no haptics. Gated behind `data-game="on"`; not part of the `core` bundle.

## Emphasis and hierarchy

Emphasis is a budget, counted in accent-filled controls. In the registry an accent-filled control is `Button` with `variant="default"`, which is also what a `Button` with no variant renders. Elsewhere it is any control filled with `--primary`.

- One accent-filled control per screen: not per card, not per section. A modal or side panel gets its own one. `CANON research §7.7 A, D-09`
- A repeated element never carries the accent: a control that appears once per row, card, or list item is `secondary` or `ghost`, however important it feels in isolation. `CANON research §7.7 A, D-09`
- `presentation` may spend one accent-filled control per viewport. `APPROVED 2026-09-01 D-09`
- In `operations` the accent never appears in chrome, navigation, or any repeated block. It marks the one action that commits work. `APPROVED 2026-09-01 D-09`
- Emphasis and density are separate axes: a busy `operations` screen with many controls is correct, its controls are low emphasis, and it still spends one accent. `APPROVED 2026-09-01 D-11`

The test: count the accent-filled controls in one viewport. More than the budget means the hierarchy is wrong, not that the screen is important.

## Components

**`button-primary`** (registry `Button`, `variant="default"`) uses `{colors.primary}` with `{colors.on-primary}`. **Use when** it is the single most important action on the screen; never in a repeated element. It meets the shared control height and touch-target contract, exposes visible focus, and uses the interactive hover, pressed, and disabled roles.

**`button-secondary`** (`variant="secondary"`) uses `{colors.canvas}` with `{colors.ink}` and a `{colors.hairline}` boundary. **Use when** the action sits inside a card, row, or list item, or is the negative half of a pair. Runtime components consume the matching semantic roles so the treatment adapts to theme and profile.

**`button-outline`** (`variant="outline"`) uses a transparent surface, `{colors.ink}` foreground, and a clear outline. **Use when** a standalone action must not compete with the screen's primary. Its hover state uses semantic interaction roles rather than a raw inverse color.

The registry `Button` has three more variants. `ghost`: **use when** several controls sit together, as in dense toolbars and table row actions. `destructive`: **use when** the action deletes something or cannot be undone. `link`: **use when** the action is navigation that reads as text.

**`header-lockup`** keeps the compact UDesign mark and Montserrat weight. It is the main signature element, so surrounding navigation remains visually restrained.

**`status-badge`** uses one complete tone family and includes a readable label. A dot or icon may reinforce meaning, but the label carries the state.

**`confidential-footer`** uses `{colors.canvas}`, `{colors.muted}`, and a `{colors.hairline}` top boundary. Its label remains sentence case and should only use the destructive role when the content represents a real warning.

**`card`** uses `{colors.surface-card}`, a `{colors.hairline}` boundary, and `{rounded.md}`. Runtime components use raised or card semantic roles so dark themes and the operations profile can adapt it.

### Feedback primitives

Three primitives carry the feedback floor. They are part of `core`: an application cannot meet the feedback model in [`udesign-contract.md` "Feedback"](https://github.com/7KMANN/udesign-docs/blob/v0.9.0/standards/design/udesign-contract.md) (owned by `udesign-docs`, version-independent) without them, so they are not optional extras.

- **Spinner** (`spinner`) - a busy indicator for an action in flight. Under reduced motion it stops turning and stays visible, because the state has to survive the animation being removed.
- **Skeleton** (`skeleton`) - a loading placeholder, sized to the content it replaces. A fallback of a different height causes a jump on arrival, which reads worse than the pause it replaced.
- **Pressable** (`pressable`) - a clickable card, row, or list item. Renders a real button, so Enter, Space, focus, and the accessible name come from the platform instead of from a div with an `onClick`. Uses the subtle press scale; the control scale reads as a layout bug across a full-width surface.

`Button` carries the same floor directly: `pending` disables it, reports `aria-busy`, and swaps in a spinner while preserving its width. Every interactive primitive here has a pressed state - a control that changes nothing on press is the single most common failure in machine-written UI.

## Registry components

The source registry includes these base components: button, badge, alert, card, input, textarea, select, checkbox, switch, slider, field, dialog, sheet, tooltip, tabs, table, spinner, skeleton, and pressable.

The application patterns are icon-button, status-badge, metric-card, empty-state, and responsive-collection. The page shells are page-canvas (`presentation`) and app-shell (`operations`). The `core` registry item installs the recommended set, shells included.

The motion primitives - progress-ring, rolling-consistency-chip, and moment - are deliberately excluded from `core`. See "Motion primitives" above; `moment` in particular is gamification-exclusive and should only land in a repository that has declared `data-game="on"`.

Registry components must:

- Consume semantic variables only.
- Forward refs where the underlying element supports a ref.
- Preserve `className` extension and useful data attributes.
- Support keyboard operation and visible focus.
- Keep interactive client boundaries local to the component that needs them.
- Use native semantics before adding ARIA.
- Keep touch targets and mobile layout behavior in the source component.

Generated registry JSON is not an authoring surface.

## Showcase acceptance

The showcase must demonstrate:

- Light and dark themes in both design profiles.
- Every tone family in surface and solid treatments.
- Positive, negative, and neutral metrics.
- Eight chart series with readable labels and semantic tooltip treatment.
- Four entity families.
- Hover, pressed, selected, focus, and disabled states.
- Responsive collections, mobile dialogs, and minimum touch targets.
- Empty, loading, error, and populated examples where relevant.
- Motion intensity 1 and 2, in both design profiles and both themes, plus the reduced-motion rendering.

The historical version selector may show a reduced matrix for releases that predate a semantic role. Current unreleased output must cover the complete matrix.

## Banned design patterns

This is the one numbered list. Bans 1-19 keep the numbers they carried in `udesign-docs/standards/design/udesign-contract.md`, so a citation of "ban N" from before v2.0.0 still resolves. New bans append after the last number and never move. An audit cites each finding by its number.

### From the contract (1-19)

1. `var(--ud-*)` anywhere in consumer source (for example `app/`, `components/`, `lib/`).
2. Raw Tailwind palette utilities (`bg-slate-*`, `text-red-500`, `border-zinc-*`, any `{property}-{palette}-{number}`).
3. Color literals (`#hex`, `oklch()`, `rgb()`, `hsl()`) in app code. Allowed only for genuinely intentional data (map markers, user-picked swatches, product imagery) and must carry a `design-ok: <reason>` comment on or above the line.
4. Raw shadow utilities (`shadow-sm` .. `shadow-2xl`, `drop-shadow-*`). Use `--shadow-1/2/3`: in `operations` for true overlays only (ban 21); `presentation` may also elevate cards.
5. `backdrop-blur` / glassmorphism / frosted translucent panels. Solid semantic surfaces only.
6. Gradient-clipped text (`bg-clip-text`) and decorative gradients used for hierarchy.
7. `uppercase` combined with wide tracking.
8. `vh`, `dvh`, `h-screen` for layout heights. Use `svh`.
9. Native `<select>`, checkbox, radio, range controls outside `components/ui`.
10. Cool slate/zinc/gray neutrals in any form. UDesign neutrals are warm stone; they come from semantic roles, never restated locally.
11. Color-only communication of status, metric, entity, or chart meaning.
12. Pill-shaping every container. `rounded-full` is for genuine pills (badges, avatars, dots), not cards or inputs.
13. Icon-only interactive controls without an accessible name.
14. Em-dashes in UI copy and docs: use hyphens or colons.
15. An async control with no pending state. A control that awaits and shows nothing until the promise settles is banned regardless of correctness.
16. An interactive element with no pressed state. `:hover` is not a substitute: it does not exist on touch and does not fire for keyboard activation.
17. Internal navigation through a raw `<a href>`. Use the framework's link primitive, so the client-side transition, prefetch, and loading state can run at all.
18. `<Suspense fallback={null}>`, and any other fallback that renders nothing. A boundary that falls back to nothing is a boundary that communicates nothing.
19. A hardcoded duration or easing value in application code (`duration-200`, `300ms`, `ease-out`, a literal cubic-bezier). Duration and easing come from motion roles.

### Added in v2.0.0

20. Tiny interactive targets hidden inside visually compact controls. A control may look shorter than 44px; the hit area behind it may not (see the responsive contract's `--touch-target-min`).
21. A shadow, raw or semantic, on an ordinary content card in the operations profile. `--shadow-1/2/3` stay reserved for true overlays (dialogs, menus, popovers) there.
22. Screen-level celebration: full-viewport overlays, particle bursts, confetti, or any reaction beyond intensity 2.
23. Motion as the sole indicator that a state changed. The non-motion signal (state, text, or icon) must exist independent of the animation.
24. Intensity that varies between the presentation and operations profiles.

### Visual tells of machine-generated UI `APPROVED 2026-09-01 D-10`

25. Generic sans-serif paired with cool slate neutrals and a decorative gradient, used together as a default aesthetic.
26. Uniform emphasis: more accent-filled controls than "Emphasis and hierarchy" allows, so no single action reads as the primary one.

### Added with the page shells `APPROVED 2026-09-02 D-20`

27. A screen outside its profile's shell: an `operations` screen not composed in `AppShell`, or a `presentation` screen composed in `AppShell`.

## Known limits

- Registry components are source-owned after installation. Consumers are responsible for merging later updates.
- Automated contrast, interaction, and visual regression coverage must continue to expand alongside the registry.
- Product-specific maps, editors, charts, and domain workflows remain in their applications.
