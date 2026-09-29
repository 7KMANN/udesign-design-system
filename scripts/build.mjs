import StyleDictionary from 'style-dictionary';
import fs from 'fs';
import path from 'path';

// Maps token paths (dot-joined) to the exact CSS variable names this system
// has always used. Not a mechanical transform: some names are intentionally
// shorter than their path (color.accent.base -> --ud-accent) or renamed
// (role.border -> --border-color, to avoid colliding with the primitive
// concept "border"). Kept explicit so the compiled output is a byte-faithful
// successor to the hand-compiled CSS this package replaces.

const BRAND_VAR = {
  'color.accent.wash': '--ud-accent-wash',
  'color.accent.300': '--ud-accent-300',
  'color.accent.400': '--ud-accent-400',
  'color.accent.base': '--ud-accent',
  'color.accent.deep': '--ud-accent-deep',
  'color.accent.700': '--ud-accent-700',
  'color.cream': '--ud-cream',
  'color.ink': '--ud-ink',
  'color.white': '--ud-white',
};

const NEUTRAL_VAR = {
  'color.neutral.panel': '--ud-panel',
  'color.neutral.panel-2': '--ud-panel-2',
  'color.neutral.border': '--ud-border',
  'color.neutral.border-strong': '--ud-border-strong',
  'color.neutral.muted': '--ud-muted',
  'color.neutral.muted-soft': '--ud-muted-soft',
};

const STATUS_VAR = {
  'color.status.success': '--ud-success',
  'color.status.success-bg': '--ud-success-bg',
  'color.status.warning': '--ud-warning',
  'color.status.warning-bg': '--ud-warning-bg',
  'color.status.danger': '--ud-danger',
  'color.status.danger-bg': '--ud-danger-bg',
};

const ROLE_VAR = {
  background: '--background',
  foreground: '--foreground',
  card: '--card',
  'card-foreground': '--card-foreground',
  popover: '--popover',
  'popover-foreground': '--popover-foreground',
  backdrop: '--backdrop',
  primary: '--primary',
  'primary-foreground': '--primary-foreground',
  'primary-hover': '--primary-hover',
  secondary: '--secondary',
  'secondary-foreground': '--secondary-foreground',
  muted: '--muted',
  'muted-foreground': '--muted-foreground',
  accent: '--accent',
  'accent-foreground': '--accent-foreground',
  border: '--border-color',
  'border-strong': '--border-strong',
  input: '--input',
  ring: '--ring',
  destructive: '--destructive',
  'destructive-foreground': '--destructive-foreground',
  sidebar: '--sidebar',
  'sidebar-foreground': '--sidebar-foreground',
  'sidebar-primary': '--sidebar-primary',
  'sidebar-primary-foreground': '--sidebar-primary-foreground',
  'sidebar-accent': '--sidebar-accent',
  'sidebar-accent-foreground': '--sidebar-accent-foreground',
  'sidebar-border': '--sidebar-border',
  'sidebar-ring': '--sidebar-ring',
  highlight: '--highlight',
  'primary-text': '--primary-text',
  client: '--client',
};

const TONES = ['neutral', 'info', 'success', 'warning', 'danger', 'progress', 'brand'];
const TONE_ROLES = ['foreground', 'surface', 'border', 'solid', 'solid-foreground'];
const METRICS = ['positive', 'negative', 'neutral'];
const METRIC_ROLES = ['foreground', 'surface', 'border'];
const DATA_ROLES = ['1', '2', '3', '4', '5', '6', '7', '8', 'muted', 'grid', 'axis', 'tooltip', 'tooltip-foreground'];
const ENTITY_ROLES = ['foreground', 'surface', 'border', 'solid'];
const INTERACTION_ROLES = ['hover', 'pressed', 'selected', 'selected-foreground', 'selected-border', 'focus', 'disabled', 'disabled-foreground'];
const SURFACE_ROLES = ['raised', 'raised-foreground', 'sunken', 'sunken-foreground', 'overlay', 'overlay-foreground', 'console', 'console-foreground'];
const RESPONSIVE_VAR = {
  'touch-target-min': '--touch-target-min',
  'control-height': '--control-height',
  'control-height-compact': '--control-height-compact',
  'content-gutter-mobile': '--content-gutter-mobile',
  'dialog-inline-size-mobile': '--dialog-inline-size-mobile',
  'dialog-block-size-max': '--dialog-block-size-max',
  'safe-area-bottom': '--safe-area-bottom',
  'surface-padding': '--surface-padding',
};

const RADIUS_VAR = { sm: '--radius-sm', base: '--radius', lg: '--radius-lg', pill: '--radius-pill' };

// Motion: general-purpose, available at bare :root regardless of data-game -
// a loading spinner needs these as much as a gamification moment does.
const MOTION_DURATION_VAR = {
  instant: '--motion-duration-instant',
  fast: '--motion-duration-fast',
  standard: '--motion-duration-standard',
  emphasis: '--motion-duration-emphasis',
  slow: '--motion-duration-slow',
  ambient: '--motion-duration-ambient',
};
const MOTION_EASING_VAR = {
  standard: '--motion-easing-standard',
  fast: '--motion-easing-fast',
  enter: '--motion-easing-enter',
  exit: '--motion-easing-exit',
  emphasis: '--motion-easing-emphasis',
};
// Loop periods collapse under reduced motion the same way durations do.
const MOTION_LOOP_VAR = { spin: '--motion-loop-spin' };
// Press magnitude: a motion value, so it lives in this family and collapses to
// 1 under reduced motion. The pressed *color* is --interactive-pressed and does
// not collapse - that is what keeps the press legible without motion.
const MOTION_PRESS_VAR = { scale: '--motion-press-scale', 'scale-subtle': '--motion-press-scale-subtle' };
// Delay is deliberately absent from the reduced-motion collapse below: it
// suppresses a flash, it does not move anything.
const MOTION_DELAY_VAR = { indicator: '--motion-delay-indicator' };

// Moment: gamification-exclusive (ADR-0001). Compiled only under
// [data-game="on"], never at bare :root - see formatMomentBlock.
const MOMENT_VAR = { 'intensity-1-scale': '--moment-intensity-1-scale', 'intensity-2-scale': '--moment-intensity-2-scale' };

function getPath(tree, dotted) {
  if (!tree || !dotted) return undefined;
  return dotted.split('.').reduce((node, key) => node?.[key], tree);
}

function dim(d) {
  if (!d) return '0px';
  return `${d.value}${d.unit}`;
}

function rgba(color) {
  if (!color || !color.components) return 'rgba(0,0,0,0)';
  const [r, g, b] = color.components.map((c) => Math.round(c * 255));
  return `rgba(${r},${g},${b},${color.alpha})`;
}

function cubicBezierCss(v) {
  if (!Array.isArray(v) || v.length !== 4) return 'ease';
  return `cubic-bezier(${v.join(', ')})`;
}

// A token's $description as a trailing CSS comment. No `{`, `}`, `;`, or `*/`
// survive, so the contract tests' block() and value regexes still parse it.
function descriptionComment(token) {
  const description = token && token.$description;
  if (!description) return '';
  const safe = description
    .replace(/\*\//g, '* /')
    .replace(/[{}]/g, '')
    .replace(/;/g, ',');
  return ` /* ${safe} */`;
}

const GENERIC_FONT_KEYWORDS = new Set(['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui']);
function fontFamilyCss(list) {
  if (!list || !Array.isArray(list)) return 'sans-serif';
  return list.map((f) => (GENERIC_FONT_KEYWORDS.has(f) ? f : `'${f}'`)).join(', ');
}

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

function semanticEntries() {
  const entries = [];
  for (const [key, name] of Object.entries(ROLE_VAR)) entries.push([`role.${key}`, name]);
  for (const tone of TONES) {
    for (const role of TONE_ROLES) entries.push([`tone.${tone}.${role}`, `--tone-${tone}-${role}`]);
  }
  for (const metric of METRICS) {
    for (const role of METRIC_ROLES) entries.push([`metric.${metric}.${role}`, `--metric-${metric}-${role}`]);
  }
  for (const role of DATA_ROLES) entries.push([`data.${role}`, `--data-${role}`]);
  for (let entity = 1; entity <= 4; entity += 1) {
    for (const role of ENTITY_ROLES) entries.push([`entity.${entity}.${role}`, `--entity-${entity}-${role}`]);
  }
  for (const role of INTERACTION_ROLES) entries.push([`interactive.${role}`, `--interactive-${role}`]);
  for (const role of SURFACE_ROLES) entries.push([`surface.${role}`, `--surface-${role}`]);
  return entries;
}

const SEMANTIC_ENTRIES = semanticEntries();
const PATH_TO_VAR = Object.fromEntries([
  ...Object.entries(BRAND_VAR).map(([tokenPath, cssVar]) => [tokenPath, cssVar]),
  ...Object.entries(NEUTRAL_VAR).map(([tokenPath, cssVar]) => [tokenPath, cssVar]),
  ...Object.entries(STATUS_VAR).map(([tokenPath, cssVar]) => [tokenPath, cssVar]),
  ...SEMANTIC_ENTRIES,
]);

function cssTokenValue(token) {
  if (!token || token.$value === undefined) return undefined;
  const value = token.$value;
  if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
    const referencedVariable = PATH_TO_VAR[value.slice(1, -1)];
    if (referencedVariable) return `var(${referencedVariable})`;
  }
  return value?.hex || value;
}

// Semantic families that surface $description (motion is emitted separately).
// ponytail: tone and interactive carry no per-token descriptions yet, so this emits nothing until one is written.
const DESCRIPTION_COMMENT_PREFIXES = ['tone.', 'interactive.'];

function formatSemanticGroups(t) {
  const lines = ['  /* Semantic roles */'];
  for (const [tokenPath, cssVariable] of SEMANTIC_ENTRIES) {
    const token = getPath(t, tokenPath);
    const value = cssTokenValue(token);
    if (value !== undefined) {
      const comment = DESCRIPTION_COMMENT_PREFIXES.some((prefix) => tokenPath.startsWith(prefix))
        ? descriptionComment(token)
        : '';
      lines.push(`  ${cssVariable}: ${value};${comment}`);
    }
    if (tokenPath === 'role.border' && value !== undefined) lines.push('  --border: var(--border-color);');
  }
  return lines.join('\n');
}

function formatResponsive(t) {
  const lines = ['  /* Responsive contracts */'];
  for (const [key, cssVariable] of Object.entries(RESPONSIVE_VAR)) {
    const token = t.responsive?.[key];
    if (!token || token.$value === undefined) continue;
    const value = token.$value;
    lines.push(`  ${cssVariable}: ${typeof value === 'object' ? dim(value) : value};`);
  }
  return lines.join('\n');
}

function formatVarsBlock(t, baseTree, selector, { emitPrimitives = false, emitStructure = false } = {}) {
  const L = [];
  L.push(`${selector} {`);

  if (emitPrimitives) {
    L.push('  /* Primitives: brand */');
    for (const [path, name] of Object.entries(BRAND_VAR)) {
      const node = getPath(t, path);
      if (node && node.$value) {
        L.push(`  ${name}: ${node.$value.hex || node.$value};`);
      }
    }
    L.push('');
    L.push('  /* Primitives: warm stone neutrals (never slate) */');
    for (const [path, name] of Object.entries(NEUTRAL_VAR)) {
      const node = getPath(t, path);
      if (node && node.$value) {
        L.push(`  ${name}: ${node.$value.hex || node.$value};`);
      }
    }
    L.push('');
    L.push('  /* Primitives: status */');
    for (const [path, name] of Object.entries(STATUS_VAR)) {
      const node = getPath(t, path);
      if (node && node.$value) {
        L.push(`  ${name}: ${node.$value.hex || node.$value};`);
      }
    }
    L.push('');
  }

  L.push(formatSemanticGroups(t));

  if (emitPrimitives) {
    L.push('  /* --client overrides per page: :root{ --client:#E23A2E } */');
  }

  if (!emitStructure) {
    L.push('}');
    return L.join('\n');
  }

  L.push('');
  L.push('  /* Type */');
  const fontDisplay = t.font?.family?.display?.$value || baseTree.font.family.display.$value;
  const fontBody = t.font?.family?.body?.$value || baseTree.font.family.body.$value;
  const fontData = t.font?.family?.data?.$value || baseTree.font.family.data.$value;
  L.push(`  --font-display: ${fontFamilyCss(fontDisplay)};`);
  L.push(`  --font-body: ${fontFamilyCss(fontBody)};`);
  L.push(`  --font-data: ${fontFamilyCss(fontData)};`);
  // D-19 item 4: figures resolve through one pair, so a component marks a number
  // once and each profile decides proportional or tabular mono.
  const numericRef = (t.font?.family?.numeric || baseTree.font.family.numeric).$value.slice(1, -1);
  L.push(`  --font-numeric: var(--font-${numericRef.split('.').pop()});`);
  L.push(`  --font-numeric-variant: ${(t.font?.['numeric-variant'] || baseTree.font['numeric-variant']).$value};`);
  // The scale as variables, so components reach it too, not only the .ud-* helpers (Δ-12).
  for (const step of ['display', 'h1', 'h2', 'h3', 'body']) {
    const token = t.typography?.[step] || baseTree.typography[step];
    L.push(`  --text-${step}: ${dim(token.$value.fontSize)};`);
  }

  if (emitPrimitives) {
    const weightLine = Object.entries(baseTree.font.weight)
      .filter(([key]) => !key.startsWith('$'))
      .map(([key, token]) => `--fw-${key}:${token.$value}`)
      .join('; ');
    L.push(`  ${weightLine};`);
  }

  L.push('');
  L.push('  /* Radius */');
  for (const [key, name] of Object.entries(RADIUS_VAR)) {
    const rTok = t.radius?.[key] || baseTree.radius[key];
    if (rTok && rTok.$value) {
      L.push(`  ${name}: ${dim(rTok.$value)};`);
    }
  }

  if (emitPrimitives) {
    L.push('');
    L.push('  /* Space */');
    const spaceLine = Object.entries(baseTree.space)
      .filter(([key]) => !key.startsWith('$'))
      .map(([key, token]) => `--space-${key}:${dim(token.$value)}`)
      .join('; ');
    L.push(`  ${spaceLine};`);
  }

  L.push('');
  L.push('  /* Elevation */');
  const shadowSource = t.shadow || baseTree.shadow;
  for (const [key, token] of Object.entries(shadowSource)) {
    if (key.startsWith('$') || !token || !token.$value) continue;
    const s = token.$value;
    if (s.alpha === 0 || (s.blur && s.blur.value === 0)) {
      L.push(`  --shadow-${key}: none;`);
    } else {
      L.push(`  --shadow-${key}: ${dim(s.offsetX)} ${dim(s.offsetY)} ${dim(s.blur)} ${dim(s.spread)} ${rgba(s.color)};`);
    }
  }

  L.push('');
  L.push('  /* Motion: read from baseTree only, never from t - the structural');
  L.push('     enforcement of "identical in both profiles" (contract Motion section).');
  L.push('     tokens/functional.tokens.json has no motion key to override this with. */');
  for (const [key, name] of Object.entries(MOTION_DURATION_VAR)) {
    const token = baseTree.motion.duration[key];
    if (token && token.$value) L.push(`  ${name}: ${dim(token.$value)};${descriptionComment(token)}`);
  }
  for (const [key, name] of Object.entries(MOTION_EASING_VAR)) {
    const token = baseTree.motion.easing[key];
    if (token && token.$value) L.push(`  ${name}: ${cubicBezierCss(token.$value)};${descriptionComment(token)}`);
  }
  for (const [key, name] of Object.entries(MOTION_DELAY_VAR)) {
    const token = baseTree.motion.delay?.[key];
    if (token && token.$value) L.push(`  ${name}: ${dim(token.$value)};${descriptionComment(token)}`);
  }
  for (const [key, name] of Object.entries(MOTION_LOOP_VAR)) {
    const token = baseTree.motion.loop?.[key];
    if (token && token.$value) L.push(`  ${name}: ${dim(token.$value)};${descriptionComment(token)}`);
  }
  for (const [key, name] of Object.entries(MOTION_PRESS_VAR)) {
    const token = baseTree.motion.press?.[key];
    if (token && token.$value !== undefined) L.push(`  ${name}: ${token.$value};${descriptionComment(token)}`);
  }

  // Not behind emitPrimitives: the dual operations block must be able to emit
  // its own responsive values (--surface-padding), or the fork silently drops.
  L.push('');
  L.push(formatResponsive(t));

  L.push('}');
  return L.join('\n');
}

function formatMomentBlock(baseTree, selector) {
  const L = [];
  L.push(`${selector} {`);
  L.push('  /* Gamification-exclusive (ADR-0001). Inert without data-game="on": */');
  L.push('  /* this block is the only place these two custom properties are emitted. */');
  for (const [key, name] of Object.entries(MOMENT_VAR)) {
    const token = baseTree.moment[key];
    if (token && token.$value !== undefined) L.push(`  ${name}: ${token.$value};`);
  }
  L.push('}');
  return L.join('\n');
}

function formatReducedMotionBlock(motionSelector, gameSelector) {
  // Two separate rules, not one shared selector list: --moment-intensity-*
  // must stay strictly inside a [data-game="on"] selector even here, or B3's
  // "no unscoped gamification custom property" guarantee has a reduced-motion
  // hole. --motion-duration-* is general-purpose, so it keeps the broad list.
  const L = [];
  L.push('@media (prefers-reduced-motion: reduce) {');
  L.push(`  ${motionSelector} {`);
  L.push('    /* B4: bakes the reduced-motion path into the compiled tokens so any');
  L.push('       consumer - a moment, a loading spinner, anything - gets it for free. */');
  for (const name of Object.values(MOTION_DURATION_VAR)) L.push(`    ${name}: 0ms;`);
  for (const name of Object.values(MOTION_LOOP_VAR)) L.push(`    ${name}: 0ms;`);
  L.push('    /* Press scale collapses; --interactive-pressed does not. A control');
  L.push('       still darkens on press with motion removed. */');
  for (const name of Object.values(MOTION_PRESS_VAR)) L.push(`    ${name}: 1;`);
  L.push('  }');
  L.push(`  ${gameSelector} {`);
  for (const name of Object.values(MOMENT_VAR)) L.push(`    ${name}: 1;`);
  L.push('  }');
  L.push('}');
  return L.join('\n');
}

function formatTypographyHelpers(t, baseTree, scopes = []) {
  const L = [];
  L.push('/* Typography helpers */');
  const typoSource = t.typography || baseTree.typography;
  for (const [key, token] of Object.entries(typoSource)) {
    if (key.startsWith('$') || !token || !token.$value) continue;
    const v = token.$value;
    const fontVar = key === 'body' ? '--font-body' : key === 'data' ? '--font-data' : '--font-display';
    const weightName = Object.entries(baseTree.font.weight)
      .filter(([k]) => !k.startsWith('$'))
      .find(([, w]) => {
        const wVal = typeof v.fontWeight === 'string' && v.fontWeight.startsWith('{')
          ? getPath(baseTree, v.fontWeight.slice(1, -1)).$value
          : v.fontWeight;
        return w.$value === wVal;
      })?.[0] || 'regular';

    const extra = key === 'label' ? ';color:var(--muted-foreground)' : '';
    const comment = key === 'label' ? ' /* Sentence case, no uppercase or tracking */' : '';
    const selector = scopes.length
      ? scopes.map((scope) => `${scope} .ud-${key}`).join(',')
      : `.ud-${key}`;
    L.push(
      `${selector}{font-family:var(${fontVar});font-weight:var(--fw-${weightName});font-size:${dim(v.fontSize)};line-height:${v.lineHeight};letter-spacing:${dim(v.letterSpacing)}${extra}}${comment}`
    );
  }
  return L.join('\n');
}

// The static-HTML component layer (plan Phase 3) ships inside the compiled tokens,
// so a page that links them gets the classes. Hand-written: see css/components.css.
const componentLayer = () => fs.readFileSync(path.resolve('css/components.css'), 'utf8').replace(/\r\n/g, '\n');

StyleDictionary.registerFormat({
  name: 'ud/css-dual',
  format: () => {
    const baseTree = JSON.parse(fs.readFileSync(path.resolve('tokens/udesign.tokens.json'), 'utf8'));
    let functionalTree = {};
    if (fs.existsSync(path.resolve('tokens/functional.tokens.json'))) {
      functionalTree = JSON.parse(fs.readFileSync(path.resolve('tokens/functional.tokens.json'), 'utf8'));
    }
    const brandDarkTree = deepMerge(baseTree, baseTree.dark);
    const functionalBaseTree = deepMerge(baseTree, functionalTree);
    const functionalDarkTree = deepMerge(functionalBaseTree, deepMerge(baseTree.dark, functionalTree.dark));

    const L = [];
    L.push('/*');
    L.push(' * UDesign design tokens (presentation and operations profiles). Compiled from DTCG sources.');
    L.push(' * Do not hand-edit this file: edit the token source or css/components.css and run `npm run build`.');
    L.push(' */');
    
    // D-07: presentation and operations. The brand/functional aliases were removed after v2.1.0 (v3).
    L.push(formatVarsBlock(baseTree, baseTree, ':root, :root[data-design="presentation"]', { emitPrimitives: true, emitStructure: true }));
    L.push('');
    L.push(formatVarsBlock(functionalTree, baseTree, ':root[data-design="operations"], .design-operations', { emitStructure: true }));
    L.push('');
    L.push(formatVarsBlock(brandDarkTree, baseTree, ':root[data-theme="dark"], .dark', {}));
    L.push('');
    L.push(formatVarsBlock(
      functionalDarkTree,
      baseTree,
      ':root[data-design="operations"][data-theme="dark"], :root[data-design="operations"].dark, .design-operations[data-theme="dark"], .design-operations.dark, .dark .design-operations',
      {},
    ));
    L.push('');
    L.push(formatMomentBlock(baseTree, ':root[data-game="on"]'));
    L.push('');
    L.push(formatReducedMotionBlock(
      ':root, :root[data-design="presentation"], :root[data-design="operations"], .design-operations',
      ':root[data-game="on"]',
    ));
    L.push('');
    L.push(formatTypographyHelpers(baseTree, baseTree));
    L.push('');
    L.push(formatTypographyHelpers(functionalBaseTree, baseTree, [':root[data-design="operations"]', '.design-operations']));
    L.push('');
    L.push(componentLayer());

    return L.join('\n');
  },
});

StyleDictionary.registerFormat({
  name: 'ud/css-functional-only',
  format: () => {
    const baseTree = JSON.parse(fs.readFileSync(path.resolve('tokens/udesign.tokens.json'), 'utf8'));
    const functionalTree = JSON.parse(fs.readFileSync(path.resolve('tokens/functional.tokens.json'), 'utf8'));
    
    const mergedTree = deepMerge(baseTree, functionalTree);
    const darkTree = deepMerge(mergedTree, deepMerge(baseTree.dark, functionalTree.dark));

    const L = [];
    L.push('/* Standalone UDesign Functional Brutalist Wire Tokens */');
    L.push(formatVarsBlock(mergedTree, baseTree, ':root', { emitPrimitives: true, emitStructure: true }));
    L.push('');
    L.push(formatVarsBlock(darkTree, baseTree, ':root[data-theme="dark"], .dark', {}));
    L.push('');
    L.push(formatMomentBlock(baseTree, ':root[data-game="on"]'));
    L.push('');
    L.push(formatReducedMotionBlock(':root', ':root[data-game="on"]'));
    L.push('');
    L.push(formatTypographyHelpers(mergedTree, baseTree));
    L.push('');
    L.push(componentLayer());
    return L.join('\n');
  },
});

const sd = new StyleDictionary({
  source: ['tokens/**/*.json'],
  usesDtcg: true,
  log: { verbosity: 'silent' },
  platforms: {
    css: {
      files: [
        { destination: 'dist/tokens.css', format: 'ud/css-dual' },
        { destination: 'dist/tokens-functional.css', format: 'ud/css-functional-only' }
      ],
    },
  },
});

await sd.hasInitialized;
await sd.buildAllPlatforms();
