This directory contains the logic for the core of OpenTSCAD. This core is responsible for the following tasks:

- Exposing a Web Socket server for clients to register to
- Communicate with the connected clients for model updates
- Exposing the OpenTSCAD api types for the clients to build their models
- Evaluating client model files and create a `Shape` to be used by the CAD worker
- Create a Web Worker that runs the OpenCascade instance
- Send shape instructions to the Web Worker to be triangulated into mesh data
- Receive the triangulation results, build a threejs mesh and send the changes to the frontend

The architecture is as follows:

```
|--------------|                       |--------------|                        |--------------|
|              |                       |              |                        |              |
|   Frontend   | <---- Web Socket ---- |     Core     | <---- Web Socket ----> |    Client    |
|              |                       |              |                        |              |
|--------------|                       |--------------|                        |--------------|
                                             ^  |
                                             |  |
                                           Web Worker
                                             |  |
                                             |  v
                                       |--------------|
                                       |              |
                                       |  OpenCascade |
                                       |              |
                                       |--------------|
```

Folder structure:

- `api`: Exposes the OpenTSCAD api. Everything that interacts with OpenTSCAD should only access things from this folder
- `api/operations`: Contains the OpenTSCAD operations that will be used by the clients to build their models
- `worker`: Implementation for the Web Worker that runs the OpenCascade instance
- `worker/operations`: Implementation for the api operations. These process the operation from the api and executes it against the OpenCascade instance
