export interface ForceVector {
  id: string;
  name: string;
  x: number; // Force in Newtons (N)
  y: number;
  z: number;
  color: string;
  visible: boolean;
}

export interface CableAnchor {
  id: string;
  name: string;
  x: number; // Anchor coordinates in meters (m)
  y: number;
  z: number;
  color: string;
}

export type SimulationMode = 'free' | 'suspended';

export interface StaticEquilibriumResult {
  isEquilibrium: boolean;
  netForce: { x: number; y: number; z: number; magnitude: number };
  cablesTension?: {
    cableId: string;
    cableName: string;
    tension: number; // in Newtons
    isValid: boolean; // false if slack or physically impossible
    unitVector: { x: number; y: number; z: number };
  }[];
  errorMessage?: string;
}

export interface PresetScenario {
  id: string;
  name: string;
  description: string;
  mode: SimulationMode;
  objectMass: number; // kg
  forces: ForceVector[];
  cableCount?: 2 | 3;
  anchors?: CableAnchor[];
}
