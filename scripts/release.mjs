import { readFileSync, writeFileSync, mkdirSync, cpSync, readdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const ROOT = new URL('../', import.meta.url);
const bumpType = process.argv[2];
const description = process.argv.slice(3).join(' ');

if (!['patch', 'minor', 'major'].includes(bumpType) || !description) {
  console.error('Usage: npm run release -- <patch|minor|major> "one-line description of what changed"');
  process.exit(1);
}

console.log('Running release pre-flight checks...');

// 1. Run design linter
try {
  console.log('Verifying DESIGN.md compliance...');
  execSync('node scripts/lint-design.mjs', { stdio: 'inherit', cwd: ROOT });
} catch (err) {
  console.error('\nPre-flight check FAILED: Design linter has errors. Fix them in DESIGN.md before releasing.');
  process.exit(1);
}

// 2. Run token builder to ensure style-dictionary compiles
try {
  console.log('Building design tokens...');
  execSync('node scripts/build.mjs', { stdio: 'inherit', cwd: ROOT });
} catch (err) {
  console.error('\nPre-flight check FAILED: Token builder failed to compile tokens.');
  process.exit(1);
}

// 3. Run showcase compiler check and build
try {
  console.log('Verifying showcase app compilation...');
  execSync('npm run build-showcase', { stdio: 'inherit', cwd: ROOT });
} catch (err) {
  console.error('\nPre-flight check FAILED: Showcase compilation or build failed. Check showcase React/TypeScript code.');
  process.exit(1);
}

console.log('All pre-flight checks PASSED. Proceeding with release version bump...');

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
if (existsSync(new URL('dist/tokens-functional.css', ROOT))) {
  cpSync(new URL('dist/tokens-functional.css', ROOT), new URL('tokens-functional.css', historyDir));
}

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
writeFileSync(new URL('showcase/public/versions.js', ROOT), `window.UD_VERSIONS = ${JSON.stringify(versions)};\n`);

console.log(`Released v${next}. Snapshot written to history/v${next}/tokens.css.`);
