export type HeroCapabilityIcon = 'package' | 'box' | 'palette' | 'layers' | 'image';
export type HeroFeature = {
  icon: HeroCapabilityIcon;
  label: string;
};

export interface HeroCapability {
  icon: HeroCapabilityIcon;
  label: string;
  description: string;
}

export interface HeroData {
  eyebrow: string;
  titleLines: string[];
  accentTitle: string;
  description: string;
  capabilities: HeroCapability[];
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
}

export const heroData: HeroData = {
  eyebrow: 'Diseña, personaliza y hazlo realidad',
  titleLines: ['Tus ideas,', 'productos únicos'],
  accentTitle: 'sin límites',
  description:
    'Crea productos personalizados desde cero, explora modelos 3D, encuentra diseños listos para usar y convierte tus ideas en productos reales.',
  capabilities: [
    { icon: 'package', label: 'Productos', description: 'Personalizables' },
    { icon: 'box', label: 'Diseñador 3D', description: 'Vista realista' },
    { icon: 'palette', label: 'Diseños', description: 'Listos para usar' },
    { icon: 'layers', label: 'Packs', description: 'Recursos premium' },
    { icon: 'image', label: 'Plantillas', description: 'Inspírate y crea' },
  ],
  primaryCta: { label: 'Comenzar a diseñar', href: '/designer/new?product=camisetas' },
  secondaryCta: { label: 'Explorar productos', href: '/products' },
};
