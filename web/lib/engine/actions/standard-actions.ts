import {
	Action,
	noImpact,
	impact,
	absoluteImpact,
	percentImpact,
	historyPercent,
	constantPercent,
} from ".";

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
	remainingSteps: 1,
};

export const lifeAction: Action = {
	...noOpAction,
	name: "Life",
	kind: "expense",
	shortDescription: "Pay for living expenses",
	llmDescription: "Pay for living expenses",
	bankAccountImpact: impact({
		repeatedAbsoluteDelta: -1000,
		repeatedPercent: constantPercent(-2 / 12),
	}), // levs per month + inflation per month
	joyImpact: percentImpact(-10),
	freeTimeImpact: absoluteImpact(100), // hours per week
	remainingSteps: Infinity,
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
	remainingSteps: Infinity,
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
	remainingSteps: Infinity,
};

export const savingsDepositAction: Action = {
	...noOpAction,
	name: "Savings Deposit",
	kind: "income",
	shortDescription: "Deposit money into a savings account",
	llmDescription: "Deposit money into a savings account",
	investmentImpact: impact({
		repeatedPercent: constantPercent(0.2),
		initialPrice: 1000,
	}),
	joyImpact: noImpact,
	freeTimeImpact: noImpact,
	remainingSteps: 12, // months
};

export const pensionInvestmentAction: Action = {
	...noOpAction,
	name: "Pension Investment",
	kind: "investment",
	shortDescription: "Pension fund contribution cost",
	llmDescription: "Pension fund contribution cost",
	investmentImpact: impact({
		repeatedPercent: constantPercent(2),
		repeatedPrice: 1000,
	}),
	joyImpact: noImpact,
	freeTimeImpact: noImpact,
	remainingSteps: 12, // months
};

export const etfInvestmentOnceAction: Action = {
	...noOpAction,
	name: "ETF Investment - One-off",
	kind: "investment",
	shortDescription: "Buy an ETF fund",
	llmDescription: "Buy an ETF fund",
	investmentImpact: impact({
		repeatedPercent: historyPercent("etf"),
		initialPrice: 10000,
	}),
	joyImpact: noImpact,
	freeTimeImpact: noImpact,
	remainingSteps: 10, // years
};

export const allActionsList = {
	lifeAction,
	// waiterJobAction,
	// sweJobAction,
	// savingsDepositAction,
};
