import { expect, test } from "vitest";
import { QuestDescription, simulateWithActions } from "../quests";
import { etfInvestmentOnceAction } from "../actions/standard-actions";

test("simulate with actions", () => {
	const INITIAL_BANK_ACCOUNT = 10000;

	const questDescription: QuestDescription = {
		personName: "John",
		questLLMDescription: "John is a waiter",
		initialStep: {
			tick: 0,
			bankAccount: INITIAL_BANK_ACCOUNT,
			joy: 100,
			freeTime: 100,
			newActions: [],
			oldActiveActions: [],
		},
		stepCount: 5,
		tickKind: "year",
	};

	const invest = (ticks: number, capital: number) => ({
		...etfInvestmentOnceAction,
		remainingTicks: ticks,
		capital,
	});

	const steps = simulateWithActions(questDescription, [
		[],
		[invest(10, 10000)],
		[],
		[],
		[],
	]);

	expect(steps[1].bankAccount).toBeCloseTo(10000);
	expect(steps[1].newActions).toEqual([]);
	expect(steps[1].oldActiveActions).toEqual([]);

	expect(steps[2].bankAccount).toBeCloseTo(0);
	expect(steps[2].newActions).toEqual([invest(10, 10000)]);
	expect(steps[2].oldActiveActions).toEqual([invest(9, 11442.537004494628)]);

	expect(steps[3].bankAccount).toBeCloseTo(0);
	expect(steps[3].newActions).toEqual([]);
	expect(steps[3].oldActiveActions).toEqual([invest(8, 10878.491998196578)]);

	expect(steps[4].bankAccount).toBeCloseTo(0);
	expect(steps[4].newActions).toEqual([]);
	expect(steps[4].oldActiveActions).toEqual([invest(7, 7126.628278066064)]);

	expect(steps[5].bankAccount).toBeCloseTo(0);
	expect(steps[5].newActions).toEqual([]);
	expect(steps[5].oldActiveActions).toEqual([invest(6, 10076.214372026796)]);
});
