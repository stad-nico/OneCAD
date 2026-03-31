/**
 * Utility functions for common modeling operations
 */

import type { Maybe } from '@opentscad/core';

/**
 * Creates a rounded rectangle profile
 */
export function roundedRect(width: number, height: number, radius: number): Maybe<any> {
  // Implementation would depend on the actual OpenTSCAD API
  // This is a placeholder showing the pattern
  return undefined;
}

/**
 * Distributes objects in a circular pattern
 */
export function circularArray<T>(
  object: T, 
  count: number, 
  radius: number
): T[] {
  const objects: T[] = [];
  const angleStep = (2 * Math.PI) / count;
  
  for (let i = 0; i < count; i++) {
    const angle = i * angleStep;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    // This would need to be adapted to the actual transform API
    objects.push(object);
  }
  
  return objects;
}

/**
 * Linear interpolation between two values
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Clamps a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Converts degrees to radians
 */
export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Converts radians to degrees
 */
export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}