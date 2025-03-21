import invariant from "tiny-invariant";
import { Action, computeNextStep, Step } from "./actions";

export type Case = {
	personName: string;
	caseLLMDescriptipn: string;
	stepCount: number;
	steps: Step[];
	currentStepIndex: number;
};

export const defaultCase: Case = {
	personName: "",
	caseLLMDescriptipn: "",
	stepCount: 0,
	steps: [],
	currentStepIndex: 0,
};

export function simulateWithActions(previousCase: Case, actions: Action[]) {
	const nextCase = { ...previousCase };

	invariant(nextCase.steps.length > 0, "Cannot simulate case with no steps");

	nextCase.steps = nextCase.steps.slice(0, nextCase.currentStepIndex + 1);
	invariant(
		nextCase.steps.length === nextCase.currentStepIndex + 1,
		"Insufficient length of steps array"
	);

	for (let i = nextCase.currentStepIndex; i < nextCase.stepCount; i++) {
		nextCase.steps.push(computeNextStep(nextCase.steps[i], actions));
	}

	return nextCase;
}

export function simulateFromIndexWithActions(
	previousCase: Case,
	actions: Action[],
	index: number
) {
	const nextCase = { ...previousCase };

	nextCase.currentStepIndex = index - 1;
	invariant(
		nextCase.currentStepIndex > 0,
		"Cannot simulate from index with non-positive index"
	);

	return simulateWithActions(nextCase, actions);
}
