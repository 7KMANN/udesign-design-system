# Investigation A — the two profiles: intent, survival, and the cost of closing the gap

**Segment:** S0, Subagent A
**Date:** 2026-09-01
**Assignment:** `docs/research/2026-08-29-v2-plan-brief.md` §3.2
**Prior finding under test:** `docs/research/2026-08-27-design-language-transmission.md` §1.4, §5.3
**Status:** working artifact for the orchestrator. Not a deliverable. **Kaleb decides; this costs the options.**

**Citation convention.** Every claim about UDesign's intent carries `file:line`. Anything I reasoned to rather than read is marked `[INFERRED]`. Anything I propose as new text is marked `[NEW - NEEDS APPROVAL]`.

**Read-only work performed:** file reads, `git log`, and two throwaway scripts in the session scratchpad — a DTCG leaf-token differ (`diff.mjs`) and `grep`/`awk` counts over `dist/tokens.css` and `explorations/*.html`. No repository file was modified except this one.

---

## 0. Headline

The shipped artifact **delivers the written spec almost exactly.** What is missing was never in the spec's token table — it lived in the prototypes' *composition and density*, and the architecture note written at the same moment as those prototypes explicitly said the profiles would **not** carry it:

> `explorations/index.html:106` — "Both the **Impactful Show-Off** and **Brutalist Functional** profiles **share exactly the same component structure and class names** (`bg-background`, `text-primary`, `border-border`). When switching between modes (`[data-design="functional"]`), the CSS variables dynamically adjust radii (`10px` vs `2px`), typography (`Montserrat` vs `Geist`), and contrast ratios while preserving our signature warm stone and metallic gold (`#c79f6b`) identity."

So the gap Kaleb feels is real, but it is not an implementation failure. It is a **scope failure at spec time**: the ambition was written in prose and rendered in three prototypes, and then a token-only architecture was chosen that is definitionally incapable of carrying it. The prototypes were never translated into rules; only their colors, fonts, radii and shadows were.

I also found the research report undercounted, in the profiles' favour. **`tokens/functional.tokens.json` declares 59 leaf tokens, but 24 of them restate the base value byte-for-byte. Only 35 tokens actually change anything.** Details in §2.1.

And I found one flat false claim in shipped documentation: `DESIGN.md:125` and `DESIGN.md:129` promise "generous section spacing" vs "tighter spacing", and `README.md:12` calls them "**density** profiles". There is **zero** spacing or density differentiation, and `scripts/build.mjs` structurally cannot emit one into `dist/tokens.css`. See §2.4.

---

## 1. What did the spec intend the difference to be?

### 1.1 Stated intent — the token table, and it is small

The origin spec is 80 lines. Its normative content about the difference is one table, `docs/superpowers/specs/2026-07-14-dual-design-system-spec.md:32-40`. Verbatim, the seven rows:

| Row | Brand | Functional | Spec line |
|---|---|---|---|
| Canvas `--background` | `--ud-cream` `#f4ece1` | `--ud-panel` `#f4f1ea` | :34 |
| Surface `--card` | `#ffffff` | `#ffffff` (**identical by design**) | :35 |
| Primary | `#c79f6b` | `#c79f6b` (**identical by design**) | :36 |
| Borders | `--ud-border` | `--ud-border-strong` | :37 |
| Radius | `7 / 10 / 16px` | `2 / 3 / 4px` | :38 |
| Type | `Montserrat` display + body | `Geist` display + body | :39 |
| Shadows | `1`, `2`, `3` real | `none`, `none`, `none` | :40 |

**That is the entire stated intent.** No spacing row. No control-height row. No motion row. No component-behavior row. Two of the seven rows are explicitly *no change*.

The names come from `:1`, `:17`, `:18`:

> `:1` — "# Dual Design System Specification: Impactful Show-Off vs. Brutalist Functional"
> `:17` — "**Impactful Show-Off (`[data-design="brand"]`)**: The canonical UDesign luxury/marketing presentation profile."
> `:18` — "**Brutalist Functional (`[data-design="functional"]`)**: A high-tension, geometric brutalist wireframe profile optimized for operational ERPs (`GlobalVision`), retaining UDesign's signature warm stone neutrals and high-voltage Gold (`#c79f6b`) brand accent."

### 1.2 Implied intent — the prose, which is much larger than the table

`spec:14` is the only place the *reason* is written, and it promises things the table does not deliver:

> "While ideal for public marketing presentations (`udesign-website`, `udesignpages`), this profile creates friction inside **high-density operational applications** (`globalvision`), where factory operators, DTF/embroidery schedulers, and accounting managers require **high contrast, compact wireframe grids**, technical typography (`Geist`), and **geometric brutalist clarity** ('fewer steps to achieve the goal instead of fewer tools')."

Three of those five phrases — "high-density", "compact wireframe grids", "fewer steps to achieve the goal" — are **composition and density claims**, and none of them appears anywhere in the spec's token table, the plan, the tokens, or the components. `spec:39` even routes the density ambition *through typography*: Geist is chosen because it "eliminates wide horizontal tracking for compact ERP data cells" — i.e. the spec's own answer to density is *a narrower typeface*, not a tighter spacing scale.

### 1.3 Rendered intent — the explorations, the only place it is visible

`explorations/index.html:47-48` states the register:

> "Exploring the new **Dual Design Approach** (`Impactful Show-Off` vs `Brutalist Functional`). These prototypes embody the 'Functional' profile: **tense, high-density, geometric precision, fewer steps to achieve operational goals**, while retaining UDesign's iconic warm stone and gold identity."

The three options, verbatim. All CANON, all quotable — candidate source material for the visual-conviction body (brief D5):

| Option | File | Verbatim description |
|---|---|---|
| 01 | `explorations/index.html:58-61`; `option1-brutalist-wire.html:6` | "OPTION 01 // LIGHT / WIRE" — "Geometric Brutalist Wire" — "**High-tension 1px hairline wireframe grid. Inspired by industrial telemetry and command boards.** Uses Geist + JetBrains Mono with Montserrat Black punch accents and zero drop shadows." Page title: "Geometric Brutalist Wire (High-Tension Technical ERP)" |
| 02 | `explorations/index.html:73-76` | "OPTION 02 // ZERO-STEP BENTO" — "High-Velocity Monolithic Grid" — "'**Fewer steps, not fewer tools.**' A 12-column master-detail CRM matrix where clicking a record opens an instant right-hand inspector with 1-click VoIP.ms/Quote execution right on the surface." |
| 03 | `explorations/index.html:88-91` | "OPTION 03 // DARK OBSIDIAN" — "Obsidian Command Matrix" — "An ultra-crisp dark-mode production control center for DTF and embroidery shifts. Features **glowing gold wire highlights, live telemetry feeds, and dense machine progress metrics**." |

**Option 1 is the ancestor of the shipped `functional` profile**, and the descent is documented, not inferred:
- `plan:5` — "Impactful Show-Off vs Brutalist Functional - **Geometric Wire**"
- `plan:7` — "the **Option 1** Geometric Brutalist Wire overrides (sharp `2px/3px` hairlines, Geist sans font mappings, `var(--ud-panel)` stone canvas, zero shadows)"
- `spec:29` — "### 2.2 Functional Profile Token Mapping (**Option 1 Wire Geometry**)"
- `spec:38` — radius rationale: "Geometric brutalist wire corners (`Option 1`)"
- `tokens/functional.tokens.json:3` — `$description`: "Geometric Brutalist Wire - Option 1. High-tension ERP wireframes…"

Options 2 and 3 have **no descendant in the artifact** and are never referenced again after the launcher page. Option 2's entire content is a *composition* idea ("zero-step master/detail", "fewer steps, not fewer tools") with no token content — which is exactly why a token-only architecture had nothing to take from it.

### 1.4 What Option 1 actually does that the tokens do not carry

Measured directly from `explorations/option1-brutalist-wire.html`:

| Technique | Evidence | In the shipped profile? |
|---|---|---|
| Base type 13px, tight leading | `:54` `text-[13px] leading-tight` | No — shipped functional body is `0.875rem` = 14px, leading 1.5 vs brand 1.6 |
| **Zero gutters; separation drawn with 1px borders instead of space** | `:89` `grid-cols-12 gap-0`, plus `.brutalist-border-*` at `:42-46` | **No — no spacing differentiation of any kind exists** |
| 44px chrome bar, but sub-30px inner controls (`py-1.2`) | `:57` `h-11`; `:79-83` | No — `--control-height: 44px` is global and unforked |
| **Uppercase mono utility labels everywhere** (50 `font-mono`, 8 `uppercase`, 4 `tracking-wider` in one file) | counted across the file | **No — and correctly so: explicitly banned.** `DESIGN.md:223` "Do not turn metadata, navigation, or field labels into wide-tracked uppercase mono text"; `DESIGN.md:361` "Wide-tracked uppercase utility labels"; `plan:14` "no uppercase mono labels" |
| Cold near-black greys `#0a0a0b`/`#131315`/`#26262a`, gold glow `box-shadow` | `option3:19-23`; `option3:48` `.gold-wire` | No — banned. `DESIGN.md:359` "Cool slate neutrals that break the warm UDesign foundation". Shipped functional dark is warm `#11100e` |

**This is the most important nuance in the investigation.** A large share of what "got lost" between the prototypes and the artifact was **deliberately and correctly cut, because the prototype's most distinctive visual signature violates a standing UDesign ban that predates the dual-profile work.** The brutalist look of Option 1 is carried mostly by uppercase wide-tracked mono labels and hard cold contrast. Both are banned. Strip them and what remains *is* radius, borders, shadows and a typeface — which is precisely what shipped.

Any v2 proposal that says "make functional more brutalist" has to answer that. It cannot get there by reinstating the banned techniques.

---

## 2. How much survived?

### 2.1 The corrected token diff — 35 real overrides, not 59

Method: parsed both DTCG trees, collected every node carrying `$value`, compared serialized values. Throwaway script `diff.mjs` in scratchpad.

```
base leaves:                              286
functional leaves declared:                59
functional keys absent from base:           0
  of the 59: byte-identical to base:       24   <- no-op overrides
  of the 59: actually differ:              35
```

**Categorized breakdown of all 59 declared tokens:**

| Family | Declared | **Actually differs** | No-op restatement | New key |
|---|---|---|---|---|
| `role.*` (light color roles) | 30 | **9** | 21 | 0 |
| `dark.role.*` (dark color roles) | 12 | **12** | 0 | 0 |
| `typography.*` (type scale) | 7 | **7** | 0 | 0 |
| `radius.*` | 4 | **3** | 1 (`pill`) | 0 |
| `shadow.*` | 3 | **3** | 0 | 0 |
| `font.family.*` | 3 | **1** (`display` only) | 2 (`body`, `data`) | 0 |
| **Total** | **59** | **35** | **24** | **0** |

**Families present in the base tree and absent from `functional.tokens.json` entirely (15):**
`color`, `space`, `responsive`, `motion`, `moment`, `tone`, `metric`, `data`, `entity`, `interactive`, `surface`, `dark.tone`, `dark.data`, `dark.interactive`, `dark.surface`.

So: **0 motion tokens, 0 spacing tokens, 0 control-height/touch-target tokens, 0 interaction-state color tokens, 0 tone/status tokens differ.**

The 35 real overrides split: **21 color (60%)**, **8 typography including the one font family (23%)**, **3 radius (9%)**, **3 shadow (9%)**, **0 motion, 0 density, 0 behavior.**

The 9 differing light color roles are `background`, `secondary`, `muted`, `accent`, `border`, `border-strong`, `sidebar`, `sidebar-accent`, `sidebar-border`. Everything else in `role.*` — including `primary`, `card`, `ring`, `input`, `destructive` and every foreground — is restated identically.

**Correction to research §1.4.** That table reports "Color roles 42, Font family + typography scale 10, Radius 4, Shadow 3 = 59". Arithmetically right for *declared* counts (30+12=42; 3+7=10), but it overstates the differentiation by 41%. The honest number is **35**.

### 2.2 One override the spec promised and the artifact silently dropped

`spec:39` promises `--font-body: 'Montserrat'` → `'Geist'`. But `tokens/udesign.tokens.json:369` already sets the **brand** body font to `["Geist","system-ui","sans-serif"]`, and `tokens/functional.tokens.json:43` declares the identical value. **Body typeface is Geist in both profiles.** The typeface difference the spec presents as one of its seven rows is, in the artifact, *display-face only*.

This is not implementation attrition: the base tree's body font was already Geist before the dual work began. **The spec's brand column was wrong when written.**

### 2.3 One override the plan softened before implementation

`spec:40` promises all three shadows → `none`. `plan:89` — written the same day — already specifies `shadow.3` as a real value (`0 12px 32px -8px rgba(27,27,27,0.20)`), which is what shipped. Overlays keep elevation in the functional profile.

**Deliberate cut, traceable to `plan:89`, and correct** — an overlay with no elevation is not distinguishable from the page. `DESIGN.md:365` records the surviving rule precisely: "Shadows on ordinary content cards in the functional profile" is banned, i.e. shadows 1 and 2, not 3. The spec was simply over-broad.

### 2.4 The claim that is false in shipped documentation

- `DESIGN.md:125` — "The brand profile uses Montserrat for strong display moments, **generous section spacing**, the full radius scale…"
- `DESIGN.md:129` — "The functional profile uses Geist for dense interface typography, **tighter spacing**, smaller radii, stronger boundaries…"
- `README.md:12` — "Brand and functional **density** profiles selected at runtime."
- `DESIGN.md:108` — "Operational tools need **compact controls**, clear state, and dependable **information density**."

Verified against the compiled artifact:
- `--space-*` appears on exactly **one line** of `dist/tokens.css`, inside `:root, :root[data-design="brand"]` (block opens at `dist/tokens.css:5`).
- `--touch-target-min: 44px`, `--control-height: 44px`, `--control-height-compact: 36px` sit at `dist/tokens.css:196-198`, in that same base block only.
- The functional block (opens `dist/tokens.css:205`) contains **zero** occurrences of `space-`, `control-height`, or `touch-target`.

**And it structurally cannot.** `scripts/build.mjs:289-296` emits the `/* Space */` line only under `if (emitPrimitives)`, and the responsive contract (`formatResponsive`; `RESPONSIVE_VAR` at `scripts/build.mjs:83-91`, containing `control-height` and `touch-target-min`) is likewise gated on `emitPrimitives`. The dual build passes `emitPrimitives: true` for brand (`scripts/build.mjs:429`) and **omits it for functional** (`scripts/build.mjs:431`). Density is not merely unimplemented — the emitter has no path to express it in `dist/tokens.css`.

**Latent bug found in passing.** `dist/tokens-functional.css` is built from the *merged* tree with `emitPrimitives: true` (`scripts/build.mjs:471`). So if anyone added a `space` or `responsive` key to `functional.tokens.json` today, the standalone stylesheet would honour it and the dual stylesheet would silently drop it — the same application would render at two different densities depending on which stylesheet it imported. Nothing tests for this. Worth a plan item under any option.

**Provenance of the false claim.** `git log -S "tighter spacing" -- DESIGN.md` → introduced in `f0d88e7` (2026-07-15, *"docs(showcase): demonstrate the expanded library"*). That commit touched `DESIGN.md`, `README.md`, `showcase/`, `tailwind.config.js`, `tests/e2e/` — and **no token file**. `tokens/functional.tokens.json` has exactly two commits in its whole history (`f82e647` creation, `6ed36d8` semantic expansion), neither adding spacing.

Verdict: **not a deliberate cut, and not attrition. It was documented as done without ever being started**, then carried forward through four releases unchallenged.

### 2.5 Two further attrition points

**Showcase naming.** `spec:68` specifies the toggle read `[ ✦ Brand Show-Off ]` vs `[ ⚡ Brutalist Functional ]`. The shipped toggle (`showcase/src/App.tsx:84`) renders `Brand` / `Functional`. The only surface where the evocative names would have reached a human eye was flattened to the signal-free pair.

**The showcase cannot demonstrate a profile difference beyond tokens.** `showcase/src/App.tsx:79-85` — the toggle's only effect is `setDesign(...)`, which swaps the stylesheet `href` (`App.tsx:59-61`). Every page renders byte-identical markup in both profiles. Even if composition rules existed, the showcase as built could not show them.

### 2.6 Component layer: zero differentiation, verified

`grep -rn "data-design" registry/` → **0 matches across 27 component files.** `data-design` appears in this repo only in `scripts/build.mjs` (selector strings) and `showcase/index.html:2`. No component branches on profile, anywhere, in any way.

### 2.7 The survival scorecard

| Spec promise | Source | Status | Deliberate cut or attrition? |
|---|---|---|---|
| Canvas cream → panel | `spec:34` | **Shipped** exactly | — |
| Card white in both | `spec:35` | **Shipped** (no-op) | — |
| Gold primary in both | `spec:36` | **Shipped** (no-op) | — |
| Border → border-strong | `spec:37` | **Shipped** exactly | — |
| Radius 7/10/16 → 2/3/4 | `spec:38` | **Shipped** exactly | — |
| Display face → Geist | `spec:39` | **Shipped** | — |
| **Body face Montserrat → Geist** | `spec:39` | **Never existed** — base body was already Geist (`udesign.tokens.json:369`) | Spec error at authoring time |
| Shadows 1,2,3 → none | `spec:40` | **Partially shipped** — 1 and 2 yes, 3 retained | **Deliberate**, `plan:89`, same day. Correct call. |
| Toggle "Brand Show-Off" / "Brutalist Functional" | `spec:68` | **Dropped** | Attrition (`showcase/src/App.tsx:84`) |
| Dark-theme functional palette (12 tokens) | not in spec | **Shipped** — a *gain* over spec | Added in `6ed36d8` |
| "High-density … compact wireframe grids" | `spec:14` (prose) | **Never implemented**, then **documented as implemented** (`DESIGN.md:125`, `:129`; `README.md:12`) | Neither — never scoped into the token table; the doc claim is unbacked |
| "Fewer steps, not fewer tools" / zero-step master-detail | `explorations/index.html:76` | **Never implemented** | Out of scope by construction — a composition idea, and the chosen architecture carries none |
| Motion / behavior difference | never promised anywhere | **Correctly absent** | Deliberate and enforced (`DESIGN.md:278`; `tests/token-contract.test.mjs:168`) |

**Bottom line: the spec's token table shipped at roughly 6.5 of 7 rows. The spec's prose ambition shipped at 0 of 3 phrases, and two documents claim otherwise.**

---

## 3. What would it cost to close the gap?

Common to all three options and cheap: `DESIGN.md:125`, `DESIGN.md:129` and `README.md:12` must stop claiming a density difference that does not exist — either the claim becomes true or the claim goes. ~4 strings, under an hour, prerequisite for (a) and (b) as much as it is the whole of (c).

### Option (a) — Composition-only differentiation

**Proposition:** components, motion, and all 35 token overrides stay exactly as they are. The profiles diverge in *how surfaces are assembled*: what a screen may spend, how separation is drawn, which collection form is the default. Nothing existing changes behavior; new rules are added above the component layer.

**The countable form of "spends emphasis freely" vs "austere".** Prose will not survive (research §7.9 item 12). Four axes, each checkable by a grep-class rule over rendered output or JSX:

1. **Accent budget.** Research §7.7A already fixes the global rule at "one accent-filled control per screen" and gives the counting test [CITED]. Per-profile split: **presentation may spend its one accent on the screen's subject; operations spends zero accents on chrome, toolbars, table rows and side panels, and screens with no accent at all are the norm.** Countable: accent-filled controls per viewport — presentation `≤ 1`; operations `≤ 1` **and** `0` inside any repeated block or chrome region. (Rule 2 of §7.7A already states the repeated-element half — CITED. Per-profile framing `[NEW - NEEDS APPROVAL]`.)
2. **Separation is drawn with space, or with a border, never both.** Option 1's actual measured technique: `explorations/option1-brutalist-wire.html:89` uses `grid-cols-12 gap-0` and draws every division with `.brutalist-border-*` (`:42-46`). Countable: in operations, a bordered container has gap `≤ --space-2`; in presentation, a bordered container has gap `≥ --space-4`. This delivers "tighter spacing" *at the composition layer* without forking the space scale — so `scripts/build.mjs` is untouched and the §2.4 asymmetry is never exercised. (Technique CITED; thresholds `[NEW - NEEDS APPROVAL]`.)
3. **Section rhythm.** Countable: presentation section gaps drawn from `{--space-6, --space-8}`; operations from `{--space-3, --space-4}`. The honest, enforceable version of the sentence `DESIGN.md:125`/`:129` already claims. (Claim CITED; steps `[NEW - NEEDS APPROVAL]`.)
4. **Default collection form.** Countable: operations collections default to the row/table form; presentation collections default to the card form. Composition-level restatement of `spec:14`'s "compact wireframe grids"; maps onto the existing `responsive-collection` primitive. `[NEW - NEEDS APPROVAL]`

One such rule already exists and should be surfaced as the model: `DESIGN.md:365` — "Shadows on ordinary content cards in the functional profile" — *is* a per-profile composition ban. The system has exactly one today and it works. Option (a) generalizes it.

**Mechanically, what it consists of:**

| Work item | Files | Size |
|---|---|---|
| `## Composition by profile` — the four budgets as a table | `DESIGN.md` | ~60 lines |
| Carry 6-8 lines into the entry gate | `AGENTS.md` | ~8 lines |
| Correct the false density claims | `DESIGN.md:125`,`:129`; `README.md:12`,`:72` | 4 strings |
| Two worked reference screens, one per profile, differing **only** in composition, each commenting the budget it obeys | `examples/*.tsx` ×2 (new) | ~350 lines |
| Showcase: per-profile page composition so the toggle demonstrates something | `showcase/src/pages/*.tsx`, `App.tsx` | ~250 lines |
| Checker rules: 4 counting rules over generated HTML and JSX | portable checker (D2) | ~120 lines |
| Test: composition budgets asserted against the two reference screens | `tests/composition.test.mjs` (new) | ~80 lines |
| Decision rule + pin-once rule (§5) | `DESIGN.md`, `AGENTS.md`, `README.md:72` | ~25 lines |

**Cost: 4-6 engineering-days. Files touched: ~12-15.**
Cut line: dropping the showcase item saves ~1.5 days and still leaves a coherent, enforced system — the reference screens carry the teaching load.

**Risk: low.** No token changes, no build changes, no test replaced, no consumer break. GlobalVision's pin (`udesign-contract.md:25`) stays valid unchanged. The real risk is *evaporation* — composition rules that stay prose do nothing (research §7.3 scores this layer "effectively zero" today precisely because nobody wrote it as counts). Mitigated by making all four axes counts, and by item 7 making them fail-able.

**Second risk, stated honestly:** four counting rules is a modest difference. If Kaleb's felt gap is "these should look like different products", (a) will not produce that. It produces "the same design language, deployed with different restraint" — genuinely different on a *screen*, not on a *button*.

### Option (b) — Genuinely differentiated primitives

**What actually breaks** — less than feared for density, more than feared for motion.

*Scoped to density only (space + control heights + component compactness):*

1. `scripts/build.mjs:289-296` and the `formatResponsive` call — the `emitPrimitives` gate means the override block cannot emit `--space-*` or `--control-height*` today. The emitter needs an override-diff mode (emit only overridden keys into the profile block). Non-trivial: it must not re-emit the whole scale, and it must fix the §2.4 asymmetry with `dist/tokens-functional.css` (`scripts/build.mjs:471`) or the two stylesheets diverge silently.
2. `tests/token-contract.test.mjs:129` asserts `--control-height: 44px` and `--touch-target-min: 44px` against the **whole file**, not per block. **A functional override to 36px would pass this test today.** Under (b) it must become a per-block assertion with an accessibility floor, or the touch-target contract quietly dies in one profile.
3. **`tests/token-contract.test.mjs:168` does not break.** It matches `--motion-*` names only; a density fork leaves it untouched. Worth stating plainly, because the brief frames (b) as necessarily breaking it — it is not, unless motion is in scope.
4. All 27 components need auditing for hardcoded heights/padding that would not follow a forked scale. `DESIGN.md:363` ("Tiny interactive targets hidden inside visually compact controls") becomes a live risk the moment control height forks.
5. GlobalVision pins functional at the root (`udesign-contract.md:25`). A density fork changes every control in that application at once — a production visual regression, guarded by a test that would not catch its own violation in one profile (point 2) and a Playwright suite that asserts nothing about interaction state (research §3.4).

*If (b) also forks motion or behavior:*

6. `tests/token-contract.test.mjs:168` breaks by construction, and both `DESIGN.md:278` and `DESIGN.md:370` ("Intensity that varies between the brand and functional profiles" is a **banned pattern**) must be rewritten or deleted.

**What class of bug does test:168 catch, and what weaker invariant still catches it?**

The class is named at `DESIGN.md:278`: *"The functional profile is not a quieter variant because it is 'for work,' and the brand profile is not a louder variant because it is presentational."* The bug is **an agent picking the wrong profile and getting the wrong behavior, not just the wrong surface** — a control alive in one profile and dead in the other, or a feedback floor present in one and absent in the other. Research §5.3 credits the test with killing "the worst version of the multi-brand agent-confusion problem."

The weaker replacement set, if motion must fork:

- **(i) Completeness.** Every motion token name published in one profile is published in every profile. Catches "functional dropped `--motion-press-scale`" — the actual dead-control bug. Derive names from the emitted CSS, exactly as test:168 does today, so new tokens stay covered automatically.
- **(ii) Ordering.** The duration ladder `instant < fast < standard < emphasis < slow` holds identically in every profile. Catches "functional made hover slower than a route transition."
- **(iii) Bounded divergence.** For every shared duration token, `|brand − functional| ≤ 40ms`; press scale stays in `(0.9, 1)` in both. Permits genuine tuning, forbids "one profile is a quieter variant." The existing ceiling test (`:196`) and press-range test (`:214`) already run per-file and survive unchanged.
- **(iv) Reduced-motion parity.** Both profiles collapse identically. Test `:241` needs a per-profile loop.

Honest cost of that swap: `DESIGN.md:278` today is one sentence an agent can hold in its head. Its replacement is four numeric invariants — much harder to reason from, and it re-opens exactly the ambiguity ("is functional the quiet one?") that the current design closed. `DESIGN.md:370` goes from a flat ban to a bounded permission, which is a materially weaker instruction for a weak model.

**Cost:**
- Density-only: **7-9 engineering-days**, ~25-30 files (emitter, token trees, per-block tests, 27-component audit, Playwright matrix, migration note).
- Density + motion: **11-13 engineering-days**, ~35-40 files.

**Risk: high.**

### Option (c) — Drop the overclaim

Rewrite the docs to say what is true: one design language, two surface treatments — color roles, display typeface, type scale, radius, shadow. 35 tokens. Add the decision rule and pin-once rule of §5, which are needed under every option.

**Files:** `DESIGN.md:125`, `:129`, `:133`; `README.md:12`, `:72`; `AGENTS.md`.
**Cost: 0.5 engineering-days, ~4 files. Risk: near zero.**

**What is lost:**
1. `spec:14`'s stated need — "high-density operational applications", the reason the second profile exists — has no home anywhere in the system. GlobalVision's density requirement becomes a GlobalVision problem again, which is how local drift starts (`WEBDEV/CLAUDE.md` rule 1).
2. The composition gap of research §7.3 stays fully open. (c) fixes nothing about the §7.1 incident; it only stops lying about it.
3. Kaleb's stated intent is formally closed as unachievable. If that is the right answer it should be said once, in writing, so it is not re-litigated in v3.

**(c) is a strict subset of (a).** Every doc correction in (c) is also in (a). The real decision is **(a) vs (b)**, with (c) as the cut line if neither is funded.

---

## 4. Profile naming

`brand` / `functional` fails on two counts research §5.3 names: `brand` reads to a model as "the default one", and neither name predicts anything about the treatment. A third failure this investigation adds: **`functional` names a virtue, not a job.** Nothing is *dysfunctional*, so a model has no reason to exclude any screen from it.

| # | Names | Traceable to | How an agent picks correctly from the name alone |
|---|---|---|---|
| **1** | **`presentation` / `operations`** | Both halves CANON. `DESIGN.md:125` "presentation-led screens"; `DESIGN.md:108` "**Operational** tools need compact controls…"; `DESIGN.md:129` "production, scheduling, accounting, and administration"; `spec:18` "optimized for **operational** ERPs" | **The name is the decision rule.** One question an agent can answer without design knowledge: *is this screen presented to someone, or operated by someone?* A proposal is presented. A scheduling board is operated. Neither reads as a default. Weakness: names the audience, not the look — no visual prediction. |
| **2** | **`impact` / `wire`** | Both halves CANON. `spec:1`, `:17` "**Impactful** Show-Off"; `option1-brutalist-wire.html:6` + `plan:5` + `spec:29` "Geometric Brutalist **Wire**" | **The name predicts the treatment.** "wire" → wireframe, hairline borders, no shadow, sharp corners, dense — an agent can infer four of the five real override families from the word. "impact" → display type, elevation, room to breathe. Best pair for producing correct *pixels* cold. Weakness: no help at all on *which screen gets which*; needs §5's decision rule carried alongside. |
| **3** | **`showoff` / `wire`** | Both halves CANON verbatim — `spec:1` "Show-Off"; `explorations/index.html:47` | Maximum fidelity to the origin document, and the most vivid: "showoff" transmits *deliberate display, spend the emphasis* better than any synonym. Weakness: informal in a shipped HTML attribute a client could view-source; the self-deprecating tone may not be what Kaleb wants on client-facing surfaces. |

**Recommendation: `presentation` / `operations`, with "Impactful Show-Off" and "Geometric Brutalist Wire" retained as the profiles' documented visual-conviction headers** — the attribute name answers "which one"; the spec's own quoted vocabulary answers "what does it look like". Both properties, and every word CANON.

**Migration cost.** `data-design="brand"` / `"functional"` is pinned at GlobalVision's document root (`udesign-contract.md:25`) and appears in `README.md:64-67`, `showcase/index.html:2`, `dist/tokens*.css`. v2.0.0 permits the break (brief D3), but the emitter can accept both selectors for one release at the cost of one extra string per block in `scripts/build.mjs:429-438` — cheap insurance, and it lets the docs migration land before the consumer migration. Recommend the alias.

---

## 5. Decision rule and pin-once rule

Neither exists in this repo (research §3.3, re-verified: `grep -i "profile" AGENTS.md` → **0 matches**; the entry file with the strongest agent pickup says nothing about profiles at all).

### 5.1 Decision rule — sketch

```
Pick a profile by who works the screen, not by how it should look.

- Someone outside UDesign reads it, is shown it, or is asked to decide
  something by it              -> presentation.        [CITED: DESIGN.md:125]
- Someone inside UDesign returns to it to get a job done
                               -> operations.          [CITED: DESIGN.md:129, :108]

Ambiguous cases - a client-facing order status page, an internal dashboard
you demo to clients - are decided by who REPEATS. If one person opens it
many times a day, it is operations, even when a client can also see it.
                                                       [INFERRED]

If it is still ambiguous, choose operations and ask. Operations is the
conservative default: it never spends emphasis it did not have to, so a
wrong operations call is quiet and a wrong presentation call is loud.
                                                       [INFERRED]
```

**Traceability.** The two branches restate `DESIGN.md:125` and `:129` — CANON. The **"who repeats" tiebreaker** and the **"operations is the default" rule** are both `[INFERRED - NEEDS APPROVAL]`. The second matters disproportionately: it is the direct fix for research §5.3's "`brand` reads to a model as the default one." Naming an explicit default, and making it the restrained one, is worth more than the renaming.

### 5.2 Pin-once rule — sketch

```
One profile per application. Declared once, on <html>, before first paint.

- It is a build-time attribute, exactly like data-game: not a user
  preference, not a route parameter, not component state. No setting,
  cookie, or runtime code reads or writes it.        [CITED: DESIGN.md:284]
- Never nested. A functional surface inside a brand document is not a
  supported combination.                             [CONTRADICTS DESIGN.md:133]
- Runtime switching exists for exactly one artifact: this repository's
  showcase, which is a review surface. Consuming applications ship the
  standalone stylesheet for their pinned profile.    [CONTRADICTS README.md:72]
- If a screen genuinely needs the other profile's treatment, that is a
  signal to stop and ask, not to nest.
        [CITED: udesign-docs standards/design/globalvision-functional-profile.md,
         "that is a signal to stop and ask, not to improvise a local exception"]
```

**Traceability, stated honestly.** `DESIGN.md:284` already describes `data-game` as "a build-time attribute declared once at the document root, **alongside `data-design`**" — so the repo *already asserts* that `data-design` is root-declared and build-time. The pin-once rule mostly **recovers a rule the repo states in passing and then contradicts twice**, rather than inventing one.

Both contradictions must be resolved explicitly:
- `DESIGN.md:133` — "Components must work when a profile or theme is nested inside another application surface." This affirmatively licenses nesting. Narrow it to **theme** only (dark surfaces inside light documents are legitimate; profile nesting is not).
- `README.md:72` — "Applications that switch profiles at runtime should use the combined stylesheet." Becomes: the combined stylesheet exists for review surfaces such as the showcase; applications ship the standalone stylesheet for their pinned profile.

Promoting GlobalVision's product-specific ratified decision (`udesign-contract.md:25`) to a system-wide rule is `[INFERRED - NEEDS APPROVAL]` and is exactly the kind of promotion brief §4 exists to gate. It is also the highest-leverage single line here: GlobalVision is the only consumer that has ever had to decide, it decided pin-once, and that decision is currently trapped in a product overlay no other repo will read.

---

## 6. Recommendation

**Take option (a), scoped to the four countable axes, and take the naming and the two rules with it. Do not take (b) in v2.0.0.**

1. **The stated architecture was always token-swap, and it was stated by the same author on the same day as the prototypes.** `explorations/index.html:106` says the profiles "share exactly the same component structure and class names" and adjust "radii, typography, and contrast ratios". The artifact does exactly that. There is no implementation failure to repair — there is a *scope* drawn too small in the token table and too large in the prose. (a) enlarges scope in the layer that was actually missing (composition, research §7.3) rather than reopening a layer that was decided correctly (behavior, `DESIGN.md:278`).

2. **The prototypes' brutalism is mostly banned.** §1.4: Option 1's signature is 50 `font-mono` uses, 8 `uppercase`, 4 `tracking-wider`; Option 3's is cold near-black greys and a gold glow. `DESIGN.md:223`, `:359`, `:361` and `plan:14` ban all of it, and those bans predate the dual-profile work. Chasing "more brutalist" through primitives runs into the brand's own standing prohibitions. Composition is the only direction with room in it.

3. **(b)'s cost lands on the one production consumer.** GlobalVision pins functional (`udesign-contract.md:25`); a density fork changes every control in it simultaneously, guarded by a test (`tests/token-contract.test.mjs:129`) that would not catch its own violation in one profile and a Playwright suite that asserts nothing about interaction state (research §3.4). 7-9 days to buy a regression risk the repo cannot currently detect.

4. **(b) also spends the system's best asset.** `tests/token-contract.test.mjs:168` and `DESIGN.md:278` are the most-cited, best-reasoned guarantee in the stack. The replacement set (§3(b) i-iv) is mechanically adequate and rhetorically much worse — four numeric bounds instead of one memorable sentence. Against the brief's north star ("an agent given one line should not be able to build the wrong thing"), that is a net loss.

5. **(a) is the only option that scores on both P1 and P2.** P1: the per-profile emphasis budget plus two reference screens is exactly the "worked reference screen" form research §5.2 identifies as surviving weak models. P2: four counting rules are the cheap, false-positive-free kind `ENFORCEMENT.md:5` demands, and they are the first profile-aware rules the portable checker could carry. (b) improves neither prompt — a forked space scale is invisible to both.

6. **The naming and the two rules are worth more than either option's build work, and cost under a day.** Research §3.3 measured the entire profile-decision evidence trail at two sentences. `presentation`/`operations` embeds the decision in the name; the "operations is the default" tiebreaker kills the `brand`-reads-as-default problem; pin-once recovers a rule `DESIGN.md:284` already half-states. Sequence these *first*, ahead of any build item — they are the cheap high-leverage text changes brief §6 asks to be ordered before the satisfying build.

**Suggested order (each boundary shippable):** rename + decision rule + pin-once + correct the false density claims (~1 day) → the four composition budgets in `DESIGN.md`/`AGENTS.md` (~0.5 day) → two reference screens (~2 days) → checker rules + composition test (~1.5 days) → showcase composition demo (~1.5 days, cuttable).

**The honest counter-argument to put to Kaleb:** if his felt gap is "these should look like two different products", option (a) will not deliver that, and neither will anything short of reinstating techniques the brand bans. That is a question about the bans, not about the profiles — and it is a business-identity question, his to answer, not mine.

---

## Open questions for the grilling round

1. Is "genuinely different" a claim about **screens** (composition — option a) or about **controls** (primitives — option b)? The answer changes the cost by a factor of two and the risk by more.
2. Are the uppercase-mono-label and cold-neutral bans (`DESIGN.md:223`, `:359`, `:361`) absolute, or absolute *in the presentation profile only*? Relaxing them for operations is the single cheapest way to make the two profiles look genuinely different, it is traceable to Option 1's actual measured technique, and it is a business-identity decision only Kaleb can make.
3. Naming: `presentation`/`operations` (decision-rule-in-the-name) or `impact`/`wire` (treatment-in-the-name)? Both fully CANON.
4. Promote GlobalVision's pin-once decision (`udesign-contract.md:25`) to a system-wide rule, accepting that it contradicts `DESIGN.md:133` and `README.md:72`?

## Sources

**Primary, this repo:** `docs/superpowers/specs/2026-07-14-dual-design-system-spec.md`; `docs/superpowers/plans/2026-07-14-dual-design-system.md`; `explorations/index.html`, `option1-brutalist-wire.html`, `option2-velocity-grid.html`, `option3-obsidian-command.html`; `tokens/udesign.tokens.json`; `tokens/functional.tokens.json`; `dist/tokens.css`; `scripts/build.mjs`; `tests/token-contract.test.mjs`; `DESIGN.md`; `README.md`; `AGENTS.md`; `registry/new-york/ui/` (27 files); `showcase/src/App.tsx`, `showcase/src/pages/KitchenSink.tsx`; `git log`.

**Primary, `udesign-docs`:** `standards/design/udesign-contract.md`; `standards/design/globalvision-functional-profile.md`.

**Prior research:** `docs/research/2026-08-27-design-language-transmission.md` §1.4, §3.3, §3.4, §5.2, §5.3, §7.3, §7.7, §7.9.

**Throwaway probes (scratchpad, not committed):** `diff.mjs` (DTCG leaf differ); `grep`/`awk` counts over `dist/tokens.css` and `explorations/*.html`.
