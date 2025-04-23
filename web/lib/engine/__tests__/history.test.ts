import { expect, test } from "vitest";
import { QuestDescription, simulateWithActions } from "../quests";
import { etfInvestmentOnceAction } from "../actions/standard-actions";

test("simulate with actions", () => {
	const INITIAL_BANK_ACCOUNT = 10000;

	const questDescription: QuestDescription = {
		personAge: 20,
		questLLMDescription: "John is a waiter",
		initialStep: {
			timePoint: 0,
			bankAccount: INITIAL_BANK_ACCOUNT,
			joy: 100,
			freeTimeHours: 100,
			newActions: [],
			continuingActions: [],
			experience: new Map(),
		},
		maxStepCount: 5,
		timePointKind: "year",
		goal: {
			description: "John wants to save 100000 BGN",
			goalReached: ({ lastStep }) => lastStep.bankAccount >= 100000,
		},
		actionTemplates: [],
		tutorialSteps: [],
	};

	const invest = (steps: number, capital: number) => ({
		...etfInvestmentOnceAction,
		remainingSteps: steps,
		capital,
	});

	const steps = simulateWithActions(questDescription, [
		[],
		[],
		[invest(10, 10000)],
		[],
		[],
		[],
	]);

	expect(steps[1].bankAccount).toBeCloseTo(10000);
	expect(steps[1].newActions).toEqual([]);
	expect(steps[1].continuingActions).toEqual([]);

	expect(steps[2].bankAccount).toBeCloseTo(0);
	expect(steps[2].newActions).toEqual([invest(10, 10000)]);
	expect(steps[2].continuingActions).toEqual([invest(9, 11442.537004494628)]);

	expect(steps[3].bankAccount).toBeCloseTo(0);
	expect(steps[3].newActions).toEqual([]);
	expect(steps[3].continuingActions).toEqual([invest(8, 10878.491998196578)]);

	expect(steps[4].bankAccount).toBeCloseTo(0);
	expect(steps[4].newActions).toEqual([]);
	expect(steps[4].continuingActions).toEqual([invest(7, 7126.628278066064)]);

	expect(steps[5].bankAccount).toBeCloseTo(0);
	expect(steps[5].newActions).toEqual([]);
	expect(steps[5].continuingActions).toEqual([invest(6, 10076.214372026796)]);
});
