import type React from 'react';
import { Palette, Box, Layers, Pencil } from 'lucide-react';

export interface ProductFeature {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
}

export const featuresData: ProductFeature[] = [
  {
    id: 'feature-customize',
    icon: Pencil,
    title: 'Personaliza productos',
    description: 'Trabaja directamente sobre productos reales. Elige color, talla y método de impresión.',
  },
  {
    id: 'feature-3d',
    icon: Box,
    title: 'Diseña en 3D',
    description: 'Visualiza tu diseño sobre el producto antes de producirlo. Vista realista en tiempo real.',
  },
  {
    id: 'feature-designs',
    icon: Palette,
    title: 'Usa diseños y packs',
    description: 'Explora diseños y recursos listos para usar. Empieza más rápido con lo que ya existe.',
  },
  {
    id: 'feature-create',
    icon: Layers,
    title: 'Crea desde cero',
    description: 'Sube tu imagen, aplica ajustes y prepara tu diseño para el proceso de impresión.',
  },
];
