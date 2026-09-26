# UDesign v2.0.0 — operation map and progress ledger

**This file is both the map and the state.** Every segment updates the ledger in §4 before it ends. An orchestrator resuming after a limit, a crash, or a week away reads this file first and knows exactly where things stand.

**Owner:** Kaleb · **Started:** 2026-08-29 · **Status:** S0 complete and merged. S1 ready to start (re-verified 2026-09-25).

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
| **S2** | CSS Component Layer | Governed component classes for static HTML, in lockstep with the React registry | S1.5 |
| **S3** | Enforcement | The portable checker. Defect fixes and in-repo tests moved to S1 Phase 0 | S2 |
| **S4** | Reference & Release | Reference screens per profile, migration notes, v2.0.0 | S1-S3 |

### Why this split

- **S0 is alone** because everything downstream depends on two unanswered questions, and both need Kaleb.
- **S1 is one segment across both repos** on purpose. The boundary is the hardest call in the operation, and applying it in two separate sessions is how a boundary drifts on the day it is drawn. One mind applies it to both sides.
- **S1.5 was added by S0** (decision D-14) and rescoped by D-19. It forks the profile *archetype*, and no
  segment owned that work. It is one coherent job with a hard verification, it is S2's dependency
  (building component classes against geometry still in motion is how the two drift apart in week
  one), and it is a natural cut line: stop after it and the profiles are genuinely different with
  no new CSS surface to maintain.
- **S2 is alone** because it is the largest build and the most parallelizable — the natural place for two subagents doing real work.
- **S3 follows S2** because a checker needs rules to check and needs the CSS layer to check HTML against. S0's plan moved its cheap half (three defect fixes, three tests) into S1 Phase 0, so the repo stops shipping known defects immediately rather than three segments from now.
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
**Status:** ready to start
**Branch:** `v2/s1-language-and-boundary` (to be cut off `master` after S0 merges)
**Handoff:** [`S1-language-and-boundary.md`](./S1-language-and-boundary.md)
**Next action:** Kaleb pastes that handoff into a fresh session.
**Owns:** plan Phase 0 (all seven items) and Phase 1 (items 1.1-1.11), plus the next `udesign-docs` minor tag (`v0.9.0` as of 2026-09-25; `v0.7.0` and `v0.8.0` were taken by platform docs, Δ-08).

Note: plan §3 proposes that **Phase 0 runs at the top of S1 rather than in S3**. It is about two
hours of correctness fixes that depend on nothing. Leaving it in S3 means the repo ships five known
defects for three more segments. This is a proposal from S0, not a decision Kaleb was asked to make;
S1 may execute it as written or push it back to S3, but should say which.

### S1.5 — Profile Archetype
**Status:** blocked on S1
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

### S2 — CSS Component Layer
**Status:** blocked on S1.5
**Owns:** plan Phase 3. Scope discipline is the risk: 27 components is the wrong answer and the
tempting one.

### S3 — Enforcement
**Status:** blocked on S2
**Owns:** plan Phase 4, the portable checker. Its in-repo test half moved to S1 Phase 0.
Language question is settled: Node, shipped as a `bin`, run with `npx`. Both consumers run Node.

### S4 — Reference & Release
**Status:** blocked on S1-S3
**Owns:** plan Phase 5.

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
