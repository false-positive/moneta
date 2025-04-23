import {
	Action,
	noImpact,
	impact,
	absoluteImpact,
	percentImpact,
	historyPercent,
	constantPercent,
} from "../actions";

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
	gainedExperiences: [],
};

export const liveWithParentsAction: Action = {
	...noOpAction,
	name: "Live with parents",
	kind: "expense",
	shortDescription: "Living expenses when living with your parents",
	llmDescription: "Living expenses when living with your parents",
	bankAccountImpact: impact({
		repeatedAbsoluteDelta: -(200 * 12),
		repeatedPercent: constantPercent(-2),
	}), // levs and inflation per year
	joyImpact: percentImpact(-10),
	freeTimeImpact: absoluteImpact(100), // hours per week
	remainingSteps: Infinity,
};

export const waiterPartTimeJobAction: Action = {
	...noOpAction,
	name: "Part-time job as a waiter",
	kind: "income",
	shortDescription: "Part-time work as a waiter",
	llmDescription: "Part-time work as a waiter",
	bankAccountImpact: absoluteImpact(700 * 12), // levs per year
	joyImpact: absoluteImpact(-5),
	freeTimeImpact: absoluteImpact(-20), // hours per week
	remainingSteps: Infinity,
};

export const waiterFullTimeJobAction: Action = {
	...noOpAction,
	name: "Full-time job as a waiter",
	kind: "income",
	shortDescription: "Full-time work as a waiter",
	llmDescription: "Full-time work as a waiter",
	bankAccountImpact: absoluteImpact(1400 * 12), // levs per year
	joyImpact: absoluteImpact(-12),
	freeTimeImpact: absoluteImpact(-40), // hours per week
	remainingSteps: Infinity,
};

export const juniorSweJobAction: Action = {
	...noOpAction,
	name: "Job as a junior software engineer",
	kind: "income",
	shortDescription: "Work as a software engineer",
	llmDescription: "Work as a software engineer",
	bankAccountImpact: absoluteImpact(3000 * 12), // levs per year
	joyImpact: absoluteImpact(-8),
	freeTimeImpact: absoluteImpact(-40), // hours per week
	remainingSteps: Infinity,
};

// TODO Requirement to get from Junior to Senior swe

export const seniorSweJobAction: Action = {
	...noOpAction,
	name: "Job as a senior software engineer",
	kind: "income",
	shortDescription: "Work as a software engineer",
	llmDescription: "Work as a software engineer",
	bankAccountImpact: absoluteImpact(5000 * 12), // levs per year
	joyImpact: absoluteImpact(-8),
	freeTimeImpact: absoluteImpact(-40), // hours per week
	remainingSteps: Infinity,
};

export const savingsDepositAction: Action = {
	...noOpAction,
	name: "Savings Deposit",
	kind: "investment",
	shortDescription: "Deposit money into a savings account",
	llmDescription: "Deposit money into a savings account",
	investmentImpact: impact({
		repeatedPercent: constantPercent(0.2),
		initialPrice: 5000,
	}),
	joyImpact: noImpact,
	freeTimeImpact: noImpact,
	remainingSteps: 2, // years
	canChangeInitialPrice: true,
	canChangeRepeatedPrice: true,
};

export const pensionDepositAction: Action = {
	...noOpAction,
	name: "Pension Deposit",
	kind: "investment",
	shortDescription: "Deposit money into a pension account",
	llmDescription: "Deposit money into a pension account",
	investmentImpact: impact({
		repeatedPercent: constantPercent(2),
		initialPrice: 0,
		repeatedPrice: 5000,
	}),
	joyImpact: noImpact,
	freeTimeImpact: noImpact,
	remainingSteps: 10, // years
	canChangeInitialPrice: true,
	canChangeRepeatedPrice: true,
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
	canChangeInitialPrice: true,
};

export const etfInvestmentRepeatedAction: Action = {
	...noOpAction,
	name: "ETF Investment - Repeated",
	kind: "investment",
	shortDescription: "Buy an ETF fund regularly",
	llmDescription: "Buy an ETF fund regularly",
	investmentImpact: impact({
		repeatedPercent: historyPercent("etf"),
		repeatedPrice: 5000,
	}),
	joyImpact: noImpact,
	freeTimeImpact: noImpact,
	remainingSteps: 10, // years
	canChangeInitialPrice: true,
	canChangeRepeatedPrice: true,
};

export const stocksInvestmentAction: Action = {
	...noOpAction,
	name: "Stock Investment",
	kind: "investment",
	shortDescription: "Buy an individual stock",
	llmDescription: "Buy an individual stock",
	investmentImpact: impact({
		repeatedPercent: constantPercent(10),
		initialPrice: 5000,
	}),
	joyImpact: noImpact,
	freeTimeImpact: noImpact,
	remainingSteps: 10, // years
	canChangeInitialPrice: true,
	canChangeRepeatedPrice: true,
};

export const cryptoInvestmentAction: Action = {
	...noOpAction,
	name: "Crypto Investment",
	kind: "investment",
	shortDescription: "Buy a crypto currency",
	llmDescription: "Buy a crypto currency",
	investmentImpact: impact({
		repeatedPercent: historyPercent("btc"),
		initialPrice: 5000,
	}),
	joyImpact: noImpact,
	freeTimeImpact: noImpact,
	remainingSteps: 5, // years
	canChangeInitialPrice: true,
	canChangeRepeatedPrice: true,
};

export const goldInvestmentAction: Action = {
	...noOpAction,
	name: "Gold Investment",
	kind: "investment",
	shortDescription: "Buy investment gold",
	llmDescription: "Buy investment gold",
	investmentImpact: impact({
		repeatedPercent: historyPercent("gold"),
		initialPrice: 5000,
	}),
	joyImpact: noImpact,
	freeTimeImpact: noImpact,
	remainingSteps: 5, // years
	canChangeInitialPrice: true,
	canChangeRepeatedPrice: false,
};

export const skiTripAction: Action = {
	...noOpAction,
	name: "Ski Trip",
	kind: "expense",
	shortDescription: "Go skiing",
	llmDescription: "Go skiing",
	bankAccountImpact: absoluteImpact(-2000),
	joyImpact: absoluteImpact(50),
	freeTimeImpact: absoluteImpact(-40), // hours per week
	remainingSteps: 1, // year
};

export const hobbyMotorbikeRidingAction: Action = {
	...noOpAction,
	name: "Hobby Motorbike Riding",
	kind: "expense",
	shortDescription: "Buying and servicing a motorbike",
	llmDescription: "Buying and servicing a motorbike",
	investmentImpact: absoluteImpact(20000),
	joyImpact: absoluteImpact(20),
	freeTimeImpact: noImpact,
	remainingSteps: 1, // year
};

export const partyingAction: Action = {
	...noOpAction,
	name: "Partying",
	kind: "expense",
	shortDescription: "Going out and partying with friends",
	llmDescription: "Going out and partying with friends",
	investmentImpact: absoluteImpact(100),
	joyImpact: absoluteImpact(15),
	freeTimeImpact: noImpact,
	remainingSteps: 24, // per year
};

export const havingAKidAction: Action = {
	...noOpAction,
	name: "Having A Kid",
	kind: "expense",
	shortDescription: "Having a kid and paying all the expenses they bring",
	llmDescription: "Having a kid and paying all the expenses they bring",
	investmentImpact: absoluteImpact(15000),
	joyImpact: absoluteImpact(1),
	freeTimeImpact: noImpact,
	remainingSteps: Infinity,
};

export const allActionsList = {
	liveWithParentsAction,
	waiterPartTimeJobAction,
	waiterFullTimeJobAction,
	juniorSweJobAction,
	seniorSweJobAction,
	savingsDepositAction,
	pensionDepositAction,
	etfInvestmentOnceAction,
	etfInvestmentRepeatedAction,
	stocksInvestmentAction,
	cryptoInvestmentAction,
	goldInvestmentAction,
	skiTripAction,
	hobbyMotorbikeRidingAction,
	partyingAction,
	havingAKidAction,
};

/**

- Risk
- Poi
 */
