"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CarIcon, LockIcon, TrophyIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
	questDescriptions,
	questSelectionList,
} from "@/lib/engine/quests/descriptions";
import { FlowingMoneyBackground } from "@/components/flowing-money-background";

export default function QuestSelection() {
	const [isPulsing, setIsPulsing] = useState(true);
	const router = useRouter();

	const handleStartTutorial = () => {
		router.push("/quest-introduction");
	};

	useEffect(() => {
		const interval = setInterval(() => {
			setIsPulsing((prev) => !prev);
		}, 3000);
		return () => clearInterval(interval);
	}, []);

	return (
		<main className="min-h-screen bg-purple-50 p-8 flex items-center justify-center relative overflow-hidden">
			<FlowingMoneyBackground color="#9333ea" opacity={0.08} />

			<div className="w-full max-w-4xl relative z-10">
				<h1 className="text-center text-5xl font-bold text-purple-800 mb-16">
					Choose your first financial quest:
				</h1>

				<div className="grid md:grid-cols-2 gap-12">
					{questSelectionList.map((questId) => {
						const quest = questDescriptions[questId];
						return (
							<Card
								key={questId}
								className={cn(
									"relative cursor-pointer border-3 transition-all",
									"animate-[pulse_3s_ease-in-out_infinite]",
									isPulsing
										? "border-purple-500 shadow-lg shadow-purple-100"
										: "border-purple-300"
								)}
								onClick={handleStartTutorial}
							>
								<div
									className={cn(
										"absolute inset-0 rounded-lg bg-purple-500 transition-opacity",
										isPulsing ? "opacity-5" : "opacity-0"
									)}
								/>

								<div className="flex h-full flex-col items-center justify-center p-8 text-center">
									<CarIcon className="h-20 w-20 text-purple-600 mb-6" />
									<p className="text-2xl text-purple-600 mb-2">
										{quest.goal.ageText}
									</p>
									<h2 className="text-4xl font-bold text-purple-800  mb-12">
										{quest.goal.challengeText}
									</h2>

									<Button
										className="w-3/4 bg-purple-600 py-8 text-xl hover:bg-purple-700"
										onClick={handleStartTutorial}
									>
										Start Tutorial
									</Button>
								</div>
							</Card>
						);
					})}

					{/* Locked Card */}
					<div className="relative">
						<Card className="absolute -bottom-2 -right-2 w-full h-full border-2 border-gray-200 opacity-60" />
						<Card className="absolute -bottom-4 -right-4 w-full h-full border-2 border-gray-200 opacity-40" />

						<Card className="relative border-2 border-gray-200">
							<div className="absolute inset-0 flex items-center justify-center rounded-lg bg-gray-100/60 backdrop-blur-sm">
								<div className="text-center">
									<LockIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
									<p className="text-xl font-medium text-gray-500">
										Coming Soon
									</p>
								</div>
							</div>

							<div className="p-8 text-center">
								<h2 className="text-2xl font-bold text-gray-400 mb-2">
									Advanced Quests
								</h2>
								<p className="text-lg text-gray-400 mb-8">
									Multiple challenges await
								</p>
								<div className="bg-gray-50 rounded-lg p-8 mb-8">
									<TrophyIcon className="h-16 w-16 text-gray-300 mx-auto" />
								</div>
								<Button
									variant="outline"
									className="w-full py-6 text-lg"
									disabled
								>
									Locked
								</Button>
							</div>
						</Card>
					</div>
				</div>
			</div>

			<style jsx global>{`
				@keyframes pulse {
					0%,
					100% {
						transform: scale(1);
						opacity: 1;
					}
					50% {
						transform: scale(1.05);
						opacity: 0.9;
					}
				}
			`}</style>
		</main>
	);
}
