import { expect, test } from "vitest";
import {
	computeNextStep,
	lifeAction,
	waiterJobAction,
	type Step,
} from "../actions";

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

test("waiter job action", () => {
	const INITIAL_BANK_ACCOUNT = 100_000;

	const initialStep: Step = {
		tick: 0,
		bankAccount: INITIAL_BANK_ACCOUNT,
		joy: 100,
		freeTime: 100,
		newActions: [],
		oldActiveActions: [],
	};

	const nextStep = computeNextStep(initialStep, [waiterJobAction]);

	expect(nextStep.bankAccount).toBe(INITIAL_BANK_ACCOUNT + 1000);
	expect(nextStep.joy).toBe(95);
	expect(nextStep.freeTime).toBe(-20);
	expect(nextStep.newActions).toEqual([waiterJobAction]);
	expect(nextStep.oldActiveActions).toEqual([waiterJobAction]);
});

test("waiter job action with multiple ticks", () => {
	const INITIAL_BANK_ACCOUNT = 100_000;

	const initialStep: Step = {
		tick: 0,
		bankAccount: INITIAL_BANK_ACCOUNT,
		joy: 100,
		freeTime: 100,
		newActions: [],
		oldActiveActions: [],
	};

	const job = (ticks: number) => ({
		...waiterJobAction,
		remainingTicks: ticks,
	});

	const nextStep1 = computeNextStep(initialStep, [job(2)]);
	const nextStep2 = computeNextStep(nextStep1, []);
	const nextStep3 = computeNextStep(nextStep2, []);

	expect(nextStep1.bankAccount).toBe(INITIAL_BANK_ACCOUNT + 1000);
	expect(nextStep1.joy).toBe(95);
	expect(nextStep1.freeTime).toBe(-20);
	expect(nextStep1.newActions).toEqual([job(2)]);
	expect(nextStep1.oldActiveActions).toEqual([job(1)]);

	expect(nextStep2.bankAccount).toBe(INITIAL_BANK_ACCOUNT + 2000);
	expect(nextStep2.joy).toBe(90.25);
	expect(nextStep2.freeTime).toBe(-20);
	expect(nextStep2.newActions).toEqual([]);
	expect(nextStep2.oldActiveActions).toEqual([job(0)]);

	expect(nextStep3.bankAccount).toBe(INITIAL_BANK_ACCOUNT + 2000);
	expect(nextStep3.joy).toBe(90.25);
	expect(nextStep3.freeTime).toBe(0);
	expect(nextStep3.newActions).toEqual([]);
	expect(nextStep3.oldActiveActions).toEqual([]);
});
