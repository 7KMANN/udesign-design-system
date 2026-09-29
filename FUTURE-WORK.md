# Future work

Open design-system work, newest first. Each item says why it waits. Remove an item when it ships;
the CHANGELOG records what shipped.

## v3.0.0: release the alias removal and round 16

`brand` and `functional` are removed on `master` after v2.1.0 (Kaleb, 2026-09-26). The gate was
GlobalVision on `data-design="operations"`; it runs that on v2.1.0, so the gate is met. The work
from GlobalVision's recommendations (2026-09-29, `docs/v2/DECISIONS.md` round 16) rides this release
(D-34). Waits for Kaleb's word to tag.

In the same change, `udesign-docs` needs its own release: `standards/design/udesign-contract.md`
(ratified decision 1) and the GlobalVision overlay still say `data-design="functional"`.

The changelog entry lists as visible changes: the light focus ring moves to the deep accent (with
`--ring`); hover and pressed step off the page floor and `--secondary`; Switch off state; fields ring
inside their border, other controls outline with a transparent gap; toolbar controls compact on a
desktop mouse (ban 20 is a touch rule, D-33); the sidebar hides below `md` and the nav opens in a
sheet (D-36, static HTML via `popover`); Select and Tooltip on `--shadow-3`; `SheetContent` a flex column; Dialog and Sheet headers
reserve the close button's space; `--highlight`; `Card` gains `data-slot="card"`; bans 28 to 32 with
checker rules `fill-as-text`, `toolbar-wrap`, `press-missing` and wider `raw-motion`, `div-onclick`
and `em-dash`. GlobalVision's bump retires its workarounds for toolbar tokens, field rings, Switch,
Tabs, the highlight component and the Slider `aria-valuetext` forward, and meets about 180 new
`fill-as-text` findings, each a real contrast failure in one theme.

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
