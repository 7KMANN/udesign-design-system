import fs from "node:fs"
import path from "node:path"

function stripInlineComment(line) {
  let quote = null

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]

    if ((character === '"' || character === "'") && line[index - 1] !== "\\") {
      quote = quote === character ? null : quote ?? character
      continue
    }

    if (character === "#" && quote === null && /\s/.test(line[index - 1] ?? "")) {
      return line.slice(0, index).trimEnd()
    }
  }

  return line.trimEnd()
}

function parseYamlMapping(yamlSource) {
  const root = {}
  const stack = [{ indent: -1, value: root }]

  for (const sourceLine of yamlSource.split(/\r?\n/)) {
    const line = stripInlineComment(sourceLine)
    if (!line.trim() || line.trimStart().startsWith("#")) continue

    const indent = line.search(/\S/)
    const trimmed = line.trim()
    const colonIndex = trimmed.indexOf(":")
    if (colonIndex === -1) continue

    const key = trimmed.slice(0, colonIndex).trim()
    const rawValue = trimmed.slice(colonIndex + 1).trim()

    while (stack.length > 1 && stack.at(-1).indent >= indent) stack.pop()
    const parent = stack.at(-1).value

    if (!rawValue) {
      parent[key] = {}
      stack.push({ indent, value: parent[key] })
      continue
    }

    const quoted =
      (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
      (rawValue.startsWith("'") && rawValue.endsWith("'"))
    parent[key] = quoted ? rawValue.slice(1, -1) : rawValue
  }

  return root
}

export function parseFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) throw new Error("Missing YAML frontmatter")

  return {
    metadata: parseYamlMapping(match[1]),
    prose: source.slice(match[0].length),
  }
}

// The em-dash ban covers every instruction file and all component source.
// docs/ is left out on purpose: it is the research record, not instructions.
const EM_DASH_FILES = ["AGENTS.md", "DESIGN.md", "README.md", "HANDOFF.md", "CHANGELOG.md", ".cursorrules", ".gemini/rules"]

export function emDashScanTargets(root) {
  const registry = fs.readdirSync(path.join(root, "registry"), { recursive: true })
    .filter((file) => /\.tsx?$/.test(file))
    .map((file) => `registry/${file.split(path.sep).join("/")}`)
  return [...EM_DASH_FILES.filter((file) => fs.existsSync(path.join(root, file))), ...registry]
}
