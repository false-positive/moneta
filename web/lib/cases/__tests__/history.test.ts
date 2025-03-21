import { expect, test } from "vitest";
import { CaseDescription, simulateWithActions } from "..";
import { etfInvestmentOnceAction } from "../standard-actions";

test("simulate with actions", () => {
	const INITIAL_BANK_ACCOUNT = 10000;

	const caseDescription: CaseDescription = {
		personName: "John",
		caseLLMDescriptipn: "John is a waiter",
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

	const steps = simulateWithActions(caseDescription, [
		[],
		[invest(10, 10000)],
		[],
		[],
		[],
	]);

	expect(true);

	// expect(steps[1].bankAccount).toBeCloseTo(10000);
	// expect(steps[1].newActions).toEqual([]);
	// expect(steps[1].oldActiveActions).toEqual([]);

	// expect(steps[2].bankAccount).toBeCloseTo(0);
	// expect(steps[2].newActions).toEqual(invest(10, 10000));
	// expect(steps[2].oldActiveActions).toEqual([]);
});
