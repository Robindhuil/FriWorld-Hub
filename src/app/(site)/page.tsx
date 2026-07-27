import Link from 'next/link';
import { game } from '@/content/game';
import { news } from '@/content/news';
import { versions } from '@/content/versions';
import { formatDate } from '@/lib/format';

const FEATURE_ICONS = ['🏫', '💻', '🌐'];

export default function HomePage() {
  const sortedNews     = [...news].sort((a, b) => b.date.localeCompare(a.date));
  const sortedVersions = [...versions].sort((a, b) => b.date.localeCompare(a.date));
  const latestNews     = sortedNews[0];
  const latestVersion  = sortedVersions[0];
  const topNotes       = latestVersion?.changes.flatMap((c) => c.items).slice(0, 3) ?? [];

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="border-b-[1.5px] border-ink bg-accent-soft px-7 pb-14 pt-12">
        <div className="mx-auto max-w-6xl">

          {/* Launch card */}
          <div className="grid overflow-hidden rounded-2xl border-[1.5px] border-ink bg-surface shadow-[6px_6px_0_#1b1b1b] lg:grid-cols-[1fr_1.05fr]">

            {/* Left: copy */}
            <div className="flex flex-col justify-center gap-4 border-b-[1.5px] border-ink p-10 lg:border-b-0 lg:border-r-[1.5px]">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border-[1.5px] border-ink bg-accent-soft px-3.5 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-extrabold uppercase tracking-wide">
                  {game.status} · v{game.version}
                </span>
              </div>
              <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight">
                Spoznaj fakultu<br />
                <span className="marker">zvnútra.</span>
              </h1>
              <p className="max-w-sm text-base leading-relaxed text-ink/60">
                {game.tagline}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <Link
                  href="/play"
                  className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-ink bg-accent px-6 py-3 font-display text-base font-semibold shadow-[4px_4px_0_#1b1b1b] transition hover:brightness-95"
                >
                  ▶ Hrať zadarmo
                </Link>
                <Link
                  href="/download"
                  className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-ink px-5 py-3 text-sm font-bold transition hover:bg-ink/5"
                >
                  ⬇ Desktop (čoskoro)
                </Link>
              </div>
            </div>

            {/* Right: art placeholder */}
            <div
              className="relative flex min-h-72 flex-col items-center justify-center gap-3 p-8"
              style={{
                background: 'repeating-linear-gradient(45deg,#FFF1C9 0,#FFF1C9 18px,#FFE49A 18px,#FFE49A 36px)',
              }}
            >
              <span className="text-7xl leading-none">🏫</span>
              <p className="font-display text-sm font-semibold uppercase tracking-wide text-amber-600">
                Ukážka / Screenshot
              </p>
              <p className="text-center font-mono text-xs leading-relaxed text-amber-500/70">
                Sem príde obrázok z hry<br />public/key-art.png
              </p>
              <Link
                href="/play"
                className="absolute bottom-5 right-5 rounded-full border-[1.5px] border-ink bg-accent px-4 py-2 font-display text-sm font-semibold shadow-[3px_3px_0_#1b1b1b] transition hover:brightness-95"
              >
                ▶ Spustiť hru
              </Link>
            </div>
          </div>

          {/* Feature strip */}
          <div className="mt-4 grid gap-3.5 sm:grid-cols-3">
            {game.features.map((f, i) => (
              <div
                key={f.title}
                className="flex gap-3.5 rounded-xl border-[1.5px] border-ink bg-surface p-4 shadow-[3px_3px_0_#1b1b1b] transition hover:-translate-y-0.5"
              >
                <span className="mt-0.5 shrink-0 text-xl">{FEATURE_ICONS[i] ?? '✦'}</span>
                <div>
                  <p className="font-display text-sm font-semibold">{f.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink/60">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Najnovšie novinky + patch ──────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-7 py-14">
        <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">

          {/* Najnovšia novinka */}
          <div>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold">Najnovšie novinky</h2>
              <Link
                href="/news"
                className="rounded-full border-[1.5px] border-ink px-3.5 py-1.5 text-xs font-bold transition hover:bg-ink/5"
              >
                Všetky →
              </Link>
            </div>
            {latestNews && (
              <Link
                href={`/news/${latestNews.slug}`}
                className="grid overflow-hidden rounded-2xl border-[1.5px] border-ink bg-surface shadow-[4px_4px_0_#1b1b1b] transition hover:-translate-y-0.5 sm:grid-cols-[1fr_1.6fr]"
              >
                <div
                  className="flex min-h-44 flex-col items-center justify-center gap-1.5 border-b-[1.5px] border-ink sm:border-b-0 sm:border-r-[1.5px]"
                  style={{ background: 'repeating-linear-gradient(-45deg,#f2f0eb,#f2f0eb 10px,#e8e5de 10px,#e8e5de 20px)' }}
                >
                  <span className="text-2xl">📰</span>
                  <span className="font-mono text-[10px] text-ink/30">obrázok článku</span>
                </div>
                <div className="flex flex-col justify-center gap-2 p-5">
                  <span className="w-fit rounded-full border-[1.5px] border-ink bg-accent-soft px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide">
                    {latestNews.tag}
                  </span>
                  <h3 className="font-display text-lg font-semibold leading-snug">{latestNews.title}</h3>
                  <p className="text-sm leading-relaxed text-ink/60">{latestNews.excerpt}</p>
                  <p className="text-xs text-ink/35">{formatDate(latestNews.date)}</p>
                </div>
              </Link>
            )}
          </div>

          {/* Najnovší patch */}
          <div>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold">Najnovší patch</h2>
              <Link
                href="/versions"
                className="rounded-full border-[1.5px] border-ink px-3.5 py-1.5 text-xs font-bold transition hover:bg-ink/5"
              >
                Všetky →
              </Link>
            </div>
            {latestVersion && (
              <div className="rounded-2xl border-[1.5px] border-ink bg-surface p-5 shadow-[4px_4px_0_#1b1b1b]">
                <div className="mb-2.5 flex flex-wrap items-center gap-2">
                  <span className="font-display text-xl font-bold">v{latestVersion.version}</span>
                  <span className="rounded-full border-[1.5px] border-ink bg-accent px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide">
                    {latestVersion.type}
                  </span>
                  <span className="ml-auto text-xs text-ink/40">{formatDate(latestVersion.date)}</span>
                </div>
                <p className="mb-3 font-display text-sm font-semibold">{latestVersion.summary}</p>
                <div>
                  {topNotes.map((note, i) => (
                    <div key={i} className="flex items-start gap-2 border-t border-ink/10 py-1.5 text-sm text-ink/65">
                      <span className="mt-0.5 shrink-0 text-[11px] font-black text-accent">✦</span>
                      {note}
                    </div>
                  ))}
                </div>
                <Link
                  href="/versions"
                  className="mt-4 block rounded-full border-[1.5px] border-ink bg-accent-soft py-2.5 text-center text-xs font-bold transition hover:bg-accent/30"
                >
                  Celý changelog →
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
