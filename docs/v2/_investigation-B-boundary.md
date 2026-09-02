# Investigation B — the boundary between the design system package and the org docs repo

**Working artifact for the S0 orchestrator. Not a deliverable. Findings only; Kaleb decides.**

Date: 2026-09-01
Scope read: `udesign-docs` @ working tree (tags v0.1.0-v0.6.0), `udesign-design-system` @ v1.5.0 (`75c9271`),
`udesignpages` @ working tree, `globalvision` @ working tree, `WEBDEV/CLAUDE.md`.
Writes performed: this file only. Nothing in `udesign-docs`, `udesignpages`, or `globalvision` was modified.

Citation convention: `file:line`. Any claim without one is marked `[INFERRED]`.

---

## 0. Executive answer

The boundary is not currently drawn anywhere. What exists is **five overlapping ban lists, three
competing statements of the type system, two intensity scales that contradict each other, and one
design-language document living inside a consumer's `public/` folder.** The org's own rule
(`udesign-docs/standards/knowledge-governance.md`, `WEBDEV/CLAUDE.md` rule 1) says one home per fact;
by my count **17 design-system-relevant facts have two or more homes**, and **6 of those have their
authority pointing at a document that does not contain the fact.**

The rule I propose in §4 is a **version-dependence** test, not a topic test. Topic tests fail here
because "motion" and "accessibility" and "buttons" legitimately have halves on both sides.

---

## 1. The inventory

### 1.1 `udesign-docs`

Repo tree walked in full (63 non-`.git` files). Rows below cover every file carrying
design-system-relevant fact; `platform/*`, `reference/vendor/*`, and
`business/udesign-selection-system/*` carry none and are listed once at the end for completeness.

| Document / section | What fact it owns | Duplicated where? | Authority points to | Content actually sits |
|---|---|---|---|---|
| `AGENTS.md` (whole, 101 ln) | Repo ownership model, 4-value status vocabulary, overlay-linking convention, immutable-tag link rule (`AGENTS.md:76-93`) | Link rule partly restated in `globalvision/AGENTS.md:60` | Itself (repo index) | Here. **Mentions `udesign-design-system` zero times; mentions `skills/` zero times.** Confirms research §2.1. |
| `AGENTS.md:95-101` "Adding a document here" | Every new doc needs 5-field front matter + a section README row + a MIGRATION-MANIFEST row | — | Itself | Here — **and violated by `skills/`**, which has none of the three (see §2, row I7) |
| `README.md:25-74` repo tree | The canonical file listing | `MIGRATION-MANIFEST.md` | Itself | Here |
| `README.md:83-88` "Related" | The **only** prose pointer from this repo to `udesign-design-system` | — | — | Here, at the very bottom of the file |
| `MIGRATION-MANIFEST.md` (254 ln) | Provenance: source path + commit SHA per document | — | Itself | Here. **No rows for `skills/`** (grep: 0 hits for "skills") |
| `MIGRATION-MANIFEST.md:204-207` | Records that the contract names design system **v1.3.1** while GlobalVision's `package.json` pinned v1.3.1 at migration time | — | — | Here. **Now stale**: contract still says v1.3.1 (`udesign-contract.md:18`), GlobalVision pins v1.5.0 (`globalvision/package.json:113`) |
| `standards/README.md` (27 ln) | Index of the 5 standards | — | Itself | Here. **Does not list `skills/`** — confirms research §2.1 |
| `standards/knowledge-governance.md:16-33` "The rule" | The three conditions under which ratified knowledge may be edited | Restated as an inline banner in `business/udesign-ground-truth.md:11-17` and `domains/production-glossary.md:11-15` (both correctly *link* rather than restate) | Itself | Here — clean |
| `standards/knowledge-governance.md:59-90` "Durable knowledge" | The where-does-a-fact-live table (5 rows) | Restated in `WEBDEV/CLAUDE.md` rule 2 | Itself | Here. **The table has no row for a design-system artifact fact** — the gap this whole investigation fills |
| `standards/versioning.md` (394 ln) | SemVer + Conventional Commits | Design system restates SemVer locally at `udesign-design-system/README.md:242-256` | Itself, `applies_to: org-wide` | Here — but the document is titled **"GlobalVision Versioning & Commit Standard"** (`versioning.md:16`) and its §1 machinery (`next.config.ts`, `lib/version.ts`) is GlobalVision-only. The design system does not follow it and is not named in it. |
| `standards/design/udesign-contract.md:23-30` "Ratified decisions" | GlobalVision's functional pin; `components/ui` swap; brand-branch removal | `standards/design/globalvision-functional-profile.md:21-35`; `globalvision/AGENTS.md:22` | — | Here **and** in the overlay that exists to hold exactly this |
| `udesign-contract.md:31-35` "three-layer rule system" | Semantic-only; registry-before-custom; mechanical verification | `globalvision/AGENTS.md:23,24,28` | — | Here |
| `udesign-contract.md:37-93` "Token vocabulary" | The complete allowed role set: core, tone, metric, data, entity, surface, interactive, responsive | `udesign-design-system/DESIGN.md:137-251`; `udesign-design-system/README.md:114-183`; `globalvision/AGENTS.md:23` | `udesign-contract.md:18-19`: *"Source of truth: `udesign-design-system` v1.3.1 ... upstream wins"* | Here, **pinned to v1.3.1 while consumers install v1.5.0**. Three full copies of the role vocabulary exist. |
| `udesign-contract.md:95-140` "Feedback" | 100ms floor; four-layer table; ordering rule; 5-row response-time budget; INP p75 <=200ms; required-reading binding | `skills/interface-responsiveness/SKILL.md:10,34-99`; partly `globalvision/AGENTS.md:27` | Same line 19 ("upstream wins") | **Here only.** `DESIGN.md` has no counterpart — the inversion of research §2.2, confirmed |
| `udesign-contract.md:142-188` "Motion" | Roles-not-numbers; two-axes; intensity 0/1/2, **"Intensity 3 does not exist"**; profile-identical motion | `udesign-design-system/DESIGN.md:259-280`; `skills/interface-responsiveness/references/MOTION-SYSTEM.md:1-83`; `globalvision/docs/adr/0002` | `udesign-contract.md:147-148`: *"Exact names are owned by `udesign-design-system`"* — a correct pointer | Here, correctly scoped to roles. **But contradicted by `skills/gamified-product-experience/SKILL.md:96`** which publishes "Level 3: rare major achievement" |
| `udesign-contract.md:190-204` `data-game` | Build-time attribute, declared once, not a user preference | `udesign-design-system/DESIGN.md:282-284`; `globalvision/docs/adr/0001` | — | Here and there, near-verbatim |
| `udesign-contract.md:206-212` "Typography (functional profile)" | Geist for body; **Montserrat ONLY in lockup + rare display**; JetBrains Mono for data; sentence case | `udesign-design-system/DESIGN.md:219-225`; `.cursorrules:22-25`; **contradicted by `udesignpages/public/design-system/README.md:33`** | — | Three homes, one contradiction |
| `udesign-contract.md:214-234` "Banned patterns" | 19 numbered bans | `udesign-design-system/DESIGN.md:356-369` (12, unnumbered); `.cursorrules:9-15` (5); `udesignpages/public/design-system/README.md:45-51` (5); `udesignpages/docs/superpowers/plans/2026-07-11-...:18` (4) | — | **Five ban lists, three repos** |
| `udesign-contract.md:236-243` "Accessibility contract" | WCAG 2.2 AA numbers, keyboard, dialogs, forms, tables | `udesign-design-system/DESIGN.md:204-217`; `standards/design/mobile-accessibility.md:87-94` (correctly defers) | — | Two full copies |
| `udesign-contract.md:245-247` "Escape hatch" | `design-ok: <reason>` grammar | `skills/interface-responsiveness/references/ENFORCEMENT.md:69-81`; `globalvision/AGENTS.md:26` | — | Two normative homes |
| `udesign-contract.md:249-317` enforcement layers, browser checklist, verification commands | GlobalVision's lint rule IDs, its Playwright job, its `e2e/helpers.ts` names, its `docs/impl/briefs/B-18.md` | — | — | **Here — and this is GlobalVision implementation detail sitting in an org-wide standard.** ~70 lines naming GlobalVision files |
| `standards/design/globalvision-functional-profile.md` (60 ln) | GlobalVision's profile pin + what it verifies | `udesign-contract.md:25`; `globalvision/AGENTS.md:22` | `udesign-contract.md` | Here — the one clean overlay in the stack, and it is the model the boundary should copy |
| `standards/design/mobile-accessibility.md:27-52` "Core principles" | Usable-not-visible; layout switching; density adaptation; 44px; `svh` | `udesign-contract.md:88-93`; `udesign-design-system/DESIGN.md:227-251`; `globalvision/AGENTS.md:25` | Line 13-17: defers token names + WCAG numbers to the contract | Split correctly in intent, **but the 44px number is restated at `mobile-accessibility.md:46-48` after the doc says it will not restate it** |
| `mobile-accessibility.md:54-72` "Reduced motion" | Motion never the only indicator; closure survives motion removal | `udesign-design-system/DESIGN.md:280`; `skills/interface-responsiveness/SKILL.md:145-146`; `udesign-contract.md:130-132` | — | Four homes |
| `mobile-accessibility.md:74-85` "Specific patterns" | Navigation, maps, forms at mobile | — | — | **Here only** — genuinely unduplicated |
| `skills/interface-responsiveness/SKILL.md` (196 ln) | The one rule; the four layers; response-time budget; native-first ladder; 14-item never-ship list | `udesign-contract.md:95-140` (partial); `README.md:36-44` (core principle) | `SKILL.md:188-196` "Stack binding" points at `udesign-contract.md` and at `udesign-design-system` | Here. **Best artifact in the stack** (research §2.3) |
| `skills/.../references/MOTION-SYSTEM.md` (136 ln) | "What a design system **must publish**": 5 duration roles + values, 5 easing roles + curves, 2 press-scale roles + values, 6 required primitives, 7 contract tests | `udesign-design-system/DESIGN.md:259-280` + `dist/tokens.css:179-193` | Line 3: it is a spec *of* a design system | **This is a spec of `udesign-design-system` living in `udesign-docs`, and it has already drifted — see §2 row I1** |
| `skills/.../references/ENFORCEMENT.md:9-66` R1-R7 | Seven lint rules with false-positive analysis; `ENFORCEMENT.md:5` governing principle | Partially realized in `globalvision`'s `lint:design`; `udesign-contract.md:253-282` | — | Here. **This is the specification for D2's portable checker** |
| `ENFORCEMENT.md:84-95` gate placement | Where each rule runs; the **adoption floor** | Realized as `udesign-design-system/tests/motion-adoption.test.mjs` | — | Here; implemented there |
| `ENFORCEMENT.md:97-109` browser checks | 7 e2e assertions | `udesign-contract.md:297-307` (GlobalVision's version) | — | Two homes |
| `ENFORCEMENT.md:113-125` review questions | 7 questions for any interactive diff | — | — | Here only |
| `ENFORCEMENT.md:129-137` agent-facing routing | *"The root instruction file routes UI work to this skill by name"* | — | — | Here. **Followed in `udesign-docs`? No. Followed in `globalvision/AGENTS.md:14`? Yes. Followed in `udesign-design-system`? Zero mentions repo-wide** |
| `skills/.../references/FEEDBACK-CONTRACT.md` (121 ln) | The four layers in full + accessibility mapping | `SKILL.md:34-85`; `udesign-contract.md:102-115` | — | Three homes, three depths |
| `skills/.../references/PATTERNS.md` (144 ln) | Per-control specs (10 controls) + manual checklist | Manual checklist partly at `udesign-contract.md:297-307` | — | Here |
| `skills/.../references/ANTIPATTERNS.md` (185 ln) | 5 categories of machine-written-UI failure with fixes | Overlaps the ban lists | — | Here only, in this form |
| `skills/.../references/PLATFORM-RECIPES.md` (287 ln) | Next 16.3.1 / React 19.2.8 / Tailwind 4.1.13 recipes | — | Line 7 pins the verified versions | Here only. **Version-dependent on the framework, not on the design system** |
| `skills/.../references/RESEARCH.md` (85 ln) | Sources for INP, perception thresholds, the Doherty correction (`RESEARCH.md:27`) | — | — | Here only |
| `skills/gamified-product-experience/SKILL.md:89-98` | Intensity scale **0-3**, "Level 3: rare major achievement" | — | — | Here. **Directly contradicts `udesign-contract.md:155`, `DESIGN.md:276`, `globalvision/docs/adr/0002:41-44`** |
| `skills/gamified-product-experience/SKILL.md:100-106` | Implement within the native design system; reuse project tokens | `interface-responsiveness/SKILL.md:126-128` | — | Two homes |
| `skills/gamified-product-experience/REPORT.md` | **Byte-identical duplicate of `references/PLAYBOOK.md`** (md5 `0d02e3ec…`, 1317 ln each) | Itself | — | Two copies of the same 1317-line file in one folder |
| `business/udesign-ground-truth.md:134-155` "Brand tone & positioning" | Core differentiator, price position, tone, brand name, the "Never" list, review-proof rules | `udesign-website/docs/seo/SEO_GROUND_TRUTH.md:79-85` (declared as the fuller original, `business/README.md:19`) | Front matter `product_overlays` names the website doc as the fuller original | **Here — the CANON source for all voice work.** See §3 |
| `business/udesign-ground-truth.md:144-147` "Never" | The refusal list: corporate jargon, AI clichés incl. em-dashes, false claims | `.cursorrules:15` (em-dash only); `udesign-contract.md:229` (banned pattern 14, em-dash only); `udesignpages/public/design-system/README.md:47` (em-dash only) | — | The em-dash ban has **four homes**; the rest of the list has one |
| `business/udesign-ground-truth.md:26-42, 43-55, 56-100, 102-132, 157-167` | NAP, markets, services, billing, public/confidential | `udesign-website` SEO docs | — | Here — no design-system relevance, listed for completeness of the walk |
| `domains/production-glossary.md` (90 ln) | DTF/embroidery/Intelligometer vocabulary | `globalvision/docs/tools/production-calculator.md` owns the rules built on it | Front matter names the split | Here — clean, and **the model for a vocabulary/rules split** |
| `platform/*` (8 files), `reference/vendor/*`, `business/udesign-selection-system/*` (6 files) | Platform ops, vendor snapshots, sourcing methodology | — | — | **No design-system-relevant fact.** Walked and cleared. |

### 1.2 `udesign-design-system` (this repo)

| Document / section | What fact it owns | Duplicated where? | Authority points to | Content actually sits |
|---|---|---|---|---|
| `AGENTS.md` (81 ln) | CRLF/`autocrlf` release bug; downstream Git-tag reinstall gotcha | — | Line 8: "For style and token rules, read DESIGN.md and README" | Here. **Zero design-language content** (research §1.1). **Not in `package.json:9-19` `files`** — invisible to an npm consumer |
| `README.md:1-19` | What ships; "not a bundled React runtime" | — | — | Here. Header says **"What ships in 1.3.0"** while `package.json:3` says `1.5.0` |
| `README.md:20-31` "Rules for contributors and agents" | 8 rules: read DESIGN.md, semantic-only, no hardcoded colors, sentence case, no hand-editing generated output, run the pipeline, verify both profiles | `.cursorrules:19-26`; `udesign-contract.md:33` | — | Here |
| `README.md:43-102` install snippets | Git tag pin + registry URLs | `HANDOFF.md:8-9` | — | Here — **four snippets pin `v1.3.0`** (`README.md:50,81,95,101`) against `package.json:3` = 1.5.0. Research verdict item 2, still live |
| `README.md:114-183` semantic consumption | Full role vocabulary with examples | `DESIGN.md:137-251`; `udesign-contract.md:37-93` | — | Third copy |
| `README.md:242-256` versioning | SemVer definition + release commands | `udesign-docs/standards/versioning.md:25-35` | — | Two homes; the docs one claims `applies_to: org-wide` |
| `DESIGN.md:1-100` YAML front matter | 10 raw hex colors, 4 typography ramps, radius/spacing scales, **7 component specs** (`button-primary/secondary/outline`, `header-lockup`, `status-badge`, `confidential-footer`, `card`) with exact padding/radius/border | The 7 component specs are **implemented by hand** in `udesignpages/public/design-system/patterns.html:38-67` | — | Here as data. **Nothing compiles the `components:` block to CSS** — this is the missing CSS component layer's existing spec |
| `DESIGN.md:103-135` Purpose + profile matrix | Two visual jobs; four combinations; brand/functional descriptions; theme behavior | `udesign-contract.md:206-212` (typography half) | — | Here. **11 pure-flavour statements** (research §3.2); no profile decision rule; `DESIGN.md:133` licenses nesting profiles |
| `DESIGN.md:137-192` semantic color system | The role families and their meanings | `README.md:114-183`; `udesign-contract.md:37-93` | — | Three homes |
| `DESIGN.md:194-202` interaction states | Roles + focus 2px rule + pressed immediacy | `udesign-contract.md:84-86` | — | Two homes |
| `DESIGN.md:204-217` contrast/accessibility | WCAG 2.2 AA numbers | `udesign-contract.md:236-243` | — | Two homes |
| `DESIGN.md:219-225` typography | Montserrat/Geist/JetBrains scoping | `udesign-contract.md:206-212`; `.cursorrules:22-25` | — | Three homes |
| `DESIGN.md:227-251` layout/responsive | 7 responsive roles + narrow-width behaviors + 375px | `README.md:171-183`; `udesign-contract.md:88-93`; `mobile-accessibility.md:27-52` | — | **Four homes** |
| `DESIGN.md:253-257` elevation | Flat functional content; shadows for overlays only | `udesign-contract.md:82`; `.cursorrules:26` | — | Three homes |
| `DESIGN.md:259-280` Motion | The 6-role duration table with **exact ms**, 5 easings, delay/loop/press tokens, the open-vocabulary/capped-magnitude argument, profile-identical guarantee, reduced-motion behavior | `udesign-contract.md:142-188` (roles, no numbers — correct); `MOTION-SYSTEM.md:9-53` (numbers, **drifted**) | `udesign-contract.md:147-148` correctly cedes the names here | Here — **and this is the one place the boundary is currently drawn correctly** |
| `DESIGN.md:282-284` `data-game` | Build-time, inert without the attribute | `udesign-contract.md:190-204`; `globalvision/docs/adr/0001` | — | Two homes |
| `DESIGN.md:286-292` motion primitives | progress-ring, rolling-consistency-chip, moment | `registry.json` descriptions | — | Two homes (prose + registry data) |
| `DESIGN.md:294-318` Components + feedback primitives | Prose restating the YAML `components:` block; the three feedback primitives; `DESIGN.md:318` the press-state sentence | `DESIGN.md:1-100`; `registry.json` | `DESIGN.md:312` refers to *"the contract's Feedback section"* — **a forward reference to `udesign-docs` that this repo never links** | Here |
| `DESIGN.md:320-338` registry components | The component inventory + the 7 registry requirements | `README.md:104-112`; `registry.json` | — | Three homes |
| `DESIGN.md:340-354` showcase acceptance | 9 things the showcase must demonstrate | — | — | Here only |
| `DESIGN.md:356-369` banned patterns | 12 unnumbered bans | `udesign-contract.md:214-234` (19 numbered); `.cursorrules:9-15` | — | See §2 row I4 |
| `.cursorrules` (57 ln) | 5 style bans; 3 coding practices; the 6-step verification pipeline | `.gemini/rules` (near-verbatim; diff = 4 hunks); `README.md:20-31`; `DESIGN.md:356-369` | Line 5 points at `AGENTS.md` | Here. **`.cursorrules:3` says the rules bind "this project (or downstream repositories)", then `:11` tells them to use `--ud-cream`/`--ud-panel`/`--ud-ink`** — primitives that `udesign-contract.md:216` bans in downstream app code |
| `.gemini/rules` (42 ln) | Same, minus the release/showcase steps | `.cursorrules` | Line 5 points at `../AGENTS.md` | Duplicate |
| `HANDOFF.md` (17 ln) | The copy-paste consumer prompt | `README.md:43-59` | Tells the agent to read `README.md` + `DESIGN.md` in `node_modules` | Here. **Its install line has no tag** (`HANDOFF.md:9`), contradicting `README.md:45` "Do not install from a moving branch" |
| `registry.json` (28 items) | Per-item `title` + `description`; `registryDependencies`; file lists | `DESIGN.md:320-326` | — | Here. **`docs` field: 0 of 28 items populated.** `categories`: 0 of 28. Research §1.7 confirmed |
| `registry/new-york/ui/*.tsx` (27 files) | The strongest design-language channel: rationale in comments, copied verbatim into consumers by shadcn (research §1.2). e.g. `button.tsx:21-24`, `button.tsx:51-52` | — | — | Here. **The only channel that transmits without a prompt** |
| `dist/tokens.css` | The compiled artifact: 5 selector blocks + reduced-motion block + **7 typography utility classes only** (`:555-570`) | `udesignpages/public/design-system/udesign-tokens.css` (a **manual copy**, `public/design-system/README.md:3`) | — | Here; copied there |
| `tokens/udesign.tokens.json`, `tokens/functional.tokens.json` | DTCG source; the 59-token functional override set | Copied into `udesignpages/public/design-system/` | `README.md:221-222` names them source of truth | Here |
| `tests/token-contract.test.mjs:165-166` | **The only reference to `udesign-docs` in the entire repo** — a comment | — | — | Here |
| `tests/motion-adoption.test.mjs` | The adoption floor from `ENFORCEMENT.md:93` | — | — | Implemented here, specified there |
| `CHANGELOG.md`, `history/*`, `public/r/*`, `dist-showcase/`, `test-results/` | Release output | — | — | Generated |
| `explorations/*.html` (4), `docs/superpowers/specs/*` (4), `docs/superpowers/plans/*` (3) | The profile design intent ("Impactful Show-Off", "Brutalist Functional") | — | — | Here. **Subagent A's territory** — flagged only because `explorations/` is not in `package.json` `files` and reaches no consumer |

### 1.3 Routing canon — `WEBDEV/CLAUDE.md`

| Section | What it owns | Problem found |
|---|---|---|
| Canon table | Routes design/versioning/governance to `udesign-docs/standards/` | Correct |
| Canon table | *"`udesign-docs` is tagged (`v0.1.0`…`v0.4.0`)"* | **Stale.** `git tag` in `udesign-docs` returns v0.1.0, v0.1.1, v0.2.0, v0.3.0, v0.4.0, v0.5.0, **v0.6.0** |
| Per-project table | `udesign-design-system/` → `AGENTS.md`, `DESIGN.md`; "v1.5.0. GlobalVision pins it by Git tag." | Correct, and it is the **only** routing canon that names both design entry points |
| Rule 1 | "a business, design, or platform fact has exactly one home" | The binding rule this investigation applies |
| Rule 2 | Durable knowledge in a repository | Points at `knowledge-governance.md` |

### 1.4 Consumer: `udesignpages` (static-HTML generator path)

| Artifact | What it owns | Upstream? |
|---|---|---|
| `agents.md` (121 ln) | Scraper architecture; Selection System rules | **Mentions the design system zero times.** An agent landing here is never routed to it |
| `CONTEXT.md` | Selection System vocabulary | Correctly defers to `udesign-docs` canon (`CONTEXT.md:5-7`) |
| `public/design-system/README.md` (55 ln) | **A second design-language document.** "The DNA" (`:16-23`), Color (`:25-29`), Type (`:31-35`), Buttons (`:37-39`), Layout (`:41-43`), "Banned (reads as AI-generated)" (`:45-51`), "Do not source from" Icitte (`:53-55`) | Declares itself a "synced copy" of the tokens (`:3`) — but **only the four token files are synced; every prose section above is original and has no upstream** |
| `public/design-system/patterns.html` (67 ln) | `.ud-btn` / `.ud-btn-primary/secondary/outline`, `.ud-header`/`.ud-lock`, `.ud-badge`, `.ud-footer`/`.ud-conf` | **No upstream** (research §7.8 confirmed). It is a hand implementation of `DESIGN.md:60-100`'s `components:` block — `padding:11px 20px` (`patterns.html:40`) = `DESIGN.md:66`; `font-size:11.5px;padding:5px 11px` (`:54-55`) = `DESIGN.md:88-90`; `padding:28px 24px` (`:64`) = `DESIGN.md:95` |
| `public/design-system/udesign-tokens.css` | Manual copy of `dist/tokens.css`, dated 2026-08-20 | Sync is manual and undated in-file |
| `scrapers/hpgbrands/generate_catalog.py:213-262` | A **second, divergent** `.ud-btn` implementation | No upstream. Has `:active{transform:scale(0.98)}` (`:232`) which `patterns.html` lacks entirely |
| `scrapers/hpgbrands/generate_catalog.py:29-33` | Redeclares `--radius-sm:7px; --radius:10px; --radius-lg:16px` at `:root` | These are the **brand-profile** values from `dist/tokens.css:163-165`; hardcoding them pins the page to brand radii and would silently defeat any profile switch |
| `scrapers/hpgbrands/generate_catalog.py` (14 sites) | `transition: … 100ms ease` literals | Violates `udesign-contract.md:234` banned pattern 19 and `ENFORCEMENT.md:13-21` R1 |
| `docs/superpowers/plans/2026-07-11-udesign-design-system-rollout.md:11-21` | Global constraints: French chrome; **"the UDesign accent, never 'gold'"** (`:15`); client's logo only (`:16`); mandatory confidential footer (`:19`); a 4-item ban list (`:18`) | **No upstream. Design-language facts living in a dated plan document** — the worst possible home, since a plan is a historical record |

**What a static-HTML generator actually needs to be governed** (the consumption model, stated
concretely):

1. **A stylesheet it can `<link>`**, containing component classes, not only custom properties. Today
   it gets 524 lines of custom properties and 7 typography classes (`dist/tokens.css:555-561`).
2. **A class API it can string-concatenate in Python.** No JSX, no build step, no npm — the
   generators are `str.format` templates.
3. **A press/hover/focus treatment that arrives with the class**, because a generator author will not
   hand-write `:active` for every control (and, empirically, `patterns.html` did not).
4. **Duration/easing baked into the class**, because the generator has no lint and every timing it
   writes today is a literal.
5. **A profile declaration convention** — currently no generated page sets `data-design` at all, so
   every catalog silently renders brand.
6. **A checker that reads generated HTML**, not TSX. `ENFORCEMENT.md`'s R1/R4/R5 are lexical and
   would port; R2/R6/R7 are React-specific and would not.

### 1.5 Consumer: `globalvision` (React path)

| Artifact | Finding |
|---|---|
| `package.json:113` | `"udesign-design-system": "github:7KMANN/udesign-design-system#v1.5.0"` |
| `components.json:23` | `"@udesign": "…/v1.5.0/public/r/{name}.json"` |
| `app/globals.css:2` | `@import "udesign-design-system/dist/tokens.css"` |
| `app/globals.css:44-58` | Maps Tailwind's default transition duration/easing onto `--motion-duration-fast`/`--motion-easing-standard` so ~40 un-suffixed transitions inherit the tokens. **Exemplary consumption** |
| `app/globals.css:82-94` | Re-declares **only** the three font-family roles, with a stated reason (next/font mints hashed names). Nothing else is locally re-declared |
| `AGENTS.md:3,5` | Routes to `udesign-docs@v0.4.0`; states an explicit authority order |
| `AGENTS.md:11` | UI work → `udesign-contract.md@v0.4.0`. **Not to `DESIGN.md`.** A GlobalVision agent never reads the design system's own prose |
| `AGENTS.md:14` | Interactive change → `interface-responsiveness/SKILL.md@v0.4.0` **every time**. The single place in the stack where `ENFORCEMENT.md:133`'s routing instruction was actually followed |
| `AGENTS.md:18-28` | "Design iron rules" — 7 locally-restated design facts, explicitly framed as "a terse checklist, not the contract" |
| `AGENTS.md:60` | A repin policy: an older tag is stale only if the file differs between tags |
| `scripts/check-docs-refs.mjs:266-288` | **A mechanical check that `AGENTS.md`'s design-system version string matches `package.json`'s pin.** The only automated cross-repo pin check in the stack |
| `docs/adr/0002-motion-and-intensity-tokens-belong-in-the-design-system.md` | **The existing boundary precedent, decided by Kaleb.** `:35-36` "The design system owns motion. Three things ship in `udesign-design-system` before GlobalVision consumes any of them"; `:55-57` "Domain-flavored patterns stay in the consuming application"; `:69-73` records that the shared contract had to be updated in the same wave |
| `docs/adr/0001`, `0004`, `0007` | `data-game` pin; closure-over-accumulation; no route view transition — consumer-local decisions, correctly placed |

**What a React consumer needs:** the tokens stylesheet, the registry source (owned after install),
the role vocabulary, the feedback floor, motion tokens, and a lint it can point at its own paths.
GlobalVision has all six and re-declares almost nothing. **The React path is not the problem.**

---

## 2. The duplication and inversion list

Ranked by damage to **P1** ("use the design system" produces acceptable UI) and **P2** ("fix all
drifted stuff" finds real violations without inventing rules).

### Tier 1 — breaks P1 and P2 outright

**I1. `MOTION-SYSTEM.md` is a spec of this package, lives in `udesign-docs`, and has drifted from the
artifact it specifies.**
*Authority:* `MOTION-SYSTEM.md:3` — *"What a design system must publish"*, and `:5` — *"If the intent
it needs does not exist, that is a design-system change, proposed upstream."*
*Content:* exact values, in the docs repo. Verified drift against `dist/tokens.css`:

| `MOTION-SYSTEM.md` says | `dist/tokens.css` ships | Line refs |
|---|---|---|
| `scale-control` ~0.97, `scale-surface` ~0.99 | `--motion-press-scale: 0.97`, `--motion-press-scale-subtle: 0.995` | `:41-44` vs `:192-193` |
| easing `standard` = `cubic-bezier(0.2, 0, 0, 1)` | `cubic-bezier(0.4, 0, 0.2, 1)` | `:29` vs `:185` |
| easing `enter` = `cubic-bezier(0, 0, 0, 1)` | `cubic-bezier(0, 0, 0.2, 1)` | `:30` vs `:187` |
| easing `exit` = `cubic-bezier(0.3, 0, 1, 1)` | `cubic-bezier(0.4, 0, 1, 1)` | `:31` vs `:188` |
| easing `linear` published | **not published** (`grep -c motion-easing-linear dist/tokens.css` = 0) | `:33` |
| reduced-motion zeroes `--motion-press-scale-control/-surface` | zeroes `--motion-press-scale`/`-subtle` | `:68-70` vs `:546-547` |
| duration set is five (`instant/fast/standard/slow/ambient`) | six — `emphasis: 280ms` also ships | `:15-21` vs `:179-184` |

**Damage:** P2 fatal. An agent told to "fix all drifted stuff" against `MOTION-SYSTEM.md` would grep
for `--motion-press-scale-control` and `--motion-easing-linear`, find nothing, and either invent them
or report the design system as non-compliant with its own contract. Six false findings from one
document. This is the exact failure mode `knowledge-governance.md:80-85` warns about.

**I2. `udesign-contract.md`'s Token vocabulary is pinned to v1.3.1 while every consumer installs
v1.5.0.**
`udesign-contract.md:18` — *"Source of truth: `udesign-design-system` v1.3.1 for every token family
below except Motion."* `globalvision/package.json:113` pins `#v1.5.0`. Two minor releases of token
additions (v1.4.0 motion, v1.5.0 feedback floor) are outside the declared scope of the document
GlobalVision's `AGENTS.md:11` makes authoritative for UI work.
**Damage:** P1. An agent following the contract's "complete allowed set" (`:37`) will treat
`--motion-*`, `--motion-delay-indicator`, `--motion-loop-spin`, `--motion-press-scale*` as
unsanctioned, because the section that lists the "complete" set predates them.

**I3. The known inversion (research §2.2), restated precisely.**
`udesign-contract.md:19` — *"If this file and upstream `DESIGN.md` ever disagree, upstream wins and
this file must be corrected."* But `udesign-contract.md:95-140` (100ms floor, four layers, ordering
rule, response-time budget, INP target) has **no counterpart in `DESIGN.md`**, and `DESIGN.md:312`
points *forward* to "the contract's Feedback section" — a document this repo links zero times
(grep: 1 hit repo-wide, a test comment at `tests/token-contract.test.mjs:165`).
**My correction to §2.2:** the contract is not simply "richer than its source." It holds **two kinds
of fact and is misfiled on both.** Its version-dependent half (`:37-93`, the role vocabulary) is a
downstream copy of the package and is stale. Its version-independent half (`:95-140`, the feedback
model) is original, correct, and falsely declares itself downstream. The fix is not to move the whole
document either way; it is to split it.
**Damage:** P1 and P2 both. An agent starting in the design system never reaches the feedback floor;
an agent starting in the docs applies a stale token list.

**I4. `ud-btn` has no upstream, and there are now two divergent implementations of it.**
Confirmed research §7.8 and extended. `patterns.html:38-49` and
`scrapers/hpgbrands/generate_catalog.py:213-262` both define `.ud-btn`; only the generator has an
`:active` treatment (`:231-233`). The `patterns.html` version — the one labelled
*"COPY these blocks into each client page"* (`patterns.html:2`) — **has no press state at all**,
violating `udesign-contract.md:231` banned pattern 16 and `DESIGN.md:318`.
It also uses `var(--ud-accent-wash)` and `var(--ud-panel-2)` (`:42,46`) — primitives banned by
`udesign-contract.md:216` — and `#fff` literals (`:44,48`) — banned by `:218`.
**Damage:** P1 fatal for the static path. The canonical copy-source teaches the violation.

### Tier 2 — breaks P2, or makes P1 unreliable

**I5. Two contradictory intensity scales inside `udesign-docs`.**
`skills/gamified-product-experience/SKILL.md:96` — *"Level 3: rare major achievement."*
`standards/design/udesign-contract.md:155` — *"Intensity scale: 0, 1, 2. Intensity 3 does not exist."*
`DESIGN.md:276` — *"Intensity 3 does not exist and is not reachable through any combination of
published tokens."* `globalvision/docs/adr/0002:41-44` agrees with the contract.
The skill's own `interface-responsiveness/README.md:42-44` orders the two skills but does not
reconcile the scales.
**Damage:** P2. An agent that loads the gamification skill has explicit written permission to build
the exact thing `DESIGN.md:367` bans.

**I6. Five ban lists across three repos, with no stated precedence.**

| List | Items | Home |
|---|---:|---|
| `udesign-contract.md:214-234` | 19, numbered | docs |
| `DESIGN.md:356-369` | 12, unnumbered | design system |
| `.cursorrules:9-15` | 5 | design system |
| `udesignpages/public/design-system/README.md:45-51` | 5 | consumer |
| `udesignpages/docs/superpowers/plans/2026-07-11-…:18` | 4 | consumer plan doc |

Only the first is numbered, so only the first is citable in a review. Bans 15-19 (the feedback rules)
exist **only** in the docs list; `DESIGN.md` has none of them.
**Damage:** P2. "Fix all drifted stuff" produces a different answer depending on which list the agent
found first, and no list is labelled as the superset.

**I7. `skills/` is unmanaged under this repo's own governance.**
`udesign-docs/AGENTS.md:95-101` requires every document here to carry the five-field front matter, to
be listed in its section README, and to have a `MIGRATION-MANIFEST.md` row. `skills/` has **none of
the three**: no `owner`/`status`/`reviewed_on` on any of its 16 files, no row in
`standards/README.md`, zero "skills" hits in `MIGRATION-MANIFEST.md`. The only pointer to it in the
whole repo is two lines inside an ASCII tree (`README.md:51-52`).
**Damage:** P2 and governance. The best artifact in the stack has no owner of record, no review date,
and no index entry — which is why `MOTION-SYSTEM.md` could drift for two releases unnoticed (I1).

**I8. `.cursorrules` tells downstream repos to use banned primitives.**
`.cursorrules:3` binds "this project (or downstream repositories)"; `.cursorrules:11` instructs
*"warm stone tones (e.g., UDesign cream `--ud-cream`, warm stone `--ud-panel`, ink text `--ud-ink`)"*.
`udesign-contract.md:216` banned pattern 1 bans `var(--ud-*)` in `app/`, `components/`, `lib/`;
`README.md:25` says the same. A Cursor agent in a consuming repo gets the ban and the instruction to
violate it from the same vendor.
**Damage:** P1 for Cursor users specifically.

**I9. The docs repo's design authority contains ~70 lines of GlobalVision implementation detail.**
`udesign-contract.md:249-317` names GlobalVision's lint rule IDs, its `e2e/helpers.ts` helper names,
its `.github/workflows/ci.yml` job, its `@blocknote/*` dependency, and `docs/impl/briefs/B-18.md`.
`AGENTS.md:51-53` forbids exactly this: *"An organization-owned document ... must not copy its route
map or local implementation detail."*
**Damage:** P1 for any second consumer. `udesignpages` reading this standard is told to run
`npm run lint:design` and `npm run test:browser`, neither of which exists there.

**I10. The design system's four install snippets pin `v1.3.0`.**
`README.md:50,81,95,101` vs `package.json:3` = `1.5.0`. Research verdict item 2; **still unfixed at
`75c9271`**. Also `README.md:9` "What ships in 1.3.0". `HANDOFF.md:9` pins **no tag at all**,
contradicting `README.md:45`.
**Damage:** P1 fatal for a fresh consumer — it installs the release that predates press states,
motion tokens, `pending`, spinner, skeleton, and pressable.

### Tier 3 — noise, drift risk, low immediate damage

**I11.** `udesignpages/public/design-system/README.md:33` — *"Montserrat for everything: display,
headings, UI, body"* — contradicts `udesign-contract.md:209` (*"Montserrat appears ONLY in the
UDesign header lockup and rare display moments"*) and `DESIGN.md:221`. The consumer's rule is
internally coherent for brand-profile client pages; it is simply un-reconciled with the standard.

**I12.** `REPORT.md` is a byte-identical duplicate of `references/PLAYBOOK.md` in
`skills/gamified-product-experience/` (md5 `0d02e3ec6e7ac096f4e8bef438376a88`, 1317 lines each).

**I13.** The responsive contract has **four homes**: `DESIGN.md:227-251`, `README.md:171-183`,
`udesign-contract.md:88-93`, `mobile-accessibility.md:27-52`. The 44px number is restated in
`mobile-accessibility.md:46-48` immediately after `:13-17` promises not to restate it.

**I14.** SemVer is defined twice: `udesign-docs/standards/versioning.md:25-35` (`applies_to:
org-wide`, titled "GlobalVision Versioning & Commit Standard") and
`udesign-design-system/README.md:242-256`.

**I15.** `WEBDEV/CLAUDE.md` states `udesign-docs` is tagged `v0.1.0`…`v0.4.0`; actual latest is
`v0.6.0`. The routing canon's own version fact is stale.

**I16.** `registry.json`: `docs` field populated on 0 of 28 items; `categories` on 0 of 28. Two
unused transmission channels (research §1.7), one of which (`docs`) is the only per-component channel
`shadcn add` surfaces to a user.

**I17.** `udesign-design-system/AGENTS.md` is not in `package.json:9-19` `files`. Any agent-facing
entry document added there in v2.0.0 is invisible to an npm consumer unless `files` changes. This is a
hard constraint on the transmission fix, not an opinion.

---

## 3. Verbatim brand-voice extraction (the CANON source)

Every line below is quoted verbatim with `file:line`. Per the brief's §4 approval protocol, a v2.0.0
claim carrying one of these citations needs **no approval**; a claim without one needs approval.

### 3.1 `udesign-docs/business/udesign-ground-truth.md` — §5 "Brand tone & positioning"

> `:136-138` — **"Core differentiator:** any local shop can do embroidery, but UDesign does the research to source the right, comfortable, high-quality garment for each team so employees actually enjoy wearing the clothes."

> `:139-141` — **"Price position:** UDesign does not position itself as the cheapest option. It prioritizes getting the garment, decoration method, and finished result right."

> `:142` — **"Tone:** premium, honest, direct, transparent - results over promises."

> `:143` — **"Brand name:** always "UDesign" (avoid overusing "nous" in French copy)."

> `:144-147` — **"Never:** corporate jargon in customer-facing copy ("B2B", "MOQ", "digitizing raster matrix"), AI clichés/AI-sounding phrasing (including em-dashes `—`), or false claims (same-day turnaround, free digitizing on a 1-piece order, price matching)."

> `:148-152` — **"Review proof:** public review messaging may summarize anonymous recurring themes such as attentive service, adaptation to customer needs, garment and decoration quality, embroidery precision, professionalism, and responsiveness. Do not publish reviewer names, verbatim review text, or review photos without separate permission. Do not turn isolated review statements into guarantees."

> `:153-155` — **"Review count and rating:** visible UI may display current values returned by a live Google source. Do not hardcode them or emit self-serving aggregate rating markup."

Adjacent, from §1, bearing on visual identity:

> `:32` — "**Facility type:** production shop with client consultation desk (appointment only); no exterior permanent signage"

> `:112-114` — "UDesign has completed work across all five priority sectors. Public copy may describe those sector needs, but must not invent or identify clients without permission."

> `:116-117` — "Target audience is organizations/companies, not individual B2C retail shoppers (unless they call directly)."

> `:131-132` — "Public product prices may come only from the future UDesign Stock clothing catalog. Do not invent example packages, starting prices, or typical budgets."

> `:90-92` — "**Capacity positioning** - do not publish a universal maximum quantity. UDesign assesses each challenge, gives an honest feasibility answer, and helps find a qualified provider when UDesign cannot complete it."

> `:87-89` — "**Durability and care evidence** - public claims follow manufacturer guidance. UDesign does not currently perform durability testing. UDesign Labs is in development."

### 3.2 Upstream original — `udesign-website/docs/seo/SEO_GROUND_TRUTH.md` §5

Confirms the distillation is faithful, and carries **one refusal the distillation dropped**:

> `:85` — "**Forbidden Copy Elements:** no corporate jargon in customer-facing copy (the terms "B2B" and "MOQ" themselves, not just spelled-out corporate concepts); no em dashes or AI-clichéd phrasing; no false claims (same-day turnaround, free digitizing on a single-piece order, price matching, **"fastest in town"**)."

("fastest in town" appears in the original and not in `udesign-ground-truth.md:146-147`. Flag for
Kaleb: restore it, or confirm the drop was deliberate.)

### 3.3 Visual conviction — sourced, but **not** in a canon repo

These are the only written statements of *visual* intent and refusal in the stack. They are real,
they are sourced, and they live where nothing governs them. **They should be treated as CANON-pending
rather than CANON: they carry a file:line, but the file is a consumer's `public/` folder and a dated
plan document.** Recommend Kaleb ratify them into a canon home rather than an agent re-deriving them.

From `udesignpages/public/design-system/README.md`:

> `:2` — "One visual language for every UDesign page, presentation, and livrable."

> `:18` — "Pulled from real UDesign sources, not invented:"

> `:20` — "**Impact**: Montserrat 900 display, from `udesign-website`."

> `:21` — "**Structure**: functional token roles + warm-stone neutrals + crisp solid buttons, from `globalvision` light mode."

> `:22` — "**Accent**: `#c79f6b`, the shared UDesign accent (both repos already agree on it). Call it *the accent*, never "gold"."

> `:23` — "**Adaptive**: one `--client` variable takes each client's brand color. Everything else stays fixed. Pages use the client's logo only."

> `:28` — "Neutrals are **warm stone** (`#f4f1ea`, `#e4ded0`, `#8a8172`). Never cold slate."

> `:35` — "Labels are quiet Title case. Never uppercase, never wide letter-spacing, never mono."

> `:39` — "Solid and direct. Primary = solid accent + ink text, hover to accent-deep."

> `:43` — "Cream frame (`--background`) → white studio cards (`--card`). Client header lockup, `Document Confidentiel` footer in restrained brick red."

> `:45-51` — "## Banned (reads as AI-generated) / - The em-dash `—` in copy. / - Glassmorphism headers, `backdrop-filter` chrome. / - Cold Tailwind slate: `#f8fafc` / `#0f172a` / `#64748b` / `#e2e8f0`. / - Mono ALL-CAPS wide-tracked eyebrow labels. / - Generic Inter + slate + gradient combos."

> `:55` — "`udesign-website/design.md` documents the **Icitte** streetwear line, a deliberate departure from this brand. Ignore it when building UDesign work."

From `udesignpages/docs/superpowers/plans/2026-07-11-udesign-design-system-rollout.md`:

> `:5` — "Apply one UDesign visual language across every page in `udesignpages`, removing AI-generated styling (slate palette, glassmorphism, em-dashes, mono eyebrow labels) and reinforcing the brand."

> `:13` — "Language: **French** for all UDesign chrome and copy."

> `:15` — "Accent is `#c79f6b` ("the UDesign accent", never "gold"). Adaptive per-page accent via `:root{--client:…}`; everything else fixed."

> `:16` — "Pages use the **client's logo only**; UDesign header lockup + client name, nothing more of the client's identity."

> `:19` — "Mandatory confidential footer (French) on every client page."

From `udesign-design-system/README.md`:

> `:5` — "Do not source brand values from Icitte. It is a separate product line with its own identity."

From `udesign-design-system/DESIGN.md` — the closest thing to a stated visual conviction inside the
package (and, per research §3.2, all of it non-checkable prose):

> `:107-108` — "Public and presentation surfaces need recognizable brand impact. / Operational tools need compact controls, clear state, and dependable information density."

> `:125` — "Its signature is the contrast between a quiet warm field and a compact geometric UDesign lockup."

> `:318` — "Every interactive primitive here has a pressed state - a control that changes nothing on press is the single most common failure in machine-written UI."

> `:276` — "**The duration vocabulary is open; the reaction magnitude is capped.** These are two axes."

**Not found anywhere, despite an explicit search:** any rule about photography, imagery,
illustration, or stock assets. `grep -rn -i "stock photo|photography|illustration|imagery"` across
all three repos returns only `udesign-contract.md:218` (product imagery as a color-literal exception)
and three hits inside the gamification skill's generic pattern catalogue. **The brief's example
"UDesign never uses stock photography" has no real equivalent.** The nearest real refusals are
`udesign-ground-truth.md:144-147` (voice) and the five ban lists (visual). `[INFERRED]` — nothing
authorizes a photography rule; do not write one without approval.

---

## 4. The proposed boundary rule

### 4.1 The rule

> **A fact belongs to `udesign-design-system` if a reader must know which version of the design
> system is installed in order to apply it correctly; otherwise it belongs to `udesign-docs`.**

Corollary (already the org's own convention, `udesign-docs/AGENTS.md:76-87`): the losing side keeps a
**pointer plus a one-line statement of applicability** — never a restated rule paragraph. Cross-repo
pointers carry an immutable tag; in-repo pointers are relative and carry none.

Second corollary: **enforcement location is not ownership.** The package may test a docs-owned fact
(it already tests WCAG contrast, a W3C-owned number, in `tests/contrast.test.mjs`) without claiming
the fact.

### 4.2 Why version-dependence and not topic

A topic rule ("motion belongs to the design system", "accessibility belongs to the docs") fails
because every one of the big topics has halves on both sides — which is precisely how the current
state was produced. Version-dependence cuts across topics and produces a single question an outsider
can answer without knowing the history: *if I upgrade from v1.5.0 to v2.0.0, does this sentence need
re-checking?* If yes, it must live where the version is cut.

### 4.3 The tension, argued

The docs repo is org-wide and tagged (v0.1.0…v0.6.0); the design system is a versioned package
(v1.5.0). **The two tag streams move for different reasons.** A docs tag moves when a human changes
editorial policy; a design-system tag moves when an artifact changes. When a fact whose correctness
depends on the artifact lives in the docs repo, it acquires **two version numbers governing one
fact**, and the cross-repo link necessarily carries the wrong one.

This is not hypothetical. `udesign-contract.md:18` carries "v1.3.1"; GlobalVision installs v1.5.0
(`package.json:113`); the contract's "complete allowed set" (`:37`) therefore excludes the entire
motion family. And `MOTION-SYSTEM.md` — a spec of the package, sitting in the docs repo — has drifted
on **six** measurable points (§2, I1). Both failures are the same failure, and the version-dependence
rule is the only rule tested here that predicts both.

Running it the other way is equally instructive: the 100ms feedback floor *feels* like a design-system
fact, but it is sourced to human perception research (`RESEARCH.md:17-27`) and is true for a product
that never installs the package. It survives a v2.0.0 that renames every token. It belongs in the
docs — and its current home (`udesign-contract.md:97`) is right. What is wrong is only the authority
line above it (`:19`) and the fact that the package never links to it.

### 4.4 The five required tests

| Fact | Answer | Why |
|---|---|---|
| **"The accent color is scarce — use it once per screen."** | **Design system** | Applying it requires knowing which published role is "the accent" and which components fill it. If v2 adds a second accent role or changes which variants are accent-filled, the count changes. It is also **countable** (research §7.9 item 12), so it is exactly the kind of rule D2's checker can enforce — and a checker ships from the package. Its *motivation* (restraint, `ground-truth.md:142` "results over promises") is version-independent and may be cited from the docs; the **number** is the package's. |
| **"UDesign never uses stock photography."** (real equivalent: `ground-truth.md:144-147` "Never: corporate jargon … AI clichés … false claims") | **Docs** — `business/udesign-ground-truth.md`, where it already is | True in v1.0 and true in v9.0. It constrains what UDesign says, not what the package ships. **Note the discriminating power:** the neighbouring list at `udesignpages/public/design-system/README.md:45-51` splits under this rule — "the em-dash in copy" goes to docs (voice), while "glassmorphism", "cold Tailwind slate", and "mono ALL-CAPS wide-tracked labels" go to the design system, because each names an artifact-level treatment whose replacement is a published role. A rule that splits a real list correctly is a rule that discriminates. |
| **"Buttons have a 150ms press transition."** | **Design system** | The number *is* the release (`dist/tokens.css:180`). Uncontroversial, and the current state already gets this right (`udesign-contract.md:147-148` explicitly cedes the names upstream). |
| **"The DTF minimum order is X."** | **Docs** — `business/udesign-ground-truth.md:56-72` | No design system is involved. Uncontroversial. |
| **`interface-responsiveness` as a whole** | **Split.** SKILL.md, FEEDBACK-CONTRACT, PATTERNS, ANTIPATTERNS, PLATFORM-RECIPES, RESEARCH → **docs**. MOTION-SYSTEM.md and ENFORCEMENT.md §1 → **design system.** | See §7 for the full argument and cost. The test that decides it: applying `SKILL.md:10` ("visible change within 100ms") requires no version knowledge; applying `MOTION-SYSTEM.md:41-44` (`scale-control ~0.97`) requires knowing exactly what the package publishes — and it currently gets it wrong. |

### 4.5 The hard cases, and where they fall

| Hard case | Falls to | Reasoning |
|---|---|---|
| The 100ms feedback floor (`udesign-contract.md:97`) | **Docs** | Sourced to perception research; survives any release. The package **routes** to it and **tests** its own primitives against it. |
| The four feedback layers + ordering rule | **Docs** | Version-independent model. But "which primitives satisfy Layer 1" (`DESIGN.md:310-318`) is version-dependent → design system. |
| Intensity cap 0/1/2, "3 does not exist" | **Design system** | `DESIGN.md:276` states the cap as *"not reachable through any combination of published tokens"* — applying it requires knowing what is published. The docs keep a pointer; the gamification skill must **delete** its Level 3 (`SKILL.md:96`) rather than restate a competing scale. |
| Profile pin rule ("one profile per document, declared once, never nested") | **Design system** | Names attributes the package publishes. Currently exists only as a GlobalVision-scoped ratification (`udesign-contract.md:25`) and nowhere as a general rule (research §3.3). GlobalVision's *choice* of `functional` stays in its overlay. |
| WCAG 2.2 AA ratios | **Docs** | W3C's numbers, not UDesign's. The package tests them (`tests/contrast.test.mjs`) — enforcement, not ownership. |
| 44px touch target | **Both, split** | The *principle* ("usable one-handed at 375px", `mobile-accessibility.md:29-30`) is docs. The *number* is `--touch-target-min`, a published token — docs stops restating it (`mobile-accessibility.md:46-48`) and points instead. |
| `data-game` | **Design system** | It is an attribute the compiled CSS keys on (`dist/tokens.css:525`). `udesign-contract.md:190-204` becomes a pointer; `globalvision/docs/adr/0001` stays as the consumer's decision. |
| The 19 banned patterns | **Split, and this is the awkward one** | Bans 1-13 name artifacts (`--ud-*`, `bg-clip-text`, `svh`, `rounded-full`) → design system. Ban 14 (em-dashes in copy) is voice → docs. Bans 15-19 (async without pending, no pressed state, raw anchor, null fallback, hardcoded duration) name **published primitives and token families** → design system, and they are the seed of D2's checker. **Recommendation: publish one numbered superset in the design system, and have the docs keep only the voice bans plus a pointer.** Renumbering is a breaking doc change and needs a migration note. |
| `ENFORCEMENT.md:5` governing principle (*"prefer a cheap rule with no false positives over a clever rule that needs judgement"*) | **Docs** | A method statement about writing rules, true regardless of version. The R1-R7 rules it governs are version-dependent and move. |
| The `.cursorrules` / `.gemini/rules` pair | **Design system**, and they should be generated from one source | They are 90% duplicates of each other (diff: 4 hunks) and 100% duplicates of `README.md:20-31` + `DESIGN.md:356-369`. |
| `udesign-contract.md:249-317` (GlobalVision lint IDs, e2e helpers, BlockNote) | **Neither — GlobalVision** | Violates `udesign-docs/AGENTS.md:51-53`. Moves *down* to the consumer, not sideways. |

---

## 5. The migration list

Format: **what moves → where → what the losing side keeps.** Sizes are rough. Nothing here is a
decision; every row is a proposal for Kaleb.

### 5.1 docs → design system

| # | Moves | To | Losing side keeps | Size |
|---|---|---|---|---|
| M1 | `skills/interface-responsiveness/references/MOTION-SYSTEM.md` (136 ln) | `udesign-design-system/docs/motion-contract.md`, **reconciled against `dist/tokens.css`** (6 corrections, §2 I1) | A one-line pointer in `SKILL.md:183` and `README.md:14`: "the published token set and its contract tests are owned by `udesign-design-system` — see its `docs/motion-contract.md` @ the pinned tag" | 136 ln moved, ~10 ln of pointers, 6 value corrections |
| M2 | `skills/interface-responsiveness/references/ENFORCEMENT.md:9-66` (R1-R7) | `udesign-design-system` as the **specification for the D2 portable checker** | `ENFORCEMENT.md` keeps §2 (suppression discipline), §3 (gate placement), §4 (browser checks), §5 (review questions), §6 (routing) and a pointer to the checker | ~58 ln moved |
| M3 | `standards/design/udesign-contract.md:37-93` "Token vocabulary" | Deleted from docs; `DESIGN.md` + `README.md` already hold it | A pointer with a stated applicability: "the complete allowed role set is published by `udesign-design-system`; read `DESIGN.md` at the tag your product pins" | ~57 ln deleted, ~4 ln pointer |
| M4 | `standards/design/udesign-contract.md:190-204` `data-game` | Already in `DESIGN.md:282-284` | Pointer | ~15 ln → 2 |
| M5 | `standards/design/udesign-contract.md:206-212` Typography (functional profile) | Already in `DESIGN.md:219-225` | Pointer + the sentence-case *voice* rule if Kaleb wants it kept as voice | ~7 ln → 2 |
| M6 | `standards/design/udesign-contract.md:214-234` bans 1-13 and 15-19 | Merged into one **numbered** superset in `DESIGN.md` (currently 12, unnumbered) | Ban 14 (em-dashes in copy) stays, cross-referenced to `ground-truth.md:146`; a pointer for the rest | ~21 ln moved, `DESIGN.md` gains ~10 |
| M7 | `standards/design/mobile-accessibility.md:46-48` (the 44px number) | Already a token | Replace the number with the token name and a pointer | 3 ln |
| M8 | `skills/gamified-product-experience/SKILL.md:89-98` intensity scale | Deleted | A pointer to the design system's cap, and **removal of Level 3** | ~10 ln |

### 5.2 design system → docs

| # | Moves | To | Losing side keeps | Size |
|---|---|---|---|---|
| M9 | Nothing, in bulk. | — | — | — |

The design system currently holds **no** version-independent fact that the docs lack. The asymmetry
is real and worth stating plainly: the docs repo has accumulated the package's facts; the package has
not accumulated the docs' facts. The one exception is directional rather than a move:

| # | Action | Detail |
|---|---|---|
| M10 | `DESIGN.md:312`'s dangling forward reference to "the contract's Feedback section" becomes a **real tagged link** to `udesign-docs/standards/design/udesign-contract.md@<tag>` | 1 line; this is the single cheapest fix in the whole list and it closes research §2.2's inversion from the design-system side |

### 5.3 consumer → canon (record only; not this plan's job to execute)

| # | Content | Current home | Proposed home |
|---|---|---|---|
| M11 | `udesignpages/public/design-system/README.md:16-51` — "The DNA", Color, Type, Buttons, Layout, "Banned (reads as AI-generated)" | A consumer's `public/` folder | **Needs Kaleb's ratification.** The visual-conviction half of D5. Design system if it is about published artifacts; docs if it is about what UDesign refuses to be. Under the rule, "warm stone, never cold slate" is design system (names published neutrals); "reads as AI-generated" as a *criterion* is docs. |
| M12 | `udesignpages/docs/superpowers/plans/2026-07-11-…:13-19` — French chrome, "never 'gold'", client's-logo-only, mandatory confidential footer | A dated plan document | Docs (`business/udesign-ground-truth.md` §5 extension) — these are brand-conduct rules, version-independent. **Needs approval:** they are sourced but never ratified into canon. |
| M13 | `patterns.html` component definitions | Consumer | Superseded by D1's CSS component layer. `patterns.html` becomes a pointer or is deleted. |

### 5.4 within docs (housekeeping the rule exposes)

| # | Action |
|---|---|
| M14 | `udesign-contract.md:249-317` (GlobalVision lint IDs, e2e helper names, BlockNote, B-18) moves **down** to `globalvision`, per `udesign-docs/AGENTS.md:51-53`. ~70 ln. Not this plan's job to land in GlobalVision — record as a migration note. |
| M15 | Give `skills/` the five-field front matter, a `standards/README.md` row (or its own `skills/README.md` index), and `MIGRATION-MANIFEST.md` rows. Closes I7. |
| M16 | Delete `skills/gamified-product-experience/REPORT.md` (byte-identical to `references/PLAYBOOK.md`). Closes I12. |
| M17 | Add a routing line to `udesign-docs/AGENTS.md` naming `udesign-design-system` and `skills/`. Closes research §2.1. |
| M18 | Retitle/rescope `standards/versioning.md`, or mark it `applies_to: globalvision`. It claims org-wide and is GlobalVision-shaped (I14). |

### 5.5 Tag-bump implications

- **`udesign-docs` cuts `v0.7.0`.** Deleting `udesign-contract.md`'s token vocabulary and moving
  `MOTION-SYSTEM.md` are **breaking for any link that targets a line range**. Per `AGENTS.md:76-87`
  every cross-repo link carries an immutable tag, so **no existing link breaks** — v0.4.0 keeps
  working. The cost is that every consumer sits on a stale pin until it repins.
- **Repin policy already exists and covers this:** `globalvision/AGENTS.md:60` — repin only when the
  target's content changed, tested by `git diff --stat <pinned> <latest> -- <path>`. Under this
  migration the answer is *yes, it changed* for `udesign-contract.md`, `mobile-accessibility.md`, and
  both skill references. So GlobalVision's `AGENTS.md:11,14,25,41` pins all need bumping — **4 link
  edits in a repo this plan is not allowed to fix.** Record as a migration note; do not schedule it.
- **`udesign-design-system` cuts `v2.0.0`.** M1/M2/M6 add documents; M6's renumbering of the ban list
  is the only genuinely breaking change for a reader who cites bans by number. Migration note
  required: "bans were unnumbered in `DESIGN.md` v1.x and numbered 1-19 in `udesign-contract.md`; the
  v2.0.0 superset renumbers. Old citations of `udesign-contract.md` ban N remain valid at the tag."
- **`WEBDEV/CLAUDE.md`** needs its tag range corrected (I15) and, if the boundary rule is adopted, one
  line stating it — that file is the only place both repos are named together.
- **`package.json:9-19` `files`** must gain `AGENTS.md` (and `docs/motion-contract.md` if M1 lands
  there) or the migration is invisible to npm consumers (I17).

---

## 6. The two-entry-point check

The rule fails if either entry point cannot reach the full picture. Both paths below are **under the
proposed rule, after the migration**. Hop count is what matters; a path that is correct but six hops
deep has failed in practice.

### 6.1 Starting in `udesign-design-system/AGENTS.md`

| Hop | File | What it must contain (post-migration) | Reachable today? |
|---|---|---|---|
| 0 | `AGENTS.md` | Rewritten per research §6 item 2: the four rules, the profile pin-once rule, the emphasis budget, **and a "what this repo does not own" block naming `udesign-docs@<tag>` for the feedback model and the brand voice** | **No** — today it is 81 lines about CRLF and mentions design zero times |
| 1 | `DESIGN.md` | Tokens, roles, motion numbers, the numbered ban superset, composition rules, profile decision rule | Partly — no composition rules, no decision rule, no numbered bans |
| 1 | `docs/motion-contract.md` (M1) | The published token set + its 7 contract tests | New |
| 2 | `udesign-docs/.../udesign-contract.md@<tag>` § Feedback | 100ms floor, four layers, response budget | **No** — one dangling prose reference at `DESIGN.md:312`, no link (M10 fixes it) |
| 2 | `udesign-docs/skills/interface-responsiveness/SKILL.md@<tag>` | The interaction model | **No** — zero mentions repo-wide |
| 2 | `udesign-docs/business/udesign-ground-truth.md@<tag>` §5 | Brand voice | **No** — zero mentions repo-wide |

**Verdict: 2 hops, all named at hop 0.** Acceptable. **But it depends entirely on hop 0 existing**,
and hop 0 has a hard constraint the rest of the plan must respect: `AGENTS.md` is not shipped
(`package.json:9-19`), so a consumer that reaches the package only through `npm install` sees
`README.md`, `DESIGN.md`, `HANDOFF.md`, `CHANGELOG.md`, `LICENSE.md` and nothing else. Either
`AGENTS.md` joins `files`, or the routing block must be duplicated into `README.md` — and duplicating
it is the exact thing this rule forbids. **Recommendation: add `AGENTS.md` to `files`.** This is the
single highest-leverage change the boundary work depends on, and it is a one-line diff.

Also note hop 1 works for a `git clone` consumer and hop 2 requires network (a raw GitHub URL at a
tag). That asymmetry is inherent to a two-repo design and is not a reason to reject the rule —
GlobalVision has operated this way successfully since Wave 5.

### 6.2 Starting in `udesign-docs/AGENTS.md`

| Hop | File | What it must contain (post-migration) | Reachable today? |
|---|---|---|---|
| 0 | `AGENTS.md` | A routing block: *"Design work → the design system package. This repository owns the version-independent half only: the feedback model (`standards/design/`), the interaction skill (`skills/`), and brand voice (`business/`). Everything about tokens, components, motion values, and bans on artifacts is owned by `udesign-design-system` — read its `AGENTS.md` at the tag your product pins."* | **No** — zero mentions of the design system or of `skills/` |
| 1 | `standards/README.md` | Must gain rows for `skills/` (M15) | **No** — lists 5 documents, none of them the skills |
| 2 | `standards/design/udesign-contract.md` (post-split: feedback model, escape hatch, accessibility, a pointer table) | The version-independent design canon | Yes |
| 2 | `skills/interface-responsiveness/SKILL.md` | The interaction model | Yes, at 4 hops today (research §2.1); 2 after M17 |
| 2 | `business/udesign-ground-truth.md` §5 | Brand voice | Yes |
| 3 | `udesign-design-system@<tag>/AGENTS.md` → `DESIGN.md` | The artifact half | Reachable only via `README.md:87-88`, at the bottom of the file, today |

**Verdict: 3 hops, with hop 3 being the cross-repo jump.** Acceptable, and symmetric with 6.1 (that
path's hop 2 is the same jump in the other direction).

### 6.3 The path that still fails, and why it is not the rule's fault

`udesignpages/agents.md` reaches neither repo (0 mentions). `shadcn add @udesign/core` fetches
`public/r/core.json` and reaches nothing (research §3.1 path (d); `registry.json` has 0 of 28 `docs`
fields populated). These are **transmission defects, not boundary defects** — they would fail under
any boundary rule. They belong to the plan's transmission phase (research §6 items 1-4) and to I16.
Flagging them here so the orchestrator does not score them against this rule.

### 6.4 Honest assessment

The rule survives the two-entry-point test **only because both entry files get rewritten.** If the
plan adopts the boundary rule but drops the two `AGENTS.md` rewrites and the `files` array change as
"cheap text edits we can do later", the boundary is worse than the status quo: content will have
moved and no route will have been built to where it went. **The rewrites are a hard dependency of the
migration, not an accompaniment to it.**

---

## 7. Recommendation on `interface-responsiveness`

**Recommendation: split it, do not move it.** MOTION-SYSTEM.md and ENFORCEMENT.md §1 move to
`udesign-design-system`; the skill itself and its five other references stay in `udesign-docs`.

### 7.1 Why not move the whole thing

The previous plan said leave it and reference it; D3/D4 now permit moving it. Re-deciding:

1. **The rule says most of it is version-independent.** `SKILL.md:10` (100ms), the four layers, the
   response-time budget (`SKILL.md:92-98`, sourced at `RESEARCH.md:17-27`), the native-first ladder
   (`SKILL.md:132-141`), and the 14-item never-ship list are true for a product that never installs
   this package. Moving them into a versioned package would make org-wide facts appear to expire with
   a design release — the mirror image of the disease being cured.

2. **It is a portable Agent Skill, not a design-system document.** Valid frontmatter, a trigger-rich
   `description`, seven progressively-disclosed references, and an `agents/openai.yaml` policy block
   (`skills/interface-responsiveness/agents/openai.yaml:1-9`). Agent Skills are discovered by
   directory convention. Burying one inside a token package would break that discovery for no gain.

3. **Moving it breaks the one route in the stack that works.** `ENFORCEMENT.md:129-137` specifies
   that the root instruction file must route to the skill by name; the only place this was ever done
   is `globalvision/AGENTS.md:14`, pinned at `@v0.4.0`. That link is load-bearing and currently
   correct. Breaking the single working instance of the routing pattern, in service of tidiness, is a
   bad trade — and the brief's own P2 test would score it "no".

4. **The gamification skill sits beside it and is ordered against it** (`interface-responsiveness/
   README.md:42-44`). Separating the pair puts the ordering rule across a repo boundary.

### 7.2 Why the two files must move anyway

`MOTION-SYSTEM.md` is not a skill reference. Its own first line says what it is: *"What a design
system must publish so that consuming applications can obey `SKILL.md` without inventing numbers"*
(`:3`). It is a **specification of this package**, and it has already drifted from the package on six
measurable points (§2, I1) across two releases, undetected — because nothing in `udesign-docs` builds
`dist/tokens.css` and nothing in `udesign-design-system` reads `MOTION-SYSTEM.md`. That drift is not a
maintenance lapse; it is what the version-dependence rule predicts happens to a version-dependent fact
housed on the version-independent side.

`ENFORCEMENT.md:9-66` (R1-R7) is the same category: R1 names the token families the package publishes;
R6 is explicitly *"scoped to the primitive"* and its prerequisite is *"the primitive must actually
have a `pending` prop"* (`:59`) — which is a statement about `registry/new-york/ui/button.tsx`; R7 is
*"component-library scope only"* (`:61`). These are rules about this package's artifacts, and D2 makes
them executable and shippable from this package. They cannot be maintained anywhere else.

### 7.3 The cost, priced

| Item | Cost |
|---|---|
| Move `MOTION-SYSTEM.md` (136 ln) into `udesign-design-system/docs/motion-contract.md` | 1 file add, 1 file delete |
| Reconcile its 6 drifted values against `dist/tokens.css` | 6 edits — **this is work that must happen regardless of where the file lives**, so it is not a cost of the move |
| Move `ENFORCEMENT.md:9-66` (58 ln) | 1 section cut, 1 file add |
| Pointers back from `SKILL.md:183,185` and `README.md:14,16` | ~4 lines |
| `udesign-docs` tag bump | v0.6.0 → v0.7.0, one cut |
| `udesign-design-system` | Already cutting v2.0.0 |
| Consumer link churn | **Zero.** `globalvision/AGENTS.md:14` targets `SKILL.md`, which does not move. No other repo links either reference file (grep: 0 hits for "MOTION-SYSTEM" and "ENFORCEMENT.md" outside `udesign-docs`) |
| Risk | Low. The two files are internal references, loaded on demand, with no external inbound links |

**Total: two file moves, ~10 lines of pointers, one tag cut, zero consumer breakage.** Against the
alternative — leaving a spec of the package in another repo where it has already drifted six ways in
two releases — this is cheap.

### 7.4 One thing to preserve deliberately

`ENFORCEMENT.md:5` — *"prefer a cheap rule with no false positives over a clever rule that needs
judgement. A noisy lint rule gets suppressed everywhere and then enforces nothing."* — is the
governing principle for D2, and the brief already names it as such. It is a **method** statement, not
an artifact statement, so under the rule it stays in the docs. The checker's own documentation should
cite it by tag rather than restate it. This is a small but exact demonstration that the rule can split
a single file correctly rather than forcing an all-or-nothing move.

---

## 8. Open questions for Kaleb (do not decide these; put them to him)

1. **The visual-conviction content in `udesignpages/public/design-system/README.md:16-51`** — ratify
   into canon, or treat as a consumer-local dialect? It is sourced but never ratified. This is the
   biggest single input to D5's "visual conviction" body and it is currently in the wrong repo.
2. **"fastest in town"** was dropped from the ground-truth distillation
   (`SEO_GROUND_TRUTH.md:85` vs `udesign-ground-truth.md:146-147`). Restore, or confirm deliberate?
3. **The gamification skill's Level 3** (`SKILL.md:96`) contradicts three other documents. Delete the
   level, or reconcile the two scales explicitly?
4. **Ban-list renumbering** (M6). The 19 numbered bans are the only citable list in the stack;
   merging them into `DESIGN.md` renumbers them. Accept the churn, or keep `udesign-contract.md` as
   the numbered list and have `DESIGN.md` point at it (which inverts the rule for one document)?
5. **`standards/versioning.md`** claims org-wide and is GlobalVision-shaped. Rescope, or write a real
   org-wide one and demote that file to a GlobalVision overlay?
6. **`udesign-contract.md:249-317`** (GlobalVision lint IDs and e2e helpers in an org standard) —
   this plan is not allowed to fix GlobalVision, but it is allowed to remove the content from the org
   standard, which strands GlobalVision until it re-homes it. Move now, or leave and record?
