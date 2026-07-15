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
let server
const expectedFiles = [
  "button",
  "badge",
  "alert",
  "card",
  "input",
  "textarea",
  "select",
  "checkbox",
  "switch",
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
]

try {
  fs.mkdirSync(path.join(fixture, "app"), { recursive: true })
  fs.writeFileSync(path.join(fixture, "app", "globals.css"), '@import "tailwindcss";\n')
  fs.writeFileSync(
    path.join(fixture, "package.json"),
    JSON.stringify({ name: "udesign-registry-fixture", private: true, version: "0.0.0" }, null, 2),
  )
  fs.writeFileSync(
    path.join(fixture, "tsconfig.json"),
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
    path.join(fixture, "components.json"),
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
        registries: {},
      },
      null,
      2,
    ),
  )

  server = http.createServer((request, response) => {
    if (request.url !== "/core.json") {
      response.writeHead(404).end()
      return
    }

    response.writeHead(200, { "content-type": "application/json" })
    fs.createReadStream(path.join(root, "public", "r", "core.json")).pipe(response)
  })
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
  const address = server.address()
  assert.ok(address && typeof address === "object", "registry test server did not bind")

  const componentsPath = path.join(fixture, "components.json")
  const componentsConfig = JSON.parse(fs.readFileSync(componentsPath, "utf8"))
  componentsConfig.registries = { "@udesign": `http://127.0.0.1:${address.port}/{name}.json` }
  fs.writeFileSync(componentsPath, JSON.stringify(componentsConfig, null, 2))

  const installResult = await execFileAsync(
    process.execPath,
    [path.join(root, "node_modules", "shadcn", "dist", "index.js"), "add", "@udesign/core", "--cwd", fixture, "--yes", "--overwrite"],
    { cwd: root },
  )
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

  console.log(`clean registry install passed in ${fixture}`)
} finally {
  if (server) {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())))
  }
  const resolvedFixture = path.resolve(fixture)
  const resolvedTemp = path.resolve(os.tmpdir())
  if (!resolvedFixture.startsWith(`${resolvedTemp}${path.sep}`)) {
    throw new Error(`Refusing to remove non-temporary fixture: ${resolvedFixture}`)
  }
  fs.rmSync(resolvedFixture, { recursive: true, force: true })
}
