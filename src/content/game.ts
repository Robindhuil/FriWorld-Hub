// Centrálne metadáta hry. Tieto hodnoty uprav podľa potreby.

export const game = {
  title: 'FriWorld',
  tagline:
    'Interaktívna 3D prehliadka Fakulty riadenia a informatiky — priamo v prehliadači.',
  description:
    'FriWorld je interaktívna 3D prehliadka Fakulty riadenia a informatiky. Voľne sa prejdeš po vernom modeli fakulty, objavuješ priestory, stretávaš postavy a plníš úlohy. Popritom si cez minihry — vrátane simulovaného programovacieho prostredia — vyskúšaš základy programovania. Bez inštalácie, priamo v prehliadači.',
  studio: 'Fakultu riadenia a informatiky',
  version: '0.1.0',
  status: 'Alfa',
  // Externé odkazy — nahraď reálnymi URL.
  links: {
    discord: '#',
    web: '#',
  },
  features: [
    {
      title: 'Prejdi sa fakultou',
      body: 'Voľne sa pohybuj po vernom 3D modeli fakulty — objavuj učebne, chodby a zákutia, ako keby si tam naozaj bol.',
    },
    {
      title: 'Vyskúšaj programovanie',
      body: 'Minihry vrátane simulovaného programovacieho prostredia ti hravou formou ukážu prvé základy programovania.',
    },
    {
      title: 'Hraj v prehliadači',
      body: 'Žiadna inštalácia ani prihlásenie. Otvoríš stránku a si rovno vo vnútri fakulty.',
    },
  ],
} as const;
