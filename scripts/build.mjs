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
};

const RADIUS_VAR = { sm: '--radius-sm', base: '--radius', lg: '--radius-lg', pill: '--radius-pill' };

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

function formatSemanticGroups(t) {
  const lines = ['  /* Semantic roles */'];
  for (const [tokenPath, cssVariable] of SEMANTIC_ENTRIES) {
    const value = cssTokenValue(getPath(t, tokenPath));
    if (value !== undefined) lines.push(`  ${cssVariable}: ${value};`);
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

  if (emitPrimitives) {
    L.push('');
    L.push(formatResponsive(t));
  }

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
    const comment = key === 'label' ? ' /* Title case, no uppercase/tracking */' : '';
    const selector = scopes.length
      ? scopes.map((scope) => `${scope} .ud-${key}`).join(',')
      : `.ud-${key}`;
    L.push(
      `${selector}{font-family:var(${fontVar});font-weight:var(--fw-${weightName});font-size:${dim(v.fontSize)};line-height:${v.lineHeight};letter-spacing:${dim(v.letterSpacing)}${extra}}${comment}`
    );
  }
  return L.join('\n');
}

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
    L.push(' * UDesign design tokens (Dual Style: Brand & Functional). Compiled from DTCG sources.');
    L.push(' * Do not hand-edit this file: edit the token source and run `npm run build`.');
    L.push(' */');
    
    L.push(formatVarsBlock(baseTree, baseTree, ':root, :root[data-design="brand"]', { emitPrimitives: true, emitStructure: true }));
    L.push('');
    L.push(formatVarsBlock(functionalTree, baseTree, ':root[data-design="functional"], .design-functional', { emitStructure: true }));
    L.push('');
    L.push(formatVarsBlock(brandDarkTree, baseTree, ':root[data-theme="dark"], .dark', {}));
    L.push('');
    L.push(formatVarsBlock(
      functionalDarkTree,
      baseTree,
      ':root[data-design="functional"][data-theme="dark"], :root[data-design="functional"].dark, .design-functional[data-theme="dark"], .design-functional.dark, .dark .design-functional',
      {},
    ));
    L.push('');
    L.push(formatTypographyHelpers(baseTree, baseTree));
    L.push('');
    L.push(formatTypographyHelpers(functionalBaseTree, baseTree, [':root[data-design="functional"]', '.design-functional']));
    L.push('');

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
    L.push(formatTypographyHelpers(mergedTree, baseTree));
    L.push('');
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
