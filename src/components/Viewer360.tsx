import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { FisheyeParams, Hotspot, ProjectionMode } from '../types';
import { MapPin, Info, ArrowUpRight, Image as ImageIcon } from 'lucide-react';

interface Viewer360Props {
  imageUrl: string;
  projectionMode: ProjectionMode;
  fisheyeParams: FisheyeParams;
  yaw: number;
  pitch: number;
  fov: number;
  isAutoRotating: boolean;
  autoRotateSpeed: number;
  showHotspots: boolean;
  hotspots?: Hotspot[];
  isPinningMode?: boolean;
  onViewChange: (state: { yaw: number; pitch: number; fov: number }) => void;
  onHotspotClick: (hotspot: Hotspot) => void;
  onSelectPinCoords?: (coords: { yaw: number; pitch: number }) => void;
}

export const Viewer360: React.FC<Viewer360Props> = ({
  imageUrl,
  projectionMode,
  fisheyeParams,
  yaw,
  pitch,
  fov,
  isAutoRotating,
  autoRotateSpeed,
  showHotspots,
  hotspots = [],
  isPinningMode = false,
  onViewChange,
  onHotspotClick,
  onSelectPinCoords,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sphereMeshRef = useRef<THREE.Mesh | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | THREE.MeshBasicMaterial | null>(null);
  const textureRef = useRef<THREE.Texture | null>(null);
  const pinsGroupRef = useRef<THREE.Group | null>(null);

  // Dragging & Interaction State
  const isDragging = useRef<boolean>(false);
  const previousMousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const velocity = useRef<{ yaw: number; pitch: number }>({ yaw: 0, pitch: 0 });
  const currentYaw = useRef<number>(yaw);
  const currentPitch = useRef<number>(pitch);
  const currentFov = useRef<number>(fov);

  // Hotspot DOM refs map
  const hotspotRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Throttled onViewChange callback
  const lastViewChangeTime = useRef<number>(0);
  const throttledViewChange = useCallback(
    (newYaw: number, newPitch: number, newFov: number) => {
      const now = performance.now();
      if (now - lastViewChangeTime.current > 33) { // ~30fps max for state updates
        lastViewChangeTime.current = now;
        onViewChange({ yaw: newYaw, pitch: newPitch, fov: newFov });
      }
    },
    [onViewChange]
  );

  // Keep state sync
  useEffect(() => {
    currentYaw.current = yaw;
    currentPitch.current = pitch;
    currentFov.current = fov;
  }, [yaw, pitch, fov]);

  // Create Fisheye GLSL Shader
  const createFisheyeShaderMaterial = useCallback(
    (texture: THREE.Texture, mode: ProjectionMode, params: FisheyeParams) => {
      const vertexShader = `
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;

      const fragmentShader = `
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying vec2 vUv;
        uniform sampler2D uTexture;
        uniform int uMode; // 0: Equirectangular, 1: Single Fisheye, 2: Dual Fisheye
        uniform float uRadius;
        uniform vec2 uCenter;
        uniform float uFovScale;
        uniform float uDistortion;

        #define PI 3.14159265359

        void main() {
          if (uMode == 0) {
            // Standard Equirectangular
            vec2 uv = vUv;
            gl_FragColor = texture2D(uTexture, uv);
          } else if (uMode == 1) {
            // Circular Polar Fisheye (Huawei 360 format)
            vec3 n = normalize(vWorldPosition);
            // Convert 3D inner direction vector to spherical angles
            float r = atan(sqrt(n.x * n.x + n.y * n.y), n.z) / PI;
            float phi = atan(n.y, n.x);
            
            // Apply radial distortion adjustment
            r = clamp(r, 0.0, 1.0);
            r = pow(r, 1.0 + uDistortion);

            // Scale to circle on texture (0.5 max radius from center (0.5, 0.5))
            vec2 fisheyeUv = uCenter + vec2(r * cos(phi), r * sin(phi)) * (uRadius * 0.5 * uFovScale);

            if (fisheyeUv.x < 0.0 || fisheyeUv.x > 1.0 || fisheyeUv.y < 0.0 || fisheyeUv.y > 1.0) {
              gl_FragColor = vec4(0.05, 0.05, 0.08, 1.0);
            } else {
              gl_FragColor = texture2D(uTexture, fisheyeUv);
            }
          } else if (uMode == 2) {
            // Dual Fisheye (Hemispheres)
            vec3 n = normalize(vWorldPosition);
            float r, phi;
            vec2 center;

            if (n.z >= 0.0) {
              r = atan(sqrt(n.x * n.x + n.y * n.y), n.z) / (PI * 0.5);
              phi = atan(n.y, n.x);
              center = vec2(0.25, 0.5);
            } else {
              r = atan(sqrt(n.x * n.x + n.y * n.y), -n.z) / (PI * 0.5);
              phi = atan(n.y, -n.x);
              center = vec2(0.75, 0.5);
            }

            r = clamp(r, 0.0, 1.0);
            vec2 fisheyeUv = center + vec2(r * cos(phi), r * sin(phi)) * (uRadius * 0.25 * uFovScale);

            if (fisheyeUv.x < 0.0 || fisheyeUv.x > 1.0 || fisheyeUv.y < 0.0 || fisheyeUv.y > 1.0) {
              gl_FragColor = vec4(0.05, 0.05, 0.08, 1.0);
            } else {
              gl_FragColor = texture2D(uTexture, fisheyeUv);
            }
          } else {
            // Fallback
            gl_FragColor = texture2D(uTexture, vUv);
          }
        }
      `;

      let modeInt = 0;
      if (mode === 'fisheye_single') modeInt = 1;
      if (mode === 'fisheye_dual') modeInt = 2;

      return new THREE.ShaderMaterial({
        uniforms: {
          uTexture: { value: texture },
          uMode: { value: modeInt },
          uRadius: { value: params.radius },
          uCenter: { value: new THREE.Vector2(params.centerX, params.centerY) },
          uFovScale: { value: params.fovScale },
          uDistortion: { value: params.distortion },
        },
        vertexShader,
        fragmentShader,
        side: THREE.DoubleSide,
      });
    },
    []
  );

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(currentFov.current, width / height, 1, 1100);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    rendererRef.current = renderer;

    // Geometry
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);

    // Initial Placeholder Mesh
    const material = new THREE.MeshBasicMaterial({ color: 0x111827 });
    materialRef.current = material;

    const sphereMesh = new THREE.Mesh(geometry, material);
    scene.add(sphereMesh);
    sphereMeshRef.current = sphereMesh;

    // Resize Observer
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []);

  // Update Texture & Material on imageUrl or projectionMode change
  useEffect(() => {
    if (!sphereMeshRef.current) return;

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(imageUrl, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
      textureRef.current = texture;

      if (materialRef.current) {
        materialRef.current.dispose();
      }

      if (projectionMode === 'equirectangular') {
        const mat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
        sphereMeshRef.current!.material = mat;
        sphereMeshRef.current!.material.needsUpdate = true;
        materialRef.current = mat;
      } else {
        const mat = createFisheyeShaderMaterial(texture, projectionMode, fisheyeParams);
        sphereMeshRef.current!.material = mat;
        sphereMeshRef.current!.material.needsUpdate = true;
        materialRef.current = mat;
      }
    });
  }, [imageUrl, projectionMode, createFisheyeShaderMaterial]);

  // Update Fisheye Shader Uniforms dynamically without reloading material
  useEffect(() => {
    if (
      materialRef.current &&
      'uniforms' in materialRef.current &&
      materialRef.current.uniforms
    ) {
      const u = materialRef.current.uniforms;
      if (u.uRadius) u.uRadius.value = fisheyeParams.radius;
      if (u.uCenter) u.uCenter.value.set(fisheyeParams.centerX, fisheyeParams.centerY);
      if (u.uFovScale) u.uFovScale.value = fisheyeParams.fovScale;
      if (u.uDistortion) u.uDistortion.value = fisheyeParams.distortion;
    }
  }, [fisheyeParams]);

  // Sync 3D Pin Objects directly in Three.js WebGL Canvas Scene
  useEffect(() => {
    if (!sceneRef.current) return;

    if (!pinsGroupRef.current) {
      const group = new THREE.Group();
      group.name = 'pins3dGroup';
      sceneRef.current.add(group);
      pinsGroupRef.current = group;
    }

    const group = pinsGroupRef.current;

    // Clear previous 3D pin meshes
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if ('geometry' in child) (child as THREE.Mesh).geometry?.dispose();
    }

    if (!showHotspots || !hotspots || hotspots.length === 0) return;

    hotspots.forEach((spot) => {
      const pinContainer = new THREE.Group();
      pinContainer.userData = { hotspotId: spot.id, spot };

      const sPhi = THREE.MathUtils.degToRad(90 - spot.pitch);
      const sTheta = THREE.MathUtils.degToRad(spot.yaw);

      const r = 480; // slightly inside 500 panorama sphere
      const x = r * Math.sin(sPhi) * Math.cos(sTheta);
      const y = r * Math.cos(sPhi);
      const z = r * Math.sin(sPhi) * Math.sin(sTheta);

      pinContainer.position.set(x, y, z);
      pinContainer.lookAt(0, 0, 0); // Face inward toward center camera

      // 1. Core Pin Sphere Dot on Canvas
      const dotGeo = new THREE.SphereGeometry(7, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({
        color: spot.imageUrl ? 0x06b6d4 : 0x22d3ee,
        depthTest: false,
        depthWrite: false,
      });
      const dotMesh = new THREE.Mesh(dotGeo, dotMat);
      dotMesh.renderOrder = 999;
      pinContainer.add(dotMesh);

      // 2. Outer Ring Mesh on Canvas
      const ringGeo = new THREE.RingGeometry(10, 16, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: spot.imageUrl ? 0x38bdf8 : 0x06b6d4,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
        depthTest: false,
        depthWrite: false,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.renderOrder = 999;
      pinContainer.add(ringMesh);

      // 3. Pointer Pin Cone Mesh pointing at spot
      const coneGeo = new THREE.ConeGeometry(5, 18, 16);
      coneGeo.rotateX(Math.PI);
      const coneMat = new THREE.MeshBasicMaterial({
        color: spot.imageUrl ? 0x0284c7 : 0x0891b2,
        depthTest: false,
        depthWrite: false,
      });
      const coneMesh = new THREE.Mesh(coneGeo, coneMat);
      coneMesh.position.set(0, -12, 0);
      coneMesh.renderOrder = 999;
      pinContainer.add(coneMesh);

      pinContainer.renderOrder = 999;
      group.add(pinContainer);
    });
  }, [hotspots, showHotspots]);

  // Main Render & Physics Loop
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!cameraRef.current || !sceneRef.current || !rendererRef.current) return;

      // Pulse animation for 3D pins directly on WebGL canvas
      if (pinsGroupRef.current && showHotspots) {
        const time = Date.now() * 0.003;
        pinsGroupRef.current.children.forEach((child, idx) => {
          const scale = 1 + Math.sin(time + idx * 1.5) * 0.12;
          child.scale.set(scale, scale, scale);
        });
      }

      // Handle Inertial Friction
      if (!isDragging.current) {
        currentYaw.current += velocity.current.yaw;
        currentPitch.current += velocity.current.pitch;

        velocity.current.yaw *= 0.92;
        velocity.current.pitch *= 0.92;

        if (Math.abs(velocity.current.yaw) < 0.001) velocity.current.yaw = 0;
        if (Math.abs(velocity.current.pitch) < 0.001) velocity.current.pitch = 0;

        // Auto-rotation
        if (isAutoRotating) {
          currentYaw.current += autoRotateSpeed * 0.1;
          throttledViewChange(currentYaw.current, currentPitch.current, currentFov.current);
        }
      }

      // Clamp Pitch to prevent flip (-85° to +85°)
      currentPitch.current = Math.max(-85, Math.min(85, currentPitch.current));

      // Calculate camera target vector based on yaw and pitch
      const phi = THREE.MathUtils.degToRad(90 - currentPitch.current);
      const theta = THREE.MathUtils.degToRad(currentYaw.current);

      const targetX = 500 * Math.sin(phi) * Math.cos(theta);
      const targetY = 500 * Math.cos(phi);
      const targetZ = 500 * Math.sin(phi) * Math.sin(theta);

      cameraRef.current.lookAt(targetX, targetY, targetZ);

      // Handle Little Planet vs Normal FOV
      let effectiveFov = currentFov.current;
      if (projectionMode === 'little_planet') {
        // High FOV zoomed out perspective looking down
        effectiveFov = Math.max(currentFov.current, 110);
      }
      cameraRef.current.fov = effectiveFov;
      cameraRef.current.updateProjectionMatrix();

      // Render Scene
      rendererRef.current.render(sceneRef.current, cameraRef.current);

      // Update Hotspot Positions directly in DOM via Ref Map (0 React state updates)
      if (containerRef.current && showHotspots && hotspots.length > 0) {
        const containerW = containerRef.current.clientWidth;
        const containerH = containerRef.current.clientHeight;

        const camDir = new THREE.Vector3();
        cameraRef.current.getWorldDirection(camDir);

        hotspots.forEach((spot) => {
          const el = hotspotRefs.current.get(spot.id);
          if (!el) return;

          const sPhi = THREE.MathUtils.degToRad(90 - spot.pitch);
          const sTheta = THREE.MathUtils.degToRad(spot.yaw);

          const spotVec = new THREE.Vector3(
            500 * Math.sin(sPhi) * Math.cos(sTheta),
            500 * Math.cos(sPhi),
            500 * Math.sin(sPhi) * Math.sin(sTheta)
          );

          const projVec = spotVec.clone().project(cameraRef.current!);
          const isVisible = spotVec.dot(camDir) < 0 && projVec.z < 1;

          if (isVisible) {
            const screenX = (projVec.x * 0.5 + 0.5) * containerW;
            const screenY = (-projVec.y * 0.5 + 0.5) * containerH;
            el.style.transform = `translate3d(${screenX}px, ${screenY}px, 0) translate(-50%, -50%)`;
            el.style.display = 'block';
          } else {
            el.style.display = 'none';
          }
        });
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isAutoRotating, autoRotateSpeed, projectionMode, hotspots, showHotspots, throttledViewChange]);

  // Raycast calculation to find spherical yaw & pitch from screen click
  const computeYawPitchFromScreenPoint = (clientX: number, clientY: number) => {
    if (!containerRef.current || !cameraRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const target = new THREE.Vector3();
    const hit = raycaster.ray.intersectSphere(
      new THREE.Sphere(new THREE.Vector3(0, 0, 0), 500),
      target
    );

    if (hit) {
      const phi = Math.acos(target.y / 500);
      const calculatedPitch = 90 - THREE.MathUtils.radToDeg(phi);

      const theta = Math.atan2(target.z, target.x);
      const calculatedYaw = THREE.MathUtils.radToDeg(theta);

      return { yaw: calculatedYaw, pitch: calculatedPitch };
    }
    return { yaw: currentYaw.current, pitch: currentPitch.current };
  };

  // Pointer Interactions (Mouse & Touch)
  const pointerDownPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
    velocity.current = { yaw: 0, pitch: 0 };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;

    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;

    const yawSensitivity = 0.15 * (currentFov.current / 75);
    const pitchSensitivity = 0.15 * (currentFov.current / 75);

    const dYaw = -deltaX * yawSensitivity;
    const dPitch = deltaY * pitchSensitivity;

    currentYaw.current += dYaw;
    currentPitch.current += dPitch;

    velocity.current = { yaw: dYaw, pitch: dPitch };

    previousMousePosition.current = { x: e.clientX, y: e.clientY };

    throttledViewChange(currentYaw.current, currentPitch.current, currentFov.current);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const dx = e.clientX - pointerDownPos.current.x;
    const dy = e.clientY - pointerDownPos.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If pointer click (distance < 6px) and in pinning mode
    if (distance < 6 && isPinningMode && onSelectPinCoords) {
      const coords = computeYawPitchFromScreenPoint(e.clientX, e.clientY);
      if (coords) {
        onSelectPinCoords(coords);
      }
    } else if (distance < 6 && !isPinningMode && pinsGroupRef.current && cameraRef.current && containerRef.current) {
      // Raycast against 3D Canvas pins
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

      const intersects = raycaster.intersectObjects(pinsGroupRef.current.children, true);
      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.userData?.spot && obj.parent) {
          obj = obj.parent;
        }
        if (obj && obj.userData?.spot) {
          onHotspotClick(obj.userData.spot);
        }
      }
    }

    isDragging.current = false;
    onViewChange({
      yaw: currentYaw.current,
      pitch: currentPitch.current,
      fov: currentFov.current,
    });
  };

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * 0.05;
    const newFov = Math.max(30, Math.min(110, currentFov.current + zoomDelta));
    currentFov.current = newFov;

    throttledViewChange(currentYaw.current, currentPitch.current, newFov);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-slate-950 select-none ${
        isPinningMode ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
    >
      {/* Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Direct DOM Hotspot Badges in Screen Space */}
      {showHotspots &&
        hotspots.map((spot) => (
          <div
            key={spot.id}
            ref={(el) => {
              if (el) hotspotRefs.current.set(spot.id, el);
              else hotspotRefs.current.delete(spot.id);
            }}
            style={{ display: 'none', position: 'absolute', top: 0, left: 0, zIndex: 40 }}
            className="z-40 pointer-events-auto group cursor-pointer transition-transform duration-75 hover:scale-110"
            onClick={(e) => {
              e.stopPropagation();
              onHotspotClick(spot);
            }}
          >
            <div className="relative flex items-center justify-center">
              {/* Glowing Radar Pulse Ring */}
              <span className="absolute inline-flex h-10 w-10 rounded-full bg-cyan-400 opacity-75 animate-ping" />

              {/* Icon Pin Pill */}
              <div className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 text-white border border-cyan-400/60 shadow-lg shadow-black/50 backdrop-blur-md group-hover:border-cyan-300">
                {spot.imageUrl ? (
                  <ImageIcon className="w-4 h-4 text-cyan-400 animate-pulse" />
                ) : (
                  <MapPin className="w-4 h-4 text-cyan-400 animate-bounce" />
                )}
                <span className="text-xs font-semibold tracking-wide whitespace-nowrap">
                  {spot.title}
                </span>
                {spot.imageUrl && (
                  <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
                    Photo
                  </span>
                )}
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 transition-colors" />
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};
