# OpenTSCAD

OpenTSCAD is a TypeScript-based CAD playground built on top of OpenCascade running in a Web Worker and rendered with Three.js.

## Architecture Overview

The system is now structured as a **client–server live modeling pipeline** on top of Vite and Angular:

- **Vite + Angular dev server (browser frontend)**
  - Serves the Angular app and Three.js renderer
  - Hosts a custom Vite plugin that receives model updates over WebSockets
  - Runs the CAD pipeline (via the existing Web Worker) and broadcasts mesh results back to the browser via Vite's HMR WebSocket
- **CAD Worker (Web Worker)**
  - Holds the OpenCascade WebAssembly instance
  - Receives high-level CAD `operations[]`
  - Builds shapes and triangulates them into mesh data
- **Model client (Node.js watcher)**
  - Runs as a separate Node process
  - Watches model `.ts` files in your project
  - Sends updated model source code to the Vite dev server over WebSockets

This gives you a fast, HMR-like loop for CAD models: edit a `.ts` model file, and the rendered model in the browser updates automatically without a page reload.

## Live Model Flow

End-to-end, the flow looks like this:

1. **Model Authoring (external project or repo)**
   - You write models as TypeScript modules, e.g. `models/my-model.ts`:

     ```ts
     import { box } from '@opentscad/core';

     export default () => box(20, 10, 5).translate(0, 0, 10);
     ```

   - Each model module must export a **default function** that returns a `Shape` (from `@opentscad/core`). Internally, a `Shape` contains the `operations[]` used by the CAD worker.

2. **Model Client (Node.js watcher)**
   - The file `client.ts` runs in Node, using `chokidar` to watch your model files:
     - Watches `models/**/*.ts` by default (configurable via `MODEL_GLOB`)
     - Connects to the Vite dev server WebSocket (default `ws://localhost:5173`, configurable via `VITE_WS_URL`)
   - On file add/change, it:
     - Reads the file contents
     - Logs via the shared `Logger` at appropriate levels (`info`, `debug`, `warn`, `error`)
     - Sends a JSON message over WebSocket:

       ```ts
       {
         type: 'MODEL_UPDATE',
         file: string; // absolute path to the file
         code: string; // full TypeScript source of the model
       }
       ```

3. **Vite Dev Server + Custom Plugin**
   - The Vite config (`vite.config.js`) stays small and only wires up the Angular plugin and a custom **OpenTSCAD model plugin**:

     ```ts
     import { defineConfig } from 'vite';
     import angular from '@analogjs/vite-plugin-angular';
     import { opentscadModelPlugin } from './vite-plugin-opentscad';

     export default defineConfig({
       plugins: [
         angular({ tsconfig: './angular/tsconfig.app.json' }),
         opentscadModelPlugin(),
       ],
       // ...existing config...
     });
     ```

   - The actual plugin implementation lives in `vite-plugin-opentscad.ts` (TypeScript), keeping the Vite config uncluttered.
   - The plugin hooks into Vite's dev server and its WebSocket server:
     - Listens for raw WebSocket messages from the Node client
     - Parses `MODEL_UPDATE` JSON messages
     - Uses `esbuild.transform` to transpile the incoming TypeScript source to ESM JavaScript:

       ```ts
       await esbuild.transform(code, {
         loader: 'ts',
         format: 'esm',
         target: 'esnext',
       });
       ```

     - Dynamically executes the module via a `data:` URL and `import()`:

       ```ts
       const base64 = Buffer.from(jsCode, 'utf8').toString('base64');
       const url = `data:text/javascript;base64,${base64}`;
       const mod = await import(url);
       const shape = await mod.default();
       ```

     - Expects `default()` to return a `Shape`-like object with an `operations` array.
     - Calls the existing core API `triangulate(shape)`:
       - Under the hood this uses `callWorker(WorkerRequestType.Build, shape.operations)` to talk to the CAD worker
       - The worker builds the OpenCascade shape and triangulates it into typed arrays (vertices, normals, indices)
     - Broadcasts the mesh to all connected Vite HMR clients using a **custom HMR event**:

       ```ts
       server.ws.send({
         type: 'custom',
         event: 'MODEL_RESULT',
         data: {
           mesh: {
             vertices: Float32Array | number[],
             normals: Float32Array | number[] | null,
             indices: Uint32Array | number[] | null,
           },
         },
       });
       ```

     - All of these steps are logged through the shared `Logger` with suitable log levels.

4. **CAD Worker (Web Worker + OpenCascade)**
   - Lives under `core/worker/`.
   - Receives `Build` requests via `callWorker(WorkerRequestType.Build, operations)`.
   - Uses OpenCascade to:
     - Construct the B-Rep shape from the operations
     - Triangulate it (see `triangulate.ts`)
   - Returns a `TriangulationResult`:

     ```ts
     interface TriangulationResult {
       vertices: Float32Array;
       normals: Float32Array;
       indices: Uint32Array;
     }
     ```

   - The worker is initialized only once; subsequent builds reuse the same WebAssembly instance for fast iterations.

5. **Angular Frontend + Three.js Renderer**
   - The Angular app lives under `angular/src/app`.
   - The main visual component is `ModelVisualizerComponent`, which owns a `Renderer` (Three.js wrapper):
     - `Renderer` sets up the scene, camera, lights, grid, and OrbitControls
     - Provides `clear()` and `addMesh(mesh)` methods
   - The component subscribes to the custom Vite HMR event `MODEL_RESULT`:

     ```ts
     if (import.meta && (import.meta as any).hot) {
       (import.meta as any).hot.on('MODEL_RESULT', (payload: any) => {
         this.updateMeshFromWorker(payload.data.mesh);
       });
     }
     ```

   - On `MODEL_RESULT`, it:
     - Clears existing meshes from the scene
     - Reconstructs a `THREE.BufferGeometry` from the raw arrays
     - Builds a `THREE.Mesh` with a neutral material
     - Adds it to the scene via `Renderer.addMesh(mesh)`
   - The render loop is continuous, so updates are visible immediately without reloading the page.

## Running the System

### 1. Start the Vite + Angular dev server

From the project root:

```bash
npm install
npm run dev
```

This starts Vite (default at `http://localhost:5173`) and the Angular frontend. The CAD worker will be initialized in the browser when needed.

### 2. Start the model client (Node.js watcher)

In another terminal, from the project root:

```bash
# Using ts-node (or adjust to your setup)
npx ts-node client.ts
```

Environment variables:

- `VITE_WS_URL` – WebSocket URL for the Vite dev server (default: `ws://localhost:5173`)
- `MODEL_GLOB` – glob pattern for model files (default: `models/**/*.ts`)

### 3. Edit models and see live updates

1. Create or edit a model file, e.g. `models/example.ts`:

   ```ts
   import { box } from '@opentscad/core';

   export default () => box(40, 20, 10).translate(0, 0, 15);
   ```

2. With both the dev server and client running:
   - Saving the file triggers the Node client watcher
   - The client sends a `MODEL_UPDATE` message with the new TypeScript source
   - The Vite plugin transpiles and executes the model, runs the CAD pipeline, and broadcasts `MODEL_RESULT`
   - The Angular frontend receives `MODEL_RESULT`, rebuilds the mesh, and updates the Three.js scene – no page reload required

## Logging

The project uses a shared `Logger` (`core/shared/logger.ts`) across:

- **Model client (Node)** – connection lifecycle, file watch events, send errors
- **Vite plugin (dev server)** – model transpilation, execution, triangulation, broadcast
- **Core/worker APIs** – existing worker communication

Typical levels:

- `Logger.info` – high-level lifecycle events (connections, successful updates)
- `Logger.debug` – detailed pipeline steps (transpilation, execution, triangulation)
- `Logger.warn` – recoverable issues (WebSocket not open, closed connections)
- `Logger.error` – failures (file I/O issues, transpile/execute errors, worker errors)

This structured logging makes it easy to trace a single model update from file change, through the server, into the worker, and out to the browser.

