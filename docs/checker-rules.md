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

## Lint rules

These are ordered by value-per-implementation-cost. Ship them in this order.

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
