"use client"

// Moment — the bounded "reward" visual wrapper (ADR-0001, gamification
// motion layer; see tokens/udesign.tokens.json's `moment` family).
//
// DIVISION OF RESPONSIBILITY (read before touching this file):
// This component ONLY wraps `children` and applies a bounded, in-place
// transform/opacity reaction when `active` flips to true. It renders no
// icon, text, or state content of its own — communicating *what* just
// completed (an updated icon, a changed label, a new count) is entirely the
// caller's job via the `children` it passes in. In particular, under
// `prefers-reduced-motion: reduce` the transform collapses to a no-op (see
// below), which means the transform is NEVER the only signal that
// something happened — the caller's `children` must already carry that
// signal on their own. Do not "fix" reduced motion here; there is nothing
// to fix here, the fix belongs in the caller's children.
//
// SAFETY CAP: intensity is capped at 2. Intensity 3 (screen-level
// celebration, particle bursts, overlays) does not exist in this design
// system and must never become expressible through this component — do not
// widen the `intensity` prop type, do not add a portal, do not add an
// overlay/backdrop/z-index, do not add sound or haptics. See DESIGN.md
// "Banned design patterns" and the gamification ADR-0001 for the full
// rationale.
//
// The `--moment-intensity-{1,2}-scale` custom properties this component
// reads are compiled ONLY inside a `:root[data-game="on"]` block (see
// scripts/build.mjs's formatMomentBlock) — they do not exist at all in an
// application that hasn't opted into the gamification layer. This
// component must stay inert via plain CSS cascade in that case, so every
// read of those variables carries an explicit `1` fallback
// (`var(--moment-intensity-1-scale, 1)`) and this file never inspects
// `document.documentElement.dataset.game` or any other runtime attribute —
// that check must never exist here.

import * as React from "react"

import { cn } from "@/lib/utils"

export interface MomentProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Bounded reward tier. 1 = routine in-control feedback (fast motion
   * tokens). 2 = a loop's closure (emphasis motion tokens). There is no 3.
   */
  intensity: 1 | 2
  /**
   * Becomes true right after the caller's write succeeds. The wrapper
   * reacts to the transition into `true` with a bounded transform driven
   * by a plain CSS transition — if a new moment fires (a prop change)
   * before the previous one settles, the transition simply restarts toward
   * the new target, so the new moment replaces the old one instead of
   * queuing behind it.
   */
  active: boolean
  children: React.ReactNode
}

const MOMENT_TRANSITION_DURATION: Record<1 | 2, string> = {
  1: "var(--motion-duration-fast)",
  2: "var(--motion-duration-emphasis)",
}

const MOMENT_TRANSITION_EASING: Record<1 | 2, string> = {
  1: "var(--motion-easing-fast)",
  2: "var(--motion-easing-emphasis)",
}

const Moment = React.forwardRef<HTMLSpanElement, MomentProps>(
  ({ active, children, className, intensity, style, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="moment"
      data-intensity={intensity}
      className={cn("inline-block transition-transform", className)}
      style={{
        transitionDuration: MOMENT_TRANSITION_DURATION[intensity],
        transitionTimingFunction: MOMENT_TRANSITION_EASING[intensity],
        transform: active ? `scale(var(--moment-intensity-${intensity}-scale, 1))` : "scale(1)",
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  ),
)
Moment.displayName = "Moment"

export { Moment }
