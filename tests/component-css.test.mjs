import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import { check } from "../bin/rules.mjs"

// The static-HTML component layer (plan Phase 3). Lockstep with the React
// registry is behavioural, not pixel: the rules motion-adoption.test.mjs holds
// the TSX to, re-aimed at css/components.css, plus a name-parity list.

const root = process.cwd()
const cssPath = path.join(root, "css/components.css")
const css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, "utf8") : ""
const registryItems = JSON.parse(fs.readFileSync(path.join(root, "registry.json"), "utf8")).items.map((i) => i.name)

// Every registry item: the classes that mirror it, or why it has none. Fail-closed
// both ways: a new React component with no entry fails, and so does a class the
// stylesheet ships that no entry declares. Mirror what a generator reaches for
// (plan 3.1, evidence in the S2 ledger), not the registry.
const MIRROR = {
  button: ["ud-btn", "ud-btn-primary", "ud-btn-secondary", "ud-btn-outline", "ud-btn-ghost"],
  card: ["ud-card"],
  badge: ["ud-badge"],
  table: ["ud-table", "ud-table-scroll", "ud-table-numeric"],
  input: ["ud-input"],
  textarea: ["ud-input"],
  "empty-state": ["ud-empty-state"],
  pressable: ["ud-pressable"],
  "page-canvas": ["ud-page-canvas", "ud-page-section", "ud-page-section-band"],
  "app-shell": ["ud-app-shell", "ud-app-shell-sidebar", "ud-app-shell-toolbar", "ud-app-shell-panes", "ud-app-shell-pane"],
  alert: "no generator wrote one",
  select: "Radix behaviour, and a native <select> is ban 9",
  checkbox: "Radix behaviour, and a native checkbox is ban 9",
  switch: "Radix behaviour; no generator wrote one",
  slider: "Radix behaviour, and a native range is ban 9",
  field: "no generator wrote a label, hint and error group; .ud-label covers the label",
  dialog: "needs script for focus trap and dismissal; no generator wrote one",
  sheet: "needs script for focus trap and dismissal; no generator wrote one",
  tooltip: "needs script for positioning; no generator wrote one",
  tabs: "needs script for roving focus; no generator wrote one",
  "icon-button": "no generator wrote one; a .ud-btn with an aria-label covers it",
  "progress-ring": "motion primitive, renders computed values; no static use",
  "rolling-consistency-chip": "motion primitive over Badge; no static use",
  moment: "gamification, gated behind data-game; no static use",
  "status-badge": "no generator showed a status; .ud-badge covers the labels generators wrote",
  "metric-card": "no generator wrote one",
  "responsive-collection": "a show/hide wrapper with no surface of its own",
  spinner: "a static page has nothing in flight; no generator wrote one",
  skeleton: "a static page has nothing loading; no generator wrote one",
  core: "a bundle, not a component",
}

const rules = [...css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
  selector: m[1].trim(),
  body: m[2],
}))
const classesIn = (selector) => [...selector.matchAll(/\.(ud-[a-z0-9-]+)/g)].map((m) => m[1])
const shipped = new Set(rules.flatMap((r) => classesIn(r.selector)))
const hasState = (cls, state) => rules.some((r) => r.selector.split(",").some((s) => classesIn(s)[0] === cls && s.includes(state)))
// A variant (ud-btn-primary) always sits beside the class it extends (ud-btn), so it
// inherits that class's states (Δ-14: a variant appends -<variant>).
const hasOwnOrBaseState = (cls, state) => [...shipped].some((base) => (cls === base || cls.startsWith(`${base}-`)) && hasState(base, state))

test("every registry item is mirrored or skipped with a reason, and nothing else is", () => {
  assert.deepEqual(Object.keys(MIRROR).sort(), [...registryItems].sort())
})

test("every declared class ships, and every shipped class is declared", () => {
  const declared = new Set(Object.values(MIRROR).filter(Array.isArray).flat())
  assert.deepEqual([...declared].filter((c) => !shipped.has(c)), [], "declared but missing from css/components.css")
  assert.deepEqual([...shipped].filter((c) => !declared.has(c)), [], "shipped but not declared in MIRROR")
})

test("anything clickable has a pressed state (ban 16)", () => {
  const clickable = rules.filter((r) => /cursor:\s*pointer/.test(r.body)).map((r) => classesIn(r.selector)[0])
  assert.ok(clickable.length >= 2, "expected at least the button and pressable classes")
  assert.deepEqual(clickable.filter((c) => !hasState(c, ":active")), [])
})

test("press implies a focus-visible ring (AGENTS.md rule 2)", () => {
  const pressed = [...new Set(rules.filter((r) => r.selector.includes(":active")).flatMap((r) => r.selector.split(",").map((s) => classesIn(s)[0])))]
  assert.ok(pressed.length >= 2)
  assert.deepEqual(pressed.filter((c) => !hasOwnOrBaseState(c, ":focus-visible")), [])
  assert.doesNotMatch(css, /:focus(?![-\w])/, "use :focus-visible, never :focus")
})

test("every transition names a --motion-* duration (ban 19)", () => {
  const transitions = rules.flatMap((r) => [...r.body.matchAll(/transition\s*:([^;]+)/g)].map((m) => m[1]))
  assert.ok(transitions.length >= 2)
  assert.deepEqual(transitions.filter((t) => !t.includes("var(--motion-duration-")), [])
})

test("no raw colour and no --ud-* primitive (bans 1 and 3)", () => {
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b|\b(?:rgb|hsl|oklch)a?\(/i)
  assert.doesNotMatch(css, /--ud-/)
})

test("the stylesheet passes the checker it ships beside", () => {
  assert.ok(css.length > 0, "css/components.css is missing")
  assert.deepEqual(check([{ file: "components.css", text: css }]), [])
})

test("the build appends the stylesheet to both compiled token files", () => {
  for (const file of ["dist/tokens.css", "dist/tokens-functional.css"]) {
    const compiled = fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n")
    assert.ok(css && compiled.includes(css.replace(/\r\n/g, "\n")), `${file} does not carry css/components.css; run npm run build`)
  }
})
