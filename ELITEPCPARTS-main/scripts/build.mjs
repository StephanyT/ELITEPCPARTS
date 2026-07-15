// Build script: assemble the deployable static site into dist/.
// 1. Wipe dist/  2. Copy index.html + src/  3. esbuild-bundle firebase-init.js
//    (pulls the Firebase SDK from node_modules) over the copied source.
import { rm, mkdir, cp } from 'node:fs/promises';
import { build } from 'esbuild';

const DIST = 'dist';

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });

// Copy the static site verbatim (preserves all relative paths).
await cp('index.html', `${DIST}/index.html`);
await cp('src', `${DIST}/src`, { recursive: true });

// Bundle Firebase from npm into a self-contained IIFE, replacing the copied source.
await build({
  entryPoints: ['src/js/firebase-init.js'],
  outfile: `${DIST}/src/js/firebase-init.js`,
  bundle: true,
  format: 'iife',
  minify: true,
  allowOverwrite: true,
});

console.log('Built dist/ (firebase-init.js bundled from npm).');
