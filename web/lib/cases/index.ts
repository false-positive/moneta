import invariant from "tiny-invariant";
import { Action, computeNextStep, Step } from "./actions";
import { CaseCards } from "@/components/ui/case-cards";

export type CaseDescription = {
	personName: string;
	caseLLMDescriptipn: string;
	stepCount: number;
	initialStep: Step;
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
		steps.push(computeNextStep(steps[steps.length - 1], actions));
	}
	return steps;
}
