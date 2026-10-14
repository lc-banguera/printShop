import designImg1 from '@/resources/designs/img1.jpg';
import designImg2 from '@/resources/designs/img2.png';
import designImg4 from '@/resources/designs/img4.png';
import designImg7 from '@/resources/designs/img7.jpg';
import designImg10 from '@/resources/designs/img10.jpg';

export type DesignPackStatus = 'draft' | 'pending_review' | 'published' | 'rejected';
export type DesignPackAccess = 'free' | 'paid';

export interface MarketplaceAssetRef {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  storageKey?: string;
  assetUrl?: string;
  kind: 'original' | 'preview' | 'cover';
}

export interface DesignPack {
  id: string;
  title: string;
  description: string;
  category: string;
  access: DesignPackAccess;
  price: number;
  currency: 'USD';
  creatorId: string;
  creatorName: string;
  status: DesignPackStatus;
  createdAt: string;
  updatedAt: string;
  designCount: number;
  formats: string[];
  contents: string[];
  license: string;
  cover?: MarketplaceAssetRef;
  previews: MarketplaceAssetRef[];
  originals: MarketplaceAssetRef[];
  isFixture?: boolean;
}

const fixtureAsset = (id: string, name: string, assetUrl: string, kind: MarketplaceAssetRef['kind']): MarketplaceAssetRef => ({
  id,
  name,
  mimeType: name.endsWith('.png') ? 'image/png' : 'image/jpeg',
  sizeBytes: 0,
  assetUrl,
  kind,
});

const fixturePack = (pack: Omit<DesignPack, 'isFixture'>): DesignPack => ({ ...pack, isFixture: true });

export const designPackFixtures: DesignPack[] = [
  fixturePack({
    id: 'fixture-street-lettering',
    title: 'Street Lettering Essentials',
    description: 'Composición tipográfica urbana lista para prendas, accesorios y piezas promocionales. La descarga conserva el archivo de origen sin recomprimirlo.',
    category: 'Tipografía',
    access: 'free',
    price: 0,
    currency: 'USD',
    creatorId: 'fixture-printshop',
    creatorName: 'PrintShop Studio',
    status: 'published',
    createdAt: '2026-09-12T10:00:00.000Z',
    updatedAt: '2026-09-12T10:00:00.000Z',
    designCount: 12,
    formats: ['JPG de origen'],
    contents: ['12 composiciones tipográficas', 'Archivos vectoriales editables', 'Versiones listas para impresión'],
    license: 'Uso comercial en productos físicos propios. No se permite revender los archivos originales.',
    cover: fixtureAsset('street-cover', 'street-lettering.jpg', designImg1, 'cover'),
    previews: [
      fixtureAsset('street-preview-1', 'street-lettering-01.jpg', designImg1, 'preview'),
      fixtureAsset('street-preview-2', 'street-lettering-02.jpg', designImg7, 'preview'),
    ],
    originals: [fixtureAsset('street-original', 'street-lettering-essentials.jpg', designImg1, 'original')],
  }),
  fixturePack({
    id: 'fixture-anime-night',
    title: 'Anime Night Collection',
    description: 'Pack de ilustraciones inspiradas en noches urbanas y cultura pop, preparado para DTF y sublimación con fondos transparentes en los archivos originales.',
    category: 'Ilustración',
    access: 'paid',
    price: 319,
    currency: 'USD',
    creatorId: 'fixture-ink-lab',
    creatorName: 'Ink Lab',
    status: 'published',
    createdAt: '2026-09-26T10:00:00.000Z',
    updatedAt: '2026-09-26T10:00:00.000Z',
    designCount: 24,
    formats: ['PNG transparente', 'JPG de vista previa'],
    contents: ['24 ilustraciones', 'Archivos a 4500 px', 'Paleta preparada para prendas claras y oscuras'],
    license: 'Uso comercial en productos físicos. La licencia no permite redistribuir el pack ni sus archivos.',
    cover: fixtureAsset('anime-cover', 'anime-night.png', designImg2, 'cover'),
    previews: [
      fixtureAsset('anime-preview-1', 'anime-night-01.jpg', designImg2, 'preview'),
      fixtureAsset('anime-preview-2', 'anime-night-02.png', designImg4, 'preview'),
      fixtureAsset('anime-preview-3', 'anime-night-03.jpg', designImg10, 'preview'),
    ],
    originals: [fixtureAsset('anime-original', 'anime-night-collection.png', designImg2, 'original')],
  }),
  fixturePack({
    id: 'fixture-botanica-calma',
    title: 'Botánica en calma',
    description: 'Formas botánicas limpias para colecciones de ropa, papelería y accesorios. La descarga conserva el archivo de origen sin aplanarlo ni recomprimirlo.',
    category: 'Naturaleza',
    access: 'paid',
    price: 179,
    currency: 'USD',
    creatorId: 'fixture-norte-studio',
    creatorName: 'Norte Studio',
    status: 'published',
    createdAt: '2026-10-02T10:00:00.000Z',
    updatedAt: '2026-10-02T10:00:00.000Z',
    designCount: 18,
    formats: ['JPG de origen'],
    contents: ['18 motivos botánicos', 'Trazos vectoriales', 'Composiciones individuales y agrupadas'],
    license: 'Uso comercial en productos físicos propios, sin reventa del archivo fuente.',
    cover: fixtureAsset('botanica-cover', 'botanica-calma.jpg', designImg7, 'cover'),
    previews: [
      fixtureAsset('botanica-preview-1', 'botanica-calma-01.jpg', designImg7, 'preview'),
      fixtureAsset('botanica-preview-2', 'botanica-calma-02.jpg', designImg10, 'preview'),
    ],
    originals: [fixtureAsset('botanica-original', 'botanica-en-calma.jpg', designImg7, 'original')],
  }),
  fixturePack({
    id: 'fixture-geometria-basica',
    title: 'Geometría básica',
    description: 'Un conjunto gratuito de formas geométricas para probar el flujo de adquisición y crear composiciones rápidas sin membresía.',
    category: 'Abstracto',
    access: 'free',
    price: 0,
    currency: 'USD',
    creatorId: 'fixture-printshop',
    creatorName: 'PrintShop Studio',
    status: 'published',
    createdAt: '2026-10-05T10:00:00.000Z',
    updatedAt: '2026-10-05T10:00:00.000Z',
    designCount: 8,
    formats: ['JPG de origen'],
    contents: ['8 formas geométricas', 'Versiones individuales', 'Archivo de origen intacto'],
    license: 'Uso comercial en productos físicos propios. No se permite redistribuir los archivos originales.',
    cover: fixtureAsset('geometry-cover', 'geometria-basica.jpg', designImg10, 'cover'),
    previews: [fixtureAsset('geometry-preview-1', 'geometria-basica-01.jpg', designImg10, 'preview')],
    originals: [fixtureAsset('geometry-original', 'geometria-basica.jpg', designImg10, 'original')],
  }),
];

export const designPackCategories = ['Todas', ...Array.from(new Set(designPackFixtures.map((pack) => pack.category)))];

export const designPacks = designPackFixtures;
