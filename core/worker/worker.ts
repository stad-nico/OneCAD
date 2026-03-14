import openCascade, { OpenCascadeInstance } from 'opencascade.js/dist/opencascade.full.js';
import openCascadeWasm from 'opencascade.js/dist/opencascade.full.wasm?url';

let oc: OpenCascadeInstance | null = null;
const shapeMap: Map<string, any> = new Map();

async function initOcc() {
  return await openCascade({ locateFile: () => openCascadeWasm });
}

async function ensureKernelReady() {
  if (oc) return;
  const now = Date.now();
  console.log(`[Worker] Starting OpenCascade Init at ${now}`);
  oc = await initOcc();
  console.log(`[Worker] Init took ${Date.now() - now}ms`);
}

self.onmessage = async (e: MessageEvent) => {
  const { type, id, payload } = e.data;
  console.log('[Worker] message', type, id, payload);

  if (type === 'INIT') {
    try {
      await ensureKernelReady();
      self.postMessage({ type: 'INIT_DONE', id });
    } catch (error: any) {
      console.error('[Worker] INIT error', error);
      self.postMessage({
        type: 'ERROR',
        id,
        error: error?.message || 'Worker initialization error',
      });
    }
    return;
  }

  // All other commands require kernel
  try {
    await ensureKernelReady();
  } catch (error: any) {
    self.postMessage({
      type: 'ERROR',
      id,
      error: error?.message || 'Kernel not initialized',
    });
    return;
  }

  if (type === 'CREATE_BOX') {
    const { width, height, depth } = payload;
    try {
      const maker = new oc!.BRepPrimAPI_MakeBox_2(width, height, depth);
      const shape = maker.Shape();
      const shapeId = `shape_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      shapeMap.set(shapeId, shape);
      self.postMessage({ type: 'CREATE_BOX_DONE', id, result: shapeId });
    } catch (error: any) {
      self.postMessage({
        type: 'ERROR',
        id,
        error: error?.message || 'Error creating box',
      });
    }
  } else if (type === 'TRIANGULATE') {
    const { shapeId } = payload;
    const shape = shapeMap.get(shapeId);
    if (!shape) {
      self.postMessage({ type: 'ERROR', id, error: 'Shape not found' });
      return;
    }

    try {
      // Use a small positive deflection; -1 is invalid and causes WASM errors
      const linearDeflection = 0.5;
      new oc!.BRepMesh_IncrementalMesh_2(shape, linearDeflection, false, 0.5, true);
      const G_BRepTools_Clean = () => {};
      const loc = new oc!.TopLoc_Location_1();
      const explorer = new oc!.TopExp_Explorer_2(
        shape,
        (oc!.TopAbs_ShapeEnum as any).TopAbs_FACE,
        (oc!.TopAbs_ShapeEnum as any).TopAbs_SHAPE
      );
      const vertices: number[] = [];
      const normals: number[] = [];
      const indices: number[] = [];
      let indexOffset = 0;
      while (explorer.More()) {
        const face = oc!.TopoDS.Face_1(explorer.Current());
        const triangulation = oc!.BRep_Tool.Triangulation(face, loc, 0);
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
          const bRepLProp = new oc!.BRepLProp_SLProps_2(
            new oc!.BRepAdaptor_Surface_2(face, false),
            1,
            0.01
          );
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
            if (face.Orientation_1() === (oc!.TopAbs_Orientation as any).TopAbs_REVERSED) {
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
      self.postMessage(
        {
          type: 'TRIANGULATE_DONE',
          id,
          result: {
            vertices: vertexArray,
            normals: floatNormalArray,
            indices: indexArray,
          },
        },
        [vertexArray.buffer, floatNormalArray.buffer, indexArray.buffer] as any
      );
    } catch (error: any) {
      console.error('[Worker] Triangulate Error:', error);
      self.postMessage({
        type: 'ERROR',
        id,
        error: error?.message || String(error) || 'Error executing triangulate',
      });
    }
  }
};
