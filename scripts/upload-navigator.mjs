// Uploads the Navigator build in public/navigator to its own Cloudflare R2 bucket.
//
// Unity names the Navigator's files Web.* in every build, so unlike the game's
// versioned ones they cannot simply get a year of immutable cache. Each build
// goes up under Build/<hash>/ instead, the hash taken from the files themselves:
// a new build is a new path, the same build the same path, which is not sent
// again. manifest.json names that path; it and rooms.json are cached only for a
// minute, so a new upload shows within one.
//
// The bucket is mirrored — what the new build does not need is deleted once
// everything is up — so it has to be the Navigator's own. The game's bucket is
// refused: its files would be deleted.
//
// Credentials come from the environment and are never stored:
//   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY
//   R2_NAVIGATOR_BUCKET (optional, defaults to friworld-navigator)
//
//   npm run navigator:upload               upload
//   npm run navigator:upload -- --dry      show what would change, touch nothing
//   npm run navigator:upload -- --to DIR   write the bucket's layout into DIR
//                                          instead, no credentials needed

import { createHash } from 'crypto';
import { createReadStream, existsSync } from 'fs';
import { mkdir, readdir, stat, writeFile, copyFile } from 'fs/promises';
import path from 'path';

const GAME_BUCKET = 'friworld-web';
const ROOT = path.join(process.cwd(), 'public', 'navigator');
const BUILD = path.join(ROOT, 'Build');

const IMMUTABLE = 'public, max-age=31536000, immutable';
const SHORT = 'public, max-age=60';

// Unity's loader picks the streaming WebAssembly path only when the response
// says application/wasm, and .data must not be sniffed as anything else.
const TYPES = {
  '.wasm': 'application/wasm',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.data': 'application/octet-stream',
};

const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const TO = args.includes('--to') ? args[args.indexOf('--to') + 1] : undefined;

const fail = (message) => {
  console.error(message);
  process.exit(1);
};
const mb = (n) => (n / 1048576).toFixed(1);

async function walk(dir, base) {
  const out = [];
  for (const entry of await readdir(dir)) {
    const full = path.join(dir, entry);
    const key = `${base}/${entry}`;
    if ((await stat(full)).isDirectory()) out.push(...(await walk(full, key)));
    else out.push({ key, full });
  }
  return out;
}

/** Twelve hex digits of SHA-256 over the build files' names and contents. */
async function hashOf(names) {
  const hash = createHash('sha256');
  for (const name of names) {
    hash.update(`${name}\0`);
    for await (const chunk of createReadStream(path.join(BUILD, name))) hash.update(chunk);
  }
  return hash.digest('hex').slice(0, 12);
}

// --- What the bucket should hold ---------------------------------------------

if (!existsSync(BUILD)) fail(`Chýba ${BUILD}. Skopíruj sem výstup Navigator → Build Web.`);
const names = (await readdir(BUILD)).sort();
if (!names.some((n) => n.endsWith('.loader.js'))) {
  fail(`V ${BUILD} nie je žiadny *.loader.js — je build kompletný?`);
}
if (!existsSync(path.join(ROOT, 'rooms.json'))) {
  fail('Chýba public/navigator/rooms.json. Build Web ho zapisuje vedľa index.html.');
}

const id = await hashOf(names);
const objects = names.map((n) => ({
  key: `Build/${id}/${n}`,
  full: path.join(BUILD, n),
  cache: IMMUTABLE,
}));
if (existsSync(path.join(ROOT, 'StreamingAssets'))) {
  for (const f of await walk(path.join(ROOT, 'StreamingAssets'), 'StreamingAssets')) {
    objects.push({ ...f, cache: SHORT });
  }
}
// The manifest switches the site to the new build, so it goes up after the
// build files; rooms.json right after it.
objects.push({ key: 'manifest.json', body: JSON.stringify(names.map((n) => `${id}/${n}`), null, 2) + '\n', cache: SHORT });
objects.push({ key: 'rooms.json', full: path.join(ROOT, 'rooms.json'), cache: SHORT });

const sizeOf = async (o) => (o.body !== undefined ? Buffer.byteLength(o.body) : (await stat(o.full)).size);
const total = (await Promise.all(objects.map(sizeOf))).reduce((a, n) => a + n, 0);
console.log(`Build ${id}: ${objects.length} súborov, ${mb(total)} MB`);

// --- Into a folder, for checking the layout locally ---------------------------

if (TO) {
  for (const o of objects) {
    const target = path.join(TO, ...o.key.split('/'));
    await mkdir(path.dirname(target), { recursive: true });
    if (o.body !== undefined) await writeFile(target, o.body);
    else await copyFile(o.full, target);
  }
  console.log(`Zapísané do ${TO}.`);
  process.exit(0);
}

// --- Into the bucket ------------------------------------------------------------

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_NAVIGATOR_BUCKET = 'friworld-navigator' } = process.env;
const missing = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY'].filter((k) => !process.env[k]);
if (missing.length) fail(`Chýbajú premenné: ${missing.join(', ')}`);
if (R2_NAVIGATOR_BUCKET === GAME_BUCKET) {
  fail(`${GAME_BUCKET} je bucket hry — zrkadlenie by z neho zmazalo hru. Navigator potrebuje vlastný.`);
}

const { S3Client, ListObjectsV2Command, DeleteObjectsCommand } = await import('@aws-sdk/client-s3');
const { Upload } = await import('@aws-sdk/lib-storage');

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

const remote = [];
let token;
do {
  const res = await s3.send(new ListObjectsV2Command({ Bucket: R2_NAVIGATOR_BUCKET, ContinuationToken: token }));
  for (const o of res.Contents ?? []) remote.push(o.Key);
  token = res.IsTruncated ? res.NextContinuationToken : undefined;
} while (token);

// A build path that is already there holds the very same files.
const send = objects.filter((o) => !(o.key.startsWith(`Build/${id}/`) && remote.includes(o.key)));
const stale = remote.filter((k) => !objects.some((o) => o.key === k));

console.log(`V buckete ${R2_NAVIGATOR_BUCKET}: ${remote.length} súborov`);
console.log(`Na nahratie: ${send.length}${send.length < objects.length ? ` (build ${id} tam už je)` : ''}`);
if (stale.length) console.log(`Na zmazanie: ${stale.length}\n  ${stale.join('\n  ')}`);

if (DRY) {
  console.log('\n--dry: nič sa nezmenilo.');
  process.exit(0);
}

let done = 0;
for (const o of send) {
  process.stdout.write(`[${++done}/${send.length}] ${o.key} (${mb(await sizeOf(o))} MB) ... `);
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: R2_NAVIGATOR_BUCKET,
      Key: o.key,
      Body: o.body !== undefined ? o.body : createReadStream(o.full),
      ContentType: TYPES[path.extname(o.key).toLowerCase()] ?? 'application/octet-stream',
      CacheControl: o.cache,
    },
    queueSize: 4,
    partSize: 16 * 1024 * 1024,
  });
  await upload.done();
  console.log('ok');
}

// Only after everything is up: until the new manifest is in place, the old
// build is still the one being served.
if (stale.length) {
  await s3.send(new DeleteObjectsCommand({ Bucket: R2_NAVIGATOR_BUCKET, Delete: { Objects: stale.map((Key) => ({ Key })) } }));
  console.log(`Zmazaných ${stale.length} starých súborov.`);
}

console.log('Hotovo.');
