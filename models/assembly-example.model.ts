import {
  Assembly,
  assembly,
  box,
  cylinder,
  difference,
} from "./../packages/types/src";
/**
 * Creates an assembly with multiple parts positioned in 3D space.
 *
 * This example demonstrates:
 * - Creating a base plate
 * - Adding positioned spheres and cylinder
 * - Creating a part with boolean operations (plated hole)
 * - Combining everything in an assembly
 */
export default function createModel(): Assembly {
  // Base plate
  const basePlate = box(100, 100, 20).translate(0, 100, 0);

  // A cylinder positioned to the right
  const cylinder1 = cylinder(8, 30).translate(40, 0, 15).translate(0, 200, 0);

  // A more complex part: box with a hole drilled throuit
  const plateWithHole = difference(
    box(50, 50, 20),
    cylinder(10, 25).translate(0, 0, -2.5),
  ).translate(0, -100, 0);

  const assem = assembly("fer");

  assem.placeComponent(basePlate);
  assem.placeComponent(cylinder1);
  assem.placeComponent(plateWithHole);

  return assem;
}
