/* eslint-disable react/no-unknown-property */
import { Canvas } from '@react-three/fiber';
import { Environment, Line } from '@react-three/drei';
import { CameraController } from './camera-controller';
import { ProductPivot } from './product-pivot';
import { useViewerStore } from '@/store/viewer-store';
import './scene-controller.css';
import type { Designer2ArtworkProps } from './artwork-decals';

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

function SceneGuides({ showGrid, showGuides }: { showGrid: boolean; showGuides: boolean }) {
  if (!showGrid && !showGuides) return null;

  return (
    <group position={[0, 0.9, -0.25]}>
      {showGrid && <gridHelper args={[1.6, 16, '#cbd5e1', '#e2e8f0']} position={[0, -0.95, 0]} />}
      {showGuides && (
        <group position={[0, -0.15, 0]}>
          <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
            <planeGeometry args={[0.55, 0.72]} />
            <meshBasicMaterial color="#7c6ef7" transparent opacity={0.12} side={2} />
          </mesh>
          <Line
            points={[
              [-0.275, 0.36, 0],
              [0.275, 0.36, 0],
              [0.275, -0.36, 0],
              [-0.275, -0.36, 0],
              [-0.275, 0.36, 0],
            ]}
            color="#7c6ef7"
            lineWidth={0.7}
            transparent
            opacity={0.8}
          />
        </group>
      )}
    </group>
  );
}

/**
 * SceneController – top‑level Three.js scene wrapper.
 * Provides the Canvas context and composes the required sub‑components.
 */
export function SceneController({
  showGuides: showGuidesOverride,
  showGrid: showGridOverride,
  className,
  ...artworkProps
}: Designer2ArtworkProps) {
  const showGuidesFromStore = useViewerStore((state) => state.showGuides);
  const showGridFromStore = useViewerStore((state) => state.showGrid);
  const resetView = useViewerStore((state) => state.resetView);
  const showGuides = showGuidesOverride ?? showGuidesFromStore;
  const showGrid = showGridOverride ?? showGridFromStore;

  return (
    <div className={`scene-container ${className ?? ''}`.trim()} onDoubleClick={resetView}>
      <Canvas
        className="h-full w-full"
        shadows
        camera={{ position: [0, 1.8, 3.2], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
      >
        <CameraController />
        <Lights />
        <SceneGuides showGuides={showGuides} showGrid={showGrid} />
        <ProductPivot {...artworkProps} />
        <Environment preset="studio" background={false} />
      </Canvas>
    </div>
  );
}
