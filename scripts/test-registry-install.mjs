import assert from "node:assert/strict"
import { execFile } from "node:child_process"
import fs from "node:fs"
import http from "node:http"
import os from "node:os"
import path from "node:path"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)

const root = process.cwd()
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "udesign-registry-"))
// A second application that never configures the @udesign namespace.
const bare = fs.mkdtempSync(path.join(os.tmpdir(), "udesign-registry-bare-"))
let server
const served = new Set()
const asked = []
let elsewhere = () => ""
const expectedFiles = [
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
  "spinner",
  "skeleton",
  "pressable",
]

const shadcn = (args, env = {}) =>
  execFileAsync(process.execPath, [path.join(root, "node_modules", "shadcn", "dist", "index.js"), ...args], {
    cwd: root,
    env: { ...process.env, ...env },
  })

function application(directory, registries) {
  fs.mkdirSync(path.join(directory, "app"), { recursive: true })
  fs.writeFileSync(path.join(directory, "app", "globals.css"), '@import "tailwindcss";\n')
  fs.writeFileSync(
    path.join(directory, "package.json"),
    JSON.stringify({ name: "udesign-registry-fixture", private: true, version: "0.0.0" }, null, 2),
  )
  fs.writeFileSync(
    path.join(directory, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          baseUrl: ".",
          jsx: "react-jsx",
          paths: { "@/*": ["./*"] },
        },
      },
      null,
      2,
    ),
  )
  fs.writeFileSync(
    path.join(directory, "components.json"),
    JSON.stringify(
      {
        $schema: "https://ui.shadcn.com/schema.json",
        style: "new-york",
        rsc: true,
        tsx: true,
        tailwind: { config: "", css: "app/globals.css", baseColor: "neutral", cssVariables: true, prefix: "" },
        aliases: {
          components: "@/components",
          utils: "@/lib/utils",
          ui: "@/components/ui",
          lib: "@/lib",
          hooks: "@/hooks",
        },
        registries,
      },
      null,
      2,
    ),
  )
}

// Line endings are a checkout setting, not a release difference.
const text = (file) => fs.readFileSync(file, "utf8").replaceAll("\r\n", "\n")

try {
  // Every item this release builds, as a consumer's @udesign namespace would serve it.
  server = http.createServer((request, response) => {
    asked.push(request.url ?? "")
    // Stand-ins for shadcn's public directory of registries, so no run reaches the live one: one
    // lists no @udesign, the other lists one at a registry that holds nothing.
    const directory = { "/registries.json": {}, "/listed/registries.json": { "@udesign": elsewhere() } }[request.url ?? ""]
    if (directory) {
      response.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(directory))
      return
    }
    const item = /^\/([a-z-]+)\.json$/.exec(request.url ?? "")?.[1]
    const file = item && path.join(root, "public", "r", `${item}.json`)
    if (!file || !fs.existsSync(file)) {
      response.writeHead(404).end()
      return
    }

    served.add(item)
    response.writeHead(200, { "content-type": "application/json" })
    fs.createReadStream(file).pipe(response)
  })
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
  const address = server.address()
  assert.ok(address && typeof address === "object", "registry test server did not bind")
  const registry = `http://127.0.0.1:${address.port}`
  elsewhere = () => `${registry}/elsewhere/{name}.json`

  application(fixture, { "@udesign": `${registry}/{name}.json` })
  application(bare, {})

  const installResult = await shadcn(["add", "@udesign/core", "--cwd", fixture, "--yes", "--overwrite"])
  if (installResult.stdout) process.stdout.write(installResult.stdout)
  if (installResult.stderr) process.stderr.write(installResult.stderr)

  const installedPaths = fs.readdirSync(fixture, { recursive: true }).map(String)

  for (const component of expectedFiles) {
    assert.ok(
      fs.existsSync(path.join(fixture, "components", "ui", `${component}.tsx`)),
      `clean install omitted ${component}.tsx; installed: ${installedPaths.join(", ")}`,
    )
  }

  const installedPackage = JSON.parse(fs.readFileSync(path.join(fixture, "package.json"), "utf8"))
  for (const dependency of [
    "@radix-ui/react-checkbox",
    "@radix-ui/react-dialog",
    "@radix-ui/react-select",
    "@radix-ui/react-slot",
    "@radix-ui/react-switch",
    "@radix-ui/react-tabs",
    "@radix-ui/react-tooltip",
    "lucide-react",
  ]) {
    assert.ok(installedPackage.dependencies?.[dependency], `clean install omitted ${dependency}`)
  }

  // Items that use another item, added one by one over the badge, button and card core just wrote.
  // Each dependency resolves through this application's @udesign namespace, so every file on disk
  // stays this release's, even when the add overwrites (review I3: they were pinned to v1.3.0).
  const release = (file) => text(path.join(root, "registry", "new-york", "ui", file))
  const installed = (file) => text(path.join(fixture, "components", "ui", file))
  for (const [item, uses] of [
    ["alert", ["badge"]],
    ["icon-button", ["button", "spinner"]],
    ["metric-card", ["card"]],
  ]) {
    served.clear()
    await shadcn(["add", `@udesign/${item}`, "--cwd", fixture, "--yes", "--overwrite"])
    for (const dependency of uses) {
      assert.ok(served.has(dependency), `adding @udesign/${item} did not resolve ${dependency} through the namespace; served: ${[...served].join(", ")}`)
    }
    for (const file of ["badge.tsx", "button.tsx", "spinner.tsx", "card.tsx", `${item}.tsx`]) {
      assert.equal(installed(file), release(file), `adding @udesign/${item} left a ${file} from another release`)
    }
  }

  // Without the namespace, an item that uses another makes shadcn look @udesign up in its public
  // directory of registries, here a stand-in (REGISTRY_URL), so the runs are offline and the same each
  // time. The README's install section says both outcomes.
  const output = (error) => `${error.stdout}${error.stderr}`
  // A directory that lists none: the install stops before writing a file, and names the namespace.
  await assert.rejects(
    shadcn(["add", `${registry}/alert.json`, "--cwd", bare, "--yes"], { REGISTRY_URL: registry }),
    (error) => /Unknown registry "@udesign"/.test(output(error)),
    "an unconfigured @udesign must stop the install and name the namespace",
  )
  assert.ok(!fs.existsSync(path.join(bare, "components")), "a stopped install must not write a file")
  // A directory that lists one, whoever runs it: shadcn writes it into components.json and asks it for
  // the item's badge. This one holds nothing, so the install stops after the write.
  asked.length = 0
  await assert.rejects(shadcn(["add", `${registry}/alert.json`, "--cwd", bare, "--yes"], { REGISTRY_URL: `${registry}/listed` }))
  const written = JSON.parse(fs.readFileSync(path.join(bare, "components.json"), "utf8"))
  assert.equal(written.registries?.["@udesign"], elsewhere(), "shadcn writes the directory's @udesign into components.json")
  assert.ok(asked.includes("/elsewhere/badge.json"), `the badge must be asked of the directory's registry; asked: ${asked.join(", ")}`)
  assert.ok(!fs.existsSync(path.join(bare, "components")), "a stopped install must not write a file")

  // The gallery: two files into components/ui, its import of the core rewritten to the alias,
  // and the Swiper release it was built on.
  const galleryResult = await shadcn(["add", "@udesign/gallery", "--cwd", fixture, "--yes", "--overwrite"])
  if (galleryResult.stderr) process.stderr.write(galleryResult.stderr)
  for (const file of ["gallery.tsx", "gallery-core.ts"]) {
    assert.ok(fs.existsSync(path.join(fixture, "components", "ui", file)), `the gallery install omitted ${file}`)
  }
  assert.ok(fs.readFileSync(path.join(fixture, "components", "ui", "gallery.tsx"), "utf8").includes('from "@/components/ui/gallery-core"'), "the gallery must import its core through the ui alias")
  const withGallery = JSON.parse(fs.readFileSync(path.join(fixture, "package.json"), "utf8"))
  assert.match(withGallery.dependencies?.swiper ?? "", /^\^?14\.3\.0$/, `the gallery install must add swiper 14.3.0, got ${withGallery.dependencies?.swiper}`)

  console.log(`clean registry install passed in ${fixture}`)
} finally {
  if (server) {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())))
  }
  const resolvedTemp = path.resolve(os.tmpdir())
  for (const directory of [fixture, bare]) {
    const resolved = path.resolve(directory)
    if (!resolved.startsWith(`${resolvedTemp}${path.sep}`)) {
      throw new Error(`Refusing to remove non-temporary fixture: ${resolved}`)
    }
    fs.rmSync(resolved, { recursive: true, force: true })
  }
}
