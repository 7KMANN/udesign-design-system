# Future work

Open design-system work, newest first. Each item says why it waits. Remove an item when it ships;
the CHANGELOG records what shipped.

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
