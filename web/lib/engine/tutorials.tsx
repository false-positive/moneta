import { ReactNode } from "react";
import isEqual from "lodash/isEqual";

export type TutorialSpotMarker = { kind: "submit-choice-button" };

export type TutorialStep = {
	marker: TutorialSpotMarker;
	description: ReactNode;
};

export const tutorialSteps: TutorialStep[] = [
	{
		marker: { kind: "submit-choice-button" },
		description:
			"yo bro u can click this button to submit your choice (that's what it does)",
	},
];

export function markerMatches<T extends TutorialSpotMarker>(
	lhs: TutorialSpotMarker,
	rhs: T
): lhs is T {
	if (lhs.kind !== rhs.kind) {
		return false;
	}

	const aHasInstance = "instance" in lhs;
	const bHasInstance = "instance" in rhs;

	if (aHasInstance && bHasInstance) {
		return isEqual(lhs.instance, rhs.instance);
	}

	return !aHasInstance && !bHasInstance;
}
