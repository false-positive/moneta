"use client";

import { tutorialStore } from "@/lib/stores/tutorial-store";
import { useSelector } from "@xstate/store/react";

export function TutorialOverlay() {
	const currentStep = useSelector(
		tutorialStore,
		(state) => state.context.steps[state.context.currentStepIndex]
	);

	if (!currentStep?.blockInteractions) return null;

	return (
		<>
			<div className="fixed inset-0 bg-black/50 z-[100] pointer-events-none" />

			<div
				className="fixed inset-0 z-[101]"
				style={{ cursor: "not-allowed" }}
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
				}}
			/>
		</>
	);
}
