import { OpenCascadeInstance, TopoDS_Shape } from 'opencascade.js';
import { Operation, OperationParamsMap } from '../../types/Operation';
import { OperationProcessor } from '../operation-processor';

class Translate {
  @OperationProcessor(Operation.Translate)
  public async translate(
    openCascade: OpenCascadeInstance,
    input: TopoDS_Shape | undefined,
    params: OperationParamsMap[Operation.Translate]
  ): Promise<TopoDS_Shape> {
    if (!input) {
      throw new Error('Translate requires an input shape');
    }

    const { x, y, z } = params;

    const trsf = new openCascade.gp_Trsf_1();
    const vec = new openCascade.gp_Vec_4(x, y, z);
    trsf.SetTranslation_1(vec);

    return new openCascade.BRepBuilderAPI_Transform_2(input, trsf, false).Shape();
  }
}
