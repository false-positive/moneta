import { CaseDescription } from ".";
import { lifeAction } from "./standard-actions";

export const standardCases: Record<string, CaseDescription> = {
	ivan: {
		personName: "Maria",
		caseLLMDescriptipn:
			"Maria is 6 years old and has 100 BGN monthly allowance, which she spends on buying food, clothes and other stuff",
		stepCount: 1,
		tickKind: "month",
		initialStep: {
			tick: 0,
			bankAccount: 100,
			joy: 100,
			freeTime: 100,
			newActions: [],
			oldActiveActions: [lifeAction],
		},
	},
	marti: {
		personName: "Marti",
		caseLLMDescriptipn:
			"Marti is 10 years old and has 20 BGN monthly allowance, which she spends on buying breakfast, lunch and snacks",
		stepCount: 5,
		tickKind: "year",
		initialStep: {
			tick: 0,
			bankAccount: 20,
			joy: 100,
			freeTime: 100,
			newActions: [],
			oldActiveActions: [lifeAction],
		},
	},
	maria: {
		personName: "Ivan",
		caseLLMDescriptipn:
			"Ivan is 18 years old and has 5000 BGN in his bank account, which he spends on buying food, clothes and other stuff",
		stepCount: 5,
		tickKind: "year",
		initialStep: {
			tick: 2020,
			bankAccount: 5000,
			joy: 100,
			freeTime: 100,
			newActions: [],
			oldActiveActions: [{ ...lifeAction }],
		},
	},
};
