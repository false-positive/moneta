import { ReactNode } from "react";
import isEqual from "lodash/isEqual";

export type TutorialSpotMarker =
	| { kind: "submit-choice-button" }
	| { kind: "timeline" }
	| { kind: "timeline-unit"; instance: { unit: string | number } };

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
	{
		marker: { kind: "timeline" },
		description: "and now you see the timeline",
	},
	{
		marker: { kind: "timeline-unit", instance: { unit: 2020 } },
		description: "this is the year 2020!!",
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
