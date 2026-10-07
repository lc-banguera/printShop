/* eslint-disable react/no-unknown-property */
import { Decal, Line, useTexture } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { CanvasElement } from '@/types/canvas';
import type { PrintableZoneConfig } from '@/types/product';
import { processArtworkImageUrl } from '@/core/design/processing';
import { threeJsRenderer } from '../../renderer/threejs-renderer';

// The GLB currently has a verified physical calibration for its front fabric only.
const FRONT_MODEL_CALIBRATION = {
  modelWidth: 0.31,
  modelHeight: 0.49,
  modelCenterY: 1.245,
};

export interface Designer2ArtworkProps {
  artwork?: CanvasElement[];
  selectedArtworkId?: string | null;
  onSelectArtwork?: (id: string) => void;
  onMoveArtwork?: (id: string, x: number, y: number) => void;
  showPrintArea?: boolean;
  showGuides?: boolean;
  showGrid?: boolean;
  showSelection?: boolean;
  className?: string;
}

interface ArtworkDecalsProps {
  elements: CanvasElement[];
  selectedElementId: string | null;
  mesh: THREE.Mesh;
  printableArea: PrintableZoneConfig;
  showPrintArea: boolean;
  showSelection: boolean;
  onSelect?: (id: string) => void;
  onMove?: (id: string, x: number, y: number) => void;
}

interface ArtworkDecalProps {
  element: CanvasElement;
  image: string;
  selected: boolean;
  mesh: THREE.Mesh;
  printableArea: PrintableZoneConfig;
  interactive: boolean;
  onSelect?: (id: string) => void;
  onMove?: (id: string, x: number, y: number) => void;
}

interface ArtworkPointerEvent {
  pointerId: number;
  nativeEvent: PointerEvent;
  stopPropagation: () => void;
}

function getModelPosition(
  element: CanvasElement,
  mesh: THREE.Mesh,
  printableArea: PrintableZoneConfig
) {
  const x = element.x + element.width / 2;
  const y = element.y + element.height / 2;
  const localX = ((x - printableArea.x - printableArea.width / 2) / printableArea.width) * FRONT_MODEL_CALIBRATION.modelWidth;
  const localY = FRONT_MODEL_CALIBRATION.modelCenterY + FRONT_MODEL_CALIBRATION.modelHeight / 2 - ((y - printableArea.y) / printableArea.height) * FRONT_MODEL_CALIBRATION.modelHeight;
  mesh.updateWorldMatrix(true, false);
  const localOrigin = mesh.worldToLocal(new THREE.Vector3(localX, localY, 0));
  localOrigin.z += 100;
  const worldOrigin = mesh.localToWorld(localOrigin);
  const worldDirection = new THREE.Vector3(0, 0, -1).transformDirection(mesh.matrixWorld);
  const raycaster = new THREE.Raycaster(worldOrigin, worldDirection);
  const hit = raycaster.intersectObject(mesh, false)[0];

  if (!hit) return null;

  const normal = hit.face?.normal.clone() ?? new THREE.Vector3(0, 0, 1);
  return mesh.worldToLocal(hit.point.clone()).addScaledVector(normal, 0.2);
}

function getModelScale(
  element: CanvasElement,
  mesh: THREE.Mesh,
  printableArea: PrintableZoneConfig
): [number, number, number] {
  const origin = mesh.worldToLocal(new THREE.Vector3(0, 0, 0));
  const width = mesh.worldToLocal(new THREE.Vector3(
    (element.width / printableArea.width) * FRONT_MODEL_CALIBRATION.modelWidth,
    0,
    0,
  ));
  const height = mesh.worldToLocal(new THREE.Vector3(
    0,
    (element.height / printableArea.height) * FRONT_MODEL_CALIBRATION.modelHeight,
    0,
  ));
  const depth = mesh.worldToLocal(new THREE.Vector3(0, 0, 0.08));
  const scaleX = (element.scaleX ?? 1) * Math.max(1.2, width.distanceTo(origin));
  const scaleY = (element.scaleY ?? 1) * Math.max(1.2, height.distanceTo(origin));
  return [
    scaleX,
    scaleY,
    Math.max(4, depth.distanceTo(origin)),
  ];
}

function PrintableAreaOutline({
  mesh,
  printableArea,
}: {
  mesh: THREE.Mesh;
  printableArea: PrintableZoneConfig;
}) {
  const points = useMemo(() => {
    const boundary: THREE.Vector3[] = [];
    const edgeSteps = 12;
    const edges = [
      (step: number) => [printableArea.x + (printableArea.width * step) / edgeSteps, printableArea.y],
      (step: number) => [printableArea.x + printableArea.width, printableArea.y + (printableArea.height * step) / edgeSteps],
      (step: number) => [printableArea.x + printableArea.width - (printableArea.width * step) / edgeSteps, printableArea.y + printableArea.height],
      (step: number) => [printableArea.x, printableArea.y + printableArea.height - (printableArea.height * step) / edgeSteps],
    ];

    mesh.updateMatrixWorld(true);
    for (const getPoint of edges) {
      for (let step = 0; step <= edgeSteps; step += 1) {
        const [x, y] = getPoint(step);
        const localX = ((x - printableArea.x - printableArea.width / 2) / printableArea.width) * FRONT_MODEL_CALIBRATION.modelWidth;
        const localY = FRONT_MODEL_CALIBRATION.modelCenterY + FRONT_MODEL_CALIBRATION.modelHeight / 2 - ((y - printableArea.y) / printableArea.height) * FRONT_MODEL_CALIBRATION.modelHeight;
        mesh.updateWorldMatrix(true, false);
        const localOrigin = mesh.worldToLocal(new THREE.Vector3(localX, localY, 0));
        localOrigin.z += 100;
        const worldOrigin = mesh.localToWorld(localOrigin);
        const worldDirection = new THREE.Vector3(0, 0, -1).transformDirection(mesh.matrixWorld);
        const raycaster = new THREE.Raycaster(worldOrigin, worldDirection);
        const hit = raycaster.intersectObject(mesh, false)[0];
        if (hit) {
          boundary.push(mesh.worldToLocal(hit.point.clone()).addScaledVector(
            hit.face?.normal ?? new THREE.Vector3(0, 0, 1),
            0.3,
          ));
        }
      }
    }
    if (boundary[0]) boundary.push(boundary[0].clone());
    return boundary;
  }, [mesh, printableArea]);

  const color = useMemo(
    () => getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(),
    [],
  );

  if (points.length < 4) return null;

  return (
    <Line
      points={points}
      color={color}
      lineWidth={1}
      transparent
      opacity={0.55}
      raycast={() => null}
    />
  );
}

function ArtworkDecal({
  element,
  image,
  selected,
  mesh,
  printableArea,
  interactive,
  onSelect,
  onMove,
}: ArtworkDecalProps) {
  const { gl } = useThree();
  const dragStart = useRef<{ pointerId: number; clientX: number; clientY: number; x: number; y: number } | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const baseTexture = useTexture(image);
  const [processedTexture, setProcessedTexture] = useState<THREE.Texture | null>(null);
  const meshRef = useMemo(() => ({ current: mesh }), [mesh]);
  const position = useMemo(
    () => getModelPosition({ ...element, ...dragPosition }, mesh, printableArea),
    [dragPosition, element, mesh, printableArea],
  );
  const scale = useMemo(
    () => getModelScale(element, mesh, printableArea),
    [element, mesh, printableArea],
  );

  useEffect(() => {
    setDragPosition(null);
  }, [element.x, element.y]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const canvas = document.createElement('canvas');
    void processArtworkImageUrl(
      image,
      element.filters,
      1024,
      controller.signal,
    )
      .then(async (processedImage) => {
        if (!active) return;
        const bitmap = await createImageBitmap(processedImage.blob);
        try {
          if (!active) return;
          canvas.width = processedImage.width;
          canvas.height = processedImage.height;
          const context = canvas.getContext('2d');
          if (!context) {
            throw new Error('Could not create a 2D context for the processed artwork.');
          }
          context.drawImage(bitmap, 0, 0);

          const nextTexture = new THREE.CanvasTexture(canvas);
          nextTexture.colorSpace = THREE.SRGBColorSpace;
          nextTexture.needsUpdate = true;
          if (active) setProcessedTexture(nextTexture);
          else nextTexture.dispose();
        } finally {
          bitmap.close();
        }
      })
      .catch((error: unknown) => {
        if (active && !(error instanceof Error && error.name === 'AbortError')) {
          console.error('Could not process the artwork texture.', error);
        }
      });

    return () => {
      active = false;
      controller.abort();
      setProcessedTexture((currentTexture) => {
        currentTexture?.dispose();
        return null;
      });
    };
  }, [element.filters, image]);

  useEffect(() => {
    baseTexture.colorSpace = THREE.SRGBColorSpace;
    baseTexture.needsUpdate = true;
  }, [baseTexture]);

  const startDrag = (event: ArtworkPointerEvent) => {
    if (!interactive || !onSelect) return;
    if (element.locked) {
      event.stopPropagation();
      event.nativeEvent.stopPropagation();
      return;
    }
    event.stopPropagation();
    event.nativeEvent.stopPropagation();
    onSelect(element.id);
    dragStart.current = {
      pointerId: event.pointerId,
      clientX: event.nativeEvent.clientX,
      clientY: event.nativeEvent.clientY,
      x: element.x,
      y: element.y,
    };
    gl.domElement.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: ArtworkPointerEvent) => {
    if (!interactive || element.locked) return;
    const start = dragStart.current;
    if (!start || start.pointerId !== event.pointerId) return;

    const bounds = gl.domElement.getBoundingClientRect();
    const next = {
      x: Math.max(
        printableArea.x,
        Math.min(
          printableArea.x + printableArea.width - element.width,
          start.x + ((event.nativeEvent.clientX - start.clientX) / bounds.width) * printableArea.width,
        ),
      ),
      y: Math.max(
        printableArea.y,
        Math.min(
          printableArea.y + printableArea.height - element.height,
          start.y + ((event.nativeEvent.clientY - start.clientY) / bounds.height) * printableArea.height,
        ),
      ),
    };
    setDragPosition(next);
  };

  const finishDrag = (event: ArtworkPointerEvent) => {
    if (!interactive || !onMove) return;
    const start = dragStart.current;
    if (!start || start.pointerId !== event.pointerId) return;

    const next = dragPosition;
    dragStart.current = null;
    if (gl.domElement.hasPointerCapture(event.pointerId)) {
      gl.domElement.releasePointerCapture(event.pointerId);
    }
    if (next && (next.x !== start.x || next.y !== start.y)) {
      onMove(element.id, next.x, next.y);
    }
  };

  if (!position || !(element.visible ?? true)) return null;

  return (
    <Decal
      mesh={meshRef}
      position={position}
      rotation={[0, 0, THREE.MathUtils.degToRad(element.rotation ?? 0)]}
      scale={scale}
      debug={selected}
      onPointerDown={interactive ? startDrag : undefined}
      onPointerMove={interactive ? moveDrag : undefined}
      onPointerUp={interactive ? finishDrag : undefined}
      onPointerCancel={interactive ? finishDrag : undefined}
      onPointerOver={interactive ? (event: ArtworkPointerEvent) => {
        event.stopPropagation();
        gl.domElement.style.cursor = element.locked ? 'not-allowed' : 'grab';
      } : undefined}
      onPointerOut={interactive ? () => {
        gl.domElement.style.cursor = '';
      } : undefined}
    >
      <meshStandardMaterial
        map={processedTexture ?? baseTexture}
        transparent
        opacity={element.opacity ?? 1}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-10}
      />
    </Decal>
  );
}

export function ArtworkDecals({
  elements,
  selectedElementId,
  mesh,
  printableArea,
  showPrintArea,
  showSelection,
  onSelect,
  onMove,
}: ArtworkDecalsProps) {
  const renderableArtwork = elements.flatMap((element) => {
    const renderable = threeJsRenderer.renderElement(element, { id: 'front' });
    return renderable ? [renderable] : [];
  });

  return (
    <>
      {showPrintArea && <PrintableAreaOutline mesh={mesh} printableArea={printableArea} />}
      {renderableArtwork.map(({ element, source }) => (
        <ArtworkDecal
          key={element.id}
          element={element}
          image={source}
          mesh={mesh}
          printableArea={printableArea}
          selected={showSelection && element.id === selectedElementId}
          interactive={showSelection && Boolean(onSelect && onMove)}
          onSelect={onSelect}
          onMove={onMove}
        />
      ))}
    </>
  );
}
