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

// Finds the {...} block immediately following a literal selector string,
// via brace-depth counting rather than a non-nested regex - the brand block
// carries a one-line comment with its own literal braces
// ("--client overrides per page: :root{ --client:#E23A2E }"), so a naive
// same-level capture stops short there.
function block(css, selectorText) {
  const idx = css.indexOf(selectorText);
  if (idx === -1) return null;
  const openIdx = css.indexOf('{', idx);
  if (openIdx === -1) return null;
  let depth = 1;
  let i = openIdx + 1;
  for (; i < css.length && depth > 0; i += 1) {
    if (css[i] === '{') depth += 1;
    else if (css[i] === '}') depth -= 1;
  }
  return css.slice(openIdx + 1, i - 1);
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

// Per block, not file-wide: a file-wide match is satisfied by the brand block
// alone, so a functional --control-height of 36px would pass unnoticed.
function assertTouchFloor(css) {
  const brand = block(css, ':root, :root[data-design="brand"]');
  const functional = block(css, ':root[data-design="functional"], .design-functional');
  assert.ok(brand && functional, 'profile blocks not found');
  for (const name of ['--touch-target-min', '--control-height']) {
    assert.match(brand, new RegExp(`${name}:\\s*44px`), `${name} must be 44px in the brand block`);
    for (const [label, body] of [['brand', brand], ['functional', functional]]) {
      for (const [, value] of body.matchAll(new RegExp(`${name}:\\s*([^;]+);`, 'g'))) {
        assert.equal(value.trim(), '44px', `${name} is ${value.trim()} in the ${label} block; the touch floor is 44px in both profiles`);
      }
    }
  }
}

test('holds the 44px touch floor in every profile block', () => {
  assertTouchFloor(dualCss);
  const functionalSelector = ':root[data-design="functional"], .design-functional {';
  const overridden = dualCss.replace(functionalSelector, `${functionalSelector}\n  --control-height: 36px;`);
  assert.notEqual(overridden, dualCss, 'mutation did not apply');
  assert.throws(() => assertTouchFloor(overridden), /36px in the functional block/);
});

test('emits the responsive contract with mobile-safe values', () => {
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

// --- Motion (B1/B2/B4) and gamification scoping (B3) ---
// See udesign-docs standards/design/udesign-contract.md "Motion" and
// globalvision's docs/adr/0001-0002.

test('motion is byte-identical in the brand and functional profile blocks', () => {
  const brand = block(dualCss, ':root, :root[data-design="brand"]');
  const functional = block(dualCss, ':root[data-design="functional"], .design-functional');
  assert.ok(brand, 'brand profile block not found');
  assert.ok(functional, 'functional profile block not found');
  // Derived, not listed: a hardcoded list silently stops covering any token
  // added after it was written, which is how a family drifts apart by profile.
  const names = [...new Set([...brand.matchAll(/(--motion-[a-z0-9-]+):/g)].map((m) => m[1]))];
  assert.ok(names.length >= 12, `expected the full motion family in the brand block, found ${names.length}`);
  for (const name of names) {
    const brandValue = brand.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1];
    const functionalValue = functional.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1];
    assert.ok(brandValue, `${name} missing from the brand block`);
    assert.equal(brandValue, functionalValue, `${name} diverges between brand and functional - B1 is wrong if this fails`);
  }
});

// The duration VOCABULARY is open: a component that needs an intent the system
// does not publish is the reason 22 of 24 components hardcoded their own values
// through v1.4.0. What is closed is the CEILING and the magnitude cap - see the
// contract's Motion section, which separates feedback presence from reaction
// magnitude. Do not re-freeze this to an exact set.
//
// 'ambient' and the loop family are continuous, non-interaction values: nobody
// waits on one period of a shimmer, so the interaction ceiling does not apply.
const INTERACTION_CEILING_MS = 400;
const NON_INTERACTION_DURATIONS = new Set(['ambient']);

test('every interaction duration stays at or under the ceiling', () => {
  for (const css of [dualCss, functionalCss]) {
    const durations = [...css.matchAll(/--motion-duration-([a-z0-9-]+):\s*(\d+)ms;/g)];
    assert.ok(durations.length > 0, 'no motion durations found');
    for (const [, intent, value] of durations) {
      if (NON_INTERACTION_DURATIONS.has(intent)) continue;
      assert.ok(
        Number(value) <= INTERACTION_CEILING_MS,
        `--motion-duration-${intent} is ${value}ms, past the ${INTERACTION_CEILING_MS}ms interaction ceiling`,
      );
    }
    assert.ok(
      durations.some(([, intent]) => intent === 'slow'),
      "'slow' is the named ceiling intent and must stay published",
    );
  }
});

test('the press family is published at bare :root, not behind data-game', () => {
  for (const css of [dualCss, functionalCss]) {
    for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      if (!/--motion-press-scale:/.test(body)) continue;
      assert.doesNotMatch(
        selector,
        /data-game/,
        'press feedback is the floor for every application, not a gamification opt-in',
      );
    }
    const scale = Number(css.match(/--motion-press-scale:\s*([\d.]+);/)?.[1]);
    assert.ok(scale > 0.9 && scale < 1, `press scale ${scale} is outside the bounded range`);
  }
});

test('gamification custom properties never appear unscoped - the mechanical half of ADR-0001', () => {
  for (const css of [dualCss, functionalCss]) {
    let found = false;
    for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      if (!/--moment-/.test(body)) continue;
      found = true;
      assert.match(selector, /data-game="on"/, `selector "${selector.trim()}" leaks a gamification token outside data-game="on"`);
    }
    assert.ok(found, 'expected at least one --moment- declaration to check');
  }
});

test('reduced motion zeroes duration and neutralizes moment scale by default', () => {
  for (const css of [dualCss, functionalCss]) {
    const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
    assert.notEqual(reduced.indexOf('@media'), -1, 'no prefers-reduced-motion block found');
    assert.match(reduced, /--motion-duration-fast:\s*0ms;/);
    assert.match(reduced, /--motion-duration-emphasis:\s*0ms;/);
    assert.match(reduced, /--motion-duration-ambient:\s*0ms;/);
    assert.match(reduced, /--motion-loop-spin:\s*0ms;/);
    assert.match(reduced, /--motion-press-scale:\s*1;/);
    assert.match(reduced, /--motion-press-scale-subtle:\s*1;/);
    assert.match(reduced, /--moment-intensity-1-scale:\s*1;/);
    assert.match(reduced, /--moment-intensity-2-scale:\s*1;/);
    // Feedback survives motion removal: the delay that suppresses a spinner
    // flash is not motion, and the pressed colour is not motion either.
    assert.doesNotMatch(reduced, /--motion-delay-indicator:/);
    assert.doesNotMatch(reduced, /--interactive-pressed:/);
    // Still scoped even inside the media query - see the prior test's guarantee.
    const gameRule = reduced.match(/:root\[data-game="on"\]\s*\{([^{}]*)\}/)?.[1];
    assert.ok(gameRule && /--moment-intensity-1-scale:\s*1;/.test(gameRule));
  }
});
