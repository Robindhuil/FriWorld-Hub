import type { Metadata } from 'next';
import Link from 'next/link';
import { news } from '@/content/news';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Novinky',
  description: 'Oznámenia, devlogy a aktualizácie od tímu FriWorld.',
};

export default function NewsPage() {
  const posts = [...news].sort((a, b) => b.date.localeCompare(a.date));
  const [featured, ...rest] = posts;

  return (
    <div className="mx-auto max-w-5xl px-7 py-14">
      <div className="mb-9">
        <h1 className="font-display text-4xl font-bold tracking-tight">Novinky a denníky</h1>
        <p className="mt-1.5 text-base text-ink/50">Aktuality priamo od tvorcu hry.</p>
      </div>

      {/* Featured */}
      {featured && (
        <Link
          href={`/news/${featured.slug}`}
          className="mb-7 grid overflow-hidden rounded-2xl border-[1.5px] border-ink bg-surface shadow-[5px_5px_0_#1b1b1b] transition hover:-translate-y-0.5 sm:grid-cols-[1.1fr_1fr]"
        >
          <div
            className="flex min-h-56 flex-col items-center justify-center gap-2.5 border-b-[1.5px] border-ink sm:border-b-0 sm:border-r-[1.5px]"
            style={{ background: 'repeating-linear-gradient(45deg,#FFF1C9,#FFF1C9 14px,#FFE49A 14px,#FFE49A 28px)' }}
          >
            <span className="text-4xl">📰</span>
            <span className="font-mono text-xs text-amber-600">obrázok článku</span>
          </div>
          <div className="flex flex-col justify-center gap-3 p-8">
            <div className="inline-flex w-fit items-center gap-1.5 rounded-full border-[1.5px] border-ink bg-accent-soft px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wide">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {featured.tag}
            </div>
            <h2 className="font-display text-2xl font-bold leading-tight">{featured.title}</h2>
            <p className="text-sm leading-relaxed text-ink/60">{featured.excerpt}</p>
            <p className="text-xs text-ink/35">{formatDate(featured.date)}</p>
          </div>
        </Link>
      )}

      {/* Grid */}
      {rest.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-3">
          {rest.map((post) => (
            <Link
              key={post.slug}
              href={`/news/${post.slug}`}
              className="overflow-hidden rounded-xl border-[1.5px] border-ink bg-surface shadow-[3px_3px_0_#1b1b1b] transition hover:-translate-y-0.5"
            >
              <div
                className="flex h-28 flex-col items-center justify-center gap-1 border-b-[1.5px] border-ink"
                style={{ background: 'repeating-linear-gradient(-45deg,#f0ece3,#f0ece3 8px,#e8e4db 8px,#e8e4db 16px)' }}
              >
                <span className="text-2xl">📝</span>
              </div>
              <div className="flex flex-col gap-1.5 p-4">
                <span className="w-fit rounded-full border-[1.5px] border-ink bg-accent-soft px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide">
                  {post.tag}
                </span>
                <h3 className="font-display text-base font-semibold leading-snug">{post.title}</h3>
                <p className="text-xs leading-relaxed text-ink/55">{post.excerpt}</p>
                <p className="text-[11px] text-ink/35">{formatDate(post.date)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
