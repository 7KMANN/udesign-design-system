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

const PRESS = /active:(?:scale-\[var\(--motion-press-scale|bg-\[var\(--interactive-pressed)/
// Anything that renders a native button or a Radix part a user can press.
const RENDERS_PRESSABLE = /<button\b|role="button"|["']button["']|Primitive\.(?:Root|Trigger|Item|Thumb|Close)\b/

// Fail-closed, same shape as EXEMPT: a pressable file with no press state
// needs a reason a reviewer can read.
const PRESS_EXEMPT = {
  "tooltip.tsx": "TooltipTrigger wraps the consumer's own control via asChild; the press state belongs to that control",
}

test("every interactive primitive acknowledges a press", () => {
  // Derived, not listed. The hand-kept list this replaced never named slider or
  // table, which is how both shipped without anyone noticing.
  const pressable = Object.keys(sources).filter((file) => RENDERS_PRESSABLE.test(sources[file]))
  assert.ok(pressable.length >= 9, `expected the interactive primitives, found ${pressable.length}`)
  const unpressed = pressable.filter((file) => !(file in PRESS_EXEMPT) && !PRESS.test(sources[file]))
  assert.deepEqual(unpressed, [], `no pressed state - the single most commonly missing thing in machine-written UI: ${unpressed.join(", ")}`)
})

test("no press exemption outlives its usefulness", () => {
  const stale = Object.keys(PRESS_EXEMPT).filter((file) => !sources[file] || PRESS.test(sources[file]))
  assert.deepEqual(stale, [], `now pressed or gone - delete the exemption: ${stale.join(", ")}`)
})

test("press styling implies a focusable element", () => {
  // A pressed state on something no keyboard can reach says "click me" and
  // offers no way to do it. Clickable rows and cards are Pressable.
  const unreachable = Object.keys(sources).filter(
    (file) => PRESS.test(sources[file]) && !(sources[file].includes("focus-visible:") && RENDERS_PRESSABLE.test(sources[file])),
  )
  assert.deepEqual(unreachable, [], `press styling with no focusable control and focus-visible treatment: ${unreachable.join(", ")}`)
})

test("focus rings use focus-visible, never focus", () => {
  // :focus fires on mouse click too, so the ring flashes on every press.
  const offenders = Object.keys(sources).filter((file) => /(?<![\w-])focus:(?:ring|outline)/.test(sources[file]))
  assert.deepEqual(offenders, [], `focus: where the system requires focus-visible: ${offenders.join(", ")}`)
})
