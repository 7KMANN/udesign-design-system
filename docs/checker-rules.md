# Checker rules

Seed specification for the portable design checker. Moved from `udesign-docs`
`skills/interface-responsiveness/references/ENFORCEMENT.md` §1, because each rule names an
artifact this package publishes (token families, the `pending` prop, the primitive library).

Governing principle: see
[`ENFORCEMENT.md` line 5](https://github.com/7KMANN/udesign-docs/blob/v0.9.0/skills/interface-responsiveness/references/ENFORCEMENT.md)
(`udesign-docs@v0.9.0`, canonical). It applies to every rule below. Suppression discipline, gate
placement, browser checks, and review questions stay in that file.

Profiles: this document names the two profiles `presentation` and `operations`. The v1.x
selector strings `brand` and `functional` remain as selector aliases for one release.

---

## What `udesign-check` checks

`bin/udesign-check.mjs`, rules in `bin/rules.mjs`, tests in `tests/checker.test.mjs`. Every rule is a
cheap lexical check: it may miss exotic source, and it never needs judgement to be right. Each rule
was chosen by running the candidates over real consumer source first (S3 ledger, 2026-09-26).

| Rule | Cites | Flags | Does not flag |
|---|---|---|---|
| `accent-repeated` | ban 26 | HTML: two or more `ud-btn-primary` under the same ancestor path (tag and classes), which is a repeated block. React: a `<Button>` with no `variant`, or `variant="default"`, inside a `.map()` callback. | One accent in a hero and one in a footer: different paths. |
| `div-onclick` | `AGENTS.md` rule 2 | A JSX `<div>` with `onClick`, whatever its `role` or `tabIndex`. | A handler that only calls `stopPropagation()`, which makes nothing clickable. |
| `raw-motion` | ban 19 | `duration-<n>`, `ease-in`/`-out`/`-in-out`/`-linear`, `ease-[cubic-bezier(...)]`; a `transition` or `animation` declaration (CSS or a style object) whose value holds a non-zero literal time, an easing keyword, `cubic-bezier()` or `steps()`. | Anything inside `var()`; a zero duration. |
| `ud-primitive` | ban 1 | `var(--ud-*)`. | A synced copy of `dist/tokens.css`, recognized by its header. |
| `em-dash` | ban 14 | An em-dash (U+2014, `&mdash;`, `&#8212;`) in HTML markup or JS/TS source, including a lone placeholder (D-29). | Comments, `<style>`, `<script>`. |
| `accent-colour-name` | `AGENTS.md` rule 5 | A declared identifier with `gold` as a word part (`GOLD`, `goldAccent`); a CSS custom property with one (`--brand-gold`). | A product colour in copy or data ("Athletic Gold"). |
| `profile-pin` | `AGENTS.md` rule 6 | `data-design` on any element but `<html>`; `dataset.design =`; `setAttribute("data-design", ...)`. | `[data-design=...]` selectors. |
| `shell` | ban 27 | HTML: an `operations` (or `functional`) root with no `ud-app-shell`; a `presentation` (or `brand`) root with one. React: an `operations` `<html>` with no `<AppShell>` anywhere in the scanned tree; a `presentation` one with any. | A document with no `data-design`. |

**Scope.** `.html`, `.css`, `.js`, `.jsx`, `.ts`, `.tsx`, `.mjs`, `.cjs`. Skips `node_modules`, `.git`,
`.next`, `dist`, `build`, `out`, `coverage`, `__tests__`, `*.test.*`, `*.spec.*`, `*.min.*` and
`*.d.ts`: build output is not source, and test data is not interface copy.

**Suppression.** `design-ok: <reason>` on the flagged line or the line above, the convention ban 3
already defines. The reason is for the reviewer; the checker only looks for the marker.

**Exit code.** 1 when anything is found, 0 otherwise.

### The shells' static-HTML classes (Δ-14)

They ship in `dist/tokens.css` (S2, source `css/components.css`); the `shell` rule reads `ud-app-shell`. Each is `ud-` plus the React
component's name in kebab case, and a variant appends `-<variant>`, as `ud-btn-primary` does.

| React (registry) | Class |
|---|---|
| `PageCanvas` | `ud-page-canvas` |
| `PageSection`, `variant="band"` | `ud-page-section`, `ud-page-section-band` |
| `AppShell` | `ud-app-shell` |
| `AppShellSidebar` | `ud-app-shell-sidebar` |
| `AppShellToolbar` | `ud-app-shell-toolbar` |
| `AppShellPanes` | `ud-app-shell-panes` |
| `AppShellPane` | `ud-app-shell-pane` |

### Not shipped, and why

Fewer rules (plan 8, risk 3). Each can ship later with a form that needs no judgement.

- **Raw hex (ban 3).** 617 hits in `udesignpages` HTML, nearly all product swatch data, which ban 3
  permits. Telling data from styling needs judgement.
- **Colour-only status (ban 11).** Needs judgement.
- **`:focus` instead of `:focus-visible` (`AGENTS.md` rule 2).** `focus:outline-none` beside a
  `focus-visible:` ring is the safe pattern, and separating it from a real missing ring needs a
  per-element read.
- **Padding override on a breakpoint-padded component (Δ-07, plan rule 8).** Needs cross-file
  resolution of each component's base classes, and no ban or `AGENTS.md` rule covers it yet.
- **A class name built at runtime (Δ-07, plan rule 9).** A lexical match cannot tell class assembly
  from string handling (158 `.replace(` calls in GlobalVision), and no ban covers it yet.
- **`shadow-[var(...)]` (Δ-13).** Only a Tailwind 3 bug. Tailwind 4.1.13 compiles it as a real
  `box-shadow`, so in GlobalVision every hit would be false.
- **R2 to R7 below.** Seed specifications, not in the plan's list. R4 (ban 18) is the cheapest.

---

## Seed specifications

Carried from `ENFORCEMENT.md`. R1 ships as `raw-motion`, without `transition-all`, which no ban names.

### R1 - `raw-motion-value` (lexical, zero ambiguity)

**Flags:** a hardcoded duration or easing in application code - `duration-<number>`, `ease-in`/`ease-out`/`ease-in-out`, `ease-[cubic-bezier(...)]`, `transition-all`, or a `transitionDuration`/`transitionTimingFunction` string literal.

**Requires:** `duration-[var(--motion-duration-*)]`, `ease-[var(--motion-easing-*)]`, or the token in a style object.

`transition-all` is included deliberately: it animates every animatable property including layout ones, which is D2 waiting to happen. Name the properties.

**Cost:** a regex. **False positives:** none.

### R2 - `internal-raw-anchor` (lexical + AST)

**Flags:** `<a href="/...">` or `<a href={someInternalPath}>` in application code.

**Requires:** the framework's `Link` component. Suppressible only for genuinely external URLs, with a reason.

**Why it matters more than it looks:** this single pattern converts every client transition into a full document reload, which disables every other feedback mechanism downstream. It is the highest-severity item on this list.

### R3 - `route-without-loading` (file existence, fail-closed manifest)

**Flags:** a `page.tsx` route segment with no sibling `loading.tsx` and no registered exemption.

**Manifest:** `interaction-surfaces.json` (or equivalent) lists routes explicitly exempted, each with a reason - "renders no server-awaited data" is the only legitimate one. A new route with no `loading.tsx` and no manifest entry **fails the gate**, exactly like a fail-closed coverage guard.

This is the pattern that makes the rule survive: it is not "remember to add a loading file", it is "the build refuses a route that has not answered the question".

**Cost:** a directory walk plus a JSON read.

### R4 - `null-suspense-fallback` (lexical)

**Flags:** `<Suspense fallback={null}>` and `fallback={undefined}`.

**Requires:** a real fallback, or removal of the boundary.

### R5 - `layout-animating-transition` (lexical)

**Flags:** `transition-[...]` / `transition-property` naming `width`, `height`, `top`, `left`, `right`, `bottom`, `margin`, or `padding`.

**Requires:** `transform`/`opacity`, or a `design-ok` reason where the platform genuinely requires it.

### R6 - `async-control-without-pending` (AST, scoped to the primitive)

**Flags:** a `<Button>` (or the project's equivalent primary control) whose `onClick`/`onSubmit` prop is an `async` arrow function or a function body containing `await` / `.then(`, and which passes none of `pending`, `loading`, `disabled`, or `aria-busy`.

**Scoping this to the known primitive by name is what keeps it accurate.** A general "any element with an async handler" rule produces too many false positives on wrappers and custom components, gets suppressed everywhere, and dies. Start with the one control that carries most of the traffic.

**Prerequisite:** the primitive must actually *have* a `pending` prop. Ship that first (see [`motion-contract.md`](motion-contract.md) §3) or the rule has no fix to point at.

### R7 - `press-feedback-required` (component-library scope only)

**Flags:** a file in the shared UI primitive directory that renders an interactive element (`<button>`, `role="button"`, a Radix `Trigger`/`Item`) and contains no `active:` treatment and no documented exemption.

**Scope this to the primitive library, not to application code.** Application code should get its press feedback by using the primitives; linting every call site is noise.
