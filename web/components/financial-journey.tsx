"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Lock, ChevronRight, Star, Sparkles } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MetricsCard } from "@/components/metrics-card";
import { TransactionList } from "@/components/transaction-list";
import { SpendingGraph } from "@/components/spending-graph";
import { Timeline, type ActionTiming } from "@/components/timeline";
import type { Step } from "@/lib/cases/actions";

interface FinancialJourneyProps {
	steps: Step[];
	timeUnits: (string | number)[];
	actionTimings: ActionTiming[];
	currentYear: number;
	onYearSelect: (year: number) => void;
}

function JourneyNode({
	year,
	point,
	status,
	nodeColor,
	nodeIcon,
	achievementLevel,
	onClick,
}: {
	year: number;
	point: [number, number];
	status: string;
	nodeColor: string;
	nodeIcon: React.ReactNode;
	achievementLevel: number;
	onClick: () => void;
}) {
	return (
		<motion.div
			key={year}
			className="absolute flex flex-col items-center cursor-pointer transition-transform"
			style={{
				left: `${point[0].toFixed(2)}px`,
				top: `${point[1].toFixed(2)}px`,
			}}
			whileHover={{ scale: 1.1 }}
			onClick={onClick}
		>
			<div
				className={`w-16 h-16 rounded-full ${nodeColor} border-4 flex items-center justify-center relative z-10 shadow-lg`}
			>
				{nodeIcon}

				<div className="absolute -bottom-8 bg-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
					{year}
				</div>
			</div>

			{status === "current" && (
				<motion.div
					className="absolute w-16 h-16 rounded-full bg-indigo-400 opacity-50 z-0"
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.7, 0.3, 0.7],
					}}
					transition={{
						duration: 2,
						repeat: Number.POSITIVE_INFINITY,
					}}
				/>
			)}
		</motion.div>
	);
}

export function FinancialJourney({
	steps,
	timeUnits,
	actionTimings,
	currentYear,
	onYearSelect,
}: FinancialJourneyProps) {
	const [selectedNode, setSelectedNode] = useState<number>(currentYear);
	const [detailsOpen, setDetailsOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<
		"metrics" | "transactions" | "spending"
	>("metrics");
	const [minWidth, setMinWidth] = useState(0);
	const [highestUnlockedYear, setHighestUnlockedYear] = useState(currentYear);

	// Update highestUnlockedYear if currentYear increases
	useEffect(() => {
		if (currentYear > highestUnlockedYear) {
			setHighestUnlockedYear(currentYear);
		}
	}, [currentYear, highestUnlockedYear]);

	const years = useMemo(
		() => timeUnits.filter((unit) => typeof unit === "number") as number[],
		[timeUnits]
	);

	const pathPoints = useMemo(() => {
		const points: [number, number][] = [[50, 50]];

		const seedRandom = (n: number) => ((Math.sin(n) * 10000) % 1) * 40;

		for (let i = 1; i < years.length; i++) {
			const [prevX, prevY] = points[i - 1];
			const direction = i % 3;

			const newX = prevX + 120 + seedRandom(i * 2);
			let newY = prevY;

			if (direction === 1) newY = prevY + 80 + seedRandom(i * 3);
			else if (direction === 2) newY = prevY - 80 - seedRandom(i * 5);

			points.push([newX, Math.max(50, Math.min(350, newY))]);
		}

		return points;
	}, [years]);

	const pathString = useMemo(() => {
		if (!pathPoints || pathPoints.length < 2) return "";

		let path = `M ${pathPoints[0][0]} ${pathPoints[0][1]}`;

		for (let i = 1; i < pathPoints.length; i++) {
			const [prevX, prevY] = pathPoints[i - 1];
			const [currentX, currentY] = pathPoints[i];

			const controlX = prevX + (currentX - prevX) * 0.5;

			path += ` C ${controlX.toFixed(6)} ${prevY.toFixed(
				6
			)}, ${controlX.toFixed(6)} ${currentY.toFixed(
				6
			)}, ${currentX.toFixed(6)} ${currentY.toFixed(6)}`;
		}

		return path;
	}, [pathPoints]);

	useEffect(() => {
		if (pathPoints.length > 0 && minWidth === 0) {
			setMinWidth(Math.max(...pathPoints.map((p) => p[0])) + 100);
		}
	}, [pathPoints, minWidth]);

	const getNodeStatus = useCallback(
		(year: number) => {
			if (selectedNode && year < selectedNode) return "completed";
			if (selectedNode && year === selectedNode) return "current";
			if (year <= highestUnlockedYear) return "completed";
			return "locked";
		},
		[selectedNode, highestUnlockedYear]
	);

	// IVA TODO: Change here for emojies -> 4 emojies?
	const getNodeAppearance = useCallback(
		(year: number) => {
			const status = getNodeStatus(year);

			const appearance = {
				status,
				color: "bg-gray-300 border-gray-400",
				icon: <Lock className="h-4 w-4 text-gray-500" />,
			};

			if (status === "completed") {
				appearance.color = "bg-emerald-500 border-emerald-600";
				appearance.icon = (
					<CheckCircle className="h-5 w-5 text-white" />
				);
			} else if (status === "current") {
				appearance.color = "bg-indigo-500 border-indigo-600";
				appearance.icon = <Star className="h-5 w-5 text-yellow-300" />;
			}

			return appearance;
		},
		[getNodeStatus]
	);

	const getAchievementLevel = useCallback(
		(year: number) => {
			const step = steps.find((step) => step.tick === year);
			if (!step) return 0;
			return Math.floor((step.joy * 10 + step.bankAccount / 1000) / 2);
		},
		[steps]
	);

	const handleNodeClick = useCallback(
		(year: number) => {
			if (year <= highestUnlockedYear) {
				setSelectedNode(year);
				onYearSelect(year);
				setDetailsOpen(true);
			}
		},
		[highestUnlockedYear, onYearSelect]
	);

	return (
		<div className="relative w-full h-70 overflow-auto bg-gradient-to-b from-indigo-50 to-white rounded-lg">
			<div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-purple-100 opacity-30"></div>
			<div className="absolute bottom-20 right-20 w-16 h-16 rounded-full bg-indigo-100 opacity-30"></div>
			<div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-blue-100 opacity-20"></div>

			<div
				className="relative w-full h-[500px] overflow-auto"
				style={{ minWidth: `${minWidth}px` }}
			>
				<svg
					className="absolute top-0 left-0 w-full h-full"
					style={{ minWidth: `${minWidth}px` }}
				>
					<defs>
						<linearGradient
							id="pathGradient"
							x1="0%"
							y1="0%"
							x2="100%"
							y2="0%"
						>
							<stop offset="0%" stopColor="#8B5CF6" />
							<stop offset="50%" stopColor="#6366F1" />
							<stop offset="100%" stopColor="#EC4899" />
						</linearGradient>
					</defs>

					<path
						d={pathString}
						fill="none"
						stroke="url(#pathGradient)"
						strokeWidth="8"
						strokeLinecap="round"
						strokeDasharray="1, 0"
						className="drop-shadow-md"
					/>

					<path
						d={pathString}
						fill="none"
						stroke="#CBD5E1"
						strokeWidth="8"
						strokeLinecap="round"
						strokeDasharray="1, 15"
						strokeDashoffset="10"
						className="opacity-50"
					/>
				</svg>

				{years.map((year, index) => {
					const point = pathPoints[index];
					const { status, color, icon } = getNodeAppearance(year);
					const achievementLevel = getAchievementLevel(year);

					return (
						<JourneyNode
							key={year}
							year={year}
							point={point}
							status={status}
							nodeColor={color}
							nodeIcon={icon}
							achievementLevel={achievementLevel}
							onClick={() => handleNodeClick(year)}
						/>
					);
				})}
			</div>

			<Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
				<DialogContent className="sm:max-w-[800px] bg-white border-0 shadow-xl max-h-[90vh] overflow-auto">
					<DialogHeader>
						<DialogTitle className="text-xl font-bold text-indigo-700 flex items-center gap-2">
							<span>Financial Journey: {selectedNode}</span>
							{selectedNode && (
								<div
									className={`px-2 py-0.5 rounded-full text-xs ${
										getNodeStatus(selectedNode) ===
										"completed"
											? "bg-emerald-100 text-emerald-700"
											: "bg-indigo-100 text-indigo-700"
									}`}
								>
									{getNodeStatus(selectedNode) === "completed"
										? "Completed"
										: "In Progress"}
								</div>
							)}
						</DialogTitle>
						<DialogDescription className="text-gray-600">
							Review your financial progress and make decisions
						</DialogDescription>
					</DialogHeader>

					<div className="flex border-b mb-4">
						{["metrics", "transactions", "spending"].map((tab) => (
							<button
								key={tab}
								className={`px-4 py-2 font-medium text-sm ${
									activeTab === tab
										? "text-indigo-600 border-b-2 border-indigo-600"
										: "text-gray-500"
								}`}
								onClick={() => setActiveTab(tab as any)}
							>
								{tab.charAt(0).toUpperCase() + tab.slice(1)}
							</button>
						))}
					</div>

					<div className="space-y-4">
						{activeTab === "metrics" && selectedNode && (
							<MetricsCard
								selectedYear={selectedNode}
								currentYear={selectedNode}
								timeframe="years"
								steps={steps}
								actionTimings={actionTimings}
							/>
						)}

						{activeTab === "transactions" && selectedNode && (
							<TransactionList
								selectedTimeframe="years"
								selectedUnit={selectedNode}
							/>
						)}

						{activeTab === "spending" && selectedNode && (
							<SpendingGraph
								timeUnits={timeUnits}
								selectedUnit={selectedNode}
								actionTimings={actionTimings}
							/>
						)}

						<div className="mt-4 pt-4 border-t border-gray-200">
							<h3 className="text-sm font-bold text-gray-700 mb-2">
								Timeline
							</h3>
							<Timeline
								timeUnits={timeUnits}
								steps={steps}
								selectedUnit={selectedNode || currentYear}
								unitType="years"
								onUnitClick={(unit) =>
									onYearSelect(Number(unit))
								}
								actionTimings={actionTimings}
							/>
						</div>

						<div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
							<Button
								variant="outline"
								onClick={() => setDetailsOpen(false)}
								className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
							>
								Close
							</Button>

							{selectedNode &&
								getNodeStatus(selectedNode) === "current" && (
									<Button
										className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
										onClick={() => {
											console.log(
												"Progress to next year"
											);
											setDetailsOpen(false);
										}}
									>
										Complete Year{" "}
										<ChevronRight className="h-4 w-4 ml-1" />
									</Button>
								)}
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
