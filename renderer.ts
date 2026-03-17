import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class Renderer {
  scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;

  constructor(canvas: HTMLCanvasElement) {
    this.scene.background = new THREE.Color(0x000000); // Black background

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Initial camera position
    this.camera.position.set(50, 50, 50);
    this.camera.lookAt(0, 0, 0);

    // Actually, typical CAD is Z-up. Let's make the scene Z-up.
    THREE.Object3D.DEFAULT_UP.set(0, 0, 1);
    this.camera.up.set(0, 0, 1);

    // Add grid helper (XY plane / Ground)
    const size = 200;
    const divisions = 20;
    const zUpGridHelper = new THREE.GridHelper(size, divisions, 0xffffff, 0xffffff);
    zUpGridHelper.rotation.x = Math.PI / 2; // Grid is primarily in XZ, rotate to XY
    this.scene.add(zUpGridHelper);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040, 2.0); // Soft white light
    this.scene.add(ambientLight);

    const light1 = new THREE.DirectionalLight(0xffffff, 1.5);
    light1.position.set(100, 100, 100);
    this.scene.add(light1);

    const light2 = new THREE.DirectionalLight(0xffffff, 1);
    light2.position.set(-100, -100, 100);
    this.scene.add(light2);

    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this), false);

    // Create controls (must be after camera and renderer are created)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = false; // disable damping so motion stops immediately

    // Zoom
    this.controls.enableZoom = true;

    // Pan only when Ctrl is pressed
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE,
    };
    this.controls.enablePan = true;

    // Custom pan condition: only when Ctrl is held
    this.controls.listenToKeyEvents(window);

    const ctrlKeyDown = { value: false };
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Control') ctrlKeyDown.value = true;
    });
    window.addEventListener('keyup', (e) => {
      if (e.key === 'Control') ctrlKeyDown.value = false;
    });

    // Override the internal mouse move handling for panning conditionally
    const originalHandleMouseMoveRotate = (this.controls as any).handleMouseMoveRotate?.bind(
      this.controls
    );
    const originalHandleMouseMovePan = (this.controls as any).handleMouseMovePan?.bind(
      this.controls
    );

    if (originalHandleMouseMoveRotate && originalHandleMouseMovePan) {
      (this.controls as any).handleMouseMoveRotate = function (event: MouseEvent) {
        if (ctrlKeyDown.value) {
          originalHandleMouseMovePan(event);
        } else {
          originalHandleMouseMoveRotate(event);
        }
      };
    }

    // Start render loop
    this.animate();
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  render() {
    // Left empty or keep for forced updates, but animate loop handles it now
  }

  clear() {
    // Recreate scene and keep lights and grid
    const childrenToRemove = this.scene.children.filter(
      (child) => child instanceof THREE.Mesh && !(child instanceof THREE.GridHelper)
    );

    childrenToRemove.forEach((child) => {
      this.scene.remove(child);
      if (child instanceof THREE.Mesh) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
    });
  }

  addMesh(mesh: THREE.Mesh) {
    this.scene.add(mesh);
  }
}
