import { QuestDescription } from "..";
import { lifeAction } from "@/lib/engine/actions/standard-actions";
import { createActionTemplates } from "../../actions/templates";
import { allActionsList as standardActions } from "../../actions/standard-actions";
import { allActionsList as actions18 } from "../../actions/actions-18";
import { z } from "zod";

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
	actionTemplates: createActionTemplates([
		{
			templateKind: "constant",
			action: standardActions.lifeAction,
			iconImageHref: "/icons/lifeAction.svg",
			hardcodedPosition: { x: 600, y: 300 },
			isUnlocked: () => true,
		},
		{
			templateKind: "constant",
			action: actions18.liveWithParentsAction,
			iconImageHref: "/icons/liveWithParentsAction.png",
			hardcodedPosition: { x: 575, y: 275 },
			isUnlocked: () => false,
		},
		{
			templateKind: "constant",
			action: actions18.savingsDepositAction,
			iconImageHref: "/icons/savingsDepositAction.png",
			hardcodedPosition: { x: 625, y: 275 },
			isUnlocked: () => false,
		},
		{
			templateKind: "constant",
			action: actions18.pensionDepositAction,
			iconImageHref: "/icons/pensionDepositAction.svg",
			hardcodedPosition: { x: 650, y: 250 },
			isUnlocked: () => false,
		},
		{
			templateKind: "user-customizable",
			initialAction: actions18.etfInvestmentOnceAction,
			userInputSchema: z.object({
				temporaryInitialPriceForTesting: z
					.number()
					.min(0)
					.default(10000)
					.describe("this description should be visible"),
			}),
			apply: (initialAction, userInput) => ({
				...initialAction,
				initialPrice: userInput.temporaryInitialPriceForTesting,
			}),
			iconImageHref: "/icons/etfInvestmentOnceAction.png",
			hardcodedPosition: { x: 650, y: 300 },
			isUnlocked: () => false,
		},
		{
			templateKind: "constant",
			action: actions18.etfInvestmentRepeatedAction,
			iconImageHref: "/icons/etfInvestmentRepeatedAction.png",
			hardcodedPosition: { x: 675, y: 325 },
			isUnlocked: () => false,
		},
		{
			templateKind: "constant",
			action: actions18.stocksInvestmentAction,
			iconImageHref: "/icons/stocksInvestmentAction.png",
			hardcodedPosition: { x: 675, y: 275 },
			isUnlocked: () => false,
		},
		{
			templateKind: "constant",
			action: actions18.cryptoInvestmentAction,
			iconImageHref: "/icons/cryptoInvestmentAction.png",
			hardcodedPosition: { x: 700, y: 250 },
			isUnlocked: () => false,
		},
		{
			templateKind: "constant",
			action: actions18.goldInvestmentAction,
			iconImageHref: "/icons/goldInvestmentAction.png",
			hardcodedPosition: { x: 725, y: 275 },
			isUnlocked: () => false,
		},
		{
			templateKind: "constant",
			action: actions18.skiTripAction,
			iconImageHref: "/icons/skiTripAction.png",
			hardcodedPosition: { x: 575, y: 325 },
			isUnlocked: () => false,
		},
		{
			templateKind: "constant",
			action: actions18.hobbyMotorbikeRidingAction,
			iconImageHref: "/icons/hobbyMotorbikeRidingAction.png",
			hardcodedPosition: { x: 550, y: 300 },
			isUnlocked: () => false,
		},
		{
			templateKind: "constant",
			action: actions18.partyingAction,
			iconImageHref: "/icons/partyingAction.png",
			hardcodedPosition: { x: 550, y: 350 },
			isUnlocked: () => false,
		},
		{
			templateKind: "constant",
			action: actions18.havingAKidAction,
			iconImageHref: "/icons/havingAKidAction.png",
			hardcodedPosition: { x: 600, y: 350 },
			isUnlocked: () => false,
		},
		{
			templateKind: "constant",
			action: actions18.waiterPartTimeJobAction,
			iconImageHref: "/icons/waiterPartTimeJobAction.png",
			hardcodedPosition: { x: 600, y: 250 },
			isUnlocked: () => false,
		},
		{
			templateKind: "constant",
			action: actions18.waiterFullTimeJobAction,
			iconImageHref: "/icons/waiterFullTimeJobAction.png",
			hardcodedPosition: { x: 625, y: 225 },
			isUnlocked: () => false,
		},
		{
			templateKind: "constant",
			action: actions18.juniorSweJobAction,
			iconImageHref: "/icons/juniorSweJobAction.png",
			hardcodedPosition: { x: 575, y: 225 },
			isUnlocked: () => false,
		},
		{
			templateKind: "constant",
			action: actions18.seniorSweJobAction,
			iconImageHref: "/icons/seniorSweJobAction.png",
			hardcodedPosition: { x: 600, y: 200 },
			isUnlocked: () => false,
		},
	]),
};
