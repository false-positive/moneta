import { QuestDescription } from ".";
import { lifeAction } from "../actions/standard-actions";

export const standardQuests: Record<string, QuestDescription> = {
	ivan: {
		personAge: 18,
		questLLMDescription:
			"Maria is 6 years old and has 100 BGN monthly allowance, which she spends on buying food, clothes and other stuff",
		maxStepCount: 1,
		timePointKind: "month",
		initialStep: {
			timePoint: 0,
			bankAccount: 100,
			joy: 100,
			freeTimeHours: 100,
			newActions: [],
			continuingActions: [lifeAction],
		},
	},
	marti: {
		personAge: 10,
		questLLMDescription:
			"Marti is 10 years old and has 20 BGN monthly allowance, which she spends on buying breakfast, lunch and snacks",
		maxStepCount: 5,
		timePointKind: "year",
		initialStep: {
			timePoint: 0,
			bankAccount: 20,
			joy: 100,
			freeTimeHours: 100,
			newActions: [],
			continuingActions: [lifeAction],
		},
	},
	maria: {
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
	},
};
