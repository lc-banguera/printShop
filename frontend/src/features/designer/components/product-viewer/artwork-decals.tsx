/* eslint-disable react/no-unknown-property */
import { Decal, Line, useTexture } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { ArtworkFilters, CanvasElement } from '@/types/canvas';

const DEFAULT_ARTWORK_FILTERS: ArtworkFilters = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  grayscale: 0,
  sepia: 0,
  invert: 0,
  blur: 0,
};

const PRINT_AREA = {
  x: 197,
  y: 180,
  width: 400,
  height: 500,
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
  interactive: boolean;
  onSelect?: (id: string) => void;
  onMove?: (id: string, x: number, y: number) => void;
}

interface ArtworkPointerEvent {
  pointerId: number;
  nativeEvent: PointerEvent;
  stopPropagation: () => void;
}

function getModelPosition(element: CanvasElement, mesh: THREE.Mesh) {
  const x = element.x + element.width / 2;
  const y = element.y + element.height / 2;
  const localX = ((x - PRINT_AREA.x - PRINT_AREA.width / 2) / PRINT_AREA.width) * PRINT_AREA.modelWidth;
  const localY = PRINT_AREA.modelCenterY + PRINT_AREA.modelHeight / 2 - ((y - PRINT_AREA.y) / PRINT_AREA.height) * PRINT_AREA.modelHeight;
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

function getModelScale(element: CanvasElement, mesh: THREE.Mesh): [number, number, number] {
  const origin = mesh.worldToLocal(new THREE.Vector3(0, 0, 0));
  const width = mesh.worldToLocal(new THREE.Vector3(
    (element.width / PRINT_AREA.width) * PRINT_AREA.modelWidth,
    0,
    0,
  ));
  const height = mesh.worldToLocal(new THREE.Vector3(
    0,
    (element.height / PRINT_AREA.height) * PRINT_AREA.modelHeight,
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

function PrintableAreaOutline({ mesh }: { mesh: THREE.Mesh }) {
  const points = useMemo(() => {
    const boundary: THREE.Vector3[] = [];
    const edgeSteps = 12;
    const edges = [
      (step: number) => [PRINT_AREA.x + (PRINT_AREA.width * step) / edgeSteps, PRINT_AREA.y],
      (step: number) => [PRINT_AREA.x + PRINT_AREA.width, PRINT_AREA.y + (PRINT_AREA.height * step) / edgeSteps],
      (step: number) => [PRINT_AREA.x + PRINT_AREA.width - (PRINT_AREA.width * step) / edgeSteps, PRINT_AREA.y + PRINT_AREA.height],
      (step: number) => [PRINT_AREA.x, PRINT_AREA.y + PRINT_AREA.height - (PRINT_AREA.height * step) / edgeSteps],
    ];

    mesh.updateMatrixWorld(true);
    for (const getPoint of edges) {
      for (let step = 0; step <= edgeSteps; step += 1) {
        const [x, y] = getPoint(step);
        const localX = ((x - PRINT_AREA.x - PRINT_AREA.width / 2) / PRINT_AREA.width) * PRINT_AREA.modelWidth;
        const localY = PRINT_AREA.modelCenterY + PRINT_AREA.modelHeight / 2 - ((y - PRINT_AREA.y) / PRINT_AREA.height) * PRINT_AREA.modelHeight;
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
  }, [mesh]);

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

function buildFilterString(filters: Partial<ArtworkFilters> | undefined) {
  const next = { ...DEFAULT_ARTWORK_FILTERS, ...(filters ?? {}) };
  return [
    `brightness(${next.brightness}%)`,
    `contrast(${next.contrast}%)`,
    `saturate(${next.saturation}%)`,
    `grayscale(${next.grayscale}%)`,
    `sepia(${next.sepia}%)`,
    `invert(${next.invert}%)`,
    `blur(${next.blur}px)`,
  ].join(' ');
}

function ArtworkDecal({ element, image, selected, mesh, interactive, onSelect, onMove }: ArtworkDecalProps) {
  const { gl } = useThree();
  const dragStart = useRef<{ pointerId: number; clientX: number; clientY: number; x: number; y: number } | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const baseTexture = useTexture(image);
  const [processedTexture, setProcessedTexture] = useState<THREE.Texture | null>(null);
  const meshRef = useMemo(() => ({ current: mesh }), [mesh]);
  const position = useMemo(
    () => getModelPosition({ ...element, ...dragPosition }, mesh),
    [dragPosition, element, mesh],
  );
  const scale = useMemo(
    () => getModelScale(element, mesh),
    [element, mesh],
  );

  useEffect(() => {
    setDragPosition(null);
  }, [element.x, element.y]);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const imageElement = new Image();
    imageElement.onload = () => {
      const width = Math.max(1, Math.min(1024, imageElement.naturalWidth || imageElement.width || 1024));
      const height = Math.max(1, Math.min(1024, imageElement.naturalHeight || imageElement.height || 1024));
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) return;

      context.filter = buildFilterString(element.filters);
      context.drawImage(imageElement, 0, 0, width, height);

      const nextTexture = new THREE.CanvasTexture(canvas);
      nextTexture.colorSpace = THREE.SRGBColorSpace;
      nextTexture.needsUpdate = true;
      setProcessedTexture(nextTexture);
    };

    imageElement.src = image;

    return () => {
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
        PRINT_AREA.x,
        Math.min(
          PRINT_AREA.x + PRINT_AREA.width - element.width,
          start.x + ((event.nativeEvent.clientX - start.clientX) / bounds.width) * PRINT_AREA.width,
        ),
      ),
      y: Math.max(
        PRINT_AREA.y,
        Math.min(
          PRINT_AREA.y + PRINT_AREA.height - element.height,
          start.y + ((event.nativeEvent.clientY - start.clientY) / bounds.height) * PRINT_AREA.height,
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
  showPrintArea,
  showSelection,
  onSelect,
  onMove,
}: ArtworkDecalsProps) {
  return (
    <>
      {showPrintArea && <PrintableAreaOutline mesh={mesh} />}
      {elements
        .filter(
          (element) =>
            element.zoneId === 'front' &&
            (element.type === 'image' || element.type === 'text') &&
            Boolean(element.originalImageSrc ?? element.image),
        )
        .map((element) => (
          <ArtworkDecal
            key={element.id}
            element={element}
            image={element.originalImageSrc ?? element.image!}
            mesh={mesh}
            selected={showSelection && element.id === selectedElementId}
            interactive={showSelection && Boolean(onSelect && onMove)}
            onSelect={onSelect}
            onMove={onMove}
          />
        ))}
    </>
  );
}
