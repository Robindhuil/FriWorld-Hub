import type { Metadata } from 'next';
import Link from 'next/link';
import { game } from '@/content/game';

export const metadata: Metadata = {
  title: 'O hre',
  description: `O hre ${game.title} — čo to je, pre koho a prečo vznikla.`,
};

const FACTS = [
  { emoji: '🏫', title: 'Verný 3D model fakulty', note: 'Priestory fakulty, po ktorých sa voľne prejdeš.' },
  { emoji: '💻', title: 'Základy programovania', note: 'Minihry vrátane simulovaného programovacieho prostredia.' },
  { emoji: '🎓', title: 'Pre stredoškolákov', note: 'Hravý spôsob, ako spoznať štúdium informatiky.' },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-7 py-14">
      <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">

        {/* Left: príbeh */}
        <div>
          <h1 className="font-display text-5xl font-bold leading-tight tracking-tight">
            Spoznaj fakultu{' '}
            <span className="marker">hrou.</span>
          </h1>
          <p className="mt-6 text-base leading-[1.75] text-ink/65">{game.description}</p>
          <p className="mt-4 text-base leading-[1.75] text-ink/65">
            Cieľom FriWorld je predstaviť Fakultu riadenia a informatiky zvnútra — najmä
            stredoškolákom, ktorých má hravou formou nalákať na štúdium informatiky. Spája dve
            veci do jedného zážitku: prehliadku fakulty a prvý praktický kontakt s programovaním.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/play"
              className="rounded-full border-[1.5px] border-ink bg-accent px-6 py-2.5 font-display text-sm font-semibold shadow-[3px_3px_0_#1b1b1b] transition hover:brightness-95"
            >
              ▶ Spustiť hru
            </Link>
            <a
              href={game.links.discord}
              className="rounded-full border-[1.5px] border-ink bg-surface px-6 py-2.5 font-display text-sm font-semibold shadow-[3px_3px_0_#1b1b1b] transition hover:bg-ink/5"
            >
              💬 Napíš nám
            </a>
          </div>
        </div>

        {/* Right: čo to je */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border-[1.5px] border-ink bg-accent-soft p-6 shadow-[4px_4px_0_#1b1b1b]">
            <h3 className="mb-4 font-display text-lg font-bold">Čo v hre nájdeš</h3>
            <div className="flex flex-col gap-3">
              {FACTS.map((f) => (
                <div key={f.title} className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-ink bg-accent text-base shadow-[2px_2px_0_#1b1b1b]">
                    {f.emoji}
                  </span>
                  <div>
                    <p className="text-sm font-bold">{f.title}</p>
                    <p className="text-xs text-ink/55">{f.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border-[1.5px] border-ink bg-surface p-6 shadow-[4px_4px_0_#1b1b1b]">
            <h3 className="mb-2 font-display text-lg font-bold">Máš spätnú väzbu?</h3>
            <p className="mb-4 text-sm leading-relaxed text-ink/55">
              Narazil si na chybu alebo máš nápad? Sem s ním — každá správa pomôže.
            </p>
            <a
              href={game.links.discord}
              className="block w-full rounded-full border-[1.5px] border-ink bg-[#5865F2] py-2.5 text-center font-display text-sm font-semibold text-white shadow-[3px_3px_0_#1b1b1b] transition hover:brightness-95"
            >
              Pridať sa na Discord →
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
