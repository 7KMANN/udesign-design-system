import assert from "node:assert/strict"
import test from "node:test"

import { parseFrontmatter } from "../scripts/design-utils.mjs"

test("parses inline YAML comments with CRLF line endings", () => {
  const source = [
    "---",
    "version: alpha",
    "colors:",
    "  primary: \"#c79f6b\" # UDesign accent",
    "---",
    "",
    "# Design",
  ].join("\r\n")

  const { metadata } = parseFrontmatter(source)

  assert.equal(metadata.colors.primary, "#c79f6b")
})

test("keeps hash characters inside quoted YAML values", () => {
  const source = [
    "---",
    "version: alpha",
    "colors:",
    "  primary: \"#c79f6b\"",
    "---",
  ].join("\n")

  const { metadata } = parseFrontmatter(source)

  assert.equal(metadata.colors.primary, "#c79f6b")
})
