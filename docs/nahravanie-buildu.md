# Nahrávanie nového Unity buildu

Build hry sa **nenachádza v gite** ani na Verceli — má cez 300 MB. Býva na
Cloudflare R2 a Vercel naň len ukazuje cez premennú `GAME_BASE_URL`.

Táto rutina platí pri každom novom exporte z Unity.

---

## Kde čo býva

| Vec | Hodnota |
|---|---|
| R2 bucket | `friworld-web` |
| Verejná adresa | `https://pub-db8f9e4528594f8e8ecd4dc13ab771fb.r2.dev` |
| rclone remote | `r2` |
| Premenná na Verceli | `GAME_BASE_URL` (rovná sa verejnej adrese) |
| Lokálny priečinok | `public/game/` (v `.gitignore`) |

---

## Postup

### 1. Nahradiť lokálne súbory

Vyexportovaný build rozbaliť do `public/game/` tak, aby vznikla táto štruktúra:

```
public/game/
  Build/            <prefix>.loader.js, .data, .framework.js, .wasm, .worker.js
  StreamingAssets/  videá a ďalší obsah načítavaný na požiadanie
  TemplateData/
```

Starý obsah zmazať, nie premiešať s novým — dva rôzne `*.loader.js` v `Build/`
znamenajú, že si appka vyberie ten nesprávny.

Na názve buildu nezáleží, prefix sa deteguje automaticky z `*.loader.js`.

### 2. Overiť lokálne

```bash
npm run dev
```

Bez nastavenej `GAME_BASE_URL` sa hra načíta z `public/game/`, takže sa dá
otestovať ešte pred nahrávaním. Otvor `/play`.

### 3. Vygenerovať manifest

```bash
npm run game:manifest
```

Vytvorí `public/game/manifest.json` so zoznamom súborov v `Build/`. Objektové
úložisko nevie vypísať obsah priečinka cez HTTP, takže bez tohto súboru appka
build na R2 nenájde. **Krok sa nedá preskočiť.**

### 4. Nahrať na R2

Najprv nasucho, na kontrolu čo sa zmení:

```bash
rclone sync ./public/game r2:friworld-web --dry-run
```

Prejsť si výpis. `sync` odstráni z bucketu všetko, čo nie je lokálne — presne
preto sa používa (inak by tam po každom builde zostalo 126 MB mŕtvych súborov),
ale rovnako preto sa oplatí najprv pozrieť, čo zmaže.

Keď výpis sedí:

```bash
rclone sync ./public/game r2:friworld-web --progress --transfers 8 --header-upload "Cache-Control: public, max-age=31536000, immutable"
```

Ročná cache je zámerná: súbory majú verziu v názve, takže sa nikdy nemenia a
hráč ich sťahuje len raz. `manifest.json` cache prepíše na krátku:

```bash
rclone copyto ./public/game/manifest.json r2:friworld-web/manifest.json --header-upload "Cache-Control: public, max-age=60"
```

### 5. Overiť na R2

Prefix v príkazoch nahraď názvom nového buildu.

```bash
curl -s https://pub-db8f9e4528594f8e8ecd4dc13ab771fb.r2.dev/manifest.json
```

Musí vypísať zoznam súborov nového buildu.

```bash
curl -I https://pub-db8f9e4528594f8e8ecd4dc13ab771fb.r2.dev/Build/<prefix>.wasm
```

Sleduj dve veci:

- `HTTP/1.1 200 OK`
- `Content-Type: application/wasm` — ak by tu bolo `application/octet-stream`,
  prehliadač nemôže použiť streamovanú kompiláciu a načítanie je pomalšie

### 6. Zapísať verziu na web

Číslo verzie a changelog sú zatiaľ napísané staticky v repozitári, takže sa
neaktualizujú samé — treba ich pridať ručne k tomu istému buildu.

**`src/content/game.ts`** — číslo verzie zobrazené v hlavičke a v pätičke:

```ts
version: '0.1.1',
status: 'Alfa',
```

**`src/content/versions.ts`** — nový záznam na začiatok poľa `versions`:

```ts
{
  version: '0.1.1',
  date: '2026-08-04',            // ISO, zoradenie ide podľa neho
  type: 'Patch',                 // 'Vydanie' | 'Patch' | 'Hotfix'
  summary: 'Krátky popis, čo prináša.',
  changes: [
    {
      kind: 'Pridané',           // 'Pridané' | 'Zmenené' | 'Opravené' | 'Odstránené'
      items: ['Prvá zmena', 'Druhá zmena'],
    },
  ],
},
```

Stránka `/versions` zoradí záznamy podľa dátumu sama, na poradí v poli nezáleží.
Prvé tri položky najnovšieho záznamu sa zobrazia aj na úvodnej stránke.

Ak k vydaniu patrí aj článok, pridaj ho do `src/content/news.ts`.

Potom commit a push. Vercel nasadí zmenu sám.

**Číslo verzie drž rovnaké ako prefix buildu** (`0.1.1-web` a `version: '0.1.1'`).
Nie je to nikde vynútené, ale keď sa raz niečo pokazí, prefix v adrese je jediné,
podľa čoho spätne zistíš, ktorý build je vonku.

### 7. Otvoriť hru

Na nasadenej stránke otvor `/api/game`. Musí vrátiť adresy nového buildu a
`workerUrl: "/api/game/worker"`. Potom `/play`.

Samotná výmena buildu redeploy nevyžaduje — `GAME_BASE_URL` sa nemení a manifest
sa číta za behu. Redeploy prebehne kvôli kroku 6, keďže texty verzií sú v gite.

---

## Keď to nejde

### Hra sa zasekne na 90 % a v konzole je `[object Event]`

Chýba `*.worker.js` v `Build/`, alebo sa nedostal do manifestu. Spusti
`npm run game:manifest` znova a nahraj manifest.

### „Stránka nie je správne nastavená — chýbajú jej hlavičky COOP/COEP"

Hra beží, len nie cez Vercel — hlavičky posiela `next.config.ts`. Ak sa to deje
na Verceli, appka sa nenasadila správne.

### „Hra beží len cez zabezpečené pripojenie"

Stránka je otvorená cez `http://` na inej adrese než `localhost`. Viacvláknové
spracovanie vyžaduje HTTPS.

### V konzole `Failed to download file` hoci `curl` vracia 200

Prehliadač si drží starú neúspešnú odpoveď v cache — súbory majú ročnú
`immutable` cache. Tvrdý reload (Ctrl+Shift+R). Bežných hráčov sa to netýka,
tí zlú verziu nikdy nevideli.

### Načítanie trvá dlho

Build je nekomprimovaný. Export z Unity s Brotli kompresiou zmenší `.data` a
`.wasm` zhruba na tretinu. Druhá možnosť je pripojiť k bucketu vlastnú doménu —
adresa `r2.dev` nemá CDN cache, takže každý request ide až do úložiska.

---

## Prečo je worker zvláštny

Viacvláknový build spúšťa vlákna cez `new Worker(url)`, a prehliadače worker
skripty z cudzej domény odmietajú — bez ohľadu na CORS. Preto tie 2 kB
neservíruje R2, ale `/api/game/worker` z vlastnej domény. Ten skript si ťažký
framework stiahne z R2 sám cez `importScripts`, čo cross-origin povolené je.

Netreba kvôli tomu nič robiť, ale ak by si menil `/api/game`, toto je dôvod,
prečo tam `workerUrl` nesmie ukazovať priamo na R2.
