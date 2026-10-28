import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ForceVector, CableAnchor, SimulationMode, StaticEquilibriumResult } from '../types';
import { norm } from '../utils/physics';
import { Eye, RotateCcw, Compass } from 'lucide-react';

interface Viewport3DProps {
  mode: SimulationMode;
  forces: ForceVector[];
  netForce: { x: number; y: number; z: number; magnitude: number };
  massKg: number;
  gravity: number;
  anchors: CableAnchor[];
  equilibriumResult: StaticEquilibriumResult;
  showGrid: boolean;
  showAxes: boolean;
  showComponents: boolean;
  showLabels: boolean;
  vectorScale: number; // Scale factor: pixels/units per Newton
  theme?: 'light' | 'dark';
  cableCount?: number;
}

export const Viewport3D: React.FC<Viewport3DProps> = ({
  mode,
  forces,
  netForce,
  massKg,
  gravity,
  anchors,
  equilibriumResult,
  showGrid,
  showAxes,
  showComponents,
  showLabels,
  vectorScale,
  theme = 'dark',
  cableCount,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Dynamic mesh groups to clean and re-render
  const vectorsGroupRef = useRef<THREE.Group | null>(null);
  const environmentGroupRef = useRef<THREE.Group | null>(null);
  const cablesGroupRef = useRef<THREE.Group | null>(null);
  const axesGroupRef = useRef<THREE.Group | null>(null);

  // Object position: in free mode at (0, 0, 0); in suspended mode at (0, 1.2, 0)
  const objectPos = mode === 'suspended' ? new THREE.Vector3(0, 1.2, 0) : new THREE.Vector3(0, 0, 0);

  // Helper to create text sprite for labels in 3D (no bounding box, crisp environment-adaptive contrast)
  const createTextSprite = (
    text: string,
    color = theme === 'light' ? '#0f172a' : '#ffffff',
    fontSize = 24,
    hasBg = false
  ) => {
    const canvas = document.createElement('canvas');
    canvas.width = 440;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Object3D();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (hasBg) {
      // Optional pill background if explicitly requested
      ctx.fillStyle = theme === 'light' ? 'rgba(255, 255, 255, 0.94)' : 'rgba(15, 23, 42, 0.88)';
      const radius = 18;
      const x = 10, y = 10, w = canvas.width - 20, h = canvas.height - 20;
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke();
    } else {
      // Clean typography without any bounding box!
      // Outline halo highlights tone according to environment (crisp white in light mode, deep dark in dark mode)
      ctx.lineJoin = 'round';
      ctx.lineWidth = 6;
      ctx.strokeStyle = theme === 'light' ? 'rgba(255, 255, 255, 0.96)' : 'rgba(9, 13, 22, 0.96)';
      ctx.font = `900 ${fontSize + 8}px ui-monospace, SFMono-Regular, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
    }

    // Text fill with vector's distinct color
    ctx.fillStyle = color;
    ctx.font = `900 ${fontSize + 8}px ui-monospace, SFMono-Regular, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(1.6, 0.36, 1);
    return sprite;
  };

  // Helper to create 3D Arrow
  const createArrow = (
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    length: number,
    colorHex: string,
    isThick = false
  ): THREE.Group => {
    const group = new THREE.Group();
    if (length <= 0.01) return group;

    const dir = direction.clone().normalize();
    const shaftRadius = isThick ? 0.05 : 0.03;
    const headRadius = isThick ? 0.13 : 0.09;
    const headLength = Math.min(length * 0.25, 0.5);
    const shaftLength = Math.max(0.01, length - headLength);

    const material = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.3,
      metalness: 0.2,
      emissive: colorHex,
      emissiveIntensity: isThick ? 0.45 : 0.2,
    });

    // Shaft
    const shaftGeom = new THREE.CylinderGeometry(shaftRadius, shaftRadius, shaftLength, 16);
    shaftGeom.translate(0, shaftLength / 2, 0);
    const shaftMesh = new THREE.Mesh(shaftGeom, material);

    // Cone Head
    const headGeom = new THREE.ConeGeometry(headRadius, headLength, 16);
    headGeom.translate(0, shaftLength + headLength / 2, 0);
    const headMesh = new THREE.Mesh(headGeom, material);

    // Orient along direction
    const arrowSub = new THREE.Group();
    arrowSub.add(shaftMesh);
    arrowSub.add(headMesh);

    // Default cylinder points along +Y. Rotate towards dir:
    const defaultDir = new THREE.Vector3(0, 1, 0);
    arrowSub.quaternion.setFromUnitVectors(defaultDir, dir);

    arrowSub.position.copy(origin);
    group.add(arrowSub);

    return group;
  };

  // Initialize Scene once
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#090d16');
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(5.5, 4.5, 6.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 1.0, 0);
    controls.maxDistance = 25;
    controls.minDistance = 1;
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.3);
    dirLight1.position.set(6, 12, 8);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x60a5fa, 0.4);
    dirLight2.position.set(-8, -4, -6);
    scene.add(dirLight2);

    // Groups for modular updates
    const axesGroup = new THREE.Group();
    scene.add(axesGroup);
    axesGroupRef.current = axesGroup;

    const envGroup = new THREE.Group();
    scene.add(envGroup);
    environmentGroupRef.current = envGroup;

    const cablesGroup = new THREE.Group();
    scene.add(cablesGroup);
    cablesGroupRef.current = cablesGroup;

    const vectorsGroup = new THREE.Group();
    scene.add(vectorsGroup);
    vectorsGroupRef.current = vectorsGroup;

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // Dynamically update scene background when theme switches
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.background = new THREE.Color(theme === 'light' ? '#f1f5f9' : '#090d16');
  }, [theme]);

  // Update Environment & Axes
  useEffect(() => {
    if (!axesGroupRef.current || !environmentGroupRef.current) return;

    // Clear axes
    while (axesGroupRef.current.children.length > 0) {
      axesGroupRef.current.remove(axesGroupRef.current.children[0]);
    }

    if (showGrid) {
      const grid = new THREE.GridHelper(
        10,
        20,
        theme === 'light' ? 0x94a3b8 : 0x334155,
        theme === 'light' ? 0xcfd8dc : 0x1e293b
      );
      grid.position.y = 0;
      axesGroupRef.current.add(grid);
    }

    if (showAxes) {
      const axisLength = 4.5;

      // X Axis (Red)
      const arrowX = createArrow(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0), axisLength, '#ef4444');
      axesGroupRef.current.add(arrowX);

      // Y Axis (Green)
      const arrowY = createArrow(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), axisLength, '#22c55e');
      axesGroupRef.current.add(arrowY);

      // Z Axis (Blue)
      const arrowZ = createArrow(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 1), axisLength, '#3b82f6');
      axesGroupRef.current.add(arrowZ);

      if (showLabels) {
        const lblX = createTextSprite('+X', '#ef4444', 30, false);
        lblX.position.set(axisLength + 0.35, 0, 0);
        axesGroupRef.current.add(lblX);

        const lblY = createTextSprite('+Y', '#22c55e', 30, false);
        lblY.position.set(0, axisLength + 0.35, 0);
        axesGroupRef.current.add(lblY);

        const lblZ = createTextSprite('+Z', '#3b82f6', 30, false);
        lblZ.position.set(0, 0, axisLength + 0.35);
        axesGroupRef.current.add(lblZ);
      }
    }

    // Clear Environment Group
    while (environmentGroupRef.current.children.length > 0) {
      environmentGroupRef.current.remove(environmentGroupRef.current.children[0]);
    }

    // Central Object Mass representation
    if (mode === 'free') {
      // Free Body: Metallic core sphere with coordinate ring
      const sphereGeom = new THREE.SphereGeometry(0.28, 32, 32);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: theme === 'light' ? 0x64748b : 0x94a3b8,
        metalness: 0.8,
        roughness: 0.25,
      });
      const sphere = new THREE.Mesh(sphereGeom, sphereMat);
      sphere.position.set(0, 0, 0);
      environmentGroupRef.current.add(sphere);

      // Center point highlight
      const pointGeom = new THREE.SphereGeometry(0.06, 16, 16);
      const pointMat = new THREE.MeshBasicMaterial({ color: theme === 'light' ? 0x0f172a : 0xf8fafc });
      const point = new THREE.Mesh(pointGeom, pointMat);
      environmentGroupRef.current.add(point);
    } else {
      // Suspended Object: Hanging load crate / mass block with hook
      const massGroup = new THREE.Group();
      massGroup.position.copy(objectPos);

      // Center pivot ring
      const ringGeom = new THREE.TorusGeometry(0.12, 0.03, 16, 32);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.9, roughness: 0.2 });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      massGroup.add(ring);

      // Hanging crate / weight
      const boxGeom = new THREE.BoxGeometry(0.65, 0.65, 0.65);
      const boxMat = new THREE.MeshStandardMaterial({
        color: theme === 'light' ? 0x475569 : 0x334155,
        roughness: 0.5,
        metalness: 0.3,
      });
      const box = new THREE.Mesh(boxGeom, boxMat);
      box.position.set(0, -0.45, 0);
      massGroup.add(box);

      // Mass label text
      if (showLabels) {
        const massLabelColor = theme === 'light' ? '#0f172a' : '#f8fafc';
        const massLabel = createTextSprite(`m = ${massKg} kg`, massLabelColor, 22, false);
        massLabel.position.set(0, -0.45, 0.4);
        massGroup.add(massLabel);
      }

      environmentGroupRef.current.add(massGroup);

      // Ceiling / Support structure
      const ceilingY = 3.9;
      const ceilingGeom = new THREE.BoxGeometry(6.5, 0.12, 6.5);
      const ceilingMat = new THREE.MeshStandardMaterial({
        color: theme === 'light' ? 0xd1d5db : 0x1e293b,
        transparent: true,
        opacity: theme === 'light' ? 0.7 : 0.5,
        roughness: 0.8,
      });
      const ceiling = new THREE.Mesh(ceilingGeom, ceilingMat);
      ceiling.position.set(0, ceilingY + 0.06, 0);
      environmentGroupRef.current.add(ceiling);

      // Ceiling grid frame
      const ceilingEdge = new THREE.BoxHelper(ceiling, theme === 'light' ? 0x94a3b8 : 0x475569);
      environmentGroupRef.current.add(ceilingEdge);
    }
  }, [mode, showGrid, showAxes, showLabels, massKg, objectPos.y, theme]);

  // Update Cables & Tension Vectors (in suspended mode)
  useEffect(() => {
    if (!cablesGroupRef.current) return;

    while (cablesGroupRef.current.children.length > 0) {
      cablesGroupRef.current.remove(cablesGroupRef.current.children[0]);
    }

    if (mode !== 'suspended') return;

    // Render anchors and cables
    anchors.forEach((anchor, idx) => {
      const anchorPos = new THREE.Vector3(anchor.x, anchor.y, anchor.z);

      // Ceiling anchor bracket
      const bracketGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16);
      const bracketMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
      const bracket = new THREE.Mesh(bracketGeom, bracketMat);
      bracket.position.copy(anchorPos);
      cablesGroupRef.current?.add(bracket);

      // Cable line/cylinder
      const cableVector = new THREE.Vector3().subVectors(anchorPos, objectPos);
      const cableLength = cableVector.length();

      const cableGeom = new THREE.CylinderGeometry(0.018, 0.018, cableLength, 8);
      cableGeom.translate(0, cableLength / 2, 0);

      // Color cable by its state or anchor color
      const tensionInfo = equilibriumResult.cablesTension?.[idx];
      const isSlack = tensionInfo && !tensionInfo.isValid;

      const cableMat = new THREE.MeshStandardMaterial({
        color: isSlack ? 0xef4444 : anchor.color,
        roughness: 0.3,
        metalness: 0.5,
        emissive: isSlack ? 0xef4444 : anchor.color,
        emissiveIntensity: 0.35,
      });

      const cableMesh = new THREE.Mesh(cableGeom, cableMat);
      cableMesh.position.copy(objectPos);
      cableMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), cableVector.clone().normalize());
      cablesGroupRef.current?.add(cableMesh);

      // Label on anchor without bounding box
      if (showLabels) {
        const tVal = tensionInfo ? `${tensionInfo.tension} N` : '';
        const anchorLabel = createTextSprite(
          `${anchor.name}${tVal ? ` (T=${tVal})` : ''}`,
          anchor.color,
          22,
          false
        );
        anchorLabel.position.copy(anchorPos).add(new THREE.Vector3(0, 0.25, 0));
        cablesGroupRef.current?.add(anchorLabel);
      }

      // Tension Force Vector Arrow at the knot pointing along the cable
      if (tensionInfo && tensionInfo.tension > 0.01) {
        const tLength = tensionInfo.tension * vectorScale;
        const tDir = cableVector.clone().normalize();
        const tensionArrow = createArrow(objectPos, tDir, tLength, anchor.color, false);
        cablesGroupRef.current?.add(tensionArrow);

        // Label on tension without bounding box
        if (showLabels) {
          const midPos = objectPos.clone().add(tDir.clone().multiplyScalar(tLength * 0.7));
          const tSprite = createTextSprite(`T_${idx + 1}: ${tensionInfo.tension} N`, anchor.color, 22, false);
          tSprite.position.copy(midPos).add(new THREE.Vector3(0.1, 0.1, 0.1));
          cablesGroupRef.current?.add(tSprite);
        }
      }
    });

    // Gravity Force Vector (Weight W = m * g pointing -Y)
    const weightVal = massKg * gravity;
    const weightLength = weightVal * vectorScale;
    const weightArrow = createArrow(
      objectPos,
      new THREE.Vector3(0, -1, 0),
      weightLength,
      '#f43f5e',
      true
    );
    cablesGroupRef.current.add(weightArrow);

    // Label on weight without bounding box
    if (showLabels) {
      const wLabel = createTextSprite(`W = ${weightVal.toFixed(1)} N`, '#f43f5e', 22, false);
      wLabel.position.copy(objectPos).add(new THREE.Vector3(0.4, -weightLength * 0.6, 0));
      cablesGroupRef.current.add(wLabel);
    }
  }, [mode, anchors, equilibriumResult, vectorScale, massKg, gravity, showLabels, objectPos.y, theme]);

  // Update Applied Force Vectors & Net Resultant Vector
  useEffect(() => {
    if (!vectorsGroupRef.current) return;

    while (vectorsGroupRef.current.children.length > 0) {
      vectorsGroupRef.current.remove(vectorsGroupRef.current.children[0]);
    }

    // Render individual applied forces
    forces.forEach((f) => {
      if (!f.visible) return;

      const fMag = norm(f);
      if (fMag <= 0.001) return;

      const fDir = new THREE.Vector3(f.x, f.y, f.z).normalize();
      const arrowLength = fMag * vectorScale;

      // Force Arrow
      const arrow = createArrow(objectPos, fDir, arrowLength, f.color, false);
      vectorsGroupRef.current?.add(arrow);

      // Label without bounding box - clean and environment adaptive
      if (showLabels) {
        const tipPos = objectPos.clone().add(fDir.clone().multiplyScalar(arrowLength + 0.25));
        const label = createTextSprite(`${f.name}: ${fMag.toFixed(1)} N`, f.color, 24, false);
        label.position.copy(tipPos);
        vectorsGroupRef.current?.add(label);
      }

      // Projections / Components in X, Y, Z
      if (showComponents && fMag > 0.1) {
        const compGeom = new THREE.BufferGeometry();
        const p0 = objectPos.clone();
        const px = new THREE.Vector3(p0.x + f.x * vectorScale, p0.y, p0.z);
        const pxy = new THREE.Vector3(px.x, p0.y + f.y * vectorScale, p0.z);
        const pxyz = new THREE.Vector3(px.x, pxy.y, p0.z + f.z * vectorScale);

        const points = [p0, px, pxy, pxyz];
        compGeom.setFromPoints(points);

        const compMat = new THREE.LineDashedMaterial({
          color: f.color,
          dashSize: 0.1,
          gapSize: 0.05,
          opacity: 0.45,
          transparent: true,
        });

        const compLine = new THREE.Line(compGeom, compMat);
        compLine.computeLineDistances();
        vectorsGroupRef.current?.add(compLine);
      }
    });

    // Render Resultant Force Vector (Net Force F_net)
    // In Free Body mode: F_net = sum(F_i)
    // In Suspended mode: show net unbalance if not in equilibrium
    const showNet = mode === 'free' ? netForce.magnitude > 0.05 : !equilibriumResult.isEquilibrium && netForce.magnitude > 0.05;

    if (showNet) {
      const netDir = new THREE.Vector3(netForce.x, netForce.y, netForce.z).normalize();
      const netLength = netForce.magnitude * vectorScale;

      // Highlighted Yellow/Gold thick arrow with neon glow
      const netArrow = createArrow(objectPos, netDir, netLength, '#eab308', true);
      vectorsGroupRef.current.add(netArrow);

      // Label on Net Force without bounding box
      if (showLabels) {
        const netTip = objectPos.clone().add(netDir.clone().multiplyScalar(netLength + 0.3));
        const netColor = theme === 'light' ? '#b45309' : '#facc15';
        const netLabel = createTextSprite(
          `F_net: ${netForce.magnitude.toFixed(1)} N`,
          netColor,
          26,
          false
        );
        netLabel.position.copy(netTip);
        vectorsGroupRef.current.add(netLabel);
      }
    }
  }, [forces, netForce, equilibriumResult, mode, vectorScale, showLabels, showComponents, objectPos.y, theme]);

  // Camera presets
  const setCameraView = (view: 'iso' | 'front' | 'top' | 'side') => {
    if (!cameraRef.current || !controlsRef.current) return;
    const controls = controlsRef.current;
    const camera = cameraRef.current;
    const target = mode === 'suspended' ? new THREE.Vector3(0, 1.8, 0) : new THREE.Vector3(0, 0, 0);
    controls.target.copy(target);

    switch (view) {
      case 'iso':
        camera.position.set(5.5, 4.5, 6.5);
        break;
      case 'front': // Looking along -Z (XY plane)
        camera.position.set(0, target.y, 8.5);
        break;
      case 'top': // Looking along -Y (XZ plane)
        camera.position.set(0, 10, 0.01);
        break;
      case 'side': // Looking along -X (YZ plane)
        camera.position.set(8.5, target.y, 0);
        break;
    }
    camera.lookAt(target);
    controls.update();
  };

  const resetCamera = () => {
    setCameraView('iso');
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none transition-colors duration-300 ${
        theme === 'light' ? 'bg-slate-100' : 'bg-slate-950'
      }`}
    >
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

      {/* Top Left Stack: Perspectivas 3D + Indicador de Estado en columna vertical */}
      <div className="absolute top-4 left-4 z-20 flex flex-col items-start gap-2 pointer-events-none">
        {/* Fila 1: Botones de Perspectiva 3D */}
        <div
          className={`pointer-events-auto flex items-center gap-1.5 backdrop-blur-md border p-1.5 rounded-xl shadow-lg transition-colors ${
            theme === 'light'
              ? 'bg-white/95 border-slate-300 text-slate-800 shadow-slate-300/40'
              : 'bg-slate-900/90 border-slate-700/70 text-slate-200 shadow-black/50'
          }`}
        >
          <button
            type="button"
            onClick={() => setCameraView('iso')}
            className={`px-2.5 py-1 text-xs font-mono font-medium rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
              theme === 'light'
                ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Vista Isométrica 3D"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-500" />
            3D Iso
          </button>
          <button
            type="button"
            onClick={() => setCameraView('front')}
            className={`px-2 py-1 text-xs font-mono font-medium rounded-lg transition-colors cursor-pointer ${
              theme === 'light'
                ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Vista Frontal (Plano XY)"
          >
            Frontal (XY)
          </button>
          <button
            type="button"
            onClick={() => setCameraView('top')}
            className={`px-2 py-1 text-xs font-mono font-medium rounded-lg transition-colors cursor-pointer ${
              theme === 'light'
                ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Vista Superior (Plano XZ)"
          >
            Superior (XZ)
          </button>
          <button
            type="button"
            onClick={() => setCameraView('side')}
            className={`px-2 py-1 text-xs font-mono font-medium rounded-lg transition-colors cursor-pointer ${
              theme === 'light'
                ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Vista Lateral (Plano YZ)"
          >
            Lateral (YZ)
          </button>
          <div className={`w-px h-4 mx-0.5 ${theme === 'light' ? 'bg-slate-300' : 'bg-slate-700'}`} />
          <button
            type="button"
            onClick={resetCamera}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              theme === 'light'
                ? 'text-slate-500 hover:text-slate-950 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Restablecer Cámara"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Fila 2: Indicador de Modo y Estado del Sistema (ΣF y Equilibrio) a modo de columna */}
        <div
          className={`pointer-events-auto flex items-center gap-2.5 backdrop-blur-md border px-3 py-1.5 rounded-xl text-xs font-mono shadow-md transition-colors ${
            theme === 'light'
              ? 'bg-white/95 border-slate-300 text-slate-800 shadow-slate-300/40'
              : 'bg-slate-900/90 border-slate-700/70 text-slate-200 shadow-black/50'
          }`}
        >
          <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>Modo:</span>
          <span className={`font-bold uppercase ${theme === 'light' ? 'text-cyan-700' : 'text-cyan-300'}`}>
            {mode === 'free' ? 'Objeto Libre' : `Suspendido (${cableCount || anchors.length} Cables)`}
          </span>
          <span className={theme === 'light' ? 'text-slate-300' : 'text-slate-600'}>•</span>
          <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>|F_net|:</span>
          <span className={`font-bold ${netForce.magnitude < 0.05 ? 'text-emerald-500' : 'text-amber-500'}`}>
            {netForce.magnitude.toFixed(1)} N
          </span>
          <span className={theme === 'light' ? 'text-slate-300' : 'text-slate-600'}>•</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              equilibriumResult.isEquilibrium
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
            }`}
          >
            {equilibriumResult.isEquilibrium ? 'Equilibrio' : 'Dinámico'}
          </span>
        </div>
      </div>

      {/* Axis Guide Legend in bottom corner */}
      <div
        className={`absolute bottom-4 left-4 z-10 pointer-events-none backdrop-blur-md border px-3 py-2 rounded-xl text-xs font-mono flex items-center gap-3 transition-colors ${
          theme === 'light'
            ? 'bg-white/90 border-slate-300 text-slate-800 shadow-md'
            : 'bg-slate-900/80 border-slate-800/80 text-slate-200'
        }`}
      >
        <span className="text-[11px] font-sans opacity-70">Ejes:</span>
        <span className="flex items-center gap-1 text-rose-500 font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> +X
        </span>
        <span className="flex items-center gap-1 text-emerald-600 font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> +Y
        </span>
        <span className="flex items-center gap-1 text-blue-600 font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> +Z
        </span>
        <span
          className={`border-l pl-2 text-amber-500 font-semibold flex items-center gap-1 ${
            theme === 'light' ? 'border-slate-300' : 'border-slate-700'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> F_net
        </span>
      </div>
    </div>
  );
};
