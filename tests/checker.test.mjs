import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { PRESSED_CLASSES, check } from '../bin/rules.mjs';

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
    '<motion.div onClick={open} />',
  ].join('\n');
  assert.deepEqual(hits('a.tsx', tsx), ['div-onclick:1', 'div-onclick:7']);
});

test('raw-motion flags literal durations and easings in CSS', () => {
  const css = [
    '.a { transition: color 100ms ease; }',
    '.b { transition: color var(--motion-duration-fast) var(--motion-easing-standard); }',
    '.c { animation: spin 1s linear infinite; }',
    '.d { transition-timing-function: cubic-bezier(0.2, 0, 0, 1); }',
    '.e { transition-duration: 0ms; transition: opacity var(--motion-ease-out); }',
    '@theme { --animate-pop: pop 300ms ease-out; }',
    '@theme { --animate-spin: spin var(--motion-loop-spin) linear infinite; }',
  ].join('\n');
  assert.deepEqual(hits('a.css', css), ['raw-motion:6', 'raw-motion:1', 'raw-motion:3', 'raw-motion:4']);
});

test('raw-motion flags Tailwind duration and easing utilities, not the token forms', () => {
  const tsx = [
    '<div className="transition-colors duration-200 ease-out" />',
    '<div className="duration-[var(--motion-duration-fast)] ease-[var(--motion-easing-standard)]" />',
    '<div style={{ transitionDuration: "150ms" }} />',
    '<div className="delay-150" />',
    '<div className="duration-[250ms]" />',
    '<div className="delay-[var(--motion-delay-indicator)]" />',
  ].join('\n');
  assert.deepEqual(hits('a.tsx', tsx), ['raw-motion:1', 'raw-motion:4', 'raw-motion:5', 'raw-motion:3']);
});

test('raw-motion flags framer-motion literals, not a zero or a token read', () => {
  const tsx = [
    '<motion.div transition={{ duration: 0.3 }} />',
    '<motion.div transition={{ duration: 0 }} />',
    'const t = { transition: { ease: "easeOut" } }',
    '<motion.div transition={{ duration: seconds("--motion-duration-fast") }} />',
  ].join('\n');
  assert.deepEqual(hits('a.tsx', tsx), ['raw-motion:1', 'raw-motion:3']);
});

test('fill-as-text flags a fill role used as text, not its foreground pair or a fill', () => {
  const tsx = [
    '<p className="text-destructive">Échec</p>',
    '<p className="text-destructive-foreground bg-[var(--destructive)]">OK</p>',
    '<a className="text-[var(--primary)]">Lien</a>',
    '<p className="text-[var(--tone-danger-foreground)]">OK</p>',
    '<p style={{ color: "var(--muted)" }}>Note</p>',
  ].join('\n');
  assert.deepEqual(hits('a.tsx', tsx), ['fill-as-text:1', 'fill-as-text:3', 'fill-as-text:5']);
  const css = '.a { color: var(--muted); }\n.b { background-color: var(--muted); color: var(--muted-foreground); }';
  assert.deepEqual(hits('a.css', css), ['fill-as-text:1']);
});

test('toolbar-wrap flags a toolbar that wraps from md up, not one that wraps on phones', () => {
  const tsx = '<AppShellToolbar className="flex-wrap" />\n<AppShellToolbar className="max-md:flex-wrap" />\n<AppShellToolbar className="md:flex-wrap" />';
  assert.deepEqual(hits('a.tsx', tsx), ['toolbar-wrap:1', 'toolbar-wrap:3']);
});

test('press-missing flags a primitive with no active: treatment, only in a primitive folder', () => {
  const bare = 'export const X = () => <button className="px-2" />';
  assert.deepEqual(hits('components/ui/x.tsx', bare), ['press-missing:1']);
  assert.deepEqual(hits('app/page.tsx', bare), []);
  assert.deepEqual(hits('components/ui/y.tsx', '<button className="active:bg-[var(--interactive-pressed)]" />'), []);
  assert.deepEqual(hits('components/ui/z.tsx', '<span className="group-active:scale-95" /><SliderPrimitive.Thumb />'), []);
  assert.deepEqual(hits('components/ui/tooltip.tsx', '<TooltipPrimitive.Trigger {...props} />'), []);
  const borrowed = 'import { toggleVariants } from "@/components/ui/toggle"\n<ToggleGroupPrimitive.Item className={toggleVariants()} />';
  assert.deepEqual(hits('components/ui/toggle-group.tsx', borrowed), []);
  // The gallery's buttons wear the static skin, whose press dist/tokens.css carries.
  const skinned = '<div className={cn("ud-gallery", className)}>\n<button type="button" className="ud-gallery-thumb" />';
  assert.deepEqual(hits('components/ui/gallery.tsx', skinned), []);
  // Review M3: a static class with no press of its own lends none.
  assert.deepEqual(hits('components/ui/x.tsx', '<p className="ud-label">Taille</p>\n<button className="px-2" />'), ['press-missing:2']);
  assert.deepEqual(hits('components/ui/x.tsx', '<a className="ud-btn ud-btn-ghost" />\n<button className="px-2" />'), []);
});

// The classes that lend a press are the ones css/components.css gives an :active rule of their own
// (a variant such as ud-btn-primary rides on ud-btn): no more, no fewer.
test('press-missing lends a press only through the classes the stylesheet presses', () => {
  const css = fs.readFileSync(new URL('../css/components.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const pressed = new Set();
  for (const [, selectors] of css.matchAll(/([^{}]+)\{[^}]*\}/g)) {
    for (const selector of selectors.split(',')) {
      const subject = selector.trim().split(/\s+|>|\+|~/).filter(Boolean).at(-1) ?? '';
      if (!subject.includes(':active')) continue;
      const own = /^\.(ud-[\w-]+)/.exec(subject)?.[1];
      if (own) pressed.add(own);
    }
  }
  const covered = (cls) => PRESSED_CLASSES.some((listed) => cls === listed || cls.startsWith(`${listed}-`));
  assert.deepEqual([...pressed].filter((cls) => !covered(cls)), [], 'a class the stylesheet presses is missing from PRESSED_CLASSES');
  assert.deepEqual(PRESSED_CLASSES.filter((cls) => !pressed.has(cls)), [], 'PRESSED_CLASSES names a class the stylesheet does not press');
});

// Ban 33 (D-50): spacing off the roles, read in class strings. Calibrated on Boutique and
// GlobalVision (docs/checker-rules.md): a row keeps an icon's half step, an icon keeps its nudge.
test('spacing-role flags a gap, a stack or a margin off the spacing roles', () => {
  const tsx = [
    '<p className="mt-5 max-w-[52ch]">Texte</p>',
    '<div className="grid gap-8 md:grid-cols-[1fr_2fr] md:gap-12">',
    '<ol className="grid gap-5">',
    '<div className="space-y-1.5">',
    '<div className="grid gap-1.5"><label /><input /></div>',
    '<div className="flex flex-col gap-0.5">',
    '<div className="gap-[18px] grid">',
    '<p className="text-xs text-muted-foreground mt-0.5">Meta</p>',
    '<section className="mb-10">',
  ].join('\n');
  assert.deepEqual(hits('app/page.tsx', tsx), ['spacing-role:1', 'spacing-role:2', 'spacing-role:3', 'spacing-role:4', 'spacing-role:5', 'spacing-role:6', 'spacing-role:7', 'spacing-role:8', 'spacing-role:9']);
  const [finding] = check([{ file: 'app/page.tsx', text: '<div className="grid gap-8 md:gap-12" />' }]);
  assert.equal(finding.cite, 'ban 33');
  assert.match(finding.message, /`md:gap-12` is 48px/);
  const html = ['<div class="grid gap-5">', '<p>gap-5 in copy is not a class</p>', '</div>'].join('\n');
  assert.deepEqual(hits('a.html', html), ['spacing-role:1']);
});

test('spacing-role leaves the roles, alignment, geometry and the primitive folders alone', () => {
  const tsx = [
    '<div className="grid gap-1 gap-2 gap-3 gap-4 gap-6 gap-8 gap-0 space-y-4 mt-6 mb-8 m-0 mx-auto mt-auto gap-px">',
    '<span className="flex items-center gap-1.5"><Icon /> Label</span>',
    '<Info className="mt-0.5 size-4 shrink-0" />',
    '<Button className="-ml-2 -mt-2.5 gap-1.5">',
    '<Input className="pl-9 pr-14 py-2.5" />',
    '<ul className="list-disc pl-5">',
    '<div className="grid gap-[var(--space-4)] mt-[var(--surface-padding)] gap-x-1.5">',
    '<div className="flex flex-wrap gap-1.5">',
    '// mt-5 in a comment',
  ].join('\n');
  assert.deepEqual(hits('app/page.tsx', tsx), []);
  assert.deepEqual(hits('components/ui/dialog.tsx', '<div className="grid gap-5 mt-12" />'), []);
  assert.deepEqual(hits('registry/new-york/ui/x.tsx', '<div className="grid gap-5" />'), []);
  assert.deepEqual(hits('app/page.tsx', '<div className="grid gap-5" /> {/* design-ok: matches the print sheet */}'), []);
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
  assert.deepEqual(hits('b.ts', 'const a = "x \\u2014 y";\nconst b = `x \\u{2014} y`;'), ['em-dash:1', 'em-dash:2']);
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
