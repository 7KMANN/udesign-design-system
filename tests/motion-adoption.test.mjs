import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"

// The adoption floor.
//
// v1.4.0 published a motion token layer that was correct, tested, tagged - and
// consumed by two of twenty-four components. Everything else hardcoded its own
// values. A token layer nobody consumes is indistinguishable from no token
// layer, and no test in this repository could tell the difference.
//
// This file is that test. It fails when a published motion token loses its
// consumers, and when a component reintroduces a raw duration or curve.

const root = process.cwd()
const css = fs.readFileSync(path.join(root, "dist/tokens.css"), "utf8")
const uiDir = path.join(root, "registry/new-york/ui")
const sources = Object.fromEntries(
  fs.readdirSync(uiDir).filter((f) => f.endsWith(".tsx")).map((f) => [f, fs.readFileSync(path.join(uiDir, f), "utf8")]),
)
const allSource = Object.values(sources).join("\n")

// Fail-closed: a token with no registry consumer needs a reason recorded here,
// not silence. Adding a name to this map is a deliberate act a reviewer can see.
const EXEMPT = {
  "--motion-duration-slow": "route transitions and shared-element morphs are an application concern; no registry component owns one",
  "--motion-duration-standard": "the disclosure transition (dialog, sheet, panel) is the intent this belongs to, and it is not wired in the registry yet - see --motion-easing-enter",
  "--motion-easing-enter": "used by application-level enter transitions; the Radix-presence components here need keyframes, not a transition, to hold an exit - that is a separate change",
  "--motion-easing-exit": "same as --motion-easing-enter",
  "--motion-delay-indicator": "application code owns when its own pending indicator appears; the registry primitives render theirs immediately under a caller-controlled flag",
}

test("every published motion token has a registry consumer or a recorded reason", () => {
  const published = [...new Set([...css.matchAll(/(--motion-[a-z0-9-]+):/g)].map((m) => m[1]))]
  assert.ok(published.length >= 12, `expected the full motion family, found ${published.length}`)
  const orphans = published.filter((name) => !allSource.includes(name) && !(name in EXEMPT))
  assert.deepEqual(orphans, [], `published with no consumer and no recorded reason: ${orphans.join(", ")}`)
})

test("no exemption outlives its usefulness", () => {
  const consumed = Object.keys(EXEMPT).filter((name) => allSource.includes(name))
  assert.deepEqual(consumed, [], `now consumed - delete the exemption: ${consumed.join(", ")}`)
})

const RAW_MOTION = [
  [/\bduration-\[?\d/, "a raw duration utility"],
  [/\bdelay-\[?\d/, "a raw delay utility"],
  [/\bease-(?:linear|in|out|in-out)\b/, "a raw easing utility"],
  [/cubic-bezier\(/, "a raw cubic-bezier curve"],
  [/transitionDuration:\s*["'`]\d/, "a raw transitionDuration value"],
  [/animation-duration:\s*\d/, "a raw animation-duration value"],
]

test("no registry component declares a raw duration or easing", () => {
  for (const [file, source] of Object.entries(sources)) {
    for (const [pattern, what] of RAW_MOTION) {
      assert.doesNotMatch(source, pattern, `${file} contains ${what}; use a --motion-* role`)
    }
  }
})

test("every transition in the registry names its duration token", () => {
  for (const [file, source] of Object.entries(sources)) {
    if (!/\btransition-/.test(source)) continue
    assert.match(
      source,
      /--motion-duration-/,
      `${file} animates without selecting a duration intent, so it inherits a framework default`,
    )
  }
})

test("every interactive primitive acknowledges a press", () => {
  // Scoped to the controls a user presses. Inputs, layout, and display
  // components are deliberately absent - a press state on a text field is noise.
  const PRESSED = ["button.tsx", "checkbox.tsx", "switch.tsx", "tabs.tsx", "select.tsx", "dialog.tsx", "sheet.tsx", "pressable.tsx"]
  for (const file of PRESSED) {
    assert.match(
      sources[file],
      /active:(?:scale-\[var\(--motion-press-scale|bg-\[var\(--interactive-pressed)/,
      `${file} has no pressed state - the single most commonly missing thing in machine-written UI`,
    )
  }
})
