// core/api/api.ts
import * as THREE from "three";

// core/api/shape.ts
var Shape = class _Shape {
  operations;
  constructor(operations) {
    this.operations = operations;
  }
  translate(x, y, z) {
    return new _Shape([...this.operations, { type: "translate" /* Translate */, parameters: { x, y, z } }]);
  }
};

// core/api/primitives.ts
function box(width, height, depth) {
  return new Shape([{ type: "box" /* Box */, parameters: { width, height, depth } }]);
}

// models/box.model.ts
function createBoxModel() {
  const shape = box(10, 10, 20).translate(0, 0, 0);
  return shape;
}
export {
  createBoxModel as default
};
