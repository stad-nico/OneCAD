/**
 * Type definitions for mechanical components
 */

export interface BearingSpec {
  readonly inner: number;    // Inner diameter (mm)
  readonly outer: number;    // Outer diameter (mm) 
  readonly width: number;    // Width (mm)
  readonly designation: string; // ISO designation
}

export interface ThreadSpec {
  readonly pitch: number;    // Thread pitch (mm)
  readonly major: number;    // Major diameter (mm)
  readonly minor: number;    // Minor diameter (mm)
  readonly designation: string; // e.g., "M8x1.25"
}

export interface ToleranceSpec {
  readonly grade: ToleranceGrade;
  readonly deviation: number; // Tolerance value (mm)
  readonly fit: FitType;
}

export enum ToleranceGrade {
  H6 = 'H6',
  H7 = 'H7', 
  H8 = 'H8',
  H9 = 'H9',
  H10 = 'H10',
  H11 = 'H11'
}

export enum FitType {
  CLEARANCE = 'clearance',
  TRANSITION = 'transition', 
  INTERFERENCE = 'interference'
}

export interface GearParams {
  readonly module: number;        // Gear module (mm)
  readonly teeth: number;         // Number of teeth
  readonly pressureAngle: number; // Pressure angle (degrees)
  readonly addendum: number;      // Addendum coefficient
  readonly dedendum: number;      // Dedendum coefficient
  readonly toothWidth: number;    // Face width (mm)
}

export interface MaterialProperties {
  readonly density: number;       // kg/m³
  readonly youngModulus: number;  // GPa
  readonly yieldStrength: number; // MPa
  readonly thermalExpansion: number; // 1/K
  readonly name: string;
}

export interface ManufacturingConstraints {
  readonly minWallThickness: number;  // mm
  readonly maxOverhang: number;       // degrees
  readonly supportRequired: boolean;
  readonly minHoleSize: number;       // mm
  readonly surfaceFinish: string;     // Ra value
}