// Simple callback interface so the UI layer (src/) can visualize
// triangulated meshes produced by the core worker.
export type TriangulatedResult = {
  vertices: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
};

let onTriangulated: ((data: TriangulatedResult) => void) | null = null;

export function registerTriangulatedCallback(cb: (data: TriangulatedResult) => void) {
  onTriangulated = cb;
}

const worker = new Worker(new URL('./cad.worker.ts', import.meta.url), {
  type: 'module',
});

worker.postMessage({ type: 'INIT', id: '1' });

// Request triangulation once the box is created
worker.onmessage = (event) => {
  const { type, id, result } = event.data;

  if (type === 'CREATE_BOX_DONE') {
    const shapeId = result;
    worker.postMessage({
      type: 'TRIANGULATE',
      id: '3',
      payload: { shapeId },
    });
  }

  if (type === 'TRIANGULATE_DONE') {
    if (onTriangulated) {
      onTriangulated(result as TriangulatedResult);
    } else {
      console.log('Triangulated mesh from worker:', result);
    }
  }
};
