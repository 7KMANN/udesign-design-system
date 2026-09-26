# Future work

Open design-system work, newest first. Each item says why it waits. Remove an item when it ships;
the CHANGELOG records what shipped.

## v3.0.0: release the alias removal

`brand` and `functional` are removed on `master` after v2.1.0 (Kaleb, 2026-09-26). Cut v3.0.0 once
GlobalVision's design-system adoption run has switched it to `data-design="operations"`
(`globalvision/docs/impl/briefs/DS-V2-ADOPTION.md`, Phase 2). Releasing earlier breaks nothing that
is pinned, but it leaves GlobalVision a major version behind for no gain.
In the same change, `udesign-docs` needs its own release: `standards/design/udesign-contract.md`
(ratified decision 1) and the GlobalVision overlay still say `data-design="functional"`.

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

## Tabs inactive-trigger contrast

Measured once at 4.4:1 against the 4.5:1 minimum (operations, light, mobile), flaky, found
2026-08-17. Tracked in `globalvision/FUTURE-WORK.md` item 11. Not re-measured on v2.

## Does the checker absorb GlobalVision's `lint:design`?

Both flag some of the same things (`--ud-*` primitives, raw motion). Decide after GlobalVision's
adoption run, which keeps both on purpose so the overlap can be measured.
