import { Action, computeNextStep, Step } from "../actions";

export type TickKind = "week" | "month" | "year";

export type QuestDescription = {
	personName: string;
	questLLMDescription: string;
	stepCount: number;
	initialStep: Step;
	tickKind: TickKind;
};

export type Quest = {
	description: QuestDescription;
	steps: Step[];
	currentStepIndex: number;
};

export function simulateWithActions(
	questDescription: QuestDescription,
	newActionsPerTick: Action[][]
) {
	const steps = [questDescription.initialStep];
	for (const actions of newActionsPerTick) {
		steps.push(
			computeNextStep(
				steps[steps.length - 1],
				actions,
				questDescription.tickKind
			)
		);
	}
	return steps;
}
