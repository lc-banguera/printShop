import { useGLTF } from '@react-three/drei';
import type { Group } from 'three';
import { useMemo } from 'react';

interface ProductModelProps {
  modelUrl: string;
}

/**
 * ProductModel loads and renders a GLB model.
 * It receives the model URL through props and does not own viewer state.
 */
export function ProductModel({ modelUrl }: ProductModelProps) {
  const { scene } = useGLTF(modelUrl) as { scene: Group };

  const clonedScene = useMemo(() => scene.clone(true) as Group, [scene]);

  return <primitive object={clonedScene} />;
}
