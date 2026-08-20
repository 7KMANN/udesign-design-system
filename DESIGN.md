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
    fontSize: 48px
    fontWeight: 900
    lineHeight: 1.05
    letterSpacing: -1px
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
- Operational tools need compact controls, clear state, and dependable information density.

Components must describe intent through semantic variables. Primitive values are token implementation details. Applications do not select a primitive because it happens to look correct in one profile.

## Profile matrix

Two independent attributes create four supported combinations:

- `data-design="brand"` with `data-theme="light"`
- `data-design="brand"` with `data-theme="dark"`
- `data-design="functional"` with `data-theme="light"`
- `data-design="functional"` with `data-theme="dark"`

Brand and light are the defaults when attributes are absent.

### Brand profile

The brand profile uses Montserrat for strong display moments, generous section spacing, the full radius scale, and restrained overlay elevation. It suits marketing, proposals, client portals, and presentation-led screens. Its signature is the contrast between a quiet warm field and a compact geometric UDesign lockup.

### Functional profile

The functional profile uses Geist for dense interface typography, tighter spacing, smaller radii, stronger boundaries, and flat operational surfaces. Montserrat remains reserved for the UDesign lockup and rare display moments. It suits production, scheduling, accounting, and administration.

### Theme behavior

Theme changes alter semantic color assignments, not component APIs. Dark theme uses solid surfaces with clear separation. Raised, sunken, overlay, and console surfaces remain distinguishable without relying on transparency. Components must work when a profile or theme is nested inside another application surface.

Set both attributes before first paint when server rendering. A theme control must expose its current state, update the document attribute, and preserve the user choice according to the host application's preference policy.

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

The canonical shape is `--tone-{name}-{role}`. Use the full family rather than mixing a surface from one tone with text from another.

Success confirms completion or a healthy condition. Warning identifies a condition that needs attention. Danger identifies failure, destructive action, or an urgent block. Info provides neutral guidance. Progress communicates active work. Brand identifies UDesign or a selected branded action. Neutral covers passive state.

### Metric roles

Metrics describe direction, not general status. Positive, negative, and neutral metric families each expose `foreground`, `surface`, and `border` roles.

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

Montserrat carries the UDesign lockup, display headings, and high-value calls to action in the brand profile. Geist carries interface text and dense functional layouts. JetBrains Mono is limited to codes, identifiers, timestamps, and aligned numeric readouts.

Labels use sentence case with normal tracking. Do not turn metadata, navigation, or field labels into wide-tracked uppercase mono text. Body copy uses the semantic foreground. Muted foreground is for secondary information only after its contrast has been verified on the selected surface.

Display type may scale fluidly. Controls and body text must remain readable without horizontal zoom at 375px.

## Layout and responsive behavior

Use the shared spacing roles for component rhythm. Brand pages can use broader separation. Functional pages can use compact spacing without shrinking touch targets or readable type.

The responsive contract includes:

- `--touch-target-min`
- `--control-height`
- `--control-height-compact`
- `--content-gutter-mobile`
- `--dialog-inline-size-mobile`
- `--dialog-block-size-max`
- `--safe-area-bottom`

Interactive controls need a minimum inline and block target of `--touch-target-min`. Compact controls can reduce their visible field height while preserving the touch area around the trigger.

At narrow widths:

- Multi-column forms collapse to one column.
- Dense tables switch to a card collection or use deliberate horizontal scrolling with useful sticky context.
- Dialogs use the mobile inline-size and maximum block-size roles.
- Bottom actions include the safe-area inset.
- Primary actions remain reachable without covering required content.

Full-height mobile layouts use small viewport units. Validate at 375px, not only at a desktop browser narrowed by eye.

## Elevation

Cards and work areas rely primarily on semantic surfaces and borders. Brand overlays may use the elevation scale. Functional content remains flat except for true overlays that need separation from the workspace.

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

**Intensity is identical in the brand and functional profiles.** The functional profile is not a quieter variant because it is "for work," and the brand profile is not a louder variant because it is presentational - both render the same reaction. The build enforces this structurally: the compiled motion values are read from one source tree only, with no per-profile override path to diverge through.

`prefers-reduced-motion: reduce` is baked into the compiled token layer itself - `--motion-duration-*` and `--motion-loop-*` collapse to `0ms`, `--motion-press-scale*` and `--moment-intensity-*-scale` collapse to `1` automatically, so a consuming component gets correct behavior by default without writing its own media query. Two things deliberately do **not** collapse: `--motion-delay-indicator`, which suppresses a spinner flash rather than moving anything, and every interaction colour including `--interactive-pressed` - reduced motion removes the movement, not the feedback. A control still darkens on press, still shows its focus ring, and still reports `aria-busy`. Motion is still never the only indicator of a state change: a component using these tokens for its sole signal of "something changed" is incomplete regardless of the reduced-motion question.

### `data-game`

`data-game="on"` is a build-time attribute declared once at the document root, alongside `data-design`. It is not a user preference - no setting, cookie, or runtime code may read or write it as state. Gamification tokens and the three motion primitives below are inert without it: their custom properties simply do not exist outside a `[data-game="on"]` selector, so an application that never declares the attribute gets the non-gamified fallback through plain CSS cascade, not a runtime check.

### Motion primitives

Three generic, domain-flavorless primitives ship in the registry:

- **Progress ring** (`progress-ring`) - truthful completion of a bounded set. Always renders the real numbers as text; never color or arc angle alone. Not gated behind `data-game` - it is broadly useful, not gamification-exclusive.
- **Rolling-consistency chip** (`rolling-consistency-chip`) - "4 of the last 7." Composes `Badge` with a tone that never varies with the count. Not a streak: no chain, no repair/grace/freeze mechanic, no fire icon.
- **Moment** (`moment`) - wraps `children` and applies a bounded `transform`/`opacity` reaction at the given `intensity` (1 or 2) when `active` becomes true. Renders no icon or text of its own - the caller's `children` carries the actual state change, which is what still communicates closure when the animation is removed under reduced motion. No portal, no fixed positioning, no overlay, no sound, no haptics. Gated behind `data-game="on"`; not part of the `core` bundle.

## Components

**`button-primary`** uses `{colors.primary}` with `{colors.on-primary}` for the main action. It meets the shared control height and touch-target contract, exposes visible focus, and uses the interactive hover, pressed, and disabled roles.

**`button-secondary`** uses `{colors.canvas}` with `{colors.ink}` and a `{colors.hairline}` boundary. Runtime components consume the matching semantic roles so the treatment adapts to theme and profile.

**`button-outline`** uses a transparent surface, `{colors.ink}` foreground, and a clear outline. Its hover state uses semantic interaction roles rather than a raw inverse color.

**`header-lockup`** keeps the compact UDesign mark and Montserrat weight. It is the main signature element, so surrounding navigation remains visually restrained.

**`status-badge`** uses one complete tone family and includes a readable label. A dot or icon may reinforce meaning, but the label carries the state.

**`confidential-footer`** uses `{colors.canvas}`, `{colors.muted}`, and a `{colors.hairline}` top boundary. Its label remains sentence case and should only use the destructive role when the content represents a real warning.

**`card`** uses `{colors.surface-card}`, a `{colors.hairline}` boundary, and `{rounded.md}`. Runtime components use raised or card semantic roles so dark and functional profiles can adapt it.

## Registry components

The source registry includes these base components: button, badge, alert, card, input, textarea, select, checkbox, switch, slider, field, dialog, sheet, tooltip, tabs, and table.

The application patterns are icon-button, status-badge, metric-card, empty-state, and responsive-collection. The `core` registry item installs the recommended set.

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

- Cool slate neutrals that break the warm UDesign foundation.
- Translucent frosted panels in place of solid semantic surfaces.
- Decorative gradients used to manufacture hierarchy.
- Wide-tracked uppercase utility labels.
- Raw color literals or primitive token variables in component source.
- Tiny interactive targets hidden inside visually compact controls.
- Color-only status, metric, entity, or chart communication.
- Excessive rounding that makes every container look like a pill.
- Shadows on ordinary content cards in the functional profile.
- Screen-level celebration: full-viewport overlays, particle bursts, confetti, or anything at an intensity beyond 2.
- Motion as the sole indicator that a state changed - the non-motion signal (state, text, icon) must exist independent of the animation.
- Intensity that varies between the brand and functional profiles.

## Known limits

- Registry components are source-owned after installation. Consumers are responsible for merging later updates.
- Automated contrast, interaction, and visual regression coverage must continue to expand alongside the registry.
- Product-specific maps, editors, charts, and domain workflows remain in their applications.
