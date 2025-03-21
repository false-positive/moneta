import { expect, test } from "vitest";
import { computeNextStep, lifeAction, type Step } from "../actions";

test("life action", () => {
	const INITIAL_BANK_ACCOUNT = 100_000;

	const initialStep: Step = {
		tick: 0,
		bankAccount: INITIAL_BANK_ACCOUNT,
		joy: 100,
		freeTime: 2134,
		newActions: [],
		oldActiveActions: [lifeAction],
	};

	const nextStep = computeNextStep(initialStep, []);

	expect(nextStep.bankAccount).toBe(
		(INITIAL_BANK_ACCOUNT - 1000) * (1 - 2 / 100 / 12)
	);
	expect(nextStep.joy).toBe(90);
	expect(nextStep.freeTime).toBe(100);
	expect(nextStep.newActions).toEqual([]);
	expect(nextStep.oldActiveActions).toEqual([lifeAction]);
});
