import { createStore } from "@xstate/store";
import { Action, computeNextStep } from "../actions";
import {
	Quest,
	getLatestStep,
	getNewActionsPerStep,
	simulateWithActions,
} from "../quests";
import { standardQuests } from "../quests/standard-quests";

const initialQuestDescription = standardQuests["ivan"];

const initialQuest: Quest = {
	description: initialQuestDescription,
	steps: [initialQuestDescription.initialStep],
	currentStepIndex: 0,
};

export const questStore = createStore({
	context: initialQuest,
	on: {
		newStep: (quest, event: { newActions?: Action[] }) => {
			const latestStep = getLatestStep(quest);

			const nextStep = computeNextStep(
				latestStep,
				event.newActions ?? [],
				quest.description.tickKind
			);

			const newSteps = [...quest.steps, nextStep];
			return {
				...quest,
				steps: newSteps,
				currentStepIndex: newSteps.length - 1,
			};
		},
		currentStepIndexChange: (
			quest,
			event: { newCurrentStepIndex: number }
		) => {
			if (
				event.newCurrentStepIndex < 0 ||
				event.newCurrentStepIndex > quest.steps.length
			)
				return quest;

			return {
				...quest,
				currentStepIndex: event.newCurrentStepIndex,
			};
		},
		newActions: (quest, event: { newActions: Action[] }) => {
			const newActionsPerStep = getNewActionsPerStep(quest);
			newActionsPerStep[quest.currentStepIndex] = [
				...newActionsPerStep[quest.currentStepIndex],
				...event.newActions,
			];
			return {
				...quest,
				steps: simulateWithActions(
					quest.description,
					newActionsPerStep
				),
			};
		},
	},
});
