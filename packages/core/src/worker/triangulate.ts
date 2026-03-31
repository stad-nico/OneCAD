import { OpenCascadeInstance, Poly_Triangulation, TopoDS_Shape } from 'opencascade.js';

export interface TriangulationResult {
	vertices: Float32Array;
	normals: Float32Array;
	indices: Uint32Array;
}

export function triangulate(oc: OpenCascadeInstance, shape: TopoDS_Shape): TriangulationResult {
	const linearDeflection = 0.5;
	new oc.BRepMesh_IncrementalMesh_2(shape, linearDeflection, false, 0.5, true);

	const loc = new oc.TopLoc_Location_1();
	const explorer = new oc.TopExp_Explorer_2(
		shape,
		(oc.TopAbs_ShapeEnum as any).TopAbs_FACE,
		(oc.TopAbs_ShapeEnum as any).TopAbs_SHAPE
	);

	const vertices: number[] = [];
	const normals: number[] = [];
	const indices: number[] = [];
	let indexOffset = 0;

	while (explorer.More()) {
		const face = oc.TopoDS.Face_1(explorer.Current());
		const triangulation = oc.BRep_Tool.Triangulation(face, loc, 0);

		if (!triangulation.IsNull()) {
			const tr = triangulation.get();
			const numNodes = tr.NbNodes();

			processVertices(oc, tr, loc, numNodes, vertices);

			let hasNormals = processNormals(oc, tr, numNodes, normals);

			processTriangles(tr, face, oc, indexOffset, indices);

			if (!hasNormals) {
				fillDefaultNormals(numNodes, normals);
			}

			indexOffset += numNodes;
		}

		face.delete();
		explorer.Next();
	}

	explorer.delete();
	loc.delete();

	return {
		vertices: new Float32Array(vertices),
		normals: new Float32Array(normals),
		indices: new Uint32Array(indices),
	};
}

function processVertices(oc: OpenCascadeInstance, tr: any, loc: any, numNodes: number, vertices: number[]) {
	for (let i = 1; i <= numNodes; i++) {
		const p = tr.Node(i);
		const pt = p.Transformed(loc.Transformation());
		vertices.push(pt.X(), pt.Y(), pt.Z());
		p.delete();
		pt.delete();
	}
}

function processNormals(oc: OpenCascadeInstance, tr: Poly_Triangulation, numNodes: number, normals: number[]): boolean {
	if (!tr.HasNormals()) {
		return false;
	}

	for (let i = 1; i <= numNodes; i++) {
		const normal = new oc.gp_Dir_1();

		normals.push(normal.X(), normal.Y(), normal.Z());
		normal.delete();
	}

	return true;
}

function processTriangles(tr: any, face: any, oc: OpenCascadeInstance, indexOffset: number, indices: number[]) {
	const numTriangles = tr.NbTriangles();
	const isReversed = face.Orientation_1() === (oc.TopAbs_Orientation as any).TopAbs_REVERSED;

	for (let i = 1; i <= numTriangles; i++) {
		const tri = tr.Triangle(i);
		const v1 = tri.Value(1);
		const v2 = tri.Value(2);
		const v3 = tri.Value(3);

		if (isReversed) {
			indices.push(indexOffset + v1 - 1, indexOffset + v3 - 1, indexOffset + v2 - 1);
		} else {
			indices.push(indexOffset + v1 - 1, indexOffset + v2 - 1, indexOffset + v3 - 1);
		}
		tri.delete();
	}
}

function fillDefaultNormals(count: number, normals: number[]) {
	for (let i = 0; i < count; i++) {
		normals.push(0, 1, 0);
	}
}
