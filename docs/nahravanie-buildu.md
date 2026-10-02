# Nahrávanie buildu

**Presunuté.** Nasadenie web buildu aj desktop buildu popisuje jeden runbook v repe
launchera:

**<https://github.com/Robindhuil/FriWorld-Launcher/blob/master/docs/deploying.md>**

Web build je v ňom sekcia 4, kontrolný zoznam sekcia 12.

## Prečo tam a nie tu

Poradie krokov je medzi platformami previazané — manifest sa vždy zverejňuje ako
posledný — a v dvoch dokumentoch sa taká vec zapíše dvakrát, teda časom dvakrát rozíde.
Launcher je navyše jediné miesto, ktoré manifest vydania zapisuje aj číta.

Odôvodnenie v celku:
<https://github.com/Robindhuil/FriWorld-Launcher/blob/master/docs/decisions/2026-08-27-jeden-runbook-pre-web-aj-desktop.md>

## Čo z toho platí tu

| | |
|---|---|
| R2 bucket | `friworld-web` |
| verejná adresa | `https://pub-db8f9e4528594f8e8ecd4dc13ab771fb.r2.dev` |
| premenná na Verceli | `GAME_BASE_URL` = tá istá adresa |
| build v repe | `public/game/`, v `.gitignore` |
| texty verzií | `src/content/game.ts`, `src/content/versions.ts` |
| odkaz na launcher | `src/content/launcher.ts` |

```bash
npm run game:manifest
npm run game:upload -- --dry
npm run game:upload
```

## Navigator

Druhý Unity build — prelet budovou k miestnosti (`/navigator` → `/navigate/[kód]`).

| | |
|---|---|
| build v Unity | `Navigator → Build Web` v repe FriWorldu, výstup `Builds/Navigator/Web` |
| build v repe | celý výstup do `public/navigator/` (starý obsah najprv zmazať), v `.gitignore` |
| zoznam miestností | `rooms.json` vedľa `index.html`, zapíše ho `Build Web` |
| R2 bucket | **vlastný**, predvolene `friworld-navigator` (`R2_NAVIGATOR_BUCKET`); verejná adresa r2.dev a CORS ako bucket hry: `GET` z akejkoľvek domény |
| premenná na Verceli | `NAVIGATOR_BASE_URL` = verejná adresa toho bucketu; prejaví sa až po redeployi |

```bash
npm run navigator:upload -- --dry
npm run navigator:upload
```

Do bucketu `friworld-web` nesmie: `game:upload` zrkadlí celý bucket a Navigator by zmazal,
a zrkadlenie Navigatora zas hru. Skript ho preto odmietne.

Unity pomenúva súbory Navigatora pri každom builde `Web.*`, takže ročnú cache ako hra mať
nemôžu. Skript preto dá každý build do `Build/<hash>/` — hash je z obsahu súborov, nový build
má novú cestu a rovnaký sa znova neposiela. `manifest.json` (zoznam `<hash>/Web.*` pre
`/api/navigator`) aj `rooms.json` majú minútovú cache a starý build sa zmaže až po nahratí
nového. `--to <priečinok>` zapíše to isté rozloženie na disk, bez kľúčov — na kontrolu.

Overenie po nahratí:

```bash
curl -s <adresa>/manifest.json
```

Musí vypísať `<hash>/Web.*` nového buildu. A `curl -I <adresa>/Build/<hash>/Web.wasm` musí
vrátiť `200`, `Content-Type: application/wasm` a `Access-Control-Allow-Origin`.

Pozor na dva rôzne súbory menom `manifest.json`: `public/game/manifest.json` je zoznam
súborov WebGL buildu pre `/api/game`, kým `releases/manifest.json` v repe launchera je
kontrakt o vydaní desktopu. Nemajú spolu nič spoločné.
