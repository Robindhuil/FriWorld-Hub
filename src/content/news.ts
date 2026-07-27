// Novinky / články. Nový pridáš na začiatok poľa.
// `body` je pole blokov, ktoré renderuje jednoduchý markdown-lite renderer
// (pozri src/components/Prose.tsx): "## nadpis", "- položka zoznamu", alebo odsek.

export type NewsPost = {
  slug: string;
  title: string;
  date: string; // ISO dátum
  tag: string;
  excerpt: string;
  body: string[];
};

export const news: NewsPost[] = [
  {
    slug: 'vitaj-vo-friworld',
    title: 'Vitaj vo FriWorld',
    date: '2026-06-10',
    tag: 'Oznámenie',
    excerpt:
      'Čo je FriWorld, prečo vznikol a ako si ho môžeš zahrať priamo teraz v prehliadači.',
    body: [
      'FriWorld je interaktívna 3D prehliadka Fakulty riadenia a informatiky. Vznikol ako moderný spôsob, ako fakultu predstaviť — najmä stredoškolákom, ktorých má hravou formou nalákať na štúdium informatiky.',
      '## Čo si v hre vyskúšaš',
      'Prejdeš sa po vernom 3D modeli fakulty, objavíš jej priestory a popritom narazíš na úlohy a interaktívne prvky.',
      '- Voľne sa pohybuj po fakulte',
      '- Objavuj učebne, chodby a zákutia',
      '- Vyskúšaj si základy programovania v minihrách',
      '## Ako hrať',
      'Stačí kliknúť na Hrať — beží to priamo v prehliadači, žiadna inštalácia ani prihlásenie. Najlepšie funguje na počítači v Chrome alebo Edge.',
    ],
  },
  {
    slug: 'co-ta-caka-vo-vnutri',
    title: 'Čo ťa čaká vo vnútri',
    date: '2026-06-15',
    tag: 'Novinky',
    excerpt:
      'Krátky pohľad na to, čo vo FriWorld nájdeš dnes a na čom ďalej pracujeme.',
    body: [
      'FriWorld spája dve veci do jedného zážitku: predstaví ti fakultu zvnútra a zároveň ti dá prvý praktický kontakt s programovaním.',
      '## Dnes v hre',
      '- Prieskum 3D modelu fakulty',
      '- Interaktívne objekty a postavy',
      '- Minihry so základmi programovania',
      '## Na čom pracujeme',
      'Toto je skorá verzia a bude sa rýchlo meniť. Pribudnú ďalšie priestory, viac úloh a vychytávky v programovacích minihrách. Sleduj novinky.',
    ],
  },
];

export function getPost(slug: string): NewsPost | undefined {
  return news.find((p) => p.slug === slug);
}
