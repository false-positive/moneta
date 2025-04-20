import { expect, test } from "vitest";
import { getNewActionsPerStep } from "../quests";
import { questStore } from "@/lib/stores/quest-store";
import {
	savingsDepositAction,
	waiterJobAction,
} from "../actions/standard-actions";

test("add new actions per step", () => {
	const job = (steps: number) => ({
		...waiterJobAction,
		remainingSteps: steps,
	});
	const invest = (steps: number, capital: number) => ({
		...savingsDepositAction,
		remainingSteps: steps,
		capital,
	});

	questStore.send({
		type: "newActionsAppend",
		newActions: [],
	});

	questStore.send({
		type: "newActionsAppend",
		newActions: [job(Infinity), invest(2, 1000)],
	});

	const quest = questStore.get().context;

	const newActionsPerStep = getNewActionsPerStep(quest);
	expect(newActionsPerStep).toEqual([
		[],
		[job(Infinity), invest(2, 1000)],
		[],
	]);
});

test("stop given action", () => {
	const job = (steps: number) => ({
		...waiterJobAction,
		remainingSteps: steps,
	});
	const invest = (steps: number, capital: number) => ({
		...savingsDepositAction,
		remainingSteps: steps,
		capital,
	});

	//TODO: Reset Quest store functionality?
	//TODO: Investigate possible bug related to the behavior of simulateWithActions() which duplicates the first step actions when currentStepStopAction is called on an action in the first step
	questStore.send({
		type: "currentStepStopAction",
		stepIdx: 1,
		actionIdx: 0,
	});

	const quest = questStore.get().context;

	const newActionsPerStep = getNewActionsPerStep(quest);
	console.log(newActionsPerStep);
	expect(newActionsPerStep).toEqual([[], [job(1), invest(2, 1000)], []]);
});

test("delete given action", () => {
	const job = (steps: number) => ({
		...waiterJobAction,
		remainingSteps: steps,
	});
	const invest = (steps: number, capital: number) => ({
		...savingsDepositAction,
		remainingSteps: steps,
		capital,
	});

	//TODO: Reset Quest store functionality?
	//TODO: Investigate possible bug related to the behavior of simulateWithActions() which duplicates the first step actions when currentStepStopAction is called on an action in the first step
	questStore.send({
		type: "currentStepDeleteAction",
		stepIdx: 1,
		actionIdx: 0,
	});

	const quest = questStore.get().context;

	const newActionsPerStep = getNewActionsPerStep(quest);
	console.log(newActionsPerStep);
	expect(newActionsPerStep).toEqual([[], [invest(2, 1000)], []]);
});
