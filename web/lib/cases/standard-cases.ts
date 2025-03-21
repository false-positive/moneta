import { CaseDescription } from ".";

export const standardCases: Record<string, CaseDescription> = {
	ivan: {
		personName: "Ivan",
		caseLLMDescriptipn:
			"Ivan is 6 years old and has 20 levs monthly allowance, which he spends on buying breakfast, lunch and snacks",
		stepCount: 1,
		initialStep: {
			tick: 0,
			bankAccount: 20,
			joy: 100,
			freeTime: 100,
			newActions: [],
			oldActiveActions: [],
		},
	},
	marti: {
		personName: "Marti",
		caseLLMDescriptipn: "...",
		stepCount: 1,
		initialStep: {
			tick: 0,
			bankAccount: 20,
			joy: 100,
			freeTime: 100,
			newActions: [],
			oldActiveActions: [],
		},
	},
};
