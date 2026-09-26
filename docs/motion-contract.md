# Motion contract

What this design system publishes so that consuming applications can obey the
[`interface-responsiveness` skill](https://github.com/7KMANN/udesign-docs/blob/v0.9.0/skills/interface-responsiveness/SKILL.md)
(`udesign-docs@v0.9.0`, canonical for the interaction model) without inventing numbers.

Every value below is read from the compiled artifact, `dist/tokens.css`. If this file and
`dist/tokens.css` disagree, the artifact wins and this file is the defect.

**A consuming app never picks a duration, an easing curve, or a press-scale factor.** It selects an intent. If the intent it needs does not exist, that is a design-system change, proposed upstream - not a local literal.

Profiles: `presentation` and `operations`. The old names `brand` and `functional` were removed
in v3.

---

## 1. Published token families

### 1.1 `--motion-duration-*`

Semantic roles, named by intent. A minimum viable set is five - two is not enough, and is the mistake that produced an unusable motion layer in a prior attempt. This system publishes six:

| Token | Value | Applies to |
| --- | --- | --- |
| `--motion-duration-instant` | 70ms | Press compression, toggle flip, immediate acknowledgement |
| `--motion-duration-fast` | 150ms | Hover, focus ring, color state change, in-place swap |
| `--motion-duration-standard` | 250ms | Dialogs, sheets, popovers, list enter/exit, tab change |
| `--motion-duration-emphasis` | 280ms | Intensity-2 reaction inside the acting component |
| `--motion-duration-slow` | 350ms | Route transitions, shared-element morphs, large surfaces. The interaction ceiling. |
| `--motion-duration-ambient` | 1200ms | One period of a looping skeleton shimmer or pulse. Not an interaction duration. |

Nothing above `slow` may be used in an interaction path. `ambient` is for loops only.

### 1.2 `--motion-easing-*`

| Token | Curve | Applies to |
| --- | --- | --- |
| `--motion-easing-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Anything moving within the viewport; the default |
| `--motion-easing-fast` | `cubic-bezier(0.4, 0, 0.2, 1)` | Compatibility alias of `standard`; same curve |
| `--motion-easing-enter` | `cubic-bezier(0, 0, 0.2, 1)` (decelerate) | An element arriving |
| `--motion-easing-exit` | `cubic-bezier(0.4, 0, 1, 1)` (accelerate) | An element leaving |
| `--motion-easing-emphasis` | `cubic-bezier(0.34, 1.56, 0.64, 1)` (settle-in overshoot) | Intensity-2 reactions only (feedback layer 3); never an exit |

Enter and exit are asymmetric on purpose. Content leaves fast so it stops competing for attention; content arrives gently so it can be read.

No `linear` easing token is published. Loops tokenize only their period (`--motion-duration-ambient`, `--motion-loop-spin`) and take their timing function from the animation they run.

### 1.3 Delay and loop

| Token | Value | Applies to |
| --- | --- | --- |
| `--motion-delay-indicator` | 200ms | Hold before revealing a pending indicator, so a quick operation never flashes a spinner |
| `--motion-loop-spin` | 900ms | One rotation of a busy indicator |

### 1.4 `--motion-press-scale*`

The press-feedback scale factor, so no component hardcodes one.

| Token | Value | Applies to |
| --- | --- | --- |
| `--motion-press-scale` | 0.97 | Buttons, chips, icon buttons |
| `--motion-press-scale-subtle` | 0.995 | Cards, rows, tiles - larger elements need less |

### 1.5 Interaction-state color roles

These usually already exist. Confirm they do, and confirm they are *used*:

`--interactive-hover`, `--interactive-pressed`, `--interactive-selected`, `--interactive-focus`, `--interactive-disabled`, `--interactive-disabled-foreground`

A published `--interactive-pressed` that no component references is a token layer that exists on paper. Grep for its usage before assuming the system provides press feedback.

---

## 2. Compilation rules

1. **Motion tokens compile at bare `:root`.** They apply to every application consuming the system, unconditionally. Motion is not a feature flag - an interface that acknowledges input is the baseline, not an opt-in.

2. **Reduced motion is baked into the compiled layer**, once, for `:root` and every profile block:

   ```css
   @media (prefers-reduced-motion: reduce) {
     :root /* and every profile block */ {
       --motion-duration-instant: 0ms;
       --motion-duration-fast: 0ms;
       --motion-duration-standard: 0ms;
       --motion-duration-emphasis: 0ms;
       --motion-duration-slow: 0ms;
       --motion-duration-ambient: 0ms;
       --motion-loop-spin: 0ms;
       --motion-press-scale: 1;
       --motion-press-scale-subtle: 1;
     }
     :root[data-game="on"] {
       --moment-intensity-1-scale: 1;
       --moment-intensity-2-scale: 1;
     }
   }
   ```

   Consumers selecting by token then behave correctly without writing a media query. **Durations collapse; colors do not.** The pressed background, the focus ring, and the disabled treatment all still apply - that is what keeps feedback present when motion is removed. `--motion-delay-indicator` also does not collapse: it suppresses a spinner flash rather than moving anything.

3. **Motion values are identical across visual profiles.** Profile governs type, radius, and elevation. It never governs motion. A build step that emits different motion output per profile is a defect, however reasonable the variation seemed.

4. **Do not scope the base motion layer behind an opt-in attribute.** Emphasis-only tokens may be scoped to an opt-in attribute (`--moment-intensity-1-scale` and `--moment-intensity-2-scale` compile only inside `:root[data-game="on"]`). The ordinary interaction layer may not - a spinner needs a duration token as much as a celebration does.

5. **Publishing a token is half the job; consuming it is the other half.** The failure mode to watch for is a correctly-built motion layer that almost nothing imports. Before calling a motion system delivered, grep the component library for each token name and count the call sites. If the count is one or two, the system has a token layer and no motion. Make that count a test (§4.7).

---

## 3. Required primitives

A design system that publishes motion tokens but no primitives pushes the work back to every consumer. At minimum:

| Primitive | Responsibility |
| --- | --- |
| **Button with a pending state** | A `loading`/`pending` prop that swaps in a spinner, sets `disabled` and `aria-busy`, and **preserves the control's width** so the layout does not jump. This is the single highest-traffic control in any application; if it cannot express "working", every consumer reinvents it badly. |
| **Spinner** | One indeterminate indicator, size-matched to control heights, with a `label` for assistive technology. |
| **Skeleton** | Layout-mirroring placeholder, `ambient` shimmer, reduced-motion aware, `role="status"`. |
| **Progress** | Determinate, with a real numeric readout - never arc or bar alone. |
| **Pressable surface** | The shared press treatment for cards/rows that act as buttons, so it is not re-derived per surface. |
| **Emphasis wrapper** | Bounded, in-place reaction for Layer 3. No portal, no fixed positioning, no overlay, no sound, no haptics. Cannot escape its own bounds. |

Every primitive follows the system's existing registry contract: semantic variables only, ref forwarding, `className` extension, keyboard operation, visible focus, native semantics before ARIA, touch targets in the source component.

---

## 4. Contract tests

The system's own test suite must assert, mechanically:

1. Every motion duration token exists at bare `:root` in the compiled output for **every** profile.
2. Every profile's compiled motion values are byte-identical to every other profile's.
3. The reduced-motion block zeroes every duration token and neutralizes every press-scale token.
4. No published interaction duration token exceeds the `slow` ceiling (the "no sluggish animation" cap, structurally enforced rather than documented). `ambient` is a loop period, not an interaction duration, and is exempt.
5. Emphasis-scoped tokens appear only inside their scoping block and never at bare `:root`.
6. The pending-capable button renders its busy state with `aria-busy` and without a width change (measured, not asserted by class name).
7. **Adoption floor:** every published motion duration token is referenced by at least N components in the library, and no component in the library declares a raw duration or easing literal. This is the test that would have caught a motion layer sitting unused behind a correct build.

A rule that is only written down is a rule that drifts. Tests 1-4 and 7 are what make this a system rather than a suggestion.

### A warning about "exactly N intents" tests

A contract test that pins the published intent set to an exact list (`assert.deepEqual([...intents].sort(), ["emphasis", "fast"])`) is load-bearing in the wrong direction: it makes the vocabulary *unable to grow*. It reads as rigor, and it is the reason a system can be stuck with two durations while its components hardcode nine.

Pin the **ceiling** instead of the **set**: assert that no published interaction duration exceeds the slow cap, that every intent has a description, and that the profiles agree. Those constraints keep the guarantee that actually mattered (no sluggish, no profile drift) without freezing the vocabulary.

By contrast, a test asserting that a *scoped* family never appears at bare `:root` is worth keeping exactly as written. Do not widen a scoped emphasis family to serve a general need - add a new, differently-named family at bare `:root` and leave the scoping test intact.

---

## 5. Migration from a reward-only motion layer

If a system already shipped a small gamification-only motion layer, the migration is:

1. **Keep** the existing duration/easing families; **rename** if their intent names are too narrow, and add the missing intents (`instant`, `standard`, `slow`, `ambient`).
2. **Unscope** them from the opt-in attribute so they land at bare `:root`.
3. **Keep** the emphasis/intensity tokens scoped, and keep the structural cap on their magnitude - that cap was correct and should survive.
4. **Add** the press family and the pending-capable button.
5. **Re-point** the contract's intensity table: the level that used to mean "neutral state change, no feedback" now means "state change with mandatory input acknowledgement". That table entry is the root cause of dead-feeling interfaces built against the old contract - a scale designed for *reward magnitude* was being read as *feedback presence*.

Step 5 is the important one. The rest is additive; that one is a correction.
