export interface InspirationTemplate {
  id: string;
  name: string;
  count: number;
  imageName: string;
}

export const inspirationData: InspirationTemplate[] = [
  {
    id: 'insp-1',
    name: 'Anime',
    count: 124,
    imageName: 'anime.png'
  },
  {
    id: 'insp-2',
    name: 'Minimalista',
    count: 98,
    imageName: 'minimalista.png'
  },
  {
    id: 'insp-3',
    name: 'Vintage',
    count: 86,
    imageName: 'vintage.png'
  },
  {
    id: 'insp-4',
    name: 'Frases',
    count: 132,
    imageName: 'frases.png'
  },
  {
    id: 'insp-5',
    name: 'Deportes',
    count: 76,
    imageName: 'deportes.png'
  },
  {
    id: 'insp-6',
    name: 'Música',
    count: 54,
    imageName: 'musica.png'
  },
  {
    id: 'insp-7',
    name: 'Naturaleza',
    count: 64,
    imageName: 'naturaleza.png'
  },
  {
    id: 'insp-8',
    name: 'Retro',
    count: 92,
    imageName: 'retro.png'
  }
];
