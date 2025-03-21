import { test } from "vitest";
import { Case, defaultCase } from "..";

test("simulate with actions", () => {
	const case_: Case = {
		...defaultCase,
		steps: [
			{
				todo: "write this code and fix the type error please",
			},
		],
	};
});
