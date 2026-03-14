export type ShapeHandle = string; // worker-side shape id

const worker = new Worker(new URL('../worker/worker.ts', import.meta.url), {
  type: 'module',
});

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

let initListeners: Array<() => void> = [];
let initDone = false;

export function onKernelInitialized(cb: () => void) {
  if (initDone) {
    cb();
  } else {
    initListeners.push(cb);
  }
}

function notifyInitDone() {
  initDone = true;
  for (const cb of initListeners) cb();
  initListeners = [];
}

worker.onmessage = (event: MessageEvent) => {
  console.log('[core/api] got message', event.data);
  const { type, id, result, error } = event.data;

  if (type === 'INIT_DONE') {
    console.log('[core/api] INIT_DONE received');
    notifyInitDone();
  }

  if (!id) return;

  const entry = pending.get(String(id));
  if (!entry) return;

  pending.delete(String(id));

  if (type === 'ERROR' || error) {
    entry.reject(new Error(error || 'Worker error'));
  } else {
    entry.resolve({ type, result });
  }
};

function callWorker(message: any): Promise<any> {
  const id = message.id ?? getNextId();
  message.id = id;

  console.log('[core/api] posting', message);

  return new Promise((resolve, reject) => {
    pending.set(String(id), { resolve, reject });
    worker.postMessage(message);
  });
}

// public API

export async function initKernel(): Promise<void> {
  if (initDone) return; // already initialized
  await callWorker({ type: 'INIT' });
}

export async function box(w: number, h: number, d: number): Promise<ShapeHandle> {
  console.log('[core/api] box called with', w, h, d);
  const { result } = await callWorker({
    type: 'CREATE_BOX',
    payload: { width: w, height: h, depth: d },
  });

  return result as ShapeHandle;
}

/**
 * Triangulate any shape handle using the worker.
 * Returns the raw buffers as produced by TRIANGULATE_DONE.
 */
export async function triangulate(shape: ShapeHandle): Promise<{
  vertices: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
}> {
  const { result } = await callWorker({
    type: 'TRIANGULATE',
    payload: { shapeId: shape },
  });
  return result as {
    vertices: Float32Array;
    normals: Float32Array;
    indices: Uint32Array;
  };
}
