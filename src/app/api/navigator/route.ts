import { NextResponse } from 'next/server';
import { BUILDS, resolveBuild } from '@/lib/game-build';

// The Navigator build's file URLs — the same contract as /api/game.
export const dynamic = 'force-dynamic';

export async function GET() {
  const build = await resolveBuild('navigator');

  if (typeof build === 'string') {
    return NextResponse.json({ error: build }, { status: 404 });
  }

  // A worker on object storage cannot start (see /api/game), so hand out our
  // same-origin proxy when the build is hosted there.
  const workerUrl =
    build.workerUrl && BUILDS.navigator.external ? '/api/navigator/worker' : build.workerUrl;

  return NextResponse.json({ ...build, ...(workerUrl ? { workerUrl } : {}) });
}
