# UDesign Design System v2.0.0: the design language implementation plan

**Date:** 2026-08-29 (written 2026-09-01)
**Status:** approved to execute. Nothing in this plan carries `NEEDS-APPROVAL`.
**Revised 2026-09-02:** Phase 2 was rewritten after D-19 replaced D-05. See `DECISIONS.md` round 6.
**Revised 2026-09-25:** item 0.7 added (D-21), item 2.7 added (D-22), two checker rules added
(Δ-07), and the `udesign-docs` tag number corrected. See `DECISIONS.md` round 7.
**Revised 2026-09-26:** Phase 4 now executes before Phase 3 (D-26). Phase numbers are unchanged so
every existing item citation still resolves.
**Evidence:** [`docs/research/2026-08-27-design-language-transmission.md`](../../research/2026-08-27-design-language-transmission.md)
**Brief:** [`docs/research/2026-08-29-v2-plan-brief.md`](../../research/2026-08-29-v2-plan-brief.md)
**Decisions and their provenance tags:** [`docs/v2/DECISIONS.md`](../../v2/DECISIONS.md)
**Operation map and ledger:** [`docs/v2/OPERATION.md`](../../v2/OPERATION.md)

None of those are restated here. This plan cites them and does not repeat them.

---

## 1. The two acceptance tests

Every item below is scored against these, honestly, including when the answer is "neither".

**P1: "use the design system."** A fresh agent, given only that sentence and a path or a package,
produces UI a designer would accept without correction.

**P2: "fix all drifted stuff or anything that doesn't respect the current design system."** A fresh
agent, given only that sentence and a consuming repo, finds and reports real violations without
inventing rules and without a human explaining what the design system wants.

Both must work for **both consumption models**: React (GlobalVision) and static HTML generators
(udesignpages).

The single sentence to keep in view: **an agent given one line and no context should not be able
to build the wrong thing.**

---

## 2. Two corrections to the source documents

Both were verified against `HEAD` (`75c9271`) and are recorded with their checks in
[`docs/v2/_orchestrator-verification.md`](../../v2/_orchestrator-verification.md).

**The research report has two wrong line numbers.** The findings are real; the coordinates are not.
`table.tsx:69` does not exist (the file has never exceeded 53 lines); the defect is at
**`registry/new-york/ui/table.tsx:34`**. `slider.tsx:116-123` does not exist; the defect is at
**`registry/new-york/ui/slider.tsx:30-37`**. Use the corrected coordinates.

**The plan brief overstates one constraint.** §3.2 says making the profiles behaviorally different
means breaking the byte-identical motion guarantee. That is true for a *motion* fork and false for a
*density* fork: `tests/token-contract.test.mjs:168` derives its token list from `--motion-*` and
would not fire on a spacing or control-height change. The real blocker is different and worse, and
it is item 0.5 below.

---

## 3. Correction to the segment map

`OPERATION.md` §3 had five segments and no owner for the profile work. **D-14 inserts S1.5.** Six
segments now: S0, S1, **S1.5**, S2, S3, S4. D-19 later rescoped S1.5 from a token fork to an
archetype fork; the segment boundary was right, only its contents changed.

One further correction, **proposed here rather than approved**, because it costs nothing and needs
no new session: **Phase 0 below is enforcement work that `OPERATION.md` assigns to S3, and it should
run at the top of S1 instead.** It is about two hours of work, it fixes bugs currently shipping, and
none of it depends on anything S1 decides. Leaving it in S3 means the release ships four known
defects for three more segments. S3 keeps the portable checker, which is the part that actually
needs rules to check.

---

## 4. Phases and cut lines

Ordered by leverage per hour, not by architecture. Stop after any phase and the result is coherent.

**Execution order is 0, 1, 2, 4, 3, 5** (D-26). Phase 4, the checker, runs before Phase 3, the CSS
layer, because Phase 3's verification requires it. The numbers are kept rather than renumbered, for
the same reason as D-17: items 3.x and 4.x are cited across the plan, the ledger and both repos.

### Phase 0: stop shipping the wrong thing

**Runs at the top of S1. About two hours. Depends on nothing.**

Every item here is a correctness bug in something already published.

| # | Item | Files | Size | Verification | P1 | P2 |
|---|---|---|---|---|---|---|
| 0.1 | Version pins `1.3.0` to `2.0.0` | `README.md:9,50,81,95,101` | 5 strings | A release-script assertion that no `vX.Y.Z` in `README.md` is older than `package.json.version`. Fails on today's tree, passes after. | **Critical** | no |
| 0.2 | Ship `AGENTS.md` | `package.json:9-20` | 1 line | `npm pack --dry-run` lists `AGENTS.md`. It does not today. | **Blocking** | no |
| 0.3 | Fix the three shipped defects | `select.tsx:18`, `table.tsx:34`, `slider.tsx:30-37` | ~10 lines | The three tests in 0.4, red before and green after. | yes | yes |
| 0.4 | Three machine-checkable tests | `tests/motion-adoption.test.mjs` or a sibling | ~60 lines | Each fails on today's tree. `press-implies-focusable` catches `table.tsx`; `focus-visible-not-focus` catches `select.tsx`; a **derived** `PRESSED` list catches `slider.tsx` and every future primitive. | yes | yes |
| 0.5 | Close the touch-target hole | `tests/token-contract.test.mjs:129-130` | ~10 lines | Add a functional `--control-height: 36px` override: the test must fail. **Today it passes**, because `assert.match` runs against the whole file and the presentation block satisfies it. | no | yes |
| 0.6 | Stop the routing canon's tag range going stale | `WEBDEV/CLAUDE.md` | 1 line | The file says `v0.4.0`; `git tag` in `udesign-docs` returned `v0.6.0` on 2026-09-01 and `v0.8.0` on 2026-09-25. It has fallen four tags behind in a month. **Replace the hard-coded range with "tagged; `git -C udesign-docs tag` lists them"** so it cannot go stale again. That file's own rule 1 is "write rules, not changelogs", and a tag range is a changelog. | no | yes |
| 0.7 | Make a padding override actually win in `Dialog` and `Sheet` (D-21) | `dialog.tsx:30`, `sheet.tsx:37` | ~4 lines + test | Move `sm:p-6` into a variable, `p-[var(--dialog-padding)]`. A test renders `DialogContent` with `className="p-0"` and asserts no breakpoint padding class survives `cn()`. **Today it fails:** tailwind-merge treats `sm:p-6` and `p-0` as different classes, so the override half-works (0 on phones, 24px on desktop). | yes | yes |

**0.4 is the item to write carefully.** The existing `PRESSED` array at
`tests/motion-adoption.test.mjs:77` is a hand-maintained literal, which is why `slider.tsx` and
`table.tsx` were never covered. Derive it instead: any file rendering a `<button>`, `role="button"`,
or a Radix `Trigger`/`Item` must have a press treatment or a **named** exemption. Fail closed, same
shape as the existing `EXEMPT` map. That converts a list someone must remember to update into a
guard that covers primitives nobody has written yet.

Per `udesign-docs/skills/interface-responsiveness/references/ENFORCEMENT.md:5`: prefer a cheap rule
with no false positives over a clever rule that needs judgement. All three are greps.

> **Cut line 0.** Stop here and the repo no longer ships five known defects, the README installs the
> right version, and four real bugs can no longer regress. Nothing about the design language has
> improved. This is a bug-fix release, and an honest one.

---

### Phase 1: the language gate and the boundary

**S1. The single highest-leverage phase in the plan, and it is almost entirely text.**

Research §6 items 1-4 and §7.7 A/B are the seed. The decisions are D-03, D-07 through D-13, D-15,
D-17, D-18.

#### 1.1 `AGENTS.md` becomes the entry gate

**Files:** `AGENTS.md` (rewrite), new `docs/TOOLING-PITFALLS.md` (the CRLF and npm content moves
there). **Size:** ~2 KB. **Depends on:** 0.2.

The highest-pickup file in the repo currently contains zero design-language content
(research §1.1, §3.1). It must carry, in its first 400 bytes: the feedback floor, the press rule,
the pending rule, the motion-token rule, the accent budget (D-09), and the profile decision rule
(D-07). Then a read order, then a pointer to the pitfalls file.

**Verification:** a cold-read check. An agent given only `AGENTS.md` can state the accent budget and
name the correct profile for "an internal production scheduling screen". Today it can do neither:
`grep -i profile AGENTS.md` returns zero matches.

**P1: critical.** **P2: yes**, since it is also where an auditing agent learns what to audit for.

#### 1.2 Emphasis and hierarchy in `DESIGN.md`

**Files:** `DESIGN.md`, a new section before `## Components`. **Size:** ~15 lines.

The base rule needs no approval: it is grounded in the observed catalog incident (research §7.7 A).
The per-profile extension is D-09, `APPROVED`.

**Use the approved wording exactly.** For `operations`:

> In `operations` the accent never appears in chrome, navigation, or any repeated block.
> It marks the one action that commits work.

**Do not** write "a screen with no accent at all is correct and common." That phrasing was put to
Kaleb in round 5 and rejected, because it reads as an argument for less and contradicts D-11. See
D-09 and D-11 before drafting this section.

**Verification:** re-run the incident. Given the catalog brief and this section, an agent picks the
low-emphasis variant for a repeated card CTA. Countable, so the checker (Phase 4) enforces it.

**P1: yes, this is the item that addresses the only failure observed in production.** **P2: yes.**

#### 1.3 "Use when" on every variant

**Files:** `DESIGN.md` `## Components`, around lines 294-302. **Size:** ~15 lines.

Research §7.7 B. Today each entry states what a variant is *made of*; `button-secondary` and
`button-outline` state no purpose at all, which is the ambiguity that split three parallel agents.
Add one Carbon-shaped clause each: name, then situation. This is the `$description` pattern of
research §4.3 applied to components instead of tokens, placed at the exact point of decision.

**Verification:** every variant in the list answers "when do I reach for this?" in one clause.

**P1: yes.** **P2: partly**, it gives an auditor a stated intent to measure against.

#### 1.4 The personality bodies

**Files:** `DESIGN.md`, two clearly separated sections. **Size:** ~40 lines total. **Decisions:**
D-11 (visual conviction), D-12 (voice in the UI), D-13 (the accent is named by role).

D5 requires these stay two bodies, not one. They are different kinds of knowledge.

**Every sentence carries a tag.** `CANON` with a file:line, or `APPROVED` with the date. This is the
section most likely to grow an unsourced adjective, and the approval protocol exists for it.

Three constraints S1 must not violate:

- **D-11's conviction is `APPROVED`, not `CANON`.** It is an agent's translation of verbal tone into
  a visual position. Reproduce that tag when citing it.
- **"Simplicity over minimalism" is dictated and binding.** Read the whole draft against it. Any
  sentence treating emptiness, whitespace, or element count as a virtue contradicts an approved
  conviction. Density is not a fault in `operations`.
- **D-12 declined the UI-copy extension.** Errors saying what to do next, empty states saying what
  to do, never blaming the user, labels naming the action: all offered, all declined. Do not write
  them. `udesign-ground-truth.md:142-147` governs, verbatim, and nothing is added to it.

**Verification:** zero untagged claims. A grep for the tags returns a count equal to the number of
normative sentences in both sections.

**P1: yes.** **P2: partly**, voice rules are checkable, conviction is not.

#### 1.5 One merged ban list

**Files:** `DESIGN.md` `## Banned design patterns`; the four other lists become pointers.
**Size:** ~40 lines. **Decisions:** D-10, D-17.

Five lists across three repos, no stated precedence, only one numbered (Investigation B, I6).
Merge into one numbered superset in `DESIGN.md`.

**D-17: append, never renumber.** The contract's 19 keep their numbers exactly; the rest merge in as
20, 21, 22 and onward. Nothing citing "ban 16" breaks. The list will not be in tidy thematic order.
That is the accepted cost, stated in D-17. Sub-headings are fine; renumbering is not.

Add the D-10 visual AI-tells as new numbers: generic sans plus slate plus gradient, decorative
gradients manufacturing hierarchy, glassmorphism, uniform emphasis everywhere.

**Verification:** every ban in every prior list appears exactly once in the merged list; the four
other locations contain a pointer and no restated ban.

**P1: yes.** **P2: critical**, this is the enumerable surface an auditing agent walks.

#### 1.6 The profile rename, the decision rule, and pin-once

**Files:** `DESIGN.md:105-135`, `README.md:72`, `AGENTS.md`, `scripts/build.mjs:429-438`,
`tokens/functional.tokens.json`. **Size:** ~30 lines plus the alias strings.
**Decisions:** D-07, D-08.

`brand` becomes `presentation`; `functional` becomes `operations`. The name carries the decision
rule: **is this presented to someone, or operated by someone?**

Keep `data-design="brand"` and `"functional"` as selector aliases for one release. One extra string
per block at `build.mjs:429-438`.

Pin-once is promoted system-wide: one profile per document, declared once at the root, never
switched at runtime, never nested. `DESIGN.md:133` narrows to theme-only nesting. `README.md:72`'s
runtime switching is restricted to **review and documentation surfaces only**, which is what the
showcase already does, so nothing is rebuilt.

**Verification:** `data-design="brand"` still resolves after the rename (alias test); an agent given
"an internal production scheduling screen" and only `AGENTS.md` picks `operations`.

**P1: yes.** **P2: yes.** **Breaking change**, carries a migration note.

#### 1.7 Delete the false density claims

**Files:** `DESIGN.md:125`, `DESIGN.md:129`, `README.md:12`. **Size:** 3 edits.

They promise "generous section spacing", "tighter spacing", and "density profiles". None of it
exists, and `scripts/build.mjs:289-296` makes it structurally unemittable. **Delete the claims in
Phase 1**; Phase 2 adds the true ones back once the fork ships. Two edits rather than one, on
purpose: if the operation stops at cut line 1, the docs must not still be lying.

**Verification:** grep for "spacing" and "density" in the profile sections returns only claims the
compiled CSS supports.

**P1: yes**, a false claim is worse than a missing one, because an agent will try to use it.
**P2: yes.**

#### 1.8 The boundary migration

**Files:** across `udesign-design-system` and `udesign-docs`. **Size:** the largest text item in the
phase. **Decision:** D-03, plus Δ-01 through Δ-05.

The rule, approved:

> **A fact belongs to `udesign-design-system` if a reader must know which version of the design
> system is installed in order to apply it correctly; otherwise it belongs to `udesign-docs`.**

Full inventory, the ten ranked inversions, and the migration list are in
[`docs/v2/_investigation-B-boundary.md`](../../v2/_investigation-B-boundary.md). The items that
matter most:

- **M1 is the most urgent thing in this plan after Phase 0.**
  `udesign-docs/skills/interface-responsiveness/references/MOTION-SYSTEM.md` has drifted **six ways**
  from `dist/tokens.css`, all six verified. It moves here as `docs/motion-contract.md` and is
  reconciled against the shipped values. **This is P2-fatal today**: an agent told "fix all drifted
  stuff" that reaches this file produces six false findings and may correct working code to match a
  wrong document. It fails P2 in the worst available way, by manufacturing violations rather than
  missing them.
- **M2** `ENFORCEMENT.md`'s rule list (R1-R7) becomes the Phase 4 checker spec.
- **M3** `udesign-contract.md:37-93`, the stale token vocabulary that still declares v1.3.1 as its
  source while GlobalVision runs v1.5.0. Deleted, replaced by a pointer.
- **M10** `DESIGN.md:312`'s dangling forward reference becomes a real tagged link. One line, and it
  closes research §2.2 from the package side.
- **D-18** strips `udesign-contract.md:249-317`, about 70 lines of GlobalVision implementation
  detail, and leaves a one-line pointer. The content survives in git history and the `v0.6.0` tag.
  **Accepted cost: GlobalVision's contract has a hole until someone there acts, and that someone is
  not this operation.** Migration note.
- **Δ-04** `interface-responsiveness` is **split, not moved**. `MOTION-SYSTEM.md` and the R1-R7 list
  come here; `SKILL.md` and the other five references stay. This preserves `globalvision/AGENTS.md:14`,
  the one routing instruction in the entire stack that was ever actually followed.
- **Δ-01** the gamification skill's "Level 3" contradicts `DESIGN.md:276` and is corrected.
- **Δ-02 and Δ-03** every `udesignpages`-sourced migration item is **struck, not deferred** (D-04).

**Hard dependency, and S1 may not split it out.** Investigation B's two-entry-point check passes
**only if 1.1 and 0.2 ship with this migration.** Deferring the entry-file rewrites as "cheap text
edits for later" leaves content moved and no route built to where it went, which is worse than the
status quo. Content and routing move together or neither moves.

**Verification:** two read paths, each traced end to end. From `udesign-design-system/AGENTS.md` to
the full picture in two hops. From `udesign-docs/AGENTS.md` in three. Both are broken today, at hop
zero, in both directions.

**P1: yes.** **P2: critical.**

#### 1.9 The one ground-truth edit

**Files:** `udesign-docs/business/udesign-ground-truth.md` §5. **Size:** one line.
**Decision:** D-15, approved verbatim.

> **Visual tone:** considered, not decorated. Premium shows through restraint and precision, never
> ornament. Never cheap or template-made, never provisional or unfinished. Simplicity over
> minimalism: a dense working screen is correct.

Word for word. The file is edit-restricted and this is the only edit to it in the entire operation.
The final clause is load-bearing: without it "restraint" gets read as "use less" and `operations`
gets quietly minimalised by the next agent that touches it.

**P1: yes.** **P2: no.**

#### 1.10 The unused channels

**Files:** `registry.json` (`docs` field on ~7 items), `scripts/build.mjs` (~15 lines).
**Size:** ~600 bytes plus the emitter. **Research:** §1.7, §6 items 5 and 6.

The `docs` field is populated on **0 of 28** items and fires at the exact moment an agent installs a
component. `$description` is authored, better than Carbon's, and thrown away at build. Emit it as a
trailing CSS comment for the `motion`, `interactive`, and `tone` families.

Put the **accent budget** in `core`'s `docs` text, not just the press and pending rules. Research
§7.6 scored the original draft as "no" against the incident precisely because it was all feedback.

**Verification:** `shadcn add @udesign/core` prints the rules; `grep "Press compression"
dist/tokens.css` returns a hit. Both return nothing today.

**P1: yes**, this is the only channel that reaches entry path (d), the worst path in research §3.1.
**P2: no.**

#### 1.11 Make the em-dash ban true

**Files:** `AGENTS.md` (9 occurrences), `.cursorrules` (2), `.gemini/rules` (2),
`scripts/lint-design.mjs:58`. **Size:** small.

The two files that *state* the ban both break it, and the linter only scans `DESIGN.md`
(research §1.8). Widen the scan to every instruction file and component source, then fix the
violations. D-12 makes this a brand rule rather than a style preference, which is what justifies
spending the time.

Note the sibling docs written before this plan (`OPERATION.md`, the research report, the plan brief)
contain em-dashes. Widening the lint to `docs/` would redden them. **Scope the lint to instruction
files and source**, and leave the research record alone.

**P1: no.** **P2: yes**, small and countable.

> **Cut line 1.** Stop here and this is a complete, coherent release. The design language is
> reachable from both entry points, the boundary is stated and applied, the composition rules exist,
> the personality is written and sourced, and the docs no longer contain a false claim or an
> inverted authority. The profiles are still one design language with two surface treatments, and
> static HTML is still ungoverned below the token layer. **This is the phase to ship if the
> operation has to stop early.** It addresses the only failure observed in production.

---

### Phase 2: the profile archetype

**S1.5. About 7-9 engineering days. Decisions: D-19 (supersedes D-05), D-20, and D-22 (amends D-19).**

Depends on Phase 1 (the rename lands first) and on item 0.5.

**Why this replaced the token fork.** The two profiles currently share the same type scale *shape*:
each step measured against that profile's own body size is within 5%, and `h2` is identical at
1.60x in both. Operations is presentation multiplied by 0.875. Combined with 21 of 30 identical
light colour roles, an identical body typeface, and locked motion, the profiles are **one design at
two zoom levels.** Forking `--space-*` and `--control-height` on the same curve would have produced
the same design at 80% zoom for 8-9 days. D-19 forks the structure instead.

The finding underneath it: **there is no layout or page-shell primitive anywhere in the registry.**
27 components, zero structural. `responsive-collection` swaps a table for cards; nothing owns the
page. Composition today means whatever the consumer invents, which is exactly how three catalogs
diverged from one template (research 7.1).

| # | Item | Files | Verification |
|---|---|---|---|
| 2.1 | Fork the type scale **shape** | `tokens/functional.tokens.json` | `presentation` display-to-body ratio rises toward ~3.5x, `operations` falls toward ~1.7x. A contract test asserts the two *shapes* differ, not just the sizes: no step may sit within 5% of its counterpart. |
| 2.2 | Fork the hierarchy mechanism | tokens, `DESIGN.md` | `operations` radius reaches **0px** (from 2px); elevation stays zero; a stated rule says presentation draws hierarchy from space and elevation, operations from structure. |
| 2.3 | `PageCanvas` and `AppShell` | `registry/new-york/ui/`, `registry.json` | Both render; registry goes 27 to 29 components, 28 to 30 items. The registry contract test covers them. |
| 2.4 | Numeric treatment | the two shells, `table`, `metric-card`, `badge` | Every number in `operations` resolves to `--font-data` with `tabular-nums`. Used in 2 of 27 components today. |
| 2.5 | Selector aliases | `scripts/build.mjs:429-438` | `data-design="functional"` still resolves after the rename. |
| 2.6 | Restore the density claims, now true | `DESIGN.md:125,129`, `README.md:12` | Each claim is satisfied by the archetype, worded to describe structure rather than a spacing token that does not exist. |
| 2.7 | A density axis inside `Card`, `Dialog`, `Sheet` (D-22) | `card.tsx:11,26,31`, the variable from 0.7, tokens | All three read their padding from one variable. `operations` (or `AppShell`) sets it compact; `presentation` keeps 24px. A test asserts the operations value is smaller, and that `--touch-target-min` and `--control-height` stay 44px in both. |

**2.4 does not touch D-02.** The ban at `DESIGN.md:223` is on *wide-tracked uppercase* mono labels,
not on mono. JetBrains Mono is already `font.family.data` in both profiles and `.ud-data` ships it
today. Mono in sentence case at normal tracking has always been legal; it has simply never been used
systematically.

**What the fork must still not do.** D-02 is reaffirmed, not relaxed: the uppercase-mono-label and
cold-slate-neutral bans are absolute in both profiles. `DESIGN.md:223`, `:358`, `:361` stand. So does
the motion lock, which is the one part of D-05 that survives.

**What D-19 removed, and it is worth noticing.** No `--space-*` fork, no `--control-height` fork, and
therefore **no `(pointer: fine)` guard** and no accessibility cost. `--touch-target-min` and
`--control-height` stay 44px in both profiles. Migration notes MN-2 and MN-3 are struck.

**Correction, 2026-09-25: the shell alone does not deliver density.** This section originally said
density "falls out of a fixed-viewport app shell for free". Field evidence from GlobalVision
([`_evidence-functional-density.md`](../../v2/_evidence-functional-density.md)) showed otherwise. The
waste measured on a real operations screen was inside `Card` (`p-6`) and `Dialog`/`Sheet`
(`sm:p-6`), and those render the same in any shell: 1 of 7 tracking events fit without scrolling
before the local fix, 7 of 7 after. D-22 therefore extends D-19's hierarchy fork into the
components (item 2.7). Only padding moves, so the 44px floor and D-19's reason for dropping the
token fork both still hold.

**Scoring, honestly.** **P1: yes**, and unlike D-05 this is a real yes. An agent given "use the
design system" and an operational brief now gets a page *structure*, not just styled fragments, and
structure is what three parallel agents each invented differently. **P2: yes**, because a checker can
assert that an operations screen sits in an `AppShell` and a presentation screen does not.

This phase is no longer the one that scores worst. That was the point of replacing it.

> **Cut line 2.** Stop here and the two profiles read as different products rather than two zoom
> levels, the system owns page structure for the first time, and React consumers get the whole
> benefit. Static HTML still has no governed components below the token layer.

---

### Phase 3: the CSS component layer

**S2. The largest build. Decision: D1 in the plan brief; research §7.8 is the diagnosis.**

Depends on Phase 2 and **Phase 4** (D-26). Building component classes against geometry that is still
moving is how the two drift apart in week one, and building them without the checker that will
judge them leaves the verification below unrunnable.

#### 3.1 Scope: do not mirror 27 components

The maximal reading of D1 is a CSS mirror of all 27 registry components. That is almost certainly
wrong and should be argued down explicitly.

**Mirror only what a static-HTML generator actually reaches for**, evidenced by what `udesignpages`
invented for itself: the button family first, then card, badge, table, field and input, empty state.
Investigation B has the census. Anything a generator has never needed is a candidate for the skip
list, and the plan should say so per component rather than mirroring by default.

**The two shells are the exception, and they are not optional** (D-20). `PageCanvas` and `AppShell`
get CSS-class equivalents even though no generator has asked for them, because no generator knew to
ask: the divergence that started this operation was three agents inventing three page structures.
Shipping the shell is what makes "use the design system" produce a correctly *structured* page
rather than correctly *styled* fragments. The scope warning still binds every control; it does not
bind these two.

Note the current CSS surface is **seven typography utilities** (`dist/tokens.css:555-561`). This is
designing a real surface from near zero.

#### 3.2 The class API

`.ud-btn` is the name the consumer already uses across 71 files. **Take that name.** Do not invent a
parallel vocabulary and force a migration for aesthetics; the goal is that the classes generators
already write become governed rather than invented.

Per-profile scoping is **not a new architecture**: `scripts/build.mjs:382-408` already emits
`.ud-*` twice, once plain and once scoped to the operations selector (`dist/tokens.css:564-570`).
Extend the existing mechanism.

#### 3.3 Lockstep, cheaply

The brief asks how the CSS layer stays in lockstep with the React registry so the two cannot drift.

**The answer is not codegen.** Generating CSS from Tailwind class strings across variants, sizes and
states is a build system nobody will maintain, and pixel parity was never the goal.

**Behavioral parity is the goal, and a test buys it.** Point the existing assertions at the CSS:
every component class with a press treatment also has a `:focus-visible` rule; every transition
names a `--motion-*` duration; no raw hex, no `--ud-*` primitive. These are the same rules
`tests/motion-adoption.test.mjs` already enforces over TSX, re-aimed at a stylesheet. Plus one
name-parity test: the set of mirrored component names matches a declared list, so adding a React
component without its class fails.

That gets "cannot drift on the things that matter" for about 60 lines and no new build step.

#### 3.4 Distribution to a zero-dependency consumer

`udesignpages` has **no npm dependencies** but real Node scripts, and it already owns
`tools/sync-canon.mjs`, which copies canon out of `udesign-docs` **byte-identically** because a
previous hand-paraphrase silently dropped a rule in production.

**That is the pattern.** Ship the stylesheet; consumers sync it byte-identically and assert
identity. It is a precedent Kaleb already owns and trusts, and it is the org's own worked answer to
the one-home rule when a fact must physically exist in two places.

**Verification:** a generated catalog page built from the shipped classes passes the Phase 4 checker
with zero findings. Today the same page fails on the press state alone (Δ-03).

**P1: critical for the static-HTML consumption model**, which currently cannot work at all.
**P2: critical**, since P2 cannot see generated HTML until the components in it have an upstream.

> **Cut line 3.** Stop here and both consumption models are governed. A static-HTML generator gets
> real components instead of inventing them. Nothing yet audits a consumer automatically.

---

### Phase 4: the portable checker

**S3. Runs before Phase 3 (D-26). Decision: D2. Seed: research §7.7 C and `ENFORCEMENT.md`'s R1-R7
(migration item M2).**

Depends on Phase 2, for the `AppShell` rule. **Not** on Phase 3: the static-HTML rules target the
`.ud-btn` class family that Phase 3.2 adopts from `udesignpages` unchanged, so they can be written
and proven against today's generated catalogs. When S2 lands, this checker is its acceptance test.

**The language question is settled by evidence, not preference.** Both consumers run Node:
`globalvision/package.json` pins the design system (currently at v1.5.0) and `udesignpages` has zero
dependencies but real Node scripts. Ship the checker as a `bin` in this package, run it with `npx`.
It reaches the React consumer directly and the zero-dependency consumer without forcing a dependency
on it. **No Python port. No second implementation.**

**What it checks**, in priority order, all of them cheap greps with no judgement:

1. The accent budget (D-09): count accent-filled controls per rendered page; flag any inside a
   repeated block. **This is the only rule in the whole plan that would have caught the catalog
   incident automatically, without any agent reading anything.**
2. Press implies focusable; `focus-visible` not `focus`.
3. Raw durations, raw easings, raw hexes, `--ud-*` primitives in consumer source.
4. Color-only status.
5. The em-dash ban (D-12).
6. The accent named by colour (D-13).
7. Profile pinned once at the root, never nested (D-08).
8. A padding override (`p-0`, `px-0`, `py-0`) passed to a component whose base class carries a
   breakpoint-prefixed padding (Δ-07). 0.7 fixes the registry's own `Dialog` and `Sheet`, but
   consumers carry local forks (GlobalVision's `card.tsx` and `dialog.tsx` are shadcn v4, not the
   registry versions), so the rule still earns its place.
9. A Tailwind class name built at runtime with `.replace()` or a template string from another
   class name (Δ-07). Tailwind only generates classes that appear literally in source, so these
   render nothing. GlobalVision shipped a transparent stage connector this way and no lint saw it.

**The governing principle is `ENFORCEMENT.md:5`:** prefer a cheap rule with no false positives over
a clever rule that needs judgement. A checker that cries wolf gets switched off, and then P2 is worse
than it was before the checker existed.

**Verification:** run it against the three real catalogs. It must flag the known-divergent one
(`019e34a7`) and pass the other two. That is a controlled experiment that already happened, with a
known right answer, and it is the best test available anywhere in this operation.

**P1: no.** **P2: this is what makes P2 real rather than aspirational.**

> **Cut line 4.** Stop here and P2 works. An agent given one sentence and a consuming repo produces
> a real violation report. Reference screens do not exist yet, so P1 still relies on prose.

---

### Phase 5: reference screens and the release

**S4. Research §6 item 3, amended by §7.7 D.**

**One reference screen per profile**, plus **one static-HTML reference** since Phase 3 creates a
second consumption model that needs its own ground truth. Add `examples/` to `package.json` `files`.

**§7.7 D is the part that matters and it is easy to lose:** the reference screen must *exercise*
restraint, with a comment saying so. Row-level actions are low emphasis; at most one accent-filled
control on the whole screen. A screen that happens to be restrained teaches nothing when an agent
copies only the part it needs.

The `operations` reference is the one that carries D-11's dictated conviction: it should be a dense
working screen that is obviously correct, because "simplicity over minimalism" is far easier to
transmit by example than by sentence.

Then: `CHANGELOG.md`, the migration notes below, and `v2.0.0`.

**P1: yes.** Research §5.2 argues a worked reference is the single most token-efficient way to
transmit feel, and Atlassian's measured finding was that prose alone caused agents to recreate
components rather than reuse them.

> **Cut line 5.** The operation is complete.

---

## 5. Skip list

Named, argued, and skipped. A plan that never says "skip this" was not thinking.

| # | Item | Why skip |
|---|---|---|
| 1 | **A dedicated MCP server** | Research §6 item 9. shadcn's own MCP works against any compliant registry with no server-side work and this repo already meets its only requirement. Tell consumers to run `shadcn mcp init`. Building and hosting a service to solve what Phase 1 solves with text is the clearest over-engineering available here. |
| 2 | **`llms.txt`** | Research §6 item 10. It is a documentation-website primitive; this is a repo with an `AGENTS.md`, which is the correct one. It would create a fifth partial copy of the rules to drift alongside the four Phase 1 just merged. |
| 3 | **A second Agent Skill in this repo** | Research §6 item 11. `interface-responsiveness` exists and is good. A design-system-local skill duplicates 80% of it and begins drifting immediately. Δ-04's split plus 1.1's routing line gets the whole benefit. |
| 4 | **Browser-level interaction e2e tests** | Research §6 item 12. They belong in the consuming application where real async and real routes exist. In a showcase with no network, "assert `aria-busy` within 100ms" asserts against a mock. |
| 5 | **Deleting `.gemini/rules`** | Research §6 item 13. Gemini CLI reads it; deleting it silently drops coverage. Reduce both it and `.cursorrules` to ~10 lines pointing at `AGENTS.md`. |
| 6 | **Codegen for CSS/React lockstep** | §3.3 above. A build system nobody maintains, for pixel parity that was never the goal. A 60-line behavioral parity test buys the part that matters. |
| 7 | **Mirroring all 27 components in CSS** | §3.1 above. Mirror what a generator actually reaches for. Anything never needed is speculative surface with a maintenance cost and no consumer. |
| 8 | **Renumbering the merged ban list** | D-17. Breaks every existing citation to buy tidiness. Appending solves it for free. |
| 9 | **Forking motion** | D-05. Offered at 11-13 days and declined. It trades the system's best-reasoned guarantee, one memorable sentence, for four numeric bounds. |
| 10 | **Fixing GlobalVision or udesignpages** | Plan brief §5, verbatim: *"its not your job to fix them."* They are evidence and test targets. Drift found in them becomes a migration note, never a plan task. |
| 11 | **Forking the body typeface** | Explored in round 6 as one of five differentiation levers. Not banned, and both profiles are Geist today, but it is the only lever carrying real brand-identity risk and the other four reach the goal without it. |
| 12 | **The `--space-*` and `--control-height` token fork** | D-19 dropped it: on the same type curve it produces the same design at 80% zoom, and it was the source of the `(pointer: fine)` accessibility cost. Density comes from the shell plus the component padding axis (D-22), which moves padding only and leaves the space scale and the 44px floor alone. |

---

## 6. Migration notes

Consumers pin by Git tag, so every breaking change needs one. This plan is not fixing consumers; it
is telling them what broke.

| # | Change | Who it affects | What to do |
|---|---|---|---|
| MN-1 | `data-design` values renamed to `presentation` / `operations` (D-07) | Any consumer setting the attribute. GlobalVision pins `functional`. | Old strings work as aliases for one release. Update at leisure, before v3. |
| MN-2 | ~~Pointer guard for sub-44px controls~~ | - | **Struck.** D-19 dropped the control-height fork. Both profiles stay at 44px; no guard is needed. |
| MN-3 | ~~Space scale forks by profile~~ | - | **Struck.** D-19 dropped the space fork. Density comes from `AppShell`, not from tokens. |
| MN-3a | Type scale **shape** forks (D-19, 2.1) | Any consumer with its own heading sizes | `presentation` heading-to-body contrast increases, `operations` decreases. Use the `typography.*` roles rather than hard-coded sizes. |
| MN-3b | `operations` radius reaches 0px (D-19, 2.2) | Consumers hard-coding radius | Use `--radius-*`. Operations corners are square, not 2px. |
| MN-3c | Two new primitives: `PageCanvas`, `AppShell` (D-20) | Both consumption models | Not breaking; additive. But a screen composed without a shell is now non-conforming and the Phase 4 checker will say so. |
| MN-4 | `udesign-contract.md:249-317` removed (D-18) | GlobalVision only | ~70 lines of its own implementation detail. Recover from `udesign-docs` git history or the `v0.6.0` tag and re-home it in GlobalVision. **GlobalVision's contract has a hole until it does.** |
| MN-5 | `MOTION-SYSTEM.md` moves and six values are corrected (M1) | Anything that read it | Six documented values were wrong. Code matching the old document was wrong; code matching `dist/tokens.css` was always right. |
| MN-6 | Merged ban list (D-10, D-17) | Anything citing a ban by number | Nothing breaks. Numbers 1-19 are unchanged by design. |
| MN-7 | `udesignpages/public/design-system/patterns.html` superseded (Δ-03) | udesignpages | Its `.ud-btn` has no `:active` state at all and violates ban 16. Replaced by the Phase 3 layer, with nothing owed to it in reconciliation. |
| MN-8 | GlobalVision's four doc pins report changed (Investigation B) | GlobalVision | Its own repin test flags them. Record only; do not schedule. |
| MN-9 | Registry fixes do not reach GlobalVision's `Card` or `Dialog` | GlobalVision | Its `components/ui/card.tsx` and `dialog.tsx` are local shadcn v4 forks with `data-slot` attributes, not the `@udesign` registry versions its `components.json` points at. 0.7 and 2.7 fix the registry; GlobalVision only benefits once it re-adds those components from the registry. |
| MN-10 | `Dialog`/`Sheet` padding now reads from `--dialog-padding` (D-21) | Any consumer passing padding overrides | Not breaking. A single `p-0` now wins completely, so the `p-0 sm:p-0 gap-0` workaround GlobalVision used can be reduced to `p-0`. `gap-4` is unchanged. |
| MN-11 | `udesign-docs` `v0.9.0` pairs with design system `v2.0.0` (D-24) | GlobalVision (design system `v1.5.0`, docs `v0.4.0`) | Stay on `udesign-docs` `v0.8.0` or earlier until moving to `v2.0.0`; move both pins in one change. At `v0.9.0` the contract no longer carries the ban list or the token vocabulary. |
| MN-12 | Ban 4 scoped by profile (D-23); bans 1 and 2 lose GlobalVision-only wording | Anything citing ban 4 | Numbers unchanged. `presentation` may elevate cards; `operations` keeps shadows for true overlays (ban 21). |

---

## 7. The honest scoring summary

Per plan brief §6 and the model of research §7.6.

| Phase | Cost | P1 | P2 | Would it have stopped the catalog incident? |
|---|---|---|---|---|
| 0 | ~2 hrs | critical (0.1, 0.2) | yes (0.3-0.6) | **No.** All feedback and version work. |
| 1 | ~3-4 days | **critical** | **critical** | **Yes**, 1.2 and 1.3 specifically. |
| 2 | 7-9 days | **yes** | yes | **Yes**, 2.3 specifically: the divergence was three agents inventing three page structures because the system owned none. |
| 3 | largest build | critical for static HTML | critical for static HTML | **Yes**, by giving the failing artifact an upstream. |
| 4 | ~2-3 days | no | **this is P2** | **Catches it**, automatically, with no agent reading anything. |
| 5 | ~3-4 days | yes | no | **Yes**, by imitation, if §7.7 D is honoured. |

**Phase 1 is the best hour-for-hour work in this document and it is almost entirely text.** Phase 2
is the most expensive, and after D-19 replaced the token fork with the archetype fork it is no
longer the one that scores worst. Its earlier form (fork `--space-*` and `--control-height`) scored
"partial / yes" and would not have stopped the incident; the archetype form scores "yes / yes" and
would. That change came from Kaleb reading the plan and pushing back, and it is the single largest
improvement to this document.

If the operation must be cut to its best 20%, it is **Phase 0 plus Phase 1**: about a week, and it
addresses the only failure anyone has actually observed.

---

## 8. Open risks

1. **Phase 2 may still not deliver the felt difference.** D-19 addresses the measured cause (one
   design at two zoom levels) and adds the structural axis that was never forked. That is a much
   stronger position than D-05's, but it is still a prediction. D-02 remains absolute, so the two
   loudest prototype techniques stay off the table permanently. **Revisit at cut line 2 by looking at
   the two profiles side by side, not by re-reading this plan.** If they still read as one design,
   the remaining unexercised lever is the body typeface, which is skip-list item 11 and carries
   brand risk.
2. **Phase 3's scope can inflate, and D-20 just widened it once already.** 27 mirrored components is
   the wrong answer and the tempting one. The two shells are a deliberate, argued exception. Every
   further addition needs the same standard of evidence, and S2 should be made to give it.
3. **The checker can produce false positives and get switched off.** `ENFORCEMENT.md:5` is the
   governing principle. When in doubt, ship fewer rules.
4. **Phase 1's personality sections can grow unsourced adjectives.** Every sentence carries a tag.
   `docs/v2/DECISIONS.md` is the authority on which claims are approved and which are canon, and it
   distinguishes them deliberately.
