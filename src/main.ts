import { createBoxModel } from "../models/box";
import { Renderer } from "./renderer";

const canvas = document.getElementById("scene") as HTMLCanvasElement;

const renderer = new Renderer(canvas);

async function build() {
  const mesh = await createBoxModel(10, 10, 10);

  renderer.clear();
  renderer.addMesh(mesh);
  renderer.render();
}

build();

// Hot Reload Support
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    build();
  });
}
