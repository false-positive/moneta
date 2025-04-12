import { expect, test } from "vitest";
import { CaseDescription, simulateWithActions } from "..";
import { Case, defaultCase } from "..";
import {
	lifeAction,
	savingsDepositAction,
	waiterJobAction,
} from "../standard-actions";

test("simulate with actions", () => {
	const INITIAL_BANK_ACCOUNT = 2000;

	const caseDescription: CaseDescription = {
		personName: "John",
		caseLLMDescriptipn: "John is a waiter",
		initialStep: {
			tick: 0,
			bankAccount: INITIAL_BANK_ACCOUNT,
			joy: 100,
			freeTime: 100,
			newActions: [],
			oldActiveActions: [lifeAction],
		},
		stepCount: 5,
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

	const steps = simulateWithActions(caseDescription, [
		[],
		[job(2)],
		[invest(2, 1000)],
		[],
		[],
	]);

	const inflation = 1 - 2 / 100 / 12;

	let expectedBankAccount = (INITIAL_BANK_ACCOUNT - 1000) * inflation;
	let expectedJoy = 100 * 0.9;

	expect(steps[1].bankAccount).toBeCloseTo(expectedBankAccount);
	expect(steps[1].joy).toBeCloseTo(expectedJoy);
	expect(steps[1].freeTime).toBe(100);
	expect(steps[1].newActions).toEqual([]);
	expect(steps[1].oldActiveActions).toEqual([lifeAction]);

	expectedBankAccount = (expectedBankAccount - 1000) * inflation + 1000;
	expectedJoy = expectedJoy * 0.9 * 0.95;

	expect(steps[2].bankAccount).toBeCloseTo(expectedBankAccount);
	expect(steps[2].joy).toBeCloseTo(expectedJoy);
	expect(steps[2].freeTime).toBe(80);
	expect(steps[2].newActions).toEqual([job(2)]);
	expect(steps[2].oldActiveActions).toEqual([lifeAction, job(1)]);

	expectedBankAccount =
		(expectedBankAccount - 1000) * inflation + 1000 - 1000;
	expectedJoy = expectedJoy * 0.9 * 0.95;

	expect(steps[3].bankAccount).toBeCloseTo(expectedBankAccount);
	expect(steps[3].joy).toBeCloseTo(expectedJoy);
	expect(steps[3].freeTime).toBe(80);
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
	expect(steps[4].freeTime).toBe(100);
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
	expect(steps[5].freeTime).toBe(100);
	expect(steps[5].newActions).toEqual([]);
	expect(steps[5].oldActiveActions).toEqual([lifeAction]);
	expect(steps[5].tick).toBe(5);
});
