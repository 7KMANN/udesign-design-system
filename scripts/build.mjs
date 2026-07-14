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
  primary: '--primary',
  'primary-foreground': '--primary-foreground',
  'primary-hover': '--primary-hover',
  secondary: '--secondary',
  'secondary-foreground': '--secondary-foreground',
  muted: '--muted',
  'muted-foreground': '--muted-foreground',
  border: '--border-color',
  'border-strong': '--border-strong',
  ring: '--ring',
  destructive: '--destructive',
  client: '--client',
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

function formatVarsBlock(t, baseTree, selector, isOverride = false) {
  const L = [];
  L.push(`${selector} {`);

  if (!isOverride) {
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

  L.push('  /* Functional roles (components consume these) */');
  for (const [key, name] of Object.entries(ROLE_VAR)) {
    const token = t.role?.[key] || (isOverride ? undefined : baseTree.role?.[key]);
    if (!token || !token.$value) continue;

    let valStr = token.$value;
    if (typeof valStr === 'string' && valStr.startsWith('{') && valStr.endsWith('}')) {
      const refPath = valStr.slice(1, -1);
      const primitiveVar = { ...BRAND_VAR, ...NEUTRAL_VAR, ...STATUS_VAR }[refPath];
      if (primitiveVar) {
        L.push(`  ${name}: var(${primitiveVar});`);
        continue;
      }
    }

    const hexVal = token.$value?.hex || token.$value;
    const primitivePath = Object.keys(BRAND_VAR).concat(Object.keys(NEUTRAL_VAR), Object.keys(STATUS_VAR))
      .find((p) => getPath(baseTree, p)?.$value?.hex === hexVal);
    const primitiveVar = { ...BRAND_VAR, ...NEUTRAL_VAR, ...STATUS_VAR }[primitivePath];
    if (primitiveVar) {
      L.push(`  ${name}: var(${primitiveVar});`);
    } else if (hexVal) {
      L.push(`  ${name}: ${hexVal};`);
    }
  }

  if (!isOverride) {
    L.push('  /* --client overrides per page: :root{ --client:#E23A2E } */');
  }

  L.push('');
  L.push('  /* Type */');
  const fontDisplay = t.font?.family?.display?.$value || baseTree.font.family.display.$value;
  const fontData = t.font?.family?.data?.$value || baseTree.font.family.data.$value;
  L.push(`  --font-display: ${fontFamilyCss(fontDisplay)};`);
  L.push(`  --font-data: ${fontFamilyCss(fontData)};`);

  if (!isOverride) {
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

  if (!isOverride) {
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

  L.push('}');
  return L.join('\n');
}

function formatTypographyHelpers(t, baseTree) {
  const L = [];
  L.push('/* Typography helpers */');
  const typoSource = t.typography || baseTree.typography;
  for (const [key, token] of Object.entries(typoSource)) {
    if (key.startsWith('$') || !token || !token.$value) continue;
    const v = token.$value;
    let fontVar = '--font-display';
    if (Array.isArray(v.fontFamily) && v.fontFamily[0] === 'JetBrains Mono') {
      fontVar = '--font-data';
    }
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
    L.push(
      `.ud-${key}{font-family:var(${fontVar});font-weight:var(--fw-${weightName});font-size:${dim(v.fontSize)};line-height:${v.lineHeight};letter-spacing:${dim(v.letterSpacing)}${extra}}${comment}`
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

    const L = [];
    L.push('/*');
    L.push(' * UDesign design tokens (Dual Style: Brand & Functional). Compiled from DTCG sources.');
    L.push(' * Do not hand-edit this file: edit the token source and run `npm run build`.');
    L.push(' */');
    
    L.push(formatVarsBlock(baseTree, baseTree, ':root, :root[data-design="brand"]', false));
    L.push('');
    L.push(formatVarsBlock(functionalTree, baseTree, ':root[data-design="functional"], .design-functional', true));
    L.push('');
    L.push(formatTypographyHelpers(baseTree, baseTree));
    L.push('');

    return L.join('\n');
  },
});

StyleDictionary.registerFormat({
  name: 'ud/css-functional-only',
  format: () => {
    const baseTree = JSON.parse(fs.readFileSync(path.resolve('tokens/udesign.tokens.json'), 'utf8'));
    const functionalTree = JSON.parse(fs.readFileSync(path.resolve('tokens/functional.tokens.json'), 'utf8'));
    
    const mergedTree = JSON.parse(JSON.stringify(baseTree));
    Object.assign(mergedTree.role, functionalTree.role);
    Object.assign(mergedTree.font, functionalTree.font);
    Object.assign(mergedTree.radius, functionalTree.radius);
    Object.assign(mergedTree.shadow, functionalTree.shadow);
    Object.assign(mergedTree.typography, functionalTree.typography);

    const L = [];
    L.push('/* Standalone UDesign Functional Brutalist Wire Tokens */');
    L.push(formatVarsBlock(mergedTree, baseTree, ':root', false));
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
