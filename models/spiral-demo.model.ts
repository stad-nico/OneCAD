import { cylinder, modelMetadata, sphere, union } from '../packages/core/src/index.js';

export const model = modelMetadata({
	name: 'Enhanced Spiral Demo',
	description: 'A simple spiral made of spheres to demonstrate the visualization system.',
});

export default function createSpiral() {
	const spheres: any[] = [];
	const turns = 3;
	const height = 10;
	const radius = 3;
	const steps = 50;

	// Create a simple spiral of spheres
	for (let i = 0; i <= steps; i++) {
		const angle = (i / steps) * turns * Math.PI * 2;
		const spiralRadius = radius * (i / steps);
		const z = (height * i) / steps;

		const x = spiralRadius * Math.cos(angle);
		const y = spiralRadius * Math.sin(angle);

		const sphereSize = 0.2 + (i / steps) * 0.3; // Growing spheres

		spheres.push(sphere(sphereSize).translate(x, y, z));
	}

	// Add a central column
	const column = cylinder(0.1, height).translate(0, 0, height / 2);

	return union([...spheres, column]);
}
