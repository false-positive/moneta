import { lifeAction, noOpAction } from "@/lib/engine/actions/standard-actions";
import { z } from "zod";
import { QuestDescription } from "..";
import {
	absoluteImpact,
	constantPercent,
	historyPercent,
	impact,
	noImpact,
	percentImpact,
} from "../../actions";
import {
	ActionTemplate,
	createConstantTemplate,
	createCustomizableTemplate,
} from "../../actions/templates";

export const tutorialQuestDescription: QuestDescription = {
	personAge: 18,
	questLLMDescription:
		"Ivan is 18 years old and has 5000 BGN in his bank account, which he spends on buying food, clothes and other stuff",
	maxStepCount: 5,
	timePointKind: "year",
	initialStep: {
		timePoint: 2020,
		bankAccount: 5000,
		joy: 100,
		freeTimeHours: 100,
		newActions: [],
		continuingActions: [{ ...lifeAction }],
	},
	goal: {
		description: "Ivan wants to save 100000 BGN",
		goalReached: ({ lastStep }) => lastStep.bankAccount >= 100000,
	},
	actionTemplates: [
		createConstantTemplate({
			action: {
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
			},
			iconImageHref: "/icons/lifeAction.svg",
			hardcodedPosition: { x: 600, y: 300 },
			isUnlocked: () => true,
		}),
		createConstantTemplate({
			action: {
				...noOpAction,
				name: "Live with parents",
				kind: "expense",
				shortDescription:
					"Living expenses when living with your parents",
				llmDescription: "Living expenses when living with your parents",
				bankAccountImpact: impact({
					repeatedAbsoluteDelta: -(200 * 12),
					repeatedPercent: constantPercent(-2),
				}), // levs and inflation per year
				joyImpact: percentImpact(-10),
				freeTimeImpact: absoluteImpact(100), // hours per week
				remainingSteps: Infinity,
			},
			iconImageHref: "/icons/liveWithParentsAction.png",
			hardcodedPosition: { x: 575, y: 275 },
			isUnlocked: () => false,
		}),
		createConstantTemplate({
			action: {
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
			},
			iconImageHref: "/icons/savingsDepositAction.png",
			hardcodedPosition: { x: 625, y: 275 },
			isUnlocked: () => false,
		}),
		createConstantTemplate({
			action: {
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
			},
			iconImageHref: "/icons/pensionDepositAction.svg",
			hardcodedPosition: { x: 650, y: 250 },
			isUnlocked: () => false,
		}),
		createCustomizableTemplate({
			baseAction: {
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
			},
			userInputSchema: z.object({
				temporaryInitialPriceForTesting: z.coerce
					.number()
					.min(0)
					.default(10000)
					.describe("this description should be visible"),
			}),
			apply: (baseAction, userInput) => ({
				...noOpAction,
				...baseAction,
				initialPrice: userInput.temporaryInitialPriceForTesting,
			}),
			iconImageHref: "/icons/etfInvestmentOnceAction.png",
			hardcodedPosition: { x: 650, y: 300 },
			isUnlocked: () => false,
		}),
		createConstantTemplate({
			action: {
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
			},
			iconImageHref: "/icons/etfInvestmentRepeatedAction.png",
			hardcodedPosition: { x: 675, y: 325 },
			isUnlocked: () => false,
		}),
		createConstantTemplate({
			action: {
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
			},
			iconImageHref: "/icons/stocksInvestmentAction.png",
			hardcodedPosition: { x: 675, y: 275 },
			isUnlocked: () => false,
		}),
		createConstantTemplate({
			action: {
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
			},
			iconImageHref: "/icons/cryptoInvestmentAction.png",
			hardcodedPosition: { x: 700, y: 250 },
			isUnlocked: () => false,
		}),
		createConstantTemplate({
			action: {
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
			},
			iconImageHref: "/icons/goldInvestmentAction.png",
			hardcodedPosition: { x: 725, y: 275 },
			isUnlocked: () => false,
		}),
		createConstantTemplate({
			action: {
				...noOpAction,
				name: "Ski Trip",
				kind: "expense",
				shortDescription: "Go skiing",
				llmDescription: "Go skiing",
				bankAccountImpact: absoluteImpact(-2000),
				joyImpact: absoluteImpact(50),
				freeTimeImpact: absoluteImpact(-40), // hours per week
				remainingSteps: 1, // year
			},
			iconImageHref: "/icons/skiTripAction.png",
			hardcodedPosition: { x: 575, y: 325 },
			isUnlocked: () => false,
		}),
		createConstantTemplate({
			action: {
				...noOpAction,
				name: "Hobby Motorbike Riding",
				kind: "expense",
				shortDescription: "Buying and servicing a motorbike",
				llmDescription: "Buying and servicing a motorbike",
				investmentImpact: absoluteImpact(20000),
				joyImpact: absoluteImpact(20),
				freeTimeImpact: noImpact,
				remainingSteps: 1, // year
			},
			iconImageHref: "/icons/hobbyMotorbikeRidingAction.png",
			hardcodedPosition: { x: 550, y: 300 },
			isUnlocked: () => false,
		}),
		createConstantTemplate({
			action: {
				...noOpAction,
				name: "Partying",
				kind: "expense",
				shortDescription: "Going out and partying with friends",
				llmDescription: "Going out and partying with friends",
				investmentImpact: absoluteImpact(100),
				joyImpact: absoluteImpact(15),
				freeTimeImpact: noImpact,
				remainingSteps: 24, // per year
			},
			iconImageHref: "/icons/partyingAction.png",
			hardcodedPosition: { x: 550, y: 350 },
			isUnlocked: () => false,
		}),
		createConstantTemplate({
			action: {
				...noOpAction,
				name: "Having A Kid",
				kind: "expense",
				shortDescription:
					"Having a kid and paying all the expenses they bring",
				llmDescription:
					"Having a kid and paying all the expenses they bring",
				investmentImpact: absoluteImpact(15000),
				joyImpact: absoluteImpact(1),
				freeTimeImpact: noImpact,
				remainingSteps: Infinity,
			},
			iconImageHref: "/icons/havingAKidAction.png",
			hardcodedPosition: { x: 600, y: 350 },
			isUnlocked: () => false,
		}),
		createConstantTemplate({
			action: {
				...noOpAction,
				name: "Part-time job as a waiter",
				kind: "income",
				shortDescription: "Part-time work as a waiter",
				llmDescription: "Part-time work as a waiter",
				bankAccountImpact: absoluteImpact(700 * 12), // levs per year
				joyImpact: absoluteImpact(-5),
				freeTimeImpact: absoluteImpact(-20), // hours per week
				remainingSteps: Infinity,
			},
			iconImageHref: "/icons/waiterPartTimeJobAction.png",
			hardcodedPosition: { x: 600, y: 250 },
			isUnlocked: () => false,
		}),
		createConstantTemplate({
			action: {
				...noOpAction,
				name: "Full-time job as a waiter",
				kind: "income",
				shortDescription: "Full-time work as a waiter",
				llmDescription: "Full-time work as a waiter",
				bankAccountImpact: absoluteImpact(1400 * 12), // levs per year
				joyImpact: absoluteImpact(-12),
				freeTimeImpact: absoluteImpact(-40), // hours per week
				remainingSteps: Infinity,
			},
			iconImageHref: "/icons/waiterFullTimeJobAction.png",
			hardcodedPosition: { x: 625, y: 225 },
			isUnlocked: () => false,
		}),
		createConstantTemplate({
			action: {
				...noOpAction,
				name: "Job as a junior software engineer",
				kind: "income",
				shortDescription: "Work as a software engineer",
				llmDescription: "Work as a software engineer",
				bankAccountImpact: absoluteImpact(3000 * 12), // levs per year
				joyImpact: absoluteImpact(-8),
				freeTimeImpact: absoluteImpact(-40), // hours per week
				remainingSteps: Infinity,
			},
			iconImageHref: "/icons/juniorSweJobAction.png",
			hardcodedPosition: { x: 575, y: 225 },
			isUnlocked: () => false,
		}),
		createConstantTemplate({
			action: {
				...noOpAction,
				name: "Job as a senior software engineer",
				kind: "income",
				shortDescription: "Work as a software engineer",
				llmDescription: "Work as a software engineer",
				bankAccountImpact: absoluteImpact(5000 * 12), // levs per year
				joyImpact: absoluteImpact(-8),
				freeTimeImpact: absoluteImpact(-40), // hours per week
				remainingSteps: Infinity,
			},
			iconImageHref: "/icons/seniorSweJobAction.png",
			hardcodedPosition: { x: 600, y: 200 },
			isUnlocked: () => false,
		}),
	] satisfies readonly ActionTemplate[],
};
