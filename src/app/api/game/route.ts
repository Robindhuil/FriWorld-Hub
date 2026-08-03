import { NextResponse } from 'next/server';
import { EXTERNAL_BASE, resolveBuild } from '@/lib/game-build';

// Always re-resolve so a freshly dropped-in build is picked up without
// restarting or rebuilding the app.
export const dynamic = 'force-dynamic';

export async function GET() {
  const build = await resolveBuild();

  if (typeof build === 'string') {
    return NextResponse.json({ error: build }, { status: 404 });
  }

  // Unity starts its thread pool with `new Worker(workerUrl)`, and browsers
  // refuse worker scripts from another origin — so an externally hosted worker
  // can never load directly, no matter how CORS is configured. Hand out our own
  // proxy instead; it is same-origin, and the 2 KB script it serves pulls the
  // heavy framework from storage itself via importScripts (which *is* allowed
  // cross-origin). Everything else keeps pointing straight at storage.
  const workerUrl =
    build.workerUrl && EXTERNAL_BASE ? '/api/game/worker' : build.workerUrl;

  return NextResponse.json({ ...build, ...(workerUrl ? { workerUrl } : {}) });
}
