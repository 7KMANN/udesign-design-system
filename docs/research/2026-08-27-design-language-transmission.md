# Design language transmission: why agents apply the tokens and not the feel

**Date:** 2026-08-27 (Part 7 addendum added 2026-08-29)
**Question owner:** Kaleb
**Scope:** `udesign-design-system` @ v1.5.0 (commit `75c9271`), `udesign-docs` @ working tree, plus first-party external sources
**Method:** full cold read of both repos, five stress tests with executable probes, external primary-source survey, plus one real observed production failure (Part 7)

---

## Verdict

1. The architecture is sound. The problem is a **transmission layer**, not a design failure. Almost every rule you want an agent to follow is already written down somewhere.
2. The single highest-impact defect is mundane: **`README.md` pins `v1.3.0` in all four copy-pasteable install snippets while `package.json` says `1.5.0`.** An agent that follows the README installs the release that predates press states, motion tokens, `pending`, spinner, skeleton, and pressable. It gets the tokens and literally cannot get the feel.
3. `AGENTS.md` — the file with the strongest automatic agent pickup in the whole repo — is 4,389 bytes about CRLF line endings and `npm install`. It contains **zero** design-language content. That is the most valuable real estate in the repository, spent on a release-script bug.
4. The design language that does exist sits at **81–95% depth inside a 22,911-byte `DESIGN.md`** that no entry point frames as "the point". A weak model reads the first 30% and stops.
5. The richest, most transmissible statement of the design language — the 100ms feedback floor, the four layers, the response-time budget, 19 numbered banned patterns — is **not in this repo**. It lives in `udesign-docs/standards/design/udesign-contract.md`, a document that declares itself a *downstream distillation* of a `DESIGN.md` that does not contain it. The distillation is richer than its stated source.
6. **Nothing detects a violation.** I injected 8 deliberate design-language violations into a sandbox copy; **8 of 8 passed silently.** The one gate that reddened did so for unrelated bookkeeping and its message tells the agent to delete the exemption.
7. The "two very different design languages" claim does not survive inspection. As shipped, the profiles differ in **color roles, typeface, type scale, radius, and shadow — nothing else.** No density override, no spacing override, no behavior difference, and motion is *deliberately and mechanically* identical. The words "Impactful Show-Off" and "Brutalist Functional" appear in no file an agent reads.
8. Your prompts were probably fine. A prompt cannot fix a README that installs the wrong version.
9. What you want is called an **interaction model / behavioral spec**, and it survives weak models only in three forms: numbered bans, numeric thresholds, and a worked reference screen. Adjectives never survive.
10. Fix items 1–4 of the hardening plan and the repo defends itself with roughly 6 KB of new text and one stale-string change. Everything below rank 8 is over-engineering — skip it.
11. **See Part 7 (added 2026-08-29).** A real failure since observed shows a second missing body of content this Verdict did not anticipate: *composition* rules (how much emphasis a screen may spend) as distinct from *feedback* rules. Eight of the nine items above would not have prevented it. Items A and B of §7.7 would, in about 27 lines.

---

# Part 1 — Evidence: the design system repo

## 1.1 What is actually there

| File | Bytes | What it carries | Design language? |
|---|---:|---|---|
| `AGENTS.md` | 4,389 | CRLF/`autocrlf` release bug, npm install gotcha | **None** |
| `README.md` | 11,314 | Install, token vocabulary, role lists, build commands | Token rules only |
| `DESIGN.md` | 22,911 | YAML token frontmatter + the real prose spec | **Yes — buried** |
| `.cursorrules` | 3,515 | 5 style bans, 3 coding practices, verification pipeline | Partial |
| `.gemini/rules` | 2,870 | Near-verbatim copy of `.cursorrules` | Partial |
| `HANDOFF.md` | 664 | A copy-paste consumer prompt | Token-only |
| `registry.json` | 15,308 | 28 items, `title` + `description` each | Descriptions only |
| `public/r/core.json` | 54,683 | The bytes `shadcn add` actually fetches | 29 comment lines |

`DESIGN.md` is genuinely good. It is not the problem. Its Motion section (`DESIGN.md:259-292`) publishes a semantic duration vocabulary with a stated interaction ceiling, an intensity cap that is argued rather than asserted, and a reduced-motion contract baked into the token layer. `DESIGN.md:276`:

> "**The duration vocabulary is open; the reaction magnitude is capped.** These are two axes."

And `DESIGN.md:318`:

> "Every interactive primitive here has a pressed state - a control that changes nothing on press is the single most common failure in machine-written UI."

That is exactly the kind of sentence that transmits. The problem is where it sits.

## 1.2 The component source is the strongest asset you have

The registry components carry their design rationale in inline comments, and **shadcn copies comments into the consuming repository verbatim.** This is the one channel that already works without a prompt.

`registry/new-york/ui/button.tsx:21-24`:

```
// Press treatment is per-variant on purpose: a neutral surface darkens to the
// pressed role, a solid surface has no deeper solid role to move to. Every
// variant keeps a non-motion signal, because --motion-press-scale collapses to
// 1 under prefers-reduced-motion and colour does not.
```

`registry/new-york/ui/button.tsx:51-52`:

```
// A pending button keeps its own colours. Greying it out reads as
// "broken", which is the opposite of what it is doing.
```

I verified these survive into the shipped payload:

| Rationale comment | Present in `public/r/core.json`? |
|---|---|
| button press-treatment rationale | **PRESENT** |
| button pending "greying it out reads as broken" | **PRESENT** |
| pressable "rather than from a div with an onClick" | **PRESENT** |
| skeleton "causes a jump on arrival" | **PRESENT** |
| spinner "the shape is still a visible busy indicator" | **PRESENT** |
| moment "SAFETY CAP" block | ABSENT — `moment` is excluded from `core` by design |

But it is **29 comment lines across 923 lines of shipped code**, all component-local. There is no system-level statement of feel anywhere in the payload.

## 1.3 The stale README (the biggest single finding)

`package.json:3` — `"version": "1.5.0"`.

`README.md` contains four copy-pasteable install snippets. All four pin **v1.3.0**:

| Line | Snippet |
|---:|---|
| `README.md:9` | `## What ships in 1.3.0` |
| `README.md:50` | `"udesign-design-system": "github:7KMANN/udesign-design-system#v1.3.0"` |
| `README.md:81` | `"@udesign": ".../v1.3.0/public/r/{name}.json"` |
| `README.md:95` | `npx shadcn@latest add .../v1.3.0/public/r/core.json` |
| `README.md:101` | `npx shadcn@latest add .../v1.3.0/public/r/button.json` |

What landed after v1.3.0, per `CHANGELOG.md:3-10`:

- **v1.4.0** — the entire motion token layer, intensity scale, `data-game`, three motion primitives.
- **v1.5.0** — "press and pending states on every interactive primitive, and spinner, skeleton, and pressable in core."

So an agent that does exactly what the README says installs a version with **no `--motion-*` tokens, no `pending` prop on Button, no Spinner, no Skeleton, no Pressable, and no press states.** The tokens work. The feel is not in the box. This alone is sufficient to produce the symptom you described, independent of prompt quality.

## 1.4 The profiles: named in one place, defined in another, described in a third

| Where | What the profiles are called |
|---|---|
| `docs/superpowers/specs/2026-07-14-dual-design-system-spec.md:1,17-18` | "Impactful Show-Off" / "Brutalist Functional" |
| `docs/superpowers/plans/2026-07-14-dual-design-system.md:5` | "Impactful Show-Off vs Brutalist Functional - Geometric Wire" |
| `tokens/functional.tokens.json:3` | "Geometric Brutalist Wire - Option 1. High-tension ERP wireframes" |
| `explorations/option1-brutalist-wire.html:6` | "Geometric Brutalist Wire (High-Tension Technical ERP)" |
| `dist/tokens-functional.css:1` | `/* Standalone UDesign Functional Brutalist Wire Tokens */` |
| **`DESIGN.md`, `README.md`, `AGENTS.md`, `.cursorrules`** | **"brand" / "functional" — no adjectives at all** |

The evocative language that carries the *design intent* — brutalist, high-tension, wire, show-off, luxury — exists exclusively in spec/plan/exploration files and one build comment. Not one of those is on any agent's read path.

**What the profiles actually differ by.** I enumerated every override in `tokens/functional.tokens.json` (59 leaf tokens vs. 286 in the base tree):

| Family | Overridden? |
|---|---|
| Color roles (`role.*`, `dark.role.*`) | Yes — 42 tokens |
| Font family + typography scale | Yes — 10 tokens |
| Radius (`sm 7→2`, `base 10→3`, `lg 16→4`) | Yes — 4 tokens |
| Shadow (1 and 2 → transparent/none) | Yes — 3 tokens |
| **Spacing / density** | **No** |
| **Control height / touch target** | **No** |
| **Motion (duration, easing, press, intensity)** | **No — structurally forbidden** |
| **Component behavior / API** | **No** |

`DESIGN.md:278` makes the motion identity explicit and `tests/token-contract.test.mjs:168` enforces it byte-for-byte ("motion is byte-identical in the brand and functional profile blocks"). That is a good decision, well enforced.

But it means the honest description of the two profiles is: *the same interface, in a different typeface, with sharper corners, harder borders, and no shadows.* Calling that "two very different design languages" is the spec doc's ambition, not the artifact's behavior. The gap between those two statements is itself a source of agent confusion.

## 1.5 The enforcement layer, precisely scoped

`scripts/lint-design.mjs` (226 lines) — **never opens a component file.** Verified: no `readdirSync`, no `.tsx`, no `registry` path in the whole script. It reads `DESIGN.md` and the two token JSONs and checks: banned slate hexes, the literal strings `backdrop-filter`/`glassmorphism`, em-dashes, YAML/prose 1:1 component coverage, `{token.ref}` resolution, and accent/cream hex agreement. All of that is about the *spec document*, not about any UI.

`tests/motion-adoption.test.mjs` (85 lines) is the real jewel and deserves to be said plainly: **it is the only genuinely machine-checkable design-language test in the stack.** Its header (`tests/motion-adoption.test.mjs:6-14`) states the problem better than any doc in either repo:

> "v1.4.0 published a motion token layer that was correct, tested, tagged - and consumed by two of twenty-four components. ... A token layer nobody consumes is indistinguishable from no token layer, and no test in this repository could tell the difference."

It enforces four things: every published motion token has a consumer or a recorded exemption; no exemption outlives its use; no component declares a raw duration/easing; every transition names a duration token; and every file in a hard-coded `PRESSED` list has a press treatment.

Its limits are the important part:
- `PRESSED` (`tests/motion-adoption.test.mjs:77`) is a literal 8-name array. `slider.tsx` and `table.tsx` are not in it.
- It scans `registry/new-york/ui` in **this** repo. It does not travel to a consuming application. Nothing you ship enforces anything downstream.

## 1.6 Probe: do the primitives implement what the docs claim?

Probe at `scratchpad/probe-interaction.mjs`. Checks are lexical over component source; delegation (e.g. `icon-button` → `Button`) is *not* resolved, so read the raw table with that caveat. Interactive files only:

| Component | press | focus-visible | 44px | motion token | disabled roles | Notes |
|---|---|---|---|---|---|---|
| `button.tsx` | PASS | PASS | PASS | PASS | PASS | clean |
| `pressable.tsx` | PASS | PASS | PASS | PASS | PASS | clean |
| `checkbox.tsx` | PASS | PASS | PASS | PASS | PASS | clean |
| `switch.tsx` | PASS | PASS | PASS | PASS | PASS | clean |
| `tabs.tsx` | PASS | PASS | PASS | PASS | PASS | clean |
| `dialog.tsx` | PASS | PASS | PASS | PASS | PASS | clean |
| `sheet.tsx` | PASS | PASS | PASS | PASS | fail | overlay, acceptable |
| `select.tsx` | PASS | **fail** | PASS | PASS | PASS | **real defect, below** |
| `slider.tsx` | **fail** | PASS | PASS | PASS | PASS | **no press on thumb** |
| `table.tsx` | PASS | **fail** | PASS | PASS | fail | **real defect, below** |
| `icon-button.tsx` | — | — | PASS | — | — | delegates to `Button`, fine |
| `input`/`textarea`/`field`/`tooltip` | — | mixed | mixed | — | mixed | press not applicable |

Three genuine defects the current gates cannot see:

**D1 — `registry/new-york/ui/select.tsx:18` uses `focus:` where the rest of the system uses `focus-visible:`.**

```
... active:bg-[var(--interactive-pressed)] focus:outline-none focus:ring-2 focus:ring-[var(--interactive-focus)] ...
```

`DESIGN.md:200` says: "Do not remove the browser outline without supplying an equivalent `:focus-visible` treatment." `SelectTrigger` removes the outline and replaces it with a `:focus` ring, which fires on mouse click too. Every other control in the registry uses `focus-visible:`. Nothing checks this.

**D2 — `registry/new-york/ui/table.tsx:69`: `TableRow` ships interactive styling on a non-focusable element.**

```
hover:bg-[var(--interactive-hover)] active:bg-[var(--interactive-pressed)] data-[state=selected]:...
```

A `<tr>` with hover *and* pressed states signals "click me" while offering no `tabIndex`, no `role`, and no keyboard path. `udesign-contract.md:231` bans exactly this ("`:hover` is not a substitute: it does not exist on touch and does not fire for keyboard activation"), and `udesign-contract.md:239` requires clickable rows to be real buttons — which is precisely what `Pressable` exists for. `table.tsx` is not in the `PRESSED` list, and no test asserts the inverse rule (press styling implies a focusable element).

**D3 — `registry/new-york/ui/slider.tsx:116-123`: the thumb has `focus-visible:` but no `active:` press treatment**, and `slider.tsx` is absent from `PRESSED`, so the adoption floor does not notice.

## 1.7 The unused channels

| Channel | Status | Evidence |
|---|---|---|
| `registry-item.docs` field | **0 of 28 items use it** | probed every item in `registry.json` |
| DTCG `$description` | 26 of 286 base tokens (9%), 4 of 59 functional | probed both token trees |
| `$description` → compiled CSS | **dropped at build** | 0 occurrences of any description string in `dist/tokens.css` |
| showcase reference screens | not shipped to consumers | absent from `package.json:9-20` `files` array |

The motion family's `$description` text is genuinely excellent — `tokens/udesign.tokens.json` motion group:

> "Press compression, toggle flip. Short enough to read as direct manipulation rather than as an animation."

That is Carbon-grade when-to-use guidance (see §3.3), authored, correct, and then **thrown away by `scripts/build.mjs`**. Nobody downstream ever sees it.

## 1.8 Small credibility leak

`.cursorrules:15` and `.gemini/rules:15` ban em-dashes "in any documentation or code formats". Actual counts:

| File | em-dashes |
|---|---:|
| `AGENTS.md` | **9** |
| `.cursorrules` | **2** |
| `.gemini/rules` | **2** |
| `DESIGN.md`, `README.md`, `CHANGELOG.md`, `HANDOFF.md` | 0 |

`scripts/lint-design.mjs:58` only scans `DESIGN.md`. So the two files that *state* the rule both break it, and the linter is structurally blind to that. An agent reading `.cursorrules` and then `AGENTS.md` learns, correctly, that these rules are aspirational.

---

# Part 2 — Evidence: `udesign-docs`

## 2.1 An agent landing here is not routed to the design system

`udesign-docs/AGENTS.md` (4,856 bytes) is the file agents pick up automatically. It covers ownership, status vocabulary, overlay linking, and how to add a document. It mentions `udesign-design-system` **zero times**. It mentions the bundled skills **zero times**.

The only pointer to the design system is `README.md:87-88`, in a "Related" section at the very bottom of the file. The only pointer to the skills is `README.md:51-52`, two lines inside an ASCII repository tree.

`standards/README.md` — the index for the design standard — lists four documents and **does not list `skills/` at all.**

So the routing chain that reaches the interaction rules is: `AGENTS.md` (no mention) → `README.md` line 87 (bottom) → `standards/design/udesign-contract.md` → line 136 → the skill. Four hops, the first of which is a dead end.

## 2.2 The distillation is richer than its declared source

`udesign-contract.md:19` states: *"If this file and upstream `DESIGN.md` ever disagree, upstream wins and this file must be corrected."*

But the contract contains an entire **Feedback** section (`udesign-contract.md:95-140`) with content that has no counterpart in `DESIGN.md`:

- The 100ms floor, stated as an absolute: *"Every interaction produces a visible change within 100ms of the input, before any network call resolves. This is the feedback floor. There is no opt-out."*
- A four-layer table (Acknowledgement / Pending / Result / Emphasis) with per-layer requirements.
- The ordering rule: *"Layer 3 is illegal on any surface whose ordinary controls do not yet have layers 0 through 2."*
- A five-row response-time budget table (`<100ms` / `100-300ms` / `300ms-1s` / `1s-10s` / `>10s`).
- An INP p75 ≤ 200ms target.
- 19 numbered banned patterns vs. `DESIGN.md`'s 12 unnumbered ones.

I grepped `DESIGN.md` for `100ms`, "feedback floor", "layer 0", "response time", "optimistic", "pending state", "INP". The only hit is `DESIGN.md:312`, which *refers* to "the contract's Feedback section" — a forward reference to a document in another repository that this repository never links to.

This is a direct violation of the org's own rule. `WEBDEV/CLAUDE.md` states: *"a business, design, or platform fact has exactly one home ... Restating it locally creates a second authority that drifts silently."* Here it is worse than drift: the authority is nominally upstream and the content is only downstream.

## 2.3 The skill is the best artifact in the entire stack

`skills/interface-responsiveness/SKILL.md` (12,657 bytes) opens with the one rule (`SKILL.md:10`) and then, at `SKILL.md:16-18`, diagnoses your exact problem before you asked it:

> "Machine-written UI fails in a specific, recognizable way. The markup is correct, the tokens are semantic, the accessibility attributes are present, the tests pass - and the interface feels dead. ... This happens because feedback is invisible in the artifacts an agent optimizes against. A missing pending state breaks no test, violates no type, fails no lint, and reads fine in a diff."

It is a correctly-formed Agent Skill: valid frontmatter, a trigger-rich `description`, and seven `references/*.md` files loaded on demand — textbook progressive disclosure per Anthropic's documented format. `references/ENFORCEMENT.md:129-137` even specifies the routing fix this report independently arrived at:

> "The root instruction file routes UI work to this skill by name, in the same place it routes to the design contract. ... The failure this guards against is not disagreement; it is confident improvisation."

**That instruction has been followed in `udesign-docs` and in the GlobalVision contract. It has never been followed in `udesign-design-system`.** Grep confirms: `interface-responsiveness` appears **zero times** anywhere in the design system repo.

---

# Part 3 — Stress test results

## 3.1 Cold-read test: which bytes reach an agent, in order

Token estimates at ~4 chars/token.

| Entry point | Files an agent actually loads | Bytes | ~Tokens | Reaches the feel rules? |
|---|---|---:|---:|---|
| **(a)** "use the design system at `<path>`" | `AGENTS.md`, `README.md`, `.cursorrules` | 19,218 | 4,805 | **No.** Zero interaction/motion/feedback rules in any of the three. |
| **(a+)** …and follows the pointer to `DESIGN.md` | + `DESIGN.md` | 38,614 | 9,654 | **Only if it reads past 53%.** |
| **(b)** `git pull` + `npm install` | `README.md`, `DESIGN.md`, `HANDOFF.md`, `dist/tokens.css` | 57,911 | 14,478 | Same as (a+), **and the README installs v1.3.0.** |
| **(c)** starts in `udesign-docs` | `AGENTS.md`, `README.md`, `standards/README.md`, `udesign-contract.md` | 38,172 | 9,543 | **Yes — best path**, but only if it gets past an `AGENTS.md` that never names the design system. |
| **(d)** `shadcn add @udesign/core` | `public/r/core.json` | 54,683 | 13,671 | **No.** 29 comment lines of rationale; no `docs` field; no `DESIGN.md`; no `README`. |

Depth of the design-language content inside `DESIGN.md` (22,911 bytes):

| Byte offset | ~Tokens in | % through the file | Section |
|---:|---:|---:|---|
| 7,868 | 1,967 | 34% | `## Interaction states` |
| 12,095 | 3,024 | 53% | `## Motion` |
| 18,559 | 4,640 | 81% | the feedback-floor mention |
| 21,654 | 5,414 | 95% | `## Banned design patterns` |

**Where the design language drops out:** at the very first hop, for three of the five paths. `AGENTS.md` is what an agent reads first (per the AGENTS.md spec, agents "automatically locate and read AGENTS.md files in the project hierarchy"), and it contains none of it. `.cursorrules` and `.gemini/rules` — the tool-specific pickup files — contain five color/typography bans and a build pipeline, and nothing about how anything should behave.

A small model that reads `AGENTS.md` + `README.md` and starts writing has consumed 3,926 tokens and learned: warm neutrals, no glassmorphism, use semantic vars, run these commands. It has learned nothing about press, pending, focus, result, or motion. It will produce exactly what you described: correct tokens, dead interface.

## 3.2 Instruction-extraction test: rules vs. prose

Classifier at `scratchpad/classify.mjs`. It splits each document into statements, keeps the normative ones, and asks whether each carries a **checkable predicate** — a named token/selector/attribute, a number with a unit, a named file or command, a code span a grep could find. The heuristic is crude (it scores "Color-only status is banned" as non-checkable because it names no artifact), so treat the ratio as directional and the *examples* as the finding.

| Document | Statements | Normative | Checkable | Adjectival-only | % checkable |
|---|---:|---:|---:|---:|---:|
| `.cursorrules` | 31 | 18 | 8 | 10 | **44%** |
| `udesign-docs/…/udesign-contract.md` | 315 | 90 | 36 | 54 | **40%** |
| `AGENTS.md` (design system) | 54 | 8 | 2 | 6 | 25% |
| `interface-responsiveness/SKILL.md` | 151 | 54 | 12 | 42 | 22% |
| **`DESIGN.md`** | 254 | 81 | **16** | 65 | **20%** |
| `README.md` (design system) | 115 | 34 | 6 | 28 | 18% |

Rules that transmit — a model can check itself:

> `DESIGN.md:200` — "Use at least a 2px outline with separation from the component edge"
> `DESIGN.md:269` — "`slow` | 350ms | Route transition, shared-element morph. **The interaction ceiling.**"
> `udesign-contract.md:97` — "Every interaction produces a visible change within 100ms of the input, before any network call resolves."
> `udesign-contract.md:92` — "Full-height mobile layouts use `svh` (never `vh`, `dvh`, or `h-screen`)."

Statements that do not transmit — nothing to check against:

> `DESIGN.md:107` — "Public and presentation surfaces need recognizable brand impact."
> `DESIGN.md:125` — "Its signature is the contrast between a quiet warm field and a compact geometric UDesign lockup."
> `DESIGN.md:129` — "It suits production, scheduling, accounting, and administration."
> `DESIGN.md:133` — "Dark theme uses solid surfaces with clear separation."
> `README.md:116` — "Do not choose a token because its current color looks convenient."

`DESIGN.md` has **11 pure-flavour statements** — a quality word and zero verifiable predicate. Every one of them is in the Purpose / Profile matrix / Theme behavior region, i.e. the first 25% of the file, i.e. the part a weak model definitely reads. The first thing `DESIGN.md` teaches an agent is the part it cannot act on.

## 3.3 Profile-confusion test

**Could an agent correctly pick a profile from this repo's docs alone?** The complete evidence trail is two sentences:

> `DESIGN.md:125` — "It suits marketing, proposals, client portals, and presentation-led screens."
> `DESIGN.md:129` — "It suits production, scheduling, accounting, and administration."

For a screen that is neither ("a client-facing order status page", "an internal dashboard we demo to clients"), there is no rule, no decision tree, no tiebreaker, and no instruction to ask.

**Would it know not to mix them?** No — and worse, `DESIGN.md:133` licenses mixing:

> "Components must work when a profile or theme is nested inside another application surface."

The pin-once rule exists in exactly one place, `udesign-contract.md:25`, and is framed as a **GlobalVision-specific ratified decision**, not a general design-system rule:

> "**GlobalVision is functional-profile only.** `data-design="functional"` is pinned at the document root."

An agent working on any other product has no reason to apply that. There is no statement anywhere in `udesign-design-system` that says one profile per document, declared once at the root, never switched at runtime, never nested.

## 3.4 Falsifiability test: can a wrong-feeling UI pass?

Sandbox at `scratchpad/sandbox/` — a copy of `registry/new-york/ui` + `dist/tokens.css` + the repo's own `tests/motion-adoption.test.mjs`, with 8 deliberate violations injected as new component files. Then the repo's own gate was run against it.

| # | Injected violation | Which rule it breaks | Caught? |
|---:|---|---|---|
| V1 | `<div onClick>` row: no press, no focus, no keyboard | `DESIGN.md:318`; contract banned pattern 16 | **No** |
| V2 | `<Button onClick={async …}>` with no `pending` | contract banned pattern 15 | **No** |
| V3 | Scale that differs by `[data-design=brand]` vs `functional` | `DESIGN.md:278` and `:369` — explicitly banned | **No** |
| V4 | Status dot, color only, no label/icon | `DESIGN.md:364` | **No** |
| V5 | Full-viewport `fixed inset-0 z-[9999]` celebration | `DESIGN.md:367` — intensity 3 | **No*** |
| V6 | `uppercase tracking-widest` mono label | `DESIGN.md:361` | **No** |
| V7 | `shadow-[var(--shadow-3)]` on an ordinary content card | `DESIGN.md:366` | **No** |
| V8 | `<Suspense fallback={null}>` | contract banned pattern 18 | **No** |

**8 of 8 pass silently. 0 of 8 caught.**

\* V5 produced the single red test — but for the wrong reason. It tripped `no exemption outlives its usefulness` (`tests/motion-adoption.test.mjs:41`) purely because the confetti happened to reference `--motion-duration-slow`, an exempted token. The failure message is:

> `now consumed - delete the exemption: --motion-duration-slow`

An agent obeying that message deletes the exemption and the full-screen celebration becomes permanently green. The one gate that fired actively instructs the agent to launder the violation.

For completeness, the real suite is healthy on its own terms: `node scripts/lint-design.mjs` → "Validation PASSED with 0 errors"; `npm run test:contracts` → **49/49 pass**. The suite is not broken. It is aimed at the token layer and at this repo's own 27 components, and it is aimed nowhere else.

### Violations that currently pass silently

1. A clickable `div`/`tr` with an `onClick` and no keyboard path — including one this repo ships (`table.tsx:69`).
2. Any async control with no pending state.
3. A `:focus` ring where the system requires `:focus-visible` — including one this repo ships (`select.tsx:18`).
4. Motion or scale that varies between the two profiles, in component code.
5. Color-only status, metric, entity, or chart communication.
6. A screen-level celebration / intensity-3 effect.
7. Wide-tracked uppercase labels in component or app code.
8. Shadows on ordinary content cards in the functional profile.
9. `<Suspense fallback={null}>` and any empty boundary.
10. A raw hex or `var(--ud-*)` primitive in component source — no test scans component files for either.
11. Em-dashes anywhere except `DESIGN.md`.
12. An interactive primitive added to `registry/new-york/ui/` and simply not added to the `PRESSED` array — the floor is opt-in by hand.

---

# Part 4 — Field survey: what the primary sources say

## 4.1 Tokens are defined to be values. This is not an opinion.

The DTCG format spec defines a token as: *"information associated with a human readable name, at minimum a name/value pair."* Its `$type` set is `color, dimension, fontFamily, fontWeight, duration, cubicBezier, number` plus composites `strokeStyle, border, transition, shadow, gradient, typography`. There is **no mechanism in the spec for encoding behavior, interaction rules, or conditional/when-to-use guidance.** ([designtokens.org/TR/drafts/format](https://www.designtokens.org/TR/drafts/format/))

The only prose affordance is `$description`: *"A plain text description explaining the token's purpose can be provided via the optional `$description` property. Tools MAY use the description in various ways"* — including *"source code comments"*. That "MAY" is the whole opening, and it is one you have already half-taken and then closed at build time (§1.7).

So: **tokens transmit because they are mechanical, and they cannot carry feel because the spec says they carry values.** The asymmetry you observed is structural, not a failure of your writing.

## 4.2 What the shadcn registry can and cannot carry

The `registry-item` schema includes `$schema, name, title, description, type, author, dependencies, devDependencies, registryDependencies, files, tailwind, cssVars, css, envVars, font, docs, categories, meta`. The **`docs`** field exists specifically to *"show custom documentation or message when installing your registry item via the CLI."* ([ui.shadcn.com/docs/registry/registry-item-json](https://ui.shadcn.com/docs/registry/registry-item-json))

That is a first-party, zero-cost channel that fires **at the exact moment an agent installs a component**, and you use it on 0 of 28 items.

shadcn also ships an **MCP server** that works against any compliant registry with no special server-side work — *"The MCP server works by requesting your registry index"* — configured by the consumer with `shadcn@latest mcp init`. It lets an agent browse the registry, resolve dependencies, and generate code from items. ([ui.shadcn.com/docs/registry/mcp](https://ui.shadcn.com/docs/registry/mcp)) You already satisfy its only requirement (a valid `registry.json` at a fetchable URL), so this costs you nothing to enable and is a consumer-side config change, not a build.

## 4.3 How mature systems encode feel: the `$description` trick

IBM Carbon puts when-to-use guidance in `$description` on **every single motion token**. From `packages/motion/src/dtcg/motion.json` (first-party source):

| Token | Value | `$description` |
|---|---|---|
| `fast.01` | 70 ms | "Micro-interactions such as button and toggle. Instant response to user action." |
| `fast.02` | 110 ms | "Micro-interactions such as fade in. Subtle entrance or exit of small UI elements." |
| `moderate.01` | 150 ms | "Micro-interactions, small expansion, short distance movements. Default transition speed." |
| `moderate.02` | 240 ms | "Expansion, system communication, toast." |
| `slow.01` | 400 ms | "Large expansion, important system notifications." |
| `slow.02` | 700 ms | "Background dimming, large hero transitions." |
| `standard.productive` | `cubic-bezier(0.2, 0, 0.38, 0.9)` | "Used for UI elements that move within the viewport." |
| `standard.expressive` | `cubic-bezier(0.4, 0.14, 0.3, 1)` | "Used for elements with more prominent, fluid movement." |

([raw.githubusercontent.com/carbon-design-system/carbon/main/packages/motion/src/dtcg/motion.json](https://raw.githubusercontent.com/carbon-design-system/carbon/main/packages/motion/src/dtcg/motion.json))

Note the shape: **name → number → the situation it is for.** Carbon also splits motion into named *modes* — productive vs. expressive — and states that "productive motion is significantly faster than expressive motion", with duration scaling non-linearly with distance travelled. ([carbondesignsystem.com/elements/motion/overview](https://carbondesignsystem.com/elements/motion/overview/))

**Your motion tokens already do this, and better prose than Carbon's.** You just delete it at compile time.

Carbon's productive/expressive split is also the closest published analogue to your brand/functional pair — and it is worth noting Carbon puts the *motion* difference in the profile, whereas you deliberately forbid that. Neither is wrong; but Carbon's two modes have a stated behavioral difference and yours do not, which is why "two very different design languages" reads as overclaim.

## 4.4 Atlassian: the only large system to publish measured results on this exact question

Atlassian shipped **`DESIGN.md`** as a portable format: *"a portable markdown file that describes just the key elements of a design system"*, structured as machine-readable tokens in YAML frontmatter plus human/agent-readable design rationale. Theirs is ~80 KB / ~19,800 LLM tokens. ([atlassian.com/blog/how-we-build/atlassians-design-md-is-here…](https://www.atlassian.com/blog/how-we-build/atlassians-design-md-is-here-what-we-learned-testing-portable-design-context-in-practice))

**Your `DESIGN.md` is already in this format** — YAML token frontmatter (lines 1-101) plus prose rationale (lines 103-375) — at 22,911 bytes. That is convergent evolution and it is a point in your favour.

Their finding on its limits is the one you should read twice: `DESIGN.md` *"exclude[s] code guidance"*, and that omission *"caused agents to recreate components rather than reuse them, reducing maintainability."* They conclude it is best for *"quick prototyping in unfamiliar environments"* and theming, **not for production codebases, where specialized tooling wins.** In a head-to-head generating a login screen, `DESIGN.md` cost 7.21M tokens / 6m46s / 45.3 turns versus their MCP server at 3.75M / 5m01s / 35.1 turns.

Their structured-content approach measured: *"up to 52% accuracy improvement on specific queries"*, "34% faster", "26% reduction in AI tool calls", "16% reduction in token usage", "11% fewer errors". And the failure mode without it: agents *"find outdated patterns, miss accessibility requirements, or invent components that don't exist."* ([atlassian.com/blog/ai-at-work/teaching-ai-to-speak-our-design-language](https://www.atlassian.com/blog/ai-at-work/teaching-ai-to-speak-our-design-language))

"Find outdated patterns" is literally your v1.3.0 README problem.

Their `llms.txt` ([atlassian.design/llms.txt](https://atlassian.design/llms.txt)) is a hybrid: a link index that also embeds architectural rules — token layer, primitives, components, styling standards, accessibility, plus ESLint/codemod/MCP endpoints.

## 4.5 The field has converged, and it converged on skills and MCP

The July 2026 *State of AI in Design Systems* study surveyed 20 design systems (Ant Design, Atlassian, Carbon, Chakra UI, daisyUI, HeroUI, Nuxt UI, PatternFly, Primer, React Spectrum, Salesforce Lightning, shadcn/ui, Shopify Polaris, and others) across 187 AI affordances:

| Affordance | Systems shipping it (of 20) |
|---|---:|
| MCP servers | 19 |
| **Agent skills (Claude)** | **18** |
| Repo agent files (`AGENTS.md` / `CLAUDE.md`) | 15 |
| `llms.txt` | 14 |
| AI documentation pages | 14 |
| Storybook integration | 13 |
| Registries | 11 |
| CLI scaffolding | 9 |
| Editor rules (Cursor/Copilot) | 8 |

([state-of-ai-in-design-systems.netlify.app](https://state-of-ai-in-design-systems.netlify.app/))

Two readings matter for you. First, **agent skills are second only to MCP in adoption (18/20)** — and you already own a first-class one, sitting in the wrong repository, referenced by neither `AGENTS.md`. Second, mature systems ship *multiple complementary* affordances rather than betting on one; you currently ship one (the registry) and one-and-a-half (`AGENTS.md`, but with no design content).

Shopify likewise exposes Polaris through the Shopify dev MCP server, and in May 2026 added `llms.txt`, `llms-full.txt`, and `agents.md` endpoints to every store. ([shopify.dev/docs/api/polaris/using-mcp](https://shopify.dev/docs/api/polaris/using-mcp))

## 4.6 Why concrete constraints beat adjectives — first-party

Anthropic's prompting guidance is explicit:

> "Claude responds well to clear, explicit instructions. Being specific about your desired output can help enhance results. If you want 'above and beyond' behavior, explicitly request it rather than relying on the model to infer this from vague prompts."
> "Think of Claude as a brilliant but new employee who lacks context on your norms and workflows."
> "**Golden rule:** Show your prompt to a colleague with minimal context on the task and ask them to follow it. If they'd be confused, Claude will be too."

([platform.claude.com/docs/en/build-with-claude/prompt-engineering/be-clear-and-direct](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/be-clear-and-direct))

Apply the golden rule to `DESIGN.md:125`: hand "Its signature is the contrast between a quiet warm field and a compact geometric UDesign lockup" to a competent junior with no context and ask them to build a screen. They will be confused. So is the model.

## 4.7 Why a Skill is the right container for this specific content

Anthropic's Agent Skills documentation states the case directly:

> "Create a skill when you keep pasting the same instructions, checklist, or multi-step procedure into chat, or when a section of CLAUDE.md has grown into a procedure rather than a fact. Unlike CLAUDE.md content, a skill's body loads only when it's used, so long reference material costs almost nothing until you need it."

([code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills))

And the three-level progressive-disclosure model from the engineering post: metadata (name + description) at startup → full `SKILL.md` when relevant → `references/*.md` on demand. *"Progressive disclosure is the core design principle that makes Agent Skills flexible and scalable."* ([anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills))

This is exactly the shape of the problem: ~6 KB of feel rules that must be *reliably reachable* but must not be paid for on every unrelated task. The `AGENTS.md` spec's own guidance points the same way — it recommends *"anything you'd tell a new teammate"*, with *"the closest AGENTS.md to the edited file wins; explicit user chat prompts override everything."* ([agents.md](https://agents.md/))

---

# Part 5 — Answers

## 5.1 Is the repo on the right path?

**Yes, and it is further along than the symptom suggests.** The token architecture is correct and well-tested. `tests/motion-adoption.test.mjs` is a genuinely sophisticated piece of design-system engineering — an adoption floor that fails when a published token loses its consumers is a thing most design systems do not have and should. The component rationale comments are the right instinct in the right place. The `data-game` cascade-inert design is elegant. The intensity cap, argued rather than asserted, is the kind of rule that survives contact with an agent.

**But the transmission layer is missing, and one line of it is actively broken.** Concretely:

- The README installs the wrong version. Everything below this is secondary until it is fixed.
- The highest-pickup file (`AGENTS.md`) carries none of the design language.
- The best statement of the design language lives in another repo and is unreferenced from here.
- Nothing detects a violation: 8/8 injected violations passed.

**What is theatre — say it plainly:**

- **`.gemini/rules` is a near-verbatim duplicate of `.cursorrules`.** Two copies of the same five rules that will drift. Both already violate their own em-dash ban.
- **`HANDOFF.md`** is a 664-byte prompt template that tells the consuming agent to read the README and DESIGN.md — i.e. it hands off the *token* story and nothing else. As written it is a liability: it is the file whose entire job is onboarding a consumer, and its 3-step list contains zero mention of behavior.
- **`explorations/`** (three static HTML mockups) and the `docs/superpowers/plans/*` files are historical artifacts. They hold the only occurrences of the profiles' real names, which means the naming is effectively lost. Harmless to keep, useless where they are.
- **The `## Showcase acceptance` section of `DESIGN.md` (lines 340-354)** asserts what the showcase must demonstrate; the Playwright suite screenshots 4 pages × 2 themes × 2 profiles × 3 widths but asserts nothing about hover, pressed, selected, focus, or disabled states, despite line 349 requiring them. That is an acceptance criterion with no acceptance test.

## 5.2 Is a design system *capable* of teaching design language to an agent?

Yes — but not through the token layer, and the correct term matters.

- **Design language** is the umbrella (color, type, shape, motion, voice). Too broad to be actionable.
- **Design tokens** are values. Per DTCG, definitionally incapable of carrying behavior.
- What you are missing is an **interaction model** (how a control answers input over time) expressed as a **behavioral contract** — a set of falsifiable obligations with thresholds. The `udesign-contract.md` Feedback section is a well-formed one, and it is in the wrong repository.

**Three forms survive a weak model. Everything else evaporates:**

1. **A numbered prohibition naming a concrete artifact.** "An interactive element with no pressed state" (contract #16) transmits. "Restrained overlay elevation" does not. Numbered lists also give the model a self-audit surface — it can enumerate 1..19 and answer each.
2. **A numeric threshold with a unit.** "Within 100ms of the input, before any network call resolves." "The interaction ceiling is 350ms." "44px in both axes." A model can check itself against a number. It cannot check itself against "confident".
3. **A worked reference screen it can diff against.** One real file that is correct in every respect, that the agent is told to open and imitate. This is the single most token-efficient way to transmit feel, because the model is far better at pattern-matching a concrete example than at instantiating an adjective.

And one mechanical form that is worth more than all three: **a test that fails.** Anthropic's own guidance is that models will not infer unstated preferences from vague prompts; a red test is the least ambiguous instruction that exists.

## 5.3 The two profiles: strength or trap?

**As currently shipped, they are a mild trap — but a much smaller one than you fear, because the profiles differ far less than the docs imply.**

The trap has three parts:

1. **No decision rule.** Two "It suits…" sentences and nothing for the ambiguous case. An agent will pick by vibe, and vibe defaults to whatever the last example it saw used.
2. **No pin-once rule in this repo**, and `DESIGN.md:133` affirmatively licenses nesting one profile inside another.
3. **A naming vacuum.** The design intent lives in words ("brutalist wire", "high-tension", "show-off") that appear nowhere an agent reads. Agents lean heavily on names; `brand` and `functional` carry almost no signal, and `brand` in particular reads to a model as "the default one".

The mitigating fact is that you have already made the correct architectural call and enforced it: motion and intensity are identical across profiles, structurally, with no override path (`DESIGN.md:278`; `tests/token-contract.test.mjs:168`). That kills the worst version of the multi-brand agent-confusion problem — an agent cannot get the *behavior* wrong by picking the wrong profile, only the typeface and the corner radius.

Carbon's productive/expressive precedent suggests two named modes is a normal, workable structure. The difference is that Carbon's two modes have a stated, documented behavioral distinction and a per-token `$description` telling you which to reach for. Yours have neither.

**Recommendation: keep two profiles, add one decision rule and one pin-once rule (about 8 lines total), and drop "very different design languages" from how you describe them.** They are one design language with two surface treatments. Saying so accurately will confuse agents less than the current overclaim.

## 5.4 Were your prompts bad?

**Partly, but that is not what is wrong.** No prompt fixes a README that installs v1.3.0.

The honest split: if you said "use the UDesign design system", that instruction is under-specified in a way that predictably yields tokens-only — you named a *dependency*, and the agent installed a dependency. But the repo's own defaults are what should have covered the gap, and they do not. Fix the repo first; the prompts below are the belt to the repo's braces.

### Prompt templates

**1 — Local path, build something**

```
Use the UDesign design system at C:\Users\Kaleb\WEBDEV\udesign-design-system.

Read DESIGN.md IN FULL before writing any code, especially the sections
"Interaction states", "Motion", "Feedback primitives", and "Banned design
patterns". The tokens are the easy half; those four sections are the point.

Then build: <what>. Use data-design="functional" (or "brand"), pinned once at
the document root.

Before you show me anything, list every interactive element you added and, for
each, state its press state, its focus-visible treatment, and what the user
sees in the first 100ms. If any row is blank, fix it before answering.
```

**2 — Consuming repo / git pull**

```
This project consumes the UDesign design system. Install v1.5.0 (NOT the
v1.3.0 the README shows - the README is stale):

  npm i "udesign-design-system@github:7KMANN/udesign-design-system#v1.5.0"

Read node_modules/udesign-design-system/DESIGN.md in full, then load the
`interface-responsiveness` skill. Both, before writing code.

Use Button's `pending` prop for anything async, Pressable for any clickable
card/row/list item, and Skeleton sized to the real content. Never a div with
an onClick.
```

**3 — Build me screen X**

```
Build <screen> using the UDesign design system.

Non-negotiable, check yourself against each before you answer:
1. Every interactive element has a visible :active press state.
2. Every async action shows pending in the control that was clicked, with
   aria-busy and no layout shift.
3. Every success AND failure is visible in place, not only as a toast.
4. Every duration/easing comes from a --motion-* role. No duration-200.
5. Every clickable row/card is a real <button> (use Pressable), never a div.
6. Status never communicated by color alone.
7. One data-design profile, set once at the root.

Report the seven as a checklist with what you did for each.
```

**4 — Audit an existing screen**

```
Audit <path> against the UDesign design system.

Read DESIGN.md "Interaction states", "Motion", and "Banned design patterns"
first, plus the `interface-responsiveness` skill.

Produce a table: element | has press? | has focus-visible? | async? | pending
state? | failure visible? | motion from token? | keyboard-reachable?

Rank the failures by how dead they make the screen feel. Do not fix anything
yet.
```

**5 — Starting from `udesign-docs`**

```
Read udesign-docs/standards/design/udesign-contract.md, in full, including the
"Feedback" section (the 100ms floor, the four layers, the response-time
budget) and all 19 banned patterns. Then read the interface-responsiveness
skill it points at.

The tokens and primitives live in udesign-design-system (v1.5.0) - install
from there, do not reimplement.

Then: <task>.
```

---

# Part 6 — Hardening plan

Ranked by leverage per byte. Items 1-4 are the ones that matter; they total roughly 6 KB of new text plus one string fix. Items 5-8 are worth doing when convenient. Items 9-12 are explicitly flagged as over-engineering — **skip them.**

### 1. Fix the stale version pins in `README.md` — 5 changed strings, ~10 minutes

**File:** `README.md` lines 9, 50, 81, 95, 101 — `1.3.0` → `1.5.0`.
**Why it works:** it is the difference between an agent installing a package that has press states and one that does not. This is not a documentation improvement; it is a correctness bug in the primary install path.
**Also:** add a release-script assertion that no `vX.Y.Z` string in `README.md` is older than `package.json.version`. About 8 lines in `scripts/release.mjs`. Without it this recurs at every release — it already has, twice.

### 2. Rewrite `AGENTS.md` as the single canonical agent entry file — ~2 KB

**File:** `AGENTS.md`. Move the CRLF/npm content to a new `docs/TOOLING-PITFALLS.md` and link to it in one line.

New `AGENTS.md` structure:

```
# udesign-design-system - agent instructions

## You are here for the design LANGUAGE, not the tokens.
Tokens are a CSS import and they work on their own. The reason this repo
exists is the four rules below. An interface with perfect tokens and no
feedback is the failure this system was built to prevent.

## The four rules (check yourself against these before you answer)
1. Every interaction shows a visible change within 100ms, before any network
   call resolves. No exceptions.
2. Every interactive element has a pressed state. A div with an onClick is
   never acceptable - use Pressable.
3. Every async control shows pending in itself: aria-busy, no layout shift.
   Button has a `pending` prop. Use it.
4. Duration and easing come from --motion-* roles. Never duration-200,
   never a literal cubic-bezier.

## Pick exactly one profile, once, at the document root
<html data-design="functional">  operational tools: production, scheduling,
                                 accounting, admin, dashboards, internal
<html data-design="brand">       presentation surfaces: marketing, proposals,
                                 client portals, pitch screens
Never both. Never nested. Never switched at runtime. If a screen is genuinely
both, stop and ask - do not improvise a mix.
The profiles differ in typeface, radius, border weight, shadow, and canvas.
They do NOT differ in motion, density, or behavior - that is enforced.

## Then read, in this order
1. DESIGN.md - "Interaction states", "Motion", "Feedback primitives",
   "Banned design patterns". These four are the point; the rest is reference.
2. examples/order-queue.tsx - the reference screen. Imitate it.
3. docs/TOOLING-PITFALLS.md - only when a script fails.
```

**Why it works:** the AGENTS.md spec says agents locate and read this file automatically, and it is the closest instruction file to every edit. Putting the four rules in the first 400 bytes means a weak model that reads nothing else still gets them. This is the single highest leverage-per-byte change available.

### 3. Add one worked reference screen — ~150 lines

**File:** `examples/order-queue.tsx` (new; add `"examples"` to `package.json` `files`).

One realistic functional-profile screen that is correct in every dimension: a table that becomes a card collection at 375px via `ResponsiveCollection`; rows as `Pressable`; a filter `Select`; one async action using `Button pending`; a `Skeleton` loading state sized to the real rows; an inline failure message; an `EmptyState`; a `StatusBadge` with icon *and* label. Heavily commented with *why*, in the same voice as `button.tsx:21`.

**Why it works:** this is the highest-bandwidth form of design language for a model. Atlassian's finding was that `DESIGN.md`-style prose alone *"caused agents to recreate components rather than reuse them"* precisely because it excluded code guidance. A reference screen is the code guidance. It also gives you a diff target for audits.

### 4. Point at the `interface-responsiveness` skill, and stop duplicating it — ~40 lines total

The skill is the right artifact in the wrong place, and the Feedback contract exists in two repos with the source-of-truth claim pointing the wrong way (§2.2). Fix the ownership, do not copy the text.

- **In `udesign-design-system/AGENTS.md`:** one line — *"Any change to an interactive element - a button, form, link, row, tab, dialog, filter, upload, or nav item - loads the `interface-responsiveness` skill first, every time. One button counts."* Verbatim the trigger language `ENFORCEMENT.md:129-137` already prescribes.
- **In `DESIGN.md`:** replace the dangling forward reference at line 312 ("the contract's Feedback section") with a real link, and add the 100ms floor and the four-layer table to `DESIGN.md` itself — since `udesign-contract.md:19` declares `DESIGN.md` the upstream authority, the content has to actually be here. ~25 lines.
- **In `udesign-docs/AGENTS.md`:** add a routing line naming `udesign-design-system` and a routing line naming `skills/`. Currently `AGENTS.md` mentions neither, and `standards/README.md` does not list `skills/` at all.
- **Consider moving** the skill directory into `udesign-design-system` and leaving a pointer in `udesign-docs`. Argument for: it is a design-system concern and `SKILL.md:193` already says the primitives live there. Argument against: it is org-wide and `udesign-docs` owns standards. **Verdict: leave it in `udesign-docs`, but reference it from the design system's `AGENTS.md`.** Moving it re-opens the ownership question for no transmission gain — the skill loads by name from the user's installed skill set regardless of which repo holds the canonical copy.

### 5. Populate the `docs` field on the interaction-critical registry items — ~600 bytes

**File:** `registry.json`, the `docs` field on `button`, `pressable`, `spinner`, `skeleton`, `table`, `moment`, and `core`.

For `core`:

```
"docs": "UDesign core installed. Before you build: every interactive element
needs a visible press state within 100ms; every async control needs
Button's `pending`; every clickable row or card is <Pressable>, never a div
with onClick; durations come from --motion-* roles. Read DESIGN.md sections
'Interaction states' and 'Motion'."
```

**Why it works:** shadcn shows `docs` in the CLI at install time — the one moment the agent is guaranteed to be paying attention and is about to write UI code. It is the only channel that fires on entry path (d), which is currently the worst path in the matrix (§3.1). First-party, free, and you already have the field.

### 6. Emit `$description` into the compiled CSS — ~15 lines in `scripts/build.mjs`

Currently 100% of your token when-to-use guidance is discarded at build (§1.7). Emit each token's `$description` as a trailing CSS comment, at least for the `motion`, `interactive`, and `tone` families:

```css
--motion-duration-instant: 70ms;  /* Press compression, toggle flip. Short enough to read as direct manipulation. */
```

**Why it works:** this is exactly Carbon's published pattern, and `dist/tokens.css` is one of the few files that reaches *every* consumer on *every* path. It adds maybe 3 KB to a 23 KB file and turns a value list into a guidance surface. Your prose is already written and already better than Carbon's.

### 7. Three new machine-checkable tests — ~60 lines

Add to `tests/motion-adoption.test.mjs` (or a sibling). These are the cheap, zero-false-positive rules that `ENFORCEMENT.md:5` argues for:

- **`press-implies-focusable`** — a component file containing `active:bg-[var(--interactive-pressed)]` or `active:scale-[var(--motion-press-scale` must also contain `focus-visible:` or render a `<button>`/Radix trigger. **This catches `table.tsx:69` today.**
- **`focus-visible-not-focus`** — no component may use `focus:ring` / `focus:outline-none` without `focus-visible:`. **This catches `select.tsx:18` today.**
- **`pressed-list-is-complete`** — derive the `PRESSED` array instead of hardcoding it: any file rendering a `<button>`, `role="button"`, or a Radix `Trigger`/`Item` must have a press treatment or a named exemption. Fail-closed, same pattern as the existing `EXEMPT` map. **This catches `slider.tsx` today and every future primitive automatically.**

**Why it works:** three real bugs found by three regexes, and the third converts a hand-maintained list into a fail-closed guard. Per `ENFORCEMENT.md:5`: *"prefer a cheap rule with no false positives over a clever rule that needs judgement."*

### 8. Add an explicit anti-example table to `DESIGN.md` — ~25 lines

Convert the 12 unnumbered bullets under "Banned design patterns" into a numbered three-column table: `# | Banned | Do this instead`, and adopt the contract's 19 items so the two documents finally agree. Numbering matters: it gives an agent an enumerable self-audit surface, which is why the contract's version is the more usable document today.

---

### Skip these — over-engineering for your situation

**9. A dedicated MCP server for the design system.** Atlassian's numbers are real (34% faster, 26% fewer tool calls) but they operate a design system with a full-time team and a documentation pipeline. You would be building and hosting a service to solve a problem that items 1-4 solve with 6 KB of markdown. **If you ever want MCP, use shadcn's** — it works against any compliant registry with no server-side work, and you already meet its only requirement. Tell consumers to run `shadcn mcp init` and you are done. Do not write your own.

**10. An `llms.txt` for the design system.** `llms.txt` is a link index for a *documentation website*. You have no documentation website — you have a git repo with an `AGENTS.md`, which is the correct primitive for a repo. Adding `llms.txt` would create a fourth partial copy of the rules to drift alongside `.cursorrules`, `.gemini/rules`, and `udesign-contract.md`. Skip.

**11. Authoring a second skill inside the design system.** You already have `interface-responsiveness`, it is well-formed, and it is loaded. A second, design-system-local skill would duplicate 80% of it and immediately begin to drift. Item 4's one-line routing reference gets you the whole benefit.

**12. Browser-level interaction e2e tests (press-state assertions in Playwright).** `ENFORCEMENT.md:97-109` specifies seven of these and they are genuinely the only way to prove feedback exists. But they belong in the **consuming application**, where real async calls and real routes exist. In a component showcase with no network, "assert `aria-busy` appears within 100ms" is asserting against a mock. High cost, low signal, here. Build them in GlobalVision instead.

**13. Deleting `.gemini/rules`.** Tempting — it is a drifting duplicate — but Gemini CLI reads it and deleting it silently drops coverage for that tool. Instead reduce both `.cursorrules` and `.gemini/rules` to ~10 lines: the four rules from item 2 plus "read `AGENTS.md` and `DESIGN.md`". Cheaper than maintaining two full copies, and it removes the em-dash embarrassment.

---

### Suggested order

| # | Change | Effort | Leverage |
|---:|---|---|---|
| 1 | Fix `README.md` v1.3.0 → v1.5.0 + release assertion | 20 min | **Critical** |
| 2 | Rewrite `AGENTS.md` as the language gate | 1 hr | **Critical** |
| 3 | `examples/order-queue.tsx` reference screen | 2-3 hrs | High |
| 4 | Route to `interface-responsiveness`; move the Feedback contract upstream into `DESIGN.md` | 1 hr | High |
| 5 | `docs` field on 7 registry items | 30 min | High |
| 6 | Emit `$description` into `dist/tokens.css` | 1 hr | Medium |
| 7 | Three new tests (catch `table`, `select`, `slider`) | 1 hr | Medium |
| 8 | Numbered anti-example table in `DESIGN.md` | 45 min | Medium |
| — | 9-13 | — | **Skip** |

Items 1 and 2 alone plausibly resolve most of the symptom you reported.

---

# Part 7 — Addendum (2026-08-29): the catalog button incident

A real failure arrived after this report was written. It is the best evidence in the document, because it is a controlled experiment that happened by accident: **one design system, one profile, three agents, three catalogs, one divergence.** It also exposes a blind spot in Part 6 — see §7.6, where the original plan scores badly.

## 7.1 What happened

Three catalog sites were generated by three parallel subagents from a shared Python template (`generate_catalog.py`), all told to use this design system, all on the same profile.

| Catalog | Card CTA | Renders as |
|---|---|---|
| `2b1a3e5c-…` | `ud-btn ud-btn-secondary` | warm stone `--secondary` `#efe9dd` |
| `019d7262-…` | `ud-btn ud-btn-secondary` | warm stone `--secondary` `#efe9dd` |
| **`019e34a7-…`** | **`ud-btn ud-btn-primary`** | **solid accent `--primary` `#c79f6b`** |

The divergent catalog renders roughly 36 solid-gold buttons in one grid, competing with the product photography. The owner's call, after seeing it: warm stone is correct, on grounds of **accent fatigue**.

**Both agents were fully compliant.** No raw hexes, WCAG contrast held, focus-visible rings and 100ms transitions present in all three. `button-primary` and `button-secondary` are both valid, documented, spec-compliant components. Neither agent broke a single rule this repository states.

## 7.2 Verified: the repo cannot decide this question

The complete guidance the repo offers on choosing between these two variants is one noun phrase.

> `DESIGN.md:296` — "**`button-primary`** uses `{colors.primary}` with `{colors.on-primary}` **for the main action**."
> `DESIGN.md:298` — "**`button-secondary`** uses `{colors.canvas}` with `{colors.ink}` and a `{colors.hairline}` boundary." — purpose not stated at all.

"The main action" has no stated scope. The main action *of what*? The divergent agent read "Voir Détails" as the main action **of the card**. The other two read it as a secondary browsing link **on the page**. Both readings are correct English and both are consistent with `DESIGN.md`. The document does not contain the sentence that would separate them.

Greps across `DESIGN.md`, `README.md`, `AGENTS.md`, `.cursorrules`, `.gemini/rules`, `registry.json`, `udesign-docs/standards/`, and `udesign-docs/skills/`:

| Searched for | Hits in design system | Hits in design standards |
|---|---:|---:|
| `accent fatigue` | **0** | **0** |
| `emphasis budget` | **0** | **0** |
| `one primary` / `only one primary` / `primary action per` | **0** | **0**\* |
| `accent density`, `reserve the accent`, `accent is reserved` | **0** | **0** |
| `when to use`, `which variant`, `use … when` | **0** | — |
| `at most`, `no more than`, `how many` | **0** | — |

\* The eight `one primary` hits in `udesign-docs` are all in `skills/gamified-product-experience/` and refer to **game mechanics per surface**, not visual emphasis. Unrelated domain; no transfer.

Vocabulary census of `DESIGN.md`:

| Term | Count | What the hits actually are |
|---|---:|---|
| `hierarchy` | 1 | `DESIGN.md:360`, banning decorative gradients "used to manufacture hierarchy" |
| `emphasis` | 4 | 2 are `StatusBadge` variant names, 2 are motion easing/duration names |
| `prominence`, `visual weight`, `composition`, `repeated`, `grid of`, `page level` | **0** | — |

So the one time `DESIGN.md` says "hierarchy" it is *forbidding a way of faking it*, never establishing how to build it.

**The Layout section is about geometry, not hierarchy.** `DESIGN.md:227-251` covers spacing roles, touch targets, column collapse, dialog sizing, and safe-area insets. Its only mention of primary actions — "Primary actions remain reachable without covering required content" — is about physical reachability at 375px, not about how many may exist. The repo has a section governing where things sit and no section governing what things weigh.

## 7.3 Component rules vs composition rules — the real gap

Part 3.2 measured *checkable vs adjectival*. This incident reveals a second, orthogonal axis that matters more, and on which the repo scores near zero.

| Axis | Definition | Example | `DESIGN.md` coverage |
|---|---|---|---|
| **Component-level** | What a thing must look like and do when it exists | "button-primary uses `{colors.primary}`"; "every interactive element has a pressed state"; "44px in both axes" | Extensive, well-tested |
| **Composition-level** | Which thing to use where, how many, and how much emphasis one view may spend | "only one primary button per screen"; "repeated collection CTAs are low-emphasis" | **Effectively zero** |

Every rule in the Verdict's list — the 100ms floor, press states, `pending`, motion tokens, focus-visible — is component-level. They are the rules that make a control feel *alive*. None is a rule about what a *screen* should feel like, and a screen is what an agent is asked to build.

This is the honest restatement of the owner's original question. "Tokens are easy, teaching how it should feel is harder" is right, but the split is finer than tokens-vs-feel:

1. **Tokens** — values. Transmit mechanically. Solved.
2. **Component behavior** — press, pending, focus, motion. Documented well here, transmitted badly (Parts 1-3). Fixable by Part 6 items 1-4.
3. **Composition** — hierarchy, emphasis allocation, restraint. **Not written down at all, in either repo.**

Layer 3 is the one that reads as *taste*, and it is the layer that made catalog three look wrong. An agent cannot infer it, because it is genuinely arbitrary until someone decides it: nothing in physics says 36 gold buttons is wrong. It is wrong because UDesign says the accent is scarce. That sentence does not exist yet.

This also explains the shape of the original complaint precisely. Layer 2 failures make one control feel dead. Layer 3 failures make a *correct-looking* screen feel cheap — much harder to point at, and exactly the "applied the tokens nicely but not the design language" symptom.

## 7.4 The prompt half

The divergent subagent's prompt contained:

> "Buttons: Solid accent primary, hover to accent-deep, 100ms feedback..."

This is the clearest available answer to "were my prompts bad?", and it sharpens §5.4. The prompt was not vague. It was **specific about the wrong layer**: it enumerated component styling and, in doing so, silently made a composition decision. The agent then did the correct thing — it followed an explicit instruction over a repository file it had partially read. The AGENTS.md spec is explicit that "explicit user chat prompts override everything" ([agents.md](https://agents.md/)), so this is the system working as designed.

The other two subagents received token-compliance prompts, touched no variant, and inherited the template's existing `ud-btn-secondary`. **They were right by omission, not by understanding.** Worth stating plainly: two of three catalogs are correct because their agents changed nothing, so the success rate of the current setup on this question is zero out of three, not two out of three.

The general lesson, and it is teachable:

> A prompt that enumerates component styling substitutes itself for the system's hierarchy rules. State the screen's intent and its emphasis budget; let the system choose the variant.

| | |
|---|---|
| ❌ | "Buttons: Solid accent primary, hover to accent-deep, 100ms feedback" |
| ✅ | "Dense listing grid, ~36 repeated cards, no hero action on this page. The product photography carries the hierarchy — card CTAs are low-emphasis." |

The second names no variant and gets the variant right — **but only once the repo carries the rule.** Today it would fail too, because "low-emphasis" maps to nothing in `DESIGN.md`. Prompt and repo have to be fixed together; the repo half is the one that survives the owner forgetting.

**Second-order finding:** three parallel agents each made a locally defensible call and nothing reconciled them. The divergence was caught by human eye. Nothing in `tests/` or `scripts/` compares two generated surfaces, and nothing counts accent instances per view. Of the three candidate fixes — a rule in the repo, a lint on generated output, or a reconciliation pass over parallel agent work — **the rule is by far the cheapest and the only one that scales to agents you do not control.** A reconciliation pass costs a full extra agent run per batch and still needs a rule to reconcile *toward*.

## 7.5 What the field writes here (verbatim)

Every mature system solves this with a countable sentence. This is the artifact UDesign is missing, and the wording is worth copying rather than reinventing.

**IBM Carbon** — the closest match to the incident, because it names the exact surface type:

> "Each page should have only one primary button. Any remaining calls to action should be represented as lower emphasis buttons." (`usage.mdx:111-113`)

> "Primary buttons should only appear once per screen (not including the application header, modal dialog, or side panel)." (`usage.mdx:130`)

> "If your layout requires multiple actions—as is the case with some toolbars, data lists and dashboards—low emphasis buttons (tertiary or ghost) may be a better choice." (`usage.mdx:216-220`)

> "As a general rule, a layout should contain a single high-emphasis button that makes it clear that other buttons have less importance in the hierarchy." (`usage.mdx:227-229`)

([raw.githubusercontent.com/carbon-design-system/carbon-website/main/src/pages/components/button/usage.mdx](https://raw.githubusercontent.com/carbon-design-system/carbon-website/main/src/pages/components/button/usage.mdx))

Note the parenthetical in the second quote. Carbon anticipated the scope ambiguity that broke catalog three and closed it explicitly, by enumerating the containers that get their own budget.

**Shopify Polaris** — states the limit, and separately assigns the card case a variant by name:

> "Use to highlight the most important actions in any experience. Don't use more than one primary button in a section or screen to avoid overwhelming merchants." (`button.mdx:43`)

> "Use for less important or less commonly used actions since they're less prominent. For example, **plain buttons are used as actions in cards**." (`button.mdx:34`)

([raw.githubusercontent.com/Shopify/polaris/main/polaris.shopify.com/content/components/actions/button.mdx](https://raw.githubusercontent.com/Shopify/polaris/main/polaris.shopify.com/content/components/actions/button.mdx))

**Material Design 3** — same rule, stated for layouts and again for toolbars: a layout should contain a single prominent button that makes clear other buttons have less importance in the hierarchy, and emphasizing more than one action at a time should be avoided. ([m3.material.io/components/buttons/guidelines](https://m3.material.io/components/buttons/guidelines), [m3.material.io/components/toolbars/guidelines](https://m3.material.io/components/toolbars/guidelines))

Three independent first-party systems converge on the same countable rule, and two of the three explicitly name repeated collections (cards, data lists, dashboards) as the case that takes the low-emphasis variant. The incident is a known, solved, well-documented problem that this design system has not yet written down.

## 7.6 Scoring Part 6 against the incident

The test: **would this change have stopped catalog three from going gold?**

| # | Part 6 item | Stops it? | Why |
|---:|---|:--:|---|
| 1 | README v1.3.0 → v1.5.0 | **No** | Version has nothing to do with variant choice |
| 2 | `AGENTS.md` four rules | **No** | All four are feedback rules. A gold button has a press state |
| 3 | `examples/order-queue.tsx` reference screen | **Partly** | Only if it contains a repeated collection with low-emphasis CTAs, and only by imitation, never stated |
| 4 | Route to `interface-responsiveness` | **No** | The skill is about feedback over time, not emphasis allocation |
| 5 | `docs` field on registry items | **No** as drafted | Draft text is all press/pending/motion |
| 6 | `$description` into CSS | **No** | Motion descriptions only |
| 7 | Three new tests | **No** | All three check press/focus on components |
| 8 | Numbered anti-example table | **No** as drafted | All 12 existing bans are component-level |

**Eight items, one partial.** The original plan is a good plan for the layer-2 problem and would have done nothing here. That is the blind spot: Part 6 was built from a diagnosis that assumed the missing content was *feedback*, when a second body of missing content is *hierarchy*. Both are missing; only one was in scope.

## 7.7 New hardening items

Inserted at rank 2.5 — above the reference screen, below the `AGENTS.md` rewrite, because item 2 is the vehicle for item A.

### A. State the emphasis budget. ~12 lines. **Stops the incident: yes.**

**Files:** a new `## Emphasis and hierarchy` section in `DESIGN.md` (before `## Components`), plus four lines carried into the `AGENTS.md` of item 2.

```
## Emphasis and hierarchy

The accent is scarce. It is the loudest thing the system owns, and its
value comes from how rarely it appears.

1. One accent-filled action per screen. Not per card, not per section -
   per screen. Headers, modals, and side panels each get their own one.
2. A repeated element never carries the accent. If a control appears
   once per row, per card, or per list item, it is `secondary` or
   `ghost`, however important that control feels in isolation.
3. When a surface needs many actions - toolbars, data tables, dashboards,
   catalog grids - they are all low emphasis. A screen with no accent at
   all is correct and common.
4. If a screen's imagery or data is the subject, the accent stays off the
   chrome around it.

The test: count the accent-filled controls in one viewport. More than one
means the hierarchy is wrong, not that the screen is important.
```

Rule 2 alone decides the incident, in one sentence, with no judgement required. It is countable, so an agent can self-audit against it and so can a lint. The Carbon parenthetical is carried into rule 1 to close the scope ambiguity that caused the divergence.

### B. Give every variant a "use when". ~15 lines. **Stops the incident: yes.**

**File:** `DESIGN.md` `## Components` (lines 294-302). Today each entry states what a variant *is made of* and, for `secondary` and `outline`, nothing about purpose. Add one clause each, Carbon-shaped — name, then situation:

| Variant | Add |
|---|---|
| `button-primary` | "The single most important action on the screen. Never in a repeated element." |
| `button-secondary` | "The default for actions inside cards, rows, and list items, and for the negative half of a pair." |
| `button-outline` | "A standalone action that must not compete with the screen's primary." |
| `ghost` | "Dense toolbars and table row actions, where several controls sit together." |

**Why it works:** this is the `$description` pattern of §4.3 applied to components instead of tokens, and it puts the rule at the exact point of decision. The variant list is *already* where an agent looks when choosing a variant; it currently answers the wrong question there.

### C. Count the accent in generated output. ~25 lines. **Stops the incident: catches it, does not prevent it.**

A check that fails when one rendered page contains more than one accent-filled control, or any accent-filled control inside a repeated block. Cheap as a grep over emitted HTML: count `ud-btn-primary` per file, fail above 1.

**Where it belongs:** in `udesignpages`, next to `generate_catalog.py`, not in this repo. This repo ships no pages. Same reasoning as Part 6 item 12 — the assertion needs real output to assert against. Written here so it is not lost.

**This is the only item that would have caught the divergence automatically, without any agent reading anything.** Rank it below A and B, because A and B are what it would fail *against*, but do not skip it: it is the answer to the multi-agent consistency problem in §7.4.

### D. Amend item 3: the reference screen must exercise restraint. **Stops the incident: yes, by imitation.**

`examples/order-queue.tsx` as specified in Part 6 has one async action and a table of rows. Add the explicit requirement that **the row-level actions are `secondary`/`ghost` and the screen has at most one accent-filled control**, with a comment saying so in the `button.tsx:21` voice. A reference screen that happens to be restrained teaches restraint; one that is silently restrained teaches nothing when an agent copies only the part it needs.

### E. A sixth prompt template — collection screens

```
Build <screen> using the UDesign design system.

Emphasis budget: this is a <dense listing grid | dashboard | toolbar-heavy
tool> with ~N repeated <cards|rows>. The <photography|data> is the subject.
At most one accent-filled control on the whole screen, and none inside a
repeated element - repeated CTAs are secondary or ghost.

Before you answer, count the accent-filled controls in one viewport and
report the number. If it is more than 1, fix it first.
```

The count-and-report closer is the same self-audit device as the seven-point checklist in template 3, applied to the layer that checklist misses.

### Revised order

| # | Change | Effort | Stops the incident |
|---:|---|---|:--:|
| 1 | README `v1.3.0` → `v1.5.0` + release assertion | 20 min | no |
| 2 | `AGENTS.md` as the language gate, **now carrying rule A** | 1 hr | **yes** |
| 2.5 | **A. `## Emphasis and hierarchy` in `DESIGN.md`** | 30 min | **yes** |
| 2.6 | **B. "Use when" on every variant** | 30 min | **yes** |
| 3 | Reference screen, **amended per D** | 2-3 hrs | **yes** |
| 4 | Route to `interface-responsiveness`; Feedback contract upstream | 1 hr | no |
| 5 | `docs` field on 7 registry items — add the accent rule to the text | 30 min | partly |
| 6 | `$description` into `dist/tokens.css` | 1 hr | no |
| 7 | Three new tests | 1 hr | no |
| 8 | Numbered anti-example table — **add composition bans** | 45 min | partly |
| — | **C. accent count in `udesignpages`** | 45 min | catches |
| — | 9-13 | — | skip |

A and B together are about 27 lines of markdown, cost under an hour, and are the only things in this document that address the failure actually observed in production.

## 7.8 The finding underneath the incident: `ud-btn` has no upstream

Discovered 2026-08-29 while verifying §7.1. It reframes the incident and is the largest architectural gap in this document.

**`ud-btn` does not exist in `udesign-design-system`.** A repo-wide grep (excluding `node_modules`) returns two hits, both incidental: this research file, and `docs/superpowers/plans/2026-07-11-udesign-showcase-and-rules.md`. There is no `.ud-btn` rule in `dist/tokens.css`, no button CSS class in any shipped file, and nothing in `package.json:9-20` `files` that could carry one.

What `dist/tokens.css` actually ships, structurally:

| Lines | Content |
|---|---|
| 5-524 | Custom properties under `:root`, `[data-design="functional"]`, `[data-theme="dark"]`, `[data-game="on"]` |
| 555-561 | A seven-class typography utility layer: `.ud-display`, `.ud-h1`, `.ud-h2`, `.ud-h3`, `.ud-body`, `.ud-label`, `.ud-data` |

That is the entire CSS class surface. Everything else the design system offers is React, via the shadcn registry.

Meanwhile `.ud-btn` is defined and used across **71 files in `udesignpages`** — the three catalogs' generated HTML and `style.css`, the generators (`scrapers/hpgbrands/generate_catalog.py`, `scrapers/dmlcreation/toques/generate_catalog.py`, `scrapers/other/…/upgrade_html.py`), and `public/design-system/patterns.html` — a second design-system surface living entirely in the consumer.

### What this changes

1. **The incident was not two agents choosing between two documented variants.** It was two agents choosing between two variants of a class layer the design system does not own, define, test, or govern. `DESIGN.md:296`'s statement about `button-primary` is about a *registry component*; `ud-btn-primary` is a different artifact that merely borrows the `ud-` prefix from the typography utilities. Even a perfectly-written composition rule in `DESIGN.md` would not have bound it, because nothing connects the two namespaces.

2. **The static-HTML consumption path is undocumented and ungoverned.** An agent generating static pages gets tokens and seven typography classes, then must invent every component it needs. It will invent them in the `ud-` style, because that is the convention it sees, which makes the invention look sanctioned. `udesignpages` has been doing exactly this, at scale, since at least the 2026-07-11 rollout plan.

3. **`public/design-system/patterns.html` is a second source of truth.** Its existence means a consumer built its own pattern library because the upstream one did not cover its rendering model. Whatever it says is now competing authority, in the repo least equipped to maintain it.

4. **It explains why the composition gap went unnoticed.** Part 3.4 injected violations into *registry components* and ran the repo's own gate. Nothing in this stack ever looks at generated HTML, so an entire consumption path — the one that produced the incident — has never been tested by anything.

### Consequence for the plan

The "one simple prompt" goal cannot be met for static HTML while the components an agent needs have no upstream definition. Either the design system publishes governed CSS classes, or the docs must state plainly that static HTML is unsupported below the token layer. **Decision taken 2026-08-29: publish a first-class CSS component layer.** See the v2.0.0 plan brief for scope.

Verification for this section: `Grep "ud-btn"` over `udesign-design-system` excluding `node_modules` (2 hits, both prose); `Grep "\.ud-btn"` over `udesignpages` excluding `node_modules` (71 files); `grep -n "^\.\|^\[data-\|^:root" dist/tokens.css` (selector census above); `sed -n '1,28p' package.json` (files array).

## 7.9 Revision to the Verdict

Verdict item 9 said design language survives a weak model in three forms: numbered bans, numeric thresholds, and a worked reference screen. That stands, and is incomplete — it described the forms and not the *subjects*. Add:

> **11. There are two bodies of missing content, not one.** Feedback rules (how a control answers input) are written well and routed badly. Composition rules (how much emphasis a screen may spend) are not written anywhere in either repo. Parts 1-6 address the first. §7.7 items A and B address the second, in about 27 lines, and are the highest-leverage text in this document — the only change scored against a real observed failure rather than an injected one.

> **12. The rule must be countable or it will not survive.** "Reserve the accent for what matters" is prose and will be reinterpreted by every agent. "One accent-filled control per screen, never in a repeated element" is a number and an artifact, so an agent can audit itself, a reviewer can check it in one glance, and a grep can enforce it. Carbon, Polaris, and Material 3 all chose the countable form independently.

> **13. There is no upstream for the artifact that actually failed.** `ud-btn` is defined in `udesignpages`, not here (§7.8). The static-HTML consumption path has no governed components at all, so no rule written in `DESIGN.md` could have bound it. A composition rule fixes the reasoning; a published CSS component layer is what makes the rule apply to the thing on the page.

---

## Sources

### Repository (primary)

- `C:\Users\Kaleb\WEBDEV\udesign-design-system\AGENTS.md`
- `C:\Users\Kaleb\WEBDEV\udesign-design-system\README.md` — esp. lines 9, 50, 81, 95, 101 (stale v1.3.0 pins)
- `C:\Users\Kaleb\WEBDEV\udesign-design-system\DESIGN.md` — esp. 105-135 (profiles), 194-202 (interaction states), 259-292 (motion), 310-318 (feedback primitives), 356-369 (banned patterns)
- `C:\Users\Kaleb\WEBDEV\udesign-design-system\.cursorrules`, `.gemini\rules`, `HANDOFF.md`, `CHANGELOG.md`, `package.json`
- `C:\Users\Kaleb\WEBDEV\udesign-design-system\registry.json` — 28 items, `docs` unused on all
- `C:\Users\Kaleb\WEBDEV\udesign-design-system\public\r\core.json`
- `C:\Users\Kaleb\WEBDEV\udesign-design-system\registry\new-york\ui\` — all 27 components; esp. `button.tsx:21-24,50-53`, `pressable.tsx:87-94`, `select.tsx:18`, `table.tsx:69`, `slider.tsx:116-123`, `moment.tsx:164-195`
- `C:\Users\Kaleb\WEBDEV\udesign-design-system\tokens\udesign.tokens.json`, `tokens\functional.tokens.json`
- `C:\Users\Kaleb\WEBDEV\udesign-design-system\dist\tokens.css`, `dist\tokens-functional.css`
- `C:\Users\Kaleb\WEBDEV\udesign-design-system\scripts\lint-design.mjs`, `scripts\build.mjs:468`
- `C:\Users\Kaleb\WEBDEV\udesign-design-system\tests\motion-adoption.test.mjs` — esp. 6-14, 26-32, 41-44, 74-85
- `C:\Users\Kaleb\WEBDEV\udesign-design-system\tests\token-contract.test.mjs:168,196,214,229,241`
- `C:\Users\Kaleb\WEBDEV\udesign-design-system\tests\components\registry-components.test.tsx`
- `C:\Users\Kaleb\WEBDEV\udesign-design-system\docs\superpowers\specs\2026-07-14-dual-design-system-spec.md`
- `C:\Users\Kaleb\WEBDEV\udesign-design-system\docs\superpowers\plans\2026-07-14-dual-design-system.md`
- `C:\Users\Kaleb\WEBDEV\udesign-docs\AGENTS.md`, `README.md`, `standards\README.md`
- `C:\Users\Kaleb\WEBDEV\udesign-docs\standards\design\udesign-contract.md` — esp. 18-21, 25, 95-140, 142-204, 214-235, 249-296
- `C:\Users\Kaleb\WEBDEV\udesign-docs\standards\design\globalvision-functional-profile.md`
- `C:\Users\Kaleb\WEBDEV\udesign-docs\standards\knowledge-governance.md:59-90`
- `C:\Users\Kaleb\WEBDEV\udesign-docs\skills\interface-responsiveness\SKILL.md`, `README.md`, `references\ENFORCEMENT.md`
- `C:\Users\Kaleb\WEBDEV\CLAUDE.md`

### Probes written for this investigation (scratchpad, not in the repo)

- `scratchpad\probe-interaction.mjs` — per-component interaction-rule table (§1.6)
- `scratchpad\classify.mjs` — rule-vs-prose classifier (§3.2)
- `scratchpad\coldread.mjs` — entry-path byte/token accounting (§3.1)
- `scratchpad\sandbox\` — 8 injected violations vs. the repo's own gate (§3.4)

### External (first-party)

- Design Tokens Community Group format spec — https://www.designtokens.org/TR/drafts/format/
- shadcn registry-item schema (`docs`, `meta`, `css`, `cssVars`) — https://ui.shadcn.com/docs/registry/registry-item-json
- shadcn registry MCP server — https://ui.shadcn.com/docs/registry/mcp
- AGENTS.md specification — https://agents.md/
- Anthropic, Agent Skills (Claude Code docs) — https://code.claude.com/docs/en/skills
- Anthropic engineering, "Equipping agents for the real world with Agent Skills" — https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
- Anthropic, "Be clear and direct" / prompting best practices — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/be-clear-and-direct
- IBM Carbon motion tokens (DTCG source, exact values + `$description`) — https://raw.githubusercontent.com/carbon-design-system/carbon/main/packages/motion/src/dtcg/motion.json
- IBM Carbon motion overview (productive vs expressive) — https://carbondesignsystem.com/elements/motion/overview/
- IBM Carbon button usage (emphasis hierarchy, "only one primary button") — https://raw.githubusercontent.com/carbon-design-system/carbon-website/main/src/pages/components/button/usage.mdx
- Shopify Polaris button (primary limit; plain buttons in cards) — https://raw.githubusercontent.com/Shopify/polaris/main/polaris.shopify.com/content/components/actions/button.mdx
- Material Design 3, buttons and toolbars guidelines (single prominent action) — https://m3.material.io/components/buttons/guidelines , https://m3.material.io/components/toolbars/guidelines
- Atlassian, "Atlassian's DESIGN.md is here: what we learned testing portable design context in practice" — https://www.atlassian.com/blog/how-we-build/atlassians-design-md-is-here-what-we-learned-testing-portable-design-context-in-practice
- Atlassian, "Teaching AI to speak our design language" — https://www.atlassian.com/blog/ai-at-work/teaching-ai-to-speak-our-design-language
- Atlassian Design System llms.txt — https://atlassian.design/llms.txt
- "State of AI in Design Systems", July 2026 (20 systems, 187 affordances) — https://state-of-ai-in-design-systems.netlify.app/
- Shopify, Using Polaris with the Shopify dev MCP server — https://shopify.dev/docs/api/polaris/using-mcp
