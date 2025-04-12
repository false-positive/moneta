import invariant from "tiny-invariant";
import { TickKind } from "./index";
import { getPercent, getPrices } from "../history";

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

	initialPrice: number;
	repeatedPrice: number;

	percentFromHistory: string;
};

export const noImpact: MetricImpact = {
	hasImpact: false,
	minRequired: -Infinity,
	maxRequired: Infinity,

	repeatedAbsoluteDelta: 0,
	repeatedPercent: 0,

	initialPrice: 0,
	repeatedPrice: 0,

	percentFromHistory: "",
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

	canChangeInitialPrice?: boolean;
	canChangeRepeatedPrice?: boolean;
};

function calculateMetric(
	metricImpact: MetricImpact,
	previousValue: number,
	tick: number,
	tickKind: TickKind
) {
	if (!metricImpact.hasImpact) {
		return previousValue;
	}

	let percent = metricImpact.repeatedPercent;
	if (metricImpact.percentFromHistory != "") {
		invariant(percent == 0);
		percent = getPercent(
			tick,
			tickKind,
			getPrices(metricImpact.percentFromHistory)
		);
	}
	const absoluteValue = previousValue + metricImpact.repeatedAbsoluteDelta;
	return absoluteValue + absoluteValue * (percent / 100);
}

function applyAction(
	action: Action,
	step: Step,
	isNew: boolean,
	tickKind: TickKind
) {
	const newAction = { ...action };
	newAction.capital = calculateMetric(
		action.investmentImpact,
		action.investmentImpact.repeatedPrice +
			(isNew ? action.investmentImpact.initialPrice : action.capital),
		step.tick,
		tickKind
	);
	newAction.remainingTicks--;

	return {
		...step,
		bankAccount:
			calculateMetric(
				action.bankAccountImpact,
				step.bankAccount,
				step.tick,
				tickKind
			) -
			(isNew ? newAction.investmentImpact.initialPrice : 0) -
			newAction.investmentImpact.repeatedPrice,
		joy: calculateMetric(action.joyImpact, step.joy, step.tick, tickKind),
		freeTime: calculateMetric(
			action.freeTimeImpact,
			step.freeTime,
			step.tick,
			tickKind
		),

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

export function computeNextStep(
	previousStep: Step,
	newActions: Action[],
	tickKind: TickKind
) {
	let nextStep: Step = {
		...previousStep,
		newActions,
		oldActiveActions: [],
		freeTime: 0,
		tick: previousStep.tick + 1,
	};

	for (const action of previousStep.oldActiveActions) {
		if (isActionFinished(action)) {
			nextStep = finishAction(action, nextStep);
		} else {
			nextStep = applyAction(
				action,
				nextStep,
				/* isNew: */ false,
				tickKind
			);
		}
	}

	for (const action of newActions) {
		nextStep = applyAction(action, nextStep, /* isNew: */ true, tickKind);
	}

	return nextStep;
}
