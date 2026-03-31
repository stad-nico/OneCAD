/**
 * Tolerance management system for mechanical parts
 */

import { ToleranceGrade, ToleranceSpec, FitType } from '../types/mechanical.js';

/**
 * ISO tolerance values for different grades (in micrometers)
 * Based on ISO 286-1 standard for basic sizes up to 500mm
 */
const TOLERANCE_VALUES: Record<ToleranceGrade, Record<string, number>> = {
  [ToleranceGrade.H6]: {
    '3-6': 9,
    '6-10': 9,
    '10-18': 11,
    '18-30': 13,
    '30-50': 16,
    '50-80': 19,
    '80-120': 22,
    '120-180': 25
  },
  [ToleranceGrade.H7]: {
    '3-6': 15,
    '6-10': 15,
    '10-18': 18,
    '18-30': 21,
    '30-50': 25,
    '50-80': 30,
    '80-120': 35,
    '120-180': 40
  },
  [ToleranceGrade.H8]: {
    '3-6': 22,
    '6-10': 22,
    '10-18': 27,
    '18-30': 33,
    '30-50': 39,
    '50-80': 46,
    '80-120': 54,
    '120-180': 63
  },
  [ToleranceGrade.H9]: {
    '3-6': 36,
    '6-10': 36,
    '10-18': 43,
    '18-30': 52,
    '30-50': 62,
    '50-80': 74,
    '80-120': 87,
    '120-180': 100
  },
  [ToleranceGrade.H10]: {
    '3-6': 58,
    '6-10': 58,
    '10-18': 70,
    '18-30': 84,
    '30-50': 100,
    '50-80': 120,
    '80-120': 140,
    '120-180': 160
  },
  [ToleranceGrade.H11]: {
    '3-6': 90,
    '6-10': 90,
    '10-18': 110,
    '18-30': 130,
    '30-50': 160,
    '50-80': 190,
    '80-120': 220,
    '120-180': 250
  }
};

/**
 * Gets the size range key for a given dimension
 */
function getSizeRange(size: number): string {
  if (size <= 6) return '3-6';
  if (size <= 10) return '6-10';
  if (size <= 18) return '10-18';
  if (size <= 30) return '18-30';
  if (size <= 50) return '30-50';
  if (size <= 80) return '50-80';
  if (size <= 120) return '80-120';
  if (size <= 180) return '120-180';
  
  // For larger sizes, extrapolate
  return '120-180';
}

/**
 * Calculates tolerance deviation for a given nominal size and grade
 */
export function calculateTolerance(
  nominalSize: number,
  grade: ToleranceGrade
): number {
  const sizeRange = getSizeRange(nominalSize);
  const toleranceValue = TOLERANCE_VALUES[grade][sizeRange] || 0;
  
  // Convert micrometers to millimeters
  return toleranceValue / 1000;
}

/**
 * Applies tolerance to a nominal dimension based on fit type
 */
export function applyTolerance(
  nominalSize: number,
  spec: ToleranceSpec
): { min: number; max: number; nominal: number } {
  const tolerance = calculateTolerance(nominalSize, spec.grade);
  
  switch (spec.fit) {
    case FitType.CLEARANCE:
      // Hole: nominal to nominal + tolerance
      return {
        min: nominalSize,
        max: nominalSize + tolerance,
        nominal: nominalSize
      };
      
    case FitType.TRANSITION:
      // Symmetric tolerance around nominal
      return {
        min: nominalSize - tolerance / 2,
        max: nominalSize + tolerance / 2,
        nominal: nominalSize
      };
      
    case FitType.INTERFERENCE:
      // Hole: nominal - tolerance to nominal
      return {
        min: nominalSize - tolerance,
        max: nominalSize,
        nominal: nominalSize
      };
      
    default:
      return {
        min: nominalSize,
        max: nominalSize + tolerance,
        nominal: nominalSize
      };
  }
}

/**
 * Creates a clearance fit between shaft and hole
 */
export function createClearanceFit(
  nominalSize: number,
  shaftGrade: ToleranceGrade = ToleranceGrade.H7,
  holeGrade: ToleranceGrade = ToleranceGrade.H8
): { shaft: number; hole: number; clearance: { min: number; max: number } } {
  const shaftTolerance = calculateTolerance(nominalSize, shaftGrade);
  const holeTolerance = calculateTolerance(nominalSize, holeGrade);
  
  // Shaft: nominal - tolerance to nominal (shaft fits in hole)
  const shaftSize = nominalSize - shaftTolerance / 2;
  
  // Hole: nominal to nominal + tolerance
  const holeSize = nominalSize + holeTolerance / 2;
  
  return {
    shaft: shaftSize,
    hole: holeSize,
    clearance: {
      min: holeTolerance / 2 + shaftTolerance / 2,  // Minimum clearance
      max: holeTolerance + shaftTolerance           // Maximum clearance
    }
  };
}

/**
 * Standard tolerance grades for different applications
 */
export const STANDARD_FITS = {
  // Precision fits for instruments, gauges
  PRECISION: { shaft: ToleranceGrade.H6, hole: ToleranceGrade.H6 },
  
  // Close running fits for high-quality mechanisms
  CLOSE_RUNNING: { shaft: ToleranceGrade.H7, hole: ToleranceGrade.H7 },
  
  // Medium running fits for general machinery
  MEDIUM_RUNNING: { shaft: ToleranceGrade.H7, hole: ToleranceGrade.H8 },
  
  // Loose running fits for agricultural machinery
  LOOSE_RUNNING: { shaft: ToleranceGrade.H9, hole: ToleranceGrade.H9 },
  
  // Sliding fits for infrequent movement
  SLIDING: { shaft: ToleranceGrade.H7, hole: ToleranceGrade.H8 },
  
  // Locational fits for parts that don't move
  LOCATIONAL: { shaft: ToleranceGrade.H7, hole: ToleranceGrade.H7 }
} as const;