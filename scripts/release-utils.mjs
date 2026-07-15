export function nextVersion(version, bumpType) {
  const parts = version.split(".").map(Number)
  if (parts.length !== 3 || parts.some(Number.isNaN)) throw new Error(`Invalid version: ${version}`)

  const [major, minor, patch] = parts
  if (bumpType === "major") return `${major + 1}.0.0`
  if (bumpType === "minor") return `${major}.${minor + 1}.0`
  if (bumpType === "patch") return `${major}.${minor}.${patch + 1}`
  throw new Error(`Invalid bump type: ${bumpType}`)
}

export function assertReleaseTags({ currentVersion, nextVersion: upcomingVersion, tags }) {
  const currentTag = `v${currentVersion}`
  const nextTag = `v${upcomingVersion}`

  if (!tags.includes(currentTag)) {
    throw new Error(`Current version ${currentTag} is not tagged.`)
  }
  if (tags.includes(nextTag)) {
    throw new Error(`Next version ${nextTag} is already tagged.`)
  }
}

export function prependChangelog(changelog, { version, date, description }) {
  const newline = changelog.includes("\r\n") ? "\r\n" : "\n"
  const header = `# Changelog${newline}${newline}`
  if (!changelog.startsWith(header)) {
    throw new Error("CHANGELOG.md must start with the canonical header.")
  }
  if (new RegExp(`^## ${version.replaceAll(".", "\\.")} \\(`, "m").test(changelog)) {
    throw new Error(`CHANGELOG.md already contains ${version}.`)
  }

  const entry = `## ${version} (${date})${newline}${newline}${description}${newline}${newline}`
  return `${header}${entry}${changelog.slice(header.length)}`
}

export function assertPackageLockVersion(packageLock, version) {
  if (packageLock.version !== version || packageLock.packages?.[""]?.version !== version) {
    throw new Error(`package-lock version does not match ${version}.`)
  }
}

export function assertTaggedPackageVersion(taggedPackage, version) {
  if (taggedPackage.version !== version) {
    throw new Error(`Tagged package version does not match ${version}.`)
  }
}
