/* eslint-disable react/no-unknown-property */
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useMemo } from 'react';
import type { PrintableZoneConfig } from '@/types/product';
import { ArtworkDecals, type Designer2ArtworkProps } from './artwork-decals';

interface ProductModelProps extends Designer2ArtworkProps {
  modelUrl: string;
  printableArea: PrintableZoneConfig;
}

/**
 * ProductModel loads and renders a GLB model.
 * It receives the model URL through props and does not own viewer state.
 */
export function ProductModel({
  modelUrl,
  printableArea,
  artwork = [],
  selectedArtworkId = null,
  onSelectArtwork,
  onMoveArtwork,
  showPrintArea,
  showSelection = true,
  constrainToPrintArea = true,
}: ProductModelProps) {
  const { scene } = useGLTF(modelUrl) as { scene: THREE.Group };
  const shouldShowPrintArea = showPrintArea ?? Boolean(onSelectArtwork && onMoveArtwork);

  const clonedScene = useMemo(() => scene.clone(true) as THREE.Group, [scene]);
  const printableMesh = useMemo<THREE.Mesh | null>(() => {
    let candidate: THREE.Mesh | null = null;
    let largestGeometry = 0;

    clonedScene.traverse((object) => {
      if (!('isMesh' in object) || !object.isMesh) return;
      const mesh = object as THREE.Mesh;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const hasFrontFabric = materials.some((material) =>
        /knit.*front/i.test(material.name),
      );
      if (!hasFrontFabric) return;

      mesh.geometry.computeBoundingBox();
      const bounds = mesh.geometry.boundingBox;
      if (!bounds) return;
      const sizeX = bounds.max.x - bounds.min.x;
      const sizeY = bounds.max.y - bounds.min.y;
      const vertices = mesh.geometry.attributes.position?.count ?? 0;
      if (sizeX < 0.3 || sizeY < 0.5 || bounds.max.z <= 0 || vertices <= largestGeometry) return;

      candidate = mesh;
      largestGeometry = vertices;
    });

    return candidate;
  }, [clonedScene]);

  const overlayMatrix = printableMesh ? printableMesh.matrixWorld.clone() : null;

  return (
    <>
      <primitive object={clonedScene} />
      {overlayMatrix && printableMesh && (shouldShowPrintArea || artwork.length > 0) && (
        <group matrixAutoUpdate={false} matrix={overlayMatrix}>
          <ArtworkDecals
            elements={artwork}
            selectedElementId={selectedArtworkId}
            mesh={printableMesh}
            printableArea={printableArea}
            showPrintArea={shouldShowPrintArea}
            showSelection={showSelection}
            onSelect={onSelectArtwork}
            onMove={onMoveArtwork}
            constrainToPrintArea={constrainToPrintArea}
          />
        </group>
      )}
    </>
  );
}
