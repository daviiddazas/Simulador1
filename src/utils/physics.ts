import { ForceVector, CableAnchor, StaticEquilibriumResult } from '../types';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export function norm(v: Vector3D): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

export function normalize(v: Vector3D): Vector3D {
  const m = norm(v);
  if (m === 0) return { x: 0, y: 0, z: 0 };
  return { x: v.x / m, y: v.y / m, z: v.z / m };
}

export function add(v1: Vector3D, v2: Vector3D): Vector3D {
  return { x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z };
}

export function sub(v1: Vector3D, v2: Vector3D): Vector3D {
  return { x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z };
}

export function scale(v: Vector3D, s: number): Vector3D {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

export function dot(v1: Vector3D, v2: Vector3D): number {
  return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

export function cross(v1: Vector3D, v2: Vector3D): Vector3D {
  return {
    x: v1.y * v2.z - v1.z * v2.y,
    y: v1.z * v2.x - v1.x * v2.z,
    z: v1.x * v2.y - v1.y * v2.x,
  };
}

/**
 * Convert Cartesian coordinates to Spherical coordinates
 * azimuthTheta: Angle in horizontal XZ plane from +X towards +Z (degrees)
 * elevationPhi: Angle above horizontal XZ plane towards +Y (degrees)
 */
export function cartesianToSpherical(x: number, y: number, z: number) {
  const magnitude = Math.sqrt(x * x + y * y + z * z);
  if (magnitude === 0) {
    return { magnitude: 0, azimuthTheta: 0, elevationPhi: 0 };
  }
  const elevationPhi = Math.asin(Math.max(-1, Math.min(1, y / magnitude))) * (180 / Math.PI);
  const azimuthTheta = Math.atan2(z, x) * (180 / Math.PI);
  return {
    magnitude: Number(magnitude.toFixed(2)),
    azimuthTheta: Number(azimuthTheta.toFixed(1)),
    elevationPhi: Number(elevationPhi.toFixed(1)),
  };
}

/**
 * Convert Spherical coordinates to Cartesian
 */
export function sphericalToCartesian(magnitude: number, azimuthThetaDeg: number, elevationPhiDeg: number): Vector3D {
  const thetaRad = (azimuthThetaDeg * Math.PI) / 180;
  const phiRad = (elevationPhiDeg * Math.PI) / 180;

  const cosPhi = Math.cos(phiRad);
  const sinPhi = Math.sin(phiRad);

  const x = magnitude * cosPhi * Math.cos(thetaRad);
  const y = magnitude * sinPhi;
  const z = magnitude * cosPhi * Math.sin(thetaRad);

  return {
    x: Number(x.toFixed(2)),
    y: Number(y.toFixed(2)),
    z: Number(z.toFixed(2)),
  };
}

/**
 * Determinant of a 3x3 matrix
 * [ c1.x  c2.x  c3.x ]
 * [ c1.y  c2.y  c3.y ]
 * [ c1.z  c2.z  c3.z ]
 */
export function det3x3(c1: Vector3D, c2: Vector3D, c3: Vector3D): number {
  return (
    c1.x * (c2.y * c3.z - c2.z * c3.y) -
    c2.x * (c1.y * c3.z - c1.z * c3.y) +
    c3.x * (c1.y * c2.z - c1.z * c2.y)
  );
}

/**
 * Determinant of 2x2 matrix
 */
export function det2x2(a: number, b: number, c: number, d: number): number {
  return a * d - b * c;
}

/**
 * Calculates net force for free body vectors
 */
export function calculateNetForce(forces: ForceVector[]): { x: number; y: number; z: number; magnitude: number } {
  let netX = 0;
  let netY = 0;
  let netZ = 0;

  for (const f of forces) {
    if (f.visible) {
      netX += f.x;
      netY += f.y;
      netZ += f.z;
    }
  }

  // Handle tiny floating point noise
  if (Math.abs(netX) < 1e-5) netX = 0;
  if (Math.abs(netY) < 1e-5) netY = 0;
  if (Math.abs(netZ) < 1e-5) netZ = 0;

  const mag = Math.sqrt(netX * netX + netY * netY + netZ * netZ);
  return {
    x: Number(netX.toFixed(2)),
    y: Number(netY.toFixed(2)),
    z: Number(netZ.toFixed(2)),
    magnitude: Number(mag.toFixed(2)),
  };
}

/**
 * Solves static equilibrium for a suspended object with cables
 * Object at position P_obj = (0, yObj, 0).
 * External load includes gravity W = -m * g in Y, plus any applied forces.
 */
export function solveSuspendedEquilibrium(
  objectPos: Vector3D,
  massKg: number,
  gravity: number,
  appliedForces: ForceVector[],
  anchors: CableAnchor[]
): StaticEquilibriumResult {
  // 1. Calculate total load force acting on the object
  // Weight acts in -Y direction:
  const weightY = -massKg * gravity;
  let loadX = 0;
  let loadY = weightY;
  let loadZ = 0;

  for (const f of appliedForces) {
    if (f.visible) {
      loadX += f.x;
      loadY += f.y;
      loadZ += f.z;
    }
  }

  const loadVector: Vector3D = { x: loadX, y: loadY, z: loadZ };
  // Equilibrium equation: sum(T_i * u_i) + loadVector = 0 => sum(T_i * u_i) = -loadVector
  const targetForce: Vector3D = { x: -loadVector.x, y: -loadVector.y, z: -loadVector.z };

  if (anchors.length < 2) {
    return {
      isEquilibrium: false,
      netForce: {
        x: loadVector.x,
        y: loadVector.y,
        z: loadVector.z,
        magnitude: norm(loadVector),
      },
      errorMessage: 'Se requieren al menos 2 cables para suspender el objeto.',
    };
  }

  // Calculate unit vectors from object to anchors
  const unitVectors: Vector3D[] = anchors.map((a) => {
    const dir = sub({ x: a.x, y: a.y, z: a.z }, objectPos);
    return normalize(dir);
  });

  if (anchors.length === 2) {
    // 2 Cables: system is generally coplanar.
    const u1 = unitVectors[0];
    const u2 = unitVectors[1];

    // Check if external load has out-of-plane component
    const normal = cross(u1, u2);
    const normalMag = norm(normal);

    if (normalMag < 1e-4) {
      return {
        isEquilibrium: false,
        netForce: { x: loadVector.x, y: loadVector.y, z: loadVector.z, magnitude: norm(loadVector) },
        errorMessage: 'Los 2 cables están colineales; no pueden sostener el objeto.',
      };
    }

    // Projection along normal:
    const outOfPlaneLoad = Math.abs(dot(loadVector, normalize(normal)));
    if (outOfPlaneLoad > 0.05) {
      return {
        isEquilibrium: false,
        netForce: { x: loadVector.x, y: loadVector.y, z: loadVector.z, magnitude: norm(loadVector) },
        errorMessage: `Fuerza fuera del plano de los 2 cables (${outOfPlaneLoad.toFixed(1)} N). El sistema oscilará o colapsará sin un 3er cable.`,
      };
    }

    // Solve 2x2 system using the 2 components that give non-zero determinant
    // Try (X, Y)
    let det = det2x2(u1.x, u2.x, u1.y, u2.y);
    let t1 = 0;
    let t2 = 0;
    let solved = false;

    if (Math.abs(det) > 1e-4) {
      t1 = det2x2(targetForce.x, u2.x, targetForce.y, u2.y) / det;
      t2 = det2x2(u1.x, targetForce.x, u1.y, targetForce.y) / det;
      solved = true;
    } else {
      // Try (Y, Z)
      det = det2x2(u1.y, u2.y, u1.z, u2.z);
      if (Math.abs(det) > 1e-4) {
        t1 = det2x2(targetForce.y, u2.y, targetForce.z, u2.z) / det;
        t2 = det2x2(u1.y, targetForce.y, u1.z, targetForce.z) / det;
        solved = true;
      } else {
        // Try (X, Z)
        det = det2x2(u1.x, u2.x, u1.z, u2.z);
        if (Math.abs(det) > 1e-4) {
          t1 = det2x2(targetForce.x, u2.x, targetForce.z, u2.z) / det;
          t2 = det2x2(u1.x, targetForce.x, u1.z, targetForce.z) / det;
          solved = true;
        }
      }
    }

    if (!solved) {
      return {
        isEquilibrium: false,
        netForce: { x: loadVector.x, y: loadVector.y, z: loadVector.z, magnitude: norm(loadVector) },
        errorMessage: 'Configuración de cables indeterminada.',
      };
    }

    const t1Valid = t1 >= -0.01;
    const t2Valid = t2 >= -0.01;
    const allValid = t1Valid && t2Valid;

    // Calculate actual resulting net force considering tension (cables can only pull: T >= 0)
    const effectiveT1 = Math.max(0, t1);
    const effectiveT2 = Math.max(0, t2);
    const netFx = loadVector.x + effectiveT1 * u1.x + effectiveT2 * u2.x;
    const netFy = loadVector.y + effectiveT1 * u1.y + effectiveT2 * u2.y;
    const netFz = loadVector.z + effectiveT1 * u1.z + effectiveT2 * u2.z;
    const netMag = Math.sqrt(netFx * netFx + netFy * netFy + netFz * netFz);

    return {
      isEquilibrium: allValid && netMag < 0.1,
      netForce: {
        x: Number(netFx.toFixed(2)),
        y: Number(netFy.toFixed(2)),
        z: Number(netFz.toFixed(2)),
        magnitude: Number(netMag.toFixed(2)),
      },
      cablesTension: [
        {
          cableId: anchors[0].id,
          cableName: anchors[0].name,
          tension: Number(t1.toFixed(2)),
          isValid: t1Valid,
          unitVector: u1,
        },
        {
          cableId: anchors[1].id,
          cableName: anchors[1].name,
          tension: Number(t2.toFixed(2)),
          isValid: t2Valid,
          unitVector: u2,
        },
      ],
      errorMessage: allValid ? undefined : 'Uno o más cables tienen tensión negativa (cable flojo/comprimido).',
    };
  } else if (anchors.length === 3) {
    // 3 Cables: Full 3D linear system
    const u1 = unitVectors[0];
    const u2 = unitVectors[1];
    const u3 = unitVectors[2];

    const D = det3x3(u1, u2, u3);

    if (Math.abs(D) < 1e-4) {
      return {
        isEquilibrium: false,
        netForce: { x: loadVector.x, y: loadVector.y, z: loadVector.z, magnitude: norm(loadVector) },
        errorMessage: 'Los 3 cables son coplanares o redundantes. No pueden estabilizar el espacio 3D.',
      };
    }

    const D1 = det3x3(targetForce, u2, u3);
    const D2 = det3x3(u1, targetForce, u3);
    const D3 = det3x3(u1, u2, targetForce);

    const t1 = D1 / D;
    const t2 = D2 / D;
    const t3 = D3 / D;

    const t1Valid = t1 >= -0.01;
    const t2Valid = t2 >= -0.01;
    const t3Valid = t3 >= -0.01;
    const allValid = t1Valid && t2Valid && t3Valid;

    // Effective tension can only be tensile (>= 0)
    const effectiveT1 = Math.max(0, t1);
    const effectiveT2 = Math.max(0, t2);
    const effectiveT3 = Math.max(0, t3);

    const netFx = loadVector.x + effectiveT1 * u1.x + effectiveT2 * u2.x + effectiveT3 * u3.x;
    const netFy = loadVector.y + effectiveT1 * u1.y + effectiveT2 * u2.y + effectiveT3 * u3.y;
    const netFz = loadVector.z + effectiveT1 * u1.z + effectiveT2 * u2.z + effectiveT3 * u3.z;
    const netMag = Math.sqrt(netFx * netFx + netFy * netFy + netFz * netFz);

    return {
      isEquilibrium: allValid && netMag < 0.1,
      netForce: {
        x: Number(netFx.toFixed(2)),
        y: Number(netFy.toFixed(2)),
        z: Number(netFz.toFixed(2)),
        magnitude: Number(netMag.toFixed(2)),
      },
      cablesTension: [
        {
          cableId: anchors[0].id,
          cableName: anchors[0].name,
          tension: Number(t1.toFixed(2)),
          isValid: t1Valid,
          unitVector: u1,
        },
        {
          cableId: anchors[1].id,
          cableName: anchors[1].name,
          tension: Number(t2.toFixed(2)),
          isValid: t2Valid,
          unitVector: u2,
        },
        {
          cableId: anchors[2].id,
          cableName: anchors[2].name,
          tension: Number(t3.toFixed(2)),
          isValid: t3Valid,
          unitVector: u3,
        },
      ],
      errorMessage: allValid ? undefined : 'Tensión negativa detectada. Los cables solo resisten tracción (tensión); uno o más cables quedarían flojos.',
    };
  }

  return {
    isEquilibrium: false,
    netForce: { x: loadVector.x, y: loadVector.y, z: loadVector.z, magnitude: norm(loadVector) },
    errorMessage: 'Número de cables no soportado (soporta 2 o 3).',
  };
}
