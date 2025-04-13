import invariant from "tiny-invariant";
import { TickKind } from "../quests/index";
import { getPercent, getPrices, InvestmentKind } from "../history";

export type ActionKind = "investment" | "income" | "expense" | "other";

export type Step = {
	tick: number;
	bankAccount: number;
	joy: number;
	freeTime: number;
	newActions: Action[];
	oldActiveActions: Action[];
};

export type RepeatedPercent =
	| {
			source: "constant";
			percent: number;
	  }
	| {
			source: "history";
			investmentKind: InvestmentKind;
	  };

export const constantPercent = (percent: number): RepeatedPercent => ({
	source: "constant",
	percent,
});

export const historyPercent = (
	investmentKind: InvestmentKind
): RepeatedPercent => ({
	source: "history",
	investmentKind,
});

export type MetricImpact = {
	hasImpact: boolean;
	minRequired: number;
	maxRequired: number;

	repeatedAbsoluteDelta: number;
	repeatedPercent: RepeatedPercent;

	initialPrice: number;
	repeatedPrice: number;
};

export const noImpact: MetricImpact = {
	hasImpact: false,
	minRequired: -Infinity,
	maxRequired: Infinity,

	repeatedAbsoluteDelta: 0,
	repeatedPercent: { source: "constant", percent: 0 },

	initialPrice: 0,
	repeatedPrice: 0,
};

export const impact = (partialImpact: Partial<MetricImpact>) => ({
	...noImpact,
	hasImpact: true,
	...partialImpact,
});

export const percentImpact = (percent: number) =>
	impact({ repeatedPercent: { source: "constant", percent } });
export const absoluteImpact = (absoluteDelta: number) =>
	impact({ repeatedAbsoluteDelta: absoluteDelta });

export type Action = {
	name: string;
	kind: ActionKind;
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

	const percent =
		metricImpact.repeatedPercent.source == "constant"
			? metricImpact.repeatedPercent.percent
			: getPercent(
					tick,
					tickKind,
					getPrices(metricImpact.repeatedPercent.investmentKind)
			  );

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
