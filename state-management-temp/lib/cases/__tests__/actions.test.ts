import { expect, test } from "vitest";
import { Step, computeNextStep } from "../actions";
import {
	lifeAction,
	pensionInvestmentAction,
	savingsDepositAction,
	waiterJobAction,
} from "../standard-actions";

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

	const nextStep = computeNextStep(initialStep, [], "month");

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

	const nextStep = computeNextStep(initialStep, [waiterJobAction], "month");

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

	const nextStep1 = computeNextStep(initialStep, [job(2)], "month");
	const nextStep2 = computeNextStep(nextStep1, [], "month");
	const nextStep3 = computeNextStep(nextStep2, [], "month");

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

test("savings deposit action with multiple ticks", () => {
	const INITIAL_BANK_ACCOUNT = 2000;

	const initialStep: Step = {
		tick: 0,
		bankAccount: INITIAL_BANK_ACCOUNT,
		joy: 100,
		freeTime: 100,
		newActions: [],
		oldActiveActions: [],
	};

	const invest = (ticks: number, capital: number) => ({
		...savingsDepositAction,
		remainingTicks: ticks,
		capital,
	});

	const nextStep1 = computeNextStep(initialStep, [invest(2, 0)], "month");
	const nextStep2 = computeNextStep(nextStep1, [], "month");
	const nextStep3 = computeNextStep(nextStep2, [], "month");

	expect(nextStep1.bankAccount).toBe(INITIAL_BANK_ACCOUNT - 1000);
	expect(nextStep1.joy).toBe(100);
	expect(nextStep1.freeTime).toBe(0);
	expect(nextStep1.newActions).toEqual([invest(2, 0)]);
	expect(nextStep1.oldActiveActions).toEqual([invest(1, 1000 * 1.002)]);

	expect(nextStep2.bankAccount).toBe(INITIAL_BANK_ACCOUNT - 1000);
	expect(nextStep2.joy).toBe(100);
	expect(nextStep2.freeTime).toBe(0);
	expect(nextStep2.newActions).toEqual([]);
	expect(nextStep2.oldActiveActions).toEqual([
		invest(0, 1000 * 1.002 * 1.002),
	]);

	expect(nextStep3.bankAccount).toBeCloseTo(
		INITIAL_BANK_ACCOUNT - 1000 + 1000 * Math.pow(1.002, 2)
	);
	expect(nextStep3.joy).toBe(100);
	expect(nextStep3.freeTime).toBe(0);
	expect(nextStep3.newActions).toEqual([]);
	expect(nextStep3.oldActiveActions).toEqual([]);
});

test("multiple overlapping actions", () => {
	const INITIAL_BANK_ACCOUNT = 2000;

	const initialStep: Step = {
		tick: 0,
		bankAccount: INITIAL_BANK_ACCOUNT,
		joy: 100,
		freeTime: 100,
		newActions: [],
		oldActiveActions: [lifeAction],
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

	const nextStep1 = computeNextStep(initialStep, [], "month");

	const inflation = 1 - 2 / 100 / 12;

	let expectedBankAccount = (INITIAL_BANK_ACCOUNT - 1000) * inflation;
	let expectedJoy = 100 * 0.9;

	expect(nextStep1.bankAccount).toBeCloseTo(expectedBankAccount);
	expect(nextStep1.joy).toBeCloseTo(expectedJoy);
	expect(nextStep1.freeTime).toBe(100);
	expect(nextStep1.newActions).toEqual([]);
	expect(nextStep1.oldActiveActions).toEqual([lifeAction]);

	const nextStep2 = computeNextStep(nextStep1, [job(2)], "month");
	expectedBankAccount = (expectedBankAccount - 1000) * inflation + 1000;
	expectedJoy = expectedJoy * 0.9 * 0.95;

	expect(nextStep2.bankAccount).toBeCloseTo(expectedBankAccount);
	expect(nextStep2.joy).toBeCloseTo(expectedJoy);
	expect(nextStep2.freeTime).toBe(80);
	expect(nextStep2.newActions).toEqual([job(2)]);
	expect(nextStep2.oldActiveActions).toEqual([lifeAction, job(1)]);

	const nextStep3 = computeNextStep(nextStep2, [invest(2, 1000)], "month");
	expectedBankAccount =
		(expectedBankAccount - 1000) * inflation + 1000 - 1000;
	expectedJoy = expectedJoy * 0.9 * 0.95;

	expect(nextStep3.bankAccount).toBeCloseTo(expectedBankAccount);
	expect(nextStep3.joy).toBeCloseTo(expectedJoy);
	expect(nextStep3.freeTime).toBe(80);
	expect(nextStep3.newActions).toEqual([invest(2, 1000)]);
	expect(nextStep3.oldActiveActions).toEqual([
		lifeAction,
		job(0),
		invest(1, 1000 * 1.002),
	]);

	const nextStep4 = computeNextStep(nextStep3, [], "month");
	expectedBankAccount = (expectedBankAccount - 1000) * inflation;
	expectedJoy = expectedJoy * 0.9;

	expect(nextStep4.bankAccount).toBeCloseTo(expectedBankAccount);
	expect(nextStep4.joy).toBeCloseTo(expectedJoy);
	expect(nextStep4.freeTime).toBe(100);
	expect(nextStep4.newActions).toEqual([]);
	expect(nextStep4.oldActiveActions).toEqual([
		lifeAction,
		invest(0, 1000 * 1.002 * 1.002),
	]);

	const nextStep5 = computeNextStep(nextStep4, [], "month");
	expectedBankAccount =
		(expectedBankAccount - 1000) * inflation + 1000 * 1.002 * 1.002;
	expectedJoy = expectedJoy * 0.9;

	expect(nextStep5.bankAccount).toBeCloseTo(expectedBankAccount);
	expect(nextStep5.joy).toBeCloseTo(expectedJoy);
	expect(nextStep5.freeTime).toBe(100);
	expect(nextStep5.newActions).toEqual([]);
	expect(nextStep5.oldActiveActions).toEqual([lifeAction]);
});

test("pension deposit action with multiple ticks", () => {
	const INITIAL_BANK_ACCOUNT = 2000;

	const initialStep: Step = {
		tick: 0,
		bankAccount: INITIAL_BANK_ACCOUNT,
		joy: 100,
		freeTime: 100,
		newActions: [],
		oldActiveActions: [],
	};

	const invest = (ticks: number, capital: number) => ({
		...pensionInvestmentAction,
		remainingTicks: ticks,
		capital,
	});

	const nextStep1 = computeNextStep(initialStep, [invest(2, 0)], "month");
	const nextStep2 = computeNextStep(nextStep1, [], "month");
	const nextStep3 = computeNextStep(nextStep2, [], "month");

	expect(nextStep1.bankAccount).toBe(INITIAL_BANK_ACCOUNT - 1000);
	expect(nextStep1.joy).toBe(100);
	expect(nextStep1.freeTime).toBe(0);
	expect(nextStep1.newActions).toEqual([invest(2, 0)]);
	expect(nextStep1.oldActiveActions).toEqual([invest(1, 1000 * 1.02)]);

	expect(nextStep2.bankAccount).toBe(INITIAL_BANK_ACCOUNT - 2000);
	expect(nextStep2.joy).toBe(100);
	expect(nextStep2.freeTime).toBe(0);
	expect(nextStep2.newActions).toEqual([]);
	expect(nextStep2.oldActiveActions).toEqual([
		invest(0, 1000 * 1.02 * 1.02 + 1000 * 1.02),
	]);

	expect(nextStep3.bankAccount).toBeCloseTo(1000 * 1.02 * 1.02 + 1000 * 1.02);
	expect(nextStep3.joy).toBe(100);
	expect(nextStep3.freeTime).toBe(0);
	expect(nextStep3.newActions).toEqual([]);
	expect(nextStep3.oldActiveActions).toEqual([]);
});
