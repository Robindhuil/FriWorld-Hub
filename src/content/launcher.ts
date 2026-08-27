// Odkazy na stiahnutie launchera. Pri novom vydaní meň iba tu, nie v stránke.
//
// Launcher je malý program, ktorý si hru stiahne sám a ďalej ju udržiava aktuálnu.
// Samotná hra sa sťahuje až cez neho, takže tieto súbory majú desiatky megabajtov,
// nie stovky.

export const launcher = {
  version: '0.1.7-alpha',

  // Celý balíček. Obsahuje aj náhradný spôsob spustenia pre prípad, že Windows
  // odmietne spustiť .exe — preto je to hlavná ponuka, nie samotný .exe.
  windowsZip:
    'https://github.com/Robindhuil/FriWorld-Launcher/releases/download/v0.1.7-alpha/FriWorld-Launcher-0.1.7-alpha-win-x64.zip',
  windowsZipMb: 60,

  // Jeden súbor, bez náhradného spustenia. Pre toho, kto vie, čo robí.
  windowsExe:
    'https://github.com/Robindhuil/FriWorld-Launcher/releases/download/v0.1.7-alpha/FriWorldLauncher.exe',
  windowsExeMb: 50,

  releases: 'https://github.com/Robindhuil/FriWorld-Launcher/releases',

  // Koľko miesta zaberie hra po inštalácii cez launcher.
  gameInstallGb: 0.75,
} as const;
