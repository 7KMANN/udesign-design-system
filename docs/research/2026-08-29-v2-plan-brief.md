# Brief for the v2.0.0 implementation-plan author

**Date:** 2026-08-29
**For:** the agent writing the UDesign Design System v2.0.0 implementation plan
**From:** the research pass recorded in [`2026-08-27-design-language-transmission.md`](./2026-08-27-design-language-transmission.md)
**You are writing a plan. You are not writing code.**

---

## 0. Read this first, and do not re-derive it

The investigation is done. It is in `docs/research/2026-08-27-design-language-transmission.md` (1,050 lines, Parts 1-7). **Read it in full before anything else.** It contains the cold-read traces, the rule-vs-prose counts, the falsifiability sandbox results, the field survey with verbatim first-party quotes, and a real production failure with its diagnosis.

Do not repeat its findings in your plan. Cite them by section (`§3.4`, `§7.7 item A`). Your plan should be readable next to it, not instead of it.

**Do verify anything you intend to act on.** The report is evidence, not scripture. Its probes are named in its Sources section and can be re-run. If you find it wrong, say so in the plan and show the check — that is a useful contribution, not an insult.

The four findings that shape everything below, by pointer only:

| Finding | Where |
|---|---|
| Transmission layer missing: the language exists but no entry point reaches it | §1.3, §3.1 |
| Nothing detects a violation: 8 of 8 injected violations passed | §3.4 |
| Composition rules absent entirely, which caused a real production divergence | §7.2, §7.3, §7.6 |
| `ud-btn` has no upstream; the static-HTML path is ungoverned | §7.8 |

---

## 1. The north star

Kaleb's stated goal, verbatim:

> "make the udesign design system so bulletproof I would literally only give a simple prompt like **'use the design system'** and **'fix all drifted stuff or anything that doesn't respect the current design system'**"

Treat those two strings as **acceptance tests for the whole plan.** Every phase you write gets scored against them:

- **P1 — "use the design system."** A fresh agent, given only that sentence and a path or a package, produces UI that a designer would accept without correction. Not just tokens: correct emphasis, correct variant choice, correct feedback, correct profile, correct voice.
- **P2 — "fix all drifted stuff."** A fresh agent, given only that sentence and a consuming repo, finds and reports real violations without inventing rules, and without a human explaining what the design system wants.

A plan item that improves neither is a low priority no matter how satisfying it looks. Say so explicitly when that happens. §7.6 shows what it looks like to score honestly: seven of eight items in the previous hardening plan scored "no" against a real failure, and saying that plainly was the most useful thing in that section.

**Both prompts must work for both consumption models** — React apps (GlobalVision) and static HTML generators (udesignpages). §7.8 is why the second one currently cannot work at all.

---

## 2. Decisions already taken

These came from direct grilling on 2026-08-29. **They are settled. Do not reopen them; build on them.** If evidence emerges that one is wrong, flag it as an explicit question for Kaleb rather than quietly planning around it.

| # | Decision |
|---|---|
| D1 | **Ship a first-class CSS component layer.** Static HTML consumers get governed component classes from the design system, not hand-rolled ones. This is the answer to §7.8. |
| D2 | **Ship a portable checker.** An executable audit a consuming repo can run against its own source and get a violation report. This is what makes P2 real rather than aspirational. |
| D3 | **Free rein, released as v2.0.0.** Breaking changes are permitted. Restructure `DESIGN.md`, rename things, reorganize the registry, move content between repos. |
| D4 | **Full restructure of `udesign-docs` is in scope, including `business/udesign-ground-truth.md`** — subject to the approval protocol in §4. |
| D5 | **Personality is in scope as two clearly separated bodies:** voice-in-the-UI (the words inside the interface) and visual conviction (the stated intent behind the look). Two different kinds of knowledge; do not merge them into one document. |

---

## 3. What you must resolve with evidence

Two questions were deliberately left to you because they need investigation, not opinion. Your plan is incomplete without an argued answer to both.

### 3.1 The boundary: what lives in the design system, what lives in the docs

This is the hardest part of the job and Kaleb named it as such.

The current state is broken in a specific way documented at §2.2: `udesign-contract.md` declares `DESIGN.md` its upstream authority, and then contains substantial content that `DESIGN.md` does not have. The authority points one way and the content sits the other way. Meanwhile `udesign-docs/AGENTS.md` mentions the design system zero times (§2.1), so an agent starting there is not routed.

You must produce **a stated, defensible boundary rule** — one sentence an outsider could apply to a new fact to decide which repo owns it — plus a migration list of every document and section that moves, and what the losing side keeps as a pointer.

Inputs to read before deciding:
- `udesign-docs/standards/knowledge-governance.md` — the org's own rule. It is binding, and `WEBDEV/CLAUDE.md` rule 1 restates it: one home per fact, restating locally creates a second authority that drifts silently.
- `WEBDEV/CLAUDE.md` — the routing canon.
- `udesign-docs/AGENTS.md`, `README.md`, `standards/README.md`, `MIGRATION-MANIFEST.md`
- `udesign-docs/standards/design/udesign-contract.md` and `globalvision-functional-profile.md`
- `udesign-docs/skills/interface-responsiveness/` — all of it. §2.3 calls this the best artifact in the stack; understand why before you move or reference it.
- `udesign-docs/skills/gamified-product-experience/` — read it to understand the intended personality register, and to see how the two skills relate.
- `udesign-docs/business/udesign-ground-truth.md` and `domains/production-glossary.md` — brand voice and vocabulary probably have roots here.

Tensions to resolve rather than paper over:
- The docs repo is org-wide and tagged; the design system is a versioned package. A fact that changes with a design release belongs in the package. A fact that outlives any release belongs in the docs. Where does "the accent is scarce" fall? Argue it.
- `interface-responsiveness` is an org-wide skill that is 90% about design-system primitives. §4 of the previous plan said leave it and reference it. D3 and D4 now permit moving it. Re-decide with reasons.
- A coding agent may start in either repo. Whatever boundary you pick, **both entry points must reach the full picture**, or the boundary has failed regardless of how clean it looks on paper.

### 3.2 The two profiles: what were they actually supposed to be

Kaleb's instruction, verbatim: *"investigate both again they are supposed to be genuinely different read what its about."*

§1.4 and §5.3 found the shipped profiles differ only in color roles, typeface, type scale, radius and shadow — and that motion and behavior are **byte-identically enforced** across them (`DESIGN.md:278`, `tests/token-contract.test.mjs:168`). The report concluded "one design language, two surface treatments" and recommended dropping the overclaim.

**Kaleb says the intent was genuinely different, and he is the one who knows.** Your job is to recover the intent and then decide, with evidence, how far to build toward it.

Read, in this order:
- `docs/superpowers/specs/2026-07-14-dual-design-system-spec.md` — the origin spec. This is where "Impactful Show-Off" and "Brutalist Functional" are named.
- `docs/superpowers/plans/2026-07-14-dual-design-system.md`
- `explorations/option1-brutalist-wire.html`, `option2-velocity-grid.html`, `option3-obsidian-command.html`, and `index.html` — the visual explorations. These are the only place the design intent exists as something you can *look at*. §5.3 notes their vocabulary ("high-tension", "wire", "show-off") appears nowhere on any agent's read path.
- `tokens/udesign.tokens.json` vs `tokens/functional.tokens.json` — the actual 59-token override set.
- The showcase (`showcase/`) and `dist-showcase/` as built evidence of what the two look like today.

Then answer:
1. What did the spec actually intend the difference to be? Quote it.
2. How much of that intent survived into the artifact, and what was dropped, deliberately or by attrition?
3. Should v2.0.0 close the gap, and how far? §5.3 and the third option Kaleb was offered both point at the same promising middle: **keep components and motion identical, put the difference in composition** — brand surfaces spend emphasis freely, functional surfaces are austere and dense. That aligns with the composition gap of §7.3 and does not break the motion guarantee. Evaluate it against genuinely differentiating the primitives, and recommend.
4. Whatever you recommend: the profiles need a **decision rule** (which profile for an ambiguous screen) and a **pin-once rule**, neither of which exists in this repo today (§3.3). And they need names an agent can reason from — `brand` and `functional` carry almost no signal, and `brand` reads to a model as "the default one."

**Constraint:** if you propose making the profiles behaviorally different, you are proposing to break the byte-identical motion guarantee that `tests/token-contract.test.mjs:168` enforces. That test exists for a good reason (§1.4). Say what replaces it.

---

## 4. The approval protocol — read this twice

Kaleb's constraint, verbatim:

> "free rein but is required to go through a lot of grilling as this changes business identity so needs approval by me. If its stuff thats already written in ground truth of docs then no need but if its stuff that it assumes or creates based on the docs then needs approval."

So there is a bright line, and it is about **provenance, not topic**:

| Provenance | Approval |
|---|---|
| Already stated in `udesign-ground-truth.md` or existing standards — you are relocating, restructuring, or citing it | **No approval needed.** Cite the source line. |
| You are inferring, extrapolating, synthesizing, or inventing it — including anything that *sounds* like it follows obviously from the docs | **Explicit approval required before it enters the plan as settled.** |

This applies with full force to D5 (personality). Voice rules and visual conviction are exactly the kind of content an agent will happily invent in a confident tone. "UDesign is warm but precise" is a sentence you can generate; it is not a sentence you can source. **Every personality claim in your plan carries either a citation or an approval marker. No exceptions.**

**How to run the approval:**

1. Do the investigation first. Arrive with evidence, not with blanks.
2. Batch your questions and use the native questionnaire (`AskUserQuestion`), max four at a time, with real options and honest trade-offs in the descriptions — not "what do you think?"
3. Grill in rounds. Investigate, ask, investigate deeper based on the answers, ask again. Kaleb explicitly expects "a lot of grilling" and considers under-asking the worse failure here.
4. For anything you cannot get approved in time, mark it in the plan as `NEEDS-APPROVAL` with your recommendation and the evidence for it, and design the surrounding phase so it can proceed without that item being settled.

Where you will most likely need approval: brand voice and tone; any statement about what UDesign *refuses* to look like; the profile intent if the spec is ambiguous; new naming for the profiles; anything that would edit `udesign-ground-truth.md`; and the emphasis philosophy if you extend it beyond what §7.7 item A already grounds in the observed incident.

---

## 5. Scope checklist

Not a task list — a completeness check. Your plan decides what is in, what is out, and in what order.

**Design system (`udesign-design-system`), v2.0.0:**
- The CSS component layer (D1): which components, what the class API is, how it stays in lockstep with the React registry so the two cannot drift, how it is built and tested, how it ships. This is probably the largest single work item. Note that the design system currently ships exactly seven typography utility classes (§7.8) — you are designing a real surface from near-zero.
- Composition rules: emphasis budget and variant selection (§7.7 A and B). Grounded in the incident, so no approval needed for the core rule; extensions beyond it need approval.
- The transmission fixes: `AGENTS.md` as a real entry gate, the stale README pins, the routing (§6 items 1-4).
- Enforcement inside the repo: the three tests of §6 item 7, which catch three real shipped defects (`select.tsx:18`, `table.tsx:69`, `slider.tsx` — see §1.6 D1/D2/D3). Fix the defects too.
- The portable checker (D2): what it checks, how a consumer runs it, how it handles both React source and generated HTML, and how it avoids false positives. §7.7 item C is the seed. `ENFORCEMENT.md:5` in the responsiveness skill has the governing principle: prefer a cheap rule with no false positives over a clever rule that needs judgement.
- Worked reference screens (§6 item 3, amended by §7.7 item D). Consider one per profile, and consider one static-HTML reference alongside the React one, since D1 creates a second consumption model that needs its own ground truth.
- The unused channels of §1.7: the `docs` field on registry items, `$description` emitted into compiled CSS.
- Personality, per D5 and §4.

**Docs (`udesign-docs`):**
- The boundary migration from §3.1, with the tag bump and a migration note.
- Routing so an agent landing there reaches the design system (§2.1).
- Resolving the inverted authority between `DESIGN.md` and `udesign-contract.md` (§2.2).
- The fate of `interface-responsiveness` under the new boundary.

**Explicitly out of scope:** fixing GlobalVision, udesignpages, or any other consumer. Kaleb was clear: *"its not your job to fix them."* **But you must read them** — they are the evidence for whether the design system is actually usable, and the checker has to run against real code. Read `udesignpages/scrapers/*/generate_catalog.py`, `public/design-system/patterns.html`, and the generated catalogs; read enough of GlobalVision to know what a React consumer needs. Where you find drift, record it as a migration note for later, not as a plan task.

---

## 6. What the plan must look like

- **Location:** `docs/superpowers/plans/2026-08-29-v2-design-language.md`, matching the existing `YYYY-MM-DD-topic.md` convention in that folder. Read one or two existing plans there first and match their register.
- **Phased, with cut lines.** Kaleb must be able to stop after any phase and still have a coherent, shippable system. State at each boundary what is true if he stops there.
- **Every item carries:** the file(s) touched, roughly how big, what it depends on, how it is verified, and its score against P1 and P2 from §1. §7.6 is the model for honest scoring.
- **Every item is verifiable.** A command that fails before and passes after, or an observation someone can make. "Improves clarity" is not a verification. This repo already has a strong testing culture (§1.5) — write to that standard.
- **Order by leverage, not by architecture.** The cheap high-leverage text changes go before the large satisfying build. If the CSS component layer is a week and the composition rules are an hour, the composition rules ship first.
- **Flag over-engineering by name and say skip.** §6 items 9-13 do this and it is why the plan is trustworthy. Kaleb values minimal high-leverage changes and will read a plan that never says "skip this" as a plan that was not thinking.
- **Mark `NEEDS-APPROVAL` inline** per §4.
- **Breaking changes get a migration note** each, since consumers pin by Git tag. You are not fixing consumers, but you are telling them what broke.

---

## 7. Anti-goals

- Do not write code. Prototype only if you must answer a feasibility question a plan cannot answer on paper, and say so when you do.
- Do not restate the research. Link to it.
- Do not invent business identity or brand voice without approval (§4). This is the single most likely way this plan goes wrong.
- Do not build an MCP server. §6 item 9 argues it out: shadcn's own MCP works against any compliant registry with no server-side work, and this repo already meets its only requirement. If you disagree, argue against that section specifically rather than ignoring it.
- Do not add `llms.txt` (§6 item 10 — it is a documentation-website primitive and this is a repo).
- Do not solve the composition problem with prose. §7.9 item 12: countable or it does not survive.
- Do not let the plan grow so large that no one executes it. If the honest answer is a year of work, say that and propose the six weeks that get 80%.

---

## 8. Where to start

1. Read the research report end to end.
2. Read both repos cold, the way §3.1 traces an agent doing it — notice where *you* lose the thread.
3. Read the profile intent sources (§3.2) and form a view.
4. Read udesignpages and GlobalVision as evidence of real consumption.
5. First grilling round: the boundary and the profiles, with options and trade-offs.
6. Investigate deeper on the answers. Second round on personality and anything still open.
7. Write the plan.

The single sentence to keep in view: **an agent given one line and no context should not be able to build the wrong thing.** Everything in the plan either serves that or is a candidate for the skip list.
