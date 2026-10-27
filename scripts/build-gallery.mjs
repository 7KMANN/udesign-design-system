// Builds dist/ud-gallery.js, the plain-JS gallery for pages without React: js/ud-gallery.ts with
// the registry's gallery-core.ts, the code the React Gallery runs. Readable, not minified, since a
// page vendors the file as it is. `node scripts/build-gallery.mjs <dir>` builds into <dir> instead.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const entry = path.join(root, 'js/ud-gallery.ts');
const outDir = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, 'dist');
// The source's opening comment is the file's documentation: the bundler drops it, so it leads the output.
const header = fs.readFileSync(entry, 'utf8').replace(/\r\n/g, '\n').match(/^\/\*[\s\S]*?\*\//)[0];
const banner = `${header}\n/* Built from js/ud-gallery.ts and registry/new-york/ui/gallery-core.ts by npm run build. Do not edit. */`;

await build({
  configFile: false,
  root,
  publicDir: false,
  logLevel: 'warn',
  build: {
    outDir,
    emptyOutDir: false,
    minify: false,
    target: 'es2019',
    lib: { entry, formats: ['iife'], name: 'udGallery', fileName: () => 'ud-gallery.js' },
    rolldownOptions: { output: { banner } },
  },
});
