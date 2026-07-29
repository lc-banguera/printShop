import { useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useViewerStore } from '@/store/viewer-store';
import * as THREE from 'three';

const MIN_DISTANCE = 1.4;
const MAX_DISTANCE = 20;
const FOV = 42;
const TARGET_VIEW_RATIO = 0.75;

function getModelBounds(scene: THREE.Object3D) {
  const box = new THREE.Box3();
  box.setFromObject(scene);
  return box;
}

function getFitSetup(bounds: THREE.Box3) {
  const center = bounds.getCenter(new THREE.Vector3());
  const sphere = bounds.getBoundingSphere(new THREE.Sphere());
  const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
  const distance = (sphere.radius / (TARGET_VIEW_RATIO * tanHalfFov)) * 1.03;
  return {
    center,
    radius: sphere.radius,
    distance: Math.max(MIN_DISTANCE, Math.min(MAX_DISTANCE, distance)),
  };
}

/**
 * CameraController – reads the active ProductViewConfig and applies camera/controls. * Falls back to a safety fit using bounding box only if no config is provided or the
 * scene bounds are invalid. */
export function CameraController() {  const { camera, scene } = useThree();  const activeProduct = useViewerStore((s) => s.activeProduct);  const activeZoneId = useViewerStore((s) => s.activeZoneId);  const setZoom = useViewerStore((s) => s.setZoom);  const controlsRef = useRef<any>(null);  const bounds = useMemo(() => getModelBounds(scene), [scene, activeProduct.modelUrl]);  useEffect(() => {    // Try to read an explicit view configuration for the active product/zone.    const viewConfig = activeProduct?.viewConfigs?.[activeZoneId];    if (viewConfig) {      // Apply camera transform from configuration.      camera.position.set(viewConfig.cameraPosition.x, viewConfig.cameraPosition.y, viewConfig.cameraPosition.z);      camera.lookAt(new THREE.Vector3(viewConfig.cameraTarget.x, viewConfig.cameraTarget.y, viewConfig.cameraTarget.z));      camera.updateProjectionMatrix();      // Apply zoom into store so UI / controls can use it.      try {        setZoom(viewConfig.defaultZoom);      } catch (e) {        /* ignore */ }      if (controlsRef.current) {        controlsRef.current.target.set(viewConfig.cameraTarget.x, viewConfig.cameraTarget.y, viewConfig.cameraTarget.z);        controlsRef.current.update();      }      return;    }    // No explicit config — use bounding box as a safety fallback (should be rare).    if (!bounds || bounds.isEmpty()) return;    const setup = getFitSetup(bounds);    const position = new THREE.Vector3(      setup.center.x,      setup.center.y + setup.radius * 0.3,      setup.center.z + setup.distance,    );    camera.position.copy(position);    camera.lookAt(setup.center);    camera.updateProjectionMatrix();    if (controlsRef.current) {      controlsRef.current.target.copy(setup.center);      controlsRef.current.update();    }  }, [activeProduct, activeZoneId, bounds, camera, setZoom]);  useEffect(() => {    if (!controlsRef.current) return;    controlsRef.current.minDistance = MIN_DISTANCE;    controlsRef.current.maxDistance = MAX_DISTANCE;    controlsRef.current.enableDamping = false;    controlsRef.current.rotateSpeed = 0.7;    controlsRef.current.panSpeed = 0.7;    controlsRef.current.zoomSpeed = 0.8;  }, []);  return (    <OrbitControls
      ref={controlsRef}      enableZoom      enablePan      enableRotate      minDistance={MIN_DISTANCE}      maxDistance={MAX_DISTANCE}      enableDamping={false}      rotateSpeed={0.7}      panSpeed={0.7}      zoomSpeed={0.8}    />  );}
