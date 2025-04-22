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
};

export const tutorialSteps: TutorialStep[] = [];

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
