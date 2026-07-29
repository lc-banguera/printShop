import { useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useViewerStore } from '@/store/viewer-store';
import * as THREE from 'three';

const MIN_DISTANCE = 1.4;
const MAX_DISTANCE = 20;
const FOV = 42;
const TARGET_VIEW_RATIO = 0.75;
// Keep zoom bounds in sync with UI handler in CanvasArea
const ZOOM_MIN = 0.35;
const ZOOM_MAX = 2.5;

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
 * CameraController – reads the active ProductViewConfig and applies camera/controls.
 * Falls back to a safety fit using bounding box only if no config is provided or the
 * scene bounds are invalid.
 *
 * Additionally synchronizes viewerStore.zoom with the three.js camera distance so
 * the zoom buttons and mouse wheel share a single source of truth.
 */
export function CameraController() {
  const { camera, scene } = useThree();
  const activeProduct = useViewerStore((s) => s.activeProduct);
  const activeZoneId = useViewerStore((s) => s.activeZoneId);
  const zoom = useViewerStore((s) => s.zoom);
  const setZoom = useViewerStore((s) => s.setZoom);
  const controlsRef = useRef<any>(null);

  // baseDistance defines the distance that corresponds to zoom = 1.0
  const baseDistanceRef = useRef<number | null>(null);
  // Flag to avoid reacting to our own programmatic camera moves
  const isUpdatingFromStoreRef = useRef(false);

  const bounds = useMemo(() => getModelBounds(scene), [scene, activeProduct.modelUrl]);
  // Helper: compute target vector from controls or last applied config
  const getTarget = () => {
    if (controlsRef.current && controlsRef.current.target) {
      return controlsRef.current.target.clone();
    }
    return new THREE.Vector3(0, 0, 0);
  };
  // Map a desired zoom value to a camera position along current view direction
  const applyZoomToCamera = (desiredZoom: number) => {
    if (!camera) return;
    const target = getTarget();
    const currentPos = camera.position.clone();
    const dir = currentPos.clone().sub(target);
    const dirLen = dir.length();
    if (dirLen === 0) return;
    // Ensure baseDistance is initialized
    if (baseDistanceRef.current == null) {
      // Interpret current camera distance as the one for the current zoom value
      baseDistanceRef.current = dirLen * Math.max(1e-6, desiredZoom);
    }
    const baseDistance = baseDistanceRef.current!;
    const newDistance = Math.min(Math.max(baseDistance / Math.max(1e-6, desiredZoom), MIN_DISTANCE), MAX_DISTANCE);
    const newPos = target.clone().add(dir.normalize().multiplyScalar(newDistance));
    // Apply programmatic move and avoid loops
    isUpdatingFromStoreRef.current = true;
    camera.position.copy(newPos);
    camera.updateProjectionMatrix();
    if (controlsRef.current) controlsRef.current.update();
    // Reset the flag on next tick
    setTimeout(() => (isUpdatingFromStoreRef.current = false), 0);
  };
  useEffect(() => {
    // Try to read an explicit view configuration for the active product/zone.
    const viewConfig = activeProduct?.viewConfigs?.[activeZoneId];
    if (viewConfig) {
      // Apply camera transform from configuration.
      const targetVec = new THREE.Vector3(viewConfig.cameraTarget.x, viewConfig.cameraTarget.y, viewConfig.cameraTarget.z);
      const posVec = new THREE.Vector3(viewConfig.cameraPosition.x, viewConfig.cameraPosition.y, viewConfig.cameraPosition.z);
      camera.position.copy(posVec);
      camera.lookAt(targetVec);
      camera.updateProjectionMatrix();
      if (controlsRef.current) {
        controlsRef.current.target.copy(targetVec);
        controlsRef.current.update();
      }
      // Establish baseDistance so zoom mapping is consistent.
      const currentDistance = camera.position.distanceTo(targetVec);
      baseDistanceRef.current = currentDistance * (viewConfig.defaultZoom ?? 1);
      // Seed the store zoom from the viewConfig default (this will also trigger the zoom effect below)
      try {        setZoom(viewConfig.defaultZoom);      } catch (e) {        /* ignore */      }      return;    }    // No explicit config — use bounding box as a safety fallback (should be rare).    if (!bounds || bounds.isEmpty()) return;    const setup = getFitSetup(bounds);    const position = new THREE.Vector3(      setup.center.x,      setup.center.y + setup.radius * 0.3,      setup.center.z + setup.distance,    );    camera.position.copy(position);    camera.lookAt(setup.center);    camera.updateProjectionMatrix();    if (controlsRef.current) {      controlsRef.current.target.copy(setup.center);      controlsRef.current.update();    }    // Set baseDistance based on the current store zoom so mapping holds    const currentDistance = camera.position.distanceTo(setup.center);    baseDistanceRef.current = currentDistance * (zoom ?? 1);  }, [activeProduct, activeZoneId, bounds, camera, setZoom, zoom]);
  // React to store.zoom changes and update camera distance only (keep target/orientation)
  useEffect(() => {    if (zoom == null) return;    applyZoomToCamera(zoom);  }, [zoom]);
  // Wire OrbitControls -> store: when user interacts with controls (mouse wheel or dolly),  // update the store's zoom so UI and programmatic changes share a single source of truth.
  useEffect(() => {    const controls = controlsRef.current;    if (!controls) return;    const handler = () => {      if (isUpdatingFromStoreRef.current) return; // ignore programmatic moves      const target = controls.target.clone();      const dist = camera.position.distanceTo(target);      // derive zoom from baseDistanceRef: zoom = baseDistance / dist      if (baseDistanceRef.current == null) return;      const nextZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, baseDistanceRef.current / Math.max(1e-6, dist)));      // update store only if meaningfully different      setZoom((prev) => {        if (Math.abs(prev - nextZoom) < 1e-3) return prev;        return nextZoom;      });    };    controls.addEventListener('change', handler);    return () => controls.removeEventListener('change', handler);  }, [controlsRef.current, camera, setZoom]);
  useEffect(() => {    if (!controlsRef.current) return;    controlsRef.current.minDistance = MIN_DISTANCE;    controlsRef.current.maxDistance = MAX_DISTANCE;    controlsRef.current.enableDamping = false;    controlsRef.current.rotateSpeed = 0.7;    controlsRef.current.panSpeed = 0.7;    controlsRef.current.zoomSpeed = 0.8;  }, []);
  return (    <OrbitControls
      ref={controlsRef}      enableZoom      enablePan      enableRotate      minDistance={MIN_DISTANCE}      maxDistance={MAX_DISTANCE}      enableDamping={false}      rotateSpeed={0.7}      panSpeed={0.7}      zoomSpeed={0.8}    />  );
}
