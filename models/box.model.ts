import { Operation } from "../packages/types/src/operations";
import { Model } from "./../packages/types/src/model";

export default function createModel(): Model {
  return {
    id: "box1",
    name: "Box",
    steps: [
      {
        type: Operation.Box,
        params: {
          width: 20,
          height: 200,
          depth: 20,
        },
      },
    ],
  };
}
