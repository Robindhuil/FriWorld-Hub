import type { Metadata } from 'next';
import { frilens } from '@/content/frilens';

export const metadata: Metadata = {
  title: 'FriLens',
  description:
    'FriLens premieta navigačnú sieť fakulty do reálneho priestoru cez rozšírenú realitu. Aplikácia pre Android.',
};

const MODES = [
  {
    emoji: '📐',
    name: 'AR',
    when: 'Telefón s ARCore',
    body: 'Namieriš na značku a prekryv sa zosúladí so skutočnou budovou. Toto je režim, pre ktorý aplikácia vznikla.',
  },
  {
    emoji: '🗺️',
    name: 'Preview',
    when: 'Telefón bez ARCore',
    body: 'Prekryv sa kreslí proti obyčajnému pozadiu, otáča sa prstom. Nemeria nič — slúži len na prezretie plochy.',
  },
] as const;

export default function FriLensPage() {
  return (
    <div className="mx-auto max-w-3xl px-7 py-14 pb-20">
      <div className="mb-10 text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight">FriLens</h1>
        <p className="mt-2 text-base text-ink/50">
          Navigačná sieť fakulty premietnutá do reálneho priestoru. Pre Android.
        </p>
      </div>

      {/* Stiahnuť */}
      <div className="rounded-2xl border-[1.5px] border-ink bg-surface p-8 shadow-[5px_5px_0_#1b1b1b]">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-[1.5px] border-ink bg-paper text-3xl">
              🤖
            </span>
            <div>
              <p className="font-display text-xl font-bold">Android</p>
              <p className="mt-0.5 text-sm text-ink/55">
                FriLens {frilens.version} · {frilens.apkMb} MB
              </p>
            </div>
          </div>

          <a
            href={frilens.apk}
            className="shrink-0 rounded-full border-[1.5px] border-ink bg-accent px-6 py-3 font-display text-base font-bold shadow-[3px_3px_0_#1b1b1b] transition hover:translate-y-px hover:shadow-[2px_2px_0_#1b1b1b]"
          >
            ⬇ Stiahnuť APK
          </a>
        </div>

        <p className="mt-6 border-t-[1.5px] border-ink/10 pt-5 text-sm leading-relaxed text-ink/60">
          Vyžaduje <strong className="font-semibold text-ink/75">Android {frilens.minAndroid}</strong>{' '}
          alebo novší a 64-bitový procesor. Nainštaluje sa na každý taký telefón — rozšírená
          realita je označená ako voliteľná, takže aplikácia nabehne aj bez nej.
        </p>

        <p className="mt-3 text-sm text-ink/45">
          Nie je to appka z obchodu, takže Android sa pred inštaláciou spýta, či inštalácii
          z tohto zdroja dôveruješ. Povoľ to len tomu prehliadaču, cez ktorý si súbor stiahol.
        </p>
      </div>

      {/* Čo to je */}
      <div className="mt-4 rounded-2xl border-[1.5px] border-ink bg-paper px-7 py-6 shadow-[3px_3px_0_#1b1b1b]">
        <h2 className="font-display text-lg font-bold">Čo to robí</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink/65">
          FriWorld má vernú 3D kópiu fakulty a v nej navigačnú sieť — plochy, po ktorých sa dá
          chodiť. FriLens tú istú sieť premietne cez kameru telefónu na skutočnú podlahu, aby
          bolo vidno, <strong className="font-semibold text-ink/80">ako presne model sedí na
          realitu a ako rýchlo to odchádza</strong>, keď sa človek prejde chodbou.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink/65">
          Nie je to navigácia. Je to merací nástroj s jednou otázkou.
        </p>
      </div>

      {/* Dva režimy */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {MODES.map((m) => (
          <div
            key={m.name}
            className="rounded-2xl border-[1.5px] border-ink bg-surface px-6 py-5 shadow-[3px_3px_0_#1b1b1b]"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border-[1.5px] border-ink bg-paper text-xl">
                {m.emoji}
              </span>
              <div>
                <p className="font-display text-base font-bold">{m.name}</p>
                <p className="text-xs text-ink/50">{m.when}</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink/60">{m.body}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-sm text-ink/50">
        Aplikácia si režim zvolí sama pri štarte a napíše ho navrchu obrazovky. Či tvoj telefón
        vie ARCore, sa dá overiť v{' '}
        <a
          href={frilens.arDevices}
          className="underline underline-offset-2 hover:text-ink/70"
          target="_blank"
          rel="noreferrer"
        >
          zozname podporovaných zariadení
        </a>
        . Na podporovanom telefóne treba ešte aplikáciu{' '}
        <em className="not-italic font-semibold text-ink/70">Google Play Services for AR</em>{' '}
        z Obchodu Play.
      </p>

      {/* Poctivé varovanie. Kto si to stiahne teraz, musí vedieť, že AR ešte nie je zamerané. */}
      <div className="mt-4 rounded-2xl border-[1.5px] border-ink bg-accent-soft px-7 py-6 shadow-[3px_3px_0_#1b1b1b]">
        <h2 className="font-display text-lg font-bold">Táto verzia ešte nie je zameraná</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink/70">
          Značka, podľa ktorej sa má prekryv zosúladiť, zatiaľ nie je vytlačená ani zameraná
          v modeli. V AR režime preto prekryv pristane na nezmyselnom mieste. Je to očakávané —
          verzia {frilens.version} existuje na to, aby sa na skutočnom telefóne overil build,
          načítanie geometrie, ovládanie a zápis merania.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink/70">
          Ak si ju chceš len pozrieť, choď do režimu Preview. Ten funguje aj dnes.
        </p>
      </div>

      <p className="mt-6 text-center text-xs text-ink/40">
        Staršie verzie a poznámky k vydaniam nájdeš na{' '}
        <a
          href={frilens.releases}
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
