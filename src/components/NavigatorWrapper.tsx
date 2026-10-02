'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { UnityInstance } from './UnityGame';
import { NAVIGATOR_BAR, NAVIGATOR_WINDOW } from '@/lib/navigator-window';

const UnityGame = dynamic(() => import('./UnityGame'), { ssr: false });

const PRODUCT = {
  companyName: 'Crimsoned Rose',
  productName: 'FriWorld Navigator',
  productVersion: '0.1.0',
};

const SPEEDS = [0.5, 1, 2];

/** What a failed flight means, by the code the Navigator sends with navigator:error. */
const ERRORS: Record<string, string> = {
  'unknown-room': 'Túto miestnosť Navigator nepozná.',
  'no-path': 'K tejto miestnosti sa nepodarilo nájsť cestu.',
  'start-off-navmesh': 'Navigator nemá odkiaľ vyštartovať — štart nestojí na podlahe.',
  'not-set-up': 'Navigator nie je nastavený.',
};

const clock = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

const speedLabel = (s: number) => `${String(s).replace('.', ',')}×`;

/**
 * The Navigator build, flying to one room, with controls like a video in a thin
 * strip under the picture. Its NavigatorController sits on the scene object
 * "Navigator": it starts on Go and takes Play, Pause, Seek and SetSpeed. What the
 * flight does comes back as window events (NavigatorPage.jslib in the Unity
 * project): navigator:ready {duration}, navigator:time {time, playing},
 * navigator:ended and navigator:error {code}.
 */
export default function NavigatorWrapper({ code }: { code: string }) {
  const instanceRef = useRef<UnityInstance | null>(null);
  // While the seek bar is held, the reported time must not pull it back.
  const seekingRef = useRef(false);

  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [error, setError] = useState<string | null>(null);
  // Known only in the browser: opened as the room window from the Navigator page,
  // and whether this page can go fullscreen at all (an iPhone cannot).
  const [inWindow, setInWindow] = useState(false);
  const [canFullscreen, setCanFullscreen] = useState(false);

  useEffect(() => {
    setInWindow(window.name === NAVIGATOR_WINDOW && !!window.opener);
    setCanFullscreen(document.fullscreenEnabled);

    const onReady = (e: Event) => {
      setDuration((e as CustomEvent<{ duration: number }>).detail.duration);
      setTime(0);
      setPlaying(true);
      setEnded(false);
    };
    const onTime = (e: Event) => {
      const { time, playing } = (e as CustomEvent<{ time: number; playing: boolean }>).detail;
      if (!seekingRef.current) setTime(time);
      setPlaying(playing);
      if (playing) setEnded(false);
    };
    const onEnded = () => {
      setEnded(true);
      setPlaying(false);
    };
    const onError = (e: Event) => {
      const { code } = (e as CustomEvent<{ code: string }>).detail;
      setError(ERRORS[code] ?? `Navigácia zlyhala (${code}).`);
    };

    window.addEventListener('navigator:ready', onReady);
    window.addEventListener('navigator:time', onTime);
    window.addEventListener('navigator:ended', onEnded);
    window.addEventListener('navigator:error', onError);
    return () => {
      window.removeEventListener('navigator:ready', onReady);
      window.removeEventListener('navigator:time', onTime);
      window.removeEventListener('navigator:ended', onEnded);
      window.removeEventListener('navigator:error', onError);
    };
  }, []);

  const send = useCallback((method: string, value?: number) => {
    instanceRef.current?.SendMessage('Navigator', method, value);
  }, []);

  // Play after the end starts the flight over; the Navigator does that itself.
  const togglePlay = () => {
    if (playing) {
      send('Pause');
      setPlaying(false);
    } else {
      send('Play');
      setPlaying(true);
      setEnded(false);
    }
  };

  const seek = (seconds: number) => {
    setTime(seconds);
    send('Seek', seconds);
  };

  const nextSpeed = () => {
    const s = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
    setSpeed(s);
    send('SetSpeed', s);
  };

  // The whole page, not Unity's canvas alone, so the controls stay under the picture.
  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen().catch(() => {});
  };

  const bar = error ? (
    <p className="flex h-full items-center justify-center px-4 text-center text-xs font-bold text-white/75">
      {error}
    </p>
  ) : duration > 0 ? (
    <div className="flex h-full items-center gap-2 px-2 sm:gap-3 sm:px-3">
      <button
        onClick={togglePlay}
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent text-ink transition hover:brightness-95"
        aria-label={playing ? 'Pauza' : ended ? 'Znova' : 'Prehrať'}
        title={playing ? 'Pauza' : ended ? 'Znova' : 'Prehrať'}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          {playing ? (
            <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
          ) : ended ? (
            <path d="M12 5V2L7 6l5 4V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z" />
          ) : (
            <path d="M8 5v14l11-7z" />
          )}
        </svg>
      </button>

      <input
        type="range"
        min={0}
        max={duration}
        step={0.1}
        value={Math.min(time, duration)}
        onPointerDown={() => (seekingRef.current = true)}
        onPointerUp={() => (seekingRef.current = false)}
        onPointerCancel={() => (seekingRef.current = false)}
        onChange={(e) => seek(Number(e.target.value))}
        className="h-1 min-w-0 flex-1 cursor-pointer"
        style={{ accentColor: 'var(--color-accent)' }}
        aria-label="Pretáčanie"
      />

      <span className="shrink-0 text-[11px] font-bold tabular-nums text-white/65">
        {clock(time)} / {clock(duration)}
      </span>

      <button
        onClick={nextSpeed}
        className="h-7 min-w-[2.5rem] shrink-0 rounded-full border border-white/20 px-1.5 text-[11px] font-bold text-white/80 transition hover:border-white/45"
        aria-label="Rýchlosť"
        title="Rýchlosť"
      >
        {speedLabel(speed)}
      </button>

      {canFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-white/75 transition hover:bg-white/10"
          aria-label="Celá obrazovka"
          title="Celá obrazovka"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
        </button>
      )}
    </div>
  ) : null;

  return (
    <UnityGame
      api="/api/navigator"
      product={PRODUCT}
      title={code}
      loadingText="Hľadám cestu…"
      errorTitle="Navigáciu sa nepodarilo spustiť"
      homeHref="/navigator"
      homeLabel={inWindow ? 'Zavrieť' : 'Miestnosti'}
      homeTitle={inWindow ? 'Zavrieť okno' : 'Späť na zoznam miestností'}
      onHome={inWindow ? () => window.close() : undefined}
      onReady={(instance: UnityInstance) => {
        instanceRef.current = instance;
        instance.SendMessage('Navigator', 'Go', code);
      }}
      controlsBar={bar}
      controlsBarHeight={NAVIGATOR_BAR}
      fullscreenButton={false}
    />
  );
}
