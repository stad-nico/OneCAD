import { OpenCascadeInstance, TopoDS_Shape } from 'opencascade.js/dist/opencascade.full.js';
import { OperationParamsMap } from '../shared/types/operation';

type OperationKey = keyof OperationParamsMap;

export type OperationProcessor<Type extends OperationKey = OperationKey> = (
	openCascade: OpenCascadeInstance,
	input: TopoDS_Shape | undefined,
	params: unknown
) => Promise<TopoDS_Shape>;

const OperationProcessors: {
	[Type in OperationKey]?: OperationProcessor<Type>;
} = {};

export function OperationProcessor(type: OperationKey): MethodDecorator {
	return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void => {
		if (!descriptor.value) {
			throw new Error(`Method ${String(propertyKey)} has no implementation.`);
		}

		OperationProcessors[type] = descriptor.value as OperationProcessor<OperationKey>;
	};
}

export function getOperationProcessor<Type extends OperationKey>(type: Type): OperationProcessor<Type> {
	const processor = OperationProcessors[type] as OperationProcessor<Type> | undefined;

	if (!processor) {
		throw new Error(`No worker request processor found for type ${type}!`);
	}

	return processor;
}
