import openCascade from "opencascade.js/dist/opencascade.full.js";
import openCascadeWasm from "opencascade.js/dist/opencascade.full.wasm?url";

export async function initOcc() {
  //@ts-ignore
  return await openCascade({
    locateFile: () => openCascadeWasm,
  });
}
export class Kernel {
  private oc: any;

  async init() {
    this.oc = await initOcc();
  }

  createBox(width: number, height: number, depth: number) {
    const maker = new this.oc.BRepPrimAPI_MakeBox_2(width, height, depth);
    return maker.Shape();
  }

  triangulate(shape: any) {
    const mesh = new this.oc.BRepMesh_IncrementalMesh_2(
      shape,
      0.5,
      false,
      0.5,
      true,
    );
    // The constructor automatically performs the meshing, no need to call Perform()
  }

  exportSTL(shape: any, filename: string) {
    const writer = new this.oc.StlAPI_Writer();
    writer.Write_1(shape, filename, true);
  }
}
