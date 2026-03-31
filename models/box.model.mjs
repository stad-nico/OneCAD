// core/api/api.ts
function modelMetadata(model2) {
}

// core/shape/shape.ts
var Shape = class _Shape {
  operations;
  constructor(operations) {
    this.operations = operations;
  }
  translate(x, y, z) {
    return new _Shape([...this.operations, { type: "translate" /* Translate */, parameters: { x, y, z } }]);
  }
};

// core/api/operations/primitives/box.ts
function box(width, height, depth) {
  return new Shape([{ type: "box" /* Box */, parameters: { width, height, depth } }]);
}

// models/box.model.ts
var model = modelMetadata({
  name: "Box",
  description: "A simple box shape."
});
function createBoxModel() {
  const shape = box(10, 10, 20).translate(0, 0, 0);
  return shape;
}
export {
  createBoxModel as default,
  model
};
