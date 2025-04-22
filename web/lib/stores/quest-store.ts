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
			event: { stepIdx: number; actionIdx: number }
		) => {
			if (quest.currentStepIndex > quest.greatestUnlockedStepIndex) {
				return quest;
			}

			const newSteps = stopAction(quest, event.stepIdx, event.actionIdx);

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
			event: { stepIdx: number; actionIdx: number }
		) => {
			if (quest.currentStepIndex > quest.greatestUnlockedStepIndex) {
				return quest;
			}

			const newSteps = deleteAction(
				quest,
				event.stepIdx,
				event.actionIdx
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

function stopAction(quest: Quest, stepIdx: number, actionIdx: number) {
	const newActionsPerStep = getNewActionsPerStep(quest);

	if (stepIdx != -1 || quest.currentStepIndex > stepIdx) {
		newActionsPerStep[stepIdx][actionIdx].remainingSteps =
			quest.currentStepIndex - stepIdx;
	} else {
		return null;
	}

	return simulateWithActions(quest.description, newActionsPerStep);
}

function deleteAction(quest: Quest, stepIdx: number, actionIdx: number) {
	const newActionsPerStep = getNewActionsPerStep(quest);

	if (stepIdx != -1 || quest.currentStepIndex > stepIdx) {
		newActionsPerStep[stepIdx].splice(actionIdx, 1);
	} else {
		return null;
	}

	return simulateWithActions(quest.description, newActionsPerStep);
}
