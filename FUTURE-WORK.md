# Future work

Open design-system work, newest first. Each item says why it waits. Remove an item when it ships;
the CHANGELOG records what shipped.

## How strict `spacing-role` is with 2px and 6px stacks (D-50)

The checker holds stacks to the spacing roles at every step, so GlobalVision's dense operations
screens report 126 stacks spaced 2px or 6px (`space-y-0.5`, `grid gap-1.5`) among its 142
findings. If Kaleb keeps those as legitimate density, holding stacks only from 8px up leaves 16; it
is one condition in `bin/rules.mjs`. Waits for D-50's answer.

## A static choice group for UDesign Pages (D-49)

UDesign Pages' size buttons have the defects `ChoiceGroup` fixes. A static twin needs the columns
of each width range written into the page, which its Python generator could do by porting
`choiceColumns`, and a little script for the arrow keys. Waits for UDesign Pages to take it up.

## A checker rule for a press scale that snaps (D-38)

`tests/motion-adoption.test.mjs` catches a press scale whose transition misses `scale` or
`transform` in the registry, but application code repeats the pattern: Boutique's own
`Gallery.tsx`, `KitProduct.tsx`, `pickers.tsx` and `SizePicker.tsx` press with a jump under
Tailwind 4. The same lexical check would fit `udesign-check`. Waits for D-38's approval and a
numbered ban to cite: a finding must name its rule.

## Stacked panes on a phone share a short page's spare height (D-42)

Below `md` a short page's spare height now goes to `AppShellPanes`, and two panes stacked there
split it, so the hairline between them floats mid-screen. One pane, the common case, takes all
of it. Giving it to the last pane means a flex column below `md` instead of the grid. Waits for a
screen that shows it.

## `udesign-docs` release paired with v3.0.0

`standards/design/udesign-contract.md` (ratified decision 1) and the GlobalVision overlay still say
`data-design="functional"`, which v3.0.0 removed. Waits on a `udesign-docs` session: a ratified
document changes there on a real contradiction, and this is one.

## Checker rules cut in S3 (`docs/v2/DECISIONS.md` Δ-15)

- **Raw hex colours.** In generated HTML almost every hit is product swatch data, which ban 3
  allows. Needs a swatch exemption that is not a loophole.
- **Colour-only status** and **`:focus` without `:focus-visible`.** Both need judgement a pattern
  cannot make.
- **Plan rules 8 and 9.** No numbered ban covers them, so a finding could not name its rule. Write
  the ban first. Kaleb expects the bans to grow (D-29); each new ban should arrive with its rule.

## Static component classes on evidence only

S2 skipped 20 registry components in `css/components.css`; each reason is in the `MIRROR` map in
`tests/component-css.test.mjs`. Add a class when a static page actually needs it, not before.

## Does the checker absorb GlobalVision's `lint:design`?

Both flag some of the same things (`--ud-*` primitives, raw motion, and since round 16 framer-motion
literals and primitives with no press). Decide after GlobalVision adopts v3, which keeps both on
purpose so the overlap can be measured.
