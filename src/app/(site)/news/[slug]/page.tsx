import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPost, news } from '@/content/news';
import { formatDate } from '@/lib/format';
import Prose from '@/components/Prose';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return news.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: 'Nenájdené' };
  return { title: post.title, description: post.excerpt };
}

export default async function NewsPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-2xl px-7 py-12 pb-20">
      <Link
        href="/news"
        className="mb-8 inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-ink px-4 py-1.5 text-sm font-bold transition hover:bg-ink/5"
      >
        ← Späť na novinky
      </Link>

      <div className="mb-3 inline-block rounded-full border-[1.5px] border-ink bg-accent-soft px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wide">
        {post.tag}
      </div>

      <h1 className="font-display text-4xl font-bold leading-tight tracking-tight">
        {post.title}
      </h1>

      <p className="mb-8 mt-2 border-b-[1.5px] border-ink/15 pb-7 text-sm text-ink/40">
        {formatDate(post.date)}
      </p>

      {/* Cover art placeholder */}
      <div
        className="mb-9 flex h-56 flex-col items-center justify-center gap-2 rounded-xl border-[1.5px] border-ink shadow-[4px_4px_0_#1b1b1b]"
        style={{ background: 'repeating-linear-gradient(45deg,#FFF1C9,#FFF1C9 14px,#FFE49A 14px,#FFE49A 28px)' }}
      >
        <span className="text-4xl">📸</span>
        <span className="font-mono text-xs text-amber-600">screenshot z článku</span>
      </div>

      <Prose blocks={post.body} />

      <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t-[1.5px] border-ink/15 pt-6">
        <Link
          href="/news"
          className="rounded-full border-[1.5px] border-ink px-5 py-2 text-sm font-bold transition hover:bg-ink/5"
        >
          ← Ďalšie novinky
        </Link>
        <Link
          href="/play"
          className="rounded-full border-[1.5px] border-ink bg-accent px-5 py-2.5 font-display text-sm font-semibold shadow-[3px_3px_0_#1b1b1b] transition hover:brightness-95"
        >
          ▶ Hrať FriWorld
        </Link>
      </div>
    </article>
  );
}
