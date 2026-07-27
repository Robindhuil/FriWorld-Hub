import Link from 'next/link';
import { game } from '@/content/game';

export default function Footer() {
  return (
    <footer className="border-t-[1.5px] border-ink/15 bg-paper">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-7 py-6">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md border-[1.5px] border-ink bg-accent text-xs shadow-[2px_2px_0_#1b1b1b]">
            🌍
          </span>
          <span className="font-display font-bold text-ink">{game.title}</span>
          <span className="text-xs text-ink/35">· v{game.version}</span>
        </div>
        <div className="flex flex-wrap items-center gap-5 text-sm font-bold text-ink/50">
          <Link href="/news" className="transition hover:text-ink">Novinky</Link>
          <Link href="/versions" className="transition hover:text-ink">Verzie</Link>
          <Link href="/about" className="transition hover:text-ink">O hre</Link>
          <a href={game.links.discord} className="transition hover:text-ink">Discord</a>
          <Link href="/download" className="transition hover:text-ink">Stiahnuť</Link>
        </div>
        <p className="text-xs text-ink/30">Vytvorené s 💛 pre {game.studio}</p>
      </div>
    </footer>
  );
}
