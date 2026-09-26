// Guards S1 Item 1.11: scripts/lint-design.mjs's em-dash scan was widened
// from "DESIGN.md only" to every instruction file plus every registry
// component. This test does not re-run the lint itself (see
// tests/token-contract.test.mjs and `npm run lint:design` for that); it
// asserts the scan's own file-list logic cannot silently shrink back to the
// narrower scope without a test failing here first.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { collectEmDashScanTargets, collectRegistrySourceFiles, EM_DASH_INSTRUCTION_FILES } from '../scripts/lint-design.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('the em-dash instruction-file list still names AGENTS.md and DESIGN.md', () => {
  assert.ok(EM_DASH_INSTRUCTION_FILES.includes('AGENTS.md'), 'AGENTS.md must stay in scope, even while it is mid-rewrite');
  assert.ok(EM_DASH_INSTRUCTION_FILES.includes('DESIGN.md'), 'DESIGN.md must stay in scope - the original, narrower behavior');
});

test('the em-dash instruction-file list does not reach into docs/', () => {
  // docs/ is a deliberate exclusion (a research record that keeps historical
  // em-dashes on purpose), not an oversight - guard against it being added.
  for (const relPath of EM_DASH_INSTRUCTION_FILES) {
    assert.ok(!relPath.startsWith('docs/'), `${relPath} should not be in the instruction-file list; docs/ is out of scope`);
  }
});

test('collectRegistrySourceFiles finds at least one real .tsx component under registry/', () => {
  const files = collectRegistrySourceFiles(root);
  assert.ok(files.length > 0, 'expected at least one registry component file');
  assert.ok(files.includes('registry/new-york/ui/button.tsx'), 'expected button.tsx to be found under registry/');
  for (const relPath of files) {
    assert.match(relPath, /\.tsx?$/, `${relPath} is not a .ts/.tsx file`);
  }
});

test('collectEmDashScanTargets resolves to existing files only, and includes both an instruction file and a registry component', () => {
  const targets = collectEmDashScanTargets(root);
  assert.ok(targets.includes('AGENTS.md'), 'AGENTS.md must be part of the resolved scan targets');
  assert.ok(
    targets.some((relPath) => relPath.startsWith('registry/') && /\.tsx?$/.test(relPath)),
    'expected at least one registry component in the resolved scan targets',
  );
  for (const relPath of targets) {
    assert.ok(fs.existsSync(path.join(root, relPath)), `${relPath} was returned but does not exist on disk`);
  }
});
