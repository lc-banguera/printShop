import tshirtImg from '@/resources/mockup/t-shirt-mockup.png';
import hoodieImg from '@/resources/mockup/hoddie.png';
import mugImg from '@/resources/mockup/tazas.png';
import capImg from '@/resources/mockup/gorra.png';
import posterImg from '@/resources/mockup/cuadro.png';
import bagImg from '@/resources/mockup/bolso.png';

export interface CategoryItem {
  id: string;
  name: string;
  image: string;
  href: string;
}

export const categoriesData: CategoryItem[] = [
  {
    id: 'camisetas',
    name: 'Camisetas',
    image: tshirtImg,
    href: '#',
  },
  {
    id: 'hoodies',
    name: 'Hoodies',
    image: hoodieImg,
    href: '#',
  },
  {
    id: 'tazas',
    name: 'Tazas',
    image: mugImg,
    href: '#',
  },
  {
    id: 'gorras',
    name: 'Gorras',
    image: capImg,
    href: '#',
  },
  {
    id: 'posters',
    name: 'Pósters',
    image: posterImg,
    href: '#',
  },
  {
    id: 'bolsos',
    name: 'Bolsos y bolsas',
    image: bagImg,
    href: '#',
  },
];
