"use client";

import { useEffect, useState } from "react";
import { useSelector } from "@xstate/store/react";
import { questStore } from "@/lib/stores/quest-store";
import { Star, Crown, Medal, Award } from "lucide-react";
import Confetti from "react-confetti";

export default function QuestCompletionPage() {
	const [mounted, setMounted] = useState(false);
	const [numberOfPieces, setNumberOfPieces] = useState(1000);

	useEffect(() => {
		setMounted(true);
		const timer = setTimeout(() => {
			setNumberOfPieces(0);
		}, 5000);

		return () => clearTimeout(timer);
	}, []);

	const context = useSelector(questStore, (s) => s.context);

	const { lastStep, timeframe, steps, goalDescription } = {
		lastStep: context.steps[context.steps.length - 1],
		timeframe: context.description.timePointKind,
		steps: context.steps,
		goalDescription: context.description.goal.description,
	};

	if (!lastStep) return null;

	const joyPercentage = Math.max(0, Math.min(100, Math.round(lastStep.joy)));
	const moneyAmount = Math.round(lastStep.bankAccount);
	const freeTimePercentage = Math.min(100, lastStep.freeTimeHours);

	return (
		<div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-4 relative overflow-hidden">
			{mounted && (
				<Confetti
					width={window.innerWidth || 1920}
					height={window.innerHeight || 1080}
					numberOfPieces={numberOfPieces}
					recycle={true}
					initialVelocityY={20}
					gravity={0.15}
					colors={[
						"#f59e0b",
						"#d97706",
						"#b45309",
						"#fbbf24",
						"#fcd34d",
						"#fef3c7",
					]}
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						width: "100vw",
						height: "100vh",
						zIndex: 50,
						pointerEvents: "none",
					}}
				/>
			)}

			<div className="max-w-3xl mx-auto relative z-10">
				<div className="text-center mb-8 mt-8">
					<div className="flex justify-center mb-4">
						<div className="relative">
							<Crown className="h-20 w-20 text-amber-500" />
							<div className="absolute inset-0 animate-ping opacity-50">
								<Crown className="h-20 w-20 text-amber-500" />
							</div>
						</div>
					</div>
					<h1 className="text-5xl font-extrabold text-amber-600 mb-2 tracking-tight">
						QUEST COMPLETED!
					</h1>
				</div>

				<div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl shadow-lg p-6 mb-8 border border-amber-200 transform transition-all hover:scale-[1.01]">
					<h2 className="text-2xl font-bold text-center text-amber-800 mb-4">
						Goal Achieved
					</h2>
					<div className="bg-white/70 rounded-lg p-4 mb-4">
						<p className="text-xl text-center text-amber-900 italic">
							"{goalDescription}"
						</p>
					</div>
					<p className="text-center text-amber-700">
						Your journey through {steps.length}{" "}
						{timeframe === "year"
							? "years"
							: timeframe === "month"
							? "months"
							: timeframe === "week"
							? "weeks"
							: "days"}{" "}
						has led to this achievement!
					</p>
				</div>

				<div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-amber-100">
					<h2 className="text-2xl font-bold text-center text-amber-700 mb-6 flex items-center justify-center">
						Your stats at the end are...
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="bg-gradient-to-br from-amber-50 to-white rounded-lg p-5 text-center border border-amber-100 shadow-sm">
							<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-3">
								<Star className="h-8 w-8 text-amber-600" />
							</div>
							<h3 className="text-lg font-bold text-amber-800 mb-1">
								Joy
							</h3>
							<div className="text-3xl font-bold text-amber-600 mb-2">
								{joyPercentage}%
							</div>
							<div className="w-full h-2 bg-amber-100 rounded-full overflow-hidden">
								<div
									className="h-full bg-amber-500 rounded-full"
									style={{ width: `${joyPercentage}%` }}
								></div>
							</div>
							<p className="mt-3 text-amber-700 text-sm">
								{joyPercentage >= 80
									? "Exceptional happiness!"
									: joyPercentage >= 60
									? "Great satisfaction!"
									: joyPercentage >= 40
									? "Moderate contentment"
									: "Room for improvement"}
							</p>
						</div>

						<div className="bg-gradient-to-br from-amber-50 to-white rounded-lg p-5 text-center border border-amber-100 shadow-sm flex flex-col items-center justify-center">
							<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-3">
								<Award className="h-8 w-8 text-amber-600" />
							</div>
							<h3 className="text-lg font-bold text-amber-800 mb-1">
								Wealth
							</h3>
							<div className="text-3xl font-bold text-amber-600 mb-2">
								${moneyAmount.toLocaleString()}
							</div>
						</div>

						<div className="bg-gradient-to-br from-amber-50 to-white rounded-lg p-5 text-center border border-amber-100 shadow-sm">
							<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-3">
								<Medal className="h-8 w-8 text-amber-600" />
							</div>
							<h3 className="text-lg font-bold text-amber-800 mb-1">
								Free Time
							</h3>
							<div className="text-3xl font-bold text-amber-600 mb-2">
								{freeTimePercentage}%
							</div>
							<div className="w-full h-2 bg-amber-100 rounded-full overflow-hidden">
								<div
									className="h-full bg-amber-500 rounded-full"
									style={{ width: `${freeTimePercentage}%` }}
								></div>
							</div>
							<p className="mt-3 text-amber-700 text-sm">
								{freeTimePercentage >= 80
									? "Perfect work-life balance!"
									: freeTimePercentage >= 60
									? "Great life balance!"
									: freeTimePercentage >= 40
									? "Balanced lifestyle"
									: "Busy but managing"}
							</p>
						</div>
					</div>
				</div>

				<div className="flex justify-center mb-12">
					<button
						className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold py-4 px-10 rounded-full shadow-lg transition-all transform hover:scale-105"
						onClick={() => (window.location.href = "/")}
					>
						Start New Adventure
					</button>
				</div>
			</div>
		</div>
	);
}
