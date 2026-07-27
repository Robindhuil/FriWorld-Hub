import { readdir } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

// Always re-scan the directory so a freshly dropped-in build is picked up
// without restarting or rebuilding the app.
export const dynamic = 'force-dynamic';

const BUILD_DIR = path.join(process.cwd(), 'public', 'game', 'Build');

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

export async function GET() {
  let files: string[];
  try {
    files = await readdir(BUILD_DIR);
  } catch {
    return NextResponse.json(
      { error: 'Build folder not found. Expected files in public/game/Build.' },
      { status: 404 },
    );
  }

  // The loader script is the anchor — its prefix names the whole build.
  const loader = files.find((f) => f.endsWith('.loader.js'));
  if (!loader) {
    return NextResponse.json(
      { error: 'No *.loader.js found in public/game/Build. Is the Unity build complete?' },
      { status: 404 },
    );
  }
  const prefix = loader.slice(0, -'.loader.js'.length);

  const dataFile = pick(files, prefix, 'data');
  const frameworkFile = pick(files, prefix, 'framework.js');
  const wasmFile = pick(files, prefix, 'wasm');

  if (!dataFile || !frameworkFile || !wasmFile) {
    return NextResponse.json(
      { error: `Build "${prefix}" is missing data, framework, or wasm files.` },
      { status: 404 },
    );
  }

  const base = '/game/Build';
  return NextResponse.json({
    loaderUrl: `${base}/${loader}`,
    dataUrl: `${base}/${dataFile}`,
    frameworkUrl: `${base}/${frameworkFile}`,
    codeUrl: `${base}/${wasmFile}`,
    streamingAssetsUrl: '/game/StreamingAssets',
  });
}
