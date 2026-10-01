// Uploads public/game to Cloudflare R2, mirroring it: files gone locally are
// deleted remotely, so swapping a build does not leave the previous one behind.
//
// Credentials come from the environment and are never stored:
//   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY
//   R2_BUCKET (optional, defaults to friworld-web)
//
//   npm run game:upload            upload
//   npm run game:upload -- --dry   show what would change, touch nothing

import { readdir, stat, createReadStream } from 'fs';
import path from 'path';
import { promisify } from 'util';
import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

const readdirAsync = promisify(readdir);
const statAsync = promisify(stat);

const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET = 'friworld-web',
} = process.env;

const missing = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY'].filter(
  (k) => !process.env[k],
);
if (missing.length) {
  console.error(`Chýbajú premenné: ${missing.join(', ')}`);
  process.exit(1);
}

const DRY = process.argv.includes('--dry');
const ROOT = path.join(process.cwd(), 'public', 'game');

// Build files carry their version in the name and never change, so they can be
// cached indefinitely. The manifest names them, so it must not be.
const IMMUTABLE = 'public, max-age=31536000, immutable';
const MANIFEST = 'public, max-age=60';

// Unity's loader picks the streaming WebAssembly path only when the response
// says application/wasm, and .data must not be sniffed as anything else.
const TYPES = {
  '.wasm': 'application/wasm',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.data': 'application/octet-stream',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

async function walk(dir, base = '') {
  const out = [];
  for (const entry of await readdirAsync(dir)) {
    const full = path.join(dir, entry);
    const key = base ? `${base}/${entry}` : entry;
    if ((await statAsync(full)).isDirectory()) out.push(...(await walk(full, key)));
    else out.push({ key, full });
  }
  return out;
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function listRemote() {
  const keys = [];
  let token;
  do {
    const res = await s3.send(
      new ListObjectsV2Command({ Bucket: R2_BUCKET, ContinuationToken: token }),
    );
    for (const o of res.Contents ?? []) keys.push(o.Key);
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  return keys;
}

const mb = (n) => (n / 1048576).toFixed(1);

async function putOne(file) {
  const ext = path.extname(file.key).toLowerCase();
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: R2_BUCKET,
      Key: file.key,
      Body: createReadStream(file.full),
      ContentType: TYPES[ext] ?? 'application/octet-stream',
      CacheControl: file.key === 'manifest.json' ? MANIFEST : IMMUTABLE,
    },
    queueSize: 4,
    partSize: 16 * 1024 * 1024,
  });
  await upload.done();
}

const local = await walk(ROOT);
const remote = await listRemote();
const stale = remote.filter((k) => !local.some((f) => f.key === k));
const total = (await Promise.all(local.map((f) => statAsync(f.full)))).reduce(
  (a, s) => a + s.size,
  0,
);

console.log(`Lokálne: ${local.length} súborov, ${mb(total)} MB`);
console.log(`V buckete: ${remote.length} súborov`);
if (stale.length) console.log(`Na zmazanie: ${stale.length}\n  ${stale.join('\n  ')}`);

if (DRY) {
  console.log('\n--dry: nič sa nezmenilo.');
  process.exit(0);
}

let done = 0;
// Sequential on purpose: each file already uploads its parts in parallel, and
// this keeps the progress line honest about which file is going up.
for (const file of local) {
  const size = (await statAsync(file.full)).size;
  process.stdout.write(`[${++done}/${local.length}] ${file.key} (${mb(size)} MB) ... `);
  await putOne(file);
  console.log('ok');
}

// Only after every upload succeeded - a half-finished mirror should not have
// deleted the build that is still serving players.
if (stale.length) {
  await s3.send(
    new DeleteObjectsCommand({
      Bucket: R2_BUCKET,
      Delete: { Objects: stale.map((Key) => ({ Key })) },
    }),
  );
  console.log(`Zmazaných ${stale.length} starých súborov.`);
}

console.log('Hotovo.');
