import { ReactNode } from "react";
import isEqual from "lodash/isEqual";

export type TutorialSpotMarker =
	| { kind: "welcome-dialog" }
	| { kind: "submit-choice-button" }
	| { kind: "timeline" }
	| { kind: "timeline-unit"; instance: { unit: string | number } };

export type TutorialStep<
	MarkerType extends TutorialSpotMarker = TutorialSpotMarker
> = {
	marker: MarkerType;
	title: ReactNode;
	description: ReactNode;
	popoverSide?: "top" | "right" | "bottom" | "left";
	pulse?: boolean;
};

export const tutorialSteps: TutorialStep[] = [
	{
		marker: { kind: "welcome-dialog" },
		title: "this is a tutorial!!",
		description: "it can do tutorial things",
		popoverSide: "right",
		pulse: false,
	},
	{
		marker: { kind: "submit-choice-button" },
		title: <></>,
		description:
			"yo bro u can click this button to submit your choice (that's what it does)",
		popoverSide: "top",
		pulse: false,
	},
	{
		marker: { kind: "timeline" },
		title: <></>,
		description: "and now you see the timeline",
		popoverSide: "bottom",
		pulse: false,
	},
	{
		marker: { kind: "timeline-unit", instance: { unit: 2020 } },
		title: <></>,
		description: "this is the year 2020!!",
		popoverSide: "bottom",
		pulse: false,
	},
];

export function markerMatches<LHS extends TutorialSpotMarker>(
	lhs: LHS,
	rhs: TutorialSpotMarker
): rhs is LHS {
	if (lhs.kind !== rhs.kind) {
		return false;
	}

	const lhsHasInstance = "instance" in lhs;
	const rhsHasInstance = "instance" in rhs;

	if (lhsHasInstance && rhsHasInstance) {
		return isEqual(lhs.instance, rhs.instance);
	}

	return !lhsHasInstance && !rhsHasInstance;
}

export function stepMatchesMarker<MarkerType extends TutorialSpotMarker>(
	step: TutorialStep,
	marker: MarkerType
): step is TutorialStep<MarkerType> {
	return markerMatches(marker, step.marker);
}
