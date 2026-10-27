import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import test from "node:test"

import {
  assertPackageLockVersion,
  assertReleaseTags,
  assertTaggedPackageVersion,
  nextVersion,
  pinReadme,
  prependChangelog,
  readmePins,
} from "../scripts/release-utils.mjs"

test("calculates an additive minor release", () => {
  assert.equal(nextVersion("1.2.0", "minor"), "1.3.0")
})

test("rejects release when the current version has no Git tag", () => {
  assert.throws(
    () => assertReleaseTags({ currentVersion: "1.2.0", nextVersion: "1.3.0", tags: ["v1.1.0"] }),
    /current version v1\.2\.0 is not tagged/i,
  )
})

test("rejects release when the next version tag already exists", () => {
  assert.throws(
    () =>
      assertReleaseTags({
        currentVersion: "1.2.0",
        nextVersion: "1.3.0",
        tags: ["v1.2.0", "v1.3.0"],
      }),
    /next version v1\.3\.0 is already tagged/i,
  )
})

test("accepts a tagged current version and unused next version", () => {
  assert.doesNotThrow(() =>
    assertReleaseTags({ currentVersion: "1.2.0", nextVersion: "1.3.0", tags: ["v1.2.0"] }),
  )
})

test("prepends a release entry to a valid changelog", () => {
  assert.equal(
    prependChangelog("# Changelog\n\n## 1.2.0 (2026-07-14)\n", {
      version: "1.3.0",
      date: "2026-07-15",
      description: "Expanded semantic coverage.",
    }),
    "# Changelog\n\n## 1.3.0 (2026-07-15)\n\nExpanded semantic coverage.\n\n## 1.2.0 (2026-07-14)\n",
  )
})

test("preserves CRLF changelog line endings", () => {
  assert.equal(
    prependChangelog("# Changelog\r\n\r\n## 1.2.0 (2026-07-14)\r\n", {
      version: "1.3.0",
      date: "2026-07-15",
      description: "Expanded semantic coverage.",
    }),
    "# Changelog\r\n\r\n## 1.3.0 (2026-07-15)\r\n\r\nExpanded semantic coverage.\r\n\r\n## 1.2.0 (2026-07-14)\r\n",
  )
})

test("rejects a changelog with an invalid header or duplicate release", () => {
  assert.throws(
    () => prependChangelog("Changelog\n", { version: "1.3.0", date: "2026-07-15", description: "Release" }),
    /canonical header/i,
  )
  assert.throws(
    () =>
      prependChangelog("# Changelog\n\n## 1.3.0 (2026-07-15)\n", {
        version: "1.3.0",
        date: "2026-07-15",
        description: "Release",
      }),
    /already contains 1\.3\.0/i,
  )
})

test("verifies package-lock root version matches the release", () => {
  assert.doesNotThrow(() => assertPackageLockVersion({ version: "1.3.0", packages: { "": { version: "1.3.0" } } }, "1.3.0"))
  assert.throws(
    () => assertPackageLockVersion({ version: "1.2.0", packages: { "": { version: "1.2.0" } } }, "1.3.0"),
    /package-lock version/i,
  )
})

test("verifies the current tag contains the current package version", () => {
  assert.doesNotThrow(() => assertTaggedPackageVersion({ version: "1.2.0" }, "1.2.0"))
  assert.throws(() => assertTaggedPackageVersion({ version: "1.1.0" }, "1.2.0"), /tagged package version/i)
})

test("README install pins match the package version", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"))
  const pins = readmePins(readFileSync("README.md", "utf8"))
  assert.ok(pins.length >= 4, `expected the four install pins, found ${pins.length}`)
  assert.deepEqual([...new Set(pins)], [pkg.version], "README.md installs a version other than the one in package.json")
})

// A version with no tag yet is a release being prepared: the tag waits for the merge, and a fix that
// lands before it must leave the snapshot equal to the build the tag will carry.
test("an untagged version's history snapshot is this build's tokens", (t) => {
  const { version } = JSON.parse(readFileSync("package.json", "utf8"))
  if (execFileSync("git", ["tag", "--list", `v${version}`], { encoding: "utf8" }).trim()) {
    t.skip(`v${version} is tagged: its snapshot is history`)
    return
  }
  for (const file of ["tokens.css", "tokens-functional.css"]) {
    assert.equal(
      readFileSync(`history/v${version}/${file}`, "utf8"),
      readFileSync(`dist/${file}`, "utf8"),
      `history/v${version}/${file} is not dist/${file}; copy the build over it`,
    )
  }
})

test("pinReadme rewrites every pin and nothing else", () => {
  const before = "## What ships in 1.3.0\n#v1.3.0\n/v1.3.0/public\nshadcn@3.5.0"
  assert.equal(pinReadme(before, "2.0.0"), "## What ships in 2.0.0\n#v2.0.0\n/v2.0.0/public\nshadcn@3.5.0")
})

test("the package ships AGENTS.md", () => {
  assert.ok(JSON.parse(readFileSync("package.json", "utf8")).files.includes("AGENTS.md"))
})
