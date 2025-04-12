import { Action, computeNextStep, Step } from "./actions";

export type TickKind = "week" | "month" | "year";

export type CaseDescription = {
	personName: string;
	caseLLMDescriptipn: string;
	stepCount: number;
	initialStep: Step;
	tickKind: TickKind;
};

export type Case = {
	description: CaseDescription;
	steps: Step[];
	currentStepIndex: number;
};

export function simulateWithActions(
	caseDescription: CaseDescription,
	newActionsPerTick: Action[][]
) {
	let steps: Step[] = [caseDescription.initialStep];
	for (const actions of newActionsPerTick) {
		steps.push(
			computeNextStep(
				steps[steps.length - 1],
				actions,
				caseDescription.tickKind
			)
		);
	}
	return steps;
}
