# Tooling pitfalls

Read this when a script in this repo fails in a way that looks like formatting rather than logic.
These are gotchas the source will not show you.

## 1. `npm run release` can fail at the last step on mixed line endings

**Symptom:** the whole `validate` pipeline passes (build, `DESIGN.md` lint, registry build,
contract tests, typecheck, component tests, clean-app registry install, showcase build,
Playwright), and then the release fails with:

```
Release failed and was rolled back: CHANGELOG.md must start with the canonical header.
```

**Root cause:** this repo has `core.autocrlf=true` and no `.gitattributes`. Git checks text files
out with CRLF and stores them as LF. `prependChangelog` in `scripts/release-utils.mjs` detects the
newline style with `changelog.includes("\r\n") ? "\r\n" : "\n"` and then asserts the file starts
with `# Changelog<newline><newline>` in that style. A file with **mixed** endings (some lines LF,
some CRLF) makes the detection pick CRLF while the header bytes are LF, and the assertion fails.

It happens when an editor or agent writes LF content into a file Git checked out as CRLF.
`git status` still shows the file clean, because autocrlf normalizes for the comparison and does
not fix the bytes on disk. The mixed state stays invisible until this byte-exact assertion runs.

**Fix:** check what Git considers canonical before touching anything else.

```bash
git show HEAD:CHANGELOG.md | node -e "..."   # confirm HEAD's own newline style first
git status --short CHANGELOG.md              # confirm no other pending edits you would lose
git checkout -- CHANGELOG.md                  # restores Git's canonical checkout
```

`git checkout --` is safe when the content is already correct and only the endings are mixed: it
re-checks-out the bytes Git has recorded. Match what is committed, not an assumption, so check
`HEAD`'s stored encoding before normalizing anything.

**Permanent fix, not yet applied:** a `.gitattributes` pinning one convention (for example
`* text=auto eol=lf`) would make this class of bug impossible.

## 2. The same risk applies to any newline-sensitive script

Any script here that parses a hand-maintained file byte-exactly (not only `prependChangelog`, and
now also the README pin rewrite in `scripts/release.mjs`) is exposed to the same failure under
`autocrlf=true` with no `.gitattributes`. If a release failure looks like an assertion or format
error, check the file's line endings before debugging the script.

## 3. Downstream consumers do not re-resolve a locked Git tag

GlobalVision pins this package by Git tag (`github:7KMANN/udesign-design-system#vX.Y.Z`) and
installs with plain `npm install`. That does **not** re-resolve an already-locked Git dependency
to a new tag. If `npm install` reports "up to date" with the old commit still in the lockfile,
force it:

```bash
npm install "udesign-design-system@github:7KMANN/udesign-design-system#vX.Y.Z"
```

Verify with `require('./node_modules/udesign-design-system/package.json').version` and the
`resolved` commit in `package-lock.json`. Both should match the new tag before you trust the
install.
