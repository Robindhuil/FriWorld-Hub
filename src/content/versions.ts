// História verzií / patch notes. Najnovšie hore.

export type ChangeKind = 'Pridané' | 'Zmenené' | 'Opravené' | 'Odstránené';

export type Version = {
  version: string;
  date: string; // ISO dátum
  type: 'Vydanie' | 'Patch' | 'Hotfix';
  summary: string;
  changes: { kind: ChangeKind; items: string[] }[];
};

export const versions: Version[] = [
  {
    version: '0.1.0',
    date: '2026-06-10',
    type: 'Vydanie',
    summary: 'Prvá verejná verzia FriWorld — 3D prehliadka fakulty v prehliadači.',
    changes: [
      {
        kind: 'Pridané',
        items: [
          'Verný 3D model fakulty na voľný prieskum',
          'Prvé interaktívne objekty a postavy',
          'Programovacie minihry so základmi programovania',
          'Spustenie priamo v prehliadači, bez inštalácie',
        ],
      },
    ],
  },
  {
    version: '0.1.1',
    date: '2026-06-16',
    type: 'Patch',
    summary: 'Vylepšenia stability a ovládania podľa prvej spätnej väzby.',
    changes: [
      {
        kind: 'Zmenené',
        items: ['Plynulejší pohyb kamery', 'Doladené ovládanie pohybu'],
      },
      {
        kind: 'Opravené',
        items: [
          'Občasné zaseknutie pri rýchlom vstupe do sveta',
          'Zvuk sa neobnovil po prepnutí späť na záložku',
        ],
      },
    ],
  },
];

export const kindColor: Record<ChangeKind, string> = {
  'Pridané': 'text-emerald-600',
  'Zmenené': 'text-sky-600',
  'Opravené': 'text-amber-600',
  'Odstránené': 'text-red-500',
};
