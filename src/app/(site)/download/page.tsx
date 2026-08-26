import type { Metadata } from 'next';
import Link from 'next/link';
import { game } from '@/content/game';
import { launcher } from '@/content/launcher';

export const metadata: Metadata = {
  title: 'Stiahnuť',
  description: `Stiahni si ${game.title} pre Windows, alebo hraj priamo v prehliadači bez inštalácie.`,
};

// macOS zámerne nie je „čoskoro" — nechystá sa. Sľubovať ho by bolo klamstvo.
const OTHER_PLATFORMS = [
  { emoji: '🐧', name: 'Linux', note: 'Zatiaľ nie' },
  { emoji: '🍎', name: 'macOS', note: 'Nechystá sa' },
] as const;

export default function DownloadPage() {
  return (
    <div className="mx-auto max-w-3xl px-7 py-14 pb-20">
      <div className="mb-10 text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight">Stiahnuť {game.title}</h1>
        <p className="mt-2 text-base text-ink/50">
          Pre Windows. Na ostatných systémoch hraj v prehliadači.
        </p>
      </div>

      {/* Windows */}
      <div className="rounded-2xl border-[1.5px] border-ink bg-surface p-8 shadow-[5px_5px_0_#1b1b1b]">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-[1.5px] border-ink bg-paper text-3xl">
              🪟
            </span>
            <div>
              <p className="font-display text-xl font-bold">Windows</p>
              <p className="mt-0.5 text-sm text-ink/55">
                FriWorld Launcher {launcher.version} · {launcher.windowsZipMb} MB
              </p>
            </div>
          </div>

          <a
            href={launcher.windowsZip}
            className="shrink-0 rounded-full border-[1.5px] border-ink bg-accent px-6 py-3 font-display text-base font-bold shadow-[3px_3px_0_#1b1b1b] transition hover:translate-y-px hover:shadow-[2px_2px_0_#1b1b1b]"
          >
            ⬇ Stiahnuť
          </a>
        </div>

        <p className="mt-6 border-t-[1.5px] border-ink/10 pt-5 text-sm leading-relaxed text-ink/60">
          Sťahuje sa <strong className="font-semibold text-ink/75">launcher</strong>, nie celá hra.
          Je to malý program, ktorý si hru stiahne sám a odvtedy ju drží aktuálnu — nové verzie
          už nemusíš hľadať. Samotná hra zaberie po inštalácii približne{' '}
          {String(launcher.gameInstallGb).replace('.', ',')} GB.
        </p>

        <p className="mt-3 text-sm text-ink/45">
          Rozbaľ stiahnutý súbor a spusti <code className="font-mono">FriWorldLauncher.exe</code>.
        </p>
      </div>

      {/* Čo ak to Windows nepustí. Nepodpísaný program to spraví skoro každému, tak to
          radšej povedzme dopredu než aby si každý myslel, že je to vírus. */}
      <details className="mt-4 rounded-2xl border-[1.5px] border-ink bg-paper px-7 py-5 shadow-[3px_3px_0_#1b1b1b]">
        <summary className="cursor-pointer font-display text-base font-bold">
          Windows hlási, že program zablokoval?
        </summary>

        <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink/65">
          <p>
            Stáva sa to. FriWorld je školský projekt a nemá kúpený podpisový certifikát, takže
            Windows nevie overiť, kto ho vyrobil. Nie je to vírus — je to cena za to, že projekt
            nikto nefinancuje.
          </p>

          <div>
            <p className="font-semibold text-ink/80">Modrá obrazovka „Windows protected your PC"</p>
            <p className="mt-1">
              Klikni na <strong className="font-semibold">More info</strong>, potom{' '}
              <strong className="font-semibold">Run anyway</strong>. Toto uvidíš len raz.
            </p>
          </div>

          <div>
            <p className="font-semibold text-ink/80">„Smart App Control has blocked this app"</p>
            <p className="mt-1">
              Táto hláška nemá tlačidlo na pokračovanie. V stiahnutom balíčku je pre tento prípad
              súbor <code className="font-mono">Spustit-ak-exe-nejde.cmd</code> — spusti ten. Je to
              tá istá aplikácia, len spustená inak.
            </p>
          </div>

          <p className="text-ink/50">
            Ak nepomôže ani to, hraj{' '}
            <Link href="/play" className="underline underline-offset-2 hover:text-ink/70">
              v prehliadači
            </Link>
            . Je to tá istá prehliadka a nič sa neinštaluje.
          </p>
        </div>
      </details>

      {/* Ostatné platformy */}
      <div className="mt-4 flex flex-wrap items-center gap-6 rounded-2xl border-[1.5px] border-ink bg-paper px-7 py-6 shadow-[3px_3px_0_#1b1b1b]">
        {OTHER_PLATFORMS.map((p) => (
          <div key={p.name} className="flex items-center gap-3 opacity-45">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border-[1.5px] border-ink bg-surface text-xl">
              {p.emoji}
            </span>
            <div>
              <p className="text-sm font-bold">{p.name}</p>
              <p className="text-xs text-ink/55">{p.note}</p>
            </div>
          </div>
        ))}

        <p className="text-sm text-ink/50">
          Na oboch funguje{' '}
          <Link href="/play" className="underline underline-offset-2 hover:text-ink/70">
            verzia v prehliadači
          </Link>
          .
        </p>
      </div>

      {/* Hraj v prehliadači */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-5 rounded-2xl border-[1.5px] border-ink bg-accent-soft p-7 shadow-[3px_3px_0_#1b1b1b]">
        <div>
          <p className="font-display text-lg font-bold">Nechce sa ti nič sťahovať?</p>
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

      <p className="mt-6 text-center text-xs text-ink/40">
        Staršie verzie a poznámky k vydaniam nájdeš na{' '}
        <a
          href={launcher.releases}
          className="underline underline-offset-2 hover:text-ink/60"
          target="_blank"
          rel="noreferrer"
        >
          GitHube
        </a>
        .
      </p>
    </div>
  );
}
