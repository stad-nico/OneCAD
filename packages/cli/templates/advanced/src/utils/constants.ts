/**
 * Project constants and material properties
 */

// Material properties
export const MATERIALS = {
  PLA: {
    density: 1.24, // g/cm³
    strength: 50,  // MPa
    printTemp: 210, // °C
    bedTemp: 60    // °C
  },
  ABS: {
    density: 1.05,
    strength: 40,
    printTemp: 250,
    bedTemp: 100
  },
  PETG: {
    density: 1.27,
    strength: 55,
    printTemp: 235,
    bedTemp: 80
  }
} as const;

// Manufacturing constraints
export const MANUFACTURING = {
  minWallThickness: 0.8,   // mm
  maxOverhangAngle: 45,    // degrees
  supportThreshold: 60,    // degrees
  minHoleSize: 0.4,       // mm
  layerHeight: 0.2,       // mm
  nozzleDiameter: 0.4     // mm
} as const;

// Standard sizes (ISO metric)
export const STANDARD_SIZES = {
  screws: {
    M3: { diameter: 3, headDiameter: 5.5, headHeight: 3 },
    M4: { diameter: 4, headDiameter: 7, headHeight: 4 },
    M5: { diameter: 5, headDiameter: 8.5, headHeight: 5 },
    M6: { diameter: 6, headDiameter: 10, headHeight: 6 }
  },
  bearings: {
    '608': { inner: 8, outer: 22, width: 7 },
    '6001': { inner: 12, outer: 28, width: 8 },
    '6200': { inner: 10, outer: 30, width: 9 }
  }
} as const;

// Mathematical constants
export const MATH = {
  PHI: (1 + Math.sqrt(5)) / 2,  // Golden ratio
  TAU: 2 * Math.PI,             // Full circle in radians
  SQRT2: Math.sqrt(2),
  SQRT3: Math.sqrt(3)
} as const;