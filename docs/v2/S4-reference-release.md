# S4: Reference & Release

**You are the segment orchestrator for S4 of the UDesign v2.0.0 operation.** You run in a main
session so you can ask Kaleb questions and show him things. Up to 2 subagents at a time, and that is
a hard limit: usage limits interrupted S0 once and S1 twice.

This segment ships **the reference screens and `v2.0.0`**. It is the last segment: cut line 5 is the
end of the operation.

**The checker is your floor, as it was S2's.** Every reference screen reports zero findings from
`node bin/udesign-check.mjs <paths>`, and a committed case in `tests/checker.test.mjs` keeps it there.

---

## Read these, in order, before anything else

1. [`OPERATION.md`](./OPERATION.md): §2 (execution model, the skill fleet, resumption protocol, and
   "Between segments", since a release is a close-out), §5 (standing rules), and the **S2 ledger in
   §4**.
2. [`DECISIONS.md`](./DECISIONS.md): **D-11** (the conviction the `operations` reference carries),
   **D-24** (this release pairs with `udesign-docs@v0.9.0`), and round 14: **D-30, D-31, D-32,
   Δ-17 to Δ-20**.
3. [The plan](../superpowers/plans/2026-08-29-v2-design-language.md) **Phase 5**, then **§6
   migration notes** in full (MN-1 to MN-18): the CHANGELOG is built from them.
4. [`DESIGN.md`](../../DESIGN.md) "Emphasis and hierarchy" and "Components", and
   [`AGENTS.md`](../../AGENTS.md). The reference screens must obey what these say, visibly.

Start by invoking `superpowers:executing-plans`.

---

## What S2 did that changes your starting point

- **The static-HTML reference has a head start.** `tests/fixtures/catalog-components.html`
  (presentation) and `tests/fixtures/app-shell-components.html` (operations) are built only from the
  shipped classes and report zero findings. They are acceptance fixtures, not reference screens:
  neither carries plan Phase 5's restraint comments, and the operations one is not the dense working
  screen D-11 asks for. Build on them or start fresh, but the checker case must survive.
- **The component classes live in `css/components.css`** and `npm run build` appends them to both
  compiled token files (D-31). Never edit `dist/`.
- **One stale source to correct (D-32):** the `DESIGN.md` component frontmatter (lines 60-100) still
  describes v1.x buttons and cards. Make it match the registry: `button-secondary` has no border,
  `button-outline` is 1px `--border`, buttons inherit the body face, and `card` reads
  `--surface-padding` with 16px corners. Kaleb saw the two side by side and chose the registry.
- **Seeing a page:** static pages render from a server rooted at `WEBDEV/` (the fixtures link
  `../../dist/tokens.css`). S2 used `python -m http.server` through the browser pane. The pane's
  emulated screenshots crop badly; measure geometry with a script instead.

## Carried over

- **Four ban 19 findings in `showcase/src/index.css`** (`:210`, `:508`, `:1034-1035`) are yours
  (S3 ledger). So is the showcase's alias use of `brand` and `functional`, and README's component
  lists (`:15`, `:125`), which predate v1.5.0 (S1 ledger cites them at `:106`, before S2 added a section).
- **`udesign-docs@v0.9.0` links this repo at `v2.0.0`** (D-24, MN-11). Cutting the tag is what
  closes that window. `scripts/release.mjs` rewrites the README pins on bump (S1 ledger).
- **`v2/s1.5-prototype`** is kept unmerged until S4, then deleted (S1.5 ledger).
- **Findings in consumers are evidence, not work** (standing rule 7, D-25). MN-17 and MN-18 say what
  this release means for `udesignpages` and GlobalVision.
- **Kaleb said the bans will grow** (D-29). A new ban needs his approval; a countable one gets a
  checker rule, test-first.
- Line endings: `npm run validate` re-embeds CRLF into `public/r/`. Restore it and compare content
  (`docs/TOOLING-PITFALLS.md` §1).

## Done when

- [ ] One reference screen per profile, plus one static-HTML reference, each exercising restraint
      with a comment saying so (plan Phase 5), each at zero checker findings in a committed test.
- [ ] `examples/` is in `package.json` `files`, and `npm pack --dry-run` lists it.
- [ ] The `DESIGN.md` component frontmatter matches the registry (D-32).
- [ ] `CHANGELOG.md` carries every migration note that reaches a consumer.
- [ ] `npm test` is green; `npm run validate` exits 0.
- [ ] `v2.0.0` is tagged on `master` **on Kaleb's word**, and `udesign-docs`' `v2.0.0` links resolve.
- [ ] `OPERATION.md` §4 has your ledger and the operation's status line says complete.

## Guardrails

- **A reference screen teaches by what an agent copies.** Put the restraint where a partial copy
  still carries it: the row action is `ghost` in the row itself, not explained in a paragraph above.
- **Do not fix consumers** (standing rule 7).
- **No em-dashes.** The lint scans every instruction file and all component source.
- **"UDesign"**, capital U capital D. The accent is **the accent**, never a colour name.
