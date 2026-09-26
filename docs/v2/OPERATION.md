# UDesign v2.0.0 — operation map and progress ledger

**This file is both the map and the state.** Every segment updates the ledger in §4 before it ends. An orchestrator resuming after a limit, a crash, or a week away reads this file first and knows exactly where things stand.

**Owner:** Kaleb · **Started:** 2026-08-29 · **Status:** S0, S1 and S1.5 complete and merged. S3 and S2 complete and merged. S4 ready to start.

---

## 1. What this operation is

Turn the UDesign Design System into something a coding agent cannot misuse, so that two one-line prompts do the whole job:

- **P1** — "use the design system"
- **P2** — "fix all drifted stuff or anything that doesn't respect the current design system"

Evidence and diagnosis: [`docs/research/2026-08-27-design-language-transmission.md`](../research/2026-08-27-design-language-transmission.md).
Decisions, constraints, and the approval protocol: [`docs/research/2026-08-29-v2-plan-brief.md`](../research/2026-08-29-v2-plan-brief.md).

Neither is restated here. Read them.

---

## 2. Execution model

### Why segments, not one agent

The work spans two repos, a new CSS layer, a portable checker, a docs restructure, and a body of brand content that needs human approval. One orchestrator would exhaust its context re-deriving what it already decided. Each segment is a **fresh session with a clean context** that reads the same three source documents and its own handoff.

### The one hard constraint that shapes everything

**A subagent cannot ask Kaleb a question.** `AskUserQuestion` only works in the main session. The approval protocol in the plan brief §4 is therefore not delegable.

Consequences, and they are not negotiable:

- Each **segment orchestrator runs in a main session** — Kaleb pastes the handoff into a fresh Claude Code session. It is not a background agent.
- **Anything needing approval stays with the orchestrator.** Inventing brand voice, naming profiles, deciding the boundary, writing anything sourced from inference rather than from the docs.
- **Subagents get work with a verifiable right answer.** Extraction, enumeration, cross-referencing, building against a settled spec, writing tests, running probes. If a subagent would have to guess what UDesign wants, the task was scoped wrong.

### Concurrency budget

- **One segment at a time.** No two segment orchestrators running together.
- **Maximum 2 subagents concurrently** inside a segment. Usage limits bite hard — the research pass already lost an agent to a session limit mid-run.
- Prefer **two meaty subagents over six small ones.** Every spawn re-reads the same context from cold; that cost is paid per agent, not per task. A subagent should own a coherent body of work it can finish and defend, not a chore.

### The skill fleet

Kaleb runs a large installed skill set. **Segments are expected to use it, and the routing is not
left to taste** - the mapping below is part of the operation, the same way the concurrency budget is.

`superpowers:using-superpowers` is the standing rule: if there is even a 1% chance a skill applies,
invoke it before responding, and announce which one. What follows is where the fleet earns its keep
in *this* operation.

| When | Invoke | Why here specifically |
|---|---|---|
| Starting any segment that executes this plan | `superpowers:executing-plans` | Every segment after S0 executes a written plan with review checkpoints. That is the skill's exact case. |
| Before spawning the segment's subagents | `superpowers:dispatching-parallel-agents`, then `superpowers:subagent-driven-development` | The budget is two concurrent agents on independent work. Both skills exist to stop that turning into six agents re-deriving the same context. |
| Writing or editing `AGENTS.md`, `CLAUDE.md`, or a skill | **`writing-for-agents`** | Its description names `AGENTS.md` explicitly. S1's single highest-leverage item is an `AGENTS.md` rewrite. |
| Fixing or auditing anything interactive | **`interface-responsiveness`** | Installed locally, so it loads by name. It is the canonical statement of the feedback rules this operation is trying to transmit. Read the warning below before trusting its motion values. |
| Any defect fix that ships with a test | `superpowers:test-driven-development` | The plan's verification standard is literally "fails before, passes after". TDD makes that a discipline rather than a hope. |
| Deciding what a fact is called and who owns it | `domain-modeling` | The boundary migration is an ownership-and-terminology problem before it is a file-move problem. |
| A design question paper cannot answer | `prototype` | Plan brief §7 permits prototyping exactly here. S1.5's whole risk is "will these two profiles actually look different", which is not answerable on paper. |
| Showing Kaleb something to judge | `artifact-design` | Cut line 2 asks him to look at two profiles side by side. A published page beats a description. |
| Before claiming a segment is done | `superpowers:verification-before-completion` | Standing rule 6. Evidence before assertions. |
| Wrapping a segment's branch | `superpowers:finishing-a-development-branch`, `superpowers:requesting-code-review` | Each segment merges to `master`. |
| When a build satisfies you a little too much | `ponytail:ponytail-review` | Aimed only at over-engineering. S2's named risk is scope inflation; this is the check for it. |
| When something breaks and the cause is not obvious | `superpowers:systematic-debugging` | Before proposing fixes, not after three of them failed. |

**A warning about `interface-responsiveness`, found 2026-09-02.** It is installed at
`~/.claude/skills/interface-responsiveness/` as a **full copy**, not a symlink, taken 2026-08-20. It
is byte-identical to `udesign-docs` today (md5 verified), **which means it carries the same six
drifted motion values** (Investigation B, I1). So the skill that actually loads at runtime is serving
wrong easing curves right now, and **reconciling the values in `udesign-docs` will not fix the
installed copy.** That is a third home for one fact, one level deeper than the inventory found.
S1 must reconcile the source and then re-install, and say so in its ledger entry.

### Between segments: the master orchestrator loop

Segment orchestrators run one at a time in fresh sessions. The master orchestrator session (the
one that ran S0) runs between them:

1. **Gate check.** Before a handoff is pasted: check the ledger against both repos, look for drift
   since the last segment (new tags, new evidence, consumer changes), and re-verify anything new.
   This caught the `v0.7.0` tag collision and turned field evidence into D-21 and D-22 before S1.
2. **Kaleb pastes the handoff** into a fresh session. That orchestrator asks its own questions and
   writes the next handoff before it stops.
3. **Close-out.** Merge, tag and push (on Kaleb's word), delete the segment branches, update the
   ledger, then gate-check the next segment.

Only one session closes a segment. If a segment orchestrator offers to merge after the master
orchestrator has been asked to, it is told to stand down, so two sessions never cut the same tag.

### Resumption protocol

Non-optional. Usage limits will interrupt this operation at least once.

1. Before spawning anything, the orchestrator writes its intended subagent tasks into §4 of this file.
2. When a subagent completes, its outcome is recorded in §4 — one line, what landed, what did not.
3. Before the segment ends (or when the orchestrator senses it is near a limit), §4 gets the current state and the *next concrete action*, not a vague status.
4. A resuming orchestrator reads this file plus its own handoff, and continues. It does not re-investigate what §4 says is settled.

Work in progress lives in the repo on a branch, never only in an agent's context.

### Branching

Each segment works on `v2/<segment-id>` off `master`, merged when the segment's done-state is met. The release segment cuts `v2.0.0` from `master`.

---

## 3. The segments

Sequential. Each one's output is the next one's input.

| ID | Segment | Produces | Depends on |
|---|---|---|---|
| **S0** | Decide & Plan | The boundary rule, the profile decision, approved brand decisions, and the implementation plan | — |
| **S1** | Language & Boundary | All prose, both repos: `DESIGN.md`, `AGENTS.md`, composition rules, personality, docs migration | S0 |
| **S1.5** | Profile Archetype | The type-scale-shape fork, the hierarchy mechanism, the two layout shells, numeric treatment | S1 |
| **S3** | Enforcement | The portable checker. Defect fixes and in-repo tests moved to S1 Phase 0. **Runs before S2** (D-26) | S1.5 |
| **S2** | CSS Component Layer | Governed component classes for static HTML, in lockstep with the React registry | S3 |
| **S4** | Reference & Release | Reference screens per profile, migration notes, v2.0.0 | S1.5, S3, S2 |

### Why this split

- **S0 is alone** because everything downstream depends on two unanswered questions, and both need Kaleb.
- **S1 is one segment across both repos** on purpose. The boundary is the hardest call in the operation, and applying it in two separate sessions is how a boundary drifts on the day it is drawn. One mind applies it to both sides.
- **S1.5 was added by S0** (decision D-14) and rescoped by D-19. It forks the profile *archetype*, and no
  segment owned that work. It is one coherent job with a hard verification, it is S2's dependency
  (building component classes against geometry still in motion is how the two drift apart in week
  one), and it is a natural cut line: stop after it and the profiles are genuinely different with
  no new CSS surface to maintain.
- **S2 is alone** because it is the largest build and the most parallelizable — the natural place for two subagents doing real work.
- **S3 runs before S2** (D-26, 2026-09-26). S0 originally put it after S2, arguing the checker needed
  the CSS layer to check HTML against. That was wrong on both counts: S2's own done-state
  (plan Phase 3 verification) requires a page to pass the checker, so S2 could not finish without
  S3; and plan Phase 3.2 already fixes the class names to the `.ud-btn` family `udesignpages` uses
  today, so the checker can target them before S2 governs them. S3 still follows S1.5, because one
  rule is "an operations screen sits in `AppShell`". Running it first makes the checker S2's
  acceptance test and puts the checker in place one segment earlier.
- *Superseded reasoning, kept for the record:* S3 follows S2 because a checker needs rules to check and needs the CSS layer to check HTML against. S0's plan moved its cheap half (three defect fixes, three tests) into S1 Phase 0, so the repo stops shipping known defects immediately rather than three segments from now.
- **S4 is last** because reference screens must demonstrate the finished system, not a draft of it.

### Handoffs are written just-in-time

S0 and S1 handoffs exist: [`S0-decide-and-plan.md`](./S0-decide-and-plan.md) and [`S1-language-and-boundary.md`](./S1-language-and-boundary.md).

Later handoffs are written at the *end* of the preceding segment, by that segment's orchestrator, because their content depends on decisions that do not exist yet. Writing them now would be speculative fiction that the first real decision invalidates. Each segment's done-state therefore includes *"the next segment's handoff is written."*

Every handoff points at text. None restates the research, the brief, or a prior segment's output.

---

## 4. Ledger

Append-only. Newest at the bottom. One line per event: date, who, what happened, what is next.

### S0 — Decide & Plan
**Status:** complete. Merged to `master`.
**Branch:** `v2/s0-decide-and-plan` (merged; safe to delete)
**Next action:** none. S1 is next.

| Date | Event |
|---|---|
| 2026-08-29 | Operation defined. S0 handoff written. Nothing executed yet. |
| 2026-09-01 | S0 started. Branch `v2/s0-decide-and-plan` cut. Orchestrator read OPERATION, the research report in full, and the plan brief. |
| 2026-09-01 | **Subagent A dispatched** — "recover the profile intent" (plan brief §3.2). Writes `docs/v2/_investigation-A-profiles.md`. Returns findings + three costed options + a recommendation. Does not decide. |
| 2026-09-01 | **Subagent B dispatched** — "map the boundary" (plan brief §3.1). Writes `docs/v2/_investigation-B-boundary.md`. Returns the inventory, the inversion list, the verbatim brand-voice extraction, a proposed rule, and the migration list. Does not decide. |
| 2026-09-01 | Orchestrator verification pass done — `docs/v2/_orchestrator-verification.md`. README pins and §7.8 confirmed; **two research line-number citations corrected** (`table.tsx:69`→`:34`, `slider.tsx:116-123`→`:30-37`); three new findings recorded (F1 `AGENTS.md` is not in `package.json` `files`, so it never reaches an npm consumer). |
| 2026-09-01 | **Subagent A returned.** `docs/v2/_investigation-A-profiles.md` (400 lines). Headline: the artifact delivers the *written* spec almost exactly — the intent Kaleb remembers never entered the spec's normative token table, and `explorations/index.html:106` explicitly ruled out structural divergence on day one. Corrections: **35 real token overrides, not 59** (24 of the 59 restate the base byte-for-byte); `DESIGN.md:125`/`:129` and `README.md:12` **make density claims that are false and structurally unemittable** (`build.mjs:289-296`, `emitPrimitives` off for functional); `token-contract.test.mjs:168` does **not** break for a density fork, but `:129` has a real hole (a functional `--control-height` override would pass today). Key nuance: **most of Option 1's brutalism is banned by UDesign's own standing rules** (`DESIGN.md:223`, `:359`, `:361`), so "make functional more brutalist" is a business-identity question, not an engineering one. Recommends option (a) composition-only, 4-6 eng-days, and `presentation`/`operations` naming (all naming candidates are CANON). Four open questions raised for grilling. |
| 2026-09-01 | **Subagent B returned.** `docs/v2/_investigation-B-boundary.md`. Proposed rule: *a fact belongs to the design system if a reader must know which version is installed to apply it correctly; otherwise it belongs to the docs.* Ten ranked inversions found, §2.2 being only one of them. Worst is **I1: `skills/interface-responsiveness/references/MOTION-SYSTEM.md` has drifted six ways from `dist/tokens.css`** — a P2-fatal source of false findings. Recommends **splitting** `interface-responsiveness` (two files move, `SKILL.md` stays) rather than moving it. Confirms F1 independently and states the boundary rule passes the two-entry-point check **only if both `AGENTS.md` rewrites and the `files` change ship with the migration** — deferring them makes the result worse than the status quo. Six questions raised for grilling. |
| 2026-09-01 | Orchestrator re-verified both agents' load-bearing claims. **A's 35-of-59 token count: confirmed** by independent differ (and sharper — only 9 of 30 *light* colour roles differ). **A's test-hole claims: confirmed** (`token-contract.test.mjs:168` is motion-scoped and would not fire on a density fork; `:129-130` asserts `--control-height` file-wide, so a functional 36px override passes today). **B's I1 six-way motion drift: all six confirmed** against `dist/tokens.css:185-193,546-547`. **B's tag claim confirmed** — `git tag` in `udesign-docs` returns v0.6.0; `WEBDEV/CLAUDE.md` says v0.4.0. `udesign-contract.md:18` "Source of truth: v1.3.1" confirmed against GlobalVision's v1.5.0 pin. |
| 2026-09-01 | **Grilling rounds 1-5 complete.** 18 decisions taken, all tagged, recorded in [`DECISIONS.md`](./DECISIONS.md). Headlines: primitives fork on space and control geometry but **not** motion (D-05); the visual bans stay absolute in both profiles (D-02); boundary rule is **version-dependence** (D-03); profiles rename to `presentation` / `operations` (D-07); pin-once promoted system-wide (D-08); ban list **appends, never renumbers** (D-17). |
| 2026-09-01 | **D-04 is the answer that changed the most.** Kaleb ruled `udesignpages` out as a source entirely: *"this is stale even if some things are true udesign pages doesnt really have business truth it was created by lower capable agents with more hallucination"*. That removed the planned foundation for D5's visual-conviction body and struck migration items M11 and M12. |
| 2026-09-01 | **D-11 carries a dictated conviction:** *"Operations profile is known to be busy we vallue simplicity over minimalism so this is ok."* Binding on S1. It caused the round-3 accent wording to be re-asked and corrected in round 5. |
| 2026-09-01 | **Segment map corrected (D-14).** S1.5 inserted between S1 and S2 to own the profile fork, which no segment owned. Six segments now. §3 updated above. |
| 2026-09-01 | **Plan written** to [`docs/superpowers/plans/2026-08-29-v2-design-language.md`](../superpowers/plans/2026-08-29-v2-design-language.md). Six phases, five cut lines, ten named skips, eight migration notes, honest P1/P2 scoring per phase including Phase 2 scoring worst. **No item carries `NEEDS-APPROVAL`.** |
| 2026-09-01 | **S1 handoff written.** [`S1-language-and-boundary.md`](./S1-language-and-boundary.md). |
| 2026-09-01 | **S0 done.** All seven done-state boxes met. Branch `v2/s0-decide-and-plan` ready to merge to `master`. **Next concrete action: merge S0, then paste `S1-language-and-boundary.md` into a fresh session.** |
| 2026-09-02 | **Round 6. Kaleb reopened D-01/D-05 after reading the plan**, on the grounds that the constraints produced "2 ok profiles rather than 2 distinguishable great looking profiles". He reaffirmed D-02: the bans stay system-wide. |
| 2026-09-02 | **The measurement that settled it:** the two profiles share the same type scale *shape* - every step within 5% of its counterpart, `h2` identical at 1.60x. Operations is presentation x0.875. With 21 of 30 identical light colour roles and an identical body typeface, they are **one design at two zoom levels**, and D-05 would have deepened that. Verified independently. |
| 2026-09-02 | **The finding underneath it:** there is **no layout or page-shell primitive in the registry at all** - 27 components, zero structural. Composition means whatever the consumer invents, which is how three catalogs diverged from one template. The fork had only ever changed values; nobody forked the structure. |
| 2026-09-02 | **D-19 supersedes D-05.** Archetype fork replaces the token fork: type scale shape, hierarchy mechanism, layout archetype, numeric treatment. 6-8 days rather than 8-9. Motion still does not fork. The `--space-*` and `--control-height` forks are dropped, and with them the `(pointer: fine)` guard and migration notes MN-2/MN-3. |
| 2026-09-02 | **D-20:** `PageCanvas` and `AppShell` ship for both consumption models. Registry 27 to 29 components. Deliberate, argued exception to the plan's scope-inflation warning. |
| 2026-09-02 | **Skill routing added** (§2 "The skill fleet", standing rule 9). Segments now have a named skill per moment rather than being left to taste. **Finding while checking:** `interface-responsiveness` is installed at `~/.claude/skills/` as a full copy, not a symlink, and is byte-identical to `udesign-docs` - so it carries the same six drifted motion values, and reconciling the source will not fix the copy that actually loads. A third home for one fact. S1 must reconcile then re-install. |
| 2026-09-02 | Plan Phase 2 rewritten, plus its scoring, risks, skip list and migration notes. **Phase 2 now scores yes/yes against P1 and P2 and would have stopped the catalog incident**; in its D-05 form it scored partial/no. S1 handoff updated. Committed. **Next concrete action unchanged: merge S0, then paste `S1-language-and-boundary.md` into a fresh session.** |
| 2026-09-25 | **Pre-S1 freshness check.** Repo untouched since v1.5.0: all Phase 0 defects still ship, README still pins v1.3.0, `AGENTS.md` still missing from `files`, 49/49 tests pass. `udesign-docs`: `MOTION-SYSTEM.md` still has all six drifted values, the contract still claims v1.3.1, ground truth unchanged so D-15's line numbers hold. The installed skill copy is still byte-identical to source (Δ-06 stands). GlobalVision still pins v1.5.0. The three catalogs for the Phase 4 experiment are still present. |
| 2026-09-25 | **Stale and fixed:** `udesign-docs` gained `v0.7.0` and `v0.8.0` for platform docs, so S1's tag is now "next minor" (`v0.9.0` today, Δ-08). `WEBDEV/CLAUDE.md` has fallen to four tags behind; item 0.6 now removes the hard-coded range rather than bumping it again. |
| 2026-09-25 | **Round 7**, from the GlobalVision density evidence (`ee7dab0`), all claims re-verified. **D-21:** `Dialog`/`Sheet` padding moves into a variable so `p-0` actually wins; new Phase 0 item 0.7. **D-22:** `Card`/`Dialog`/`Sheet` get a padding axis per profile; amends D-19, adds plan item 2.7, S1.5 becomes 7-9 days. Two checker rules (Δ-07) and migration notes MN-9/MN-10 added. No `NEEDS-APPROVAL` remains. **Next concrete action: cut `v2/s1-language-and-boundary` off `master` and paste `S1-language-and-boundary.md` into a fresh session.** |

### S1 — Language & Boundary
**Status:** complete. Merged 2026-09-26 in both repos; `udesign-docs` `v0.9.0` cut and pushed.
**Branch:** `v2/s1-language-and-boundary` in both repos (merged and deleted).
**Handoff:** [`S1-language-and-boundary.md`](./S1-language-and-boundary.md)
**Next action:** none. S1.5 is next.
**Owns:** plan Phase 0 (all seven items) and Phase 1 (items 1.1-1.11), plus the next `udesign-docs` minor tag (`v0.9.0` as of 2026-09-25; `v0.7.0` and `v0.8.0` were taken by platform docs, Δ-08).

| Date | Event |
|---|---|
| 2026-09-25 | S1 started. Branch `v2/s1-language-and-boundary` cut off `master` (`b2f7c16`). Phase 0 executed in S1, not S3, as plan §3 proposed. |
| 2026-09-25 | **Phase 0 committed, `bd11d9b`.** 0.1-0.7 done. Every new guard ran red on the unfixed tree first: derived `PRESSED` caught `slider.tsx`; press-implies-focusable caught `table.tsx` and `select.tsx`; focus-visible caught `select.tsx`; 0.7 caught `sm:p-6` in `dialog.tsx` and `sheet.tsx`; 0.5's per-block check rejects an injected functional `--control-height: 36px` that the old file-wide assertion passed. `npm test` 56/56 node + 19/19 vitest, `lint-design` clean, `npm pack --dry-run` lists `AGENTS.md`. |
| 2026-09-25 | **Three Phase 0 deviations, stated.** (1) 0.1 pins README to `v1.5.0`, not `2.0.0`: a `v2.0.0` pin on `master` points at a tag that does not exist until S4. Instead a test asserts README pins equal `package.json` and `scripts/release.mjs` rewrites them on bump, so S4's release lands `v2.0.0` pins automatically. (2) 0.7's test asserts the base classes carry no breakpoint-prefixed padding, because the repo's test `cn()` is a plain join and cannot observe tailwind-merge; the merge itself was checked against real `tailwind-merge@2` in scratch (before: `sm:p-6` survives `p-0`; after: `p-0` wins). (3) D-19 says the `build.mjs:471` `emitPrimitives` bug "moves to Phase 0", but plan §4 Phase 0 never listed it. Checked: both builds emit `baseTree.space`, so the values cannot diverge today. Not fixed; S1.5 owns it if it forks anything. |
| 2026-09-25 | **Subagent A dispatched (migration executor).** M1, M2, M3, M4, M7, Δ-01/M8, D-18/M14, M15, M16, M17, M18, the contract ban-list pointer, and the `interface-responsiveness` re-install (Δ-06). Commits in `udesign-docs` on `v2/s1-language-and-boundary`; writes but does not commit in this repo. M5 skipped (needs a voice call), M10 kept by the orchestrator (touches `DESIGN.md`), M11/M12 struck (Δ-02). |
| 2026-09-25 | **Subagent B dispatched (bans and channels).** 1.5 merged ban list in `DESIGN.md` (D-17 numbering), 1.10 `docs` fields and `$description` emitter, 1.11 em-dash lint widened and violations fixed. Does not touch `AGENTS.md` (1.1 rewrites it) or commit. |
| 2026-09-25 | **Paused on Kaleb's request (usage).** Both subagents told to stop at a clean point and write their state to `subagent-A-report.md` / `subagent-B-report.md` in the session scratchpad. A commits finished `udesign-docs` work on `v2/s1-language-and-boundary` there; B leaves uncommitted edits in this repo's working tree. Orchestrator had read `AGENTS.md`, `DESIGN.md`, `README.md` and invoked `writing-for-agents`; 1.1 not yet written. **Next concrete action on resume:** run `git status` here and `git -C ../udesign-docs log --oneline main..v2/s1-language-and-boundary`; read both report files if they exist (if the scratchpad is gone, the working tree and that branch are the record); resume each agent's unfinished items from its report; then write 1.1 `AGENTS.md` (six rules in the first ~400 bytes, links to `udesign-docs` at `blob/v0.9.0/`), then 1.6 selector aliases in `build.mjs` after B's edits to that file land. |
| 2026-09-25 | **Subagent A paused clean: nothing written, no branch cut, re-install not done.** All its items are still to do; re-dispatch with the same brief. Its recon adds three facts the re-dispatch must carry: (1) `MOTION-SYSTEM.md` has **five more drifts** beyond I1's six (omits easing `fast`, `--motion-delay-indicator`, `--motion-loop-spin`; gives emphasis easing as prose instead of the shipped `cubic-bezier(0.34, 1.56, 0.64, 1)`; incomplete reduced-motion block); (2) its "no published duration exceeds slow" is false, since `ambient` ships at 1200ms and `token-contract.test.mjs` exempts it, so the moved text says "interaction duration"; (3) Investigation B's `udesign-docs` line numbers date from `v0.6.0`, so re-read before M3, M4, M14 and the ban pointer. |
| 2026-09-26 | Subagent B hit the session limit before writing anything (tree clean, no report). Usage reset. **Both subagents resumed** from their own transcripts with their original briefs; A resumes from the next-step list in its report. |
| 2026-09-26 | **Subagent A returned, DONE_WITH_CONCERNS.** `udesign-docs` commits `488b010`, `f654e43`, `e0a1661`, `305eee2`, `9fa5786` on `v2/s1-language-and-boundary`. Here: `docs/motion-contract.md` (all 11 drifts corrected; orchestrator re-checked every value against `dist/tokens.css`), `docs/checker-rules.md`, `package.json` `files` gains it. M3 stopped honestly: the contract's GlobalVision tone map and ratified entity map exist nowhere else. Resolved by the existing overlay convention (`udesign-docs/AGENTS.md`, overlay section), not a new question: move them verbatim to `globalvision-functional-profile.md`, then finish M3. A sent back for that, plus Level 3 in two gamification references and three dangling contract mentions. |
| 2026-09-26 | **Δ-06 was a misdiagnosis.** `~/.claude/skills/interface-responsiveness` is a Windows **junction** into the `udesign-docs` working tree (`Get-Item` LinkType `Junction`), not a copy; identical md5s meant the same file. No re-install exists to do. The installed skill serves whatever `udesign-docs` has checked out, so it is correct once `v2/s1-language-and-boundary` merges to `main` and `main` is checked out. The done-state box "re-installed" is met by that merge, not by a copy. |
| 2026-09-26 | On Kaleb's request, `udesign-docs` `4fdae0e` (plugins and MCP index, unrelated to S1) fast-forward pushed to `origin/main` (`ca0ec6d..4fdae0e`). The S1 branch was already based on it, so no rebase: `origin/main..v2/s1-language-and-boundary` is now exactly S1's 10 commits, hashes unchanged. |
| 2026-09-26 | **Subagent A follow-ups landed**: M3 finished by moving GlobalVision's tone and entity maps verbatim to its overlay; Level 3 removed from the two gamification references; three dangling contract mentions fixed. Orchestrator then moved the contract's two parked tone rules into `DESIGN.md` (metric and tone roles), restated the contract's ownership line as D-03, and made the one ground-truth edit (1.9, D-15 verbatim). **Placement note:** the line went after the "Never" bullet, not after "Tone", so every `CANON udesign-ground-truth.md:139-147` citation still holds. |
| 2026-09-26 | **Phase 1 committed, `23e6624`**, then `91408fa` after `ponytail-review` cut 168 lines (flat `lint-design.mjs`, one scope test and one emitter test instead of seven). Cold read: a haiku agent given only `AGENTS.md` stated the accent budget and picked `operations` for "an internal production scheduling screen"; it hedged `secondary` vs `ghost` for a card grid, so `AGENTS.md` now names `secondary` for cards and `ghost` for toolbars and rows. Read paths traced by following each link: design-system `AGENTS.md` reaches everything in one or two hops; `udesign-docs/AGENTS.md` in two. |
| 2026-09-26 | **Branch review (opus): with fixes.** C1 docs links to `v2.0.0` resolved by D-24 (pairing note, MN-11). I1 `--dialog-padding` was declared on the element, so no profile could reach it: now a fallback (`p-[var(--dialog-padding,var(--dialog-padding-default))]`), a test forbids the element declaring the variable, showcase build confirms Tailwind compiles it, tailwind-merge still lets `p-0` win. I2 `SelectItem` had no pressed state and passed because the guard was per file: the guard is now per component (split at `React.forwardRef`), ran red on `select.tsx#6` only, then fixed. I3 ban 4 vs D-19: put to Kaleb, D-23. I4 intensity ownership worded accurately in `skills/README.md`; the "spacing" claim removed from the contract and `motion-contract.md`. I5 this ledger. |
| 2026-09-26 | Round 8 decisions D-23, D-24, D-25 recorded; migration notes MN-11, MN-12 added; the ban 1/2 generalizations recorded in `DECISIONS.md`. D-25's governance line was first blocked by auto mode as a shared-standard change and written after Kaleb approved it. |
| 2026-09-26 | **S1 done-state:** Phase 0 committed with each new test red first; `npm pack --dry-run` lists `AGENTS.md`; cold read passed; every personality sentence tagged; bans 1-19 keep their numbers, 20-26 appended, pointers in the contract, `.cursorrules`, `.gemini/rules` (the two `udesignpages` lists are consumer files, not edited, per standing rule 7); both read paths traced; `MOTION-SYSTEM.md` values match `dist/tokens.css`; 0.7's test red then green; false density claims deleted; the installed skill is a junction, so it is correct on merge (Δ-06 corrected); S1.5 handoff written. **Open, not blocking:** `udesign-docs` `v0.9.0` not yet cut; README's component lists (`:15`, `:106`) predate v1.5.0; the showcase and e2e still use the alias names. |
| 2026-09-26 | **S1 closed by the master orchestrator.** Pre-merge gate check: done-state confirmed against the repos, 59/59 contract and 19/19 component tests green, both repos fast-forwardable, origin unmoved. Merged `v2/s1-language-and-boundary` into design-system `master` (`74f1268`) and `udesign-docs` `main` (`2fc92bd`), cut annotated `udesign-docs` `v0.9.0` (D-24), pushed both and the tag, deleted both branches. Tests re-run green on merged `master`. |
| 2026-09-26 | **D-26: segment order is now S1.5, S3, S2, S4.** Found during the gate check: plan Phase 3's verification requires the Phase 4 checker, which S0's map built after S2, so S2 could not meet its own done-state. See `DECISIONS.md` round 9. S1.5 now writes the S3 handoff. |
| 2026-09-26 | **Known window, approved in D-24:** from now until S4 cuts `v2.0.0`, `udesign-docs` carries 13 links in 9 files to design system `v2.0.0`, which does not exist yet. MN-11 keeps consumers on `v0.8.0`. Reason enough not to let the operation stall. **Next concrete action: paste `S1.5-profile-archetype.md` into a fresh session.** |

Note: plan §3 proposes that **Phase 0 runs at the top of S1 rather than in S3**. It is about two
hours of correctness fixes that depend on nothing. Leaving it in S3 means the repo ships five known
defects for three more segments. This is a proposal from S0, not a decision Kaleb was asked to make;
S1 may execute it as written or push it back to S3, but should say which.

### S1.5 — Profile Archetype
**Status:** complete. Merged to `master` 2026-09-26 (`fb13053`) and pushed. Handoff: [`S1.5-profile-archetype.md`](./S1.5-profile-archetype.md)
**Branches:** `v2/s1.5-profile-archetype` (merge to `master`); `v2/s1.5-prototype` (throwaway, holds both prototypes as the primary source; keep until S4, never merge).
**Next action:** none. S3 is next.
**Writes next:** the **S3** handoff (`S3-enforcement.md`), not S2's (D-26).
**Owns:** plan Phase 2. Decisions **D-19** (which supersedes D-05), **D-20**, and **D-22** (which amends D-19).
**Read D-19 before D-05.** The space-scale and control-height token fork was dropped on 2026-09-02
after a measurement showed the two profiles share the same type scale shape, so forking density on
the same curve would have produced the same design at 80% zoom. The fork is now structural: type
scale shape, hierarchy mechanism, two layout shells (`PageCanvas`, `AppShell`), numeric treatment.
**This segment ships the first structural components the system has ever had** - registry goes 27
to 29 components. The `(pointer: fine)` accessibility guard is gone with the token fork.
**Also read [`_evidence-functional-density.md`](./_evidence-functional-density.md)** (2026-09-23,
field evidence from GlobalVision): the density that was lost was inside Card/Dialog internals,
not in shell gutters. **Resolved 2026-09-25 by D-22:** `Card`, `Dialog` and `Sheet` get a padding
axis (plan item 2.7), and D-19's "density falls out of the app shell for free" is withdrawn.

| Date | Event |
|---|---|
| 2026-09-26 | S1.5 started. Branch `v2/s1.5-profile-archetype` cut off `master` (`386867f`). **Baseline was red:** `scripts/test-registry.mjs` compared `public/r` bytes, and 8 of 29 committed JSON files embed LF while `core.autocrlf` checks sources out as CRLF. Fixed by comparing content (`9a2ab8f`), red before and green after. |
| 2026-09-26 | **Finding for 2.2:** registry components use `rounded-sm/md/lg` 18 times. Those are Tailwind theme aliases, so the consumer's config picks the radius and `--radius: 0px` never reaches a button or input. 2.2 moves them to `rounded-[var(--radius*)]` and a registry test forbids the aliases. |
| 2026-09-26 | Plan: prototype both shells in both profiles (`prototype`, `frontend-design`), put the scale steps, shell structure and compact padding to Kaleb, then build test-first. No subagent dispatched yet. |
| 2026-09-26 | **Prototype verdict: two products.** Built on the real `dist/tokens.css`, published privately (`https://claude.ai/artifact/39cLxHx2WsUCM8BtDSiThW`), source on `v2/s1.5-prototype` (`090bfde`). Kaleb approved the type steps, 12px compact padding and `--shadow-2` presentation cards: **D-27**. Derived and recorded: Δ-10 radius utilities become variables, Δ-11 `--dialog-padding` becomes `--surface-padding`, Δ-12 the type scale is emitted as `--text-*` variables. **No subagents:** the build is one coherent change across tokens, `build.mjs`, and the same test files, so two agents would collide in `test-registry.mjs` and `public/r`. Next: red tests for 2.1, 2.2, 2.4 and 2.7, then tokens and build. |
| 2026-09-26 | **Built test-first, `56741b3`.** Four token-contract tests ran red (type shape, radius and elevation, surface padding, numeric pair), then green. Registry guards ran red one at a time: item list, radius aliases, `--surface-padding`, numeric pair. Vitest: both shells render, hold or release the viewport by breakpoint, and pass axe. The responsive family left the `emitPrimitives` gate, which is the only part of the D-19 asymmetry that mattered: the dual operations block now emits its own `--surface-padding`. Prose `781dc71`: `DESIGN.md` hierarchy rule and true density claims, `AGENTS.md` rule 6 names the shells, ban 27 appended, MN-10 amended, MN-13 to MN-16 added. |
| 2026-09-26 | **Cut line 2 met.** Comparison rendered only from the branch's registry and tokens (Vite SSR, Tailwind from the markup, each screen its own document with `data-design` on the root), published privately at `https://claude.ai/artifact/J7pXM5KvJfZC9C8MJ2UZPZ`. **Kaleb's verdict: two products.** The render found **Δ-13**: Tailwind 3 compiles `shadow-[var(--shadow-N)]` as a shadow colour, so seven components never rendered elevation; fixed with `[box-shadow:...]` and a guard (`8d76e40`). Kaleb approved **D-28**: `TableCell` vertical padding reads `--surface-padding`, operations rows sit on the 44px floor (`7528ab9`). Next: capture the harness on `v2/s1.5-prototype`, `verification-before-completion`, `ponytail-review`, then the S3 handoff. |
| 2026-09-26 | Harness captured on `v2/s1.5-prototype` (`146aaf3`). `ponytail-review` cut two redundant asserts and two one-use interfaces, and found a vitest regex that had lost its `s` and could never fail; replaced with `not.toHaveClass`, then shown red by adding a bare `h-svh` to `AppShell` and green on revert. |
| 2026-09-26 | **S1.5 done-state.** 2.1-2.4, 2.6, 2.7 meet their plan rows (2.5 was S1's). **One stated deviation:** 2.4 gives `Badge` tabular figures but not mono, because badge text is words and `DESIGN.md` limits mono to codes and readouts. `npm run validate` exit 0 on the final tree: lint clean, contracts 63/63, registry 30 items, components 24/24, clean registry install, showcase build, e2e 4/4. Kaleb's verdict on the rendered comparison: two products. S3 handoff written. **Not done, and not S1.5's:** the shells' CSS classes (S2, D-20); showcase pages for the shells (S4 reference screens); GlobalVision's local `Card`/`Dialog` forks still miss every registry fix (MN-9). **Next concrete action:** master orchestrator gate-checks and merges `v2/s1.5-profile-archetype`, then S3. |
| 2026-09-26 | **S1.5 closed by the master orchestrator.** Gate check on the branch: 63/63 contract and 24/24 component tests, `lint-design` 0 errors, Playwright 4/4, registry 30 items with `page-canvas` and `app-shell`, D-27 and D-28 recorded, S3 handoff present and aligned with D-26. Fast-forwarded into `master` (`fb13053`), pushed, branch deleted. `v2/s1.5-prototype` kept unmerged per the ledger (throwaway, holds the prototypes until S4). No `udesign-docs` changes in S1.5 and no drift there since `v0.9.0`. Also deleted the stale local `codex/udesign-1.3.0` (fully merged, v1.3.0 era) on Kaleb's request. |
| 2026-09-26 | **Δ-10, found in the pre-S3 gate check:** the gold-button divergence in `019e34a7` was never committed, so "flag `019e34a7`" would pass all three catalogs and prove nothing. S3's proof is now two halves: zero findings on the three real catalogs, and a flag on a committed fixture rebuilt from `019e34a7` with its card CTAs switched to primary. Plan Phase 4 and the S3 handoff updated. **Next concrete action: paste `S3-enforcement.md` into a fresh session.** |

### S3 — Enforcement
**Status:** complete. Merged to `master` 2026-09-26 and pushed. Handoff: [`S3-enforcement.md`](./S3-enforcement.md). **Runs before S2** (D-26).
**Branch:** `v2/s3-enforcement` (merged and deleted).
**Owns:** plan Phase 4, the portable checker. Its in-repo test half moved to S1 Phase 0.
Language question is settled: Node, shipped as a `bin`, run with `npx`. Both consumers run Node.
**Writes next:** the S2 handoff, and hands S2 the checker as its acceptance test.

| Date | Event |
|---|---|
| 2026-09-26 | S3 started. Branch `v2/s3-enforcement` cut off `master` (`316a52f`). **Measured every candidate rule against real consumer source before choosing** (GlobalVision `app/ components/ lib/ hooks/`, all 95 pages in `udesignpages/public`). **Cut on evidence:** the Δ-13 `shadow-[var()]` rule, since GlobalVision is Tailwind 4.1.13, which compiles that form as a real `box-shadow` (49 hits, all correct); raw hex (617 hits in generated HTML, nearly all product swatch data that ban 3 permits); colour-only status (needs judgement); rules 8 and 9 (no ban or `AGENTS.md` rule to cite; rule 9's narrow form matches only a comment about an already-fixed bug, the broad form is 158 lines of string munging). **Shipping:** accent in a repeated block, div with onClick, raw motion, `--ud-*` primitives, em-dash in copy (comments excluded: 277 GlobalVision hits were almost all comments), the accent named by colour, profile pin, ban 27. **No subagents:** one module and one test file, two agents would collide. Next: fixture first, then each rule red then green in `tests/checker.test.mjs`. |
| 2026-09-26 | **Built test-first.** `tests/fixtures/catalog-divergent.html` rebuilt from `udesignpages` `dbfd172` `019e34a7/index.html`, 38 card CTAs switched to `ud-btn-primary`, otherwise byte-identical. All 15 checker tests written against a stub `check()` returning nothing: every flag case red, including the fixture. Then `bin/rules.mjs` and `bin/udesign-check.mjs`: green. The suppression test passed trivially against the stub, so it was shown red by deleting the `design-ok` check, then restored. |
| 2026-09-26 | **Δ-10 (fixture) proof, both halves.** The three real catalogs (`2b1a3e5c`, `019d7262`, `019e34a7`): **0 accent-budget findings** (their other findings are ban 19, from inline `100ms ease` transitions, and real). The fixture: one `accent-repeated` finding at line 281, "38 accent-filled controls repeat under `html > body > div.catalog-grid > div.product-card`". Ran through `npx` from the `udesignpages` root: exit 1 with the same output. |
| 2026-09-26 | **Round 13.** Asked Kaleb whether ban 14 covers GlobalVision's lone em-dash placeholder (38 cells). **D-29: it applies**, and GlobalVision is evidence, not a guide (D-25); the bans will grow against AI-looking UI. A `role="group"` exemption I had drafted for `div-onclick` was withdrawn under the same reasoning. Test files are skipped (test data is not copy), shown red first. Δ-14 names the shells' static-HTML classes, Δ-15 records the rule cuts, Δ-16 notes that two decisions share Δ-10. |
| 2026-09-26 | **Real findings in consumers, recorded not fixed (rule 7).** GlobalVision: one ban 26 (`components/section-page.tsx:269`, an accent `Button` in every mapped card, the catalog incident in React), 12 `div-onclick`, 85 em-dash, one `GOLD` identifier, one ban 27 (functional, no `AppShell`). `udesignpages/public`: 441 ban 19, 146 ban 1 (96 in a hand-made "Functional Brutalist" token file), 3 ban 14, 3 ban 27, 2 `--brand-gold`. This repo's showcase: 4 ban 19 in `showcase/src/index.css` (S4's); its runtime profile switch now carries `design-ok:` as `AGENTS.md` rule 6's named exception. The registry itself: 0 findings. |
| 2026-09-26 | `AGENTS.md` "Auditing" starts with the checker (`writing-for-agents`); `docs/checker-rules.md` lists what ships, what each rule does not flag, the shell classes, and every cut with its reason; `package.json` gains `bin`, and `files` gains `bin` and `docs/checker-rules.md`. `ponytail-review` cut a hand-built line index and a hand-rolled `fileURLToPath`; all eight rules kept. |
| 2026-09-26 | **S3 done-state.** `npm run validate` exit 0: lint clean, contracts 78/78, registry 30 items, components 24/24, clean registry install, showcase build, e2e 4/4 (validate re-embeds CRLF into `dist/` and `public/r/`; restored, content unchanged, TOOLING-PITFALLS §1). S2 handoff written. **Not done, and not S3's:** the four showcase findings (S4); the git form `npx github:7KMANN/udesign-design-system#<tag>` is verified only once the branch is pushed; GlobalVision gets `npx udesign-check` only when it repins to a tag that has the `bin`. **Next concrete action:** master orchestrator gate-checks and merges `v2/s3-enforcement`, then S2. |
| 2026-09-26 | **S3 closed by the master orchestrator.** Gate check: `npm run validate` green on the branch (CRLF churn restored again); catalog proof reproduced independently (the fixture flagged once under ban 26, no accent finding in any real catalog); `udesign-docs` has 6 commits past `v0.9.0`, none in `standards/` or design, so no drift. One fix before merge: a mistyped path crashed the checker with a Node stack trace, now a one-line error and exit 2. The duplicate Δ-10 (Δ-16) was the master orchestrator's, from round 12. Fast-forwarded into `master`, pushed, branch deleted. **Next concrete action: paste `S2-css-layer.md` into a fresh session.** |
| 2026-09-26 | **The git form of the checker is proven** after the push, from a directory outside any repo: `npx --yes github:7KMANN/udesign-design-system#master <paths>` flags the fixture under ban 26 and exits 1 (about 70 s on first fetch, 5 s cached). The package name alone runs the bin; adding `udesign-check` after it passes that word as a path, which now fails with a clear error. `AGENTS.md` "Auditing" already gives the right form. |

### S2 — CSS Component Layer
**Status:** complete. Merged to `master` 2026-09-26 and pushed. Handoff: [`S2-css-layer.md`](./S2-css-layer.md). The checker is its acceptance test.
**Branch:** `v2/s2-css-layer` (merged and deleted).
**Writes next:** the S4 handoff, [`S4-reference-release.md`](./S4-reference-release.md).
**Owns:** plan Phase 3. Scope discipline is the risk: 27 components is the wrong answer and the
tempting one.

| Date | Event |
|---|---|
| 2026-09-26 | S2 started. Branch `v2/s2-css-layer` cut off `master` (`2354885`). **Census of `udesignpages/public` (95 pages) before choosing:** `ud-btn` 125 uses (secondary 62, outline 62, primary 1); `product-card`/`card` 135; `badge`/`tag` 46 plus one `ud-badge`; tables 15 in 4 pages (three order forms, one spec page); inputs 4 in 2 pages; empty states in 3 pages; every catalog card carries a hover and a raw-motion press on a non-focusable `div` (the `Pressable` pattern done wrong), and one page uses a `pressable` class 42 times. **Shipping:** `ud-btn` (primary, secondary, outline, plus ghost for the toolbar AGENTS.md rule 5 prescribes), `ud-card`, `ud-badge`, `ud-table`, `ud-input`, `ud-empty-state`, `ud-pressable`, and the Δ-14 shell classes. **Kaleb, round 14:** the header lockup and confidential footer are skipped (no registry twin, zero findings in their consumer CSS); distribution is inside `dist/tokens.css`, source `css/components.css`. No per-profile rules: every profile difference the classes need is already a variable (`--surface-padding`, `--shadow-2`, `--text-*`, `--font-numeric*`). **No subagents yet:** one stylesheet and one test file, written test-first, collide if split. Next: parity tests red, then `css/components.css`, then the acceptance fixture. |
| 2026-09-26 | **Built test-first, `39bead2`.** `tests/component-css.test.mjs` written against an empty stylesheet, then each detector shown red on a stylesheet carrying its violation: a clickable class with no press, a press with no ring, `:focus`, a transition with a literal time, raw hex, `--ud-*`, an undeclared class. Then `css/components.css`, appended to both compiled token files by `build.mjs`: green. The acceptance case in `tests/checker.test.mjs` was shown red by injecting `transition: transform 100ms ease` into the catalog page, then green. |
| 2026-09-26 | **Acceptance pages.** `tests/fixtures/catalog-components.html` is `udesignpages` `b7ed968` `2b1a3e5c` (the Toque catalog, 6 ban 19 findings today) rebuilt from the classes with both inline `<style>` blocks removed: **0 findings**. `tests/fixtures/app-shell-components.html` puts every class in an operations `AppShell`: **0 findings**. Rendered through a local server at 1280px and 375px: centred column, fixed operations viewport with independently scrolling panes, operations card with no shadow and 12px padding, tabular mono figures. **Rendering found two defects no test could see**, both fixed: Δ-18 (static HTML has no `md:`, so AppShell overflowed to 483px on a phone) and Δ-19 (a table widened the page until `ud-table-scroll` shipped). |
| 2026-09-26 | **Round 14.** Kaleb: skip the header lockup and footer (**D-30**); ship inside `dist/tokens.css` (**D-31**); after seeing the `DESIGN.md` frontmatter and the registry rendered side by side, the registry wins and S4 corrects the frontmatter (**D-32**). Derived: Δ-17 to Δ-20. MN-17 (`udesignpages`) and MN-18 (GlobalVision, nothing to do: no React consumer uses a `ud-` component class) added. `AGENTS.md` rule 6 gains the static-HTML pointer (`writing-for-agents`); README gains the distribution section; `docs/checker-rules.md` marks the shell classes shipped. |
| 2026-09-26 | **Skipped, each with its reason in `MIRROR`:** alert, select, checkbox, switch, slider, field, dialog, sheet, tooltip, tabs, icon-button, progress-ring, rolling-consistency-chip, moment, status-badge, metric-card, responsive-collection, spinner, skeleton, core. `ponytail-review` cut one line (`position: relative`, a React spinner anchor the static layer has no use for). **No subagents:** one stylesheet and one test file, written test-first; two agents would have collided in both. **Observation, not acted on:** the `.ud-*` typography helpers in `dist/tokens.css` hard-code font sizes that equal the `--text-*` variables today; two homes for one value. |
| 2026-09-26 | **S2 done-state.** The evidenced classes plus the Δ-14 shells ship in the stylesheet, every skip named. The 3.3 parity tests ran red first and are green. Both acceptance pages report zero findings and are held in `tests/checker.test.mjs`. 3.4 is D-31, written in README. `npm run validate` exit 0: lint clean, contracts 87/87, registry 30 items, components 24/24, clean registry install, showcase build, e2e 4/4 (`public/r/` CRLF churn restored, content unchanged). S4 handoff written. **Not done, and not S2's:** the frontmatter correction (D-32, S4); `udesignpages` adopting the layer (MN-17, consumer work). **Next concrete action:** master orchestrator gate-checks and merges `v2/s2-css-layer`, then S4. |
| 2026-09-26 | **S2 closed by the master orchestrator.** Gate check: `npm run validate` exit 0 (CRLF churn restored); `npm run build` reproduces the committed `dist/` apart from line endings; the checker reports 0 findings on both acceptance pages and `css/components.css`; no duplicate decision IDs. **One correction (Δ-21):** MN-17's "syncing changes nothing on screen" was false. Rendering seven `udesignpages` pages under three token files showed the token swap is inert but the layer's `min-height: 44px` reaches every `ud-btn` and the `patterns.html` badge gains a border. MN-17 corrected. S2's closing observation that the `.ud-*` typography helpers duplicate `--text-*` is not drift: `formatTypographyHelpers` emits both from the same token tree. Fast-forwarded into `master`, pushed, branch deleted. **Next concrete action: paste `S4-reference-release.md` into a fresh session.** |

### S4 — Reference & Release
**Status:** in progress. Handoff: [`S4-reference-release.md`](./S4-reference-release.md).
**Branch:** `v2/s4-reference-release`.
**Owns:** plan Phase 5.

| Date | Event |
|---|---|
| 2026-09-26 | S4 started. Branch `v2/s4-reference-release` cut off `master` (`12739f0`). README's component lists already match the 30-item registry (fixed earlier), so that carry-over is closed with no edit. **No subagents:** the screens build on the S1.5 cut-line-2 source Kaleb already judged "two products", and every other item is a few lines in files the screens' tests also touch. |
| 2026-09-26 | **`fe2fa50`, D-32 and the showcase.** `DESIGN.md` frontmatter and prose follow the registry: secondary borderless, outline 1px `hairline`, buttons Geist 500 at 16px, 44px, `8px 16px`, card `{rounded.lg}` and 24px (`--surface-padding`). **Derived under D-32's rule (the registry wins), not asked:** `button-secondary` fills with `--secondary` (#f4f1ea, new `surface-panel`), not `canvas`; and the Typography sentence giving Montserrat to "high-value calls to action" is cut, since it restated the same stale claim. Showcase: the four ban 19 findings become motion roles (0 findings), the profile switch and e2e write `presentation`/`operations`. |
| 2026-09-26 | **`8c849a9`, the references.** `examples/presentation-order.tsx` (`PageCanvas`), `examples/operations-queue.tsx` (`AppShell`, dense per D-11: ten orders, seven columns, a ghost row action in every row, one accent that commits work), `examples/static-catalog.html` (class layer only). Each restraint is a comment on the control it governs. `tests/checker.test.mjs` holds all three at zero findings and exactly one accent-filled control, shown red three ways (a card CTA turned primary, a raw `200ms ease`, a second unrepeated primary). `tests/components/examples.test.tsx` renders both React screens under axe and exercises the toolbar filter; axe caught two real defects on first run (heading order `h1` to `CardTitle`'s `h3`, and a table region named like its pane), both fixed. `registry/tsconfig.json` typechecks `examples/`; `package.json` `files` gains it and `npm pack --dry-run` lists all three. `AGENTS.md` "Read next" points at it (`writing-for-agents`). **Next:** render all three for Kaleb, then CHANGELOG and the release. |

---

## 5. Standing rules for every segment

1. **Point at text, never restate it.** Cite `§3.4`, `plan brief §4`, `DESIGN.md:296`. Duplicated prose becomes a second authority that drifts — the org rule is in `udesign-docs/standards/knowledge-governance.md`.
2. **Provenance governs approval, not topic.** Relocating something already written in the canon needs no approval. Anything inferred, extrapolated, or invented needs Kaleb's explicit yes. Plan brief §4.
3. **"UDesign"** — capital U, capital D. Not "uDesign".
4. **Score against P1 and P2.** Work that serves neither is a skip candidate; say so out loud rather than doing it quietly.
5. **Countable beats eloquent.** A rule an agent can audit itself against survives; an adjective does not. Research §7.9 item 12.
6. **Verification is part of done.** A command that fails before and passes after, or an observation someone can make. This repo has a strong testing culture already — match it.
7. **Do not fix consumers.** GlobalVision and udesignpages are evidence and test targets, not work. Record drift as a migration note.
8. **Update §4 before you stop.** Including when you stop because you hit a limit.
9. **Use the fleet.** §2 maps skills to the moments they belong to. A segment that rewrites
   `AGENTS.md` without `writing-for-agents`, or fixes an interaction defect without
   `interface-responsiveness`, is doing avoidable work from scratch.
