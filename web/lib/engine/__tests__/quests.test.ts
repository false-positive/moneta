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

	const job = (steps: number) => ({
		...waiterJobAction,
		remainingSteps: steps,
	});
	const invest = (steps: number, capital: number) => ({
		...savingsDepositAction,
		remainingSteps: steps,
		capital,
	});

	const questDescription: QuestDescription = {
		personAge: 20,
		questLLMDescription: "John is a waiter",
		initialStep: {
			timePoint: 0,
			bankAccount: INITIAL_BANK_ACCOUNT,
			joy: 100,
			freeTimeHours: 100,
			newActions: [],
			continuingActions: [lifeAction],
			experience: new Map(),
		},
		maxStepCount: 5,
		timePointKind: "week",
		goal: {
			description: "John wants to save 100000 BGN",
			goalReached: ({ lastStep }) => lastStep.bankAccount >= 100000,
		},
		actionTemplates: [],
		tutorialSteps: [],
	};

	const quest: Quest = {
		description: questDescription,
		steps: [
			// FIXME: Use proper values for metrics here
			questDescription.initialStep,
			{
				timePoint: 1,
				bankAccount: INITIAL_BANK_ACCOUNT,
				joy: 100,
				freeTimeHours: 100,
				newActions: [],
				continuingActions: [lifeAction],
				experience: new Map(),
			},
			{
				timePoint: 2,
				bankAccount: INITIAL_BANK_ACCOUNT,
				joy: 100,
				freeTimeHours: 100,
				newActions: [job(1)],
				continuingActions: [lifeAction],
				experience: new Map(),
			},
			{
				timePoint: 3,
				bankAccount: INITIAL_BANK_ACCOUNT,
				joy: 100,
				freeTimeHours: 100,
				newActions: [invest(2, 1000)],
				continuingActions: [lifeAction, job(1)],
				experience: new Map(),
			},
			{
				timePoint: 4,
				bankAccount: INITIAL_BANK_ACCOUNT,
				joy: 100,
				freeTimeHours: 100,
				newActions: [],
				continuingActions: [
					lifeAction,
					job(0),
					invest(1, 1000 * 1.002),
				],
				experience: new Map(),
			},
			{
				timePoint: 5,
				bankAccount: INITIAL_BANK_ACCOUNT,
				joy: 100,
				freeTimeHours: 100,
				newActions: [],
				continuingActions: [
					lifeAction,
					invest(0, 1000 * 1.002 * 1.002),
				],
				experience: new Map(),
			},
		],
		currentStepIndex: 0,
		greatestUnlockedStepIndex: 5,
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
		personAge: 20,
		questLLMDescription: "John is a waiter",
		initialStep: {
			timePoint: 0,
			bankAccount: INITIAL_BANK_ACCOUNT,
			joy: 100,
			freeTimeHours: 100,
			newActions: [],
			continuingActions: [lifeAction],
			experience: new Map(),
		},
		maxStepCount: 5,
		timePointKind: "week",
		goal: {
			description: "John wants to save 100000 BGN",
			goalReached: ({ lastStep }) => lastStep.bankAccount >= 100000,
		},
		actionTemplates: [],
		tutorialSteps: [],
	};

	const job = (steps: number) => ({
		...waiterJobAction,
		remainingSteps: steps,
	});
	const invest = (steps: number, capital: number) => ({
		...savingsDepositAction,
		remainingSteps: steps,
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
	expect(steps[1].continuingActions).toEqual([lifeAction]);

	expectedBankAccount = (expectedBankAccount - 1000) * inflation + 1000;
	expectedJoy = expectedJoy * 0.9 * 0.95;

	expect(steps[2].bankAccount).toBeCloseTo(expectedBankAccount);
	expect(steps[2].joy).toBeCloseTo(expectedJoy);
	expect(steps[2].freeTimeHours).toBe(80);
	expect(steps[2].newActions).toEqual([job(2)]);
	expect(steps[2].continuingActions).toEqual([lifeAction, job(1)]);

	expectedBankAccount =
		(expectedBankAccount - 1000) * inflation + 1000 - 1000;
	expectedJoy = expectedJoy * 0.9 * 0.95;

	expect(steps[3].bankAccount).toBeCloseTo(expectedBankAccount);
	expect(steps[3].joy).toBeCloseTo(expectedJoy);
	expect(steps[3].freeTimeHours).toBe(80);
	expect(steps[3].newActions).toEqual([invest(2, 1000)]);
	expect(steps[3].continuingActions).toEqual([
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
	expect(steps[4].continuingActions).toEqual([
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
	expect(steps[5].continuingActions).toEqual([lifeAction]);
	expect(steps[5].timePoint).toBe(5);
});

test("get action durations", () => {
	const INITIAL_BANK_ACCOUNT = 2000;

	const questDescription: QuestDescription = {
		personAge: 20,
		questLLMDescription: "John is a waiter",
		initialStep: {
			timePoint: 0,
			bankAccount: INITIAL_BANK_ACCOUNT,
			joy: 100,
			freeTimeHours: 100,
			newActions: [],
			continuingActions: [lifeAction],
			experience: new Map(),
		},
		maxStepCount: 5,
		timePointKind: "week",
		goal: {
			description: "John wants to save 100000 BGN",
			goalReached: ({ lastStep }) => lastStep.bankAccount >= 100000,
		},
		actionTemplates: [],
		tutorialSteps: [],
	};

	const job = (steps: number) => ({
		...waiterJobAction,
		remainingSteps: steps,
	});

	const invest = (steps: number, capital: number) => ({
		...savingsDepositAction,
		remainingSteps: steps,
		capital,
	});

	const quest: Quest = {
		description: questDescription,
		steps: [
			// FIXME: Use proper values for metrics here
			questDescription.initialStep,
			{
				timePoint: 1,
				bankAccount: INITIAL_BANK_ACCOUNT,
				joy: 100,
				freeTimeHours: 100,
				newActions: [],
				continuingActions: [lifeAction],
				experience: new Map(),
			},
			{
				timePoint: 2,
				bankAccount: INITIAL_BANK_ACCOUNT,
				joy: 100,
				freeTimeHours: 100,
				newActions: [job(1)],
				continuingActions: [lifeAction],
				experience: new Map(),
			},
			{
				timePoint: 3,
				bankAccount: INITIAL_BANK_ACCOUNT,
				joy: 100,
				freeTimeHours: 100,
				newActions: [invest(2, 1000)],
				continuingActions: [lifeAction, job(1)],
				experience: new Map(),
			},
			{
				timePoint: 4,
				bankAccount: INITIAL_BANK_ACCOUNT,
				joy: 100,
				freeTimeHours: 100,
				newActions: [],
				continuingActions: [
					lifeAction,
					job(0),
					invest(1, 1000 * 1.002),
				],
				experience: new Map(),
			},
			{
				timePoint: 5,
				bankAccount: INITIAL_BANK_ACCOUNT,
				joy: 100,
				freeTimeHours: 100,
				newActions: [],
				continuingActions: [
					lifeAction,
					invest(0, 1000 * 1.002 * 1.002),
				],
				experience: new Map(),
			},
		],
		currentStepIndex: 0,
		greatestUnlockedStepIndex: 5,
	};

	const actionDurations = getActionDurations(quest);
	expect(actionDurations).toEqual([
		{
			action: job(1),
			startTimePoint: 2,
			endTimePoint: 2,
		},
		{
			action: invest(2, 1000),
			startTimePoint: 3,
			endTimePoint: 4,
		},
	]);
});
