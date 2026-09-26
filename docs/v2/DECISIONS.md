# UDesign v2.0.0 - decision record

Every question put to Kaleb, his answer, and its **provenance tag**.

| Tag | Meaning |
|---|---|
| `CANON` | Already written in the canon. Cite the line. No approval was needed or sought. |
| `APPROVED` | Inferred, extrapolated or invented, and Kaleb said yes on the date shown. |
| `REJECTED` | Put to Kaleb and declined. Recorded because the rejection is itself load-bearing. |
| `NEEDS-APPROVAL` | Still open. S1-S4 may not build on it as settled. |

Provenance governs approval, not topic - plan brief §4. A statement without a tag in this file is
not something a later segment may treat as decided.

---

## Round 1 - 2026-09-01

### D-01 · Profile differentiation · `APPROVED` 2026-09-01

**Question:** how far should v2.0.0 close the gap between the profiles' intended difference and
the shipped artifact?

**Answer: differentiate the primitives, not only the composition.** Kaleb chose the expensive
option over the recommended one. Composition-only was declined as insufficient.

**Evidence this decision was taken against:** `docs/v2/_investigation-A-profiles.md`.
Cost 7-13 eng-days, ~25-40 files, against 4-6 days for composition-only.

**Two corrections that survive into the plan regardless of scope, both re-verified by the
orchestrator** (`docs/v2/_orchestrator-verification.md`):
- `tests/token-contract.test.mjs:168` is scoped to `--motion-*` and would **not** fire on a
  density fork. Plan brief §3.2's stated constraint is true only for a motion fork.
- `tests/token-contract.test.mjs:129-130` asserts `--control-height: 44px` file-wide rather than
  per profile block, so a functional override to 36px passes today. **A live hole, independent of
  this decision.** It must be closed before any primitive fork, or the touch-target contract dies
  silently in one profile.
- `scripts/build.mjs:289-296` gates `--space-*` behind `emitPrimitives`, on for brand and omitted
  for functional (`:429`, `:431`). Density is currently **structurally unemittable**. Fixing this
  gate is a precondition of D-01, not an optional cleanup.

**Which axes fork is not settled by this answer.** See `NEEDS-APPROVAL: fork axes`, round 2.

### D-02 · The visual bans stay absolute · `APPROVED` 2026-09-01

**Question:** are the uppercase-mono-label and cold-slate-neutral bans absolute, or absolute only
in the presentation profile?

**Answer: both absolute, in both profiles.** `DESIGN.md:223`, `DESIGN.md:359` and `DESIGN.md:361`
stand as written. No profile-conditional exemption.

**Consequence, and it is the constraint that shapes D-01's implementation.** Investigation A
measured that the brutalist prototype's look is carried mainly by 50 `font-mono`, 8 `uppercase`
and 4 `tracking-wider` in one file, plus cold near-black greys. All of that is now permanently
out of scope. **The profiles therefore cannot be differentiated through typographic treatment or
palette temperature.** Everything D-01 buys must come from density, spacing rhythm, control
dimensions, border weight, radius, shadow and - if approved - motion.

This pairing is coherent, not contradictory: dense, tight, sharp and hard-edged is reachable
through the space scale and control geometry without touching a banned technique.

### D-03 · The boundary rule · `APPROVED` 2026-09-01

> **A fact belongs to `udesign-design-system` if a reader must know which version of the design
> system is installed in order to apply it correctly; otherwise it belongs to `udesign-docs`.**

Chosen over topic-based ownership and over "fix the inversions, keep the split". It is the only
rule tested that predicts both live failures - the six-way motion drift and the v1.3.1-vs-v1.5.0
stale pin. Full argument, ten ranked inversions, test answers and migration list:
`docs/v2/_investigation-B-boundary.md`.

**Corollaries approved with the rule:**
- The losing side keeps a pointer and a one-line applicability statement, never a restated
  paragraph. Already the org convention - `udesign-docs/AGENTS.md:76-87`.
- **Enforcement location is not ownership.** The package already tests WCAG contrast, a W3C-owned
  number.
- **`interface-responsiveness` is split, not moved.** `MOTION-SYSTEM.md` and `ENFORCEMENT.md`'s
  rule list come to the design system; `SKILL.md` and the other five references stay in
  `udesign-docs`. This follows from the rule rather than being a separate choice, and it preserves
  `globalvision/AGENTS.md:14` - the one routing instruction in the stack that was ever followed.
- The 100ms feedback floor stays in `udesign-docs`. Perception research outlives any release.

**Hard dependency, stated by Investigation B and accepted here:** the rule passes the
two-entry-point check **only if both `AGENTS.md` rewrites and the `package.json` `files` change
ship with the migration.** Deferring them as "cheap text edits for later" leaves content moved and
no route built to where it went, which is worse than the status quo. S1 may not split them out.

### D-04 · `udesignpages` is not a source of truth · `REJECTED` 2026-09-01

**Question:** ratify `udesignpages/public/design-system/README.md`'s visual-conviction block as
canon? It claims (`:18`) to be "Pulled from real UDesign sources, not invented" and is the only
substantial written statement of UDesign's *visual* conviction anywhere in the stack.

**Answer, verbatim:** *"noo this is stale even if some things are true udesign pages doesnt really
have business truth it was created by lower capable agents with more hallucination"*

**This is the most consequential answer of round 1 and it invalidates a planned foundation.**
Consequences, all binding on S1:

1. **Nothing in `udesignpages` may be cited as canon.** Not the visual-conviction block, not
   `patterns.html`, not the dated plan documents Investigation B extracted brand rules from
   (M11, M12 in its migration list are **struck**, not deferred). The block's own sourcing claim
   is not evidence; that is precisely the failure mode being described.
2. **D5's visual-conviction body has no sourced foundation as of this decision.** It cannot be
   written by citing that block. Where it comes from instead is `NEEDS-APPROVAL: visual
   conviction source`, round 2.
3. **It independently strengthens D1.** Investigation B found `patterns.html:38-49` - labelled
   "COPY these blocks into each client page" - ships a `.ud-btn` with **no `:active` state at
   all**, violating `udesign-contract.md:231` ban 16 and `DESIGN.md:318`. That artifact is now
   confirmed as low-trust output rather than a de facto standard, so the CSS component layer
   supersedes it outright with no reconciliation owed to it.
4. **A general rule falls out, and it should be written down in S1:** provenance is not
   established by a document asserting its own provenance. Agent-authored content in a consumer
   repo is evidence of what an agent did, never of what UDesign wants.

**Reading of the wider stack this forces:** the brand-voice extraction from
`udesign-docs/business/udesign-ground-truth.md` §5 is **unaffected** - it is edit-restricted canon
under `WEBDEV/CLAUDE.md` and was never sourced from `udesignpages`. That extraction stands.

---

## Round 2 - 2026-09-01

### D-05 · Which axes fork · `SUPERSEDED by D-19` 2026-09-02

> **Superseded.** The space-scale and control-height fork below was dropped in round 6 after a
> measurement showed it would deepen the problem it was meant to solve. **D-19 replaces it.**
> One part survives and is still binding: **motion does not fork.** Of the three preconditions,
> only #2 (the `:129-130` test hole) survives - it is a real defect independent of any fork and
> stays in Phase 0. #1 and #3 lapse with the token fork. Kept in full for the record.

**Original decision, 2026-09-01:**

**Space scale and control geometry fork. Motion does not.**

Forks per profile: `--space-*`, `--control-height`, border weight. ~8-9 eng-days, ~25-30 files.
Motion stays byte-identical, so `DESIGN.md:278` and `tests/token-contract.test.mjs:168` survive
untouched and no replacement invariant is needed. The full fork (motion included, 11-13 days, the
guarantee replaced by four numeric bounds) was offered and declined.

**Three preconditions this creates. All of them are S1.5's work.**

1. `scripts/build.mjs:429/431` - the `emitPrimitives` gate passes `true` for the brand block and
   omits it for functional, so `--space-*` is currently **structurally unemittable** in the
   functional profile. Nothing else in D-05 can happen until that gate opens.
2. `tests/token-contract.test.mjs:129-130` - the file-wide `assert.match` for `--control-height`
   and `--touch-target-min` becomes a per-block assertion. Until it does, the fork silently voids
   the touch-target contract in one profile. **This hole exists today, independent of D-05.**
3. **`--touch-target-min` stays 44px in both profiles.** A sub-44px `--control-height` in
   `operations` is legal only behind a `(pointer: fine)` guard. That guard is a new rule the
   system does not have, it is part of D-05's cost, and every consumer must honour it. Accepted
   knowingly - it was stated in the option Kaleb chose.

### D-06 · Visual-conviction sources, in precedence order · `APPROVED` 2026-09-01

Kaleb, verbatim: *"spec but mostly ground truth plus dictate"*.

1. `udesign-docs/business/udesign-ground-truth.md` - **primary.**
2. Kaleb's dictated words, recorded in this file with their date - see D-11.
3. `docs/superpowers/specs/2026-07-14-dual-design-system-spec.md` and `explorations/index.html` -
   **supporting only.** Usable, subordinate to the two above, never the sole basis for a claim.

`udesignpages` is excluded entirely, per D-04.

### D-07 · Profile names · `APPROVED` 2026-09-01

**`brand` → `presentation`. `functional` → `operations`.**

Both trace to existing text - `DESIGN.md:125` "presentation-led", `DESIGN.md:108` "Operational
tools", `spec:18` "operational ERPs" - so the names themselves are `CANON`; the choice between
candidates was Kaleb's.

The name carries the decision rule: **is this presented to someone, or operated by someone?**
That is the ambiguous-screen tiebreaker research §3.3 found missing, delivered in the identifier
rather than in a paragraph. Neither half reads to a model as the default, which was the documented
defect in `brand` (research §5.3).

**Breaking change.** `data-design="brand"` / `"functional"` are the shipped selectors and
GlobalVision pins them. Migration path: keep the old strings as selector aliases for one release
(one extra string per block at `build.mjs:429-438`), and carry a migration note.

### D-08 · Pin-once, promoted system-wide · `APPROVED` 2026-09-01

One profile per document, declared once at the root, never switched at runtime, never nested.
Promoted from the GlobalVision-scoped ratification at `udesign-contract.md:25`.

Consequent edits: `DESIGN.md:133` narrows to theme-only nesting; `README.md:72`'s runtime
switching is restricted to **review and documentation surfaces only** - the showcase legitimately
needs to display both, and it already works this way, so nothing is rebuilt.

The carve-out is a named boundary, not a judgement call. It matters more under D-05 than it did
before: once density and control height differ, a nested profile produces visibly broken layout
rather than merely inconsistent styling.

---

## Round 3 - 2026-09-01

### D-09 · Accent budget, per profile · `APPROVED` 2026-09-01

**Base rule - no approval needed.** Grounded in the observed catalog incident, research §7.7 A:
one accent-filled control per screen, not per card, not per section; a repeated element never
carries the accent.

**Per-profile extension - `APPROVED`, inferred not sourced.** `presentation` may spend one
accent-filled control per viewport. `operations` additionally forbids the accent anywhere in
chrome, navigation, or any repeated block.

**Approved wording for the `operations` clause (round 5, after the D-11 correction):**

> In `operations` the accent never appears in chrome, navigation, or any repeated block.
> **It marks the one action that commits work.**

The round-3 alternative - "a screen may legitimately have no accent-filled control at all" - was
put back to Kaleb in round 5 and **not selected.** It reads as an argument for less, which is the
reading D-11 corrects. S1 uses the positive-purpose form above and does not reintroduce the
scarcity phrasing.

### D-10 · Refusals: consolidate, plus the AI-tell rule · `APPROVED` 2026-09-01

The five ban lists across three repos (19 / 12 / 5 / 5 / 4 items, no stated precedence, only one
numbered) merge into a single numbered superset in `DESIGN.md`. See D-17 for how numbering works.

**Plus, approved as inference:** `udesign-ground-truth.md:144-147`'s *"Never: AI clichés /
AI-sounding phrasing"* extends from copy into the visual domain, naming the visual tells that read
as machine-generated - generic sans + slate + gradient, decorative gradients manufacturing
hierarchy, glassmorphism, uniform emphasis everywhere. The verbal half is `CANON` at `:144-147`;
the extension to visuals is `APPROVED`.

### D-11 · The positive conviction, and Kaleb's dictated correction · `APPROVED` 2026-09-01

**Approved statement: "Considered, not decorated."** Premium is shown through restraint and
precision, never through ornament. Nothing on the screen is there to look impressive; everything
is there because it is doing a job.

Translated from `udesign-ground-truth.md:139-141` ("does not position itself as the cheapest
option - prioritizes getting the garment, decoration method, and finished result right") and
`:142` ("premium, honest, direct, transparent - results over promises"). **The translation is
`APPROVED`, not `CANON`.** The sources state verbal tone; reading them as a visual position is
inference that Kaleb signed.

**Approved refusals - two of the three offered:**
- **Never cheap, generic, or template-made.** Never looks like it came out of a template someone
  else also bought. Pairs with `:139-141` - the visual form of the one business claim UDesign
  already refuses to make.
- **Never provisional, unfinished, or uncertain.** Nothing floating, nothing thin, no dead
  controls, no state that leaves you unsure the click registered. This makes the 100ms floor and
  the press rules read as consequences of a brand position rather than engineering hygiene.

**Explicitly rejected, with Kaleb's reason, verbatim:**

> *"1 and 3. Operations profile is known to be busy we vallue simplicity over minimalism so this
> is ok."*

"Never busy, loud, competing for attention" is **not** a UDesign refusal. The conviction is:

> ### UDesign values simplicity over minimalism.

Dictated, first-hand, and binding on S1. Consequences:

1. **Density is not a fault in `operations`.** A busy operational screen is correct. This is the
   conviction that *justifies* D-05's fork rather than merely permitting it - the fork exists to
   let a dense screen be dense properly, not to make one profile quieter than the other.
2. **"Simple" means legible and direct, not sparse.** Any v2 prose that treats emptiness,
   whitespace, or element count as a virtue contradicts an approved conviction. S1 should read
   its own draft against this sentence before shipping it.
3. This correction is why D-09's wording was re-asked in round 5. **Emphasis scarcity and content
   density are different axes.** Busy does not imply many accents. S1 must keep them separate in
   the prose, because conflating them is exactly the error the round-3 wording made.

### D-12 · Voice-in-the-UI · `CANON` - no approval needed

`udesign-ground-truth.md:142-147` governs interface copy verbatim. Premium, honest, direct,
transparent, results over promises; never corporate jargon ("B2B", "MOQ", "digitizing raster
matrix"); never AI clichés or AI-sounding phrasing including em-dashes; never false claims.

**The UI-specific extension was declined.** Errors saying what to do next, empty states saying
what to do, never blaming the user, labels naming the action - all offered, all **not selected**.
S1 may not write those rules. They are conventional interface-writing advice, not UDesign's
stated position, and the distinction is the whole point of the approval protocol.

Mechanical consequence worth taking: the em-dash ban becomes checkable across component source and
every instruction file, not only `DESIGN.md`. Today `scripts/lint-design.mjs:58` scans `DESIGN.md`
alone, which is why `AGENTS.md` contains nine em-dashes while banning them (research §1.8).

---

## Round 4 - 2026-09-01

### D-13 · The accent is named by role, never by colour · `APPROVED` 2026-09-01

In docs, code, class names and interface copy the accent is called **the accent**. Not "gold".

This recovers a rule already followed universally - there is no colour name anywhere in the
semantic token layer - that had only ever been *written down* in `udesignpages`, which D-04
excludes. The practice is `CANON`; the written rule is `APPROVED`. It is machine-checkable, so it
becomes a checker rule rather than an adjective.

### D-14 · Segmentation correction - S1.5 · `APPROVED` 2026-09-01

D-05 has no owner anywhere in `OPERATION.md` §3. **A new segment is inserted: S1.5 - Profile
Fork**, after S1 and before S2. It owns the token overrides, the `emitPrimitives` gate, the
per-block contract tests, and closing the 44px hole.

Rationale accepted: one coherent job with a hard verification (the functional block emits its own
space scale; a 36px override fails the presentation assertion and passes its own); it is S2's hard
dependency, and building the CSS layer against geometry still in motion is how the two drift apart
in week one; and it is a natural cut line - stop after S1.5 and the profiles are genuinely
different with no new CSS surface to maintain.

**Six segments: S0, S1, S1.5, S2, S3, S4.**

### D-15 · `udesign-ground-truth.md` gains a visual-tone line · `APPROVED` 2026-09-01

The **only** edit to the edit-restricted file in this entire operation. Approved verbatim in
round 5:

> **Visual tone:** considered, not decorated. Premium shows through restraint and precision,
> never ornament. Never cheap or template-made, never provisional or unfinished. Simplicity over
> minimalism: a dense working screen is correct.

The short two-sentence variant was offered and **not selected.** The final clause is the load
-bearing one: without it "restraint" gets read as "use less" and the `operations` profile is
quietly minimalised by the next agent that touches it.

Correct placement under D-03: a conviction that outlives any design release belongs in the docs,
not the package.

### D-16 · "Fastest in town" stays dropped · `REJECTED` 2026-09-01

`udesign-website/docs/seo/SEO_GROUND_TRUTH.md:85` lists "fastest in town" among the false claims
UDesign never makes; the distillation at `udesign-ground-truth.md:144-147` kept the other examples
and dropped that one. Restoring it was offered and **not selected.** It stays dropped.

Recorded because the *rejection* is load-bearing: a later agent will re-discover this gap and
treat it as an oversight to fix. It is not. It was put to Kaleb and declined.

---

## Round 5 - 2026-09-01

### D-17 · Ban numbering: append, never renumber · `APPROVED` 2026-09-01

`udesign-contract.md`'s existing **19 bans keep their numbers exactly.** `DESIGN.md`'s 12 and the
three shorter lists merge in as 20, 21, 22… wherever they are not already duplicates.

Nothing citing "ban 16" ever breaks. No mapping table, no migration note for this item, and the
merged list carries no renumbering risk. Both alternatives - logical regrouping with an old→new
mapping, and stable IDs like `FEEDBACK-01` - were offered and **not selected.** Both invalidate
every existing citation to buy tidiness.

**Consequence for S1:** the merged list will not be in a tidy thematic order. That is the accepted
cost. Group by theme with sub-headings if useful, but the numbers stay where they are.

### D-18 · GlobalVision detail: strip and leave a pointer · `APPROVED` 2026-09-01

`udesign-contract.md:249-317` - roughly 70 lines of GlobalVision implementation detail (lint rule
IDs, `e2e/helpers.ts`, BlockNote, B-18) inside an org-wide standard, forbidden by
`udesign-docs/AGENTS.md:51-53` and sent downward by D-03.

**Removed. One line replaces it, saying GlobalVision's implementation detail lives in
GlobalVision.** The content is preserved in `udesign-docs` git history and in the `v0.6.0` tag, so
nothing is lost and GlobalVision can lift it whenever it chooses.

Both alternatives declined: marking it "scheduled for removal in v0.8.0" ends the operation with a
documented violation of its own new rule still shipping, which is how the current five ban lists
came to exist; and writing GlobalVision's replacement copy directly contradicts the plan brief §5
scope line, *"its not your job to fix them."*

**Accepted cost, stated plainly:** GlobalVision's contract has a hole until someone there acts,
and that someone is not this operation. It goes in the migration notes.

---

## Derived, not asked

Decisions that follow necessarily from an approved rule. Not put to Kaleb, because the plan brief
§4 forbids asking a question whose answer was already derivable.

### Δ-01 · The gamification skill's "Level 3" is stale and gets corrected

`udesign-docs/skills/gamified-product-experience/SKILL.md:96` publishes "Level 3: rare major
achievement". `udesign-contract.md:155` and `DESIGN.md:276` both state Intensity 3 does not exist
and is not reachable through any published token.

Under **D-03**, a statement about what published tokens can produce is version-dependent, so the
design system owns it: `DESIGN.md:276` wins and the skill's Level 3 is corrected. Investigation B
raised this as a question for Kaleb; the boundary rule he approved answers it.

### Δ-02 · `udesignpages` migration items M11 and M12 are struck

Investigation B proposed promoting the `udesignpages` visual-conviction block (M11) and the brand
rules embedded in its dated plan documents (M12) into canon. **D-04 excludes that repo as a
source.** Both are struck, not deferred. S1 must not resurrect them.

### Δ-03 · `patterns.html` is superseded outright

`udesignpages/public/design-system/patterns.html:38-49`, labelled *"COPY these blocks into each
client page"*, ships a `.ud-btn` with **no `:active` state at all** - violating
`udesign-contract.md:231` ban 16 and `DESIGN.md:318`.

Under D-04 it is low-trust agent output, not a de facto standard. The CSS component layer (D1)
replaces it with **nothing owed to it in reconciliation.** Record as a migration note for
`udesignpages`; do not fix that repo (plan brief §5).

### Δ-04 · `interface-responsiveness` is split, not moved

Follows from D-03 and was stated in the option Kaleb approved. `MOTION-SYSTEM.md` and
`ENFORCEMENT.md`'s rule list (R1-R7) come to the design system; `SKILL.md` and the other five
references stay in `udesign-docs`. This preserves `globalvision/AGENTS.md:14` - the one routing
instruction in the whole stack that was ever actually followed.

### Δ-05 · `WEBDEV/CLAUDE.md`'s tag range is wrong and gets corrected

It states `udesign-docs` is tagged `v0.1.0`…`v0.4.0`. `git tag` returns through **`v0.6.0`**.
Verified by the orchestrator. The routing canon is two tags stale about its own canon. One-line
fix, no approval needed - it is a factual correction, not a change of position.

### Δ-06 · The installed skill copy must be re-installed, not just reconciled

Found 2026-09-02. `interface-responsiveness` is installed at `~/.claude/skills/` as a **full copy,
not a symlink**, byte-identical to `udesign-docs` (md5 verified) and therefore carrying the same six
drifted motion values as I1. It is the copy with runtime authority, since a skill loads by name from
the installed set rather than from either working tree.

Follows from Δ-04 and M1 rather than being a new choice: reconciling the source is already decided,
and a hand-taken copy does not follow its source. **S1's M1 gains a re-install step**, and the done
-state gains a check for it. Recorded because an agent reconciling `udesign-docs` would reasonably
believe the job finished and it would not have.

**Corrected 2026-09-26 (S1).** The premise was wrong. The installed directory is a Windows junction
into the `udesign-docs` working tree, not a copy: identical md5s meant one file seen twice. There is
no copy to re-install. It serves whatever `udesign-docs` has checked out, so reconciling the source
and merging it to `main` is sufficient.

---

## Nothing is left open

Every question raised by either investigation, and every question the plan brief §4 flagged as
approval-bound, has an answer above. No item in the plan carries `NEEDS-APPROVAL`.

**Round 6 (2026-09-02) reopened and replaced D-05.** See D-19 and D-20 at the end of this file.
Read D-19 before acting on anything D-05 says.

**Round 7 (2026-09-25) amended D-19** after GlobalVision field evidence. See D-21, D-22 and
Δ-07 through Δ-09 at the end of this file. Nothing is open after round 7 either.

The two items closest to the line, and why they are settled rather than soft:

- **D-11's positive conviction** is an agent's translation of verbal tone into a visual position.
  It is tagged `APPROVED`, not `CANON`, and D-11 says so explicitly. S1 must reproduce that tag
  when it cites the sentence - the distinction is the point.
- **D-09's per-profile extension** goes beyond what the incident grounds. Base rule `CANON`-by
  -incident, extension `APPROVED`. S1 must not blur the two into one unattributed paragraph.

---

## Round 6 - 2026-09-02

Kaleb reopened D-01/D-05 after reading the plan. His words:

> *"I think the agent will learn through their research that the goal might be to have 2 different
> products. brand identity should remain but i feel like this is putting too many constraints on
> both profiles and results in having 2 ok profiles rather than 2 distinguishable great looking
> profiles. I agree that bans are system wide."*

**D-02 is reaffirmed, not relaxed.** The bans stay system-wide. What changed is the diagnosis of
*why* the profiles read as similar, and it turned out to be measurable rather than a matter of
taste.

### The measurement that reopened it

The two profiles share the same **type scale shape**. Each step relative to that profile's own body
size:

| Step | presentation | operations | difference |
|---|---|---|---|
| display | 3.00x | 2.86x | -4.8% |
| h1 | 2.10x | 2.06x | -2.0% |
| **h2** | **1.60x** | **1.60x** | **0.0%** |
| h3 | 1.20x | 1.26x | +4.8% |
| body | 1.00x | 1.00x | - |

`h2` is identical. The operations profile is the presentation profile multiplied by ~0.875 and
nothing else. Combined with 21 of 30 identical light colour roles, an identical body typeface
(Geist in both), and locked motion, **the two profiles are one design at two zoom levels.**

**D-05 as scoped would have made this worse.** Tighter gutters and shorter controls on the same
curve is the same design at 80% zoom, for 8-9 days. Kaleb's read was correct.

### The finding underneath it

**The fork has only ever changed values. Nobody forked the structure.**

Verified: there is **no layout or page-shell primitive anywhere in the registry.** 27 components,
zero structural. `responsive-collection` swaps a table for cards; nothing owns the page. So
"composition" today means whatever the consumer invents, which is precisely how three catalogs
diverged from one template (research 7.1).

Stripe Dashboard and stripe.com share a brand and read as different products because their
*archetype* differs, not their spacing tokens.

### D-19 · The archetype fork · `APPROVED` 2026-09-02 · **supersedes D-05** · amended by D-22

> **Amended 2026-09-25 by D-22.** The claim below that "density now falls out of the app shell for
> free" was shown by field evidence to hold only for shell gutters. D-22 extends item 2 into
> `Card`, `Dialog` and `Sheet`. Everything else in D-19 stands.

The profile difference is structural, not dimensional. Four axes:

1. **Type scale shape forks.** `presentation` goes high-contrast (~3.5x display-to-body: drama).
   `operations` goes flat (~1.7x: instrument). This is the axis that kills the zoom effect, and it
   is ~7 tokens.
2. **Hierarchy mechanism forks.** `presentation` draws hierarchy from space and elevation, cards
   floating on canvas. `operations` draws it from structure: hairline grid, **0px radius** (down
   from the current 2px), zero elevation, elements butting against each other. Half-shipped already
   (shadows are off in functional) but never stated as a rule.
3. **Layout archetype forks.** See D-20.
4. **Numeric treatment forks.** Every number in `operations` uses `--font-data` with
   `tabular-nums`; `presentation` stays proportional. **Legal today** and currently used in only 2
   of 27 components (`metric-card`, `progress-ring`). Note this does not touch D-02: the ban at
   `DESIGN.md:223` is on *wide-tracked uppercase* mono labels, not on mono.

**Dropped from D-05:** the `--space-*` fork and the `--control-height` fork. Density now falls out
of the app shell for free, so paying for it twice in tokens is waste.

**Two consequences worth stating:**
- **The `(pointer: fine)` guard is gone**, and with it D-05's accessibility cost and its migration
  note. A desktop app shell can declare itself pointer-first at the shell level; individual controls
  no longer need a guard, and `--touch-target-min` and `--control-height` stay 44px everywhere.
- **The `emitPrimitives` gate is no longer a fork precondition.** The latent build bug at
  `build.mjs:471` (the standalone stylesheet honours primitives the dual one drops) is still a real
  bug and moves to Phase 0 as a correctness fix.

**What D-05 keeps:** motion still does not fork. `DESIGN.md:278` and
`tests/token-contract.test.mjs:168` survive untouched. That part of D-05 stands.

**Rejected alternative:** archetype fork *plus* the original D-05 token fork, at 12-14 days. Offered
and not selected, on the grounds that the app shell already delivers the density.

**Also rejected:** forking the body typeface (option 5 of five explored). Not banned, and both
profiles are Geist today, but it is the only lever that carries real brand-identity risk and the
other four reach the goal without it.

### D-20 · Two shells, both consumption models · `APPROVED` 2026-09-02

`PageCanvas` (centered max-width column, full-bleed sections, the page scrolls) and `AppShell`
(persistent sidebar, fixed viewport, panes scroll rather than the page, toolbar) ship as **React
primitives and as CSS classes**, so both consumption models get them.

**This is the direct answer to the catalog divergence.** Three agents invented three page structures
because the design system owns none. Shipping the shell is what makes "use the design system"
produce a correctly *structured* page rather than correctly *styled* fragments.

Registry grows from 27 components to 29, and `registry.json` from 28 items to 30.

**Accepted cost, stated plainly:** this grows the Phase 3 CSS layer's scope, which the plan
explicitly warns against inflating (plan 8, risk 2). The warning still stands for *controls* -
mirroring all 27 is still wrong. The shells are the exception, and they are the exception because
the failure that started this operation was a structural one, not a control-level one.

**Rejected:** React-only shells (halves the work but leaves `udesignpages`, the consumer that
actually diverged, with rules instead of components, and rules are what failed there the first
time). Also rejected: documenting the archetypes without shipping code, which is prose solving a
composition problem, the thing research 7.9 item 12 says does not survive contact with an agent.


---

## Round 7 - 2026-09-25

**Trigger:** [`_evidence-functional-density.md`](./_evidence-functional-density.md), committed
2026-09-23 as `ee7dab0`. Kaleb reviewed GlobalVision's parcel-tracking tool as "not optimized at all,
way too much spacing". The screen already followed the functional profile and passed `lint:design`
with zero violations. The evidence file left three candidate responses marked `NEEDS-APPROVAL`, which
made the plan's "nothing carries `NEEDS-APPROVAL`" untrue.

**Every claim in the evidence was re-verified against `master` on 2026-09-25:** `card.tsx:11,26,31`
pad with `p-6`; `dialog.tsx:30` sets `p-[var(--content-gutter-mobile)] ... sm:p-6` with `gap-4`;
`sheet.tsx:37` has the same shape.

### D-21 · The padding override fix goes in Phase 0, as a variable · `APPROVED` 2026-09-25

`dialog.tsx:30` and `sheet.tsx:37` move their breakpoint padding into a variable,
`p-[var(--dialog-padding)]`, so a single consumer `p-0` wins completely. Today tailwind-merge treats
`sm:p-6` and `p-0` as different classes: the override gives 0 on phones and 24px on desktop, and
nothing reports it. Seven GlobalVision dialogs have this problem right now.

**Phase 0, item 0.7.** It is a shipped bug of the same kind as the other four, and Phase 0 was
pulled forward precisely so shipped bugs stop shipping. It also becomes the hook D-22 uses.

**Rejected:** an explicit `inset="none"` prop. It adds a public API to document, test and mirror in
the CSS layer, only fixes the edge-to-edge case, and gives the density axis nothing to hook into.
**Rejected:** deferring to S1.5, which would keep the bug shipping for at least another segment.

### D-22 · A density axis inside the components · `APPROVED` 2026-09-25 · amends D-19

`Card`, `Dialog` and `Sheet` read their padding from one variable. `operations` (or `AppShell`) sets
it compact; `presentation` keeps 24px. **Only padding moves.** `--touch-target-min` and
`--control-height` stay 44px in both profiles, and D-19's reason for dropping the token fork (same
type curve means the same design at 80% zoom) is untouched.

**What it corrects in D-19:** item 2 (the hierarchy fork) now reaches inside the components, and the
phrase "density falls out of the app shell for free" is withdrawn. The shell handles gutters; the
components handle their own internals. The GlobalVision measurement is the evidence: 1 of 7
tracking events visible before the local fix, 7 of 7 after, and none of the waste was in a gutter.

**Plan item 2.7. S1.5 grows by about a day, to 7-9 engineering days.**

**Rejected:** letting S1.5 prototype first. The field measurement already exists. **Rejected:**
leaving D-19 as it was, which would make "use the design system" produce a spacious operations
screen by default. That hurts P1.

### Derived in round 7, not asked

**Δ-07 · Two checker rules join Phase 4.** From the evidence's third candidate. Neither makes a
claim about UDesign; both are countable, catch real shipped bugs, and fit `ENFORCEMENT.md:5`.
(8) flag `p-0`/`px-0`/`py-0` passed to a component whose base class has a breakpoint-prefixed
padding. D-21 fixes the registry's own `Dialog`/`Sheet`, but consumers carry local forks, so the
rule still pays. (9) flag Tailwind class names assembled with `.replace()` or template strings from
other class names. Tailwind only generates classes that appear literally in source.

**Δ-08 · S1 cuts the next `udesign-docs` minor tag, not `v0.7.0`.** `v0.7.0` (2026-09-11) and
`v0.8.0` (2026-09-13) were cut for Invoice Ninja platform docs while S1 was waiting. Both touched
only `platform/invoice-ninja.md`, so nothing S1 depends on moved. S1 cuts whatever the next minor
is when it gets there: **`v0.9.0` as of 2026-09-25.** The handoff no longer hard-codes a number.

**Δ-09 · Registry fixes do not reach GlobalVision's `Card` or `Dialog`.** Its
`components/ui/card.tsx` and `dialog.tsx` are local shadcn v4 forks, not the `@udesign` registry
versions its `components.json` points at. Recorded as migration note MN-9. Not scheduled: plan
brief §5 keeps consumer fixes out of scope.

---

## Round 8 - 2026-09-26 (S1, after the branch review)

### D-23 · Ban 4 is scoped by profile · `APPROVED` 2026-09-26

Ban 4, carried verbatim from the contract, said `--shadow-1/2/3` are "for true overlays only". The
contract was written for GlobalVision, which is operations-only, so the sentence was never tested
against `presentation`. Applied system-wide it contradicts D-19, where presentation draws hierarchy
from space and elevation. **Ban 4 keeps its number and still bans raw shadow utilities everywhere;
the overlays-only clause applies to `operations` (ban 21 states it), and `presentation` may elevate
cards.** Rejected: keeping ban 4 absolute, which would force D-19's elevation onto surface and border
alone.

### D-24 · `udesign-docs` v0.9.0 is cut in S1 and pairs with design system v2.0.0 · `APPROVED` 2026-09-26

`udesign-docs` links the design system at `v2.0.0`, which S4 tags. Cut `v0.9.0` now and state the
pairing in `udesign-docs/AGENTS.md`: a product pinned below `v2.0.0` stays on `udesign-docs` `v0.8.0`
or earlier and moves both pins together. The links resolve when `v2.0.0` exists. Rejected: holding
the tag until S4, which only moves the dead links to the other repo.

### D-25 · The provenance rule is written into `knowledge-governance.md` · `APPROVED` 2026-09-26

D-04 item 4, in its own words: provenance is not established by a document asserting its own
provenance; agent-authored content in a consumer repository is evidence of what an agent did, never
of what UDesign wants.

### Recorded in S1, not asked

- **Bans 1 and 2 were generalized on the move.** Ban 1's GlobalVision paths became examples ("for
  example `app/`, `components/`, `lib/`"); ban 2 lost "The default palette will be deleted from the
  Tailwind theme; these classes will not compile", which is GlobalVision implementation detail and
  goes with D-18. The banned artifacts themselves are unchanged.
- **Ban 26 is countable.** D-10's "uniform emphasis everywhere" is written as "more accent-filled
  controls than 'Emphasis and hierarchy' allows", so it cannot be read as asking for more accent.


---

## Round 9 - 2026-09-26 (master orchestrator, between S1 and S1.5)

### D-26 · The checker runs before the CSS layer · `APPROVED` 2026-09-26

**Segment order from here: S1.5, S3, S2, S4.** Plan execution order: Phase 0, 1, 2, **4, 3**, 5.
Phase and item numbers are unchanged.

**Why.** Found in the pre-S1.5 gate check. Plan Phase 3 (S2) is verified by "a generated catalog page
built from the shipped classes passes the Phase 4 checker with zero findings". The Phase 4 checker is
S3, which S0's map scheduled after S2. S2 could not meet its own done-state. S0's reason for putting
S3 second, that the checker "needs the CSS layer to check HTML against", does not hold either: Phase
3.2 fixes the class names to the `.ud-btn` family already in use, so the checker can target them now.

**What it buys:** the checker lands a segment earlier; it becomes S2's acceptance test before S2
writes a line, and it watches S2 for building more than it should; the three-catalog proof runs
against today's `udesignpages` output.

**Still ordered after S1.5,** because one checker rule is "an operations screen sits in `AppShell`"
(migration note MN-3c), and S1.5 creates `AppShell`.

**Accepted cost:** if S2 adds a modifier class nobody anticipated, a checker rule may need a small
update in S2.

**Rejected:** keeping S2 before S3 and rewriting S2's verification to something it can meet alone.

This corrects S0's own segment map; S0's handoff explicitly permitted such corrections.

---

## Round 10 - 2026-09-26 (S1.5, after the prototype)

**Evidence:** a prototype built on the real `dist/tokens.css` showed one order screen composed the way
an agent composes it today, in both profiles, next to the proposed archetype (the client's view in
`PageCanvas`, the shop's view in `AppShell`), with the type ratios, radius, padding and numeric face
measured live from the render. Published as a private artifact,
`https://claude.ai/artifact/39cLxHx2WsUCM8BtDSiThW`; source on branch `v2/s1.5-prototype`.

### D-27 · The archetype's numbers · `APPROVED` 2026-09-26

D-19 and D-22 fixed the ratios and the axes; these are the values. Kaleb's verdict on the prototype:
**the two profiles read as two products.** So skip-list item 11 (the body typeface) stays unused.

1. **Type scale steps**, display / h1 / h2 / h3 against the profile's own body:
   `presentation` 3.5x / 2.5x / 1.75x / 1.25x on a 16px body; `operations` 1.71x / 1.43x / 1.21x /
   1.07x on a 14px body (24 / 20 / 17 / 15px). Every step differs from its counterpart by more than
   5%. Operations headings draw their hierarchy from weight (700, 700, 600, 600), not size.
2. **Compact padding: 12px** for `Card`, `Dialog` and `Sheet` in `operations`. The GlobalVision
   parcel fix landed on the same value. Presentation keeps its current padding.
3. **Presentation cards float on `--shadow-2`** instead of `--shadow-1`. This is D-19's "hierarchy
   from space and elevation" made visible. `--shadow-2` is `none` in operations, so ban 21 holds.

**Rejected:** 16px compact padding; keeping `--shadow-1` on presentation cards.

### Derived in round 10, not asked

- **Δ-10 · Radius utilities become variables.** The registry used `rounded-sm/md/lg` 18 times.
  Those are Tailwind theme aliases, so each consumer's config picked the radius and `--radius: 0px`
  could never reach a button. They become `rounded-[var(--radius-sm)]`, `rounded-[var(--radius)]`
  and `rounded-[var(--radius-lg)]`. `rounded-md` maps to `--radius` because the `DESIGN.md`
  frontmatter gives buttons `{rounded.md}` = 10px, which is `--radius`; Tailwind's unmapped
  `rounded-md` was 6px, so presentation controls move from 6px to the documented 10px.
- **Δ-11 · `--dialog-padding` becomes `--surface-padding`.** D-22 asks for one variable across
  `Card`, `Dialog` and `Sheet`, and a card reading `--dialog-padding` misnames itself to every agent.
  The variable is unreleased (S1 added it), so the rename breaks nothing. MN-10 is updated.
- **Δ-12 · The type scale is emitted as variables.** Before this, the scale reached only the
  `.ud-*` helper classes and component titles hard-coded `text-lg`, so the fork would have stopped
  at the helpers. Each profile block now emits `--text-display`, `--text-h1`, `--text-h2`,
  `--text-h3` and `--text-body`, and `CardTitle`, `DialogTitle`, `SheetTitle` read `--text-h3`.

## Round 11 - 2026-09-26 (S1.5, cut line 2)

**Evidence:** the cut-line-2 comparison, rendered only from the branch's registry and compiled
tokens, each screen its own document with the profile pinned on the root. Private artifact
`https://claude.ai/artifact/J7pXM5KvJfZC9C8MJ2UZPZ`. **Kaleb's verdict: two products. Cut line 2
is met.**

### D-28 · Table cells read `--surface-padding` vertically · `APPROVED` 2026-09-26

The render showed 52px table rows in both profiles: `TableCell` padded 16px on every side and the
44px floor is only a minimum. `TableCell` vertical padding now reads `--surface-padding` (fallback
16px), so operations rows sit on the 44px floor and presentation is unchanged. One more consumer of
D-22's one variable; no new token. **Rejected:** leaving tables for S2 or S4.

### Derived in round 11, not asked

- **Δ-13 · Semantic shadows never rendered.** Tailwind 3 compiles `shadow-[var(--shadow-N)]` as a
  shadow colour, so `Card`, `Dialog`, `Sheet`, `Select`, `Tooltip` and the `Slider` and `Switch`
  thumbs never showed their elevation in a Tailwind 3 consumer. They now use
  `[box-shadow:var(--shadow-N)]`, and a registry guard forbids the ambiguous form. Found only by
  rendering; no unit test could see it.


---

## Round 12 - 2026-09-26 (master orchestrator, closing S1.5)

### Δ-10 · S3's catalog proof needs a committed fixture · derived, not asked

Found in the pre-S3 gate check. Plan Phase 4 was verified by "flag the known-divergent catalog
(`019e34a7`) and pass the other two". **The divergent state was never committed.** Every version of
`udesignpages/public/019e34a7-.../index.html` in git (six commits, 2026-08-03 to 2026-08-27) has zero
`ud-btn-primary` usages; the two textual hits are the CSS rule definitions. All three catalogs now use
`ud-btn-secondary` on every card. Run as written, the proof would pass all three and prove nothing.

**Correction:** the verification splits into two halves, both required.
1. **No false positives:** the three real catalogs produce zero accent-budget findings.
2. **Catches the incident:** `tests/fixtures/catalog-divergent.html`, rebuilt from today's `019e34a7`
   with every repeated card CTA switched to `ud-btn-primary` as research 7.1 records, is flagged.

Derived rather than asked: it is test-fixture design that reconstructs a documented incident, and
makes no new claim about UDesign. The fixture lives in this repo so the proof survives changes to a
consumer that is out of scope (plan brief 5).
