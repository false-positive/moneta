"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
	PiggyBank,
	Clock,
	Heart,
	ChevronRight,
	Trophy,
	Star,
	Sparkles,
	Target,
	UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type Step = {
	tick: number;
	budget: number;
	isBudgetKnown: boolean;
	joy: number;
	isJoyKnown: boolean;
	freeTime: number;
	isFreeTimeKnown: boolean;
};

export type Case = {
	id: number;
	personName: string;
	caseLLMDescription: string;
	initialStep: Step;
	difficulty?: "easy" | "medium" | "hard";
};

const defaultCasesData: Record<string, Case> = {
	"case-1": {
		id: 1,
		personName: "John Doe",
		caseLLMDescription:
			"John is facing financial difficulties after a recent job loss.",
		initialStep: {
			tick: 1,
			budget: 5000,
			isBudgetKnown: true,
			joy: 75,
			isJoyKnown: true,
			freeTime: 20,
			isFreeTimeKnown: true,
		},
		difficulty: "easy",
	},
	"case-2": {
		id: 2,
		personName: "Jane Smith",
		caseLLMDescription:
			"Jane is balancing her studies with a part-time job.",
		initialStep: {
			tick: 1,
			budget: 2000,
			isBudgetKnown: true,
			joy: 85,
			isJoyKnown: true,
			freeTime: 15,
			isFreeTimeKnown: false,
		},
		difficulty: "medium",
	},
	"case-3": {
		id: 3,
		personName: "Alex Johnson",
		caseLLMDescription:
			"Alex recently moved to a new city and is adjusting to the change.",
		initialStep: {
			tick: 1,
			budget: 3000,
			isBudgetKnown: false,
			joy: 60,
			isJoyKnown: true,
			freeTime: 10,
			isFreeTimeKnown: true,
		},
		difficulty: "hard",
	},
};

const getDifficultyColor = (difficulty: string) => {
	switch (difficulty) {
		case "easy":
			return {
				bg: "from-emerald-600 to-teal-600",
				badge: "bg-emerald-100 text-emerald-700",
				icon: "text-emerald-500",
			};
		case "medium":
			return {
				bg: "from-blue-600 to-indigo-600",
				badge: "bg-blue-100 text-blue-700",
				icon: "text-blue-500",
			};
		case "hard":
			return {
				bg: "from-purple-600 to-pink-600",
				badge: "bg-purple-100 text-purple-700",
				icon: "text-purple-500",
			};
		default:
			return {
				bg: "from-indigo-600 to-purple-600",
				badge: "bg-indigo-100 text-indigo-700",
				icon: "text-indigo-500",
			};
	}
};

export function CaseCards() {
	const [hoveredCase, setHoveredCase] = useState<string | null>(null);
	const [selectedCase, setSelectedCase] = useState<string | null>(null);
	const [cases, setCases] = useState<Record<string, Case>>({});

	useEffect(() => {
		setCases(defaultCasesData);
	}, []);

	return (
		<div className="flex flex-col space-y-6 max-w-4xl mx-auto">
			{Object.entries(cases).map(([caseId, caseItem]) => {
				const difficultyColors = getDifficultyColor(
					caseItem.difficulty || ""
				);
				const isSelected = selectedCase === caseId;

				return (
					<motion.div
						key={caseId}
						className="cursor-pointer relative overflow-hidden rounded-xl shadow-md bg-white"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
						whileHover={{
							scale: 1.02,
							transition: { duration: 0.2 },
						}}
						onClick={() =>
							setSelectedCase(isSelected ? null : caseId)
						}
						onMouseEnter={() => setHoveredCase(caseId)}
						onMouseLeave={() => setHoveredCase(null)}
					>
						<div
							className={`bg-gradient-to-r ${difficultyColors.bg} py-3 px-4`}
						>
							<div className="flex justify-between items-center">
								<h2 className="text-white font-bold flex items-center gap-2">
									<Sparkles className="h-4 w-4" />
									<p>{caseItem.personName}</p>
								</h2>
								<div className="flex items-center gap-2">
									<div
										className={`${difficultyColors.badge} px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1`}
									>
										<Star className="h-3 w-3" />
										<span className="capitalize">
											{caseItem.difficulty} Quest
										</span>
									</div>
								</div>
							</div>
						</div>

						<div className="p-4">
							<div className="flex items-center gap-6">
								<div className="relative">
									<div
										className={`absolute inset-0 bg-gradient-to-b ${difficultyColors.bg} rounded-full opacity-20`}
									></div>
									<div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden">
										<UserRound className="w-full h-full" />
									</div>
									<div className="absolute -bottom-1 -right-1 bg-amber-400 rounded-full p-1 shadow-md">
										<div className="text-xs font-bold text-white">
											Lvl {caseItem.id}
										</div>
									</div>
								</div>

								<div className="flex-1">
									<p className="text-gray-700 text-sm">
										{caseItem.caseLLMDescription}
									</p>
								</div>

								<Button
									className={`bg-gradient-to-r ${difficultyColors.bg} hover:opacity-90 text-white`}
								>
									Start Quest{" "}
									<ChevronRight className="h-4 w-4 ml-1" />
								</Button>
							</div>

							{isSelected && (
								<motion.div
									className="mt-4 pt-4 border-t border-gray-200"
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									transition={{ duration: 0.3 }}
								>
									<h3 className="text-sm font-bold text-gray-700 mb-3">
										Initial Stats
									</h3>

									<div className="grid grid-cols-3 gap-4">
										{caseItem.initialStep.isBudgetKnown && (
											<div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
												<div className="flex items-center gap-2 mb-2">
													<div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
														<PiggyBank className="h-5 w-5 text-emerald-600" />
													</div>
													<div>
														<div className="text-xs text-gray-500">
															Budget
														</div>
														<div className="text-sm font-bold text-emerald-700">
															$
															{
																caseItem
																	.initialStep
																	.budget
															}
														</div>
													</div>
												</div>
												<div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
													<div
														className="h-full bg-emerald-500 rounded-full"
														style={{
															width: `${Math.min(
																100,
																(caseItem
																	.initialStep
																	.budget /
																	10000) *
																	100
															)}%`,
														}}
													></div>
												</div>
											</div>
										)}

										{caseItem.initialStep.isJoyKnown && (
											<div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
												<div className="flex items-center gap-2 mb-2">
													<div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
														<Heart className="h-5 w-5 text-rose-600" />
													</div>
													<div>
														<div className="text-xs text-gray-500">
															Joy
														</div>
														<div className="text-sm font-bold text-rose-700">
															{
																caseItem
																	.initialStep
																	.joy
															}
															%
														</div>
													</div>
												</div>
												<div className="flex gap-0.5">
													{[...Array(5)].map(
														(_, i) => (
															<div
																key={i}
																className={`w-full h-5 rounded-sm ${
																	i <
																	Math.round(
																		caseItem
																			.initialStep
																			.joy /
																			20
																	)
																		? "bg-rose-500"
																		: "bg-gray-200"
																}`}
															></div>
														)
													)}
												</div>
											</div>
										)}

										{caseItem.initialStep
											.isFreeTimeKnown && (
											<div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
												<div className="flex items-center gap-2 mb-2">
													<div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
														<Clock className="h-5 w-5 text-amber-600" />
													</div>
													<div>
														<div className="text-xs text-gray-500">
															Free Time
														</div>
														<div className="text-sm font-bold text-amber-700">
															{
																caseItem
																	.initialStep
																	.freeTime
															}
															h/w
														</div>
													</div>
												</div>
												<div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
													<div
														className="h-full bg-amber-500 rounded-full"
														style={{
															width: `${Math.min(
																100,
																(caseItem
																	.initialStep
																	.freeTime /
																	40) *
																	100
															)}%`,
														}}
													></div>
												</div>
											</div>
										)}
									</div>

									<div className="mt-4 flex justify-end">
										<Button
											variant="outline"
											className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 mr-2"
										>
											View Details
										</Button>
										<Button
											className={`bg-gradient-to-r ${difficultyColors.bg} hover:opacity-90 text-white`}
										>
											Accept Quest{" "}
											<Target className="h-4 w-4 ml-1" />
										</Button>
									</div>
								</motion.div>
							)}
						</div>
					</motion.div>
				);
			})}
		</div>
	);
}
