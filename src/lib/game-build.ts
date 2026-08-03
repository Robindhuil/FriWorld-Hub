import { readdir } from 'fs/promises';
import path from 'path';

/**
 * Locates the Unity build's files, wherever they are hosted.
 *
 * GAME_BASE_URL unset (local dev) — files come from public/game, served by Next.
 * GAME_BASE_URL set (production)  — files live on object storage (Cloudflare R2),
 *                                   because the build is far too large for Vercel.
 *
 * Server-side only: the browser never sees the raw base, just finished URLs.
 */
export const EXTERNAL_BASE = process.env.GAME_BASE_URL?.replace(/\/+$/, '') ?? '';

const BUILD_DIR = path.join(process.cwd(), 'public', 'game', 'Build');

export type BuildUrls = {
  loaderUrl: string;
  dataUrl: string;
  frameworkUrl: string;
  codeUrl: string;
  /** Present only for multithreaded builds. */
  workerUrl?: string;
  streamingAssetsUrl: string;
};

// Unity may emit raw or compressed assets depending on the build's
// "Compression Format" / "Decompression Fallback" settings.
function pick(files: string[], prefix: string, base: string): string | undefined {
  const candidates = [
    `${prefix}.${base}`,
    `${prefix}.${base}.br`,
    `${prefix}.${base}.gz`,
    `${prefix}.${base}.unityweb`,
  ];
  return candidates.find((c) => files.includes(c));
}

/** Turn a listing of Build/ into absolute URLs, or return a message explaining why not. */
function urlsFrom(files: string[], base: string): BuildUrls | string {
  // The loader script is the anchor — its prefix names the whole build.
  const loader = files.find((f) => f.endsWith('.loader.js'));
  if (!loader) return 'V zostave sa nenašiel žiadny *.loader.js. Je build Unity kompletný?';

  const prefix = loader.slice(0, -'.loader.js'.length);
  const data = pick(files, prefix, 'data');
  const framework = pick(files, prefix, 'framework.js');
  const code = pick(files, prefix, 'wasm');

  if (!data || !framework || !code) {
    return `Zostave "${prefix}" chýbajú súbory data, framework alebo wasm.`;
  }

  // Multithreaded builds ship a worker script. The loader resolves it through
  // config.workerUrl — leave it out and the worker load fails with an opaque
  // error event. Single-threaded builds emit no worker file, so this is optional.
  const worker = pick(files, prefix, 'worker.js');

  return {
    loaderUrl: `${base}/Build/${loader}`,
    dataUrl: `${base}/Build/${data}`,
    frameworkUrl: `${base}/Build/${framework}`,
    codeUrl: `${base}/Build/${code}`,
    ...(worker ? { workerUrl: `${base}/Build/${worker}` } : {}),
    streamingAssetsUrl: `${base}/StreamingAssets`,
  };
}

/**
 * Object storage serves no directory listing over plain HTTP, so an externally
 * hosted build ships a manifest.json alongside it. Regenerate and re-upload it
 * after a build swap: `npm run game:manifest`.
 */
async function resolveExternal(): Promise<BuildUrls | string> {
  let res: Response;
  try {
    res = await fetch(`${EXTERNAL_BASE}/manifest.json`, { cache: 'no-store' });
  } catch {
    return 'Úložisko s hrou je nedostupné. Skús to prosím o chvíľu znova.';
  }
  if (!res.ok) {
    return `Na úložisku chýba manifest.json (${res.status}). Nahraj ho spolu s buildom.`;
  }
  try {
    return urlsFrom((await res.json()) as string[], EXTERNAL_BASE);
  } catch {
    return 'Manifest hry je poškodený.';
  }
}

async function resolveLocal(): Promise<BuildUrls | string> {
  try {
    return urlsFrom(await readdir(BUILD_DIR), '/game');
  } catch {
    return 'Priečinok so zostavou sa nenašiel. Očakávam súbory v public/game/Build.';
  }
}

/** Resolves the current build, or a Slovak message describing what is wrong. */
export function resolveBuild(): Promise<BuildUrls | string> {
  return EXTERNAL_BASE ? resolveExternal() : resolveLocal();
}
