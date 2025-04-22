import { ReactNode } from "react";
import isEqual from "lodash/isEqual";

export type TutorialSpotMarker =
	| { kind: "welcome-dialog" }
	| { kind: "goal-dialog" }
	| { kind: "submit-choice-button" }
	| { kind: "timeline" }
	| { kind: "timeline-unit"; instance: { unit: string | number } }
	| { kind: "post-action-button" }
	| { kind: "metrics-card" }
	| { kind: "decision-roadmap" }
	| { kind: "journey-node"; instance: { timePoint: number } }
	| { kind: "financial-data" }
	| { kind: "steps-done-dialog" }
	| { kind: "graphs" }
	| { kind: "graph-container" }
	| { kind: "actions-choice-container" };

export type TutorialStep<
	MarkerType extends TutorialSpotMarker = TutorialSpotMarker
> = {
	marker: MarkerType;
	title: ReactNode;
	description: ReactNode;
	popoverSide?: "top" | "right" | "bottom" | "left";
	pulse?: boolean;
	blockInteractions?: boolean;
};

export const tutorialSteps: TutorialStep[] = [
	{
		marker: { kind: "welcome-dialog" },
		title: "Lets begin with your first choice!",
		description: <></>,
		popoverSide: "bottom",
		blockInteractions: true,
	},
	{
		marker: { kind: "actions-choice-container" },
		title: "Your First Choice",
		description: (
			<>
				In this section you can make your first choice.
				<br />
				Choose <strong>one action</strong> that aligns with your goals
				and preferences. You can pick more later.
				<br />
				Click on an action to select it and view more details.
			</>
		),
		popoverSide: "right",
		blockInteractions: false,
	},
	{
		marker: { kind: "post-action-button" },
		title: "Lock In Your Move",
		description: (
			<>
				After choosing your actions for the year, click here to{" "}
				<strong>confirm</strong> them.
				<br />
				This will lock in your decisions.
			</>
		),
		popoverSide: "bottom",
		blockInteractions: false,
	},
	{
		marker: { kind: "submit-choice-button" },
		title: "Choose Your Actions",
		description: (
			<>
				Click here when you are done making choices for now.
				<br />
				Each choice will influence your finances, so pick carefully
				based on your goals and available options.
			</>
		),
		popoverSide: "bottom",
		pulse: false,
	},
	{
		marker: { kind: "decision-roadmap" },
		title: "Your Financial Map",
		description: (
			<>
				This is your decisions <strong>Roadmap</strong> — a visual
				overview of the steps you've made in time.
				<br />
				Use the roadmap to jump between different years in your
				simulation. From here, you can select any point of time and make
				new choices or amend old ones!
			</>
		),
		popoverSide: "left",
		blockInteractions: true,
	},
	{
		marker: {
			kind: "journey-node",
			instance: { timePoint: 2021 },
		},
		title: "Next Year Awaits",
		description: (
			<>
				These "levels" represent the time in your simulation.
				<br />
				Click on the second step to select it as{" "}
				<strong>current</strong>.
				<br />
				You already made a descicion for the first one, so now select
				the <strong>second</strong>.
			</>
		),
		popoverSide: "top",
		pulse: true,
		blockInteractions: true,
	},
	{
		marker: { kind: "post-action-button" },
		title: "Lock In Your Move",
		description: (
			<>
				You can modify the duration and other metrics of your choices.
				<br />
				Click here when you are done.
			</>
		),
		popoverSide: "bottom",
		blockInteractions: false,
	},
	{
		marker: { kind: "submit-choice-button" },
		title: "Make More Choices",
		description: (
			<>
				Continue building your strategy and moving forward in your
				journey.
			</>
		),
		popoverSide: "bottom",
		blockInteractions: false,
	},
	{
		marker: { kind: "timeline" },
		title: "Navigate Time",
		description: (
			<>
				This is the timeline component - it displayes all your decisions
				in time, their durations and impact.
				<br />
				Click on a year to select it as <strong>current</strong>.
			</>
		),
		popoverSide: "top",
		blockInteractions: true,
	},
	{
		marker: { kind: "metrics-card" },
		title: "Track Key Metrics",
		description: (
			<>
				This panel shows important metrics about your life in the
				simulation such as your <strong>assets</strong>,{" "}
				<strong>level of joy</strong>, and <strong>free time</strong>.
				<br />
				Here you can also find your income and expenses for the current
				time period. <br />
				Use it to monitor how each decision affects your overall
				progress.
			</>
		),
		popoverSide: "left",
		blockInteractions: true,
	},
	{
		marker: { kind: "financial-data" },
		title: "Detailed View",
		description: (
			<>
				Here you’ll find a breakdown of all financial transactions and
				results.
				<br />
				This is useful for analyzing the impact of each decision in more
				detail.
			</>
		),
		popoverSide: "left",
		blockInteractions: true,
	},
	{
		marker: { kind: "graphs" },
		title: "Detailed View",
		description: (
			<>
				Here you can find graphics that show your financial progress.
				<br />
				This is useful for analyzing the impact of each decision in more
				detail.
			</>
		),
		popoverSide: "left",
		blockInteractions: true,
	},
	{
		marker: { kind: "graph-container" },
		title: "Detailed View",
		description: (
			<>
				Here you can find graphics that show your financial progress.
				<br />
				This is useful for analyzing the impact of each decision in more
				detail.
			</>
		),
		popoverSide: "left",
		blockInteractions: true,
	},
	{
		marker: { kind: "steps-done-dialog" },
		title: "That's it!",
		description: (
			<>
				{"You've"} got the basics!
				<br />
				From now on, you can explore, experiment, and build your own
				financial path.
				<br />
				The tutorial will finish automatically once you reach your goal.
			</>
		),
		popoverSide: "bottom",
		blockInteractions: true,
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
