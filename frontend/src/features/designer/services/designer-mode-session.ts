import type { DesignResource } from "@/types/design-resource";
import { useCanvasStore } from "@/store/canvas-store";
import { useViewerStore } from "@/store/viewer-store";
import type { ArtworkTransform } from "../../../../../engine/src/transform/artwork-transform";
import type { CanvasElement } from "@/types/canvas";
import type { DocumentPath } from "../../../../../engine/src/types/element";

export type EasyModeBackground = "transparent" | "white" | "color";

export interface EasyModeSemitransparencyResult {
  resultUrl: string;
  previousUrl: string;
  previousDimensions: { width: number; height: number } | null;
}

export interface EasyModeImageSnapshot {
  activeUploadedAssetId: string | null;
  processedImageUrl: string | null;
  processedDimensions: { width: number; height: number } | null;
  showProcessedImage: boolean;
  removeSemitransparencies: boolean;
  semitransparencyResult: EasyModeSemitransparencyResult | null;
  artworkTransform: ArtworkTransform;
  vectorPaths?: DocumentPath[] | null;
}

export interface EasyModeSession {
  documentId: string;
  canvasSettings: {
    widthCm: string;
    heightCm: string;
    dpi: number;
    background: EasyModeBackground;
    backgroundColor: string;
  };
  canvasZoom: number;
  canvasPan: { x: number; y: number };
  uploadedAssets: Array<DesignResource & { file: File; identityKey: string }>;
  uploadedFolders: Array<{
    id: string;
    name: string;
    assets: Array<{
      assetId: string;
      relativePath: string;
      identityKey: string;
    }>;
    ignoredCount?: number;
  }>;
  activeUploadedAssetId: string | null;
  uploadedLibraryTab: "images" | "folders";
  activeUploadedFolderId: string | null;
  activeUploadedFolderPath: string;
  uploadSearch: string;
  processedImageUrl: string | null;
  processedDimensions: { width: number; height: number } | null;
  vectorPaths?: DocumentPath[] | null;
  showProcessedImage: boolean;
  removeSemitransparencies: boolean;
  semitransparencyResult: EasyModeSemitransparencyResult | null;
  imageHistory: {
    undo: EasyModeImageSnapshot[];
    redo: EasyModeImageSnapshot[];
  };
  artworkTransform: ArtworkTransform;
  artworkDimensions: { width: number; height: number } | null;
  isArtworkSelected: boolean;
  imageUrl: string | null;
  ownedProcessedImageUrls: string[];
  advancedElementId: string | null;
  advancedElementBaseSize: { width: number; height: number } | null;
  advancedImageUrl: string | null;
  previousAdvancedZoneId: CanvasElement["zoneId"] | null;
}

let easyModeSession: EasyModeSession | null = null;

export function saveEasyModeSession(session: EasyModeSession) {
  easyModeSession = session;
}

export function getEasyModeSession() {
  return easyModeSession;
}

export function clearEasyModeSession() {
  easyModeSession = null;
}

export function hasEasyModeSession() {
  return easyModeSession !== null;
}

export function syncEasyModeSessionFromAdvanced() {
  const session = easyModeSession;
  const elementId = session?.advancedElementId;
  const baseSize = session?.advancedElementBaseSize;
  if (!session || !elementId || !baseSize) return;

  const element = useCanvasStore.getState().getElement(elementId);
  if (!element) {
    session.activeUploadedAssetId = null;
    session.processedImageUrl = null;
    session.processedDimensions = null;
    session.vectorPaths = null;
    session.imageUrl = null;
    session.removeSemitransparencies = false;
    session.semitransparencyResult = null;
    session.imageHistory = { undo: [], redo: [] };
    session.artworkDimensions = null;
    if (session.previousAdvancedZoneId) {
      useViewerStore.getState().setActiveZone(session.previousAdvancedZoneId);
    }
    return;
  }

  const { activeProduct } = useViewerStore.getState();
  const zone = activeProduct.printableAreas[element.zoneId];
  const centerX = element.x + element.width / 2;
  const centerY = element.y + element.height / 2;
  const scaleX = Math.abs(element.scaleX ?? 1) * (element.width / baseSize.width);
  const scaleY = Math.abs(element.scaleY ?? 1) * (element.height / baseSize.height);

  session.artworkTransform = {
    scale: Math.max(0.1, Math.min(4, (scaleX + scaleY) / 2)),
    rotationDegrees: element.rotation ?? 0,
    flipX: (element.scaleX ?? 1) < 0,
    flipY: (element.scaleY ?? 1) < 0,
    offsetX: zone.width > 0
      ? (centerX - zone.x - zone.width / 2) / zone.width
      : 0,
    offsetY: zone.height > 0
      ? (centerY - zone.y - zone.height / 2) / zone.height
      : 0,
  };
  session.imageUrl = element.image ?? element.originalImageSrc ?? session.imageUrl;
  if (session.previousAdvancedZoneId) {
    useViewerStore.getState().setActiveZone(session.previousAdvancedZoneId);
  }
}

export function createEasyModeCanvasElement(
  session: EasyModeSession,
  zone: { id: CanvasElement["zoneId"]; x: number; y: number; width: number; height: number },
): CanvasElement | null {
  if (!session.imageUrl || zone.width <= 0 || zone.height <= 0) return null;

  const dimensions = session.artworkDimensions;
  const aspectRatio = dimensions && dimensions.height > 0
    ? dimensions.width / dimensions.height
    : 1;
  const width = Math.min(zone.width * 0.64, zone.height * 0.64 * aspectRatio);
  const height = width / aspectRatio;
  const { artworkTransform: transform } = session;
  const centerX = zone.x + zone.width / 2 + transform.offsetX * zone.width;
  const centerY = zone.y + zone.height / 2 + transform.offsetY * zone.height;

  return {
    id: session.advancedElementId ?? `easy-mode-${crypto.randomUUID()}`,
    type: "image",
    layer: "user",
    zoneId: zone.id,
    x: centerX - width / 2,
    y: centerY - height / 2,
    width,
    height,
    image: session.imageUrl,
    originalImageSrc: session.imageUrl,
    rotation: transform.rotationDegrees,
    scaleX: transform.scale * (transform.flipX ? -1 : 1),
    scaleY: transform.scale * (transform.flipY ? -1 : 1),
  };
}
