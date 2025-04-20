import { createStore } from "@xstate/store";
import { Action, computeNextStep } from "@/lib/engine/actions";
import {
	Quest,
	getLatestStep,
	getNewActionsPerStep,
	simulateWithActions,
} from "@/lib/engine/quests";
import { questDescriptions } from "../engine/quests/descriptions";
import { aC } from "vitest/dist/chunks/reporters.d.CqBhtcTq.js";
import { act } from "react";
import { steps } from "framer-motion";

const initialQuestDescription = questDescriptions.tutorial;

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
		currentStepStopAction: (quest, event: { action: Action }) => {
			const newSteps = stopAction(quest, event.action);

			if (newSteps.length == 0) {
				return quest;
			}

			return {
				...quest,
				steps: newSteps,
				currentStepIndex: newSteps.length - 1,
			};
		},
		currentStepDeleteAction: (quest, event: { action: Action }) => {
			const newSteps = deleteAction(quest, event.action);

			if (newSteps.length == 0) {
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

function indexAction(newActionsPerStep: Action[][], action: Action) {
	var actionStartStep = -1,
		actionIndex = -1;
	for (let step = 0; step < newActionsPerStep.length; step++) {
		for (
			let iteratedActionIndex = 0;
			iteratedActionIndex < newActionsPerStep[step].length;
			iteratedActionIndex++
		) {
			if (
				(action.name =
					newActionsPerStep[step][iteratedActionIndex].name)
			) {
				actionStartStep = step;
				actionIndex = iteratedActionIndex;
			}
		}
	}

	return [actionStartStep, actionIndex];
}

function stopAction(quest: Quest, action: Action) {
	const newActionsPerStep = getNewActionsPerStep(quest);

	const [actionStartStep, actionIndex] = indexAction(
		newActionsPerStep,
		action
	);

	if (actionStartStep != -1 || quest.currentStepIndex > actionStartStep) {
		newActionsPerStep[actionStartStep][actionIndex].remainingSteps =
			quest.currentStepIndex - actionStartStep;
	} else {
		return [];
	}

	return simulateWithActions(quest.description, newActionsPerStep);
}

function deleteAction(quest: Quest, action: Action) {
	const newActionsPerStep = getNewActionsPerStep(quest);

	const [actionStartStep, actionIndex] = indexAction(
		newActionsPerStep,
		action
	);

	if (actionStartStep != -1 || quest.currentStepIndex > actionStartStep) {
		newActionsPerStep[actionStartStep].splice(actionIndex, 1);
	} else {
		return [];
	}

	return simulateWithActions(quest.description, newActionsPerStep);
}
