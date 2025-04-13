import invariant from "tiny-invariant";
import { Action, computeNextStep, Step } from "../actions";

export type TickKind = "week" | "month" | "year";

export type QuestDescription = {
	personName: string;
	questLLMDescription: string;
	maxStepCount: number;
	initialStep: Step;
	tickKind: TickKind;
};

export type Quest = {
	description: QuestDescription;
	steps: Step[];
	currentStepIndex: number;
};

export function getNewActionsPerStep(quest: Quest) {
	return quest.steps.map((step) => {
		return step.newActions;
	});
}

export function simulateWithActions(
	questDescription: QuestDescription,
	newActionsPerStep: Action[][]
) {
	const steps = [questDescription.initialStep];
	for (const actions of newActionsPerStep) {
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

export function getLatestStep(quest: Quest) {
	const latestStep = quest.steps.at(-1);
	invariant(latestStep, "No steps in quest");
	return latestStep;
}
