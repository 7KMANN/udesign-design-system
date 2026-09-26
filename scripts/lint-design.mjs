import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter } from './design-utils.mjs';

// ANSI terminal colors
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

// -------------------------------------------------------------
// Em-dash scan scope (S1 Item 1.11).
// -------------------------------------------------------------
// Exported so a test (tests/lint-design-scope.test.mjs) can assert this list
// cannot silently shrink back to "DESIGN.md only" - the bug this widening
// fixed. docs/ is deliberately excluded: it is a research record that keeps
// historical em-dashes on purpose, not an instruction file. CHANGELOG.md is
// included only because it is currently clean; if a future entry reintroduces
// an em-dash, take CHANGELOG.md back out of this list rather than rewriting
// history to satisfy a rule that was never written for it.
export const EM_DASH_INSTRUCTION_FILES = [
  'AGENTS.md',
  'DESIGN.md',
  'README.md',
  'HANDOFF.md',
  '.cursorrules',
  '.gemini/rules',
  'CLAUDE.md',
  'CHANGELOG.md',
];

// Component source: every TypeScript/TSX file under registry/, wherever it
// lives (new-york/ui today, any future style tree tomorrow) - not just the
// one path that happens to exist right now.
export function collectRegistrySourceFiles(rootDir) {
  const registryDir = path.join(rootDir, 'registry');
  const results = [];
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.tsx?$/.test(entry.name)) {
        results.push(path.relative(rootDir, full).split(path.sep).join('/'));
      }
    }
  }
  walk(registryDir);
  return results.sort();
}

// Resolves EM_DASH_INSTRUCTION_FILES + collectRegistrySourceFiles() to the
// files that actually exist under rootDir, relative-path style ('AGENTS.md',
// 'registry/new-york/ui/button.tsx', ...). This - not a hardcoded list - is
// what the scanner below and the scope test both read from.
export function collectEmDashScanTargets(rootDir) {
  const instructionFiles = EM_DASH_INSTRUCTION_FILES.filter((relPath) =>
    fs.existsSync(path.join(rootDir, relPath)),
  );
  return [...instructionFiles, ...collectRegistrySourceFiles(rootDir)];
}

function isMainModule() {
  return process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
}

if (isMainModule()) {
  runLint();
}

function runLint() {
  console.log('Starting UDesign DESIGN.md validation & stress test...\n');

  const rootDir = process.cwd();
  const designPath = path.resolve('DESIGN.md');
  const tokensPath = path.resolve('tokens/udesign.tokens.json');

  if (!fs.existsSync(designPath)) {
    console.error(`${RED}Error: DESIGN.md not found in repository root.${RESET}`);
    process.exit(1);
  }

  const designContent = fs.readFileSync(designPath, 'utf8');

  let errors = 0;
  let warnings = 0;

  function reportError(msg) {
    console.error(`${RED}[ERROR] ${msg}${RESET}`);
    errors++;
  }

  function reportWarning(msg) {
    console.warn(`${YELLOW}[WARNING] ${msg}${RESET}`);
    warnings++;
  }

  // -------------------------------------------------------------
  // 1. Check for Banned Design Artifacts (File-wide scan)
  // -------------------------------------------------------------
  console.log('Checking for banned design artifacts...');

  // The "## Banned design patterns" section names the very artifacts it bans
  // (e.g. ban 5 literally says "glassmorphism") - that is its job, not a
  // violation. Everything else in the file is still scanned raw: the artifact
  // scans below run only against the file with that section's own text
  // removed, so an actual banned artifact used elsewhere in DESIGN.md's prose
  // is still caught.
  const bannedPatternsSectionMatch = designContent.match(/## Banned design patterns[\s\S]*?(?=\n## |$)/);
  const artifactScanContent = bannedPatternsSectionMatch
    ? designContent.slice(0, bannedPatternsSectionMatch.index) +
      designContent.slice(bannedPatternsSectionMatch.index + bannedPatternsSectionMatch[0].length)
    : designContent;

  // A. Banned Slate Hex Codes (e.g., Tailwind Slate series)
  const SLATE_HEXES = [
    '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8',
    '#64748b', '#475569', '#334155', '#1e293b', '#0f172a'
  ];
  for (const slate of SLATE_HEXES) {
    if (artifactScanContent.toLowerCase().includes(slate)) {
      reportError(`Found banned slate hex code: ${slate}. Only warm stone neutrals are permitted.`);
    }
  }

  // B. Banned Glassmorphism / Backdrop Filter keywords
  if (/backdrop-filter/i.test(artifactScanContent) || /glassmorphism/i.test(artifactScanContent)) {
    reportError('Found banned concept "backdrop-filter" or "glassmorphism". Layouts must remain solid and flat.');
  }

  // C. Banned Em-Dashes (—), across every instruction file and every
  // registry component - not just DESIGN.md. docs/ is out of scope on
  // purpose (see collectEmDashScanTargets above).
  console.log('\nScanning for em-dashes across instruction files and registry component source...');
  const emDashScanTargets = collectEmDashScanTargets(rootDir);
  for (const relPath of emDashScanTargets) {
    const fileContent = relPath === 'DESIGN.md' ? designContent : fs.readFileSync(path.join(rootDir, relPath), 'utf8');
    if (!fileContent.includes('—')) continue;
    const lines = fileContent.split('\n');
    lines.forEach((line, idx) => {
      if (line.includes('—')) {
        reportError(`Found banned em-dash (—) in ${relPath}:${idx + 1}: "${line.trim()}". Use hyphens (-) or colons (:) instead.`);
      }
    });
  }

  // -------------------------------------------------------------
  // 2. Parse YAML Front Matter & Prose
  // -------------------------------------------------------------
  console.log('\nParsing DESIGN.md structure...');

  let yaml;
  let proseBlock;
  try {
    ({ metadata: yaml, prose: proseBlock } = parseFrontmatter(designContent));
  } catch {
    reportError('Failed to parse YAML front matter. Make sure it is enclosed between triple hyphens (---).');
    process.exit(1);
  }

  // Validate key metadata
  if (yaml.version !== 'alpha') {
    reportError(`YAML metadata "version" should be "alpha", found: "${yaml.version}"`);
  }
  if (yaml.name !== 'UDesign') {
    reportError(`YAML metadata "name" should be "UDesign", found: "${yaml.name}"`);
  }

  // -------------------------------------------------------------
  // 3. Verify 1:1 Component Coverage (YAML keys vs Prose)
  // -------------------------------------------------------------
  console.log('\nChecking component 1:1 coverage (YAML keys vs Prose descriptions)...');

  if (!yaml.components || typeof yaml.components !== 'object') {
    reportError('YAML front matter is missing the "components:" mapping block.');
  } else {
    const yamlComponentKeys = Object.keys(yaml.components);
    console.log(`Found ${yamlComponentKeys.length} components in YAML config: ${yamlComponentKeys.join(', ')}`);

    // Check that each component is defined in Prose
    // We look for bold code backticks e.g. **`button-primary`** or `button-primary` in prose
    for (const compKey of yamlComponentKeys) {
      const compRegex = new RegExp(`\`${compKey}\``, 'i');
      if (!compRegex.test(proseBlock)) {
        reportError(`Component key "${compKey}" is defined in YAML but has no corresponding prose definition in DESIGN.md (e.g. bold-code symbols like \`${compKey}\`).`);
      } else {
        console.log(`  ✓ ${compKey} matches prose.`);
      }
    }

    // Also check if any prose components are defined under ## Components but missing in YAML
    const componentsSection = proseBlock.match(/## Components([\s\S]*?)(##|$)/);
    if (componentsSection) {
      const proseItems = componentsSection[1].match(/\*\*`([^`]+)`\*\*/g) || [];
      const proseKeys = proseItems.map(item => item.replace(/\*\*`|`\*\*/g, ''));

      for (const pKey of proseKeys) {
        if (!yamlComponentKeys.includes(pKey)) {
          reportError(`Prose describes component \`${pKey}\` in ## Components, but it is missing from the YAML components configuration.`);
        }
      }
    } else {
      reportWarning('Could not find standard "## Components" prose header.');
    }
  }

  // -------------------------------------------------------------
  // 4. Verify Token References in Prose and YAML
  // -------------------------------------------------------------
  console.log('\nChecking token references (e.g. {colors.primary})...');

  // Find all token references like {colors.xyz} or {typography.xyz} or {rounded.xyz} or {spacing.xyz}
  const refRegex = /\{([a-zA-Z]+)\.([a-zA-Z0-9-]+)\}/g;
  let matchRef;
  const references = new Set();
  while ((matchRef = refRegex.exec(designContent)) !== null) {
    references.add(`${matchRef[1]}.${matchRef[2]}`);
  }

  console.log(`Found ${references.size} token references in DESIGN.md:`);
  for (const ref of references) {
    const [block, key] = ref.split('.');

    // Resolve block name mappings from YAML structure
    let targetBlock = yaml[block];
    if (block === 'colors') targetBlock = yaml.colors;
    if (block === 'typography') targetBlock = yaml.typography;
    if (block === 'rounded') targetBlock = yaml.rounded;
    if (block === 'spacing') targetBlock = yaml.spacing;

    if (!targetBlock) {
      reportError(`Reference {${ref}} points to non-existent block "${block}" in YAML metadata.`);
    } else if (!targetBlock[key]) {
      reportError(`Reference {${ref}} points to non-existent key "${key}" inside "${block}".`);
    } else {
      console.log(`  ✓ {${ref}} resolves to: ${JSON.stringify(targetBlock[key])}`);
    }
  }

  // -------------------------------------------------------------
  // 5. Cross-check with tokens/udesign.tokens.json & functional.tokens.json
  // -------------------------------------------------------------
  console.log('\nCross-checking DESIGN.md colors with tokens source truth...');

  const tokenFiles = [
    { path: tokensPath, label: 'udesign.tokens.json' },
    { path: path.resolve('tokens/functional.tokens.json'), label: 'functional.tokens.json' }
  ];

  for (const tf of tokenFiles) {
    if (fs.existsSync(tf.path)) {
      try {
        const tokens = JSON.parse(fs.readFileSync(tf.path, 'utf8'));

        if (tf.label === 'udesign.tokens.json') {
          const goldPrimaryHex = yaml.colors?.primary;
          const jsonGoldHex = tokens.color?.accent?.base?.$value?.hex || tokens.color?.accent?.base?.$value;

          if (goldPrimaryHex && jsonGoldHex) {
            if (goldPrimaryHex.toLowerCase() !== jsonGoldHex.toLowerCase()) {
              reportError(`Accent Gold color mismatch! DESIGN.md has "${goldPrimaryHex}" but tokens source has "${jsonGoldHex}".`);
            } else {
              console.log(`  ✓ Accent gold hex match (${tf.label}): ${goldPrimaryHex}`);
            }
          }

          const canvasHex = yaml.colors?.canvas;
          const jsonCreamHex = tokens.color?.cream?.$value?.hex || tokens.color?.cream?.$value;
          if (canvasHex && jsonCreamHex) {
            if (canvasHex.toLowerCase() !== jsonCreamHex.toLowerCase()) {
              reportError(`Canvas/Cream color mismatch! DESIGN.md has "${canvasHex}" but tokens source has "${jsonCreamHex}".`);
            } else {
              console.log(`  ✓ Canvas cream hex match (${tf.label}): ${canvasHex}`);
            }
          }
        }

        const tokensString = JSON.stringify(tokens).toLowerCase();
        for (const slate of SLATE_HEXES) {
          if (tokensString.includes(slate)) {
            reportError(`Found banned slate hex code: ${slate} inside ${tf.label}.`);
          }
        }
        console.log(`  ✓ Clean slate scan for ${tf.label}`);
      } catch (e) {
        reportWarning(`Failed to parse ${tf.label}: ${e.message}`);
      }
    } else {
      if (tf.label === 'udesign.tokens.json') {
        reportWarning('udesign.tokens.json not found, skipping DTCG alignment checks.');
      }
    }
  }

  // -------------------------------------------------------------
  // Validation Summary
  // -------------------------------------------------------------
  console.log('\n=========================================');
  if (errors > 0) {
    console.error(`${RED}Validation FAILED with ${errors} error(s) and ${warnings} warning(s).${RESET}`);
    process.exit(1);
  } else {
    console.log(`${GREEN}Validation PASSED with 0 errors and ${warnings} warning(s). DESIGN.md is spec-compliant!${RESET}`);
    process.exit(0);
  }
}
