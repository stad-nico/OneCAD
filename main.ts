import { initializeCore } from './core';
import { Renderer } from './renderer';

const canvas = document.getElementById('scene') as HTMLCanvasElement;

const renderer = new Renderer(canvas);

async function build() {
  console.log('Building model...');

  const { createBoxModel } = await import('./models/box');

  const mesh = await createBoxModel();

  renderer.clear();
  renderer.addMesh(mesh);
  renderer.render();
}

initializeCore().then(() => {
  console.log('Core initialized, building model...');
  build();
});

if (import.meta.hot) {
  import.meta.hot.accept('./models/box', async (newModule) => {
    console.log('Model changed — rebuilding...');

    const mod = newModule ?? (await import('./models/box'));
    const mesh = await mod.createBoxModel();

    renderer.clear();
    renderer.addMesh(mesh);
    renderer.render();
  });
}
