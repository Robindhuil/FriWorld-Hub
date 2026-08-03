import { resolveBuild } from '@/lib/game-build';

/**
 * Serves the Unity pthread worker from our own origin.
 *
 * Unity calls `new Worker(workerUrl)`, and the Worker constructor rejects
 * cross-origin scripts outright — a same-origin URL is the only way a
 * multithreaded build can start when the rest of it lives on object storage.
 * The script is ~2 KB and contains no paths of its own; it receives the
 * framework URL by postMessage and loads it with importScripts, which browsers
 * do allow across origins.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const build = await resolveBuild();

  if (typeof build === 'string' || !build.workerUrl) {
    return new Response('// Unity worker not found\n', {
      status: 404,
      headers: { 'Content-Type': 'text/javascript; charset=utf-8' },
    });
  }

  const upstream = await fetch(build.workerUrl, { cache: 'no-store' });
  if (!upstream.ok) {
    return new Response('// Unity worker unavailable\n', {
      status: 502,
      headers: { 'Content-Type': 'text/javascript; charset=utf-8' },
    });
  }

  return new Response(await upstream.text(), {
    headers: {
      'Content-Type': 'text/javascript; charset=utf-8',
      // Short-lived: the body changes whenever the build is swapped, and it is
      // only 2 KB, so there is nothing to gain from caching it hard.
      'Cache-Control': 'public, max-age=60',
    },
  });
}
