import type { Metadata } from 'next';
import { game } from '@/content/game';

export const metadata: Metadata = {
  title: 'Diskusia',
  description: 'Pridaj sa do komunity FriWorld.',
};

export default function DiscussionsPage() {
  return (
    <div className="mx-auto max-w-xl px-7 py-20 text-center">
      <p className="mb-4 text-5xl">💬</p>
      <h1 className="font-display text-4xl font-bold tracking-tight">Komunita</h1>
      <p className="mx-auto mt-3 max-w-sm text-base leading-[1.7] text-ink/55">
        Komunita FriWorld je zatiaľ na Discorde. Pridaj sa, ak chceš nahlásiť chybu,
        navrhnúť nápad alebo si len pokecať.
      </p>

      <div className="mx-auto mt-12 inline-flex flex-col items-center gap-5 rounded-2xl border-[1.5px] border-ink bg-surface px-10 py-9 shadow-[5px_5px_0_#1b1b1b]">
        <div className="flex items-center gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-[1.5px] border-ink bg-[#5865F2] text-xl shadow-[2px_2px_0_#1b1b1b]">
            💬
          </span>
          <div className="text-left">
            <p className="font-display text-lg font-bold">Discord FriWorld</p>
            <p className="text-xs text-ink/40">Chat, nápady a hlásenie chýb</p>
          </div>
        </div>
        <a
          href={game.links.discord}
          className="w-full rounded-full border-[1.5px] border-ink bg-[#5865F2] px-8 py-3 font-display text-base font-semibold text-white shadow-[4px_4px_0_#1b1b1b] transition hover:brightness-95"
        >
          Pripoj sa →
        </a>
        <p className="text-xs text-ink/30">Diskusie priamo na stránke pribudnú neskôr.</p>
      </div>
    </div>
  );
}
