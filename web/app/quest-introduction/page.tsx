"use client";

import { WelcomeDialog } from "@/components/welcome-dialog";
import { questStore } from "@/lib/stores/quest-store";
import { tutorialStore } from "@/lib/stores/tutorial-store";
import { useSelector } from "@xstate/store/react";
import { Clock, Heart, Wallet } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function QuestIntroductionPage() {
	const router = useRouter();
	const [currentDialog, setCurrentDialog] = useState<
		"welcome" | "goals" | "metrics" | "metrics-explanation"
	>("welcome");

	const questGoal = useSelector(
		questStore,
		(state) => state.context.description.goal.description
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
		tutorialStore.send({ type: "nextStep" });
		router.push("/choices");
	};

	return (
		<main className="min-h-screen bg-white flex items-center justify-center">
			{currentDialog === "welcome" && (
				<WelcomeDialog
					key="welcome-dialog"
					isOpen={true}
					title="Are you ready?"
					onNext={handleWelcomeNext}
				>
					<div className="space-y-4">
						<p className="text-2xl text-center font-medium">
							This is the start of your first financial journey!
						</p>
					</div>
				</WelcomeDialog>
			)}

			{currentDialog === "goals" && (
				<WelcomeDialog
					key="goals-dialog"
					isOpen={true}
					title="Your goal is to..."
					onNext={handleGoalsNext}
				>
					<div className="space-y-4">
						<div className="p-4 rounded-lg bg-purple-50">
							<p className="text-2xl text-center font-medium text-purple-900">
								&quot;{questGoal}&quot;
							</p>
						</div>
						<p className="text-lg text-center text-gray-600">
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
					key="metrics-dialog"
					isOpen={true}
					title="Your starting position"
					onNext={handleMetricsNext}
				>
					<div className="space-y-6">
						<p className="text-lg text-center">
							Here are your initial stats:
						</p>
						<div className="grid grid-cols-3 gap-4 max-w-5xl mx-auto w-full">
							<div className="flex flex-col items-center gap-3 p-8 bg-amber-50 rounded-xl">
								<Wallet className="h-6 w-6 text-amber-500" />
								<span className="text-base font-medium text-amber-700">
									Assets
								</span>
								<span className="text-2xl font-bold text-amber-600">
									{
										initialQuestDescription.initialStep
											.bankAccount
									}{" "}
									lv
								</span>
							</div>
							<div className="flex flex-col items-center gap-3 p-8 bg-rose-50 rounded-xl">
								<Heart className="h-6 w-6 text-rose-500" />
								<span className="text-base font-medium text-rose-700">
									Joy
								</span>
								<span className="text-2xl font-bold text-rose-600">
									{initialQuestDescription.initialStep.joy}%
								</span>
							</div>
							<div className="flex flex-col items-center gap-3 p-8 bg-blue-50 rounded-xl">
								<Clock className="h-6 w-6 text-blue-500" />
								<span className="text-base font-medium text-blue-700">
									Free Time
								</span>
								<span className="text-2xl font-bold text-blue-600">
									{
										initialQuestDescription.initialStep
											.freeTimeHours
									}
									h
								</span>
							</div>
						</div>
					</div>
				</WelcomeDialog>
			)}

			{currentDialog === "metrics-explanation" && (
				<WelcomeDialog
					key="metrics-explanation-dialog"
					isOpen={true}
					title="Your Stats Guide"
					onNext={handleMetricsExplanationNext}
				>
					<div className="space-y-6">
						<p className="text-xl text-center text-gray-700">
							These stats will change based on your decisions:
						</p>
						<ul className="space-y-4">
							<li className="flex gap-3 items-center p-3 bg-amber-50 rounded-lg">
								<Wallet className="h-5 w-5 text-amber-500 flex-shrink-0" />
								<div>
									<span className="font-sm text-amber-700">
										Assets
									</span>
									<span className="ml-2 text-amber-600 !text-md">
										- Your total wealth in lv. Going
										bankrupt (below 0) ends your journey.
									</span>
								</div>
							</li>
							<li className="flex gap-3 items-center p-3 bg-rose-50 rounded-lg">
								<Heart className="h-5 w-5 text-rose-500 flex-shrink-0" />
								<div>
									<span className="font-sm text-rose-700">
										Joy
									</span>
									<span className="ml-2 text-rose-600">
										- Life satisfaction (0-100%). Each
										decision affects your happiness level.
									</span>
								</div>
							</li>
							<li className="flex gap-3 items-center p-3 bg-blue-50 rounded-lg">
								<Clock className="h-5 w-5 text-blue-500 flex-shrink-0" />
								<div>
									<span className="font-medium text-blue-700">
										Free Time
									</span>
									<span className="ml-2 text-blue-600">
										- Weekly hours (max 100h) available for
										activities after sleep and basic needs.
									</span>
								</div>
							</li>
						</ul>
						<p className="text-xl text-center font-medium text-gray-700">
							Balance these metrics carefully -{" "}
							<strong className="text-purple-700">
								neglecting any of them can lead to quest
								failure.
							</strong>
						</p>
					</div>
				</WelcomeDialog>
			)}
		</main>
	);
}
