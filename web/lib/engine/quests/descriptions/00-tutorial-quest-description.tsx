import { QuestDescription } from "..";
import { lifeAction } from "@/lib/engine/actions/standard-actions";

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
};
