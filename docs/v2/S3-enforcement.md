# S3: Enforcement

**You are the segment orchestrator for S3 of the UDesign v2.0.0 operation.** You run in a main
session so you can ask Kaleb questions and show him things. Up to 2 subagents at a time, and that is
a hard limit: usage limits interrupted S0 once and S1 twice.

This segment ships **the portable checker**: a Node `bin` in this package, run with `npx`, that turns
P2 ("fix all drifted stuff") into a violation report instead of an agent's opinion.

**It runs before S2 (D-26), and that changes what it is for.** The checker becomes **S2's acceptance
test**: S2's own verification (plan Phase 3) is "a generated catalog page built from the shipped
classes passes the Phase 4 checker with zero findings". Build it so S2 can run it on day one.

---

## Read these, in order, before anything else

1. [`OPERATION.md`](./OPERATION.md): §2 (execution model, the skill fleet, resumption protocol), §5
   (standing rules), and the **S1.5 ledger in §4**, which says what S1.5 left for you.
2. [`DECISIONS.md`](./DECISIONS.md): **D-26** (why S3 now), **Δ-07** (checker rules 8 and 9),
   **D-20** (the shells), rounds 10 and 11 (**D-27, D-28, Δ-10 to Δ-13**). D-02, D-08, D-09 and D-13
   are the rules your first checks enforce.
3. [The plan](../superpowers/plans/2026-08-29-v2-design-language.md) **Phase 4**: the nine rules in
   priority order, the governing principle, and the verification. Then §8 risk 3.
4. [`docs/checker-rules.md`](../checker-rules.md): the seed specification S1 moved here (R1 onward).
   Its governing principle is `ENFORCEMENT.md` line 5 in `udesign-docs@v0.9.0`: a cheap rule with no
   false positives beats a clever rule that needs judgement.
5. [`DESIGN.md`](../../DESIGN.md) "Banned design patterns". **Every finding names a ban number or an
   `AGENTS.md` rule** (`AGENTS.md` "Auditing"). Bans 1-26 came from S1; **ban 27** (a screen outside
   its profile's shell) is S1.5's and is new to you.

Start by invoking `superpowers:executing-plans`.

---

## What S1.5 did that changes your starting point

- **The shells exist in React only.** `PageCanvas` and `AppShell` are registry components
  (`registry/new-york/ui/page-canvas.tsx`, `app-shell.tsx`). Their **CSS classes are S2's**
  (D-20's accepted cost). So ban 27 is checkable in React source today (`data-design="operations"`
  with no `AppShell`), but for static HTML **you name the classes and S2 adopts them**, the same
  way plan 3.2 fixes `.ud-btn`. That naming call is yours; record it in `DECISIONS.md`.
- **Static-HTML rules target the existing `.ud-btn` family** in `udesignpages` output, unchanged.
  Do not wait for S2 to write them.
- **Two findings from S1.5 are countable rule candidates.** Weigh each against the fewer-rules
  principle before adding it; neither is required:
  - `shadow-[var(...)]` in consumer source (Δ-13): Tailwind 3 compiles it as a shadow colour, so
    the elevation silently never renders. Zero false positives in a Tailwind 3 consumer.
  - A class assembled at runtime (Δ-07 rule 9) was the GlobalVision case; Δ-13 is the same family of
    "Tailwind renders nothing and no lint sees it".
- **Rendering proved things tests could not.** S1.5's cut-line harness renders shipped registry
  source to static HTML and frames each screen as its own document. It lives on branch
  `v2/s1.5-prototype`, `explorations/s1.5-cut-line-2/`. Reuse it if you need a rendered page to run
  the checker against.

## The skills this segment needs

| When | Invoke | Why here |
|---|---|---|
| Every rule | `superpowers:test-driven-development` | Each rule is a detector: a fixture that must flag and one that must pass, red first. |
| The three-catalog proof | none; it is the verification | Plan Phase 4: flag `019e34a7` and pass the other two. It is a controlled experiment that already happened. |
| Before claiming done | `superpowers:verification-before-completion`, then `ponytail:ponytail-review` | §8 risk 3: a checker that cries wolf gets switched off. Expect the review to cut rules. |

## What you may delegate, and what you may not

**Delegable:** a rule whose spec is fixed, with its two fixtures; the `bin` plumbing; running the
checker over the catalogs and reporting findings.

**Not delegable:** which rules ship, the static-HTML class names for the shells, anything that
decides whether a finding is real, and the S2 handoff.

## Carried over

- `udesign-docs@v0.9.0` links this repo at `v2.0.0`, which does not exist until S4 (D-24, MN-11).
- The showcase and Playwright specs still use `brand` / `functional`; they resolve through the aliases.
  The showcase does not demonstrate the shells; S4's reference screens will.
- Line endings: `core.autocrlf=true` and no `.gitattributes` (`docs/TOOLING-PITFALLS.md` §1).
  Scripted edits that rewrite a file can flip it to LF; compare content, not bytes.

## Done when

- [ ] The checker ships as a `bin`, runs with `npx`, and every rule ran red on a fixture first.
- [ ] Run against the three real catalogs it flags `019e34a7` and passes the other two.
- [ ] Every finding names a ban number or an `AGENTS.md` rule, plus file and line.
- [ ] `npm test` is green.
- [ ] The **S2** handoff is written (`S2-css-layer.md`), pointing and not restating. Tell S2 the
      checker is its acceptance test and which shell class names it must adopt.
- [ ] `OPERATION.md` §4 has your ledger, including anything unfinished and the next concrete action.

## Guardrails

- **Fewer rules.** Plan §8 risk 3. When in doubt, ship the rule later.
- **Do not fix consumers** (standing rule 7). A finding in GlobalVision or `udesignpages` is evidence.
- **No em-dashes.** The lint scans every instruction file and all component source.
- **"UDesign"**, capital U capital D. The accent is **the accent**, never a colour name.
