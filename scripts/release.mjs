import { readFileSync, writeFileSync, mkdirSync, cpSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';

const ROOT = new URL('../', import.meta.url);
const bumpType = process.argv[2];
const description = process.argv.slice(3).join(' ');

if (!['patch', 'minor', 'major'].includes(bumpType) || !description) {
  console.error('Usage: npm run release -- <patch|minor|major> "one-line description of what changed"');
  process.exit(1);
}

const pkgPath = new URL('package.json', ROOT);
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const [major, minor, patch] = pkg.version.split('.').map(Number);
const next =
  bumpType === 'major' ? `${major + 1}.0.0`
  : bumpType === 'minor' ? `${major}.${minor + 1}.0`
  : `${major}.${minor}.${patch + 1}`;

pkg.version = next;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

execSync('node scripts/build.mjs', { stdio: 'inherit', cwd: ROOT });

const historyDir = new URL(`history/v${next}/`, ROOT);
mkdirSync(historyDir, { recursive: true });
cpSync(new URL('dist/tokens.css', ROOT), new URL('tokens.css', historyDir));

const changelogPath = new URL('CHANGELOG.md', ROOT);
const changelog = readFileSync(changelogPath, 'utf8');
const date = new Date().toISOString().slice(0, 10);
const entry = `## ${next} (${date})\n\n${description}\n\n`;
writeFileSync(changelogPath, changelog.replace(/^(# Changelog\n\n)/, `$1${entry}`));

const historyRoot = new URL('history/', ROOT);
const versions = readdirSync(historyRoot)
  .filter((d) => /^v\d+\.\d+\.\d+$/.test(d))
  .sort((a, b) => {
    const pa = a.slice(1).split('.').map(Number);
    const pb = b.slice(1).split('.').map(Number);
    for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pb[i] - pa[i];
    return 0;
  });
// A plain <script src> (not fetch/XHR) so the showcase page still works when
// opened directly via file:// - browsers block fetch() of local files under
// file://, but a script tag loads fine. Same class of bug as the earlier
// absolute-vs-relative tokens.css import; not repeating it here.
writeFileSync(new URL('showcase/versions.js', ROOT), `window.UD_VERSIONS = ${JSON.stringify(versions)};\n`);

console.log(`Released v${next}. Snapshot written to history/v${next}/tokens.css.`);
