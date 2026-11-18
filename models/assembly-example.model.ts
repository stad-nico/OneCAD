import { ModelMetadata, Shape, box, cylinder, difference, union } from '../packages/types';

export const metadata: ModelMetadata = {
  name: 'Assembly Example',
  description: 'An example model showcasing a simple assembly of multiple shapes.',
  showIntermediateSteps: false,
};

export default function createModel(): Shape {
  const basePlate = box(10, 100, 20).translate(0, 100, 0);

  const cylinder1 = cylinder(8, 30).translate(40, 0, 15).translate(0, 200, 0);

  const plateWithHole = difference(box(50, 50, 20), cylinder(10, 25).translate(0, 0, -2.5)).translate(0, -100, 0);

  return union(basePlate, cylinder1, plateWithHole);
}
