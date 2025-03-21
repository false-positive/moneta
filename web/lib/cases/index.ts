export type Case = {
	personName: string;
	caseLLMDescriptipn: string;
	initialStep: Step;
};

function computeNextStep(steps: Step[]) {
	let nextStep = steps[steps.length - 1];
	if (!nextStep) {
		throw new Error("No steps");
	}

	nextStep.appliedActions = nextStep.appliedActions.filter((action) =>
		action.isAvailable(nextStep)
	);
	nextStep.newActions = nextStep.newActions.filter((action) =>
		action.isAvailable(nextStep)
	);

	for (const action of nextStep.appliedActions) {
		action.timesApplied++;
		nextStep = action.modifier(nextStep);
	}

	return nextStep;
}

export function applyNewAction(steps: Step[], action: Action) {
	return steps.map((step) => {
		if (action.isAvailable(step)) {
			return (
				action.modifier as (this: typeof action, state: Step) => Step
			).call(action, step);
		}
		return step;
	});
}

export function applyNoOp(steps: Step[]) {
	return step;
}
