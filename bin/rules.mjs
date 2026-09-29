// The portable checker's rules (docs/checker-rules.md). Every rule is a cheap lexical
// check with no judgement: a rule that cries wolf gets switched off (plan 8, risk 3).
// ponytail: regexes and a tag scanner, not a parser. They miss exotic source (a `//`
// inside a regex literal hides the rest of that line) but never invent a finding.

// Every finding names its rule (AGENTS.md "Auditing").
const CITE = {
  'accent-repeated': 'ban 26',
  'div-onclick': 'AGENTS.md rule 2',
  'raw-motion': 'ban 19',
  'ud-primitive': 'ban 1',
  'em-dash': 'ban 14',
  'accent-colour-name': 'AGENTS.md rule 5',
  'profile-pin': 'AGENTS.md rule 6',
  shell: 'ban 27',
  'fill-as-text': 'ban 28',
  'toolbar-wrap': 'ban 30',
  'press-missing': 'ban 16',
};

// Fill roles (DESIGN.md "Core roles"): each pairs with its own -foreground, never used as text.
const FILL = 'primary|secondary|muted|destructive|accent';
const FILL_CSS = new RegExp(`(?<![\\w-])color\\s*:\\s*["'\`]?var\\(--(${FILL})\\)`, 'g');
const FILL_TW = new RegExp(`(?<![\\w-])text-(?:\\[(?:color:)?var\\(--(?:${FILL})\\)\\]|(?:${FILL}))(?![\\w-])`, 'g');
// A shared primitive folder (seed spec R7): application code gets press feedback by using these.
const PRIMITIVES = /(?:^|[\\/])(?:components[\\/]ui|registry[\\/][\w-]+[\\/]ui)[\\/]/;

const OPERATIONS = /^operations$/;
const PRESENTATION = /^presentation$/;
// Removed in v3 (D-07 aliases). They now match no profile, so the page renders unstyled.
const REMOVED = { brand: 'presentation', functional: 'operations' };
const removedName = (profile) => REMOVED[profile.toLowerCase()] && `\`${profile}\` is no longer a profile (removed in v3); write \`${REMOVED[profile.toLowerCase()]}\``;
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

const blank = (s) => s.replace(/[^\n]/g, ' ');
const blankAll = (text, re) => text.replace(re, blank);
const TOKENS_COPY = /UDesign design tokens[^\n]*Compiled from DTCG sources/;

// Blanks comments (and, with strings, string literals) while keeping every offset.
function blankJs(text, strings = false) {
  let out = '';
  for (let i = 0; i < text.length; ) {
    const c = text[i];
    const next = text[i + 1];
    let end;
    if (c === '/' && next === '/') {
      end = text.indexOf('\n', i);
      if (end < 0) end = text.length;
    } else if (c === '/' && next === '*') {
      end = text.indexOf('*/', i + 2);
      end = end < 0 ? text.length : end + 2;
    } else if (c === '"' || c === "'" || c === '`') {
      end = i + 1;
      while (end < text.length && text[end] !== c && (c === '`' || text[end] !== '\n')) end += text[end] === '\\' ? 2 : 1;
      end = Math.min(end + 1, text.length);
      out += strings ? c + blank(text.slice(i + 1, end - 1)) + text.slice(end - 1, end) : text.slice(i, end);
      i = end;
      continue;
    } else {
      out += c;
      i += 1;
      continue;
    }
    out += blank(text.slice(i, end));
    i = end;
  }
  return out;
}

// The text of a JSX or HTML tag starting at `start`, stopping at the first `>` outside braces.
function tagAt(code, start) {
  let depth = 0;
  for (let i = start + 1; i < code.length; i += 1) {
    if (code[i] === '{') depth += 1;
    else if (code[i] === '}') depth -= 1;
    else if (code[i] === '>' && depth === 0) return code.slice(start, i + 1);
  }
  return code.slice(start);
}

// The balanced `{...}` or `(...)` starting at `start`.
function balanced(code, start) {
  const open = code[start];
  const close = open === '{' ? '}' : ')';
  let depth = 0;
  for (let i = start; i < code.length; i += 1) {
    if (code[i] === open) depth += 1;
    else if (code[i] === close && --depth === 0) return code.slice(start, i + 1);
  }
  return code.slice(start);
}

const isAccentButton = (tag) => !/\bvariant\s*=/.test(tag) || /\bvariant\s*=\s*(\{\s*)?["']default["']/.test(tag);

function* rawMotion(code) {
  for (const m of code.matchAll(/(?<![\w-])((?:duration|delay)-\d+|(?:duration|delay)-\[(?!var\()[^\]]*\]|ease-(in-out|in|out|linear)|ease-\[cubic-bezier[^\]]*\])(?![\w-])/g)) {
    yield [m.index, `\`${m[1]}\`; use a --motion-* role`];
  }
  const decl = /(?<![\w-])(?:transition|animation|--animate-[\w-]+)(?:-duration|-timing-function|-delay|Duration|TimingFunction|Delay)?\s*:\s*["'`]?([^;{}\n"'`]*)/g;
  for (const m of code.matchAll(decl)) {
    const value = m[1].replace(/var\([^)]*\)/g, '');
    const duration = [...value.matchAll(/(?<![\w.-])(\d*\.?\d+)m?s\b/g)].some((d) => Number(d[1]) !== 0);
    const easing = /cubic-bezier\(|steps\(|(?<![\w-])(ease|ease-in|ease-out|ease-in-out|linear|step-start|step-end)(?![\w-])/.test(value);
    if (duration || easing) yield [m.index, `\`${m[0].trim()}\`; use --motion-* roles`];
  }
  // framer-motion: `transition={{ duration: 0.3, ease: "easeOut" }}`, seconds with no unit.
  for (const m of code.matchAll(/(?<![\w-])transition\s*(?:=\s*\{|:)\s*(?=\{)/g)) {
    const body = balanced(code, m.index + m[0].length);
    for (const d of body.matchAll(/(?<![\w-])(duration|delay)\s*:\s*(\d*\.?\d+)(?![\w.])/g)) {
      if (Number(d[2]) !== 0) yield [m.index, `\`${d[0]}\` in a motion transition; read the --motion-* role`];
    }
    if (/(?<![\w-])ease\s*:\s*["'`[]/.test(body)) yield [m.index, 'a literal `ease` in a motion transition; read the --motion-* role'];
  }
}

function checkHtml(text, add) {
  const code = blankAll(blankAll(text, /<!--[\s\S]*?-->/g), /\/\*[\s\S]*?\*\//g);
  const markup = blankAll(code, /<(style|script)\b[\s\S]*?<\/\1\s*>/gi);

  const stack = [];
  const groups = new Map();
  let root;
  let shellAt = -1;
  for (const m of markup.matchAll(/<(\/?)([a-zA-Z][\w-]*)([^>]*)>/g)) {
    const [, close, name, attrs] = m;
    const tag = name.toLowerCase();
    if (close) {
      const i = stack.findLastIndex((s) => s.tag === tag);
      if (i >= 0) stack.length = i;
      continue;
    }
    const classes = (attrs.match(/\bclass\s*=\s*["']([^"']*)["']/i)?.[1] ?? '').split(/\s+/).filter(Boolean);
    const profile = attrs.match(/\bdata-design\s*=\s*["']?([\w-]+)/i)?.[1];
    if (profile && tag === 'html') root = { profile, index: m.index };
    else if (profile) add('profile-pin', m.index, `\`data-design\` on <${tag}>; set it once, on <html>`);
    if (profile && tag === 'html' && removedName(profile)) add('profile-pin', m.index, removedName(profile));
    if (classes.includes('ud-app-shell') && shellAt < 0) shellAt = m.index;
    if (classes.includes('ud-btn-primary')) {
      const where = stack.map((s) => s.id).join(' > ');
      groups.set(where, [...(groups.get(where) ?? []), m.index]);
    }
    if (!VOID.has(tag) && !attrs.endsWith('/')) stack.push({ tag, id: tag + classes.map((c) => `.${c}`).join('') });
  }
  for (const [where, at] of groups) {
    if (at.length > 1) {
      add('accent-repeated', at[0], `${at.length} accent-filled controls (ud-btn-primary) repeat under \`${where}\`; a repeated control is ud-btn-secondary`);
    }
  }
  if (root && OPERATIONS.test(root.profile) && shellAt < 0) add('shell', root.index, `a \`${root.profile}\` document with no ud-app-shell`);
  if (root && PRESENTATION.test(root.profile) && shellAt >= 0) add('shell', shellAt, `a \`${root.profile}\` document composed in ud-app-shell`);

  for (const m of markup.matchAll(/\u2014|&mdash;|&#8212;/g)) add('em-dash', m.index, 'em-dash in interface copy; use a hyphen or a colon');
  return code;
}

function checkJs(text, add, tree) {
  const code = blankJs(text);

  for (const m of code.matchAll(/\.map\(/g)) {
    const body = balanced(code, m.index + 4);
    for (const b of body.matchAll(/<Button(?![\w.])/g)) {
      if (isAccentButton(tagAt(body, b.index))) {
        add('accent-repeated', m.index + 4 + b.index, 'an accent-filled Button inside .map(); a repeated control is `secondary`, or `ghost` in a row or toolbar');
      }
    }
  }

  for (const m of code.matchAll(/<(?:motion\.)?div(?![\w.-])/g)) {
    const tag = tagAt(code, m.index);
    const on = tag.search(/\bonClick\s*=\s*\{/);
    if (on < 0) continue;
    const handler = balanced(tag, tag.indexOf('{', on)).replace(/\s/g, '');
    if (!/^\{\(?\w+\)?=>\w+\.stopPropagation\(\)\}$/.test(handler)) add('div-onclick', m.index, 'a <div> or <motion.div> with onClick; a clickable row, card or item is Pressable');
  }

  for (const m of code.matchAll(/<AppShellToolbar(?![\w.])/g)) {
    if (/(?<![\w:-])(?:(?:sm|md|lg|xl|2xl):)?flex-wrap(?![\w-])/.test(tagAt(code, m.index))) {
      add('toolbar-wrap', m.index, 'the toolbar wraps from md up; prefix it `max-md:flex-wrap` and move what does not fit into a menu');
    }
  }

  for (const m of code.matchAll(FILL_TW)) add('fill-as-text', m.index, `\`${m[0]}\` uses a fill role as text; pair the fill with its -foreground, or use a tone foreground`);

  for (const m of code.matchAll(/(?<!\[)data-design\s*=/g)) {
    const tag = code.slice(0, m.index).match(/<([A-Za-z][\w.]*)[^<]*$/)?.[1];
    const profile = code.slice(m.index).match(/^data-design\s*=\s*["']([\w-]+)/)?.[1];
    if (tag === 'html' && profile) tree.roots.push({ add, index: m.index, profile });
    else if (tag) add('profile-pin', m.index, `\`data-design\` on <${tag}>; set it once, on <html>`);
    if (tag === 'html' && profile && removedName(profile)) add('profile-pin', m.index, removedName(profile));
  }
  for (const m of code.matchAll(/<AppShell(?![\w.])/g)) tree.shells.push({ add, index: m.index });

  for (const m of code.matchAll(/\bdataset\.design\s*=(?!=)|setAttribute\(\s*["']data-design/g)) {
    add('profile-pin', m.index, 'the profile switched at runtime; pin it once, on <html>');
  }

  // The character itself, or its escape in a string literal.
  for (const m of code.matchAll(/\u2014|\\u2014|\\u\{2014\}/g)) add('em-dash', m.index, 'em-dash in interface copy; use a hyphen or a colon');

  for (const m of blankJs(text, true).matchAll(/\b(?:const|let|var|function|class|type|interface|enum)\s+([A-Za-z_$][\w$]*)/g)) {
    const parts = m[1].replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase().split(/[_$]+/);
    if (parts.includes('gold')) add('accent-colour-name', m.index, `\`${m[1]}\` names the accent by colour; call it the accent`);
  }
  return code;
}

export function check(files) {
  const findings = [];
  const tree = { roots: [], shells: [] };

  for (const { file, text } of files) {
    const lines = text.split('\n');
    const add = (rule, index, message) => {
      const line = text.slice(0, index).split('\n').length;
      if (/design-ok:/.test(lines[line - 1]) || /design-ok:/.test(lines[line - 2] ?? '')) return;
      if (findings.some((f) => f.file === file && f.line === line && f.rule === rule)) return;
      findings.push({ file, line, rule, cite: CITE[rule], message });
    };

    const ext = file.slice(file.lastIndexOf('.') + 1).toLowerCase();
    let code;
    if (ext === 'html' || ext === 'htm') code = checkHtml(text, add);
    else if (ext === 'css') code = blankAll(text, /\/\*[\s\S]*?\*\//g);
    else code = checkJs(text, add, tree);

    for (const [index, message] of rawMotion(code)) add('raw-motion', index, message);
    for (const m of code.matchAll(FILL_CSS)) add('fill-as-text', m.index, `\`${m[0]}\` uses a fill role as text; pair the fill with its -foreground, or use a tone foreground`);
    // group-active: counts. An overlay's Trigger is left out: it wraps a Button through asChild.
    if (PRIMITIVES.test(file) && ext !== 'css' && !/\bactive:|:active\b/.test(code)) {
      const el = code.search(/<(?:button|\w*(?:Checkbox|Switch|Toggle)\w*\.Root|(?!(?:Tooltip|Popover|HoverCard|Dialog|AlertDialog|Sheet|Drawer|DropdownMenu|ContextMenu|Menubar)\w*\.Trigger)[A-Z]\w*\.(?:Trigger|Item|Close|Thumb))(?![\w.])|role\s*=\s*["']button["']/);
      if (el >= 0) add('press-missing', el, 'an interactive primitive with no `active:` treatment; give it --interactive-pressed or --motion-press-scale');
    }
    if (!TOKENS_COPY.test(text)) {
      for (const m of code.matchAll(/var\(--ud-[\w-]*/g)) add('ud-primitive', m.index, `\`${m[0]})\` is a primitive; use a semantic role`);
    }
    if (ext === 'css' || ext === 'html' || ext === 'htm') {
      for (const m of code.matchAll(/--[\w-]*?(?<![a-z])gold(?![a-z])[\w-]*/gi)) add('accent-colour-name', m.index, `\`${m[0]}\` names the accent by colour; call it the accent`);
    }
  }

  const operations = tree.roots.filter((r) => OPERATIONS.test(r.profile));
  if (!tree.shells.length) for (const r of operations) r.add('shell', r.index, `a \`${r.profile}\` app with no <AppShell> anywhere in the tree`);
  if (tree.roots.some((r) => PRESENTATION.test(r.profile))) {
    for (const s of tree.shells) s.add('shell', s.index, 'a presentation app composed in <AppShell>');
  }
  return findings;
}
