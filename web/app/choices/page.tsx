"use client";

import { ActionTemplateTree } from "@/components/action-template-tree";
import { TutorialDialogContent, TutorialSpot } from "@/components/tutorial";
import { WelcomeDialog } from "@/components/welcome-dialog";
import { questStore } from "@/lib/stores/quest-store";
import { tutorialStore } from "@/lib/stores/tutorial-store";
import { useSelector } from "@xstate/store/react";
import { Clock, Heart, Wallet } from "lucide-react";
import { useState } from "react";
import { FlowingMoneyBackground } from "@/components/flowing-money-background";

export default function ChoicesPage() {
	const currentTutorialStepIndex = useSelector(
		tutorialStore,
		(state) => state.context.currentStepIndex
	);
	const [currentDialog, setCurrentDialog] = useState<
		"welcome" | "goals" | "metrics" | "metrics-explanation" | "none"
	>(currentTutorialStepIndex < 0 ? "welcome" : "none");

	const questGoal = useSelector(
		questStore,
		(state) => state.context.description.goal.description
	);

	const initialMetrics = useSelector(
		questStore,
		(state) => state.context.description.initialStep
	);

	const initialQuestDescription = useSelector(
		questStore,
		(state) => state.context.description
	);

	const handleWelcomeNext = () => {
		setCurrentDialog("goals");
	};

	const handleGoalsNext = () => {
		setCurrentDialog("metrics");
	};

	const handleMetricsNext = () => {
		setCurrentDialog("metrics-explanation");
	};

	const handleMetricsExplanationNext = () => {
		// Only start tutorial after metrics explanation dialog is closed
		setCurrentDialog("none");
		tutorialStore.send({ type: "nextStep" });
	};

	return (
		<main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white relative overflow-hidden flex flex-col">
			<FlowingMoneyBackground color="#6366f1" opacity={0.08} />
			<div className="relative z-10 flex-1 p-4">
				<TutorialSpot marker={{ kind: "welcome-dialog" }}>
					<TutorialDialogContent />
				</TutorialSpot>
				<h1 className="text-3xl font-bold mb-6">
					What is the best financial choice in your opinion?
				</h1>
				<div className="h-[calc(100vh-200px)]">
					<ActionTemplateTree />
				</div>

				{currentDialog === "welcome" && (
					<WelcomeDialog
						key={"welcome-dialog"}
						isOpen={true}
						title="Are you ready?"
						onNext={handleWelcomeNext}
					>
						<div className="space-y-4">
							<p>
								This is the start of your first financial
								journey!
							</p>
						</div>
					</WelcomeDialog>
				)}

				{currentDialog === "goals" && (
					<WelcomeDialog
						key={"welcome-dialog"}
						isOpen={true}
						title="Your goal is to..."
						onNext={handleGoalsNext}
					>
						<div className="space-y-4">
							<div className="bg-white/20 p-2 rounded-lg">
								<p className="text-2xl italic">"{questGoal}"</p>
							</div>
							<p className="text-sm text-muted-foreground">
								You have {initialQuestDescription.maxStepCount}{" "}
								{initialQuestDescription.timePointKind}
								{initialQuestDescription.maxStepCount > 1
									? "s"
									: ""}{" "}
								to achieve this goal, starting from{" "}
								{initialQuestDescription.initialStep.timePoint}.
							</p>
						</div>
					</WelcomeDialog>
				)}

				{currentDialog === "metrics" && (
					<WelcomeDialog
						key={"metrics-dialog"}
						isOpen={true}
						title="Your starting position"
						onNext={handleMetricsNext}
					>
						<div className="space-y-6">
							<p>Here are your initial stats:</p>

							<div className="flex justify-around items-center">
								<div className="text-center relative">
									<div className="flex items-center gap-2 justify-center mb-1">
										<Wallet className="h-4 w-4 text-amber-500" />
										<span className="text-sm text-muted-foreground">
											Assets
										</span>
									</div>
									<div className="text-lg font-medium">
										{initialMetrics.bankAccount.toLocaleString()}{" "}
										lv
									</div>
								</div>

								<div className="text-center relative">
									<div className="flex items-center gap-2 justify-center mb-1">
										<Heart className="h-4 w-4 text-rose-500" />
										<span className="text-sm text-muted-foreground">
											Joy
										</span>
									</div>
									<div className="text-lg font-medium">
										{initialMetrics.joy}%
									</div>
								</div>

								<div className="text-center relative">
									<div className="flex items-center gap-2 justify-center mb-1">
										<Clock className="h-4 w-4 text-blue-500" />
										<span className="text-sm text-muted-foreground">
											Free Time
										</span>
									</div>
									<div className="text-lg font-medium">
										{initialMetrics.freeTimeHours}h
									</div>
								</div>
							</div>
						</div>
					</WelcomeDialog>
				)}

				{currentDialog === "metrics-explanation" && (
					<WelcomeDialog
						key={"metrics-explanation-dialog"}
						isOpen={true}
						title="Understanding Your Stats"
						onNext={handleMetricsExplanationNext}
					>
						<div className="space-y-3">
							<p className="text-[20px] text-muted-foreground">
								These stats will change based on your decisions:
							</p>
							<ul className="text-[20px] space-y-1.5 text-muted-foreground">
								<li className="flex gap-2 items-baseline">
									<Wallet className="h-3 w-3 text-amber-500 flex-shrink-0" />
									<div>
										<span className="font-medium text-amber-700">
											Assets
										</span>
										<span className="ml-1">
											- Your total wealth in lv. Going
											bankrupt (below 0) ends your
											journey.
										</span>
									</div>
								</li>
								<li className="flex gap-2 items-baseline">
									<Heart className="h-3 w-3 text-rose-500 flex-shrink-0" />
									<div>
										<span className="font-medium text-rose-700">
											Joy
										</span>
										<span className="ml-1">
											- Life satisfaction (0-100%). Each
											decision affects your happiness
											level.
										</span>
									</div>
								</li>
								<li className="flex gap-2 items-baseline">
									<Clock className="h-3 w-3 text-blue-500 flex-shrink-0" />
									<div>
										<span className="font-medium text-blue-700">
											Free Time
										</span>
										<span className="ml-1">
											- Weekly hours (max 100h) available
											for activities after sleep and basic
											needs.
										</span>
									</div>
								</li>
							</ul>
							<p className="text-[20px] text-muted-foreground mt-2">
								Balance these metrics carefully -{" "}
								<strong>
									neglecting any of them can lead to quest
									failure.
								</strong>
							</p>
						</div>
					</WelcomeDialog>
				)}
			</div>
		</main>
	);
}
