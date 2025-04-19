import { createStore } from "@xstate/store";
import { useSelector } from "@xstate/store/react";
import { useRef } from "react";
import {
	stepMatchesMarker,
	TutorialSpotMarker,
	tutorialSteps,
} from "../engine/tutorials";

export const tutorialStore = createStore({
	context: {
		steps: tutorialSteps,
		currentStepIndex: 0,
	},
	on: {
		nextStep: (context) => {
			return {
				...context,
				currentStepIndex: context.currentStepIndex + 1,
			};
		},
	},
});

/**
 * Get the current step, if it matches the given marker.
 * This is a stable reference to the current step, so it will not change when the tutorial advances to the next step,
 * but it will change if the marker changes or the current step matches the marker and it also changes.
 */
export function useStableMatchingCurrentStep<
	MarkerType extends TutorialSpotMarker
>(marker: MarkerType) {
	const currentStep = useSelector(tutorialStore, (state) =>
		state.context.steps.at(state.context.currentStepIndex)
	);
	const isCurrent = !!currentStep && stepMatchesMarker(currentStep, marker);

	const matchingCurrentStep = isCurrent ? currentStep : null;
	const matchingCurrentStepRef = useRef(matchingCurrentStep);
	if (isCurrent) {
		matchingCurrentStepRef.current = matchingCurrentStep;
	}

	return { step: matchingCurrentStepRef.current, isCurrent };
}

console.log("[Tutorial Store]", tutorialStore.getSnapshot());

tutorialStore.subscribe((snapshot) => {
	console.log("[Tutorial Store]", snapshot);
});
