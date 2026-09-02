# S1: Language & Boundary

**You are the segment orchestrator for S1 of the UDesign v2.0.0 operation.**
You run in a main session so you can ask Kaleb questions. You have a team of up to 2 subagents at a
time.

---

## Read these five, in order, before anything else

1. [`docs/v2/OPERATION.md`](./OPERATION.md) - the operation map, the execution model, the ledger you
   must update, and the standing rules. Note that S0 changed the map: there are six segments now,
   not five.
2. [`docs/v2/DECISIONS.md`](./DECISIONS.md) - **read this one twice.** Twenty tagged decisions and
   five derived ones. The tags are the whole point: `CANON` means cite the line and build on it,
   `APPROVED` means Kaleb said yes on a stated date and you must reproduce that tag when you cite
   it, `REJECTED` means it was put to him and declined. A statement without a tag in that file is
   not something you may treat as settled. **D-19 supersedes D-05**: read it before anything else in
   that file, and treat everything D-05 says about forking `--space-*` or `--control-height` as
   withdrawn. Only its motion lock survives.
3. [`docs/superpowers/plans/2026-08-29-v2-design-language.md`](../superpowers/plans/2026-08-29-v2-design-language.md)
   - the plan. **Phase 0 and Phase 1 are yours.** Every item carries its files, its size, its
   verification, and an honest score against P1 and P2.
4. [`docs/research/2026-08-27-design-language-transmission.md`](../research/2026-08-27-design-language-transmission.md)
   - the investigation. 1,098 lines. You do not need all of it, but you need §1.1-1.8, §2.1-2.3,
   §3.1-3.4, §5.2, §7.2-7.9. Read the plan first so you know which parts you are looking for.
5. [`docs/research/2026-08-29-v2-plan-brief.md`](../research/2026-08-29-v2-plan-brief.md) - the
   constraints, the approval protocol in §4, and the anti-goals in §7. §4 still binds you.

Two working artifacts are evidence, not instructions, and you should read the parts the plan cites:
[`_investigation-A-profiles.md`](./_investigation-A-profiles.md) (the profile intent, the corrected
token diff) and [`_investigation-B-boundary.md`](./_investigation-B-boundary.md) (the full document
inventory, the ten ranked inversions, the complete migration list). Also
[`_orchestrator-verification.md`](./_orchestrator-verification.md), which records what S0 re-ran
itself and the two research line numbers it corrected.

None of that is repeated here. This file only tells you how to *run* the segment.

---

## What S1 produces

| Artifact | Where |
|---|---|
| Phase 0, all six items | This repo, plus one line in `WEBDEV/CLAUDE.md` |
| Phase 1, items 1.1 through 1.11 | This repo and `udesign-docs` |
| The `udesign-docs` tag bump | `v0.7.0` |
| The S1.5 handoff | `docs/v2/S1.5-profile-archetype.md` |
| Updated ledger | `docs/v2/OPERATION.md` §4 |

---

## How to run this segment

### Phase 0 first, before anything else, and before you think

Six items, about two hours, listed in plan §4 Phase 0. They are correctness bugs in something
already published. None depends on any decision you will make. **Do them first so that if this
segment stalls, the repo has still stopped shipping four known defects.**

Item 0.4 is the only one that needs care: derive the `PRESSED` list instead of hardcoding it. Plan
§4 explains why the current literal array is the reason two of the three defects were never caught.

Commit Phase 0 on its own. It is a clean, independently reviewable change.

### Then investigate before you write

You know the decisions. You do not yet know the current text well enough to rewrite it. Two
subagents, run **both at once**:

**Subagent A: the migration executor.** Investigation B produced a complete migration list; the plan
cites the items that matter (M1, M2, M3, M10, D-18, and the housekeeping items M14 through M18).
This is real work with a verifiable right answer: move the files, reconcile
`MOTION-SYSTEM.md`'s six drifted values against `dist/tokens.css`, replace what moves with pointers,
add the missing front matter and index rows, delete the byte-identical duplicate. **It does not
decide anything** - the boundary rule is settled and every item is named. It reports what moved,
what it could not move and why.

**Subagent B: the ban-list merger and the channel work.** Items 1.5, 1.10 and 1.11. Merging five
ban lists into one appended superset is exactly the kind of careful enumeration a subagent is good
at and an orchestrator gets bored by. Same for the `docs` fields, the `$description` emitter, and
the em-dash purge. All mechanical, all verifiable, none of it requires guessing what UDesign wants.

**You keep 1.1, 1.2, 1.3, 1.4, 1.6, 1.7 and 1.9.** Those are the prose that carries the design
language and the brand, and they are approval-bound or judgement-bound. Do not delegate them.

While the subagents run, read `AGENTS.md`, `DESIGN.md` and `README.md` end to end yourself. You are
about to rewrite the first and restructure the other two.

### What is approval-bound, and it is narrower than you think

S0 did the grilling over six rounds. **Twenty decisions are settled and you should not reopen them.** The plan
brief §4 protocol still applies to anything *new*, but the space of new questions is small now.

Ask Kaleb only when:

- You want to write a sentence about UDesign that `DECISIONS.md` does not already authorise. Then it
  needs a citation or an approval, per plan brief §4. No exceptions, and this is the one that will
  tempt you.
- You find that an approved decision cannot be implemented as stated. Flag the conflict; do not
  quietly design around it.
- The merged ban list turns out to contain two bans that contradict each other. Investigation B
  found five lists with no stated precedence; the odds are not zero.

**Do not re-ask** the boundary rule, the profile names, the accent budget wording, the ground-truth
line, the ban numbering scheme, the visual conviction, or the voice rules. All are in
`DECISIONS.md` with their tags. Re-asking a settled question spends Kaleb's patience on work S0
already did.

### Three traps S0 hit, so you do not have to

1. **"Simplicity over minimalism" is dictated and binding** (D-11). Read your whole draft against
   that sentence before you ship it. Any prose treating emptiness or whitespace as a virtue
   contradicts an approved conviction. Density is not a fault in `operations`. This tripped the S0
   orchestrator once, in the accent wording, and it had to be re-asked.
2. **D-12 declined the UI-copy extension.** Errors saying what to do next, empty states saying what
   to do, never blaming the user, labels naming the action. All offered, all declined.
   `udesign-ground-truth.md:142-147` governs verbatim and nothing is added to it. These rules are
   conventional and good and you will want to write them. Do not.
3. **Nothing in `udesignpages` may be cited as canon** (D-04). Not the visual-conviction block, not
   `patterns.html`, not its dated plan documents. Investigation B's M11 and M12 are struck, not
   deferred. If you find yourself reaching for a well-written sentence about UDesign, check which
   repo it lives in first.

### The dependency you may not break

Plan item 1.8 states it and Investigation B proved it: **the boundary migration passes the
two-entry-point check only if 1.1 and 0.2 ship with it.** Content and routing move together, or
neither moves. A migration that relocates facts and defers the routing rewrite as "cheap text edits
for later" leaves the stack worse than it is today, because the content will have moved and no route
will have been built to where it went.

If you are running short of budget, cut items 1.10 and 1.11 before you cut 1.1.

### Verification is part of done

Every plan item names its check. The two that matter most:

- **The cold-read check for 1.1.** An agent given only `AGENTS.md` can state the accent budget and
  name the correct profile for "an internal production scheduling screen". Today it can do neither;
  `grep -i profile AGENTS.md` returns zero matches.
- **The two read paths for 1.8.** From `udesign-design-system/AGENTS.md` to the full picture in two
  hops. From `udesign-docs/AGENTS.md` in three. Trace them by actually following them, not by
  believing the diagram.

`npm test` must stay green throughout, and it should be *redder* after Phase 0 is written and green
after Phase 0 is fixed. If your three new tests pass on the unfixed tree, they do not test what you
think.

### Hand off

Write `docs/v2/S1.5-profile-archetype.md` yourself, the way this file was written for you: it points at
the plan, `DECISIONS.md` and the research, and restates none of them. Tell S1.5's orchestrator which
of its work is delegable and which is not. **Point it at D-19 before D-05**: the token fork was
superseded on 2026-09-02 and S1.5 is now a structural segment that ships the first layout primitives
the system has ever had. The one part of D-05 still binding is that motion does not fork.

Then update `OPERATION.md` §4 and stop.

---

## Done when

- [ ] Phase 0 is committed, and each of the three new tests fails on the pre-fix tree.
- [ ] `npm pack --dry-run` lists `AGENTS.md`.
- [ ] `AGENTS.md` passes the cold-read check above.
- [ ] Every sentence in the two personality bodies carries `CANON` with a file:line or `APPROVED`
      with a date. None is untagged.
- [ ] The merged ban list contains every ban from every prior list exactly once, bans 1-19 keep
      their numbers, and the four other locations hold pointers rather than restated bans.
- [ ] Both read paths traced end to end, by following them.
- [ ] `udesign-docs` is tagged `v0.7.0` and `MOTION-SYSTEM.md`'s six values match `dist/tokens.css`.
- [ ] The false density claims are deleted, not amended. Phase 2 restores true ones.
- [ ] `S1.5-profile-archetype.md` is written.
- [ ] `OPERATION.md` §4 reflects reality, including anything unfinished and the next concrete action.

---

## Guardrails

- **You are writing text and fixing four bugs. You are not building the CSS layer or the checker.**
  Those are S2 and S3 and they depend on your output.
- **Never write an unsourced claim about UDesign as though it were settled.** Tag it or ask.
- **Two subagents maximum, concurrently.** Usage limits interrupted S0 once already.
- **Update the ledger before you stop**, including when you stop because you hit a limit. Record the
  next concrete action, not a status.
- **No em-dashes.** `.cursorrules:15` bans them, D-12 makes it a brand rule rather than a style
  preference, and item 1.11 makes it enforced. Write to the rule you are about to turn on.
- **"UDesign"**, capital U capital D.
