// ! TODO: refactor !
// @ts-nocheck
import {
  AmbientLight,
  Color,
  DirectionalLight,
  GridHelper,
  Group,
  LineSegments,
  MOUSE,
  Mesh,
  Object3D,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LINES_ONLY_MATERIAL } from '../../utils/visualize';

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
  private visualizations: AssemblyVisualization[] = [];

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

  private initializeRenderer(canvas: HTMLCanvasElement, dimensions: RendererDimensions): WebGLRenderer {
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
      const { mesh } = visualization;

      switch (this.renderMode) {
        case RenderMode.Solid:
          if (mesh) {
            mesh.visible = true;
          }
          // this.setMeshMaterial(meshGroup);

          // if (wireframe) {
          //   wireframe.visible = false;
          // }
          break;
        case RenderMode.Transparent:
          if (mesh) {
            mesh.visible = true;
          }
          // this.setMeshMaterial(meshGroup, this.getTransparentMaterial());
          // if (wireframe) {
          //   wireframe.visible = true;
          // }
          // this.setWireframeMaterial(wireframe, this.getWireframeMaterialForMode(false));
          break;
        case RenderMode.Lines:
          if (mesh) {
            mesh.visible = false;
          }
          // if (wireframe) {
          //   wireframe.visible = true;
          // }
          // this.setWireframeMaterial(wireframe, this.getWireframeMaterialForMode(true));
          break;
      }
    }
  }

  private setMeshMaterial(object: Mesh | Group, material: any): void {
    if (object instanceof Mesh) {
      object.material = material;
    } else if (object instanceof Group) {
      object.children.forEach((child) => {
        if (child instanceof Mesh) {
          child.material = material;
        }
      });
    }
  }

  private setWireframeMaterial(object: LineSegments | Group, material: any): void {
    if (object instanceof LineSegments) {
      object.material = material;
    } else if (object instanceof Group) {
      object.children.forEach((child) => {
        if (child instanceof LineSegments) {
          child.material = material;
        }
      });
    }
  }

  private getWireframeMaterialForMode(isLinesOnly: boolean) {
    return isLinesOnly ? LINES_ONLY_MATERIAL : LINES_ONLY_MATERIAL;
  }

  private getSolidMaterial() {
    // Return a solid material - this will be cloned for each mesh
    // return this.visualizations[0]?.meshGroup instanceof Group
    //   ? this.visualizations[0].meshGroup.children[0].material
    //   : undefined;
  }

  private getTransparentMaterial() {
    // Return a transparent material - this will be cloned for each mesh
    // const material =
    //   this.visualizations[0]?.meshGroup instanceof Group
    //     ? this.visualizations[0].meshGroup.children[0].material
    //     : undefined;
    // if (material && !Array.isArray(material)) {
    //   material.transparent = true;
    //   material.opacity = 0.3;
    // }
    // return material;
  }

  clear(): this {
    // Remove all meshes from the scene except the grid
    const childrenToRemove = this.scene.children.filter(
      (child): child is Mesh | Group => (child instanceof Mesh || child instanceof Group) && !(child instanceof GridHelper)
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

    return this;
  }

  public addVisualization(visualization: MeshVisualization, selectedId: string | null = null, rootId: string | null = null): void {
    if (this.visualizations.some((v) => v.mesh.uuid === visualization.mesh.uuid)) {
      console.warn('Visualization already added to renderer', { visualization });
      return;
    }

    visualization.mesh.visible = true;
    visualization.wireframe.visible = false;

    // Transparency for the root node if it's not selected
    if (rootId && visualization.nodeId === rootId && selectedId && selectedId !== rootId) {
      const mesh = visualization.mesh;
      mesh.children.forEach((child) => {
        if ((child as any).isMesh) {
          const m = child as THREE.Mesh;
          if (!(m.material as any).__originalOpacity) {
            (m.material as any).__originalOpacity = (m.material as THREE.MeshStandardMaterial).opacity;
            (m.material as any).__originalTransparent = (m.material as THREE.MeshStandardMaterial).transparent;
          }
          (m.material as THREE.MeshStandardMaterial).transparent = true;
          (m.material as THREE.MeshStandardMaterial).opacity = 0.3;
        }
      });
    } else {
      const mesh = visualization.mesh;
      mesh.children.forEach((child) => {
        if ((child as any).isMesh) {
          const m = child as THREE.Mesh;
          if ((m.material as any).__originalOpacity !== undefined) {
            (m.material as THREE.MeshStandardMaterial).opacity = (m.material as any).__originalOpacity;
            (m.material as THREE.MeshStandardMaterial).transparent = (m.material as any).__originalTransparent;
          }
        }
      });
    }

    // Check if we should highlight this visualization
    if (selectedId && visualization.nodeId === selectedId && selectedId !== rootId) {
      // Highlight for the selected mesh
      const mesh = visualization.mesh;
      mesh.children.forEach((child) => {
        if ((child as any).isMesh) {
          const m = child as THREE.Mesh;
          // Temporarily change material color or emit an outline, simplest is coloring for this case
          if (!(m.material as any).__originalColor) {
            (m.material as any).__originalColor = ((m.material as THREE.MeshStandardMaterial).color as THREE.Color).clone();
          }
          (m.material as THREE.MeshStandardMaterial).color.set(0xff0000);
        }
      });
    } else {
      // Revert highlight if necessary
      const mesh = visualization.mesh;
      mesh.children.forEach((child) => {
        if ((child as any).isMesh) {
          const m = child as THREE.Mesh;
          if ((m.material as any).__originalColor) {
            (m.material as THREE.MeshStandardMaterial).color.copy((m.material as any).__originalColor);
          }
        }
      });
    }

    this.visualizations.push(visualization);
    this.scene.add(visualization.mesh);
    this.updateMeshesForMode();
  }
}
