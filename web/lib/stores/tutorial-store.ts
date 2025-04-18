import { createStore } from "@xstate/store";
import { tutorialSteps } from "../engine/tutorials";

export const tutorialStore = createStore({
	context: {
		steps: tutorialSteps,
		currentStepIndex: 0,
	},
	on: {
		nextStep: (context) => {
			return {
				...context,
				currentStepIndex: context.currentStepIndex + 1,
			};
		},
	},
});

console.log("[Tutorial Store]", tutorialStore.getSnapshot());

tutorialStore.subscribe((snapshot) => {
	console.log("[Tutorial Store]", snapshot);
});
