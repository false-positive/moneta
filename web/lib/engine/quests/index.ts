import invariant from "tiny-invariant";
import { Action, computeNextStep, Step, TickKind } from "../actions";

/**
 * A description of a quest, predefined in the given levels.
 */
export type QuestDescription = {
	/**
	 * The name of the person that the quest is about.
	 * @deprecated No longer makes sense in the project.
	 */
	personName: string;
	/**
	 * A description of the quest for LLM context.
	 */
	questLLMDescription: string;
	/**
	 * The maximum number of steps in the quest.
	 * When this number is reached, the quest is finished. Simulation cannot
	 * continue after this.
	 */
	maxStepCount: number;
	/**
	 * The initial step of the quest.
	 * It includes the initial values of all metrics, as well as the initial
	 * actions that are relevant before the user makes any decisions.
	 *
	 * The user can add actions to this step by making decisions immediately
	 * after the quest starts and before they advance to the next tick. They
	 * will be appended after any pre-defined new actions.
	 */
	initialStep: Step;
	/**
	 * The kind of tick to use for the quest.
	 */
	tickKind: TickKind;
};

/**
 * The specific instance of a quest, specific to the user. It is based on an initial {@link QuestDescription}.
 */
export type Quest = {
	/**
	 * The description of the quest, predefined by the application.
	 *
	 * This won't change during the quest and describes the baseline scenario.
	 */
	description: QuestDescription;
	/**
	 * The steps of the quest.
	 *
	 * These steps include the actions added as a result of the user's decisions.
	 */
	steps: Step[];
	/**
	 * The index of the step, which the user is currently on.
	 *
	 * A user can select any existing step as the current one and if they add any actions, they will be added to the current step.
	 *
	 * Value will always be within the bounds of {@link QuestDescription.maxStepCount}.
	 */
	currentStepIndex: number;
};

/**
 * Distills a list of actions that were added in each step
 *
 * This is used to take the guts out of the current simulation, throw it away and simulate it again with modified actions.
 *
 * @param quest - The quest to distill the actions from.
 * @returns A list of actions that were added in each step.
 */
export function getNewActionsPerStep(quest: Quest) {
	return quest.steps.map((step) => {
		return step.newActions;
	});
}

/**
 * Simulates the quest with the given actions.
 *
 * @param questDescription - The description of the quest.
 * @param newActionsPerStep - A list of actions that were added in each step. Can be obtained from a previous quest simulation with {@link getNewActionsPerStep}.
 * @returns A list of new steps that were simulated.
 */
export function simulateWithActions(
	questDescription: QuestDescription,
	newActionsPerStep: Action[][]
) {
	const firstStep = {
		...questDescription.initialStep,
		newActions: [
			...questDescription.initialStep.newActions,
			...newActionsPerStep[0],
		],
	};
	const steps = [firstStep];
	for (const actions of newActionsPerStep.slice(1)) {
		steps.push(
			computeNextStep(
				steps[steps.length - 1],
				actions,
				questDescription.tickKind
			)
		);
	}
	return steps;
}

/**
 * Get the step of the quest with the greatest tick value.
 *
 * @param quest - The quest to get the latest step from.
 * @returns The step with the greatest tick value.
 */
export function getLatestStep(quest: Quest) {
	const latestStep = quest.steps.at(-1);
	invariant(latestStep, "No steps in quest");
	return latestStep;
}

/**
 * Get the durations of all actions in the quest.
 *
 * For each new action, it returns an object with the action, the tick on which it started and the tick on which it ended.
 *
 * The `startTick` is the first tick, on which the action was added to the step (inclusive).
 * The `endTick` is the last tick, on which the action was relevant (inclusive).
 *
 * Example:
 *
 * If the action is added to the step on tick 2025 and it lasts for 3 ticks,
 * the returned object will have `startTick` 2025 and `endTick` 2027.
 *
 * @param quest - The quest to get the action durations from.
 * @returns A list of action durations.
 */
export function getActionDurations(quest: Quest) {
	return quest.steps.flatMap((step) => {
		return step.newActions.map((action) => ({
			action,
			startTick: step.tick,
			endTick: step.tick + action.remainingTicks - 1,
		}));
	});
}
