// Odkazy na stiahnutie FriLens. Pri novom vydaní meň iba tu, nie v stránke.
//
// FriLens je samostatná Android aplikácia, nie súčasť hry. Premieta navigačnú sieť
// fakulty do reálneho priestoru cez AR a slúži na meranie, ako presne to sedí.
//
// APK visí na GitHub Releases repozitára FriLens. Repozitár musí zostať verejný,
// inak release assety vrátia každému okrem majiteľa chybu 404.

export const frilens = {
  version: '0.1.7-alpha',

  apk: 'https://github.com/Robindhuil/FriLens/releases/download/v0.1.7-alpha/FriLens-0.1.7-alpha.apk',
  apkMb: 40,

  minAndroid: '7.1',

  releases: 'https://github.com/Robindhuil/FriLens/releases',

  // Google zoznam telefónov, ktoré vedia ARCore. Bez neho beží len režim Preview.
  arDevices: 'https://developers.google.com/ar/devices',
} as const;
