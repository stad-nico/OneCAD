/**
 * Molecular and chemical structure models
 */

import { sphere, cylinder, union } from '@opentscad/core';

/**
 * Atomic properties and colors
 */
export const ATOMIC_DATA = {
  H: { radius: 0.31, color: 'white', name: 'Hydrogen' },
  C: { radius: 0.70, color: 'black', name: 'Carbon' },
  N: { radius: 0.65, color: 'blue', name: 'Nitrogen' },
  O: { radius: 0.60, color: 'red', name: 'Oxygen' },
  F: { radius: 0.57, color: 'green', name: 'Fluorine' },
  P: { radius: 1.07, color: 'orange', name: 'Phosphorus' },
  S: { radius: 1.05, color: 'yellow', name: 'Sulfur' },
  Cl: { radius: 0.99, color: 'lightgreen', name: 'Chlorine' },
  Na: { radius: 1.86, color: 'purple', name: 'Sodium' },
  Mg: { radius: 1.61, color: 'lightgray', name: 'Magnesium' },
  Si: { radius: 1.11, color: 'darkgray', name: 'Silicon' },
  Ca: { radius: 1.97, color: 'darkgreen', name: 'Calcium' }
} as const;

/**
 * Bond types and properties
 */
export const BOND_DATA = {
  SINGLE: { radius: 0.05, color: 'gray', length: 1.54 },
  DOUBLE: { radius: 0.07, color: 'darkgray', length: 1.34 },
  TRIPLE: { radius: 0.09, color: 'black', length: 1.20 },
  IONIC: { radius: 0.03, color: 'lightblue', length: 2.0 }
} as const;

/**
 * Creates an atom with specified element and position
 */
export function createAtom(
  element: keyof typeof ATOMIC_DATA,
  position: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }
): any {
  const atomData = ATOMIC_DATA[element];
  
  return sphere(atomData.radius).translate(position.x, position.y, position.z);
}

/**
 * Creates a bond between two positions
 */
export function createBond(
  from: { x: number; y: number; z: number },
  to: { x: number; y: number; z: number },
  bondType: keyof typeof BOND_DATA = 'SINGLE'
): any {
  const bondData = BOND_DATA[bondType];
  
  // Calculate bond vector
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dz = to.z - from.z;
  const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
  
  // Create bond cylinder
  const bond = cylinder(bondData.radius, length);
  
  // Calculate rotation to align with bond direction
  const theta = Math.atan2(dy, dx);
  const phi = Math.acos(dz / length);
  
  return bond
    .rotateY(phi)
    .rotateZ(theta)
    .translate({
      x: (from.x + to.x) / 2,
      y: (from.y + to.y) / 2,
      z: (from.z + to.z) / 2
    });
}

/**
 * Creates a water molecule (H₂O)
 */
export function createWaterMolecule(): any {
  // Oxygen at center
  const oxygen = createAtom('O', { x: 0, y: 0, z: 0 });
  
  // Hydrogen atoms at 104.5° angle
  const bondLength = 0.96;
  const angle = 104.5 * Math.PI / 180 / 2; // Half angle from vertical
  
  const hydrogen1 = createAtom('H', {
    x: bondLength * Math.sin(angle),
    y: 0,
    z: bondLength * Math.cos(angle)
  });
  
  const hydrogen2 = createAtom('H', {
    x: -bondLength * Math.sin(angle),
    y: 0,
    z: bondLength * Math.cos(angle)
  });
  
  // O-H bonds
  const bond1 = createBond(
    { x: 0, y: 0, z: 0 },
    { x: bondLength * Math.sin(angle), y: 0, z: bondLength * Math.cos(angle) }
  );
  
  const bond2 = createBond(
    { x: 0, y: 0, z: 0 },
    { x: -bondLength * Math.sin(angle), y: 0, z: bondLength * Math.cos(angle) }
  );
  
  return union([oxygen, hydrogen1, hydrogen2, bond1, bond2]);
}

/**
 * Creates a methane molecule (CH₄)
 */
export function createMethaneMolecule(): any {
  // Carbon at center
  const carbon = createAtom('C', { x: 0, y: 0, z: 0 });
  
  // Tetrahedral geometry
  const bondLength = 1.09;
  const tetraAngle = Math.acos(-1/3); // ~109.47°
  
  // Hydrogen positions (tetrahedral)
  const h1 = createAtom('H', {
    x: bondLength,
    y: 0,
    z: 0
  });
  
  const h2 = createAtom('H', {
    x: -bondLength / 3,
    y: bondLength * Math.sqrt(8/9),
    z: 0
  });
  
  const h3 = createAtom('H', {
    x: -bondLength / 3,
    y: -bondLength * Math.sqrt(2/9),
    z: bondLength * Math.sqrt(2/3)
  });
  
  const h4 = createAtom('H', {
    x: -bondLength / 3,
    y: -bondLength * Math.sqrt(2/9),
    z: -bondLength * Math.sqrt(2/3)
  });
  
  // C-H bonds
  const bonds = [
    createBond({ x: 0, y: 0, z: 0 }, { x: bondLength, y: 0, z: 0 }),
    createBond({ x: 0, y: 0, z: 0 }, { x: -bondLength / 3, y: bondLength * Math.sqrt(8/9), z: 0 }),
    createBond({ x: 0, y: 0, z: 0 }, { x: -bondLength / 3, y: -bondLength * Math.sqrt(2/9), z: bondLength * Math.sqrt(2/3) }),
    createBond({ x: 0, y: 0, z: 0 }, { x: -bondLength / 3, y: -bondLength * Math.sqrt(2/9), z: -bondLength * Math.sqrt(2/3) })
  ];
  
  return union([carbon, h1, h2, h3, h4, ...bonds]);
}

/**
 * Creates a benzene ring (C₆H₆)
 */
export function createBenzeneRing(): any {
  const ringRadius = 1.4;
  const atoms: any[] = [];
  const bonds: any[] = [];
  
  // Create carbon ring
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const x = ringRadius * Math.cos(angle);
    const y = ringRadius * Math.sin(angle);
    
    // Carbon atom
    atoms.push(createAtom('C', { x, y, z: 0 }));
    
    // Hydrogen atom
    const hx = x * 1.3;
    const hy = y * 1.3;
    atoms.push(createAtom('H', { x: hx, y: hy, z: 0 }));
    
    // C-H bond
    bonds.push(createBond({ x, y, z: 0 }, { x: hx, y: hy, z: 0 }));
    
    // C-C bonds (ring)
    const nextAngle = ((i + 1) % 6 * Math.PI) / 3;
    const nextX = ringRadius * Math.cos(nextAngle);
    const nextY = ringRadius * Math.sin(nextAngle);
    
    bonds.push(createBond(
      { x, y, z: 0 },
      { x: nextX, y: nextY, z: 0 },
      i % 2 === 0 ? 'DOUBLE' : 'SINGLE' // Alternating double bonds
    ));
  }
  
  return union([...atoms, ...bonds]);
}

/**
 * Creates a DNA double helix structure (simplified)
 */
export function createDNAHelix(
  length: number = 20,
  turns: number = 2
): any {
  const helixRadius = 1.0;
  const baseSpacing = 0.34; // nm between base pairs
  const basesPerTurn = 10.5;
  
  const atoms: any[] = [];
  const bonds: any[] = [];
  
  const steps = Math.floor(length / baseSpacing);
  
  for (let i = 0; i < steps; i++) {
    const z = i * baseSpacing;
    const angle = (i / basesPerTurn) * 2 * Math.PI;
    
    // Backbone atoms (simplified as phosphorus)
    const backbone1 = createAtom('P', {
      x: helixRadius * Math.cos(angle),
      y: helixRadius * Math.sin(angle),
      z: z
    });
    
    const backbone2 = createAtom('P', {
      x: helixRadius * Math.cos(angle + Math.PI),
      y: helixRadius * Math.sin(angle + Math.PI),
      z: z
    });
    
    atoms.push(backbone1, backbone2);
    
    // Base pair connection (simplified)
    bonds.push(createBond(
      {
        x: helixRadius * Math.cos(angle),
        y: helixRadius * Math.sin(angle),
        z: z
      },
      {
        x: helixRadius * Math.cos(angle + Math.PI),
        y: helixRadius * Math.sin(angle + Math.PI),
        z: z
      }
    ));
    
    // Connect backbone (simplified)
    if (i > 0) {
      const prevAngle = ((i - 1) / basesPerTurn) * 2 * Math.PI;
      bonds.push(createBond(
        {
          x: helixRadius * Math.cos(prevAngle),
          y: helixRadius * Math.sin(prevAngle),
          z: (i - 1) * baseSpacing
        },
        {
          x: helixRadius * Math.cos(angle),
          y: helixRadius * Math.sin(angle),
          z: z
        }
      ));
    }
  }
  
  return union([...atoms, ...bonds]);
}

/**
 * Creates a cubic crystal lattice
 */
export function createCubicLattice(
  size: number = 4,
  spacing: number = 2,
  element: keyof typeof ATOMIC_DATA = 'Na'
): any {
  const atoms: any[] = [];
  
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      for (let z = 0; z < size; z++) {
        atoms.push(createAtom(element, {
          x: x * spacing,
          y: y * spacing,
          z: z * spacing
        }));
      }
    }
  }
  
  return union(atoms);
}

/**
 * Main function showcasing molecular structures
 */
export default function main() {
  // Water molecule
  const water = createWaterMolecule()
    .translate({ x: -15, y: 0, z: 0 });
  
  // Methane molecule
  const methane = createMethaneMolecule()
    .translate({ x: -10, y: 0, z: 0 });
  
  // Benzene ring
  const benzene = createBenzeneRing()
    .translate({ x: -5, y: 0, z: 0 });
  
  // DNA helix
  const dna = createDNAHelix(15, 1.5)
    .translate({ x: 0, y: 0, z: 0 });
  
  // Crystal lattice
  const crystal = createCubicLattice(3, 1.5, 'Na')
    .translate({ x: 8, y: 0, z: 0 });
  
  return union([
    water,
    methane,
    benzene,
    dna,
    crystal
  ]);
}