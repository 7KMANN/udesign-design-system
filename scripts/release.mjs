import { readFileSync, writeFileSync, mkdirSync, cpSync, readdirSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { execSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import {
  assertPackageLockVersion,
  assertReleaseTags,
  assertTaggedPackageVersion,
  nextVersion,
  prependChangelog,
} from './release-utils.mjs';

const ROOT = new URL('../', import.meta.url);
const bumpType = process.argv[2];
const description = process.argv.slice(3).join(' ');

if (!['patch', 'minor', 'major'].includes(bumpType) || !description) {
  console.error('Usage: npm run release -- <patch|minor|major> "one-line description of what changed"');
  process.exit(1);
}

const pkgPath = new URL('package.json', ROOT);
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const next = nextVersion(pkg.version, bumpType);
const tags = execSync('git tag --list', { cwd: ROOT, encoding: 'utf8' })
  .split(/\r?\n/)
  .filter(Boolean);

try {
  assertReleaseTags({ currentVersion: pkg.version, nextVersion: next, tags });
} catch (error) {
  console.error(`Release pre-flight FAILED: ${error.message}`);
  process.exit(1);
}

const status = execSync('git status --porcelain', { cwd: ROOT, encoding: 'utf8' }).trim();
if (status) {
  console.error('Release pre-flight FAILED: commit or discard working-tree changes before releasing.');
  process.exit(1);
}

try {
  execSync(`git merge-base --is-ancestor v${pkg.version} HEAD`, { cwd: ROOT, stdio: 'ignore' });
  const taggedPackage = JSON.parse(execSync(`git show v${pkg.version}:package.json`, { cwd: ROOT, encoding: 'utf8' }));
  assertTaggedPackageVersion(taggedPackage, pkg.version);
} catch {
  console.error(`Release pre-flight FAILED: v${pkg.version} is not a valid ${pkg.version} release ancestor.`);
  process.exit(1);
}

try {
  const remoteNextTag = execSync(`git ls-remote --tags origin refs/tags/v${next}`, { cwd: ROOT, encoding: 'utf8' }).trim();
  if (remoteNextTag) {
    console.error(`Release pre-flight FAILED: origin already contains v${next}.`);
    process.exit(1);
  }
} catch (error) {
  console.error(`Release pre-flight FAILED: could not verify v${next} on origin.`);
  process.exit(1);
}

const generatedDirectories = [
  { source: 'dist/', backup: 'dist' },
  { source: 'public/r/', backup: 'public-r' },
  { source: 'dist-showcase/', backup: 'dist-showcase' },
];
const generatedBackup = mkdtempSync(path.join(os.tmpdir(), 'udesign-release-'));
for (const directory of generatedDirectories) {
  const source = new URL(directory.source, ROOT);
  if (existsSync(source)) cpSync(source, path.join(generatedBackup, directory.backup), { recursive: true });
}

console.log('Running complete release validation from clean generated output...');
try {
  for (const directory of generatedDirectories) {
    rmSync(new URL(directory.source, ROOT), { recursive: true, force: true });
  }
  execSync('npm run validate', { stdio: 'inherit', cwd: ROOT });
} catch {
  for (const directory of generatedDirectories) {
    const source = new URL(directory.source, ROOT);
    const backup = path.join(generatedBackup, directory.backup);
    rmSync(source, { recursive: true, force: true });
    if (existsSync(backup)) cpSync(backup, source, { recursive: true });
  }
  rmSync(generatedBackup, { recursive: true, force: true });
  console.error('\nRelease pre-flight FAILED. Fix validation errors before releasing.');
  process.exit(1);
}
rmSync(generatedBackup, { recursive: true, force: true });

console.log('All release checks passed. Proceeding with version bump...');
const packageLockPath = new URL('package-lock.json', ROOT);
const changelogPath = new URL('CHANGELOG.md', ROOT);
const versionsPath = new URL('showcase/public/versions.js', ROOT);
const historyDir = new URL(`history/v${next}/`, ROOT);
const backups = new Map([
  [pkgPath, readFileSync(pkgPath)],
  [packageLockPath, readFileSync(packageLockPath)],
  [changelogPath, readFileSync(changelogPath)],
  [versionsPath, readFileSync(versionsPath)],
]);

try {
  pkg.version = next;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  execSync('npm install --package-lock-only --ignore-scripts --no-audit --no-fund', { stdio: 'inherit', cwd: ROOT });
  assertPackageLockVersion(JSON.parse(readFileSync(packageLockPath, 'utf8')), next);

  mkdirSync(historyDir, { recursive: true });
  cpSync(new URL('dist/tokens.css', ROOT), new URL('tokens.css', historyDir));
  if (existsSync(new URL('dist/tokens-functional.css', ROOT))) {
    cpSync(new URL('dist/tokens-functional.css', ROOT), new URL('tokens-functional.css', historyDir));
  }

  const changelog = readFileSync(changelogPath, 'utf8');
  const date = new Date().toISOString().slice(0, 10);
  writeFileSync(changelogPath, prependChangelog(changelog, { version: next, date, description }));

  const updatedChangelog = readFileSync(changelogPath, 'utf8').replaceAll('\r\n', '\n');
  if (!updatedChangelog.startsWith(`# Changelog\n\n## ${next} (${date})\n\n${description}\n\n`)) {
    throw new Error(`Release failed to add the ${next} changelog entry.`);
  }

  const historyRoot = new URL('history/', ROOT);
  const versions = readdirSync(historyRoot)
    .filter((d) => /^v\d+\.\d+\.\d+$/.test(d))
    .sort((a, b) => {
      const pa = a.slice(1).split('.').map(Number);
      const pb = b.slice(1).split('.').map(Number);
      for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pb[i] - pa[i];
      return 0;
    });
  writeFileSync(versionsPath, `window.UD_VERSIONS = ${JSON.stringify(versions)};\n`);

  for (const artifact of ['dist/tokens.css', 'dist/tokens-functional.css', 'public/r/core.json', `history/v${next}/tokens.css`]) {
    if (!existsSync(new URL(artifact, ROOT))) throw new Error(`Release artifact missing: ${artifact}`);
  }

  console.log(`Released v${next}. Snapshot written to history/v${next}/tokens.css.`);
} catch (error) {
  for (const [file, content] of backups) writeFileSync(file, content);
  rmSync(historyDir, { recursive: true, force: true });
  console.error(`Release failed and was rolled back: ${error.message}`);
  process.exit(1);
}
