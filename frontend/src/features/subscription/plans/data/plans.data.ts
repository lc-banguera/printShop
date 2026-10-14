export type BillingPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type PlanSectionItem = {
  label: string;
  included: boolean;
  detail?: string;
};

export type PlanSection = {
  title: string;
  items: PlanSectionItem[];
};

export type OnboardingPlan = {
  id: string;
  name: string;
  shortLabel: string;
  description: string;
  monthlyPrice: number;
  monthlyPriceLabel: string;
  recommended?: boolean;
  sections: PlanSection[];
  support: string;
};

export const billingPeriods: Array<{ value: BillingPeriod; label: string }> = [
  { value: 'daily', label: 'Diario' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensual' },
  { value: 'yearly', label: 'Anual' },
];

export const onboardingPlans: OnboardingPlan[] = [
  {
    id: 'free',
    name: 'Gratis',
    shortLabel: 'Para empezar',
    description: 'Ideal para dar tus primeros pasos y probar la base del ecosistema PrintShop sin compromisos de la mejor manera.',
    monthlyPrice: 0,
    monthlyPriceLabel: '$0',
    sections: [
      {
        title: 'Incluye',
        items: [
          { label: '1 tienda', included: true },
          { label: '1 usuario', included: true },
          { label: 'Productos y pedidos básicos', included: true },
          { label: 'Diseños y editor básico', included: true },
        ],
      },
      {
        title: 'Límites',
        items: [
          { label: 'Plantillas básicas', included: true },
          { label: 'Generación IA', included: false },
          { label: 'Automatizaciones', included: false },
          { label: 'WhatsApp', included: false },
        ],
      },
      {
        title: 'Soporte',
        items: [{ label: 'Comunidad y documentación', included: true }],
      },
    ],
    support: 'Soporte comunitario y recursos básicos.',
  },
  {
    id: 'basic',
    name: 'Basico',
    shortLabel: 'Más práctico',
    description: 'Ideal para tiendas pequeñas que necesitan más herramientas, más espacio y una mantener una operación más fluida.',
    monthlyPrice: 49900,
    monthlyPriceLabel: '$49.900',
    sections: [
      {
        title: 'Incluye',
        items: [
          { label: 'Hasta 5 tiendas', included: true },
          { label: 'Hasta 10 usuarios', included: true },
          { label: 'Diseñador completo', included: true },
          { label: 'Plantillas avanzadas', included: true },
        ],
      },
      {
        title: 'Operación',
        items: [
          { label: 'Generación IA limitada', included: true },
          { label: 'Automatizaciones básicas', included: true },
          { label: 'Personalización de productos', included: true },
          { label: 'Creación de diseños desde cero', included: true },
        ],
      },
      {
        title: 'Soporte',
        items: [{ label: 'Atención estándar', included: true }],
      },
    ],
    support: 'Soporte estándar para tu operación inicial.',
  },
  {
    id: 'professional',
    name: 'Profesional',
    shortLabel: 'Más popular',
    description: 'Diseñado para equipos que quieren escalar operaciones, automatizar tareas y ofrecer mejor experiencia a sus usuarios.',
    monthlyPrice: 119900,
    monthlyPriceLabel: '$119.900',
    recommended: true,
    sections: [
      {
        title: 'Incluye',
        items: [
          { label: 'Hasta 20 tiendas', included: true },
          { label: 'Hasta 50 usuarios', included: true },
          { label: 'Diseñador profesional', included: true },
          { label: 'IA para diseño y producción', included: true },
        ],
      },
      {
        title: 'Producción',
        items: [
          { label: 'Personalización avanzada', included: true },
          { label: 'Envío de diseños a tiendas', included: true },
          { label: 'Automatizaciones', included: true },
          { label: 'WhatsApp', included: true },
        ],
      },
      {
        title: 'Soporte',
        items: [{ label: 'Soporte prioritario', included: true }],
      },
    ],
    support: 'Soporte prioritario para equipos con crecimiento activo.',
  },
  {
    id: 'enterprise',
    name: 'Organizaciones',
    shortLabel: 'Escala',
    description: 'Solución para organizaciones con múltiples tiendas, automatización avanzada y requisitos comerciales personalizados.',
    monthlyPrice: 0,
    monthlyPriceLabel: 'A medida',
    sections: [
      {
        title: 'Incluye',
        items: [
          { label: 'Tiendas ilimitadas', included: true },
          { label: 'Usuarios ilimitados', included: true },
          { label: 'Automatizaciones avanzadas', included: true },
          { label: 'Dominio personalizado', included: true },
        ],
      },
      {
        title: 'Operación',
        items: [
          { label: 'Integraciones avanzadas', included: true },
          { label: 'API para desarrolladores', included: true },
          { label: 'Personalización empresarial', included: true },
          { label: 'Flujo cliente → tienda avanzado', included: true },
        ],
      },
      {
        title: 'Soporte',
        items: [{ label: 'Soporte dedicado y consultoría', included: true }],
      },
    ],
    support: 'Ajuste comercial y soporte dedicado para operación grande.',
  },
];
