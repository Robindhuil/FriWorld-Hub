import { resolveBuild } from '@/lib/game-build';

/**
 * Serves the Navigator's Unity pthread worker from our own origin, for the same
 * reason as /api/game/worker: `new Worker()` refuses cross-origin scripts.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const build = await resolveBuild('navigator');

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
      'Cache-Control': 'public, max-age=60',
    },
  });
}
