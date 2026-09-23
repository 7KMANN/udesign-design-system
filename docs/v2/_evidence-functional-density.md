# Evidence: functional-profile density is lost inside components, not at the shell

**Date:** 2026-09-23
**Source:** GlobalVision parcel-tracking tool, fixed in GlobalVision commit `43cb805`.
**Status:** field evidence for S1.5 and S3. It is not a decision. It bears on **D-19**, and
Kaleb decides what to do about that.

Per standing rule 7 (`OPERATION.md` §5), the consumer has already been fixed locally. This file
records what the design system would have to change so the next consumer does not hit the same
problem.

## What happened

Kaleb reviewed the parcel tool as "not optimized at all, way too much spacing". The screen already
followed the functional profile and passed `lint:design` with 0 violations. The measurements below
were taken with `getBoundingClientRect` in Chrome at 1646px and at a 375px mobile viewport.

| Surface | Before | After the local fix |
|---|---|---|
| Detail dialog, 4-package parcel: tracking events visible without scrolling | 1 of 7 | 7 of 7 |
| Tracking-history card: height spent on padding and header | 125 of 190px | 38px header, 12px padding |
| Mobile detail: where tracking history starts | about 1,490px down | 548px down |
| Mobile list header | 243px | 135px |
| Desktop table rows | 61px | 45px |

## The three mechanisms. Only the first is a consumer mistake.

**1. The component defaults are sized for page-scale content.**
- Registry `Card` pads with `p-6` in its header (`registry/new-york/ui/card.tsx:11`), its content (`:26`) and its footer (`:31`).
- GlobalVision's local `Card`, which is shadcn v4 and not the registry's version, does the same with `py-6 gap-6` (`globalvision/components/ui/card.tsx:12`).
- That 24px sits inside every card, whatever shell the card lives in.
- A functional screen with five cards pays for it five times over.

**2. Consumers cannot turn padding off: `p-0` does not beat `sm:p-6`.**
- Registry `DialogContent` (`registry/new-york/ui/dialog.tsx:30`) sets `p-[var(--content-gutter-mobile)] sm:p-6 gap-4`.
- tailwind-merge treats `sm:p-6` as a different class from `p-0`. A consumer passing `p-0` gets 0 on phones and 24px on desktop, plus a `gap-4` it never asked for.
- `sheet.tsx:37` has the same shape.
- In GlobalVision, 7 more dialogs pass `p-0` expecting edge-to-edge content, and all 7 still leak. The parcel dialog was the eighth, and it now passes `p-0 sm:p-0 gap-0`. The same header problem exists locally: `card.tsx:25` sets `[.border-b]:pb-6`, and that selector outranks a plain `pb-3`.
- The trap: the obvious override silently half-works, and nothing reports it.

**3. Class names built at runtime render nothing.**
- GlobalVision built a stage-connector colour as `m.border.replace("border-", "bg-")`.
- Tailwind never generates a class that doesn't appear literally in the source, so the connector was transparent for as long as it existed.
- No lint caught it.

## Why this bears on D-19

D-19 dropped the `--space-*` and `--control-height` fork on the grounds that "density now falls
out of the app shell for free" (`DECISIONS.md`, D-19).

The evidence above suggests that holds only for the shell's own gutters. None of the waste measured
here was in a page gutter. All of it was in card, dialog and header internals, which render the same
inside `AppShell` as inside `PageCanvas`. `[INFERRED]` An operations shell with today's `Card` and
`Dialog` would still produce this screen.

This does not argue for bringing back the token fork. D-19's reason for dropping it, that the same
type-scale curve would just look like the same design at 80% zoom, is untouched. It argues that the
**hierarchy-mechanism fork (D-19 item 2) has to reach inside the components**, not only the shell.

## Candidate responses `[NEW - NEEDS APPROVAL]`

For S1.5 or S2 to weigh. Nothing here is decided.

1. **A density axis on the components themselves.** Card, Dialog and Sheet would read their padding from one token or data attribute. The operations profile or `AppShell` sets it compact; `PageCanvas` keeps 24px. This keeps the 44px touch floor intact, because only padding moves.
2. **Let a zero-padding request actually win.** Either give Dialog and Sheet an explicit `inset="none"` prop, or move `sm:p-6` into a variable (`p-[var(--dialog-padding)]`) so a single `p-0` override is complete.
3. **Two rules for the S3 checker:**
   - flag `p-0` or `px-0`/`py-0` passed to a component whose base class has a breakpoint-prefixed padding;
   - flag Tailwind class names assembled with `.replace()` or template strings from other class names.

   Both are countable, which suits standing rule 5.

## Separate drift worth recording

GlobalVision's `components/ui/card.tsx` and `dialog.tsx` are local shadcn v4 forks with `data-slot`
attributes. They are not the `@udesign` registry versions that `globalvision/components.json` points
at. Fixing the registry alone will not reach GlobalVision; its migration note needs to say so.
