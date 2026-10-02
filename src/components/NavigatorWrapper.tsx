'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { UnityInstance } from './UnityGame';

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
 * The Navigator build, flying to one room, with controls like a video. Its
 * NavigatorController sits on the scene object "Navigator": it starts on Go and
 * takes Play, Pause, Seek and SetSpeed. What the flight does comes back as window
 * events (NavigatorPage.jslib in the Unity project): navigator:ready {duration},
 * navigator:time {time, playing}, navigator:ended and navigator:error {code}.
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

  useEffect(() => {
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

  const controls = error ? (
    <div className="pointer-events-auto absolute inset-x-4 bottom-4 mx-auto max-w-md rounded-2xl bg-white/90 px-5 py-4 text-center text-sm font-bold text-ink shadow-sm backdrop-blur">
      {error}
    </div>
  ) : duration > 0 ? (
    <div className="pointer-events-auto absolute bottom-4 left-4 right-16 flex items-center gap-3 rounded-full bg-white/90 py-1.5 pl-1.5 pr-2 shadow-sm backdrop-blur sm:left-1/2 sm:right-auto sm:w-[34rem] sm:-translate-x-1/2">
      <button
        onClick={togglePlay}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-ink transition hover:brightness-95"
        aria-label={playing ? 'Pauza' : ended ? 'Znova' : 'Prehrať'}
        title={playing ? 'Pauza' : ended ? 'Znova' : 'Prehrať'}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
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
        className="h-2 min-w-0 flex-1 cursor-pointer"
        style={{ accentColor: '#1b1b1b' }}
        aria-label="Pretáčanie"
      />

      <span className="shrink-0 text-xs font-bold tabular-nums text-ink/70">
        {clock(time)} / {clock(duration)}
      </span>

      <button
        onClick={nextSpeed}
        className="h-11 min-w-[3.25rem] shrink-0 rounded-full border-[1.5px] border-ink/15 px-2.5 text-sm font-bold text-ink transition hover:border-ink/30"
        aria-label="Rýchlosť"
        title="Rýchlosť"
      >
        {speedLabel(speed)}
      </button>
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
      homeLabel="Miestnosti"
      homeTitle="Späť na zoznam miestností"
      onReady={(instance: UnityInstance) => {
        instanceRef.current = instance;
        instance.SendMessage('Navigator', 'Go', code);
      }}
      overlay={controls}
    />
  );
}
