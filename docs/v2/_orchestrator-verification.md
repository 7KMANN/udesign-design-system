# S0 orchestrator - independent verification log

Checks the orchestrator ran itself against HEAD (`75c9271`, v1.5.0, branch `v2/s0-decide-and-plan`).
The research report is evidence, not scripture (plan brief §0). These are the re-runs.

## Confirmed as stated

| Research claim | Check | Result |
|---|---|---|
| §1.3 README pins v1.3.0 in four snippets while `package.json` is 1.5.0 | `grep -n "1\.3\.0" README.md` | **Still true.** Lines 9, 50, 81, 95, 101. Nothing has changed since 2026-08-27. |
| §7.8 `ud-btn` has no upstream here | `grep -rn "ud-btn" --exclude-dir=node_modules` | **Confirmed.** 12 hits: 11 in the research/brief prose, 1 in `docs/superpowers/plans/2026-07-13-udesign-showcase-and-rules.md:48`. Zero in any shipped file. |
| §7.8 the CSS class surface is seven typography utilities | `grep -n "^\." dist/tokens.css` | **Confirmed.** `.ud-display .ud-h1 .ud-h2 .ud-h3 .ud-body .ud-label .ud-data`, `dist/tokens.css:555-561`. |
| §1.6 D1 - `select.tsx:18` uses `focus:` not `focus-visible:` | read the file | **Confirmed, line number correct.** |

## Corrections to the research

| Research claim | Actual | Impact |
|---|---|---|
| §1.6 D2 cites `registry/new-york/ui/table.tsx:69` | The defect is real but sits at **`table.tsx:34`**. The file is 53 lines and `git log` shows it has never exceeded 53. | S3 will go looking at a line that does not exist. Cite `table.tsx:34`. |
| §1.6 D3 cites `registry/new-york/ui/slider.tsx:116-123` | The defect is real but sits at **`slider.tsx:30-37`** (`SliderPrimitive.Thumb`, `focus-visible:` present, no `active:`). The file is 44 lines. | Same. Cite `slider.tsx:30-37`. |

Both findings stand; only the coordinates were wrong. Verified with
`git log --format=%h -- registry/new-york/ui/table.tsx` + `git show <c>:… | wc -l`.

## Findings the research did not record

**F1 - `AGENTS.md` is not shipped.** `package.json:9-20` `files` lists
`dist tokens registry registry.json public/r README.md DESIGN.md HANDOFF.md CHANGELOG.md LICENSE.md`.
`AGENTS.md`, `.cursorrules`, and `.gemini/rules` are **absent**. Research §1.1 and §6 item 2
treat `AGENTS.md` as the highest-pickup file and propose spending the design language there.
That is correct for an agent working *in this repo* and **worth nothing to an agent working in a
consuming repo via `npm i`**, which is entry path (b) in §3.1 - the GlobalVision path. Whatever
S1 writes into `AGENTS.md` must either be added to `files` or duplicated into a file that is.
Consequence for the plan: the `AGENTS.md` rewrite is necessary and not sufficient.

**F2 - the typography helpers already carry a per-profile override, and they are generated.**
`scripts/build.mjs:382-408` (`formatTypographyHelpers`) emits `.ud-*` once for brand and again
scoped to `:root[data-design="functional"], .design-functional` (`dist/tokens.css:564-570`).
So a profile-scoped CSS class layer is not a new architecture - it is the existing one, extended.
Relevant to D1 (the CSS component layer) and to §3.2 option (a): composition/density differences
have a delivery mechanism that already exists and already ships.

**F3 - component classes are not token-derivable.** The typography helpers are generated from
`tokens.typography`. Nothing in the token tree describes a button. A CSS component layer is
therefore hand-authored source, not build output, which is why "how does it not drift from the
React registry" is a real question and not a build-config question.

## Surface size for D1

27 components in `registry/new-york/ui/`, 28 registry items (27 + `core`).
A 1:1 CSS mirror of all 27 is the maximal reading of D1 and almost certainly wrong.
The sizing question - which subset a static-HTML generator actually needs - is evidence,
and Subagent B is gathering it from `udesignpages`.

## Findings bearing on D1 (CSS layer) and D2 (portable checker)

**F4 - both consumers already run Node, so the checker's language is settled.**
`globalvision/package.json` pins `"udesign-design-system": "github:7KMANN/udesign-design-system#v1.5.0"` -
current, not stale. `udesignpages/package.json` has **zero dependencies** but real Node scripts
(`node tools/serve.mjs`, `node --test tools/*.test.mjs`). A checker shipped as a `bin` in this
package and run with `npx` reaches the React consumer directly, and reaches the zero-dependency
consumer without forcing it to take a dependency. No Python port, no second implementation.

**F5 - the org already has a canon-distribution pattern, and it is not "restate it".**
`udesignpages/tools/sync-canon.mjs` copies canon out of `udesign-docs` **byte-identically** into
`public/`, driven by a heading→file map, and its header states the reason:

> "a previous version of the admin console hand-rewrote the ~250-line researcher prompt as ~20 lines
> and silently dropped the anti-stale-reuse rule. This script exists so the copy in `public/` is
> provably byte-identical to the fenced blocks in [the canon file]."

This matters three ways:
1. It is a **precedent Kaleb already owns and trusts** for getting a versioned artifact from an
   upstream repo into a consumer that cannot take a dependency. The CSS component layer has the
   same shape of problem.
2. It is the org's own worked answer to `knowledge-governance`'s one-home rule: when a fact must
   physically exist in two places, **sync it mechanically and assert byte-identity** rather than
   paraphrase it. That is a candidate general answer to the boundary question's hardest case.
3. It is evidence that hand-maintained copies of canon in this org have already failed once, in
   production, with a dropped rule - the same failure class as §2.2's inverted authority.

## Re-verification of Subagent A's load-bearing corrections

A's three most consequential claims contradict either the research or the plan brief, so the
orchestrator re-ran them independently before putting any of them to Kaleb.

**A1 - "35 real overrides, not 59." Confirmed.** Independent DTCG leaf-differ over
`tokens/functional.tokens.json` against `tokens/udesign.tokens.json`:
`declared leaves: 59 | differ: 35 | no-op: 24`. Research §1.4's "59" counted declarations.

Sharper than A stated it: **in the light theme only 9 of 30 colour roles actually differ**
(`background`, `secondary`, `muted`, `accent`, `border`, `border-strong`, `sidebar`,
`sidebar-accent`, `sidebar-border`). `primary`, `card`, `popover`, `destructive`, `input`, `ring`
and every `*-foreground` are byte-identical. All 12 dark roles differ. So in light mode the two
profiles share their accent, their card, their inputs and their focus ring, and differ in the
canvas, the borders and the sidebar. The honest one-line description of the light profiles is
**"same palette, different borders and canvas"**, which is narrower even than research §1.4's
"colour roles, typeface, type scale, radius and shadow."

**A2 - the motion guarantee is not what blocks a density fork. Confirmed, and it matters.**
- `tests/token-contract.test.mjs:168` derives its token list from `/--motion-[a-z0-9-]+/` in the
  brand block. It is scoped to motion and **would not fire on a spacing or control-height fork.**
  The plan brief §3.2's stated constraint ("if you propose making the profiles behaviorally
  different, you are proposing to break the byte-identical motion guarantee") is therefore too
  broad: it is true for a *motion* fork and false for a *density* fork.
- `tests/token-contract.test.mjs:129-130` asserts `--touch-target-min: 44px` and
  `--control-height: 44px` with `assert.match` **against the whole compiled file**, not against a
  profile block. A functional override to 36px satisfies the match via the brand block and passes.
  **This is a live hole in the touch-target contract, independent of anything v2 does**, and it
  should be fixed whether or not the profiles diverge.

**A3 - density is structurally unemittable. Confirmed.** `scripts/build.mjs:289-296` gates the
`--space-*` emission behind `emitPrimitives`, which is passed `true` only for the brand block
(`build.mjs:429`) and omitted for the functional block (`build.mjs:431`). So
`DESIGN.md:125`/`:129` and `README.md:12` describe a density difference the build cannot produce.

## Re-verification of Subagent B's load-bearing claims

**B/I1 - `MOTION-SYSTEM.md` has drifted six ways. All six confirmed.**
`udesign-docs/skills/interface-responsiveness/references/MOTION-SYSTEM.md` against `dist/tokens.css`:

| # | Documented | Shipped |
|---|---|---|
| 1 | `standard` `cubic-bezier(0.2, 0, 0, 1)` (`:29`) | `cubic-bezier(0.4, 0, 0.2, 1)` (`dist/tokens.css:185`) |
| 2 | `enter` `cubic-bezier(0, 0, 0, 1)` (`:30`) | `cubic-bezier(0, 0, 0.2, 1)` (`:187`) |
| 3 | `exit` `cubic-bezier(0.3, 0, 1, 1)` (`:31`) | `cubic-bezier(0.4, 0, 1, 1)` (`:188`) |
| 4 | `linear` published (`:33`) | **not published** - `grep -c motion-easing-linear dist/tokens.css` = 0 |
| 5 | roles named `scale-control` / `scale-surface` (`:41-44`) | `--motion-press-scale` / `--motion-press-scale-subtle` (`:192-193`) |
| 6 | `scale-surface` ~0.99 (`:44`) | `--motion-press-scale-subtle: 0.995` (`:193`) |

This is the worst single finding for **P2**. An agent told "fix all drifted stuff" that reaches
this file - and `globalvision/AGENTS.md` routes it there - produces six false findings and may
"correct" shipping code to match a document that is wrong. It fails P2 in the most damaging way
available: not by missing violations, but by manufacturing them.

**B/I2 - confirmed.** `udesign-contract.md:18` - "Source of truth: `udesign-design-system` v1.3.1
for every token family below except Motion." GlobalVision installs v1.5.0.

**B/tags - confirmed.** `git tag` in `udesign-docs` returns `v0.1.0 v0.1.1 v0.2.0 v0.3.0 v0.4.0
v0.5.0 v0.6.0`. `WEBDEV/CLAUDE.md` states the range runs to `v0.4.0`. The routing canon is two
tags stale about its own canon.

## Late finding, 2026-09-02: the skill has a third home, and it is the one that loads

`interface-responsiveness` is installed at `~/.claude/skills/interface-responsiveness/` as a **full
directory copy, not a symlink**, dated 2026-08-20. All seven reference files are present.

`md5sum` of the installed `references/MOTION-SYSTEM.md` and the `udesign-docs` original:

    ece8deb098c95fd713876412268b7812  ~/.claude/skills/.../MOTION-SYSTEM.md
    ece8deb098c95fd713876412268b7812  udesign-docs/skills/.../MOTION-SYSTEM.md

Byte-identical. **Which means the installed copy carries the same six drifted motion values** (I1).
Every agent that loads this skill today is being served easing curves that do not match
`dist/tokens.css`.

Three consequences:

1. **The fact has three homes, not two.** The inventory found `udesign-docs` and the design system.
   The installed copy is a third, it is invisible to both repos, and it is the one with runtime
   authority - the skill loads by name from the user's skill set, not from either working tree.
2. **Reconciling `udesign-docs` will not fix it.** A copy taken by hand does not follow its source.
   S1 must reconcile the source **and re-install**, then say so in the ledger.
3. **It sharpens research §6 item 4's argument for leaving the skill in `udesign-docs`.** That
   argument was "the skill loads by name from the user's installed skill set regardless of which
   repo holds the canonical copy". True, and it cuts the other way too: because it loads from the
   installed set, *neither* repo can keep it correct. The split in Δ-04 is still right, and it now
   carries a re-install step.

This is the same failure class as `udesignpages/tools/sync-canon.mjs` was written to prevent (F5),
occurring in the one place nobody looked: the agent's own skill directory.
