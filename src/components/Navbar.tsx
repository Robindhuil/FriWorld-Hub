'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { game } from '@/content/game';

const links = [
  { href: '/', label: 'Domov' },
  { href: '/news', label: 'Novinky' },
  { href: '/versions', label: 'Verzie' },
  { href: '/discussions', label: 'Diskusia' },
  { href: '/about', label: 'O hre' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b-[1.5px] border-ink bg-paper">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-7">

        {/* Brand */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border-[1.5px] border-ink bg-accent text-base shadow-[2px_2px_0_#1b1b1b]">
            🌍
          </span>
          <span className="font-display text-xl font-bold text-ink">{game.title}</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <div key={l.href} className="relative flex flex-col items-center pb-1.5">
              <Link
                href={l.href}
                className="rounded-lg px-3.5 py-2 text-sm font-bold text-ink transition hover:bg-ink/5"
              >
                {l.label}
              </Link>
              {isActive(l.href) && (
                <span className="absolute bottom-0 h-1.5 w-1.5 rounded-full border-[1.5px] border-ink bg-accent" />
              )}
            </div>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <Link
            href="/download"
            className="rounded-full border-[1.5px] border-ink px-4 py-2 text-sm font-bold text-ink transition hover:bg-ink/5"
          >
            ⬇ Stiahnuť
          </Link>
          <Link
            href="/play"
            className="rounded-full border-[1.5px] border-ink bg-accent px-5 py-2 text-sm font-bold text-ink shadow-[3px_3px_0_#1b1b1b] transition hover:brightness-95"
          >
            ▶ Hrať
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="text-ink md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Otvoriť/zatvoriť menu"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            {open
              ? <path d="M18 6L6 18M6 6l12 12" />
              : <path d="M4 12h16M4 7h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t-[1.5px] border-ink px-5 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-3 py-2.5 text-sm font-bold ${
                  isActive(l.href) ? 'bg-accent-soft' : 'text-ink/60'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/download"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-xl border-[1.5px] border-ink px-3 py-2.5 text-center text-sm font-bold text-ink"
            >
              ⬇ Stiahnuť
            </Link>
            <Link
              href="/play"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-xl border-[1.5px] border-ink bg-accent px-3 py-2.5 text-center text-sm font-bold text-ink shadow-[3px_3px_0_#1b1b1b]"
            >
              ▶ Hrať
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
