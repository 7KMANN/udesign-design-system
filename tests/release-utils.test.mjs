import assert from "node:assert/strict"
import test from "node:test"

import {
  assertPackageLockVersion,
  assertReleaseTags,
  assertTaggedPackageVersion,
  nextVersion,
  prependChangelog,
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
