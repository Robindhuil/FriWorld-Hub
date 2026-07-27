import type { Metadata } from 'next';
import { versions, kindColor } from '@/content/versions';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Verzie',
  description: 'Kompletná história verzií a patch notes pre FriWorld.',
};

const typeBadgeBg: Record<string, string> = {
  Vydanie: 'bg-accent',
  Patch:   'bg-emerald-100',
  Hotfix:  'bg-red-100',
};

export default function VersionsPage() {
  const ordered = [...versions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="mx-auto max-w-3xl px-7 py-14">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-bold tracking-tight">História verzií</h1>
        <p className="mt-1.5 text-base text-ink/50">Každé vydanie, patch a oprava — najnovšie hore.</p>
      </div>

      <div className="flex flex-col gap-4">
        {ordered.map((v) => (
          <div
            key={v.version}
            className="overflow-hidden rounded-xl border-[1.5px] border-ink bg-surface shadow-[3px_3px_0_#1b1b1b]"
          >
            {/* Header */}
            <div className="flex flex-wrap items-center gap-2.5 border-b-[1.5px] border-ink/15 bg-paper/60 px-5 py-3.5">
              <span className="font-display text-xl font-bold">v{v.version}</span>
              <span
                className={`rounded-full border-[1.5px] border-ink px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${typeBadgeBg[v.type] ?? 'bg-accent-soft'}`}
              >
                {v.type}
              </span>
              <span className="font-display text-sm font-semibold text-ink/70">{v.summary}</span>
              <span className="ml-auto text-xs text-ink/35">{formatDate(v.date)}</span>
            </div>

            {/* Changes */}
            <div className="space-y-4 px-5 py-4">
              {v.changes.map((group, i) => (
                <div key={i}>
                  <p className={`mb-1.5 text-[11px] font-extrabold uppercase tracking-wider ${kindColor[group.kind]}`}>
                    {group.kind}
                  </p>
                  <div className="space-y-1.5">
                    {group.items.map((item, j) => (
                      <div key={j} className="flex items-start gap-2.5 text-sm text-ink/65">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
