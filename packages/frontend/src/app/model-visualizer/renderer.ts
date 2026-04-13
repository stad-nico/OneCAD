import {
  AmbientLight,
  Color,
  DirectionalLight,
  GridHelper,
  Group,
  MOUSE,
  Mesh,
  Object3D,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MeshVisualization } from '../visualize';

export enum RenderMode {
  Solid = 'solid',
  Transparent = 'transparent',
  Lines = 'lines',
}

interface RendererDimensions {
  width: number;
  height: number;
}

export class Renderer {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  private controls: OrbitControls;
  private ctrlKeyDown = { value: false };
  private renderMode: RenderMode = RenderMode.Solid;
  private visualizations: MeshVisualization[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new Scene();
    const dimensions = this.getCanvasDimensions(canvas);

    this.renderer = this.initializeRenderer(canvas, dimensions);
    this.camera = this.initializeCamera(dimensions);
    this.setupCoordinateSystem();
    this.setupLighting();
    this.setupGrid();
    this.controls = this.setupControls();
    this.setupKeyboardHandling();
    this.animate();
  }

  private getCanvasDimensions(canvas: HTMLCanvasElement): RendererDimensions {
    const rect = canvas.parentElement?.getBoundingClientRect();
    return {
      width: rect?.width || window.innerWidth,
      height: rect?.height || window.innerHeight,
    };
  }

  private initializeRenderer(
    canvas: HTMLCanvasElement,
    dimensions: RendererDimensions,
  ): WebGLRenderer {
    const glRenderer = new WebGLRenderer({ canvas, antialias: true });
    glRenderer.setSize(dimensions.width, dimensions.height);
    glRenderer.setPixelRatio(window.devicePixelRatio);
    return glRenderer;
  }

  private initializeCamera(dimensions: RendererDimensions): PerspectiveCamera {
    const cam = new PerspectiveCamera(75, dimensions.width / dimensions.height, 0.1, 1000);
    cam.position.set(50, 50, 50);
    cam.lookAt(0, 0, 0);
    return cam;
  }

  private setupCoordinateSystem(): void {
    // CAD typically uses Z-up coordinate system
    Object3D.DEFAULT_UP.set(0, 0, 1);
    this.camera.up.set(0, 0, 1);
  }

  private setupLighting(): void {
    // Blender-style lighting setup for better edge visibility
    // Strong ambient light with blue-ish tone (like Blender's world lighting)
    const ambientLight = new AmbientLight(0xb8d4ff, 0.8);
    this.scene.add(ambientLight);

    // Key light (main light) - warm, positioned above and to the side
    const keyLight = new DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(60, 70, 120);
    this.scene.add(keyLight);

    // Rim light (fill light) - cool, from opposite side to create separation
    const rimLight = new DirectionalLight(0x7fa5d4, 1.0);
    rimLight.position.set(-80, -50, 60);
    this.scene.add(rimLight);

    // Back light - subtle, warm accent from below
    const backLight = new DirectionalLight(0xffe8d0, 0.6);
    backLight.position.set(0, -100, 40);
    this.scene.add(backLight);
  }

  private setupGrid(): void {
    const size = 200;
    const divisions = 20;
    // Create a subtle, neutral grid that doesn't compete with the model
    const gridHelper = new GridHelper(size, divisions, 0x6b7280, 0x4b5563);
    gridHelper.rotation.x = Math.PI / 2; // Rotate to XY plane
    gridHelper.position.z = -0.5;
    this.scene.add(gridHelper);
    // Use a sophisticated dark background with a subtle gradient effect
    this.scene.background = new Color(0x0f1419);
  }

  private setupControls(): OrbitControls {
    const orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    orbitControls.enableDamping = false;
    orbitControls.enableZoom = true;
    orbitControls.enablePan = true;
    orbitControls.listenToKeyEvents(window);

    // Configure mouse buttons
    orbitControls.mouseButtons = {
      LEFT: MOUSE.ROTATE,
      MIDDLE: MOUSE.DOLLY,
      RIGHT: MOUSE.ROTATE,
    };

    this.overrideMouseBehavior(orbitControls);
    return orbitControls;
  }

  private setupKeyboardHandling(): void {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Control') this.ctrlKeyDown.value = true;
    });
    window.addEventListener('keyup', (e) => {
      if (e.key === 'Control') this.ctrlKeyDown.value = false;
    });
  }

  private overrideMouseBehavior(controls: OrbitControls): void {
    // Override the internal mouse move handling to conditionally pan when Ctrl is held
    const originalHandleMouseMoveRotate = (controls as any).handleMouseMoveRotate?.bind(controls);
    const originalHandleMouseMovePan = (controls as any).handleMouseMovePan?.bind(controls);

    if (originalHandleMouseMoveRotate && originalHandleMouseMovePan) {
      (controls as any).handleMouseMoveRotate = (event: MouseEvent) => {
        if (this.ctrlKeyDown.value) {
          originalHandleMouseMovePan(event);
        } else {
          originalHandleMouseMoveRotate(event);
        }
      };
    }
  }

  animate = (): void => {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  render(): void {
    // Left empty or keep for forced updates, but animate loop handles it now
  }

  setRenderMode(mode: RenderMode): void {
    this.renderMode = mode;
    this.updateMeshesForMode();
  }

  private updateMeshesForMode(): void {
    for (const visualization of this.visualizations) {
      const { mesh, wireframe } = visualization;

      switch (this.renderMode) {
        case RenderMode.Solid:
          mesh.visible = true;
          mesh.material = this.getSolidMaterial(mesh);
          wireframe.visible = false;
          break;
        case RenderMode.Transparent:
          mesh.visible = true;
          mesh.material = this.getTransparentMaterial(mesh);
          wireframe.visible = true;
          break;
        case RenderMode.Lines:
          mesh.visible = false;
          wireframe.visible = true;
          break;
      }
    }
  }

  private getSolidMaterial(mesh: Mesh) {
    const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    if (material instanceof Mesh) return material.material;
    material.transparent = false;
    material.opacity = 1;
    return material;
  }

  private getTransparentMaterial(mesh: Mesh) {
    const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    if (material instanceof Mesh) return material.material;
    material.transparent = true;
    material.opacity = 0.3;
    return material;
  }

  clear(): void {
    // Remove all meshes from the scene except the grid
    const childrenToRemove = this.scene.children.filter(
      (child): child is Mesh | Group =>
        (child instanceof Mesh || child instanceof Group) && !(child instanceof GridHelper),
    );

    childrenToRemove.forEach((mesh) => {
      this.scene.remove(mesh);
      if (mesh instanceof Mesh && mesh.geometry) mesh.geometry.dispose();
      if (mesh instanceof Mesh && mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((material) => material.dispose());
        } else {
          mesh.material.dispose();
        }
      }
      if (mesh instanceof Group) {
        mesh.children.forEach((child) => {
          if (child instanceof Mesh && child.geometry) child.geometry.dispose();
          if (child instanceof Mesh && child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((material) => material.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }
    });

    this.visualizations = [];
  }

  addVisualization(visualization: MeshVisualization): void {
    this.scene.add(visualization.mesh);
    this.scene.add(visualization.wireframe);
    this.visualizations.push(visualization);
    this.updateMeshesForMode();
  }
}
