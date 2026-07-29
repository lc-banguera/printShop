import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { CameraController } from './camera-controller';
import { ProductPivot } from './product-pivot';

function Lights() {
  return (
    <>
      <ambientLight intensity={0.45} />
      <hemisphereLight args={["#ffffff", "#a0a0a0", 0.25]} />
      <directionalLight
        castShadow
        position={[5, 5, 5]}
        intensity={0.85}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
    </>
  );
}

/**
 * SceneController – top‑level Three.js scene wrapper.
 * Provides the Canvas context and composes the required sub‑components.
 */
export function SceneController() {
  return (
    <Canvas
      className="h-full w-full"
      shadows
      camera={{ position: [0, 1.8, 3.2], fov: 42 }}
      gl={{ antialias: true }}
    >
      <CameraController />
      <Lights />
      <ProductPivot />
      <Environment preset="studio" background={false} />
    </Canvas>
  );
}
