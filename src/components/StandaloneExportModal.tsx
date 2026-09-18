import React, { useState } from 'react';
import { Download, Copy, Check, X, FileCode } from 'lucide-react';

interface StandaloneExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StandaloneExportModal: React.FC<StandaloneExportModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Single-file HTML code with complete Three.js CDN, CSS styling and manual vector math logic
  const standaloneHtmlCode = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simulador Educativo de Física 3D - Vectores y Equilibrio Estático</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #090d16;
      color: #f1f5f9;
      overflow: hidden;
      height: 100vh;
      width: 100vw;
    }
    #canvas-container {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
    }
    #ui-container {
      position: absolute;
      top: 16px; right: 16px;
      width: 380px;
      max-height: calc(100vh - 32px);
      background: rgba(15, 23, 42, 0.92);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(51, 65, 85, 0.8);
      border-radius: 16px;
      padding: 16px;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
      z-index: 100;
    }
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(51, 65, 85, 0.6);
    }
    .panel-title {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #38bdf8;
      text-transform: uppercase;
    }
    .mode-switch {
      display: flex;
      background: #1e293b;
      padding: 3px;
      border-radius: 8px;
      margin-bottom: 12px;
    }
    .mode-btn {
      flex: 1;
      padding: 6px 10px;
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.2s;
    }
    .mode-btn.active {
      background: #0284c7;
      color: #ffffff;
    }
    .card {
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid rgba(51, 65, 85, 0.6);
      border-radius: 10px;
      padding: 10px;
      margin-bottom: 10px;
    }
    .card-title {
      font-size: 11px;
      font-weight: 600;
      color: #cbd5e1;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
    }
    .input-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
      font-size: 11px;
      font-family: ui-monospace, monospace;
    }
    .input-row label { width: 24px; font-weight: bold; }
    .input-row input[type="range"] { flex: 1; accent-color: #0284c7; }
    .input-row input[type="number"] {
      width: 65px;
      background: #0f172a;
      border: 1px solid #334155;
      color: #f8fafc;
      padding: 2px 4px;
      border-radius: 4px;
      text-align: right;
    }
    .btn-action {
      width: 100%;
      background: #0284c7;
      color: white;
      border: none;
      padding: 8px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      margin-bottom: 8px;
      transition: background 0.2s;
    }
    .btn-action:hover { background: #0369a1; }
    .table-container {
      margin-top: 10px;
      font-size: 11px;
      font-family: ui-monospace, monospace;
      width: 100%;
      border-collapse: collapse;
    }
    .table-container th, .table-container td {
      padding: 4px 6px;
      border-bottom: 1px solid #334155;
    }
    .table-container th { color: #94a3b8; font-weight: 600; text-align: right; }
    .table-container th:first-child, .table-container td:first-child { text-align: left; }
    .table-container td { text-align: right; }
    .badge {
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 10px;
      font-family: ui-monospace, monospace;
      font-weight: bold;
      text-align: center;
      margin-top: 8px;
    }
    .badge-success { background: rgba(6, 78, 59, 0.6); color: #34d399; border: 1px solid #059669; }
    .badge-warning { background: rgba(120, 53, 15, 0.6); color: #fbbf24; border: 1px solid #d97706; }
    .nav-helper {
      position: absolute;
      top: 16px; left: 16px;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid #334155;
      padding: 6px 12px;
      border-radius: 10px;
      font-size: 11px;
      font-family: ui-monospace, monospace;
      z-index: 50;
      pointer-events: none;
    }
  </style>
  <!-- Three.js and OrbitControls from CDN -->
  <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/examples/js/controls/OrbitControls.js"></script>
</head>
<body>
  <div id="canvas-container"></div>
  <div class="nav-helper">
    Ejes: <span style="color:#ef4444">+X (Rojo)</span> | <span style="color:#22c55e">+Y (Verde)</span> | <span style="color:#3b82f6">+Z (Azul)</span> | <span style="color:#facc15">F_net (Amarillo)</span>
  </div>

  <div id="ui-container">
    <div class="panel-header">
      <span class="panel-title">Física 3D: Vectores y Estática</span>
      <span style="font-size:10px; color:#94a3b8;">Standalone</span>
    </div>

    <!-- Mode switch -->
    <div class="mode-switch">
      <button id="btn-mode-free" class="mode-btn active" onclick="setSimulationMode('free')">Objeto Libre</button>
      <button id="btn-mode-suspended" class="mode-btn" onclick="setSimulationMode('suspended')">Objeto Suspendido</button>
    </div>

    <!-- Free body controls -->
    <div id="free-body-controls">
      <div id="vectors-list"></div>
      <button class="btn-action" onclick="addNewVector()">+ Añadir Vector de Fuerza</button>
    </div>

    <!-- Suspended object controls -->
    <div id="suspended-controls" style="display:none;">
      <div class="card">
        <div class="card-title"><span>Masa y Gravedad</span><span id="weight-display" style="color:#f43f5e;">W = 98.1 N</span></div>
        <div class="input-row">
          <label>m:</label>
          <input type="range" id="mass-range" min="1" max="50" step="1" value="10" oninput="updateMass(this.value)">
          <input type="number" id="mass-num" value="10" oninput="updateMass(this.value)">
          <span>kg</span>
        </div>
      </div>
      <div class="card">
        <div class="card-title">
          <span>Tensores / Cables</span>
          <div style="display:inline-flex; gap:4px;">
            <button class="mode-btn" id="cables-2-btn" onclick="setCableCount(2)" style="padding:2px 6px; background:#0284c7; color:white;">2 Cables</button>
            <button class="mode-btn" id="cables-3-btn" onclick="setCableCount(3)" style="padding:2px 6px;">3 Cables</button>
          </div>
        </div>
        <div id="cables-list"></div>
      </div>
    </div>

    <!-- Summary table -->
    <div class="card">
      <div class="card-title"><span>Resumen de Fuerzas y Equilibrio</span></div>
      <table class="table-container">
        <thead>
          <tr>
            <th>Fuerza</th>
            <th>Fx (N)</th>
            <th>Fy (N)</th>
            <th>Fz (N)</th>
            <th>|F| (N)</th>
          </tr>
        </thead>
        <tbody id="summary-tbody"></tbody>
      </table>
      <div id="equilibrium-badge" class="badge badge-success">EQUILIBRIO ESTÁTICO (ΣF = 0)</div>
    </div>
  </div>

  <script>
    // --- ESTADO GLOBAL Y MATEMÁTICAS VECTORIALES (Sin librerías físicas externas) ---
    let currentMode = 'free';
    let mass = 10;
    const gravity = 9.81;
    let cableCount = 2;
    const vectorScale = 0.025;

    let forces = [
      { id: 'f1', name: 'F₁', x: 80, y: 0, z: 0, color: '#38bdf8' },
      { id: 'f2', name: 'F₂', x: -40, y: 0, z: 69.3, color: '#a855f7' },
      { id: 'f3', name: 'F₃', x: -40, y: 0, z: -69.3, color: '#f97316' }
    ];

    let anchors = [
      { id: 'c1', name: 'Cable A', x: -2.0, y: 3.5, z: 0.0, color: '#06b6d4' },
      { id: 'c2', name: 'Cable B', x: 2.0, y: 3.5, z: 0.0, color: '#3b82f6' },
      { id: 'c3', name: 'Cable C', x: 0.0, y: 3.5, z: 2.2, color: '#8b5cf6' }
    ];

    // Funciones vectoriales puras en JS
    function norm(v) { return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z); }
    function normalize(v) {
      const m = norm(v);
      return m === 0 ? {x:0, y:0, z:0} : { x: v.x/m, y: v.y/m, z: v.z/m };
    }
    function det3x3(c1, c2, c3) {
      return c1.x * (c2.y * c3.z - c2.z * c3.y) -
             c2.x * (c1.y * c3.z - c1.z * c3.y) +
             c3.x * (c1.y * c2.z - c1.z * c2.y);
    }
    function det2x2(a, b, c, d) { return a * d - b * c; }

    // --- THREE.JS ESCENA ---
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#090d16');

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(5.5, 4.5, 6.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 1, 0);

    // Luces
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(6, 12, 8);
    scene.add(dirLight);

    // Ejes y Grilla
    const grid = new THREE.GridHelper(10, 20, 0x334155, 0x1e293b);
    scene.add(grid);

    const vectorsGroup = new THREE.Group();
    const sceneObjectsGroup = new THREE.Group();
    scene.add(vectorsGroup);
    scene.add(sceneObjectsGroup);

    // Flechas de ejes
    const axisLen = 4.0;
    scene.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), axisLen, 0xef4444, 0.3, 0.15));
    scene.add(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), axisLen, 0x22c55e, 0.3, 0.15));
    scene.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), axisLen, 0x3b82f6, 0.3, 0.15));

    // Responsive resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Loop de animación
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Actualizar Renderizado 3D y UI
    function updateScene() {
      // Limpiar grupos
      while(vectorsGroup.children.length > 0) vectorsGroup.remove(vectorsGroup.children[0]);
      while(sceneObjectsGroup.children.length > 0) sceneObjectsGroup.remove(sceneObjectsGroup.children[0]);

      const objectPos = currentMode === 'suspended' ? new THREE.Vector3(0, 1.2, 0) : new THREE.Vector3(0, 0, 0);

      // Objeto central
      if (currentMode === 'free') {
        const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(0.25, 32, 32),
          new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 })
        );
        sceneObjectsGroup.add(sphere);
      } else {
        const box = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 0.6, 0.6),
          new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.4, roughness: 0.4 })
        );
        box.position.copy(objectPos).add(new THREE.Vector3(0, -0.3, 0));
        sceneObjectsGroup.add(box);

        // Techo
        const ceiling = new THREE.Mesh(
          new THREE.BoxGeometry(6, 0.1, 6),
          new THREE.MeshStandardMaterial({ color: 0x1e293b, transparent: true, opacity: 0.4 })
        );
        ceiling.position.set(0, 3.8, 0);
        sceneObjectsGroup.add(ceiling);
      }

      // Vectores de fuerza aplicados
      let netX = 0, netY = 0, netZ = 0;
      forces.forEach(f => {
        netX += f.x; netY += f.y; netZ += f.z;
        const mag = norm(f);
        if (mag > 0.1) {
          const dir = new THREE.Vector3(f.x, f.y, f.z).normalize();
          const arrow = new THREE.ArrowHelper(dir, objectPos, mag * vectorScale, f.color, 0.35, 0.18);
          vectorsGroup.add(arrow);
        }
      });

      // Modo Suspendido: calcular tensiones estáticas
      let calculatedTensions = [];
      let isEquilibrium = false;
      const weight = mass * gravity;

      if (currentMode === 'suspended') {
        const W = new THREE.Vector3(0, -weight, 0);
        const wArrow = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), objectPos, weight * vectorScale, 0xf43f5e, 0.35, 0.18);
        vectorsGroup.add(wArrow);

        // Resolver equilibrio con cables
        const target = { x: -netX, y: weight - netY, z: -netZ };
        const u = anchors.slice(0, cableCount).map(a => normalize({ x: a.x - objectPos.x, y: a.y - objectPos.y, z: a.z - objectPos.z }));

        if (cableCount === 2) {
          const det = det2x2(u[0].x, u[1].x, u[0].y, u[1].y);
          if (Math.abs(det) > 1e-4) {
            const t1 = det2x2(target.x, u[1].x, target.y, u[1].y) / det;
            const t2 = det2x2(u[0].x, target.x, u[0].y, target.y) / det;
            calculatedTensions = [t1, t2];
            isEquilibrium = (t1 >= 0 && t2 >= 0);
          }
        } else if (cableCount === 3) {
          const D = det3x3(u[0], u[1], u[2]);
          if (Math.abs(D) > 1e-4) {
            const t1 = det3x3(target, u[1], u[2]) / D;
            const t2 = det3x3(u[0], target, u[2]) / D;
            const t3 = det3x3(u[0], u[1], target) / D;
            calculatedTensions = [t1, t2, t3];
            isEquilibrium = (t1 >= 0 && t2 >= 0 && t3 >= 0);
          }
        }

        // Renderizar cables y flechas de tensión
        anchors.slice(0, cableCount).forEach((a, i) => {
          const aPos = new THREE.Vector3(a.x, a.y, a.z);
          const cDir = new THREE.Vector3().subVectors(aPos, objectPos);
          const cLen = cDir.length();

          // Línea/cilindro del cable
          const geom = new THREE.CylinderGeometry(0.015, 0.015, cLen);
          geom.translate(0, cLen/2, 0);
          const mat = new THREE.MeshStandardMaterial({ color: a.color, emissive: a.color, emissiveIntensity: 0.3 });
          const mesh = new THREE.Mesh(geom, mat);
          mesh.position.copy(objectPos);
          mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), cDir.clone().normalize());
          sceneObjectsGroup.add(mesh);

          // Vector de tensión
          const tVal = calculatedTensions[i] || 0;
          if (tVal > 0.05) {
            const tArrow = new THREE.ArrowHelper(cDir.clone().normalize(), objectPos, tVal * vectorScale, a.color, 0.3, 0.15);
            vectorsGroup.add(tArrow);
          }
        });
      } else {
        const netMag = Math.sqrt(netX*netX + netY*netY + netZ*netZ);
        isEquilibrium = netMag < 0.1;
        if (netMag > 0.1) {
          const netDir = new THREE.Vector3(netX, netY, netZ).normalize();
          const netArrow = new THREE.ArrowHelper(netDir, objectPos, netMag * vectorScale, 0xfacc15, 0.45, 0.22);
          vectorsGroup.add(netArrow);
        }
      }

      updateUI(netX, netY, netZ, calculatedTensions, isEquilibrium);
    }

    function updateUI(netX, netY, netZ, tensions, isEquilibrium) {
      const tbody = document.getElementById('summary-tbody');
      tbody.innerHTML = '';

      if (currentMode === 'suspended') {
        const w = mass * gravity;
        tbody.innerHTML += \`<tr style="color:#f43f5e;"><td>Peso (W)</td><td>0.0</td><td>-\${w.toFixed(1)}</td><td>0.0</td><td>\${w.toFixed(1)}</td></tr>\`;
        anchors.slice(0, cableCount).forEach((a, i) => {
          const t = (tensions[i] || 0).toFixed(1);
          tbody.innerHTML += \`<tr style="color:\${a.color};"><td>\${a.name}</td><td colspan="3" style="text-align:center;">Tensión T_\${i+1}</td><td>\${t}</td></tr>\`;
        });
      }

      forces.forEach(f => {
        const mag = norm(f).toFixed(1);
        tbody.innerHTML += \`<tr><td><span style="color:\${f.color};">●</span> \${f.name}</td><td>\${f.x.toFixed(1)}</td><td>\${f.y.toFixed(1)}</td><td>\${f.z.toFixed(1)}</td><td>\${mag}</td></tr>\`;
      });

      const netMag = currentMode === 'free' ? Math.sqrt(netX*netX + netY*netY + netZ*netZ).toFixed(1) : (isEquilibrium ? '0.0' : 'Desbalance');
      tbody.innerHTML += \`<tr style="font-weight:bold; color:#facc15; border-top:2px solid #475569;"><td>F_net</td><td>\${netX.toFixed(1)}</td><td>\${netY.toFixed(1)}</td><td>\${netZ.toFixed(1)}</td><td>\${netMag} N</td></tr>\`;

      const badge = document.getElementById('equilibrium-badge');
      if (isEquilibrium) {
        badge.className = 'badge badge-success';
        badge.textContent = 'EQUILIBRIO ESTÁTICO (ΣF = 0)';
      } else {
        badge.className = 'badge badge-warning';
        badge.textContent = 'NO EN EQUILIBRIO (F_net ≠ 0)';
      }
    }

    function renderVectorsList() {
      const list = document.getElementById('vectors-list');
      list.innerHTML = '';
      forces.forEach((f, idx) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = \`
          <div class="card-title">
            <span><span style="color:\${f.color}">●</span> \${f.name}</span>
            <button onclick="removeVector(\${idx})" style="background:none; border:none; color:#ef4444; cursor:pointer;">✕</button>
          </div>
          <div class="input-row"><label style="color:#ef4444;">Fx:</label><input type="range" min="-120" max="120" value="\${f.x}" oninput="updateVector(\${idx}, 'x', this.value)"><input type="number" value="\${f.x}" oninput="updateVector(\${idx}, 'x', this.value)"></div>
          <div class="input-row"><label style="color:#22c55e;">Fy:</label><input type="range" min="-120" max="120" value="\${f.y}" oninput="updateVector(\${idx}, 'y', this.value)"><input type="number" value="\${f.y}" oninput="updateVector(\${idx}, 'y', this.value)"></div>
          <div class="input-row"><label style="color:#3b82f6;">Fz:</label><input type="range" min="-120" max="120" value="\${f.z}" oninput="updateVector(\${idx}, 'z', this.value)"><input type="number" value="\${f.z}" oninput="updateVector(\${idx}, 'z', this.value)"></div>
        \`;
        list.appendChild(card);
      });
    }

    function renderCablesList() {
      const list = document.getElementById('cables-list');
      list.innerHTML = '';
      anchors.slice(0, cableCount).forEach((a, idx) => {
        const card = document.createElement('div');
        card.style.padding = '6px';
        card.style.marginBottom = '6px';
        card.style.background = '#0f172a';
        card.style.borderRadius = '6px';
        card.innerHTML = \`
          <div style="font-size:11px; font-weight:bold; color:\${a.color}; margin-bottom:4px;">\${a.name} (Anclaje Techo)</div>
          <div class="input-row"><label style="color:#ef4444;">X:</label><input type="number" step="0.2" value="\${a.x}" oninput="updateAnchor(\${idx}, 'x', this.value)">
          <label style="color:#22c55e;">Y:</label><input type="number" step="0.2" value="\${a.y}" oninput="updateAnchor(\${idx}, 'y', this.value)">
          <label style="color:#3b82f6;">Z:</label><input type="number" step="0.2" value="\${a.z}" oninput="updateAnchor(\${idx}, 'z', this.value)"></div>
        \`;
        list.appendChild(card);
      });
    }

    // Interacciones UI
    window.setSimulationMode = function(mode) {
      currentMode = mode;
      document.getElementById('btn-mode-free').className = mode === 'free' ? 'mode-btn active' : 'mode-btn';
      document.getElementById('btn-mode-suspended').className = mode === 'suspended' ? 'mode-btn active' : 'mode-btn';
      document.getElementById('free-body-controls').style.display = mode === 'free' ? 'block' : 'none';
      document.getElementById('suspended-controls').style.display = mode === 'suspended' ? 'block' : 'none';
      updateScene();
    };

    window.updateVector = function(idx, comp, val) {
      forces[idx][comp] = parseFloat(val) || 0;
      renderVectorsList();
      updateScene();
    };

    window.addNewVector = function() {
      const colors = ['#38bdf8', '#a855f7', '#f97316', '#34d399', '#ec4899'];
      forces.push({
        id: 'f' + (forces.length + 1),
        name: 'F_' + (forces.length + 1),
        x: Math.round((Math.random() * 80 - 40)),
        y: Math.round((Math.random() * 80 - 40)),
        z: Math.round((Math.random() * 80 - 40)),
        color: colors[forces.length % colors.length]
      });
      renderVectorsList();
      updateScene();
    };

    window.removeVector = function(idx) {
      forces.splice(idx, 1);
      renderVectorsList();
      updateScene();
    };

    window.updateMass = function(val) {
      mass = parseFloat(val) || 1;
      document.getElementById('mass-range').value = mass;
      document.getElementById('mass-num').value = mass;
      document.getElementById('weight-display').textContent = 'W = ' + (mass * gravity).toFixed(1) + ' N';
      updateScene();
    };

    window.setCableCount = function(cnt) {
      cableCount = cnt;
      document.getElementById('cables-2-btn').style.background = cnt === 2 ? '#0284c7' : 'transparent';
      document.getElementById('cables-2-btn').style.color = cnt === 2 ? '#fff' : '#94a3b8';
      document.getElementById('cables-3-btn').style.background = cnt === 3 ? '#0284c7' : 'transparent';
      document.getElementById('cables-3-btn').style.color = cnt === 3 ? '#fff' : '#94a3b8';
      renderCablesList();
      updateScene();
    };

    window.updateAnchor = function(idx, comp, val) {
      anchors[idx][comp] = parseFloat(val) || 0;
      updateScene();
    };

    // Inicializar
    renderVectorsList();
    renderCablesList();
    updateScene();
  </script>
</body>
</html>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(standaloneHtmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([standaloneHtmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'simulador_fisica_3d.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-slate-100 font-mono">
              Exportar Archivo Único index.html (Standalone)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Este código contiene la aplicación física completa en un <strong>único archivo autónomo</strong> con HTML, CSS, JavaScript y Three.js importado por CDN. Puedes descargarlo o copiarlo para ejecutarlo directamente en cualquier navegador sin servidor web ni dependencias locales.
        </p>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-60 overflow-y-auto text-[11px] font-mono text-slate-400">
          <pre>{standaloneHtmlCode.slice(0, 1000)} ... [código completo index.html]</pre>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? '¡Copiado al Portapapeles!' : 'Copiar Código'}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Descargar index.html
          </button>
        </div>
      </div>
    </div>
  );
};
