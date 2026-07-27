'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Robust wrapper around a Unity 6 "Web" build living in /public/game.
 *
 * Handles the common failure modes of embedding a Unity WebGL build in React:
 *  - non-idempotent createUnityInstance (single init, hard guard)
 *  - memory leak on navigation (Quit() the instance on unmount)
 *  - distorted / janky rendering (fixed 16:9 letterbox, stable canvas size)
 *  - in-game "Exit" freezing the tab (detect quit via WebGL context loss)
 *  - WebGL unsupported, file/loader load failure, runtime errors
 *
 * Swapping the build: drop the new export into /public/game/Build with any
 * file names. The /api/game route auto-detects the build prefix, so no code
 * change is needed when the build name changes.
 */

type UnityInstance = {
  SetFullscreen: (value: number) => void;
  Quit: () => Promise<void>;
  // Unity exposes the emscripten Module on the instance. QuitCleanup() is the
  // function Unity invokes when the game calls Application.Quit().
  Module?: { QuitCleanup?: () => void };
};

type GameManifest = {
  loaderUrl: string;
  dataUrl: string;
  frameworkUrl: string;
  codeUrl: string;
  streamingAssetsUrl: string;
};

declare global {
  interface Window {
    createUnityInstance?: (
      canvas: HTMLCanvasElement,
      config: Record<string, unknown>,
      onProgress?: (progress: number) => void,
    ) => Promise<UnityInstance>;
  }
}

// Stable identity for save data — keep these constant across build swaps so
// player progress (stored under this path) survives a new build.
const PRODUCT = {
  companyName: 'Crimsoned Rose',
  productName: 'FriWorld',
  productVersion: '0.1.0',
};

type Status = 'loading' | 'ready' | 'error';

export default function UnityGame() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instanceRef = useRef<UnityInstance | null>(null);
  const startedRef = useRef(false);
  // True when WE tear down (Menu button / navigation) vs the game quitting
  // itself — lets us tell an intentional exit from an in-game Application.Quit.
  const intentionalQuitRef = useRef(false);

  const [status, setStatus] = useState<Status>('loading');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Hard guard: createUnityInstance must run exactly once for this mount.
    if (startedRef.current) return;
    startedRef.current = true;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    let quitWhenReady = false;

    // 1) Fail fast if the device can't run WebGL at all.
    const probe = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!probe) {
      setStatus('error');
      setMessage('Tvoj prehliadač alebo zariadenie nepodporuje WebGL, ktorý je potrebný na spustenie hry.');
      return;
    }

    const startInstance = (manifest: GameManifest) => {
      if (cancelled || !window.createUnityInstance) return;

      const config: Record<string, unknown> = {
        dataUrl: manifest.dataUrl,
        frameworkUrl: manifest.frameworkUrl,
        codeUrl: manifest.codeUrl,
        streamingAssetsUrl: manifest.streamingAssetsUrl,
        ...PRODUCT,
        // Cap device pixel ratio so high-DPI screens don't blow the render
        // target up to 2x–3x and tank the framerate.
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        // Surface Unity's own warnings/errors through our UI, not a banner.
        showBanner: (msg: string, type?: string) => {
          if (cancelled) return;
          if (type === 'error') {
            setStatus('error');
            setMessage(msg);
          } else {
            setMessage(msg);
          }
        },
      };

      window
        .createUnityInstance(canvas, config, (p) => {
          if (!cancelled) setProgress(Math.round(p * 100));
        })
        .then((instance) => {
          // The component unmounted while loading: tear the instance down now.
          if (cancelled || quitWhenReady) {
            instance.Quit().catch(() => {});
            return;
          }
          instanceRef.current = instance;

          // Detect an in-game Exit (Application.Quit). This build calls
          // Module.QuitCleanup() on quit and then freezes the canvas — it does
          // NOT lose the WebGL context — so wrap that cleanup to send the
          // player back to the homepage instead of leaving a dead, frozen tab.
          const mod = instance.Module;
          if (mod && typeof mod.QuitCleanup === 'function') {
            const originalCleanup = mod.QuitCleanup.bind(mod);
            mod.QuitCleanup = () => {
              originalCleanup();
              if (cancelled || intentionalQuitRef.current) return;
              intentionalQuitRef.current = true;
              instanceRef.current = null;
              router.push('/');
            };
          }

          setStatus('ready');
        })
        .catch((err) => {
          if (!cancelled) {
            setStatus('error');
            setMessage(String(err?.message ?? err));
          }
        });
    };

    const loadLoaderScript = (manifest: GameManifest) => {
      const onReady = () => startInstance(manifest);
      const existing = document.querySelector<HTMLScriptElement>(
        `script[src="${manifest.loaderUrl}"]`,
      );
      if (window.createUnityInstance) {
        onReady();
      } else if (existing) {
        existing.addEventListener('load', onReady, { once: true });
      } else {
        const script = document.createElement('script');
        script.src = manifest.loaderUrl;
        script.async = true;
        script.onload = onReady;
        script.onerror = () => {
          if (!cancelled) {
            setStatus('error');
            setMessage('Nepodarilo sa načítať skript hry.');
          }
        };
        document.body.appendChild(script);
      }
    };

    // Ask the server which build files exist, then load them. This makes build
    // swaps drop-in: any file names work, no code change required.
    fetch('/api/game', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `Nepodarilo sa nájsť zostavu hry (${res.status}).`);
        }
        return res.json() as Promise<GameManifest>;
      })
      .then((manifest) => {
        if (!cancelled) loadLoaderScript(manifest);
      })
      .catch((err) => {
        if (!cancelled) {
          setStatus('error');
          setMessage(String(err?.message ?? err));
        }
      });

    // Fallback signal: some builds/GPUs drop the WebGL context on quit. This
    // build does not (the QuitCleanup wrap above handles it), but keep this for
    // robustness across builds and GPU resets.
    const onContextLost = (e: Event) => {
      e.preventDefault();
      if (cancelled || intentionalQuitRef.current) return;
      intentionalQuitRef.current = true;
      instanceRef.current = null;
      router.push('/');
    };
    canvas.addEventListener('webglcontextlost', onContextLost);

    return () => {
      cancelled = true;
      canvas.removeEventListener('webglcontextlost', onContextLost);
      const inst = instanceRef.current;
      if (inst) {
        instanceRef.current = null;
        intentionalQuitRef.current = true;
        inst.Quit().catch(() => {});
      } else {
        // Instance still loading — tell the resolve handler to quit on arrival.
        quitWhenReady = true;
      }
    };
  }, []);

  const exitToHome = useCallback(async () => {
    intentionalQuitRef.current = true;
    try {
      await instanceRef.current?.Quit();
    } catch {
      /* ignore */
    }
    router.push('/');
  }, [router]);

  const toggleFullscreen = useCallback(() => {
    instanceRef.current?.SetFullscreen(1);
  }, []);

  const reload = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <div className="fixed inset-0 bg-[#141414]">
      {/* Letterboxed 16:9 stage — preserves aspect ratio, no stretching. */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="relative bg-black"
          style={{ width: 'min(100vw, calc(100vh * 16 / 9))', aspectRatio: '16 / 9' }}
        >
          <canvas
            ref={canvasRef}
            id="unity-canvas"
            width={1920}
            height={1080}
            tabIndex={-1}
            className="block h-full w-full focus:outline-none"
          />
        </div>
      </div>

      {/* Floating controls — always available so the player is never stuck. */}
      <div className="pointer-events-none absolute inset-0">
        <button
          onClick={exitToHome}
          className="pointer-events-auto absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-1.5 text-sm font-bold text-ink shadow-sm backdrop-blur transition hover:bg-white"
          title="Späť na úvod"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Domov
        </button>

        {status === 'ready' && (
          <button
            onClick={toggleFullscreen}
            className="pointer-events-auto absolute bottom-4 right-4 rounded-full bg-white/90 p-2.5 text-ink shadow-sm backdrop-blur transition hover:bg-white"
            title="Celá obrazovka"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          </button>
        )}
      </div>

      {/* Loading overlay */}
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-paper">
          <div className="mb-8 text-center">
            <span className="inline-grid h-14 w-14 -rotate-6 place-items-center rounded-2xl bg-accent font-display text-3xl font-bold text-ink">
              F
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold text-ink">FriWorld</h1>
            <p className="mt-1 text-sm font-bold text-ink/45">{message ?? 'Načítavam fakultu…'}</p>
          </div>
          <div className="h-2.5 w-64 overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 text-sm font-bold tabular-nums text-ink/40">{progress}%</p>
        </div>
      )}

      {/* Error overlay */}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-paper px-6">
          <div className="w-full max-w-md rounded-[2rem] border-2 border-ink/10 bg-surface p-8 text-center">
            <div className="mx-auto grid h-12 w-12 -rotate-6 place-items-center rounded-2xl bg-accent-soft text-2xl">
              😅
            </div>
            <p className="mt-4 font-display text-lg font-bold text-ink">Hru sa nepodarilo spustiť</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/50">{message}</p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={reload}
                className="rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-ink transition hover:brightness-95"
              >
                Skúsiť znova
              </button>
              <button
                onClick={() => router.push('/')}
                className="rounded-full border-2 border-ink/15 px-6 py-2.5 text-sm font-bold text-ink/70 transition hover:border-ink/30 hover:text-ink"
              >
                Späť domov
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
