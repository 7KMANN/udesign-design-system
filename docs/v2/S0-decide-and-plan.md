# S0 — Decide & Plan

**You are the segment orchestrator for S0 of the UDesign v2.0.0 operation.**
You run in a main session so you can ask Kaleb questions. You have a team of up to 2 subagents at a time.

---

## Read these three, in order, before anything else

1. [`docs/v2/OPERATION.md`](./OPERATION.md) — the operation map, the execution model, the ledger you must update, and the standing rules. §2 explains why you and not a subagent do the approval work.
2. [`docs/research/2026-08-27-design-language-transmission.md`](../research/2026-08-27-design-language-transmission.md) — the full investigation. 1,050 lines. Read all of it.
3. [`docs/research/2026-08-29-v2-plan-brief.md`](../research/2026-08-29-v2-plan-brief.md) — **your actual job description.** The decisions already taken (D1-D5), the two questions you must answer with evidence (§3.1 boundary, §3.2 profiles), the approval protocol (§4), the scope checklist (§5), and the quality bar for the plan (§6).

None of that is repeated here. This file only tells you how to *run* the segment.

---

## What S0 produces

| Artifact | Path |
|---|---|
| The implementation plan | `docs/superpowers/plans/2026-08-29-v2-design-language.md` |
| The decision record | `docs/v2/DECISIONS.md` |
| The S1 handoff | `docs/v2/S1-language-and-boundary.md` |
| Updated ledger | `docs/v2/OPERATION.md` §4 |

`DECISIONS.md` is new and matters more than it looks. It records every question you put to Kaleb, his answer, and — critically — the **provenance tag** from plan brief §4: `CANON` (already written in the docs, cite the line) or `APPROVED` (inferred or invented, Kaleb said yes on this date). S1 through S4 will lean on it constantly, and without the tags they cannot tell which statements they are allowed to build on and which are still soft.

---

## How to run this segment

### Phase 1 — Investigate before you ask anything

Arrive at the grilling with evidence. A question you could have answered by reading is a question that wastes Kaleb's time and your credibility.

Two subagents, run **both at once, then stop and think**:

**Subagent A — "Recover the profile intent."** Plan brief §3.2 lists exactly what to read and what to answer. This is a real investigation with a defensible conclusion, not a summary task: what did the origin spec intend, how much survived into the artifact, what was dropped and was it deliberate, and what would it actually cost to close the gap. It must look at `explorations/*.html` as rendered intent, diff the two token trees, and read the showcase. It returns findings and a recommendation with costs — **it does not decide.**

**Subagent B — "Map the boundary."** Plan brief §3.1 lists the inputs. It produces a complete inventory: every document and major section across both repos, what fact it owns, whether that fact is duplicated elsewhere, and where the authority currently points versus where the content actually sits (§2.2 of the research is the known-broken example, not the only one). It should also read `udesignpages` and enough of GlobalVision to know what each consumption model actually needs. It returns the inventory and a proposed boundary rule with its migration list — **it does not decide.**

Both are meaty enough to justify their spawn cost. Neither needs to guess what UDesign wants, so both are safely delegable.

While they run, you read the three documents above yourself. Do not idle.

### Phase 2 — Grill Kaleb

Batched `AskUserQuestion`, max 4 per call, real options with honest trade-offs in the descriptions. Multiple rounds: ask, absorb, investigate the gaps the answers open, ask again. Kaleb has said explicitly he expects a lot of grilling and considers under-asking the worse failure.

Certain to need approval:
- The boundary rule, once you can state it in one sentence and show its consequences.
- The profile decision, with the cost of each option on the table. Note the constraint in plan brief §3.2: differentiating behavior breaks the byte-identical motion guarantee that `tests/token-contract.test.mjs:168` enforces, and you must say what replaces it.
- **Everything in the personality bodies (D5).** Voice-in-the-UI and visual conviction are where an agent most easily writes confident, unsourced sentences about a brand. Every claim gets a citation or an approval. If you find yourself writing an adjective about UDesign that you cannot trace to a file, stop and ask.
- Profile naming, if you propose changing `brand` / `functional`.
- Any edit to `business/udesign-ground-truth.md`.

Do not batch a question whose answer you could have derived. Do not ask Kaleb to choose between options you have not costed.

### Phase 3 — Write the plan

Quality bar is plan brief §6: phased with cut lines, every item scored against P1 and P2, every item verifiable, ordered by leverage rather than by architecture, over-engineering named and marked skip, `NEEDS-APPROVAL` marked inline, breaking changes carrying migration notes.

The plan must be executable by S1-S4 as they are scoped in `OPERATION.md` §3. If your investigation shows that segmentation is wrong — a segment should split, merge, or reorder — **say so and propose the correction.** That map was drawn before the boundary was known; you will know more than it does. Changing it is a finding, not a failure.

A subagent can usefully draft a self-contained section of the plan once the decisions are settled and tagged in `DECISIONS.md`. Do not delegate the phasing, the cut lines, or anything still carrying `NEEDS-APPROVAL`.

### Phase 4 — Hand off

Write `docs/v2/S1-language-and-boundary.md` yourself. It points at the plan, `DECISIONS.md`, and the research; it restates none of them. It should tell S1's orchestrator how to run its segment the way this file tells you how to run yours — including which of its work is delegable and which is approval-bound.

Then update `OPERATION.md` §4 and stop.

---

## Done when

- [ ] The boundary rule is one stated sentence, with a migration list, tagged in `DECISIONS.md`.
- [ ] The profile question has an argued answer and Kaleb's decision, tagged.
- [ ] Every personality claim carries `CANON` or `APPROVED`. None is untagged.
- [ ] The plan exists at the path above and meets plan brief §6.
- [ ] Any correction to the S1-S4 segmentation is proposed explicitly.
- [ ] `S1-language-and-boundary.md` is written.
- [ ] `OPERATION.md` §4 reflects reality, including anything unfinished and the next concrete action.

---

## Guardrails

- **You are planning. Do not implement.** No component code, no CSS layer, no checker. Prototype only to answer a feasibility question paper cannot answer, and say so when you do.
- **Never write an unsourced claim about UDesign as though it were settled.** Tag it or ask.
- **Two subagents maximum, concurrently.** Usage limits already killed one agent mid-run during the research pass.
- **Update the ledger before you stop**, including when you stop because you hit a limit. Record the next concrete action, not a status.
- **"UDesign"**, capital U capital D.
