import { PresetScenario } from '../types';

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'free_equilibrium_3',
    name: 'Equilibrio de 3 Fuerzas (Coplanar)',
    description: 'Tres fuerzas de 100 N a 120° entre sí en el plano XZ. La fuerza neta es 0 N.',
    mode: 'free',
    objectMass: 5,
    forces: [
      { id: 'f1', name: 'F₁', x: 100, y: 0, z: 0, color: '#38bdf8', visible: true },
      { id: 'f2', name: 'F₂', x: -50, y: 0, z: 86.6, color: '#a855f7', visible: true },
      { id: 'f3', name: 'F₃', x: -50, y: 0, z: -86.6, color: '#f97316', visible: true },
    ],
  },
  {
    id: 'free_unbalanced_3d',
    name: 'Suma de Fuerzas Espaciales 3D',
    description: 'Fuerzas oblicuas en el espacio 3D mostrando el vector resultante neto.',
    mode: 'free',
    objectMass: 8,
    forces: [
      { id: 'f1', name: 'F₁ (Tractor)', x: 70, y: 30, z: 40, color: '#38bdf8', visible: true },
      { id: 'f2', name: 'F₂ (Viento)', x: -40, y: 15, z: 65, color: '#34d399', visible: true },
      { id: 'f3', name: 'F₃ (Soporte)', x: 10, y: -50, z: -30, color: '#ec4899', visible: true },
    ],
  },
  {
    id: 'suspended_2_cables',
    name: 'Objeto Suspendido (2 Cables Simétricos)',
    description: 'Masa de 10 kg suspendida por 2 cables anclados al techo.',
    mode: 'suspended',
    objectMass: 10,
    cableCount: 2,
    anchors: [
      { id: 'c1', name: 'Cable A', x: -2.0, y: 3.5, z: 0, color: '#06b6d4' },
      { id: 'c2', name: 'Cable B', x: 2.0, y: 3.5, z: 0, color: '#3b82f6' },
    ],
    forces: [],
  },
  {
    id: 'suspended_3_cables',
    name: 'Objeto Suspendido 3D (3 Cables)',
    description: 'Masa de 15 kg suspendida por 3 tensores anclados en triángulo al techo.',
    mode: 'suspended',
    objectMass: 15,
    cableCount: 3,
    anchors: [
      { id: 'c1', name: 'Tensor A', x: -2.2, y: 3.8, z: -1.3, color: '#06b6d4' },
      { id: 'c2', name: 'Tensor B', x: 2.2, y: 3.8, z: -1.3, color: '#3b82f6' },
      { id: 'c3', name: 'Tensor C', x: 0.0, y: 3.8, z: 2.5, color: '#8b5cf6' },
    ],
    forces: [],
  },
  {
    id: 'suspended_wind',
    name: 'Carga Suspendida con Viento Lateral',
    description: 'Semáforo o carga de 12 kg con dos cables y una ráfaga de viento horizontal.',
    mode: 'suspended',
    objectMass: 12,
    cableCount: 2,
    anchors: [
      { id: 'c1', name: 'Cable Izq', x: -2.5, y: 3.5, z: 0, color: '#06b6d4' },
      { id: 'c2', name: 'Cable Der', x: 2.5, y: 3.5, z: 0, color: '#3b82f6' },
    ],
    forces: [
      { id: 'f_wind', name: 'Viento (Fuerza)', x: 35, y: 0, z: 0, color: '#f59e0b', visible: true },
    ],
  },
];
