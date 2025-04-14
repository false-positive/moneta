import { expect, test } from "vitest";
import {
	getActionDurations,
	getNewActionsPerStep,
	Quest,
	QuestDescription,
	simulateWithActions,
} from "../quests";
import {
	lifeAction,
	savingsDepositAction,
	waiterJobAction,
} from "../actions/standard-actions";

test("get new actions per step", () => {
	const INITIAL_BANK_ACCOUNT = 2000;

	const job = (ticks: number) => ({
		...waiterJobAction,
		remainingTicks: ticks,
	});
	const invest = (ticks: number, capital: number) => ({
		...savingsDepositAction,
		remainingTicks: ticks,
		capital,
	});

	const questDescription: QuestDescription = {
		personName: "John",
		questLLMDescription: "John is a waiter",
		initialStep: {
			tick: 0,
			bankAccount: INITIAL_BANK_ACCOUNT,
			joy: 100,
			freeTimeHours: 100,
			newActions: [],
			oldActiveActions: [lifeAction],
		},
		maxStepCount: 5,
		tickKind: "week",
	};

	const quest: Quest = {
		description: questDescription,
		steps: [
			// FIXME: Use proper values for metrics here
			questDescription.initialStep,
			{
				tick: 1,
				bankAccount: INITIAL_BANK_ACCOUNT,
				joy: 100,
				freeTimeHours: 100,
				newActions: [],
				oldActiveActions: [lifeAction],
			},
			{
				tick: 2,
				bankAccount: INITIAL_BANK_ACCOUNT,
				joy: 100,
				freeTimeHours: 100,
				newActions: [job(1)],
				oldActiveActions: [lifeAction],
			},
			{
				tick: 3,
				bankAccount: INITIAL_BANK_ACCOUNT,
				joy: 100,
				freeTimeHours: 100,
				newActions: [invest(2, 1000)],
				oldActiveActions: [lifeAction, job(1)],
			},
			{
				tick: 4,
				bankAccount: INITIAL_BANK_ACCOUNT,
				joy: 100,
				freeTimeHours: 100,
				newActions: [],
				oldActiveActions: [lifeAction, job(0), invest(1, 1000 * 1.002)],
			},
			{
				tick: 5,
				bankAccount: INITIAL_BANK_ACCOUNT,
				joy: 100,
				freeTimeHours: 100,
				newActions: [],
				oldActiveActions: [lifeAction, invest(0, 1000 * 1.002 * 1.002)],
			},
		],
		currentStepIndex: 0,
	};

	const newActionsPerStep = getNewActionsPerStep(quest);
	expect(newActionsPerStep).toEqual([
		[],
		[],
		[job(1)],
		[invest(2, 1000)],
		[],
		[],
	]);
});

test("simulate with actions", () => {
	const INITIAL_BANK_ACCOUNT = 2000;

	const questDescription: QuestDescription = {
		personName: "John",
		questLLMDescription: "John is a waiter",
		initialStep: {
			tick: 0,
			bankAccount: INITIAL_BANK_ACCOUNT,
			joy: 100,
			freeTimeHours: 100,
			newActions: [],
			oldActiveActions: [lifeAction],
		},
		maxStepCount: 5,
		tickKind: "week",
	};

	const job = (ticks: number) => ({
		...waiterJobAction,
		remainingTicks: ticks,
	});
	const invest = (ticks: number, capital: number) => ({
		...savingsDepositAction,
		remainingTicks: ticks,
		capital,
	});

	const steps = simulateWithActions(questDescription, [
		[],
		[],
		[job(2)],
		[invest(2, 1000)],
		[],
		[],
	]);

	expect(steps.length).toBe(6);

	const inflation = 1 - 2 / 100 / 12;

	let expectedBankAccount = (INITIAL_BANK_ACCOUNT - 1000) * inflation;
	let expectedJoy = 100 * 0.9;

	expect(steps[1].bankAccount).toBeCloseTo(expectedBankAccount);
	expect(steps[1].joy).toBeCloseTo(expectedJoy);
	expect(steps[1].freeTimeHours).toBe(100);
	expect(steps[1].newActions).toEqual([]);
	expect(steps[1].oldActiveActions).toEqual([lifeAction]);

	expectedBankAccount = (expectedBankAccount - 1000) * inflation + 1000;
	expectedJoy = expectedJoy * 0.9 * 0.95;

	expect(steps[2].bankAccount).toBeCloseTo(expectedBankAccount);
	expect(steps[2].joy).toBeCloseTo(expectedJoy);
	expect(steps[2].freeTimeHours).toBe(80);
	expect(steps[2].newActions).toEqual([job(2)]);
	expect(steps[2].oldActiveActions).toEqual([lifeAction, job(1)]);

	expectedBankAccount =
		(expectedBankAccount - 1000) * inflation + 1000 - 1000;
	expectedJoy = expectedJoy * 0.9 * 0.95;

	expect(steps[3].bankAccount).toBeCloseTo(expectedBankAccount);
	expect(steps[3].joy).toBeCloseTo(expectedJoy);
	expect(steps[3].freeTimeHours).toBe(80);
	expect(steps[3].newActions).toEqual([invest(2, 1000)]);
	expect(steps[3].oldActiveActions).toEqual([
		lifeAction,
		job(0),
		invest(1, 1000 * 1.002),
	]);

	expectedBankAccount = (expectedBankAccount - 1000) * inflation;
	expectedJoy = expectedJoy * 0.9;

	expect(steps[4].bankAccount).toBeCloseTo(expectedBankAccount);
	expect(steps[4].joy).toBeCloseTo(expectedJoy);
	expect(steps[4].freeTimeHours).toBe(100);
	expect(steps[4].newActions).toEqual([]);
	expect(steps[4].oldActiveActions).toEqual([
		lifeAction,
		invest(0, 1000 * 1.002 * 1.002),
	]);

	expectedBankAccount =
		(expectedBankAccount - 1000) * inflation + 1000 * 1.002 * 1.002;
	expectedJoy = expectedJoy * 0.9;

	expect(steps[5].bankAccount).toBeCloseTo(expectedBankAccount);
	expect(steps[5].joy).toBeCloseTo(expectedJoy);
	expect(steps[5].freeTimeHours).toBe(100);
	expect(steps[5].newActions).toEqual([]);
	expect(steps[5].oldActiveActions).toEqual([lifeAction]);
	expect(steps[5].tick).toBe(5);
});

test("get action durations", () => {
	const INITIAL_BANK_ACCOUNT = 2000;

	const questDescription: QuestDescription = {
		personName: "John",
		questLLMDescription: "John is a waiter",
		initialStep: {
			tick: 0,
			bankAccount: INITIAL_BANK_ACCOUNT,
			joy: 100,
			freeTimeHours: 100,
			newActions: [],
			oldActiveActions: [lifeAction],
		},
		maxStepCount: 5,
		tickKind: "week",
	};

	const job = (ticks: number) => ({
		...waiterJobAction,
		remainingTicks: ticks,
	});

	const invest = (ticks: number, capital: number) => ({
		...savingsDepositAction,
		remainingTicks: ticks,
		capital,
	});

	const quest: Quest = {
		description: questDescription,
		steps: [
			// FIXME: Use proper values for metrics here
			questDescription.initialStep,
			{
				tick: 1,
				bankAccount: INITIAL_BANK_ACCOUNT,
				joy: 100,
				freeTimeHours: 100,
				newActions: [],
				oldActiveActions: [lifeAction],
			},
			{
				tick: 2,
				bankAccount: INITIAL_BANK_ACCOUNT,
				joy: 100,
				freeTimeHours: 100,
				newActions: [job(1)],
				oldActiveActions: [lifeAction],
			},
			{
				tick: 3,
				bankAccount: INITIAL_BANK_ACCOUNT,
				joy: 100,
				freeTimeHours: 100,
				newActions: [invest(2, 1000)],
				oldActiveActions: [lifeAction, job(1)],
			},
			{
				tick: 4,
				bankAccount: INITIAL_BANK_ACCOUNT,
				joy: 100,
				freeTimeHours: 100,
				newActions: [],
				oldActiveActions: [lifeAction, job(0), invest(1, 1000 * 1.002)],
			},
			{
				tick: 5,
				bankAccount: INITIAL_BANK_ACCOUNT,
				joy: 100,
				freeTimeHours: 100,
				newActions: [],
				oldActiveActions: [lifeAction, invest(0, 1000 * 1.002 * 1.002)],
			},
		],
		currentStepIndex: 0,
	};

	const actionDurations = getActionDurations(quest);
	expect(actionDurations).toEqual([
		{
			action: job(1),
			startTick: 2,
			endTick: 2,
		},
		{
			action: invest(2, 1000),
			startTick: 3,
			endTick: 4,
		},
	]);
});
