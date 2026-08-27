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

Pozor na dva rôzne súbory menom `manifest.json`: `public/game/manifest.json` je zoznam
súborov WebGL buildu pre `/api/game`, kým `releases/manifest.json` v repe launchera je
kontrakt o vydaní desktopu. Nemajú spolu nič spoločné.
