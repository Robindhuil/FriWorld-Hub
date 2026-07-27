import type { Metadata } from 'next';
import Link from 'next/link';
import { game } from '@/content/game';

export const metadata: Metadata = {
  title: 'Stiahnuť',
  description: `Desktopová verzia ${game.title} príde neskôr. Zatiaľ hraj priamo v prehliadači.`,
};

const PLATFORMS = [
  { emoji: '🪟', name: 'Windows' },
  { emoji: '🍎', name: 'macOS' },
  { emoji: '🐧', name: 'Linux' },
] as const;

export default function DownloadPage() {
  return (
    <div className="mx-auto max-w-3xl px-7 py-14 pb-20">
      <div className="mb-10 text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight">Stiahnuť {game.title}</h1>
        <p className="mt-2 text-base text-ink/50">Desktopová verzia je vo vývoji.</p>
      </div>

      {/* Coming soon */}
      <div className="rounded-2xl border-[1.5px] border-ink bg-surface p-10 text-center shadow-[5px_5px_0_#1b1b1b]">
        <span className="inline-block rounded-full border-[1.5px] border-ink bg-accent px-4 py-1 text-xs font-extrabold uppercase tracking-wide shadow-[2px_2px_0_#1b1b1b]">
          Čoskoro
        </span>
        <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-ink/60">
          Na desktopovej verzii pre Windows, macOS a Linux pracujeme. Keď bude pripravená,
          objaví sa tu na stiahnutie.
        </p>

        <div className="mt-7 flex items-center justify-center gap-4">
          {PLATFORMS.map((p) => (
            <div
              key={p.name}
              className="flex flex-col items-center gap-1.5 opacity-50"
              title={`${p.name} — čoskoro`}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border-[1.5px] border-ink bg-paper text-2xl">
                {p.emoji}
              </span>
              <span className="text-xs font-bold text-ink/50">{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hraj v prehliadači */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-5 rounded-2xl border-[1.5px] border-ink bg-accent-soft p-7 shadow-[3px_3px_0_#1b1b1b]">
        <div>
          <p className="font-display text-lg font-bold">Nechce sa ti čakať?</p>
          <p className="mt-1 text-sm text-ink/60">
            Zahraj si FriWorld hneď teraz priamo v prehliadači — bez inštalácie.
          </p>
        </div>
        <Link
          href="/play"
          className="shrink-0 rounded-full border-[1.5px] border-ink bg-surface px-5 py-2.5 font-display text-sm font-semibold shadow-[3px_3px_0_#1b1b1b] transition hover:bg-ink/5"
        >
          ▶ Hrať v prehliadači
        </Link>
      </div>
    </div>
  );
}
