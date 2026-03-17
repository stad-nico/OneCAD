import { OpenCascadeInstance, TopoDS_Shape } from 'opencascade.js';

export interface TriangulationResult {
  vertices: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
}

export function triangulate(oc: OpenCascadeInstance, shape: TopoDS_Shape): TriangulationResult {
  // Use a small positive deflection; -1 is invalid and causes WASM errors
  const linearDeflection = 0.5;
  new oc.BRepMesh_IncrementalMesh_2(shape, linearDeflection, false, 0.5, true);
  const loc = new oc.TopLoc_Location_1();
  const explorer = new oc.TopExp_Explorer_2(
    shape,
    (oc.TopAbs_ShapeEnum as any).TopAbs_FACE,
    (oc.TopAbs_ShapeEnum as any).TopAbs_SHAPE
  );
  const vertices: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  let indexOffset = 0;
  while (explorer.More()) {
    const face = oc.TopoDS.Face_1(explorer.Current());
    const triangulation = oc.BRep_Tool.Triangulation(face, loc, 0);
    if (!triangulation.IsNull()) {
      const tr = triangulation.get();
      const numNodes = tr.NbNodes();
      const numTriangles = tr.NbTriangles();
      for (let i = 1; i <= numNodes; i++) {
        const p = tr.Node(i);
        const pt = p.Transformed(loc.Transformation());
        vertices.push(pt.X(), pt.Y(), pt.Z());
        p.delete();
        pt.delete();
      }
      let hasNormals = false;
      if (tr.HasNormals()) {
        hasNormals = true;
        for (let i = 1; i <= numNodes; i++) {
          const normal = new oc!.gp_Dir_1();
          tr.Normal(i, normal);
          normals.push(normal.X(), normal.Y(), normal.Z());
          normal.delete();
        }
      }
      for (let i = 1; i <= numTriangles; i++) {
        const tri = tr.Triangle(i);
        const v1 = tri.Value(1);
        const v2 = tri.Value(2);
        const v3 = tri.Value(3);
        if (face.Orientation_1() === (oc.TopAbs_Orientation as any).TopAbs_REVERSED) {
          indices.push(indexOffset + v1 - 1, indexOffset + v3 - 1, indexOffset + v2 - 1);
        } else {
          indices.push(indexOffset + v1 - 1, indexOffset + v2 - 1, indexOffset + v3 - 1);
        }
        tri.delete();
      }
      if (!hasNormals) {
        for (let i = 0; i < numNodes; i++) normals.push(0, 1, 0);
      }
      indexOffset += numNodes;
    }
    face.delete();
    explorer.Next();
  }
  explorer.delete();
  loc.delete();
  const vertexArray = new Float32Array(vertices);
  const floatNormalArray = new Float32Array(normals);
  const indexArray = new Uint32Array(indices);

  return { vertices: vertexArray, normals: floatNormalArray, indices: indexArray };
}
