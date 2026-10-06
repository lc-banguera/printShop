import { create } from 'zustand';
import type { PrintableZoneId, ProductDefinition, ProductMaterial } from '@/types/product';
import { DEFAULT_PRODUCT } from '@/features/catalog/data/products';

function buildGarmentColors(product: ProductDefinition) {
  return product.materials.map((material) => material.color);
}

function normalizeColorIndex(index: number, colors: string[]) {
  return Math.max(0, Math.min(Math.max(colors.length - 1, 0), index));
}

function findMaterialForColor(product: ProductDefinition, color: string) {
  return product.materials.find((material) => material.color.toLowerCase() === color.toLowerCase()) ?? product.materials[0];
}

/**
 * Viewer state managed by Zustand. All interactions with the 3D product viewer
 * should read from or write to this store. It is the single source of truth for
 * viewer‑related data.
 */
export interface ViewerState {
  /** Currently selected product definition */
  activeProduct: ProductDefinition;
  /** Currently active printable zone (e.g., front, back, sleeve) */
  activeZoneId: PrintableZoneId;
  /** Zoom level (0.5 – 2.0) */
  zoom: number;
  /** Material selected for the product */
  selectedMaterial: ProductMaterial;
  /** Hex colour applied to the product */
  productColor: string;
  /** Flag indicating that a fit‑to‑view operation has been requested */
  fitRequested: boolean;
  /** Index of the currently active garment color slot */
  selectedColorIndex: number;
  /** Fixed garment color palette */
  garmentColors: string[];
  /** The active garment color currently applied to the product */
  currentGarmentColor: string;
  /** Brightness adjustment applied to the garment material */
  materialBrightness: number;
  /** Whether print-area guidance is visible on the garment */
  showGuides: boolean;
  /** Whether the viewport background grid is visible */
  showGrid: boolean;
  /** Selected product size */
  selectedSize: string;
  /** Selected print method */
  selectedPrintMethod: string;
  /** Whether the shared garment-color dialog is open */
  isGarmentColorPickerOpen: boolean;
  /** Target context for the reusable color dialog */
  colorPickerContext: 'garment' | 'design';

  // Actions ---------------------------------------------------------------
  setActiveProduct: (product: ProductDefinition) => void;
  setActiveZone: (zoneId: PrintableZoneId) => void;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  setSelectedMaterial: (material: ProductMaterial) => void;
  setProductColor: (color: string) => void;
  setMaterialBrightness: (value: number) => void;
  resetMaterialAppearance: () => void;
  requestFit: () => void;
  clearFitRequest: () => void;
  resetView: () => void;
  setSelectedColorIndex: (index: number) => void;
  selectGarmentColor: (index: number) => void;
  updateGarmentColor: (index: number, color: string) => void;
  setShowGuides: (value: boolean) => void;
  toggleShowGuides: () => void;
  setShowGrid: (value: boolean) => void;
  toggleShowGrid: () => void;
  setSelectedSize: (size: string) => void;
  setSelectedPrintMethod: (method: string) => void;
  setGarmentColorPickerOpen: (value: boolean) => void;
  setColorPickerContext: (context: 'garment' | 'design') => void;
}

/** Rotation angles (in degrees) for each printable zone. Used by ProductPivot. */
export const ZONE_ROTATION_MAP: Record<PrintableZoneId, number> = {
  front: 0,
  back: 180,
  sleeve_left: 90,
  sleeve_right: 270,
  label: 0,
};

/** Zustand store instance */
export const useViewerStore = create<ViewerState>((set) => ({
  activeProduct: DEFAULT_PRODUCT,
  activeZoneId: 'front',
  zoom: 1.0,
  selectedMaterial: DEFAULT_PRODUCT.materials[0],
  productColor: '#ffffff',
  fitRequested: false,
  selectedColorIndex: 0,
  garmentColors: buildGarmentColors(DEFAULT_PRODUCT),
  currentGarmentColor: '#ffffff',
  materialBrightness: 1,
  showGuides: false,
  showGrid: false,
  selectedSize: 'M',
  selectedPrintMethod: 'DTF',
  isGarmentColorPickerOpen: false,
  colorPickerContext: 'garment',

  setSelectedSize: (size: string) => set({ selectedSize: size }),
  setSelectedPrintMethod: (method: string) => set({ selectedPrintMethod: method }),
  setGarmentColorPickerOpen: (value: boolean) => set({ isGarmentColorPickerOpen: value }),
  setColorPickerContext: (context) => set({ colorPickerContext: context }),

  setActiveProduct: (product) =>
    set((state) => {
      const garmentColors = buildGarmentColors(product);
      const preservedColorIndex = garmentColors.findIndex(
        (color) => color.toLowerCase() === state.currentGarmentColor.toLowerCase(),
      );
      const selectedColorIndex = preservedColorIndex >= 0 ? preservedColorIndex : 0;
      const currentColor = garmentColors[selectedColorIndex] ?? state.currentGarmentColor;
      const material = findMaterialForColor(product, currentColor) ?? product.materials[0] ?? state.selectedMaterial;

      return {
        activeProduct: product,
        selectedMaterial: material,
        productColor: currentColor,
        currentGarmentColor: currentColor,
        garmentColors,
        selectedColorIndex,
      };
    }),

  setActiveZone: (zoneId) => set({ activeZoneId: zoneId }),

  setZoom: (zoom) =>
    set((state) => ({
      zoom: typeof zoom === 'function' ? zoom(state.zoom) : zoom,
    })),

  setSelectedMaterial: (material) => set({ selectedMaterial: material }),

  setProductColor: (color) =>
    set((state) => {
      const resolvedColor = color || state.currentGarmentColor;
      const material = findMaterialForColor(state.activeProduct, resolvedColor) ?? state.selectedMaterial;
      return {
        productColor: resolvedColor,
        currentGarmentColor: resolvedColor,
        selectedMaterial: material,
      };
    }),

  setMaterialBrightness: (value) =>
    set(() => ({
      materialBrightness: Math.min(1.4, Math.max(0.7, value)),
    })),

  resetMaterialAppearance: () =>
    set((state) => ({
      materialBrightness: 1,
      currentGarmentColor: state.garmentColors[state.selectedColorIndex] ?? '#ffffff',
      productColor: state.garmentColors[state.selectedColorIndex] ?? '#ffffff',
    })),

  requestFit: () => set({ fitRequested: true }),

  clearFitRequest: () => set({ fitRequested: false }),
  // Reset view triggers a fit operation without modifying zoom
  resetView: () => set({ fitRequested: true }),

  setSelectedColorIndex: (index) =>
    set((state) => {
      const safeIndex = normalizeColorIndex(index, state.garmentColors);
      const color = state.garmentColors[safeIndex] ?? state.currentGarmentColor;
      return { selectedColorIndex: safeIndex, currentGarmentColor: color, productColor: color };
    }),

  selectGarmentColor: (index) =>
    set((state) => {
      const safeIndex = normalizeColorIndex(index, state.garmentColors);
      const color = state.garmentColors[safeIndex] ?? state.currentGarmentColor;
      const material = findMaterialForColor(state.activeProduct, color) ?? state.selectedMaterial;
      return {
        selectedColorIndex: safeIndex,
        currentGarmentColor: color,
        productColor: color,
        selectedMaterial: material,
      };
    }),

  updateGarmentColor: (index, color) =>
    set((state) => {
      const safeIndex = normalizeColorIndex(index, state.garmentColors);
      const nextColors = [...state.garmentColors];
      nextColors[safeIndex] = color;
      return {
        garmentColors: nextColors,
        selectedColorIndex: safeIndex,
        currentGarmentColor: color,
        productColor: color,
        selectedMaterial: findMaterialForColor(state.activeProduct, color) ?? state.selectedMaterial,
      };
    }),

  setShowGuides: (value) => set({ showGuides: value }),
  toggleShowGuides: () => set((state) => ({ showGuides: !state.showGuides })),
  setShowGrid: (value) => set({ showGrid: value }),
  toggleShowGrid: () => set((state) => ({ showGrid: !state.showGrid })),
}));
