"use client";

import { WelcomeDialog } from "@/components/welcome-dialog";
import SkillTree from "@/components/skill-tree";
import { useState } from "react";
import { tutorialStore } from "@/lib/stores/tutorial-store";
import { useSelector } from "@xstate/store/react";
import { questStore } from "@/lib/stores/quest-store";
import { Heart, Wallet, Clock } from "lucide-react";

export default function TestPage() {
	const [currentDialog, setCurrentDialog] = useState<
		"welcome" | "goals" | "metrics" | "none"
	>("welcome");

	const questGoal = useSelector(
		questStore,
		(state) => state.context.description.goal.description
	);

	const initialMetrics = useSelector(
		questStore,
		(state) => state.context.description.initialStep
	);

	const handleWelcomeNext = () => {
		setCurrentDialog("goals");
	};

	const handleGoalsNext = () => {
		setCurrentDialog("metrics");
	};

	const handleMetricsNext = () => {
		setCurrentDialog("none");
		// Explicitly start the tutorial at the first step
		tutorialStore.send({ type: "startTutorial" });
	};

	return (
		<div className="container mx-auto py-8">
			<h1 className="text-3xl font-bold mb-6">
				What is the best financial choice in your opinion?
			</h1>
			<div className="h-[800px]">
				<SkillTree />
			</div>

			{currentDialog === "welcome" && (
				<WelcomeDialog
					isOpen={true}
					title="Are you ready?"
					onNext={handleWelcomeNext}
				>
					<div className="space-y-4">
						<p>
							This is the start of your first financial journey!
						</p>
					</div>
				</WelcomeDialog>
			)}

			{currentDialog === "goals" && (
				<WelcomeDialog
					isOpen={true}
					title="Your goal is to..."
					onNext={handleGoalsNext}
				>
					<div className="space-y-4">
						<div className="bg-white/20 p-2 rounded-lg">
							<p className="text-2xl italic">"{questGoal}"</p>
						</div>
					</div>
				</WelcomeDialog>
			)}

			{currentDialog === "metrics" && (
				<WelcomeDialog
					isOpen={true}
					title="Your starting position"
					onNext={handleMetricsNext}
				>
					<div className="space-y-6">
						<p>Here are your initial metrics:</p>

						<div className="flex justify-around items-center">
							<div className="text-center">
								<div className="flex items-center gap-2 justify-center mb-1">
									<Wallet className="h-4 w-4 text-amber-500" />
									<span className="text-sm text-muted-foreground">
										Assets
									</span>
								</div>
								<div className="text-lg font-medium">
									{initialMetrics.bankAccount.toLocaleString()}{" "}
									BGN
								</div>
							</div>

							<div className="text-center">
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

							<div className="text-center">
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

						<p className="text-sm text-muted-foreground">
							These metrics will change based on your decisions
							throughout the journey.
						</p>
					</div>
				</WelcomeDialog>
			)}
		</div>
	);
}
