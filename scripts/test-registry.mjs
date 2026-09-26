import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const registryPath = path.join(root, "registry.json")

assert.ok(fs.existsSync(registryPath), "registry.json must exist")

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"))
const requiredItems = [
  "button",
  "badge",
  "alert",
  "card",
  "input",
  "textarea",
  "select",
  "checkbox",
  "switch",
  "slider",
  "field",
  "dialog",
  "sheet",
  "tooltip",
  "tabs",
  "table",
  "icon-button",
  "status-badge",
  "metric-card",
  "empty-state",
  "responsive-collection",
  "progress-ring",
  "rolling-consistency-chip",
  "moment",
  "spinner",
  "skeleton",
  "pressable",
  "page-canvas",
  "app-shell",
  "core",
]

assert.equal(registry.$schema, "https://ui.shadcn.com/schema/registry.json")
assert.equal(registry.name, "udesign")
assert.deepEqual(
  registry.items.map((item) => item.name).sort(),
  [...requiredItems].sort(),
  "registry must expose exactly the approved public items",
)

const rawColorPattern = /(?:\b(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:[1-9]00|50)\b)|(?:#[0-9a-f]{3,8}\b)/i
const primitivePattern = /--ud-/
const rawShadowPattern = /\bshadow-(?:sm|md|lg|xl|2xl)\b/
// Δ-10: rounded-sm/md/lg resolve through the consumer's Tailwind theme, so --radius never reaches them.
const radiusAliasPattern = /\brounded-(?:sm|md|lg|xl|2xl|3xl)\b/
const unmappedSemanticUtilityPattern = /\b(?:bg|text|border|ring)-(?:background|foreground|card|card-foreground|popover|popover-foreground|primary|primary-foreground|primary-hover|secondary|secondary-foreground|muted|muted-foreground|accent|accent-foreground|input|destructive|destructive-foreground|border)\b/

for (const item of registry.items) {
  assert.ok(item.title, `${item.name} must have a title`)
  assert.ok(item.description, `${item.name} must have a description`)
  assert.ok(item.files?.length, `${item.name} must include at least one source file`)

  for (const file of item.files) {
    const sourcePath = path.join(root, file.path)
    assert.ok(fs.existsSync(sourcePath), `${item.name} source file is missing: ${file.path}`)
    const source = fs.readFileSync(sourcePath, "utf8")
    assert.doesNotMatch(source, rawColorPattern, `${file.path} contains a raw color utility or literal`)
    assert.doesNotMatch(source, primitivePattern, `${file.path} consumes a forbidden UDesign primitive`)
    assert.doesNotMatch(source, rawShadowPattern, `${file.path} contains a raw elevation utility`)
    assert.doesNotMatch(source, radiusAliasPattern, `${file.path} uses a Tailwind radius alias; use rounded-[var(--radius*)]`)
    // Tailwind 3 reads shadow-[var(...)] as a shadow colour, so no elevation renders.
    assert.doesNotMatch(source, /\bshadow-\[var\(/, `${file.path} uses shadow-[var(...)]; use [box-shadow:var(--shadow-N)]`)
    assert.doesNotMatch(source, unmappedSemanticUtilityPattern, `${file.path} relies on an uninstalled Tailwind theme alias`)
    assert.match(file.target, /^components\/ui\//, `${file.path} must install under components/ui`)
  }
}

const files = Object.fromEntries(
  registry.items.flatMap((item) =>
    item.files.map((file) => [path.basename(file.path), fs.readFileSync(path.join(root, file.path), "utf8")]),
  ),
)

assert.match(files["badge.tsx"], /export type UDesignTone/)
assert.match(files["badge.tsx"], /export interface BadgeProps/)
assert.match(files["badge.tsx"], /tone\?: UDesignTone/)
assert.match(files["status-badge.tsx"], /export interface StatusBadgeProps/)
assert.match(files["icon-button.tsx"], /export interface IconButtonProps/)
assert.match(files["icon-button.tsx"], /label: string/)
assert.match(files["metric-card.tsx"], /export interface MetricCardProps/)
assert.match(files["responsive-collection.tsx"], /export interface ResponsiveCollectionProps/)
assert.match(files["dialog.tsx"], /w-\[var\(--dialog-inline-size-mobile\)\]/)
assert.match(files["dialog.tsx"], /max-h-\[var\(--dialog-block-size-max\)\]/)
assert.match(files["table.tsx"], /overflow-x-auto/)
assert.match(files["table.tsx"], /min-h-\[var\(--touch-target-min\)\]/)
assert.match(files["table.tsx"], /aria-label=\{scrollLabel\}/)
assert.doesNotMatch(files["button.tsx"], /min-h-0/)
assert.match(files["tabs.tsx"], /TabsPrimitive\.Trigger[\s\S]*?min-h-\[var\(--touch-target-min\)\]/)
assert.match(files["select.tsx"], /SelectPrimitive\.ScrollUpButton[\s\S]*?min-h-\[var\(--touch-target-min\)\]/)
assert.match(files["select.tsx"], /SelectPrimitive\.ScrollDownButton[\s\S]*?min-h-\[var\(--touch-target-min\)\]/)

for (const clientFile of ["select.tsx", "checkbox.tsx", "switch.tsx", "slider.tsx", "dialog.tsx", "sheet.tsx", "tooltip.tsx", "tabs.tsx"]) {
  assert.match(files[clientFile], /^"use client"\r?\n/, `${clientFile} must preserve its App Router client boundary`)
}

const checkboxRoot = files["checkbox.tsx"].match(/<CheckboxPrimitive\.Root[\s\S]*?>/)?.[0] ?? ""
const switchRoot = files["switch.tsx"].match(/<SwitchPrimitive\.Root[\s\S]*?>/)?.[0] ?? ""
assert.match(checkboxRoot, /size-\[var\(--touch-target-min\)\]/)
assert.match(switchRoot, /h-\[var\(--touch-target-min\)\]/)

// Regression guards for the GlobalVision UI-sweep upstream bug patches (v1.3.1).
assert.doesNotMatch(files["button.tsx"], /compact:\s*"[^"]*h-\[var\(--control-height-compact\)\] min-h-\[var\(--touch-target-min\)\]/, "button compact size must not flatten to a fixed 44px; use the max-md/pointer-coarse promotion pattern")
assert.match(files["button.tsx"], /max-md:min-h-\[var\(--touch-target-min\)\] pointer-coarse:min-h-\[var\(--touch-target-min\)\]/)
assert.doesNotMatch(files["checkbox.tsx"], /disabled:opacity-50/, "checkbox disabled state must use --interactive-disabled roles, not opacity")
assert.doesNotMatch(files["switch.tsx"], /disabled:opacity-50/, "switch disabled state must use --interactive-disabled roles, not opacity")
assert.doesNotMatch(files["dialog.tsx"], /bg-\[var\(--backdrop\)\] opacity-60/, "dialog overlay scrim alpha must ride on the color, not an opacity utility")
assert.match(files["dialog.tsx"], /bg-\[var\(--backdrop\)\]\/60/)

const sliderThumb = files["slider.tsx"].match(/<SliderPrimitive\.Thumb[\s\S]*?>/)?.[0] ?? ""
assert.match(sliderThumb, /size-\[var\(--touch-target-min\)\]/)

// Feedback floor (v1.5.0). Each of these is a shape that read fine in a diff
// and was still a dead control, so each gets a guard.
assert.match(files["button.tsx"], /pending\?: boolean/, "Button must expose a pending state; every consumer otherwise reinvents it")
assert.match(files["button.tsx"], /aria-busy=\{pending/, "a pending Button must report aria-busy")
assert.match(files["button.tsx"], /invisible inline-flex/, "a pending Button must keep its children in the layout, or the width jumps")
assert.match(files["spinner.tsx"], /motion-safe:animate-spin/, "the spinner must not animate under prefers-reduced-motion")
assert.match(files["skeleton.tsx"], /\[animation-duration:var\(--motion-duration-ambient\)\]/)
assert.match(files["pressable.tsx"], /active:scale-\[var\(--motion-press-scale-subtle\)\]/)

// The profile archetype (D-19, D-22, D-27): one padding variable, the scale as
// variables, figures through the numeric pair. Each resolves to a profile value.
for (const name of ["card.tsx", "dialog.tsx", "sheet.tsx"]) {
  assert.match(files[name], /p-\[var\(--surface-padding,/, `${name} must read its padding from --surface-padding`)
  assert.match(files[name], /text-\[length:var\(--text-h3\)\]/, `${name} title must use the type scale, not a fixed size`)
}
assert.doesNotMatch(Object.values(files).join("\n"), /--dialog-padding/, "--dialog-padding was renamed --surface-padding (Δ-11)")
assert.doesNotMatch(files["card.tsx"], /\bp-6\b/, "a fixed p-6 ignores the operations padding")
// D-28: table cells tighten vertically with the same variable; the 44px row floor stays.
const tableCell = files["table.tsx"].match(/const TableCell[\s\S]*?\n\)/)?.[0] ?? ""
assert.match(tableCell, /py-\[var\(--surface-padding,1rem\)\]/, "TableCell must read its vertical padding from --surface-padding")
assert.match(tableCell, /h-\[var\(--touch-target-min\)\]/, "TableCell keeps the 44px row floor")
assert.match(files["card.tsx"], /\[box-shadow:var\(--shadow-2\)\]/, "presentation cards float on --shadow-2 (D-27)")
assert.match(files["badge.tsx"], /whitespace-nowrap/, "a badge label wrapping inside its pill reads as broken")
const NUMERIC = /\[font-family:var\(--font-numeric\)\] \[font-variant-numeric:var\(--font-numeric-variant\)\]/
for (const name of ["metric-card.tsx", "progress-ring.tsx", "table.tsx"]) {
  assert.match(files[name], NUMERIC, `${name} must render figures through --font-numeric`)
  assert.doesNotMatch(files[name], /--font-data|\btabular-nums\b/, `${name} hard-codes one profile's figures`)
}
for (const name of ["badge.tsx", "app-shell.tsx"]) {
  assert.match(files[name], /\[font-variant-numeric:var\(--font-numeric-variant\)\]/, `${name} must align figures in operations`)
}

const core = registry.items.find((item) => item.name === "core")
assert.equal(core.type, "registry:item")
assert.equal(core.files.length, 26, "core must install the complete supported source set")

const outputDir = path.join(root, "public", "r")
assert.ok(fs.existsSync(outputDir), "public/r must contain committed registry output")
assert.equal(fs.readdirSync(outputDir).filter((file) => file.endsWith(".json")).length, requiredItems.length + 1)

for (const item of registry.items) {
  const outputPath = path.join(outputDir, `${item.name}.json`)
  assert.ok(fs.existsSync(outputPath), `built item is missing: ${item.name}.json`)
  const output = JSON.parse(fs.readFileSync(outputPath, "utf8"))
  assert.equal(output.$schema, "https://ui.shadcn.com/schema/registry-item.json")
  for (const file of output.files ?? []) {
    // autocrlf checks sources out as CRLF on Windows; which ending the build
    // embedded depends on the machine that ran it, so compare content, not bytes.
    const lf = (text) => text.replace(/\r\n/g, "\n")
    assert.equal(lf(file.content), lf(fs.readFileSync(path.join(root, file.path), "utf8")), `${item.name} output is stale: ${file.path}`)
  }
}

console.log(`registry contract passed for ${registry.items.length} items`)
