/**
 * Design parameters for the advanced project
 * Centralized configuration for all components
 */

export interface HousingParams {
  readonly width: number;
  readonly height: number;
  readonly depth: number;
  readonly wallThickness: number;
  readonly cornerRadius: number;
}

export interface MechanicalParams {
  readonly shaftDiameter: number;
  readonly bearingDiameter: number;
  readonly gearRatio: number;
  readonly moduleSize: number;
}

export interface AssemblyParams {
  readonly housing: HousingParams;
  readonly mechanical: MechanicalParams;
  readonly clearance: number;
  readonly tolerance: number;
}

// Default parameters
export const defaultParams: AssemblyParams = {
  housing: {
    width: 60,
    height: 40,
    depth: 25,
    wallThickness: 2.5,
    cornerRadius: 3
  },
  mechanical: {
    shaftDiameter: 8,
    bearingDiameter: 22,
    gearRatio: 3,
    moduleSize: 1.5
  },
  clearance: 0.5,
  tolerance: 0.1
} as const;