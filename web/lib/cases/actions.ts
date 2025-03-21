import invariant from "tiny-invariant";

export type Kind = "investment" | "income" | "expense" | "other";

export type Step = {
	tick: number;
	bankAccount: number;
	joy: number;
	freeTime: number;
	newActions: Action[];
	oldActiveActions: Action[];
};

export type MetricImpact = {
	hasImpact: boolean;
	minRequired: number;
	maxRequired: number;

	repeatedAbsoluteDelta: number;
	repeatedPercent: number;

	initialValue: number;
};

export const noImpact: MetricImpact = {
	hasImpact: false,
	minRequired: -Infinity,
	maxRequired: Infinity,

	repeatedAbsoluteDelta: 0,
	repeatedPercent: 0,

	initialValue: 0,
};

export const impact = (partialImpact: Partial<MetricImpact>) => ({
	...noImpact,
	hasImpact: true,
	...partialImpact,
});

export const percentImpact = (percent: number) =>
	impact({ repeatedPercent: percent });
export const absoluteImpact = (absoluteDelta: number) =>
	impact({ repeatedAbsoluteDelta: absoluteDelta });

export type Action = {
	name: string;
	kind: Kind;
	shortDescription: string; // Short description for UI display
	llmDescription: string; // Detailed description for LLM context

	remainingTicks: number;

	bankAccountImpact: MetricImpact;
	investmentImpact: MetricImpact;
	joyImpact: MetricImpact;
	freeTimeImpact: MetricImpact;

	capital: number;
};

function calculateMetric(metricImpact: MetricImpact, previousValue: number) {
	if (!metricImpact.hasImpact) {
		return previousValue;
	}

	const absoluteValue = previousValue + metricImpact.repeatedAbsoluteDelta;
	return absoluteValue + absoluteValue * (metricImpact.repeatedPercent / 100);
}

function applyAction(action: Action, step: Step, isNew: boolean) {
	const newAction = { ...action };
	newAction.capital = calculateMetric(
		action.investmentImpact,
		isNew ? action.investmentImpact.initialValue : action.capital
	);
	newAction.remainingTicks--;

	return {
		...step,
		bankAccount:
			calculateMetric(action.bankAccountImpact, step.bankAccount) -
			(isNew ? newAction.investmentImpact.initialValue : 0),
		joy: calculateMetric(action.joyImpact, step.joy),
		freeTime: calculateMetric(action.freeTimeImpact, step.freeTime),

		oldActiveActions: [...step.oldActiveActions, newAction],
	} satisfies Step;
}

function isActionFinished(action: Action) {
	invariant(
		action.remainingTicks >= 0,
		"Remaining ticks must be non-negative"
	);
	return action.remainingTicks === 0;
}

function finishAction(action: Action, step: Step) {
	invariant(
		isActionFinished(action),
		"Non-finished actions cannot be finalized"
	);

	return {
		...step,
		bankAccount: step.bankAccount + action.capital,
	} satisfies Step;
}

export function computeNextStep(previousStep: Step, newActions: Action[]) {
	let nextStep: Step = {
		...previousStep,
		newActions,
		oldActiveActions: [],
		freeTime: 0,
	};

	for (const action of previousStep.oldActiveActions) {
		if (isActionFinished(action)) {
			nextStep = finishAction(action, nextStep);
		} else {
			nextStep = applyAction(action, nextStep, /* isNew: */ false);
		}
	}

	for (const action of newActions) {
		nextStep = applyAction(action, nextStep, /* isNew: */ true);
	}

	return nextStep;
}
