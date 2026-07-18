# Agent Instructions — udesign-design-system

Read this before making any change or running any script in this repo. It is the canonical
cross-tool instruction file (the emerging `AGENTS.md` standard most coding agents read
automatically). `.cursorrules` and `.gemini/rules` point here for tool-specific pickup;
edit pitfalls in this file only, not in those.

For style and token rules, read [DESIGN.md](DESIGN.md) and the "Rules for contributors
and agents" section of [README.md](README.md). This file covers operational pitfalls in
the repo's own tooling — things that will not show up by reading the source.

## Known pitfalls

### 1. `npm run release` can fail at the very last step on mixed line endings

**Symptom:** the full `validate` pipeline passes (build, DESIGN.md lint, registry build,
39 contract tests including WCAG AA, typecheck, component tests, clean-app registry
install, showcase build, Playwright e2e — all green) and then the release still fails with:

```
Release failed and was rolled back: CHANGELOG.md must start with the canonical header.
```

**Root cause:** this repo has `core.autocrlf=true` and no `.gitattributes`. Git checks
text files out with CRLF locally but stores them as LF. `scripts/release-utils.mjs`
(`prependChangelog`) detects the file's newline style with
`changelog.includes("\r\n") ? "\r\n" : "\n"` and then asserts the file starts with
`# Changelog<newline><newline>` using that exact detected style. If `CHANGELOG.md` (or
any other hand-maintained file this script touches) has **mixed** endings — some lines
LF, some CRLF — the detection picks CRLF (because it only checks for presence, not
uniformity) but the actual header bytes may be LF, and the assertion fails.

This happens whenever an agent or editor hand-edits `CHANGELOG.md` (e.g. reconstructing
missing historical entries) and writes LF-only content into a file Git checked out as
CRLF. `git status` will show the file as clean/unmodified under `autocrlf`, because
autocrlf normalizes for the *comparison* — it does not fix the bytes on disk. The mixed
state is invisible until this byte-exact assertion runs, which is the last step of a
~2-minute pipeline.

**Fix:** if `CHANGELOG.md` was hand-edited and the release fails this way, check what Git
considers canonical before touching anything else:

```bash
git show HEAD:CHANGELOG.md | node -e "..."   # confirm HEAD's own newline style first
git status --short CHANGELOG.md              # confirm no *other* pending edits you'd lose
git checkout -- CHANGELOG.md                  # restores Git's own canonical checkout
```

`git checkout --` is safe and sufficient when the file's content is already correct and
only the line endings are inconsistent — it does not touch content, only re-checks-out
the bytes Git already has recorded. Do not blanket-normalize to LF; check `HEAD`'s actual
stored encoding first, since the fix must match what's committed, not an assumption.

**Permanent fix (not yet applied, flagged for whoever picks this up):** add a
`.gitattributes` pinning text files to one line-ending convention (e.g.
`* text=auto eol=lf`) so this class of bug becomes impossible rather than something to
catch at release time.

### 2. This is a general risk, not unique to `CHANGELOG.md`

Any script in this repo that does byte-exact or newline-sensitive parsing of a
hand-maintained file (not just `prependChangelog`) is exposed to the same failure mode
under `autocrlf=true` + no `.gitattributes`. If a future release-pipeline failure looks
like a formatting/assertion error rather than an actual logic or content bug, check line
endings on the file in question before debugging the script itself.

### 3. Downstream consumers (e.g. GlobalVision)

GlobalVision pins this package via a Git tag (`github:7KMANN/udesign-design-system#vX.Y.Z`)
and installs it with plain `npm install`. That command does **not** re-resolve an
already-locked Git dependency to a new tag — if you bump the pin in `package.json` but
`npm install` reports "up to date" with the old commit still in the lockfile, force it
explicitly:

```bash
npm install "udesign-design-system@github:7KMANN/udesign-design-system#vX.Y.Z"
```

Verify with `require('./node_modules/udesign-design-system/package.json').version` and
the `resolved` commit in `package-lock.json` — both should match the new tag before you
trust the install.
