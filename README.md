# Architecture

We use OpenCascadejs for the kernel. For this, we load the
OpenCascade (OC) WebAssembly file in the browser. This file is quite huge,
so we extract this whole loading process into a web worker.
All future requests to OC will be sent to this worker.
This functionality (the initialization of OC and sending all requests to the worker and building a interface on top of that)
will be implemented in the `core`. We use Vite for bundling here.
Also we will implement HMR for the model files that lateron use this interface api to build 3d models
so that we only have to reload those model files and not the whole website/core which would 
reinitialize OC which takes long (~10 sec).

On top of that an angular ui will be built which will be the frontend for the website.

