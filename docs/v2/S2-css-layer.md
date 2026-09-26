# S2: CSS Component Layer

**You are the segment orchestrator for S2 of the UDesign v2.0.0 operation.** You run in a main
session so you can ask Kaleb questions and show him things. Up to 2 subagents at a time, and that is
a hard limit: usage limits interrupted S0 once and S1 twice.

This segment ships **governed component classes for static HTML**, in lockstep with the React
registry, so a zero-dependency generator like `udesignpages` gets real components instead of
inventing them.

**The checker already exists, and it is your acceptance test** (D-26). Plan Phase 3's verification is
"a generated catalog page built from the shipped classes passes the Phase 4 checker with zero
findings". Run it from day one, not at the end.

---

## Read these, in order, before anything else

1. [`OPERATION.md`](./OPERATION.md): §2 (execution model, the skill fleet, resumption protocol), §5
   (standing rules), and the **S3 ledger in §4**.
2. [`DECISIONS.md`](./DECISIONS.md): **D-20** (the shells ship as CSS classes too, and why that is the
   one argued exception to the scope warning), **D-26**, **D-27** and **D-28** (the values), and round
   13: **D-29**, **Δ-14** (the shell class names you implement), **Δ-15**, **Δ-16**.
3. [The plan](../superpowers/plans/2026-08-29-v2-design-language.md) **Phase 3** (3.1 to 3.4), then
   §8 risk 2. Scope inflation is this segment's named risk.
4. [`docs/checker-rules.md`](../checker-rules.md): what the checker flags and what it deliberately does
   not. Your classes must produce pages it passes.
5. [`DESIGN.md`](../../DESIGN.md) "Emphasis and hierarchy", "Components", "Banned design patterns".
   Every class you ship obeys the bans it can reach: a press state (ban 16), `:focus-visible`
   (`AGENTS.md` rule 2), `--motion-*` roles (ban 19), no `--ud-*` (ban 1).

Start by invoking `superpowers:executing-plans`.

---

## What S3 did that changes your starting point

- **Run the checker:** `node bin/udesign-check.mjs <paths>` here, `npx udesign-check` in a consumer.
  Exit 1 means findings. Proof it works on real input: the three catalogs report zero accent-budget
  findings and `tests/fixtures/catalog-divergent.html` is flagged (Δ-10 (fixture)).
- **What your acceptance page fails on today.** Each catalog page carries about five ban 19 findings,
  all from its inline `.ud-btn` and card CSS (`transition: ... 100ms ease`). Those rules are exactly
  what your layer replaces. A page built from the shipped classes with its inline `<style>` removed
  should report zero. **Commit that page as a fixture and add it to `tests/checker.test.mjs` as a
  zero-findings case**, so the acceptance test stays run after you leave.
- **The shell class names are decided: Δ-14.** Implement those names exactly. The `shell` rule reads
  `ud-app-shell` from class attributes, and the accent rule reads `ud-btn-primary`. If S2 renames or
  adds a class a rule depends on, change `bin/rules.mjs` and its test in the same commit: D-26 named
  that cost in advance.
- **The checker scans your own stylesheet too.** `node bin/udesign-check.mjs <your css>` flags raw
  motion there. A file with the compiled tokens header is exempt from the `--ud-*` rule only.
- **Findings in consumers are evidence, not work** (standing rule 7, D-25). `udesignpages/public`
  reports 441 ban 19, 146 ban 1 and 3 ban 27 findings today; GlobalVision reports one ban 26 (an
  accent `Button` in every card of `components/section-page.tsx`), twelve `div-onclick`, and one ban
  27. Record what S2 changes for them as migration notes.
- **The showcase carries four ban 19 findings** (`showcase/src/index.css:210`, `:508`, `:1034-1035`).
  S4 owns the showcase; leave them unless your work touches that file.

## The skills this segment needs

| When | Invoke | Why here |
|---|---|---|
| Before spawning subagents | `superpowers:dispatching-parallel-agents` | S2 is the most parallelizable segment. Two meaty agents, not six. |
| Every class with a press or focus treatment | `interface-responsiveness` | The canonical statement of the feedback rules the classes must carry. |
| Every lockstep assertion (3.3) | `superpowers:test-driven-development` | Each parity test runs red on a stylesheet missing the rule first. |
| Before claiming done | `superpowers:verification-before-completion`, then `ponytail:ponytail-review` | Risk 2: expect the review to cut components nobody asked for. |

## What you may delegate, and what you may not

**Delegable:** a component class whose spec is fixed (3.1's evidenced list, 3.2's names); the 3.3
parity tests; building and checking the acceptance page.

**Not delegable:** which components get a class (argue each against 3.1's evidence standard), the
distribution decision in 3.4, anything that decides whether a checker finding is real, and the S4
handoff.

## Carried over

- `udesign-docs@v0.9.0` links this repo at `v2.0.0`, which does not exist until S4 (D-24, MN-11).
- **Kaleb said the bans will grow**, to keep AI-looking UI out (D-29). A new ban needs his approval.
  When one is countable, it gets a checker rule, test-first, in whichever segment it lands.
- Two decisions share the ID Δ-10; cite them as "Δ-10 (radius)" and "Δ-10 (fixture)" (Δ-16).
- Line endings: `core.autocrlf=true` and no `.gitattributes` (`docs/TOOLING-PITFALLS.md` §1).
  Scripted edits that rewrite a file can flip it to LF; compare content, not bytes.

## Done when

- [ ] The classes plan 3.1 evidences, plus the two shells (Δ-14 names), ship in the stylesheet.
      Every component skipped is named with its reason.
- [ ] 3.3's parity tests ran red first and are green: press implies `:focus-visible`, every
      transition names a `--motion-*` duration, no raw hex, no `--ud-*`, and the name-parity list.
- [ ] A generated catalog page built from the shipped classes reports **zero** findings from
      `udesign-check`, and it is committed as a fixture in `tests/checker.test.mjs`.
- [ ] 3.4's distribution path is chosen and written down.
- [ ] `npm test` is green; `npm run validate` exits 0.
- [ ] The **S4** handoff is written (`S4-reference-release.md`), pointing and not restating.
- [ ] `OPERATION.md` §4 has your ledger, including anything unfinished and the next concrete action.

## Guardrails

- **Mirror what a generator reaches for, not the registry.** 27 components is the wrong answer and
  the tempting one (plan 3.1, risk 2).
- **Do not fix consumers** (standing rule 7).
- **No em-dashes.** The lint scans every instruction file and all component source.
- **"UDesign"**, capital U capital D. The accent is **the accent**, never a colour name; the checker
  now flags an identifier that says otherwise.
