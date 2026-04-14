export interface MeshNode {
  id: string;
  name: string;
  type: "assembly" | "part" | "primitive";
  mesh?: any; // Only leaf nodes have meshes
  children: MeshNode[];
  visible: boolean;
}
