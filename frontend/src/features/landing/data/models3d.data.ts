/**
 * Datos de modelos 3D para la sección landing.
 * Se mantiene una estructura extensible para ropa y objetos reales del repositorio.
 */

export interface Model3DItem {
  id: string;
  name: string;
  type: string;
  category: 'ropa' | 'objetos' | 'dispositivos';
  imageName: string;
  supports3D: boolean;
  model3D: string | null;
  route?: string;
}

export const model3DFilters = [
  { id: 'all', label: 'Todos' },
  { id: 'ropa', label: 'Ropa' },
  { id: 'objetos', label: 'Objetos' },
  { id: 'dispositivos', label: 'Dispositivos' },
] as const;

export type Model3DFilterId = (typeof model3DFilters)[number]['id'];

export const models3DData: Model3DItem[] = [
  // ─── 1. Colección de Ropa ────────────────────────────────────────────────
  {
    id: 'model-1',
    name: 'Hoodie Oversize',
    type: 'Modelo de ropa',
    category: 'ropa',
    imageName: 'oversized-hoodie-fitted.png',
    supports3D: false,
    model3D: null,
  },
  {
    id: 'model-2',
    name: 'Sudadera Oversize',
    type: 'Modelo de ropa',
    category: 'ropa',
    imageName: 'oversized-sweatshirt-fitted.png',
    supports3D: false,
    model3D: null,
  },
  {
    id: 'model-3',
    name: 'Camiseta',
    type: 'Modelo de ropa',
    category: 'ropa',
    imageName: 't-shirt-basic-fitted.png',
    supports3D: true,
    model3D: 't_shirt.glb',
    route: '/designer/new?product=camisetas',
  },
  {
    id: 'model-4',
    name: 'Sudadera',
    type: 'Modelo de ropa',
    category: 'ropa',
    imageName: 'hoddie.png',
    supports3D: false,
    model3D: null,
  },
  {
    id: 'model-5',
    name: 'Camiseta de mujer',
    type: 'Modelo de ropa',
    category: 'ropa',
    imageName: 't-shirt-women-fitted.png',
    supports3D: false,
    model3D: null,
  },
  {
    id: 'model-6',
    name: 'Camiseta de hombre',
    type: 'Modelo de ropa',
    category: 'ropa',
    imageName: 't-shirt-mockup.png',
    supports3D: false,
    model3D: null,
  },
  {
    id: 'model-7',
    name: 'Hoodie',
    type: 'Modelo de ropa',
    category: 'ropa',
    imageName: 'hoddie.png',
    supports3D: false,
    model3D: null,
  },
  {
    id: 'model-8',
    name: 'Chaqueta acolchada',
    type: 'Modelo de ropa',
    category: 'ropa',
    imageName: 'puffer_jacket-fitted.png',
    supports3D: false,
    model3D: null,
  },
  {
    id: 'model-9',
    name: 'Chaqueta con cremallera',
    type: 'Modelo de ropa',
    category: 'ropa',
    imageName: 'hoddie.png',
    supports3D: false,
    model3D: null,
  },
  {
    id: 'model-10',
    name: 'Chaqueta abierta',
    type: 'Modelo de ropa',
    category: 'ropa',
    imageName: 'hoddie.png',
    supports3D: false,
    model3D: null,
  },
  {
    id: 'model-11',
    name: 'Gorro tipo bucket',
    type: 'Modelo de ropa',
    category: 'ropa',
    imageName: 'gorra.png',
    supports3D: false,
    model3D: null,
  },

  // ─── 2. Colección de Objetos (Tazas, Bolsas, Pósters) ────────────────────
  {
    id: 'model-12',
    name: 'Taza',
    type: 'Modelo de objeto',
    category: 'objetos',
    imageName: 'tazas.png',
    supports3D: false,
    model3D: null,
  },
  {
    id: 'model-13',
    name: 'Bolsa de tela',
    type: 'Modelo de objeto',
    category: 'objetos',
    imageName: 'shopping-bag-standard-fitted.png',
    supports3D: false,
    model3D: null,
  },
  {
    id: 'model-14',
    name: 'Póster',
    type: 'Modelo de objeto',
    category: 'objetos',
    imageName: 'cuadro.png',
    supports3D: false,
    model3D: null,
  },

  // ─── 3. Colección de Dispositivos ────────────────────────────────────────
  {
    id: 'model-15',
    name: 'iPhone 16',
    type: 'Modelo de dispositivo',
    category: 'dispositivos',
    imageName: 'iphone-16-fitted.png',
    supports3D: false,
    model3D: null,
  },
  {
    id: 'model-16',
    name: 'Pantalla dinámica',
    type: 'Modelo de dispositivo',
    category: 'dispositivos',
    imageName: 'device-screen.png',
    supports3D: false,
    model3D: null,
  },
  {
    id: 'model-17',
    name: 'MacBook Pro',
    type: 'Modelo de dispositivo',
    category: 'dispositivos',
    imageName: 'macbook-pro-fitted.png',
    supports3D: false,
    model3D: null,
  },
  {
    id: 'model-18',
    name: 'Monitor Pro Display',
    type: 'Modelo de dispositivo',
    category: 'dispositivos',
    imageName: 'pro-display-fitted.png',
    supports3D: false,
    model3D: null,
  },
  {
    id: 'model-19',
    name: 'iPad Pro',
    type: 'Modelo de dispositivo',
    category: 'dispositivos',
    imageName: 'ipad-pro-fitted.png',
    supports3D: false,
    model3D: null,
  },
];
