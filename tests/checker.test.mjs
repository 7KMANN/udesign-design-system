import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { check } from '../bin/rules.mjs';

// Each rule has a snippet that must be flagged and one that must pass (docs/checker-rules.md).
const hits = (file, text) => check([{ file, text }]).map((f) => `${f.rule}:${f.line}`);
const divergent = fs.readFileSync(new URL('./fixtures/catalog-divergent.html', import.meta.url), 'utf8');

test('accent-repeated flags the divergent catalog once, citing ban 26', () => {
  const found = check([{ file: 'catalog-divergent.html', text: divergent }]).filter((f) => f.rule === 'accent-repeated');
  assert.equal(found.length, 1);
  assert.match(found[0].cite, /ban 26/);
  assert.equal(found[0].line, divergent.split('\n').findIndex((l) => l.includes('ud-btn ud-btn-primary')) + 1);
});

test('accent-repeated passes the same catalog with its real secondary CTAs', () => {
  const real = divergent.replaceAll('class="ud-btn ud-btn-primary"', 'class="ud-btn ud-btn-secondary"');
  assert.deepEqual(hits('index.html', real).filter((h) => h.startsWith('accent-repeated')), []);
});

// S2's acceptance test (plan Phase 3): pages built only from the shipped component classes,
// one per profile, report nothing. The catalog is the same page the real ones fail on ban 19.
test('pages built from the shipped component classes report zero findings', () => {
  for (const name of ['catalog-components.html', 'app-shell-components.html']) {
    const text = fs.readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');
    assert.deepEqual(check([{ file: name, text }]), [], name);
  }
});

// Plan Phase 5: the reference screens an agent copies. Zero findings, and each spends exactly
// one accent-filled control: a Button with no variant or variant="default", or ud-btn-primary.
test('each reference screen in examples/ reports zero findings and spends one accent', () => {
  const dir = new URL('../examples/', import.meta.url);
  const names = fs.readdirSync(dir).filter((n) => /\.(tsx|html)$/.test(n));
  assert.deepEqual(names.sort(), ['operations-queue.tsx', 'presentation-order.tsx', 'static-catalog.html']);
  for (const name of names) {
    const text = fs.readFileSync(new URL(name, dir), 'utf8');
    assert.deepEqual(check([{ file: name, text }]), [], name);
    const accents = name.endsWith('.html')
      ? text.match(/class="[^"]*\bud-btn-primary\b/g) ?? []
      : (text.match(/<Button\b(?:=>|[^>])*>/g) ?? []).filter((tag) => !/variant="(?!default")/.test(tag));
    assert.equal(accents.length, 1, `${name}: ${accents.join(' | ')}`);
  }
});

test('accent-repeated passes one accent in the hero and one in the footer', () => {
  const html = '<main><section class="hero"><a class="ud-btn ud-btn-primary">Go</a></section></main>\n<footer><a class="ud-btn ud-btn-primary">Go</a></footer>';
  assert.deepEqual(hits('a.html', html), []);
});

test('accent-repeated flags an accent Button inside a .map, and passes secondary or unmapped ones', () => {
  const tsx = [
    '<Button>Save</Button>',
    '{rows.map((r) => (',
    '  <Card key={r.id}>',
    '    <Button onClick={() => open(r)}>Open</Button>',
    '    <Button variant="secondary">Edit</Button>',
    '  </Card>',
    '))}',
  ].join('\n');
  assert.deepEqual(hits('a.tsx', tsx), ['accent-repeated:4']);
});

test('div-onclick flags a clickable div, not a stopPropagation wrapper or a button', () => {
  const tsx = [
    '<div',
    '  className="card"',
    '  onClick={() => onRowClick(row)}',
    '>',
    '<div onClick={(e) => e.stopPropagation()}>',
    '<button onClick={save}>Save</button>',
  ].join('\n');
  assert.deepEqual(hits('a.tsx', tsx), ['div-onclick:1']);
});

test('raw-motion flags literal durations and easings in CSS', () => {
  const css = [
    '.a { transition: color 100ms ease; }',
    '.b { transition: color var(--motion-duration-fast) var(--motion-easing-standard); }',
    '.c { animation: spin 1s linear infinite; }',
    '.d { transition-timing-function: cubic-bezier(0.2, 0, 0, 1); }',
    '.e { transition-duration: 0ms; transition: opacity var(--motion-ease-out); }',
  ].join('\n');
  assert.deepEqual(hits('a.css', css), ['raw-motion:1', 'raw-motion:3', 'raw-motion:4']);
});

test('raw-motion flags Tailwind duration and easing utilities, not the token forms', () => {
  const tsx = [
    '<div className="transition-colors duration-200 ease-out" />',
    '<div className="duration-[var(--motion-duration-fast)] ease-[var(--motion-easing-standard)]" />',
    '<div style={{ transitionDuration: "150ms" }} />',
  ].join('\n');
  assert.deepEqual(hits('a.tsx', tsx), ['raw-motion:1', 'raw-motion:3']);
});

test('ud-primitive flags var(--ud-*) in consumer source but not in a synced copy of the tokens', () => {
  assert.deepEqual(hits('a.css', '.a { color: var(--ud-stone-9); }'), ['ud-primitive:1']);
  const tokens = '/*\n * UDesign design tokens (Dual Style: Brand & Functional). Compiled from DTCG sources.\n */\n:root { --card: var(--ud-cream); }';
  assert.deepEqual(hits('udesign-tokens.css', tokens), []);
});

test('em-dash flags interface copy, not comments', () => {
  const html = '<!-- a — b -->\n<style>/* a — b */</style>\n<p>Polos — T-Shirts</p>\n<p>Polos &mdash; T-Shirts</p>';
  assert.deepEqual(hits('a.html', html), ['em-dash:3', 'em-dash:4']);
  const tsx = '// fetches — no polling\n/* also — fine */\nconst msg = "Échec — réessayez";\n<p>A — B</p>';
  assert.deepEqual(hits('a.tsx', tsx), ['em-dash:3', 'em-dash:4']);
});

test('accent-colour-name flags an identifier or custom property named gold, not a product colour', () => {
  const tsx = 'const GOLD = "var(--primary)"\nconst colours = ["Athletic Gold"]\n// the gold ring marks wins';
  assert.deepEqual(hits('a.tsx', tsx), ['accent-colour-name:1']);
  assert.deepEqual(hits('a.css', ':root { --gold-deep: #000; }'), ['accent-colour-name:1']);
  assert.deepEqual(hits('a.html', '<p>Couleur : Gold</p>'), []);
});

test('profile-pin flags data-design off the root and runtime switching', () => {
  assert.deepEqual(hits('a.html', '<html data-design="presentation">\n<div data-design="operations"></div>'), ['profile-pin:2']);
  const tsx = [
    '<html lang="fr" data-design="operations">',
    '<section data-design="presentation">',
    'document.documentElement.dataset.design = next',
    'root.setAttribute("data-design", next)',
  ].join('\n');
  assert.deepEqual(hits('a.tsx', tsx).filter((h) => h.startsWith('profile-pin')), ['profile-pin:2', 'profile-pin:3', 'profile-pin:4']);
});

test('shell flags an operations document outside ud-app-shell and a presentation one inside it', () => {
  assert.deepEqual(hits('a.html', '<html data-design="operations">\n<body><div class="ud-app-shell"></div>'), []);
  assert.deepEqual(hits('a.html', '<html data-design="operations">\n<body><div class="x"></div>'), ['shell:1']);
  assert.deepEqual(hits('a.html', '<html data-design="presentation">\n<body><div class="ud-app-shell"></div>'), ['shell:2']);
  assert.deepEqual(hits('a.html', '<html data-design="presentation">\n<body><div class="ud-page-canvas"></div>'), []);
});

test('profile-pin flags the profile names removed in v3, which now match nothing', () => {
  assert.deepEqual(hits('a.html', '<html data-design="functional">\n<body><div class="ud-app-shell"></div>'), ['profile-pin:1']);
  assert.deepEqual(hits('a.html', '<html data-design="brand">\n<body><div class="ud-page-canvas"></div>'), ['profile-pin:1']);
  assert.deepEqual(hits('app/layout.tsx', '<html lang="fr" data-design="functional">\n<AppShell />'), ['profile-pin:1']);
});

test('shell looks across the whole React tree for AppShell', () => {
  const layout = { file: 'app/layout.tsx', text: '<html data-design="operations">' };
  const page = { file: 'app/page.tsx', text: 'return <AppShell>{children}</AppShell>' };
  assert.deepEqual(check([layout]).map((f) => `${f.rule}:${f.file}:${f.line}`), ['shell:app/layout.tsx:1']);
  assert.deepEqual(check([layout, page]), []);
  const brand = { file: 'app/layout.tsx', text: '<html data-design="presentation">' };
  assert.deepEqual(check([brand, page]).map((f) => `${f.rule}:${f.file}:${f.line}`), ['shell:app/page.tsx:1']);
});

test('design-ok: <reason> on the line or the line above suppresses a finding', () => {
  const css = '/* design-ok: third-party widget timing */\n.a { transition: color 100ms ease; }\n.b { transition: color 90ms ease; } /* design-ok: same */';
  assert.deepEqual(hits('a.css', css), []);
});

test('the bin prints file:line, the cite and the rule, and exits 1 on findings', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'udesign-check-'));
  fs.writeFileSync(path.join(dir, 'a.css'), '.a { transition: color 100ms ease; }\n');
  fs.mkdirSync(path.join(dir, 'node_modules'));
  fs.writeFileSync(path.join(dir, 'node_modules', 'b.css'), '.b { color: var(--ud-x); }\n');
  // Test data is not interface copy.
  fs.writeFileSync(path.join(dir, 'c.test.ts'), 'expect(label("Café — été")).toBe(0)\n');
  const bin = new URL('../bin/udesign-check.mjs', import.meta.url);
  const run = (target) => {
    try {
      return { code: 0, out: execFileSync(process.execPath, [fileURLToPath(bin), target], { encoding: 'utf8' }) };
    } catch (error) {
      return { code: error.status, out: error.stdout };
    }
  };
  const dirty = run(dir);
  assert.equal(dirty.code, 1);
  assert.match(dirty.out, /a\.css:1 {2}ban 19 {2}raw-motion {2}/);
  assert.doesNotMatch(dirty.out, /node_modules|c\.test\.ts/);
  fs.writeFileSync(path.join(dir, 'a.css'), '.a { transition: color var(--motion-duration-fast); }\n');
  assert.equal(run(dir).code, 0);
});
