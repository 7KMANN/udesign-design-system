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
  "native-select",
  "choice-group",
  "checkbox",
  "switch",
  "slider",
  "field",
  "description-list",
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
  "gallery",
  "progress-ring",
  "rolling-consistency-chip",
  "moment",
  "spinner",
  "skeleton",
  "pressable",
  "page-canvas",
  "lockup",
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

const logoTile = "#c79f6b"
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
    // D-62: the logo is one image, so its tile colour is the image's own, written once in lockup.tsx. Nothing else may write a hex.
    const colourSource = file.path.endsWith("/lockup.tsx") ? source.replaceAll(logoTile, "") : source
    assert.doesNotMatch(colourSource, rawColorPattern, `${file.path} contains a raw color utility or literal`)
    assert.doesNotMatch(source, primitivePattern, `${file.path} consumes a forbidden UDesign primitive`)
    assert.doesNotMatch(source, rawShadowPattern, `${file.path} contains a raw elevation utility`)
    assert.doesNotMatch(source, radiusAliasPattern, `${file.path} uses a Tailwind radius alias; use rounded-[var(--radius*)]`)
    // Tailwind 3 reads shadow-[var(...)] as a shadow colour, so no elevation renders.
    assert.doesNotMatch(source, /\bshadow-\[var\(/, `${file.path} uses shadow-[var(...)]; use [box-shadow:var(--shadow-N)]`)
    assert.doesNotMatch(source, unmappedSemanticUtilityPattern, `${file.path} relies on an uninstalled Tailwind theme alias`)
    assert.match(file.target, /^components\/ui\//, `${file.path} must install under components/ui`)
  }
}

// Review I3: an item that uses another names it as @udesign/<name>, so shadcn takes it from the
// release the consumer's namespace points at. A URL here pins one release for good: six did, to
// v1.3.0 through v1.5.0, and adding alert over a current badge put the v1.3.0 badge back.
const itemNames = new Set(registry.items.map((item) => item.name))
for (const item of registry.items) {
  const own = new Set(item.files.map((file) => path.basename(file.path).replace(/\.tsx?$/, "")))
  const named = new Set()
  for (const dependency of item.registryDependencies ?? []) {
    if (dependency === "utils") continue
    const name = /^@udesign\/([a-z-]+)$/.exec(dependency)?.[1]
    assert.ok(name && itemNames.has(name), `${item.name} depends on ${dependency}; name another item as @udesign/<name>`)
    named.add(name)
  }
  for (const file of item.files) {
    const source = fs.readFileSync(path.join(root, file.path), "utf8")
    for (const [, used] of source.matchAll(/from "@\/components\/ui\/([a-z-]+)"/g)) {
      assert.ok(own.has(used) || named.has(used), `${item.name} imports ${used} without naming @udesign/${used}`)
    }
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

for (const clientFile of ["select.tsx", "choice-group.tsx", "gallery.tsx", "checkbox.tsx", "switch.tsx", "slider.tsx", "dialog.tsx", "sheet.tsx", "tooltip.tsx", "tabs.tsx"]) {
  assert.match(files[clientFile], /^"use client"\r?\n/, `${clientFile} must preserve its App Router client boundary`)
}

// Review M7: a reference screen is copied into App Router apps as is, so one that holds state or a
// handler declares the client boundary as its first statement, after its header comments.
for (const example of fs.readdirSync(path.join(root, "examples")).filter((f) => f.endsWith(".tsx"))) {
  const source = fs.readFileSync(path.join(root, "examples", example), "utf8")
  if (!/\buse(?:State|Effect|LayoutEffect|Reducer|Ref)\(|\son[A-Z]\w*=\{/.test(source)) continue
  const first = source.replace(/^(?:\s*\/\/[^\n]*\n|\s*\/\*[\s\S]*?\*\/)*/, "").trimStart()
  assert.ok(first.startsWith('"use client"'), `examples/${example} holds state or a handler, so its first statement must be "use client"`)
}

const checkboxRoot = files["checkbox.tsx"].match(/<CheckboxPrimitive\.Root[\s\S]*?>/)?.[0] ?? ""
const switchRoot = files["switch.tsx"].match(/<SwitchPrimitive\.Root[\s\S]*?>/)?.[0] ?? ""
assert.match(checkboxRoot, /size-\[var\(--touch-target-min\)\]/)
assert.match(switchRoot, /h-\[var\(--touch-target-min\)\]/)

// Regression guards for the GlobalVision UI-sweep upstream bug patches (v1.3.1).
assert.doesNotMatch(files["button.tsx"], /compact:\s*"[^"]*h-\[var\(--control-height-compact\)\] min-h-\[var\(--touch-target-min\)\]/, "button compact size must not flatten to a fixed 44px; use the max-md/pointer:coarse promotion pattern")
// An arbitrary media variant, not `pointer-coarse:`: Tailwind 3 has no pointer variants and drops it.
assert.match(files["button.tsx"], /max-md:min-h-\[var\(--touch-target-min\)\] \[@media\(pointer:coarse\)\]:min-h-\[var\(--touch-target-min\)\]/)
assert.match(files["app-shell.tsx"], /md:\[@media\(pointer:fine\)\]:\[&>\*\]:\[--touch-target-min:var\(--control-height-compact\)\]/)
assert.doesNotMatch(files["checkbox.tsx"], /disabled:opacity-50/, "checkbox disabled state must use --interactive-disabled roles, not opacity")
assert.doesNotMatch(files["switch.tsx"], /disabled:opacity-50/, "switch disabled state must use --interactive-disabled roles, not opacity")
assert.doesNotMatch(files["dialog.tsx"], /bg-\[var\(--backdrop\)\] opacity-60/, "dialog overlay scrim alpha must ride on the color, not an opacity utility")
assert.match(files["dialog.tsx"], /bg-\[var\(--backdrop\)\]\/60/)

// native-select (ban 9 allows a native control inside components/ui): the platform's
// select, so nothing on <body> changes when it opens. It needs no client boundary.
assert.match(files["native-select.tsx"], /<select\b/, "native-select must render the platform's select")
assert.doesNotMatch(files["native-select.tsx"], /@radix-ui|"use client"/, "native-select must stay a plain native control")
assert.match(files["native-select.tsx"], /appearance-none/, "native-select draws its own chevron in place of the platform's")
assert.match(files["native-select.tsx"], /text-base[^"]*md:text-sm/, "native-select stays 16px below md, or iOS zooms the page on focus")
// Every field answers aria-invalid with the same boundary (contrast.test.mjs measures it).
for (const name of ["input.tsx", "textarea.tsx", "select.tsx", "native-select.tsx"]) {
  assert.match(files[name], /aria-\[invalid=true\]:border-\[var\(--tone-danger-foreground\)\]/, `${name} must mark an invalid field`)
}

// D-45: dist/tokens.css registers --removed-body-scroll-bar-size as non-inherited, which is
// safe only while no component reads it below <body>, where it is now 0px.
assert.doesNotMatch(Object.values(files).join("\n"), /removed-body-scroll-bar-size/, "a registry component reads --removed-body-scroll-bar-size, which does not inherit below <body>")

// D-49: one choice shown as buttons. A radio group with one Tab stop whose arrow keys stop at
// the group, and explicit columns that the stylesheet's container queries lay out.
assert.match(files["choice-group.tsx"], /role="radiogroup"/)
assert.match(files["choice-group.tsx"], /role="radio"/)
assert.match(files["choice-group.tsx"], /event\.stopPropagation\(\)/, "the group must stop the arrow keys it handles")
assert.match(files["choice-group.tsx"], /tabIndex=\{choice\.value === stop \? 0 : -1\}/, "one Tab stop per group")
assert.match(files["choice-group.tsx"], /aria-describedby=/, "the note is tied to the group")
assert.match(files["choice-group.tsx"], /--choice-columns-/, "the group writes its columns for the stylesheet's container queries")

// D-50: a header's title and description sit --space-2 apart, a spacing role (they were 6px).
for (const [file, part] of [["dialog.tsx", "DialogHeader"], ["sheet.tsx", "SheetHeader"], ["card.tsx", "CardHeader"]]) {
  const header = files[file].match(new RegExp(`const ${part} = [\\s\\S]*?cn\\("([^"]*)"`))?.[1] ?? ""
  assert.match(header, /(?<![\w.-])gap-2(?![\w.-])/, `${part} must space its title and description on --space-2`)
  assert.doesNotMatch(header, /gap-1\.5/, `${part} spaces off the roles`)
}

// D-54, D-55: one gallery for React and static pages. The React Gallery wears the static skin and
// shares its behaviour with dist/ud-gallery.js through gallery-core.ts; Swiper's keyboard stays off.
const gallery = registry.items.find((item) => item.name === "gallery")
assert.deepEqual(gallery.dependencies, ["swiper@14.3.0"], "the gallery pins the Swiper release UDesign Pages vendors")
assert.ok(!registry.items.find((item) => item.name === "core").files.some((f) => f.path.includes("gallery")), "core stays free of swiper")
assert.ok(files["gallery.tsx"].includes('from "@/components/ui/gallery-core"'), "the React Gallery runs the shared core")
assert.ok(files["gallery.tsx"].includes('className={cn("ud-gallery", className)}'), "the React Gallery wears the static skin")
assert.ok(files["gallery-core.ts"].includes("keyboard: { enabled: false }"), "Swiper's own keyboard moves every gallery on screen")
assert.doesNotMatch(files["gallery-core.ts"], /from "react"|import (?!type )[^\n]*from "swiper/, "the core is shared with the plain-JS build: no React, no Swiper code")

const sliderThumb = files["slider.tsx"].match(/<SliderPrimitive\.Thumb[\s\S]*?>/)?.[0] ?? ""
assert.match(sliderThumb, /size-\[var\(--touch-target-min\)\]/)

// Feedback floor (v1.5.0). Each of these is a shape that read fine in a diff
// and was still a dead control, so each gets a guard.
assert.match(files["button.tsx"], /pending\?: boolean/, "Button must expose a pending state; every consumer otherwise reinvents it")
assert.match(files["button.tsx"], /aria-busy=\{pending/, "a pending Button must report aria-busy")
assert.match(files["button.tsx"], /className="inline-flex items-center gap-2 opacity-0"/, "a pending Button must keep its children in the layout, or the width jumps")
assert.doesNotMatch(files["button.tsx"], /className="[^"]*\binvisible\b/, "a pending label hidden with visibility leaves the button with no accessible name")
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
assert.match(files["card.tsx"], /\[box-shadow:var\(--shadow-2\)\]/, "presentation cards float on --shadow-2 (D-27)")
assert.match(files["badge.tsx"], /: "whitespace-nowrap leading-none"/, "a badge holds one line by default: a status breaking in two in a table column reads as broken")
// D-47: asked, a long label wraps inside its container instead of running past its edge (ban 29).
assert.match(files["badge.tsx"], /wrap\?: boolean/)
assert.match(files["badge.tsx"], /wrap \? "max-w-full whitespace-normal[^"]*\[overflow-wrap:anywhere\]"/, "a wrapping badge must stay inside its container")
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
assert.equal(core.files.length, 30, "core must install the complete supported source set")

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
