import { Operation } from "../packages/types/src/operations";
import { Model } from "./../packages/types/src/model";

export default function createModel(): Model {
  return {
    id: "box 2",
    name: "Another Box",
    steps: [
      {
        type: Operation.Box,
        params: {
          width: 40,
          height: 40,
          depth: 40,
        },
      },
    ],
  };
}
