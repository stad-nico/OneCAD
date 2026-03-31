import { BufferAttribute, BufferGeometry, Mesh, MeshStandardMaterial } from 'three';
import { TriangulationResult } from '../worker/triangulate';

/**
 * Creates a threejs Mesh from the given triangulation result from the worker.
 *
 * @param triangulation the triangulation result containing vertices, normals, and indices
 * @returns the threejs mesh
 */
export function createThreeJsMeshFromTriangulation(triangulation: TriangulationResult): Mesh {
	const { vertices, normals, indices } = triangulation;

	const geometry = new BufferGeometry();

	geometry.setAttribute('position', new BufferAttribute(vertices, 3));

	if (normals.length === vertices.length) {
		geometry.setAttribute('normal', new BufferAttribute(normals, 3));
	} else {
		geometry.computeVertexNormals();
	}

	geometry.setIndex(new BufferAttribute(indices, 1));

	const material = new MeshStandardMaterial({ color: 0x808080, metalness: 0.0, roughness: 0.5 });
	const mesh = new Mesh(geometry, material);

	return mesh;
}
