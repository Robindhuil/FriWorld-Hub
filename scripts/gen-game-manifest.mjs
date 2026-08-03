// Generates public/game/manifest.json — the file listing that /api/game needs
// when the build is hosted on object storage, which has no directory listing
// over plain HTTP. Locally the route reads the directory directly and ignores
// this file, so it only matters for the uploaded copy.
//
// Run after swapping in a new Unity build, then upload the build *and* the
// manifest:  npm run game:manifest

import { readdir, writeFile } from 'fs/promises';
import path from 'path';

const GAME_DIR = path.join(process.cwd(), 'public', 'game');
const BUILD_DIR = path.join(GAME_DIR, 'Build');
const OUT = path.join(GAME_DIR, 'manifest.json');

const files = await readdir(BUILD_DIR);

if (!files.some((f) => f.endsWith('.loader.js'))) {
  console.error(`Chyba: v ${BUILD_DIR} nie je žiadny *.loader.js — je build kompletný?`);
  process.exit(1);
}

await writeFile(OUT, JSON.stringify(files, null, 2) + '\n');
console.log(`Zapísané ${OUT} (${files.length} súborov)`);
