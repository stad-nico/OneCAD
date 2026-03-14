export const API_VERSION = "0.1.0";

// Public, high-level API for core primitives.
// For now we only expose a single primitive: box(w, h, d).

export type ShapeHandle = string; // worker-side shape id

// Single, long-lived worker managed by the API layer
const worker = new Worker(new URL("../worker/worker.ts", import.meta.url), {
  type: "module",
});

// Internal request id counter
let nextId = 1;

function getNextId(): string {
  return String(nextId++);
}

// Pending promise resolvers, keyed by id
const pending = new Map<
  string,
  {
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
  }
>();

worker.onmessage = (event: MessageEvent) => {
  const { type, id, result, error } = event.data;
  if (!id) return;

  const entry = pending.get(String(id));
  if (!entry) return;

  pending.delete(String(id));

  if (type === "ERROR" || error) {
    entry.reject(new Error(error || "Worker error"));
  } else {
    entry.resolve({ type, result });
  }
};

function callWorker(message: any): Promise<any> {
  const id = message.id ?? getNextId();
  message.id = id;

  return new Promise((resolve, reject) => {
    pending.set(String(id), { resolve, reject });
    worker.postMessage(message);
  });
}

/**
 * High-level API: create a box solid.
 * Returns a handle (shape id) used for further operations (e.g. triangulation).
 */
export async function box(
  w: number,
  h: number,
  d: number,
): Promise<ShapeHandle> {
  // Ensure kernel is initialized, but be tolerant if INIT is called multiple times.
  await callWorker({ type: "INIT" });

  const { result } = await callWorker({
    type: "CREATE_BOX",
    payload: { width: w, height: h, depth: d },
  });

  return result as ShapeHandle;
}

/**
 * Triangulate any shape handle using the worker.
 * Returns the raw buffers as produced by TRIANGULATE_DONE.
 */
export async function triangulate(
  shape: ShapeHandle,
): Promise<{
  vertices: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
}> {
  const { result } = await callWorker({
    type: "TRIANGULATE",
    payload: { shapeId: shape },
  });
  return result as {
    vertices: Float32Array;
    normals: Float32Array;
    indices: Uint32Array;
  };
}
