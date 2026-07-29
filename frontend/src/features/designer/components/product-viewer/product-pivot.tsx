import * as THREE from 'three';
import { useRef, useEffect, type ReactNode } from 'react';
import { useViewerStore } from '@/store/viewer-store';
import { ProductModel } from './product-model';

function ProductColorApplier({ color, children }: { color: string; children: ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    groupRef.current.traverse((object) => {
      if (!('isMesh' in object) || !(object as THREE.Mesh).isMesh) return;
      const mesh = object as THREE.Mesh;
      const material = mesh.material;
      const materials = Array.isArray(material) ? material : [material];

      materials.forEach((mat) => {
        if (mat && typeof (mat as any).color !== 'undefined') {
          const anyMat = mat as any;
          if (anyMat.color && typeof anyMat.color.set === 'function') {
            anyMat.color.lerp(new THREE.Color(color), 0.18);
          }
        }
      });
    });
  }, [color]);

  return <group ref={groupRef}>{children}</group>;
}

/**
 * ProductPivot – positions, scales and rotates the product model according to the
 * active ProductViewConfig for the selected printable zone. If no explicit view * config is available, fall back to a simple Y rotation map to preserve previous behavior. */
export function ProductPivot() {  const activeZoneId = useViewerStore((s) => s.activeZoneId);  const productColor = useViewerStore((s) => s.currentGarmentColor);  const modelUrl = useViewerStore((s) => s.activeProduct.modelUrl ?? '');  const viewConfig = useViewerStore((s) => s.activeProduct.viewConfigs?.[s.activeZoneId]);  // Fallback rotation (degrees) kept for compatibility if no viewConfig is provided.  const fallbackRotationDeg = { front: 0, back: 180, sleeve_left: 90, sleeve_right: 270, label: 0 }[activeZoneId] ?? 0;  const cfg = viewConfig;  const scale = cfg?.modelScale ?? 1.0;  const offset = cfg?.modelOffset ?? { x: 0, y: 0, z: 0 };  const rotationDeg = cfg ? cfg.modelRotation : { x: 0, y: fallbackRotationDeg, z: 0 };  const rotationRad = {    x: THREE.MathUtils.degToRad(rotationDeg.x),    y: THREE.MathUtils.degToRad(rotationDeg.y),    z: THREE.MathUtils.degToRad(rotationDeg.z),  };  return (    <group>      <group position={[offset.x, offset.y, offset.z]} rotation={[rotationRad.x, rotationRad.y, rotationRad.z]} scale={scale}>        <ProductColorApplier color={productColor}>          {modelUrl ? <ProductModel modelUrl={modelUrl} /> : null}        </ProductColorApplier>      </group>    </group>  );}
