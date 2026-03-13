import * as THREE from "three";
import { Kernel } from "./kernel";
import { Renderer } from "./renderer";

const canvas = document.getElementById("scene") as HTMLCanvasElement;

const renderer = new Renderer(canvas);
const kernel = new Kernel();

async function build() {
  await kernel.init();

  const shape = kernel.createBox(20, 20, 20);

  kernel.triangulate(shape);

  // Convert to simple placeholder cube for now
  // (Full triangle extraction can be added next step)

  const geometry = new THREE.BoxGeometry(20, 20, 20);
  const material = new THREE.MeshNormalMaterial();
  const mesh = new THREE.Mesh(geometry, material);

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
