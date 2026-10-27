'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useTheme } from '../ThemeProvider';

// Per building type look & structure
const TYPE_SETTINGS = {
  carport: { enclosed: false, pitch: 0.26, doors: 0, doorStyle: 'open', windows: 0 },
  barn: { enclosed: true, pitch: 0.4, doors: 1, doorStyle: 'sliding', windows: 2 },
  commercial: { enclosed: true, pitch: 0.16, doors: 2, doorStyle: 'rollup', windows: 0 },
  garage: { enclosed: true, pitch: 0.28, doors: 1, doorStyle: 'rollup', windows: 0 },
};

const PANEL_COLORS = {
  white: '#e7edf4',
  gray: '#c4ccd6',
  charcoal: '#525d6b',
  blue: '#8ba7c0',
  red: '#a8504f',
  green: '#6b8a76',
};

// Shared corrugated-metal textures, generated once on the client
const ribTextureCache = new Map();

function getRibTexture(direction = 'vertical') {
  if (ribTextureCache.has(direction)) return ribTextureCache.get(direction);
  if (typeof document === 'undefined') return null;

  const size = 128;
  const stripeCount = 4;
  const stripeWidth = size / stripeCount;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f4f7fa';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < stripeCount; i += 1) {
    const offset = i * stripeWidth;
    const gradient =
      direction === 'vertical'
        ? ctx.createLinearGradient(offset, 0, offset + stripeWidth, 0)
        : ctx.createLinearGradient(0, offset, 0, offset + stripeWidth);

    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    gradient.addColorStop(0.28, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.55, 'rgba(126, 140, 158, 0.5)');
    gradient.addColorStop(0.78, 'rgba(214, 226, 238, 0.75)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.85)');

    ctx.fillStyle = gradient;
    if (direction === 'vertical') {
      ctx.fillRect(offset, 0, stripeWidth, size);
    } else {
      ctx.fillRect(0, offset, size, stripeWidth);
    }
  }

  // Panel seam
  ctx.fillStyle = 'rgba(88, 102, 118, 0.25)';
  if (direction === 'vertical') {
    ctx.fillRect(0, 0, size, 2);
  } else {
    ctx.fillRect(0, 0, 2, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  ribTextureCache.set(direction, texture);
  return texture;
}

function ribbedMaterial(color, repeatX, repeatY, options = {}) {
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    metalness: options.metalness ?? 0.45,
    roughness: options.roughness ?? 0.5,
    side: options.doubleSide !== false ? THREE.DoubleSide : THREE.FrontSide,
    depthTest: true,
    depthWrite: true,
  });

  const base = getRibTexture(options.direction ?? 'vertical');
  if (base) {
    const map = base.clone();
    map.needsUpdate = true;
    map.repeat.set(Math.max(1, repeatX), Math.max(1, repeatY));
    if (options.direction === 'horizontal') {
      map.rotation = 0;
    }
    material.map = map;
  }

  return material;
}

function disposeObject(root) {
  root.traverse((object) => {
    if (!object.isMesh && !object.isLine && !object.isPoints) return;
    if (object.geometry) object.geometry.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => {
      if (!material) return;
      if (material.map) material.map.dispose();
      material.dispose();
    });
  });
}

// Builds the actual 3D building from the configurator values (1 unit = 1 ft)
function buildBuilding(config) {
  const { width: W, length: L, height: H, type } = config;
  const settings = TYPE_SETTINGS[type] ?? TYPE_SETTINGS.carport;
  const pitch = config.roofStyle === 'flat' ? 0.07 : settings.pitch;
  const rise = (W / 2) * pitch;
  const overhang = Math.max(1, Math.min(2.5, W * 0.08));

  const group = new THREE.Group();

  const frame = new THREE.MeshStandardMaterial({ color: 0xb6c2d1, metalness: 0.7, roughness: 0.35, side: THREE.FrontSide });
  const trim = new THREE.MeshStandardMaterial({ color: 0x46525f, metalness: 0.45, roughness: 0.55, side: THREE.FrontSide });
  const roof = ribbedMaterial('#aebac8', 1, (L + overhang * 2) / 8, {
    metalness: 0.55,
    roughness: 0.5,
    direction: 'horizontal',
    doubleSide: false,
  });
  const concrete = new THREE.MeshStandardMaterial({ color: 0x8d97a3, roughness: 0.95, metalness: 0.05, side: THREE.FrontSide });
  const glass = new THREE.MeshStandardMaterial({
    color: 0x8fd2ef,
    metalness: 0.25,
    roughness: 0.08,
    emissive: 0x0d2b3a,
    emissiveIntensity: 0.7,
    side: THREE.FrontSide,
  });

  const panelColor = PANEL_COLORS[config.color] ?? PANEL_COLORS.white;
  const sidePanel = ribbedMaterial(panelColor, L / 4, H / 4, { doubleSide: false });
  const endPanel = ribbedMaterial(panelColor, W / 4, H / 4, { doubleSide: false });
  const gablePanel = ribbedMaterial(panelColor, W / 8, Math.max(1, rise / 4), { doubleSide: false });
  const doorMaterial = ribbedMaterial('#7f8b99', 2, 2, { metalness: 0.65, roughness: 0.4, doubleSide: false });

  const add = (mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.renderOrder = 1;
    group.add(mesh);
    return mesh;
  };

  const box = (w, h, d, material, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, rz);
    return add(mesh);
  };

  // Foundation slab
  const slab = box(W + 1.6, 0.5, L + 1.6, concrete, 0, -0.25, 0);
  slab.castShadow = false;
  slab.receiveShadow = true;

  const bays = Math.max(2, Math.round(L / 9));
  const bay = L / bays;

  // Steel columns along both long sides
  for (let i = 0; i <= bays; i += 1) {
    const z = -L / 2 + i * bay;
    [-1, 1].forEach((side) => {
      const x = (side * W) / 2;
      box(0.45, H, 0.45, frame, x, H / 2, z);
      const plate = box(0.9, 0.08, 0.9, trim, x, 0.06, z);
      plate.castShadow = false;
    });
  }

  // Eave beams and end-wall headers
  [-1, 1].forEach((side) => {
    box(0.5, 0.55, L + 0.6, frame, (side * W) / 2, H + 0.05, 0);
  });
  [-1, 1].forEach((side) => {
    box(W + 0.6, 0.45, 0.35, frame, 0, H + 0.05, (side * L) / 2);
  });

  // Horizontal wall girts (visible through open carport bays)
  if (!settings.enclosed) {
    [H * 0.45, H * 0.78].forEach((y) => {
      [-1, 1].forEach((side) => {
        box(0.18, 0.22, L, frame, (side * W) / 2 + side * 0.05, y, 0);
      });
    });
  }

  // Roof geometry shared by planes and trusses
  const halfSpan = W / 2 + overhang;
  const drop = rise + overhang * pitch;
  const slopeLength = Math.hypot(halfSpan, drop);
  const slopeAngle = Math.atan2(drop, halfSpan);
  const roofCenterY = H + (rise - overhang * pitch) / 2;
  const roofLength = L + overhang * 2;

  // Open steel trusses (carport)
  if (!settings.enclosed) {
    for (let i = 0; i <= bays; i += 1) {
      const z = -L / 2 + i * bay;
      box(W + 0.3, 0.2, 0.16, frame, 0, H + 0.12, z);
      box(slopeLength, 0.16, 0.14, frame, halfSpan / 2, roofCenterY - 0.22, z, 0, 0, -slopeAngle);
      box(slopeLength, 0.16, 0.14, frame, -halfSpan / 2, roofCenterY - 0.22, z, 0, 0, slopeAngle);
      box(0.16, rise, 0.14, frame, 0, H + rise / 2, z);
      box(
        Math.hypot(W / 4, rise / 2),
        0.1,
        0.1,
        frame,
        -W / 8,
        H + rise / 2,
        z,
        0,
        0,
        Math.atan2(rise / 2, W / 4)
      );
      box(
        Math.hypot(W / 4, rise / 2),
        0.1,
        0.1,
        frame,
        W / 8,
        H + rise / 2,
        z,
        0,
        0,
        -Math.atan2(rise / 2, W / 4)
      );
    }
  }

  // Roof planes + ridge cap
  box(slopeLength, 0.16, roofLength, roof, halfSpan / 2, roofCenterY, 0, 0, 0, -slopeAngle);
  box(slopeLength, 0.16, roofLength, roof, -halfSpan / 2, roofCenterY, 0, 0, 0, slopeAngle);
  box(0.6, 0.22, roofLength + 0.2, trim, 0, H + rise + 0.06, 0);

  // Enclosed walls, gable ends, doors and windows
  if (settings.enclosed) {
    const wallX = W / 2 + 0.08;
    const wallZ = L / 2 + 0.08;

    box(0.16, H, L + 0.16, sidePanel, -wallX, H / 2, 0);
    box(0.16, H, L + 0.16, sidePanel, wallX, H / 2, 0);
    box(W + 0.16, H, 0.16, endPanel, 0, H / 2, -wallZ);
    box(W + 0.16, H, 0.16, endPanel, 0, H / 2, wallZ);

    // Base trim
    [-1, 1].forEach((side) => {
      box(0.26, 0.5, L + 0.3, trim, (side * W) / 2 + side * 0.1, 0.25, 0);
      box(W + 0.3, 0.5, 0.26, trim, 0, 0.25, (side * L) / 2 + side * 0.1);
    });

    // Gable triangles
    const gableShape = new THREE.Shape();
    gableShape.moveTo(-W / 2 - 0.08, 0);
    gableShape.lineTo(W / 2 + 0.08, 0);
    gableShape.lineTo(0, rise);
    gableShape.closePath();

    const gableGeometry = new THREE.ExtrudeGeometry(gableShape, {
      depth: 0.16,
      bevelEnabled: false,
    });

    const frontGable = new THREE.Mesh(gableGeometry, gablePanel);
    frontGable.position.set(0, H, wallZ);
    add(frontGable);

    const backGable = new THREE.Mesh(gableGeometry, gablePanel);
    backGable.position.set(0, H, -wallZ - 0.16);
    add(backGable);

    // Doors on the front wall
    if (settings.doors > 0) {
      const doorHeight = Math.min(H * 0.78, 10);
      const doorWidth =
        settings.doors === 2 ? Math.min(W * 0.28, 10) : Math.min(W * 0.6, 14);
      const doorCenters = settings.doors === 2 ? [-W / 4, W / 4] : [0];

      doorCenters.forEach((centerX) => {
        box(doorWidth, doorHeight, 0.18, doorMaterial, centerX, doorHeight / 2, wallZ + 0.1);
        box(doorWidth + 0.6, 0.3, 0.26, trim, centerX, doorHeight + 0.15, wallZ + 0.12);
        box(0.26, doorHeight + 0.3, 0.26, trim, centerX - doorWidth / 2 - 0.13, doorHeight / 2, wallZ + 0.12);
        box(0.26, doorHeight + 0.3, 0.26, trim, centerX + doorWidth / 2 + 0.13, doorHeight / 2, wallZ + 0.12);

        if (settings.doorStyle === 'sliding') {
          // Split sliding door with X bracing
          box(0.16, doorHeight, 0.24, trim, centerX, doorHeight / 2, wallZ + 0.16);
          const braceRun = doorWidth / 2 - 0.6;
          const braceRise = doorHeight - 1;
          const braceLength = Math.hypot(braceRun, braceRise);
          const braceAngle = Math.atan2(braceRise, braceRun);

          [-1, 1].forEach((side) => {
            const leafX = centerX + (side * doorWidth) / 4;
            box(braceLength, 0.16, 0.12, trim, leafX, doorHeight / 2, wallZ + 0.2, 0, 0, braceAngle);
            box(braceLength, 0.16, 0.12, trim, leafX, doorHeight / 2, wallZ + 0.2, 0, 0, -braceAngle);
          });
        } else {
          // Roll-up door slats and handle
          for (let slat = 1; slat < 5; slat += 1) {
            box(doorWidth, 0.08, 0.2, trim, centerX, (doorHeight / 5) * slat, wallZ + 0.16);
          }
          box(1.4, 0.16, 0.16, trim, centerX, doorHeight * 0.35, wallZ + 0.2);
        }
      });
    }

    // Windows flanking the barn door
    if (settings.windows > 0) {
      const windowWidth = Math.min(W * 0.16, 4);
      const windowHeight = Math.min(H * 0.24, 2.6);

      [-1, 1].forEach((side) => {
        const windowX = side * (W / 2 - windowWidth / 2 - 1.4);
        box(windowWidth, windowHeight, 0.12, glass, windowX, H * 0.62, wallZ + 0.1);
        box(windowWidth + 0.4, 0.2, 0.2, trim, windowX, H * 0.62 + windowHeight / 2 + 0.1, wallZ + 0.12);
        box(windowWidth + 0.4, 0.2, 0.2, trim, windowX, H * 0.62 - windowHeight / 2 - 0.1, wallZ + 0.12);
      });
    }
  }

  return group;
}

function applyCameraFit(state, preserveAngle) {
  const { camera, controls, horizontalRadius, halfHeight, targetPoint } = state;
  if (!horizontalRadius || !halfHeight || !targetPoint) return;

  const verticalFov = THREE.MathUtils.degToRad(camera.fov);
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect);
  const distance =
    Math.max(
      horizontalRadius / Math.tan(horizontalFov / 2),
      halfHeight / Math.tan(verticalFov / 2)
    ) * 1.16;

  const offset = camera.position.clone().sub(controls.target);
  const spherical = new THREE.Spherical().setFromVector3(offset);
  const hasAngle = preserveAngle && state.hasFit && spherical.radius > 0.01;
  const theta = hasAngle ? spherical.theta : Math.PI * 0.28;
  const phi = hasAngle ? THREE.MathUtils.clamp(spherical.phi, 0.55, 1.42) : Math.PI * 0.34;

  controls.target.copy(targetPoint);
  camera.position.set(
    targetPoint.x + distance * Math.sin(phi) * Math.sin(theta),
    targetPoint.y + distance * Math.cos(phi),
    targetPoint.z + distance * Math.sin(phi) * Math.cos(theta)
  );

  controls.minDistance = distance * 0.62;
  controls.maxDistance = distance * 1.85;
  camera.near = Math.max(0.1, distance * 0.03);
  camera.far = distance * 12;
  camera.updateProjectionMatrix();
  controls.update();

  state.hasFit = true;
}

export default function BuildingPreview3D({ config }) {
  const wrapRef = useRef(null);
  const stateRef = useRef(null);
  const { theme } = useTheme();

  // Scene setup (runs once)
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return undefined;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
      depth: true,
      stencil: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearAlpha(0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.sortObjects = true;
    wrap.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 2000);
    camera.position.set(30, 24, 36);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.9;
    controls.rotateSpeed = 0.65;
    controls.minPolarAngle = 0.5;
    controls.maxPolarAngle = Math.PI / 2 - 0.06;
    controls.target.set(0, 4, 0);

    const hemi = new THREE.HemisphereLight(0xdfefff, 0x121a26, 1);
    scene.add(hemi);

    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(30, 48, 26);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.bias = -0.0006;
    key.shadow.normalBias = 0.15;
    key.shadow.radius = 3;
    scene.add(key);
    scene.add(key.target);

    const rim = new THREE.DirectionalLight(0x63d8ff, 0.9);
    rim.position.set(-26, 20, -22);
    scene.add(rim);

    const fill = new THREE.DirectionalLight(0xffffff, 0.35);
    fill.position.set(-20, 14, 28);
    scene.add(fill);

    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x0d1a2b,
      roughness: 0.95,
      metalness: 0.05,
      transparent: false,
      side: THREE.FrontSide,
    });
    const ground = new THREE.Mesh(new THREE.CircleGeometry(1, 64), groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    ground.renderOrder = -1;
    scene.add(ground);

    const grid = new THREE.GridHelper(1, 40, 0x00d4ff, 0x0b6d86);
    grid.material.transparent = true;
    grid.material.opacity = 0.18;
    grid.material.depthWrite = false;
    grid.position.y = 0.01;
    grid.renderOrder = 0;
    scene.add(grid);

    const buildingGroup = new THREE.Group();
    scene.add(buildingGroup);

    const state = {
      renderer,
      scene,
      camera,
      controls,
      ground,
      groundMaterial,
      grid,
      buildingGroup,
      key,
      hemi,
      ambient,
      rim,
      fill,
      radius: 0,
      targetPoint: null,
      hasFit: false,
    };
    stateRef.current = state;

    let resumeTimer = null;
    const handleStart = () => {
      controls.autoRotate = false;
      if (resumeTimer) clearTimeout(resumeTimer);
    };
    const handleEnd = () => {
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        controls.autoRotate = true;
      }, 2200);
    };
    controls.addEventListener('start', handleStart);
    controls.addEventListener('end', handleEnd);

    const resize = () => {
      const width = wrap.clientWidth;
      const height = wrap.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      applyCameraFit(state, true);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrap);
    resize();

    let rafId = 0;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      controls.removeEventListener('start', handleStart);
      controls.removeEventListener('end', handleEnd);
      if (resumeTimer) clearTimeout(resumeTimer);

      disposeObject(buildingGroup);
      while (buildingGroup.children.length) buildingGroup.remove(buildingGroup.children[0]);

      ground.geometry.dispose();
      groundMaterial.dispose();
      grid.geometry.dispose();
      grid.material.dispose();

      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === wrap) {
        wrap.removeChild(renderer.domElement);
      }
      stateRef.current = null;
    };
  }, []);

  // Rebuild the building whenever the configuration changes
  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;

    const { buildingGroup, key, renderer } = state;

    disposeObject(buildingGroup);
    while (buildingGroup.children.length) buildingGroup.remove(buildingGroup.children[0]);

    const building = buildBuilding(config);
    buildingGroup.add(building);

    // Force material updates
    building.traverse((object) => {
      if (object.isMesh && object.material) {
        object.material.needsUpdate = true;
      }
    });

    const span = Math.max(config.width, config.length, config.height);

    // Ground and grid scale with the building footprint
    const groundRadius = span * 2.2 + 14;
    state.ground.scale.setScalar(groundRadius);
    state.grid.scale.setScalar(groundRadius * 2.05);

    // Fit camera to the new building size
    building.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(building);
    const sphere = bounds.getBoundingSphere(new THREE.Sphere());
    state.radius = sphere.radius;
    state.targetPoint = new THREE.Vector3(0, Math.max(1.5, sphere.center.y * 0.72), 0);
    applyCameraFit(state, true);

    // Fit the shadow camera to the scene
    const lightDistance = span * 2.2 + 24;
    key.position.set(lightDistance * 0.6, lightDistance * 0.95, lightDistance * 0.5);
    key.target.position.set(0, config.height * 0.35, 0);
    key.target.updateMatrixWorld();

    const shadowExtent = span * 1.15 + 8;
    const shadowCamera = key.shadow.camera;
    shadowCamera.left = -shadowExtent;
    shadowCamera.right = shadowExtent;
    shadowCamera.top = shadowExtent;
    shadowCamera.bottom = -shadowExtent;
    shadowCamera.near = 0.5;
    shadowCamera.far = lightDistance * 3;
    shadowCamera.updateProjectionMatrix();

    // Clear the renderer to prevent artifacts
    renderer.clear();
  }, [config]);

  // Keep the scene in sync with the site theme
  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;

    const isLight = theme === 'light';
    state.groundMaterial.color.set(isLight ? '#dbe6f2' : '#0d1a2b');
    state.groundMaterial.opacity = isLight ? 0.98 : 0.96;
    state.grid.material.color.set(isLight ? '#3f7fb5' : '#00d4ff');
    state.grid.material.opacity = isLight ? 0.12 : 0.18;
    state.hemi.color.set(isLight ? '#ffffff' : '#dfefff');
    state.hemi.groundColor.set(isLight ? '#b9c9da' : '#121a26');
    state.hemi.intensity = isLight ? 1.15 : 1;
    state.ambient.intensity = isLight ? 0.5 : 0.35;
    state.key.intensity = isLight ? 2.6 : 2.2;
    state.rim.intensity = isLight ? 0.45 : 0.9;
    state.renderer.toneMappingExposure = isLight ? 1 : 1.05;
  }, [theme]);

  return (
    <div
      ref={wrapRef}
      className="preview-building-canvas"
      role="img"
      aria-label={`3D preview of a ${config.width} by ${config.length} foot ${config.type}`}
    />
  );
}
