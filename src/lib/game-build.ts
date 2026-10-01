import { readdir, readFile } from 'fs/promises';
import path from 'path';

/**
 * Locates a Unity build's files, wherever they are hosted. There are two builds:
 * the game (FriWorld) and the Navigator, each with its own folder and base URL.
 *
 * Base URL unset (local dev) — files come from public/<folder>, served by Next.
 * Base URL set (production)  — files live on object storage (Cloudflare R2),
 *                              because the builds are far too large for Vercel.
 *
 * Server-side only: the browser never sees the raw base, just finished URLs.
 */
const source = (baseUrl: string | undefined, folder: string) => ({
  external: baseUrl?.replace(/\/+$/, '') ?? '',
  folder,
  dir: path.join(process.cwd(), 'public', folder),
});

export const BUILDS = {
  game: source(process.env.GAME_BASE_URL, 'game'),
  navigator: source(process.env.NAVIGATOR_BASE_URL, 'navigator'),
};

export type BuildName = keyof typeof BUILDS;

/** The game's base URL on object storage; empty in local dev. */
export const EXTERNAL_BASE = BUILDS.game.external;

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
async function resolveExternal(base: string): Promise<BuildUrls | string> {
  let res: Response;
  try {
    res = await fetch(`${base}/manifest.json`, { cache: 'no-store' });
  } catch {
    return 'Úložisko so zostavou je nedostupné. Skús to prosím o chvíľu znova.';
  }
  if (!res.ok) {
    return `Na úložisku chýba manifest.json (${res.status}). Nahraj ho spolu s buildom.`;
  }
  try {
    return urlsFrom((await res.json()) as string[], base);
  } catch {
    return 'Manifest zostavy je poškodený.';
  }
}

async function resolveLocal(dir: string, folder: string): Promise<BuildUrls | string> {
  try {
    return urlsFrom(await readdir(path.join(dir, 'Build')), `/${folder}`);
  } catch {
    return `Priečinok so zostavou sa nenašiel. Očakávam súbory v public/${folder}/Build.`;
  }
}

/** Resolves the current build, or a Slovak message describing what is wrong. */
export function resolveBuild(name: BuildName = 'game'): Promise<BuildUrls | string> {
  const build = BUILDS[name];
  return build.external ? resolveExternal(build.external) : resolveLocal(build.dir, build.folder);
}

/**
 * The room codes the Navigator build can fly to. Its build ships them in
 * rooms.json beside index.html, so the list always matches what is uploaded.
 */
export async function resolveNavigatorRooms(): Promise<string[] | string> {
  const { external, dir } = BUILDS.navigator;
  let text: string;
  try {
    if (external) {
      const res = await fetch(`${external}/rooms.json`, { cache: 'no-store' });
      if (!res.ok) return `Na úložisku chýba rooms.json Navigatora (${res.status}).`;
      text = await res.text();
    } else {
      text = await readFile(path.join(dir, 'rooms.json'), 'utf8');
    }
  } catch {
    return 'Navigator ešte nie je nahratý — chýba jeho zostava so zoznamom miestností.';
  }

  try {
    const rooms: unknown = JSON.parse(text);
    if (Array.isArray(rooms) && rooms.every((r) => typeof r === 'string')) return rooms;
  } catch {
    /* falls through */
  }
  return 'Zoznam miestností Navigatora je poškodený.';
}
