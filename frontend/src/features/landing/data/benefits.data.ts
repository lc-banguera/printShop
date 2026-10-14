import type React from 'react';
import { ShieldCheck, SquarePen, Truck, CreditCard } from 'lucide-react';

export interface Benefit {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
}

export const benefitsData: Benefit[] = [
  {
    id: 'benefit-1',
    icon: ShieldCheck,
    title: 'Productos de alta calidad',
    description: 'Materiales premium y duraderos',
  },
  {
    id: 'benefit-2',
    icon: SquarePen,
    title: 'Personalización fácil',
    description: 'Diseña en minutos',
  },
  {
    id: 'benefit-3',
    icon: Truck,
    title: 'Envíos rápidos',
    description: 'A todo el país',
  },
  {
    id: 'benefit-4',
    icon: CreditCard,
    title: 'Pagos seguros',
    description: 'Compra con confianza',
  },
];
