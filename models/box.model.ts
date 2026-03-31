import { box, modelMetadata } from '../core/api';

export const model = modelMetadata({
	name: 'Box',
	description: 'A simple box shape.',
});

export default function createBoxModel() {
	const shape = box(10, 10, 20).translate(0, 0, 0);

	return shape;
}
