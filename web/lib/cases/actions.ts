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

const noImpact: MetricImpact = {
	hasImpact: false,
	minRequired: -Infinity,
	maxRequired: Infinity,

	repeatedAbsoluteDelta: 0,
	repeatedPercent: 0,

	initialValue: 0,
};

const impact = (partialImpact: Partial<MetricImpact>) => ({
	...noImpact,
	hasImpact: true,
	...partialImpact,
});

const percentImpact = (percent: number) => impact({ repeatedPercent: percent });
const absoluteImpact = (absoluteDelta: number) =>
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

function isActionFinished(action: Action, step: Step) {
	invariant(
		action.remainingTicks >= 0,
		"Remaining ticks must be non-negative"
	);
	return action.remainingTicks === 0;
}

function finishAction(action: Action, step: Step) {
	invariant(
		isActionFinished(action, step),
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
		if (isActionFinished(action, nextStep)) {
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

const noOpAction: Action = {
	name: "No Op",
	kind: "other",
	shortDescription: "Do nothing",
	llmDescription: "Do nothing",
	bankAccountImpact: noImpact,
	capital: 0,
	investmentImpact: noImpact,
	joyImpact: noImpact,
	freeTimeImpact: noImpact,
	remainingTicks: 1,
};

export const lifeAction: Action = {
	...noOpAction,
	name: "Life",
	kind: "expense",
	shortDescription: "Pay for living expenses",
	llmDescription: "Pay for living expenses",
	bankAccountImpact: impact({
		repeatedAbsoluteDelta: -1000,
		repeatedPercent: -2 / 12,
	}), // levs per month + inflation per month
	joyImpact: percentImpact(-10),
	freeTimeImpact: absoluteImpact(100), // hours per week
	remainingTicks: Infinity,
};

export const waiterJobAction: Action = {
	...noOpAction,
	name: "Job as a waiter",
	kind: "income",
	shortDescription: "Work as a waiter",
	llmDescription: "Work as a waiter",
	bankAccountImpact: absoluteImpact(1000), // levs per month
	joyImpact: percentImpact(-5),
	freeTimeImpact: absoluteImpact(-20), // hours per week
	remainingTicks: Infinity,
};

export const sweJobAction: Action = {
	...noOpAction,
	name: "Job as a software engineer",
	kind: "income",
	shortDescription: "Work as a software engineer",
	llmDescription: "Work as a software engineer",
	bankAccountImpact: absoluteImpact(5000), // levs per month
	joyImpact: percentImpact(-10),
	freeTimeImpact: absoluteImpact(-40), // hours per week
	remainingTicks: Infinity,
};

export const savingsDepositAction: Action = {
	...noOpAction,
	name: "Savings Deposit",
	kind: "income",
	shortDescription: "Deposit money into a savings account",
	llmDescription: "Deposit money into a savings account",
	investmentImpact: impact({
		repeatedPercent: 0.2,
		initialValue: 1000,
	}),
	joyImpact: noImpact,
	freeTimeImpact: noImpact,
	remainingTicks: 12, // months
};

export const allActionsList = {
	lifeAction,
	waiterJobAction,
	sweJobAction,
	savingsDepositAction,
};

/**

- Risk
- Poi
 */
