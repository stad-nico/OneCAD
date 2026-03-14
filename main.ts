import { initKernel, onKernelInitialized } from './core/api/api';
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

// Kick off kernel init and, once ready, build the model
initKernel().catch((err) => console.error('Kernel init failed', err));
onKernelInitialized(() => {
  console.log('Kernel initialized, building first model');
  build().catch((err) => console.error('Build failed', err));
});

/**
 * 🔥 HMR Hook
 */
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
