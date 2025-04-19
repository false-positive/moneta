import { createStore } from "@xstate/store";
import { Action, computeNextStep } from "@/lib/engine/actions";
import {
	Quest,
	getLatestStep,
	getNewActionsPerStep,
	simulateWithActions,
} from "@/lib/engine/quests";
import { standardQuests } from "@/lib/engine/quests/standard-quests";

const initialQuestDescription = standardQuests["maria"];

const initialQuest: Quest = {
	description: initialQuestDescription,
	steps: [initialQuestDescription.initialStep],
	currentStepIndex: 0,
};

export const questStore = createStore({
	context: initialQuest,
	on: {
		newActionsAppend: (quest, event: { newActions: Action[] }) => {
			// FIXME: maybe refactor check into a quest function
			const newSteps =
				quest.currentStepIndex === quest.steps.length - 1 &&
				quest.steps.length < quest.description.maxStepCount
					? appendAtEndAndAdvance(quest, event.newActions)
					: appendAtCurrentStepIndex(quest, event.newActions);

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

questStore.subscribe((snapshot) => {
	console.log("[Quest Store], snapshot.status", snapshot.context);
});

function appendAtEndAndAdvance(quest: Quest, newActions: Action[]) {
	const latestStep = getLatestStep(quest);

	latestStep.newActions = latestStep.newActions.concat(newActions);

	const nextStep = computeNextStep(
		latestStep,
		[],
		quest.description.timePointKind
	);

	return [...quest.steps, nextStep];
}

function appendAtCurrentStepIndex(quest: Quest, newActions: Action[]) {
	const newActionsPerStep = getNewActionsPerStep(quest);

	newActionsPerStep[quest.currentStepIndex] = [
		...(newActionsPerStep[quest.currentStepIndex] || []),
		...newActions,
	];

	return simulateWithActions(quest.description, newActionsPerStep);
}
