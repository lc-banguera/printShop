import { Product } from './products.data';

export interface ProductAttributeOption {
  id: string;
  label: string;
  colorHex?: string;
}

export interface ProductAttribute {
  id: string;
  label: string;
  type: 'color' | 'pill';
  required?: boolean;
  options: ProductAttributeOption[];
  defaultValue?: string;
}

/**
 * Retorna las características configurables para un producto de manera dinámica
 * y extensible para cualquier categoría (camisetas, hoodies, tazas, gorras, bolsos, etc.)
 */
export function getProductConfigurableAttributes(product: Product): ProductAttribute[] {
  if (product.attributes) {
    return product.attributes.filter((attribute) => Array.isArray(attribute.value)).map((attribute) => ({
      id: attribute.definitionId,
      label: attribute.name,
      type: attribute.definitionId === 'color' ? 'color' : 'pill',
      required: false,
      options: (attribute.value as string[]).map((value, index) => ({ id: value, label: value, colorHex: attribute.definitionId === 'color' ? product.colors?.[index] : undefined })),
    }));
  }
  // Si el producto ya define atributos personalizados en su metadata, usarlos directamente
  if ((product as any).customAttributes && Array.isArray((product as any).customAttributes)) {
    return (product as any).customAttributes;
  }

  const category = (product.category || '').toLowerCase();
  const attributes: ProductAttribute[] = [];

  // 1. Color (si el producto tiene variantes de color)
  if (product.colors && product.colors.length > 0) {
    attributes.push({
      id: 'color',
      label: 'Color',
      type: 'color',
      required: true,
      options: product.colors.map((hex, idx) => ({
        id: hex,
        label: getColorName(hex, idx),
        colorHex: hex,
      })),
      defaultValue: product.colors[0],
    });
  }

  // 2. Talla (si el producto tiene tallas definidas)
  if (product.sizes && product.sizes.length > 0) {
    attributes.push({
      id: 'size',
      label: 'Talla',
      type: 'pill',
      required: true, // Obligatoria según especificación (debe seleccionarse)
      options: product.sizes.map((s) => ({ id: s, label: s })),
      // Sin defaultValue para obligar al usuario a elegir su talla
    });
  }

  // Legacy catalog entries only expose the variants that they actually carry.
  // Dynamic seller products return above from their persisted attribute values.
  return attributes;

  // 3. Características específicas por categoría (extensible para PrintShop)
  // CAMISETAS
  if (category === 'camisetas') {
    attributes.push({
      id: 'fabricQuality',
      label: 'Calidad de tela',
      type: 'pill',
      required: false,
      defaultValue: 'Premium (180 GSM)',
      options: [
        { id: 'Básica (150 GSM)', label: 'Básica (150 GSM)' },
        { id: 'Premium (180 GSM)', label: 'Premium (180 GSM)' },
        { id: 'Superior (220 GSM)', label: 'Superior (220 GSM)' },
      ],
    });
    attributes.push({
      id: 'material',
      label: 'Material',
      type: 'pill',
      required: false,
      defaultValue: 'Algodón 100%',
      options: [
        { id: 'Algodón 100%', label: 'Algodón 100%' },
        { id: 'Algodón Peinado Premium', label: 'Algodón Peinado Premium' },
      ],
    });
  }

  // HOODIES / SUDADERAS
  else if (category === 'hoodies' || category === 'sudaderas') {
    attributes.push({
      id: 'fabricQuality',
      label: 'Calidad de tela',
      type: 'pill',
      required: false,
      defaultValue: 'Premium (320 GSM)',
      options: [
        { id: 'Clásica (280 GSM)', label: 'Clásica (280 GSM)' },
        { id: 'Premium (320 GSM)', label: 'Premium (320 GSM)' },
        { id: 'Térmica (360 GSM)', label: 'Térmica (360 GSM)' },
      ],
    });
    attributes.push({
      id: 'material',
      label: 'Material',
      type: 'pill',
      required: false,
      defaultValue: 'Algodón-Poliéster',
      options: [
        { id: 'Algodón-Poliéster', label: 'Algodón-Poliéster' },
        { id: 'Fleece Algodón Premium', label: 'Fleece Algodón Premium' },
      ],
    });
  }

  // TAZAS
  else if (category === 'tazas') {
    attributes.push({
      id: 'capacity',
      label: 'Capacidad',
      type: 'pill',
      required: false,
      defaultValue: '11 oz (Estándar)',
      options: [
        { id: '11 oz (Estándar)', label: '11 oz (Estándar)' },
        { id: '15 oz (Grande)', label: '15 oz (Grande)' },
      ],
    });
    attributes.push({
      id: 'material',
      label: 'Material',
      type: 'pill',
      required: false,
      defaultValue: 'Cerámica AAA',
      options: [
        { id: 'Cerámica AAA', label: 'Cerámica AAA' },
        { id: 'Cerámica Mate', label: 'Cerámica Mate' },
      ],
    });
  }

  // GORRAS
  else if (category === 'gorras') {
    attributes.push({
      id: 'adjustment',
      label: 'Tipo de ajuste',
      type: 'pill',
      required: false,
      defaultValue: 'Snapback ajustable',
      options: [
        { id: 'Snapback ajustable', label: 'Snapback ajustable' },
        { id: 'Cierre metálico', label: 'Cierre metálico' },
        { id: 'Flexfit elástica', label: 'Flexfit elástica' },
      ],
    });
    attributes.push({
      id: 'material',
      label: 'Material',
      type: 'pill',
      required: false,
      defaultValue: 'Algodón 100%',
      options: [
        { id: 'Algodón 100%', label: 'Algodón 100%' },
        { id: 'Drill resistente', label: 'Drill resistente' },
      ],
    });
  }

  // BOLSOS
  else if (category === 'bolsos') {
    attributes.push({
      id: 'size',
      label: 'Tamaño',
      type: 'pill',
      required: false,
      defaultValue: 'Estándar (35x40 cm)',
      options: [
        { id: 'Estándar (35x40 cm)', label: 'Estándar (35x40 cm)' },
        { id: 'Grande con fuelle (42x45 cm)', label: 'Grande con fuelle (42x45 cm)' },
      ],
    });
    attributes.push({
      id: 'material',
      label: 'Material',
      type: 'pill',
      required: false,
      defaultValue: 'Lona de algodón 10oz',
      options: [
        { id: 'Lona de algodón 10oz', label: 'Lona de algodón 10oz' },
        { id: 'Lona premium reforzada 14oz', label: 'Lona premium reforzada 14oz' },
      ],
    });
  }

  // PÓSTERS / CUADROS
  else if (category === 'posters' || category === 'cuadros' || category === 'decoracion') {
    attributes.push({
      id: 'size',
      label: 'Tamaño',
      type: 'pill',
      required: false,
      defaultValue: 'A3 (30x42 cm)',
      options: [
        { id: 'A4 (21x30 cm)', label: 'A4 (21x30 cm)' },
        { id: 'A3 (30x42 cm)', label: 'A3 (30x42 cm)' },
        { id: 'A2 (42x60 cm)', label: 'A2 (42x60 cm)' },
      ],
    });
    attributes.push({
      id: 'paperType',
      label: 'Tipo de papel',
      type: 'pill',
      required: false,
      defaultValue: 'Mate premium 200g',
      options: [
        { id: 'Mate premium 200g', label: 'Mate premium 200g' },
        { id: 'Fotográfico satinado 240g', label: 'Fotográfico satinado 240g' },
      ],
    });
    attributes.push({
      id: 'finish',
      label: 'Acabado',
      type: 'pill',
      required: false,
      defaultValue: 'Sin marco',
      options: [
        { id: 'Sin marco', label: 'Sin marco' },
        { id: 'Marco aluminio negro', label: 'Marco aluminio negro' },
        { id: 'Marco madera natural', label: 'Marco madera natural' },
      ],
    });
  }

  return attributes;
}

export function getColorName(hex: string, idx: number = 0): string {
  const map: Record<string, string> = {
    '#000000': 'Negro',
    '#FFFFFF': 'Blanco',
    '#EF4444': 'Rojo',
    '#E50C74': 'Magenta',
    '#5D46E8': 'Morado',
    '#6B7280': 'Gris',
    '#0284C7': 'Azul',
    '#D1D5DB': 'Gris perla',
    '#F59E0B': 'Ámbar',
  };
  return map[hex.toUpperCase()] || map[hex.toLowerCase()] || `Color ${idx + 1}`;
}
