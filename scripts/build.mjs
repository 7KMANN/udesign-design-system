import StyleDictionary from 'style-dictionary';

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
  return dotted.split('.').reduce((node, key) => node[key], tree);
}

function dim(d) {
  return `${d.value}${d.unit}`;
}

function rgba(color) {
  const [r, g, b] = color.components.map((c) => Math.round(c * 255));
  return `rgba(${r},${g},${b},${color.alpha})`;
}

const GENERIC_FONT_KEYWORDS = new Set(['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui']);
function fontFamilyCss(list) {
  return list.map((f) => (GENERIC_FONT_KEYWORDS.has(f) ? f : `'${f}'`)).join(', ');
}

StyleDictionary.registerFormat({
  name: 'ud/css',
  format: ({ dictionary }) => {
    const t = dictionary.tokens;
    const L = [];

    L.push('/*');
    L.push(' * UDesign design tokens. Compiled from tokens/udesign.tokens.json (DTCG 2025.10)');
    L.push(' * via Style Dictionary. Do not hand-edit this file: edit the token source and run');
    L.push(' * `npm run build`.');
    L.push(' *');
    L.push(" * Import with a path relative to the consuming file's own location. An absolute");
    L.push(' * ("/...") path only resolves when the server root matches exactly and 404s silently');
    L.push(' * everywhere else, undefining every --font-* variable and falling back to serif.');
    L.push(' */');
    L.push(':root {');

    L.push('  /* Primitives: brand */');
    for (const [path, name] of Object.entries(BRAND_VAR)) {
      L.push(`  ${name}: ${getPath(t, path).$value.hex};`);
    }

    L.push('');
    L.push('  /* Primitives: warm stone neutrals (never slate) */');
    for (const [path, name] of Object.entries(NEUTRAL_VAR)) {
      L.push(`  ${name}: ${getPath(t, path).$value.hex};`);
    }

    L.push('');
    L.push('  /* Primitives: status */');
    for (const [path, name] of Object.entries(STATUS_VAR)) {
      L.push(`  ${name}: ${getPath(t, path).$value.hex};`);
    }

    L.push('');
    L.push('  /* Functional roles (components consume these) */');
    for (const [key, name] of Object.entries(ROLE_VAR)) {
      const token = t.role[key];
      const primitivePath = Object.keys(BRAND_VAR).concat(Object.keys(NEUTRAL_VAR), Object.keys(STATUS_VAR))
        .find((p) => getPath(t, p).$value.hex === token.$value.hex);
      const primitiveVar = { ...BRAND_VAR, ...NEUTRAL_VAR, ...STATUS_VAR }[primitivePath];
      L.push(`  ${name}: var(${primitiveVar});`);
    }
    L.push('  /* --client overrides per page: :root{ --client:#E23A2E } */');

    L.push('');
    L.push('  /* Type */');
    L.push(`  --font-display: ${fontFamilyCss(t.font.family.display.$value)};`);
    L.push(`  --font-data: ${fontFamilyCss(t.font.family.data.$value)};`);
    const weightLine = Object.entries(t.font.weight)
      .map(([key, token]) => `--fw-${key}:${token.$value}`)
      .join('; ');
    L.push(`  ${weightLine};`);

    L.push('');
    L.push('  /* Radius */');
    for (const [key, name] of Object.entries(RADIUS_VAR)) {
      L.push(`  ${name}: ${dim(t.radius[key].$value)};`);
    }

    L.push('');
    L.push('  /* Space */');
    const spaceLine = Object.entries(t.space)
      .map(([key, token]) => `--space-${key}:${dim(token.$value)}`)
      .join('; ');
    L.push(`  ${spaceLine};`);

    L.push('');
    L.push('  /* Elevation */');
    for (const [key, token] of Object.entries(t.shadow)) {
      const s = token.$value;
      L.push(`  --shadow-${key}: ${dim(s.offsetX)} ${dim(s.offsetY)} ${dim(s.blur)} ${dim(s.spread)} ${rgba(s.color)};`);
    }

    L.push('}');
    L.push('');
    L.push('/* Typography helpers */');
    for (const [key, token] of Object.entries(t.typography)) {
      const v = token.$value;
      const fontVar = v.fontFamily[0] === 'JetBrains Mono' ? '--font-data' : '--font-display';
      const weightName = Object.entries(t.font.weight).find(([, w]) => w.$value === v.fontWeight)?.[0];
      const extra = key === 'label' ? ';color:var(--muted-foreground)' : '';
      const comment = key === 'label' ? ' /* Title case, no uppercase/tracking */' : '';
      L.push(
        `.ud-${key}{font-family:var(${fontVar});font-weight:var(--fw-${weightName});font-size:${dim(v.fontSize)};line-height:${v.lineHeight};letter-spacing:${dim(v.letterSpacing)}${extra}}${comment}`
      );
    }

    return L.join('\n') + '\n';
  },
});

// Style Dictionary may warn about "token collisions" here (it flags any two
// tokens that share a last-path-segment name, e.g. color.neutral.border vs
// role.border): harmless in this setup, since ud/css above reads the
// resolved token tree directly rather than SD's own name-collision-sensitive
// output formatters.
const sd = new StyleDictionary({
  source: ['tokens/**/*.json'],
  usesDtcg: true,
  platforms: {
    css: {
      files: [{ destination: 'dist/tokens.css', format: 'ud/css' }],
    },
  },
});

await sd.hasInitialized;
await sd.buildAllPlatforms();
