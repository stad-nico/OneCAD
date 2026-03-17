import { OpenCascadeInstance, TopoDS_Shape } from 'opencascade.js/dist/opencascade.full';
import { Operation, OperationParamsMap } from '../../types/Operation';
import { OperationProcessor } from '../operation-processor';

class Box {
  @OperationProcessor(Operation.Box)
  public async box(
    openCascade: OpenCascadeInstance,
    _input: TopoDS_Shape | undefined,
    params: OperationParamsMap[Operation.Box]
  ): Promise<TopoDS_Shape> {
    const { width, height, depth } = params;

    return new openCascade.BRepPrimAPI_MakeBox_2(width, height, depth).Shape();
  }
}
