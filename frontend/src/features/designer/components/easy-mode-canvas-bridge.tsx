import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useCanvasStore } from "@/store/canvas-store";
import { useViewerStore } from "@/store/viewer-store";
import {
  createEasyModeCanvasElement,
  getEasyModeSession,
} from "../services/designer-mode-session";

function enteredFromEasyMode(locationState: unknown) {
  return typeof locationState === "object" &&
    locationState !== null &&
    "fromEasyMode" in locationState &&
    locationState.fromEasyMode === true;
}

export function EasyModeCanvasBridge() {
  const location = useLocation();

  useEffect(() => {
    if (!enteredFromEasyMode(location.state)) return;

    const session = getEasyModeSession();
    if (!session) return;

    const canvas = useCanvasStore.getState();
    const viewer = useViewerStore.getState();
    const existingElement = session.advancedElementId
      ? canvas.getElement(session.advancedElementId)
      : undefined;

    if (existingElement) {
      if (!session.imageUrl) {
        canvas.removeElement(existingElement.id);
        session.advancedElementId = null;
        session.advancedElementBaseSize = null;
        session.advancedImageUrl = null;
        return;
      }
      const zone = viewer.activeProduct.printableAreas[existingElement.zoneId];
      const imageChanged = session.advancedImageUrl !== session.imageUrl;
      const baseSize = imageChanged
        ? (() => {
            const dimensions = session.artworkDimensions;
            const aspectRatio = dimensions && dimensions.height > 0
              ? dimensions.width / dimensions.height
              : existingElement.width / existingElement.height;
            const width = Math.min(zone.width * 0.64, zone.height * 0.64 * aspectRatio);
            return { width, height: width / aspectRatio };
          })()
        : session.advancedElementBaseSize ?? {
        width: existingElement.width,
        height: existingElement.height,
      };
      session.advancedElementBaseSize = baseSize;
      const transform = session.artworkTransform;
      const centerX = zone.x + zone.width / 2 + transform.offsetX * zone.width;
      const centerY = zone.y + zone.height / 2 + transform.offsetY * zone.height;
      const width = baseSize.width * transform.scale;
      const height = baseSize.height * transform.scale;
      canvas.updateElement(existingElement.id, {
        x: centerX - width / 2,
        y: centerY - height / 2,
        width,
        height,
        image: session.imageUrl ?? existingElement.image,
        originalImageSrc: session.imageUrl ?? existingElement.originalImageSrc,
        rotation: transform.rotationDegrees,
        scaleX: transform.flipX ? -1 : 1,
        scaleY: transform.flipY ? -1 : 1,
      });
      session.advancedImageUrl = session.imageUrl;
      viewer.setActiveZone(existingElement.zoneId);
      canvas.selectElement(existingElement.id);
      return;
    }

    if (!session.imageUrl) return;

    const previousZoneId = viewer.activeZoneId;
    const product = viewer.activeProduct;
    const frontZone = product.printableAreas.front;
    const element = createEasyModeCanvasElement(session, frontZone);
    if (!element) return;

    viewer.setActiveZone(frontZone.id);
    canvas.addElement(element);
    canvas.selectElement(element.id);
    session.advancedElementId = element.id;
    session.advancedElementBaseSize = {
      width: element.width,
      height: element.height,
    };
    session.advancedImageUrl = session.imageUrl;
    session.previousAdvancedZoneId = previousZoneId;
  }, [location.key, location.state]);

  return null;
}
