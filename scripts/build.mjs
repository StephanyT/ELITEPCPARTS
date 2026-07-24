// Build script: assemble the deployable static site into dist/.
// Copies frontend/ content preserving relative paths.
import { rm, mkdir, cp } from 'node:fs/promises';

const DIST = 'dist';

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });

// Copy the static site verbatim (preserves all relative paths).
await cp('frontend/index.html', `${DIST}/index.html`);
await cp('frontend/src', `${DIST}/src`, { recursive: true });

console.log('Built dist/ from frontend/.');
