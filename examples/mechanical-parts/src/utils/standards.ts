/**
 * Standard mechanical component specifications
 * Based on ISO and DIN standards
 */

import type { BearingSpec, ThreadSpec, MaterialProperties } from '../types/mechanical.js';

/**
 * Standard ball bearing specifications (ISO 492)
 */
export const STANDARD_BEARINGS: Record<string, BearingSpec> = {
  // Deep groove ball bearings
  '608': {
    inner: 8,
    outer: 22,
    width: 7,
    designation: '608'
  },
  '6001': {
    inner: 12,
    outer: 28,
    width: 8,
    designation: '6001'
  },
  '6200': {
    inner: 10,
    outer: 30,
    width: 9,
    designation: '6200'
  },
  '6201': {
    inner: 12,
    outer: 32,
    width: 10,
    designation: '6201'
  },
  '6202': {
    inner: 15,
    outer: 35,
    width: 11,
    designation: '6202'
  },
  '6203': {
    inner: 17,
    outer: 40,
    width: 12,
    designation: '6203'
  },
  '6204': {
    inner: 20,
    outer: 47,
    width: 14,
    designation: '6204'
  },
  '6205': {
    inner: 25,
    outer: 52,
    width: 15,
    designation: '6205'
  },
  '6206': {
    inner: 30,
    outer: 62,
    width: 16,
    designation: '6206'
  }
};

/**
 * Standard metric thread specifications (ISO 68)
 */
export const STANDARD_THREADS: Record<string, ThreadSpec> = {
  'M3': {
    major: 3.0,
    minor: 2.459,
    pitch: 0.5,
    designation: 'M3x0.5'
  },
  'M4': {
    major: 4.0,
    minor: 3.459,
    pitch: 0.7,
    designation: 'M4x0.7'
  },
  'M5': {
    major: 5.0,
    minor: 4.459,
    pitch: 0.8,
    designation: 'M5x0.8'
  },
  'M6': {
    major: 6.0,
    minor: 5.350,
    pitch: 1.0,
    designation: 'M6x1.0'
  },
  'M8': {
    major: 8.0,
    minor: 7.350,
    pitch: 1.25,
    designation: 'M8x1.25'
  },
  'M10': {
    major: 10.0,
    minor: 9.350,
    pitch: 1.5,
    designation: 'M10x1.5'
  },
  'M12': {
    major: 12.0,
    minor: 11.350,
    pitch: 1.75,
    designation: 'M12x1.75'
  },
  'M16': {
    major: 16.0,
    minor: 15.294,
    pitch: 2.0,
    designation: 'M16x2.0'
  },
  'M20': {
    major: 20.0,
    minor: 19.294,
    pitch: 2.5,
    designation: 'M20x2.5'
  }
};

/**
 * Socket head cap screw dimensions (ISO 4762 / DIN 912)
 */
export const SOCKET_HEAD_CAP_SCREWS = {
  M3: {
    headDiameter: 5.5,
    headHeight: 3.0,
    keySize: 2.5,
    thread: STANDARD_THREADS.M3
  },
  M4: {
    headDiameter: 7.0,
    headHeight: 4.0,
    keySize: 3.0,
    thread: STANDARD_THREADS.M4
  },
  M5: {
    headDiameter: 8.5,
    headHeight: 5.0,
    keySize: 4.0,
    thread: STANDARD_THREADS.M5
  },
  M6: {
    headDiameter: 10.0,
    headHeight: 6.0,
    keySize: 5.0,
    thread: STANDARD_THREADS.M6
  },
  M8: {
    headDiameter: 13.0,
    headHeight: 8.0,
    keySize: 6.0,
    thread: STANDARD_THREADS.M8
  },
  M10: {
    headDiameter: 16.0,
    headHeight: 10.0,
    keySize: 8.0,
    thread: STANDARD_THREADS.M10
  }
} as const;

/**
 * Material properties for common engineering materials
 */
export const ENGINEERING_MATERIALS: Record<string, MaterialProperties> = {
  // Aluminum alloys
  AL6061: {
    name: 'Aluminum 6061-T6',
    density: 2700,        // kg/m³
    youngModulus: 68.9,   // GPa
    yieldStrength: 276,   // MPa
    thermalExpansion: 23.6e-6  // 1/K
  },
  
  // Steel alloys
  STEEL1045: {
    name: 'Carbon Steel 1045',
    density: 7850,
    youngModulus: 205,
    yieldStrength: 530,
    thermalExpansion: 11.5e-6
  },
  
  STAINLESS316: {
    name: 'Stainless Steel 316',
    density: 8000,
    youngModulus: 200,
    yieldStrength: 290,
    thermalExpansion: 16.0e-6
  },
  
  // Plastics for 3D printing
  PLA: {
    name: 'PLA (Polylactic Acid)',
    density: 1240,
    youngModulus: 3.5,
    yieldStrength: 50,
    thermalExpansion: 41.0e-6
  },
  
  ABS: {
    name: 'ABS (Acrylonitrile Butadiene Styrene)',
    density: 1050,
    youngModulus: 2.3,
    yieldStrength: 40,
    thermalExpansion: 72.0e-6
  },
  
  PETG: {
    name: 'PETG',
    density: 1270,
    youngModulus: 2.2,
    yieldStrength: 55,
    thermalExpansion: 65.0e-6
  },
  
  // Engineering plastics
  NYLON6: {
    name: 'Nylon 6',
    density: 1130,
    youngModulus: 3.0,
    yieldStrength: 85,
    thermalExpansion: 80.0e-6
  },
  
  PEEK: {
    name: 'PEEK',
    density: 1320,
    youngModulus: 4.0,
    yieldStrength: 170,
    thermalExpansion: 47.0e-6
  }
};

/**
 * Gets bearing specification by designation
 */
export function getBearing(designation: string): BearingSpec | undefined {
  return STANDARD_BEARINGS[designation];
}

/**
 * Gets thread specification by designation
 */
export function getThread(designation: string): ThreadSpec | undefined {
  return STANDARD_THREADS[designation];
}

/**
 * Gets material properties by name
 */
export function getMaterial(name: string): MaterialProperties | undefined {
  return ENGINEERING_MATERIALS[name];
}

/**
 * Calculates appropriate thread engagement length
 * Generally 1.5-2.0 times the major diameter for steel
 */
export function calculateThreadEngagement(
  thread: ThreadSpec,
  material: MaterialProperties
): number {
  // Base engagement = 1.5 × major diameter
  let engagement = thread.major * 1.5;
  
  // Adjust based on material strength
  if (material.yieldStrength < 100) {
    // Weaker materials need more engagement
    engagement *= 1.5;
  } else if (material.yieldStrength > 500) {
    // Stronger materials can use less engagement
    engagement *= 0.8;
  }
  
  // Minimum engagement should be at least 3 thread pitches
  const minEngagement = thread.pitch * 3;
  
  return Math.max(engagement, minEngagement);
}