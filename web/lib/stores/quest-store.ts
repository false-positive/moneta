import { Action } from "@/lib/engine/actions";
import {
	Quest,
	getNewActionsPerStep,
	simulateWithActions,
} from "@/lib/engine/quests";
import { createStore } from "@xstate/store";
import { questDescriptions } from "../engine/quests/descriptions";

const initialQuestDescription = questDescriptions.tutorial;

const initialQuest: Quest = {
	description: initialQuestDescription,
	steps: simulateWithActions(initialQuestDescription, [
		initialQuestDescription.initialStep.newActions,
		...Array(initialQuestDescription.maxStepCount - 1).fill([]),
	]),
	currentStepIndex: 0,
	greatestUnlockedStepIndex: 0,
};

export const questStore = createStore({
	context: initialQuest,
	on: {
		newActionsAppend: (quest, event: { newActions: Action[] }) => {
			if (quest.currentStepIndex > quest.greatestUnlockedStepIndex) {
				return quest;
			}

			return {
				...quest,
				steps: appendAtCurrentStepIndex(quest, event.newActions),
				greatestUnlockedStepIndex: Math.max(
					quest.greatestUnlockedStepIndex,
					quest.currentStepIndex + 1
				),
			};
		},
		currentStepStopAction: (
			quest,
			event: { stepIndex: number; actionIndex: number }
		) => {
			if (quest.currentStepIndex > quest.greatestUnlockedStepIndex) {
				return quest;
			}

			const newSteps = stopAction(
				quest,
				event.stepIndex,
				event.actionIndex
			);

			if (!newSteps) {
				return quest;
			}

			return {
				...quest,
				steps: newSteps,
				currentStepIndex: newSteps.length - 1,
			};
		},
		currentStepDeleteAction: (
			quest,
			event: { stepIndex: number; actionIndex: number }
		) => {
			if (quest.currentStepIndex > quest.greatestUnlockedStepIndex) {
				return quest;
			}

			const newSteps = deleteAction(
				quest,
				event.stepIndex,
				event.actionIndex
			);

			if (!newSteps) {
				return quest;
			}

			return {
				...quest,
				steps: newSteps,
				// currentStepIndex: newSteps.length - 1,
				// Remvoed this - RETURN IF SIM BREAKS
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
	},
});

console.log("[Quest Store], initial quest", questStore.get());
questStore.subscribe((snapshot) => {
	console.log("[Quest Store], snapshot.status", snapshot.context);
});

function appendAtCurrentStepIndex(quest: Quest, newActions: Action[]) {
	const newActionsPerStep = getNewActionsPerStep(quest);

	newActionsPerStep[quest.currentStepIndex] = [
		...(newActionsPerStep[quest.currentStepIndex] || []),
		...newActions,
	];

	return simulateWithActions(quest.description, newActionsPerStep);
}

function stopAction(quest: Quest, stepIndex: number, actionIndex: number) {
	const newActionsPerStep = getNewActionsPerStep(quest);

	if (stepIndex != -1 || quest.currentStepIndex > stepIndex) {
		newActionsPerStep[stepIndex][actionIndex].remainingSteps =
			quest.currentStepIndex - stepIndex;
	} else {
		return null;
	}

	return simulateWithActions(quest.description, newActionsPerStep);
}

function deleteAction(quest: Quest, stepIndex: number, actionIndex: number) {
	const newActionsPerStep = getNewActionsPerStep(quest);

	if (stepIndex != -1 || quest.currentStepIndex > stepIndex) {
		newActionsPerStep[stepIndex].splice(actionIndex, 1);
	} else {
		return null;
	}

	return simulateWithActions(quest.description, newActionsPerStep);
}
