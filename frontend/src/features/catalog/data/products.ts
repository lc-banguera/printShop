// src/features/catalog/data/products.ts
import type { ProductDefinition } from '@/types/product';
import tshirtGlb from '@/resources/mockup/t_shirt.glb?url';
import tshirtMockup from '@/resources/mockup/t-shirt-mockup.png?url';

export const DEFAULT_PRODUCT: ProductDefinition = {
  id: 'classic-tshirt',
  name: 'Camiseta Clásica',
  category: 'Textil',
  thumbnail: tshirtMockup,
  preview: tshirtMockup,
  printableAreas: {
    front: { id: 'front', name: 'Frente', x: 197, y: 180, width: 400, height: 500, enabled: true, visible: true },
    back: { id: 'back', name: 'Espalda', x: 197, y: 180, width: 400, height: 500, enabled: true, visible: true },
    sleeve_left: { id: 'sleeve_left', name: 'Manga Izq.', x: 270, y: 250, width: 250, height: 350, enabled: true, visible: true },
    sleeve_right: { id: 'sleeve_right', name: 'Manga Der.', x: 270, y: 250, width: 250, height: 350, enabled: true, visible: true },
    label: { id: 'label', name: 'Etiqueta', x: 320, y: 150, width: 150, height: 150, enabled: true, visible: true },
  },
  viewConfigs: {
    front: {
      id: 'front',
      name: 'Frente',
      cameraPosition: { x: 0.0, y: 1.6, z: 3.0 },
      cameraTarget: { x: 0.0, y: 1.2, z: 0.0 },
      defaultZoom: 1.0,
      modelScale: 1.0,
      modelOffset: { x: 0.0, y: 0.0, z: 0.0 },
      modelRotation: { x: 0, y: 0, z: 0 },
      printableArea: { id: 'front', name: 'Frente', x: 197, y: 180, width: 400, height: 500, enabled: true, visible: true },
    },
    back: {
      id: 'back',
      name: 'Espalda',
      cameraPosition: { x: 0.0, y: 1.6, z: 3.0 },
      cameraTarget: { x: 0.0, y: 1.2, z: 0.0 },
      defaultZoom: 1.0,
      modelScale: 1.0,
      modelOffset: { x: 0.0, y: 0.0, z: 0.0 },
      modelRotation: { x: 0, y: 180, z: 0 },
      printableArea: { id: 'back', name: 'Espalda', x: 197, y: 180, width: 400, height: 500, enabled: true, visible: true },
    },
    sleeve_left: {
      id: 'sleeve_left',
      name: 'Manga Izq.',
      cameraPosition: { x: 0.8, y: 1.4, z: 2.6 },
      cameraTarget: { x: 0.6, y: 1.1, z: 0.0 },
      defaultZoom: 1.05,
      modelScale: 1.0,
      modelOffset: { x: 0.0, y: 0.0, z: 0.0 },
      modelRotation: { x: 0, y: 90, z: 0 },
      printableArea: { id: 'sleeve_left', name: 'Manga Izq.', x: 270, y: 250, width: 250, height: 350, enabled: true, visible: true },
    },
    sleeve_right: {
      id: 'sleeve_right',
      name: 'Manga Der.',
      cameraPosition: { x: -0.8, y: 1.4, z: 2.6 },
      cameraTarget: { x: -0.6, y: 1.1, z: 0.0 },
      defaultZoom: 1.05,
      modelScale: 1.0,
      modelOffset: { x: 0.0, y: 0.0, z: 0.0 },
      modelRotation: { x: 0, y: 270, z: 0 },
      printableArea: { id: 'sleeve_right', name: 'Manga Der.', x: 270, y: 250, width: 250, height: 350, enabled: true, visible: true },
    },
    label: {
      id: 'label',
      name: 'Etiqueta',
      cameraPosition: { x: 0.0, y: 1.9, z: 2.2 },
      cameraTarget: { x: 0.0, y: 1.6, z: 0.2 },
      defaultZoom: 1.15,
      modelScale: 1.05,
      modelOffset: { x: 0.0, y: 0.05, z: 0.08 },
      modelRotation: { x: 0, y: 0, z: 0 },
      printableArea: { id: 'label', name: 'Etiqueta', x: 320, y: 150, width: 150, height: 150, enabled: true, visible: true },
    },
  },
  materials: [
    { id: 'white', name: 'Blanco', color: '#ffffff' },
    { id: 'black', name: 'Negro', color: '#171421' },
  ],
  modelUrl: tshirtGlb,
};

export const PRODUCTS: ProductDefinition[] = [DEFAULT_PRODUCT];
