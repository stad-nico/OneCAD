import { box } from '../core/api';

export default function createBoxModel() {
	const shape = box(10, 10, 20).translate(0, 0, 0);

	return shape;
}
