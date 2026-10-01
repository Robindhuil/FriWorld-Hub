import type { Metadata } from 'next';
import { resolveNavigatorRooms } from '@/lib/game-build';

export const metadata: Metadata = {
  title: 'Navigator',
  description: 'Prelet budovou fakulty od recepcie k vybranej miestnosti.',
};

// The rooms come with the uploaded Navigator build, so they are read on every request.
export const dynamic = 'force-dynamic';

/** RA101 → RA1: block and floor, the way the codes are numbered. */
function byFloor(rooms: string[]): [string, string[]][] {
  const groups = new Map<string, string[]>();
  for (const code of rooms) {
    const key = code.slice(0, 3);
    groups.set(key, [...(groups.get(key) ?? []), code]);
  }
  return [...groups];
}

export default async function NavigatorPage() {
  const rooms = await resolveNavigatorRooms();

  return (
    <div className="mx-auto max-w-4xl px-7 py-14 pb-20">
      <div className="mb-10 text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight">Navigator</h1>
        <p className="mt-2 text-base text-ink/50">
          Vyber miestnosť a kamera ťa k nej prevedie od recepcie. Otvorí sa v novom okne.
        </p>
      </div>

      {typeof rooms === 'string' ? (
        <div className="rounded-2xl border-[1.5px] border-ink bg-accent-soft px-7 py-6 text-sm leading-relaxed text-ink/70 shadow-[3px_3px_0_#1b1b1b]">
          {rooms}
        </div>
      ) : (
        <div className="space-y-7">
          {byFloor(rooms).map(([floor, codes]) => (
            <section key={floor}>
              <h2 className="mb-2.5 font-display text-sm font-bold text-ink/45">{floor}</h2>
              <div className="flex flex-wrap gap-2">
                {codes.map((code) => (
                  <a
                    key={code}
                    href={`/navigate/${code}`}
                    target="_blank"
                    rel="noopener"
                    className="rounded-full border-[1.5px] border-ink bg-surface px-4 py-1.5 font-mono text-sm font-bold shadow-[2px_2px_0_#1b1b1b] transition hover:bg-accent"
                  >
                    {code}
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
