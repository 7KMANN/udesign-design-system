import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tokens = JSON.parse(fs.readFileSync(path.join(root, 'tokens/udesign.tokens.json'), 'utf8'));
const functional = JSON.parse(fs.readFileSync(path.join(root, 'tokens/functional.tokens.json'), 'utf8'));

function getPath(tree, dotted) {
  return dotted.split('.').reduce((node, key) => node?.[key], tree);
}

function merge(base, override) {
  if (!override || typeof override !== 'object' || Array.isArray(override)) return override ?? base;
  const result = { ...base };
  for (const [key, value] of Object.entries(override)) {
    result[key] = value && typeof value === 'object' && !Array.isArray(value) && !('$value' in value)
      ? merge(base?.[key] ?? {}, value)
      : value;
  }
  return result;
}

function resolveHex(tree, dotted, seen = new Set()) {
  assert(!seen.has(dotted), `circular token reference at ${dotted}`);
  seen.add(dotted);
  const token = getPath(tree, dotted);
  assert(token?.$value !== undefined, `missing color token ${dotted}`);
  const value = token.$value;
  if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
    return resolveHex(tree, value.slice(1, -1), seen);
  }
  const hex = value?.hex ?? value;
  assert.match(hex, /^#[0-9a-f]{6}$/i, `${dotted} must resolve to a hex color`);
  return hex;
}

function luminance(hex) {
  const channels = [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255)
    .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

function assertPair(tree, foreground, background) {
  const ratio = contrast(resolveHex(tree, foreground), resolveHex(tree, background));
  assert(ratio >= 4.5, `${foreground} on ${background} has ${ratio.toFixed(2)}:1 contrast`);
}

const functionalLight = merge(tokens, functional);
const profiles = [
  ['brand light', tokens],
  ['brand dark', merge(tokens, tokens.dark)],
  ['functional light', functionalLight],
  ['functional dark', merge(functionalLight, merge(tokens.dark, functional.dark))],
];

for (const [themeName, tree] of profiles) {
  test(`${themeName} component text pairings meet WCAG AA`, () => {
    for (const [foreground, background] of [
      ['role.foreground', 'role.background'],
      ['role.card-foreground', 'role.card'],
      ['role.popover-foreground', 'role.popover'],
      ['role.primary-foreground', 'role.primary'],
      ['role.secondary-foreground', 'role.secondary'],
      ['role.muted-foreground', 'role.muted'],
      ['role.accent-foreground', 'role.accent'],
      ['role.destructive-foreground', 'role.destructive'],
      ['role.sidebar-foreground', 'role.sidebar'],
      ['role.sidebar-primary-foreground', 'role.sidebar-primary'],
      ['role.sidebar-accent-foreground', 'role.sidebar-accent'],
      ['surface.raised-foreground', 'surface.raised'],
      ['surface.sunken-foreground', 'surface.sunken'],
      ['surface.overlay-foreground', 'surface.overlay'],
      ['surface.console-foreground', 'surface.console'],
      ['data.tooltip-foreground', 'data.tooltip'],
    ]) assertPair(tree, foreground, background);
  });

  test(`${themeName} tone badge pairings meet WCAG AA`, () => {
    for (const tone of ['neutral', 'info', 'success', 'warning', 'danger', 'progress', 'brand']) {
      assertPair(tree, `tone.${tone}.foreground`, `tone.${tone}.surface`);
      assertPair(tree, `tone.${tone}.solid-foreground`, `tone.${tone}.solid`);
    }
  });

  test(`${themeName} entity text pairings meet WCAG AA`, () => {
    for (let entity = 1; entity <= 4; entity += 1) {
      assertPair(tree, `entity.${entity}.foreground`, `entity.${entity}.surface`);
    }
  });

  test(`${themeName} metric text pairings meet WCAG AA`, () => {
    for (const metric of ['positive', 'negative', 'neutral']) {
      assertPair(tree, `metric.${metric}.foreground`, `metric.${metric}.surface`);
    }
  });

  test(`${themeName} chart colors meet graphical-object contrast`, () => {
    for (let series = 1; series <= 8; series += 1) {
      const ratio = contrast(resolveHex(tree, `data.${series}`), resolveHex(tree, 'role.background'));
      assert(ratio >= 3, `data.${series} on role.background has ${ratio.toFixed(2)}:1 contrast`);
    }
  });
}
