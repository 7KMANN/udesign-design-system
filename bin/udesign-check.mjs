#!/usr/bin/env node
// udesign-check [path ...]: audits consumer source against the design system.
// Prints one finding per line and exits 1 if there is any. Rules: docs/checker-rules.md.
import fs from 'node:fs';
import path from 'node:path';
import { check } from './rules.mjs';

const SOURCE = /\.(html?|css|[cm]?[jt]sx?)$/i;
// Test data is not interface copy, so tests are skipped along with build output.
const SKIP = new Set(['node_modules', '.git', '.next', 'dist', 'build', 'out', 'coverage', '__tests__']);

function* walk(target) {
  if (fs.statSync(target).isFile()) {
    yield target;
    return;
  }
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const full = path.join(target, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (SOURCE.test(entry.name) && !/\.min\.|\.d\.ts$|\.(test|spec)\./.test(entry.name)) yield full;
  }
}

const targets = process.argv.slice(2);
const files = targets.length ? targets : ['.'];
const missing = files.filter((t) => !fs.existsSync(t));
if (missing.length) {
  console.error(`udesign-check: no such file or directory: ${missing.join(', ')}`);
  process.exit(2);
}
const sources = files.flatMap((t) => [...walk(t)]).map((file) => ({
  file: path.relative(process.cwd(), file).split(path.sep).join('/'),
  text: fs.readFileSync(file, 'utf8'),
}));

const findings = check(sources);
for (const f of findings) console.log(`${f.file}:${f.line}  ${f.cite}  ${f.rule}  ${f.message}`);
console.log(`udesign-check: ${findings.length} finding(s) in ${sources.length} file(s)`);
process.exitCode = findings.length ? 1 : 0;
