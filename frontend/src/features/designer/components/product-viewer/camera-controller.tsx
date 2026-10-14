import { useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useViewerStore } from '@/store/viewer-store';
import * as THREE from 'three';

const MIN_DISTANCE = 0.5;
// Calibration factor: make default zoom (1) appear as current 250% size
const ZOOM_CALIBRATION = 2.5; // 250% scaling
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
export function CameraController({
  cameraDistanceScale = 1,
  cameraMinDistance = MIN_DISTANCE,
}: {
  cameraDistanceScale?: number;
  cameraMinDistance?: number;
}) {
  const { camera, scene } = useThree();
  const activeProduct = useViewerStore((s) => s.activeProduct);
  const activeZoneId = useViewerStore((s) => s.activeZoneId);
  const zoom = useViewerStore((s) => s.zoom);
  const setZoom = useViewerStore((s) => s.setZoom);
  const fitRequested = useViewerStore((s) => s.fitRequested);
  const clearFitRequest = useViewerStore((s) => s.clearFitRequest);

  // State holds the OrbitControls instance once mounted
  const [controls, setControls] = useState<any>(null);

  // Store the initial camera position and target from the first applied view config (or fallback).
  const initialSetupRef = useRef<{ position: THREE.Vector3; target: THREE.Vector3 } | null>(null);

  // baseDistance defines the distance that corresponds to zoom = 1.0
  const baseDistanceRef = useRef<number | null>(null);
  // Flag to avoid reacting to our own programmatic camera moves
  const isUpdatingFromStoreRef = useRef(false);

  // Expose lightweight debug hooks on window for runtime inspection during QA.
  useEffect(() => {
    try {
      const w = window as any;
      w.__ps_debug = w.__ps_debug || {};
      const dbg = w.__ps_debug;
      dbg.getZoom = () => useViewerStore.getState().zoom;
      dbg.getCameraPosition = () => (camera ? [camera.position.x, camera.position.y, camera.position.z] : null);
      dbg.getCameraDistance = () => {
        const t = controls?.target || new THREE.Vector3();
        return camera ? Number(camera.position.distanceTo(t)) : null;
      };
      dbg.lastOrbit = null;
      dbg.lastFitReceived = false;
      dbg.logState = (label: string) => console.log('[PS_DEBUG]', label, { zoom: dbg.getZoom(), camera: dbg.getCameraPosition(), distance: dbg.getCameraDistance() });
    } catch (e) {
      /* ignore */
    }
  }, [camera, controls]);

  const bounds = useMemo(() => getModelBounds(scene), [scene, activeProduct?.modelUrl]);

  // Helper: compute target vector from controls or last applied config
  const getTarget = () => {
    if (controls && controls.target) {
      return controls.target.clone();
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
      // Calibrate base distance so default zoom (1) appears larger by ZOOM_CALIBRATION
      baseDistanceRef.current = dirLen * Math.max(1e-6, desiredZoom * ZOOM_CALIBRATION);
    }

    const baseDistance = baseDistanceRef.current!;
    const newDistance = Math.min(
      Math.max(baseDistance / Math.max(1e-6, desiredZoom * ZOOM_CALIBRATION), cameraMinDistance),
      MAX_DISTANCE
    );
    const newPos = target.clone().add(dir.normalize().multiplyScalar(newDistance));

    // Apply programmatic move and avoid loops
    isUpdatingFromStoreRef.current = true;
    camera.position.copy(newPos);
    camera.updateProjectionMatrix();
    if (controls) controls.update();
    // Reset the flag on next tick
    setTimeout(() => (isUpdatingFromStoreRef.current = false), 0);
  };

  // Apply view config or fallback fit when product/zone changes
  useEffect(() => {
    const viewConfig = activeProduct?.viewConfigs?.[activeZoneId];

    isUpdatingFromStoreRef.current = true;
    if (viewConfig) {
      const targetVec = new THREE.Vector3(viewConfig.cameraTarget.x, viewConfig.cameraTarget.y, viewConfig.cameraTarget.z);
      const configuredPosition = new THREE.Vector3(viewConfig.cameraPosition.x, viewConfig.cameraPosition.y, viewConfig.cameraPosition.z);
      const posVec = targetVec.clone().add(configuredPosition.sub(targetVec).multiplyScalar(cameraDistanceScale));

      camera.position.copy(posVec);
      camera.lookAt(targetVec);
      camera.updateProjectionMatrix();

      if (controls) {
        controls.target.copy(targetVec);
        applyZoomToCamera(zoom);
      }

      if (!initialSetupRef.current) {
        initialSetupRef.current = { position: posVec.clone(), target: targetVec.clone() };
      }

      setTimeout(() => (isUpdatingFromStoreRef.current = false), 0);
      return;
    }

    // No explicit config — use bounding box as a safety fallback (should be rare).
    if (!bounds || bounds.isEmpty()) {
      isUpdatingFromStoreRef.current = false;
      return;
    }

    const setup = getFitSetup(bounds);
    const position = new THREE.Vector3(
      setup.center.x,
      setup.center.y + setup.radius * 0.3,
      setup.center.z + setup.distance,
    );
    // ---- Programmatic update start (fallback fit) ----
    isUpdatingFromStoreRef.current = true;
    camera.position.copy(position);
    camera.lookAt(setup.center);
    camera.updateProjectionMatrix();

    if (controls) {
      controls.target.copy(setup.center);
      controls.update();
    }

    if (!initialSetupRef.current) {
      initialSetupRef.current = { position: position.clone(), target: setup.center.clone() };
    }

    // Do NOT modify baseDistanceRef here – keep previous mapping.
    setTimeout(() => (isUpdatingFromStoreRef.current = false), 0);
  }, [activeProduct, activeZoneId, bounds, camera, controls, cameraDistanceScale, cameraMinDistance]);

  // React to store.zoom changes and update camera distance only (keep target/orientation)
  useEffect(() => {
    if (zoom == null) return;
    applyZoomToCamera(zoom);
  }, [zoom, controls]);

  // Wire OrbitControls -> store: when user interacts with controls (mouse wheel or dolly), update the store's zoom.
  useEffect(() => {
    const c = controls;
    if (!c) return;
    const handler = () => {
      // Ignore programmatic moves triggered by store updates
      if (isUpdatingFromStoreRef.current) return;

      const target = c.target.clone();
      const dist = camera.position.distanceTo(target);

      // Derive raw zoom from baseDistanceRef: rawZoom = baseDistance / dist
      if (baseDistanceRef.current == null) return;
      const rawZoom = Math.min(
        ZOOM_MAX * ZOOM_CALIBRATION,
        Math.max(ZOOM_MIN * ZOOM_CALIBRATION, baseDistanceRef.current / Math.max(1e-6, dist))
      );
      // Map raw zoom to UI zoom using calibration factor
      const nextZoom = rawZoom / ZOOM_CALIBRATION;

      // Update store only if meaningfully different
      if (Math.abs(zoom - nextZoom) >= 1e-3) {
        setZoom(nextZoom);
      }
    };
    c.addEventListener('change', handler);
    return () => c.removeEventListener('change', handler);
  }, [controls, camera, zoom]);

  // Fit button handling – restore the initially captured camera position/target without changing zoom.
  useEffect(() => {
    if (!fitRequested) return;
    isUpdatingFromStoreRef.current = true;
    if (initialSetupRef.current && camera && controls) {
      const { position, target } = initialSetupRef.current;
      camera.position.copy(position);
      camera.lookAt(target);
      camera.updateProjectionMatrix();
      controls.target.copy(target);
      controls.update();
      // Re‑compute baseDistance to keep current zoom mapping.
      const dist = camera.position.distanceTo(target);
      baseDistanceRef.current = dist * ((zoom ?? 1) * ZOOM_CALIBRATION);
    }
    setTimeout(() => (isUpdatingFromStoreRef.current = false), 0);
    clearFitRequest();
  }, [fitRequested, clearFitRequest, zoom, camera, controls]);

  // Configure limits and speeds after controls are available
  useEffect(() => {
    if (!controls) return;
    controls.minDistance = cameraMinDistance;
    controls.maxDistance = MAX_DISTANCE;
    controls.enableDamping = false;
    controls.rotateSpeed = 0.7;
    controls.panSpeed = 0.7;
    controls.zoomSpeed = 0.8;
  }, [controls, cameraMinDistance]);

  return (
    <OrbitControls
      ref={setControls}
      makeDefault
      enableRotate
      enableZoom
      enablePan
      minDistance={cameraMinDistance}
      maxDistance={MAX_DISTANCE}
      rotateSpeed={0.7}
      panSpeed={0.7}
      zoomSpeed={0.8}
    />
  );
}
