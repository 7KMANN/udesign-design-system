import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

execFileSync(process.execPath, ['scripts/build.mjs'], {
  cwd: root,
  stdio: 'pipe',
});

const dualCss = fs.readFileSync(path.join(root, 'dist/tokens.css'), 'utf8');
const functionalCss = fs.readFileSync(path.join(root, 'dist/tokens-functional.css'), 'utf8');
const baseTokens = JSON.parse(fs.readFileSync(path.join(root, 'tokens/udesign.tokens.json'), 'utf8'));
const functionalTokens = JSON.parse(fs.readFileSync(path.join(root, 'tokens/functional.tokens.json'), 'utf8'));

function deepMerge(base, override) {
  if (!override || typeof override !== 'object' || Array.isArray(override)) return override ?? base;
  const result = { ...base };
  for (const [key, value] of Object.entries(override)) {
    result[key] = value && typeof value === 'object' && !Array.isArray(value) && !('$value' in value)
      ? deepMerge(base?.[key] ?? {}, value)
      : value;
  }
  return result;
}

function getPath(tree, dotted) {
  return dotted.split('.').reduce((node, key) => node?.[key], tree);
}

function collectReferences(value, references = []) {
  if (typeof value === 'string') {
    for (const match of value.matchAll(/\{([^{}]+)\}/g)) references.push(match[1]);
  } else if (Array.isArray(value)) {
    for (const item of value) collectReferences(item, references);
  } else if (value && typeof value === 'object') {
    for (const item of Object.values(value)) collectReferences(item, references);
  }
  return references;
}

function assertReferencesResolve(tree, label) {
  for (const reference of collectReferences(tree)) {
    assert.ok(getPath(tree, reference)?.$value !== undefined, `${label} has unresolved reference {${reference}}`);
  }
}

const semanticVariables = [
  '--popover', '--popover-foreground', '--backdrop', '--accent', '--accent-foreground',
  '--input', '--destructive-foreground', '--sidebar', '--sidebar-foreground',
  '--sidebar-primary', '--sidebar-primary-foreground', '--sidebar-accent',
  '--sidebar-accent-foreground', '--sidebar-border', '--sidebar-ring', '--border',
  '--font-body', '--font-display', '--font-data',
  ...['neutral', 'info', 'success', 'warning', 'danger', 'progress', 'brand']
    .flatMap((tone) => ['foreground', 'surface', 'border', 'solid', 'solid-foreground']
      .map((role) => `--tone-${tone}-${role}`)),
  ...['positive', 'negative', 'neutral'].flatMap((metric) => ['foreground', 'surface', 'border']
    .map((role) => `--metric-${metric}-${role}`)),
  ...Array.from({ length: 8 }, (_, index) => `--data-${index + 1}`),
  '--data-muted', '--data-grid', '--data-axis', '--data-tooltip', '--data-tooltip-foreground',
  ...Array.from({ length: 4 }, (_, index) => ['foreground', 'surface', 'border', 'solid']
    .map((role) => `--entity-${index + 1}-${role}`)).flat(),
  '--interactive-hover', '--interactive-pressed', '--interactive-selected',
  '--interactive-selected-foreground', '--interactive-selected-border', '--interactive-focus',
  '--interactive-disabled', '--interactive-disabled-foreground',
  '--surface-raised', '--surface-raised-foreground', '--surface-sunken',
  '--surface-sunken-foreground', '--surface-overlay', '--surface-overlay-foreground',
  '--surface-console', '--surface-console-foreground',
  '--touch-target-min', '--control-height', '--control-height-compact', '--content-gutter-mobile',
  '--dialog-inline-size-mobile', '--dialog-block-size-max', '--safe-area-bottom',
];

const legacyVariables = [
  '--ud-accent-wash', '--ud-accent-300', '--ud-accent-400', '--ud-accent',
  '--ud-accent-deep', '--ud-cream', '--ud-ink', '--ud-white', '--ud-panel',
  '--ud-panel-2', '--ud-border', '--ud-border-strong', '--ud-muted',
  '--ud-muted-soft', '--ud-success', '--ud-success-bg', '--ud-warning',
  '--ud-warning-bg', '--ud-danger', '--ud-danger-bg', '--border-color',
];

function assertVariables(css, variables) {
  for (const variable of variables) {
    assert.match(css, new RegExp(`\\s${variable.replaceAll('-', '\\-')}:`), `missing ${variable}`);
  }
}

test('preserves every legacy CSS variable', () => {
  assertVariables(dualCss, legacyVariables);
});

test('emits the complete semantic vocabulary in the dual build', () => {
  assertVariables(dualCss, semanticVariables);
});

test('emits the complete semantic vocabulary in the functional-only build', () => {
  assertVariables(functionalCss, semanticVariables);
});

test('emits composable brand and functional dark selectors', () => {
  assert.match(dualCss, /:root\[data-theme="dark"\],\s*\.dark/);
  assert.match(dualCss, /:root\[data-design="functional"\]\[data-theme="dark"\]/);
  assert.match(dualCss, /:root\[data-design="functional"\]\.dark/);
  assert.match(dualCss, /\.dark \.design-functional/);
});

test('emits the responsive contract with mobile-safe values', () => {
  assert.match(dualCss, /--touch-target-min:\s*44px/);
  assert.match(dualCss, /--control-height:\s*44px/);
  assert.match(dualCss, /--dialog-inline-size-mobile:\s*95vw/);
  assert.match(dualCss, /--dialog-block-size-max:\s*100svh/);
  assert.match(dualCss, /--safe-area-bottom:\s*env\(safe-area-inset-bottom, 0px\)/);
});

test('emits functional typography helpers in the combined stylesheet', () => {
  assert.match(
    dualCss,
    /:root\[data-design="functional"\] \.ud-display,[^{]*\.design-functional \.ud-display\{[^}]*font-size:2\.5rem/,
  );
  assert.match(
    dualCss,
    /:root\[data-design="functional"\] \.ud-body,[^{]*\.design-functional \.ud-body\{[^}]*font-size:0\.875rem/,
  );
});

test('resolves every token reference in every profile', () => {
  const functionalLight = deepMerge(baseTokens, functionalTokens);
  for (const [label, tree] of [
    ['brand light', baseTokens],
    ['brand dark', deepMerge(baseTokens, baseTokens.dark)],
    ['functional light', functionalLight],
    ['functional dark', deepMerge(functionalLight, deepMerge(baseTokens.dark, functionalTokens.dark))],
  ]) assertReferencesResolve(tree, label);
});

test('generates token CSS deterministically', () => {
  execFileSync(process.execPath, ['scripts/build.mjs'], { cwd: root, stdio: 'pipe' });
  assert.equal(fs.readFileSync(path.join(root, 'dist/tokens.css'), 'utf8'), dualCss);
  assert.equal(fs.readFileSync(path.join(root, 'dist/tokens-functional.css'), 'utf8'), functionalCss);
});
