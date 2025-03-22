import { CaseDescription } from ".";
import { lifeAction } from "./standard-actions";

export const standardCases: Record<string, CaseDescription> = {
	ivan: {
		personName: "Ivan",
		caseLLMDescriptipn:
			"Ivan is 6 years old and has 20 levs monthly allowance, which he spends on buying breakfast, lunch and snacks",
		stepCount: 1,
		tickKind: "month",
		initialStep: {
			tick: 0,
			isBankAccountKnown: true,
			bankAccount: 20,
			isJoyKnown: true,
			joy: 100,
			isFreeTimeKnown: true,
			freeTime: 100,
			newActions: [],
			oldActiveActions: [lifeAction],
		},
	},
	marti: {
		personName: "Marti",
		caseLLMDescriptipn:
			"Marti is 10 years old and has 100 levs monthly allowance, which he spends on buying breakfast, lunch and snacks",
		stepCount: 5,
		tickKind: "year",
		initialStep: {
			tick: 0,
			isBankAccountKnown: true,
			bankAccount: 20,
			isJoyKnown: true,
			joy: 100,
			isFreeTimeKnown: true,
			freeTime: 100,
			newActions: [],
			oldActiveActions: [lifeAction],
		},
	},
	maria: {
		personName: "Ivan",
		caseLLMDescriptipn:
			"Ivan is 18 years old and has 1000 BGN monthly allowance, which he spends on buying food, clothes and other stuff",
		stepCount: 5,
		tickKind: "year",
		initialStep: {
			tick: 2020,
			bankAccount: 20000,
			joy: 100,
			freeTime: 100,
			newActions: [],
			isBankAccountKnown: true,
			isJoyKnown: true,
			isFreeTimeKnown: true,
			oldActiveActions: [{ ...lifeAction }],
		},
	},
};
