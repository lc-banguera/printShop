import * as THREE from 'three';
import { useRef, useEffect, type ReactNode } from 'react';
import { useViewerStore } from '@/store/viewer-store';
import { ProductModel } from './product-model';

function ProductColorApplier({ color, modelUrl, children }: { color: string; modelUrl: string; children: ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  // Cache garment materials (three.js Material instances) to avoid repeated traversals
  const cachedMatsRef = useRef<THREE.Material[]>([]);

  // Populate cache once after the model is mounted or when the model URL changes
  useEffect(() => {
    cachedMatsRef.current = [];
    if (!groupRef.current) return;

    const seen = new Set<string>();
    groupRef.current.traverse((object) => {
      if (!('isMesh' in object) || !(object as THREE.Mesh).isMesh) return;
      const mesh = object as THREE.Mesh;
      const material = mesh.material;
      const materials = Array.isArray(material) ? material : [material];
      materials.forEach((mat) => {
        if (!mat) return;
        // use material.name to identify garment materials; match Knit_Fleece or Knit_Fleece_Terry prefix (case-insensitive)
        const name = (mat as any).name || '';
        const lname = name.toLowerCase();
        if (lname.startsWith('knit_fleece') || lname.startsWith('knit')) {
          const id = (mat as any).uuid || name || JSON.stringify(mat);
          if (!seen.has(id)) {
            seen.add(id);
            cachedMatsRef.current.push(mat as THREE.Material);
          }
        }
      });
    });
  }, [modelUrl]);

  // Apply color immediately to cached materials whenever color changes
  useEffect(() => {
    const mats = cachedMatsRef.current;
    if (!mats || mats.length === 0) return;
    const col = new THREE.Color(color);
    mats.forEach((mat) => {
      const anyMat = mat as any;
      if (anyMat && anyMat.color && typeof anyMat.color.set === 'function') {
        anyMat.color.set(col);
        // ensure three.js updates internals if necessary
        if (typeof anyMat.needsUpdate !== 'undefined') anyMat.needsUpdate = true;
      }
    });
  }, [color]);

  return <group ref={groupRef}>{children}</group>;
}

/**
 * ProductPivot – positions, scales and rotates the product model according to the
 * active ProductViewConfig for the selected printable zone. If no explicit view
 * config is available, fall back to a simple Y rotation map to preserve previous behavior.
 */
export function ProductPivot() {
  const activeZoneId = useViewerStore((s) => s.activeZoneId);
  const productColor = useViewerStore((s) => s.currentGarmentColor);
  const modelUrl = useViewerStore((s) => s.activeProduct.modelUrl ?? '');
  const viewConfig = useViewerStore((s) => s.activeProduct.viewConfigs?.[s.activeZoneId]);

  // Fallback rotation (degrees) kept for compatibility if no viewConfig is provided.
  const fallbackRotationDeg = { front: 0, back: 180, sleeve_left: 90, sleeve_right: 270, label: 0 }[activeZoneId] ?? 0;

  const cfg = viewConfig;
  const scale = cfg?.modelScale ?? 1.0;
  const offset = cfg?.modelOffset ?? { x: 0, y: 0, z: 0 };
  const rotationDeg = cfg ? cfg.modelRotation : { x: 0, y: fallbackRotationDeg, z: 0 };
  const rotationRad = {
    x: THREE.MathUtils.degToRad(rotationDeg.x),
    y: THREE.MathUtils.degToRad(rotationDeg.y),
    z: THREE.MathUtils.degToRad(rotationDeg.z),
  };

  return (
    <group>
      <group position={[offset.x, offset.y, offset.z]} rotation={[rotationRad.x, rotationRad.y, rotationRad.z]} scale={scale}>
        <ProductColorApplier color={productColor} modelUrl={modelUrl}>
          {modelUrl ? <ProductModel modelUrl={modelUrl} /> : null}
        </ProductColorApplier>
      </group>
    </group>
  );
}
