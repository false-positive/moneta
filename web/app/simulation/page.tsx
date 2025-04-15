"use client";

import { useState, useEffect } from "react";
import { FinancialJourney } from "@/components/financial-journey";
import { MetricsCard } from "@/components/metrics-card";
import { TransactionList } from "@/components/transaction-list";
import { SpendingGraph } from "@/components/spending-graph";
import { Timeline, type ActionTiming } from "@/components/timeline";
import type { Step, Action } from "@/lib/cases/actions";
import { CaseDescription, simulateWithActions } from "@/lib/cases/index";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Trophy,
	ChevronDown,
	ChevronUp,
	BarChart3,
	Clock,
	Route,
} from "lucide-react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import SuperJSON from "superjson";

const yearUnits = Array.from({ length: 16 }, (_, i) => 2020 + i);
const monthUnits = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];
const weekUnits = Array.from({ length: 52 }, (_, i) => `Week ${i + 1}`);
const dayUnits = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);

export default function Simulation() {
	const [currentStep, setCurrentStep] = useState(2020);
	const [isYearStatsOpen, setIsYearStatsOpen] = useState(true);
	const [isTimelineOpen, setIsTimelineOpen] = useState(true);
	const [isFinancialDataOpen, setIsFinancialDataOpen] = useState(true);
	const [steps, setSteps] = useState<Step[]>([]);
	const [actionTimings, setActionTimings] = useState<ActionTiming[]>([]);
	const timeframe = "years";

	useEffect(() => {
		const currentYearStep = steps.find((step) => step.tick === currentStep);
		if (currentYearStep) {
			console.log("[simulation] Current Year Information:", {
				year: currentStep,
				bankAccount: currentYearStep.bankAccount,
				joy: currentYearStep.joy,
				freeTime: currentYearStep.freeTime,
				newActions: currentYearStep.newActions,
				activeActions: currentYearStep.oldActiveActions,
				allActions: [
					...currentYearStep.oldActiveActions,
					...currentYearStep.newActions,
				],
			});

			const activeTimings = actionTimings.filter(
				(timing) =>
					timing.startTick <= currentStep &&
					timing.endTick >= currentStep
			);

			console.log(
				"[simulation] Active action timings for year",
				currentStep,
				":",
				activeTimings
			);
		} else {
			console.log("No data for year:", currentStep);
		}
	}, [currentStep, actionTimings]);

	useEffect(() => {
		const storedSteps = SuperJSON.parse(
			localStorage.getItem("steps") || "[]"
		) as Step[];
		const storedActionTimings = SuperJSON.parse(
			localStorage.getItem("actionTimings") || "[]"
		) as ActionTiming[];

		setSteps(storedSteps);
		setActionTimings(storedActionTimings);

		const firstStep = storedSteps[0]?.tick || 2020;
		setCurrentStep(firstStep);
	}, []);

	const handleStepSelect = (year: number) => {
		setCurrentStep(year);
		if (timeframe === "years") {
			setCurrentStep(year);
		}
	};

	const currentUnits =
		timeframe === "years"
			? yearUnits
			: timeframe === "months"
			? monthUnits
			: timeframe === "weeks"
			? weekUnits
			: dayUnits;

	return (
		<main className="min-h-screen p-4 bg-gradient-to-b from-indigo-50 to-white flex justify-center">
			<div className="max-w-6xl w-full">
				<div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-md">
					<h1 className="text-2xl font-bold text-indigo-900 flex items-center gap-2">
						<span className="bg-indigo-600 text-white p-2 rounded-lg">
							<Trophy className="h-6 w-6" />
						</span>
						Your Financial Journey
					</h1>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2">
						<div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
							<div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-2 px-4">
								<h2 className="text-white font-bold flex items-center gap-2">
									<Route className="h-4 w-4" />
									Your Financial Journey
								</h2>
							</div>
							<div className="p-2">
								{/* <FinancialJourney
									steps={steps}
									timeUnits={currentUnits}
									actionTimings={actionTimings}
									currentYear={currentStep}
									onYearSelect={handleStepSelect}
									highestUnlockedYear={highestUnlockedStep}
								/> */}
							</div>
						</div>

						<Collapsible
							open={isTimelineOpen}
							onOpenChange={setIsTimelineOpen}
							className="bg-white rounded-xl shadow-md overflow-hidden mb-6"
						>
							<div className="bg-gradient-to-r from-blue-600 to-cyan-600 py-2 px-4">
								<CollapsibleTrigger className="w-full flex justify-between items-center text-white">
									<h2 className="font-bold flex items-center gap-2">
										<Clock className="h-4 w-4" />
										Timeline
									</h2>
									{isTimelineOpen ? (
										<ChevronUp className="h-4 w-4" />
									) : (
										<ChevronDown className="h-4 w-4" />
									)}
								</CollapsibleTrigger>
							</div>
							<CollapsibleContent>
								<div className="p-4">
									<Timeline
										timeUnits={currentUnits}
										steps={steps}
										selectedUnit={currentStep}
										unitType={timeframe}
										onUnitClick={(unit) => {
											handleStepSelect(unit as any);
										}}
										actionTimings={actionTimings}
									/>
								</div>
							</CollapsibleContent>
						</Collapsible>
					</div>

					<div className="space-y-6">
						<Collapsible
							open={isYearStatsOpen}
							onOpenChange={setIsYearStatsOpen}
							className="bg-white rounded-xl shadow-md overflow-hidden"
						>
							<div className="bg-gradient-to-r from-purple-600 to-pink-600 py-2 px-4">
								<CollapsibleTrigger className="w-full flex justify-between items-center text-white">
									<h2 className="font-bold flex items-center gap-2">
										<Trophy className="h-4 w-4" />
										Stats
									</h2>
									{isYearStatsOpen ? (
										<ChevronUp className="h-4 w-4" />
									) : (
										<ChevronDown className="h-4 w-4" />
									)}
								</CollapsibleTrigger>
							</div>
							<CollapsibleContent>
								<div className="p-2">
									<MetricsCard
										selectedTime={currentStep}
										steps={steps.map((step) => ({
											...step,
											oldActiveActions: [
												...step.oldActiveActions,
												...step.newActions,
											],
										}))}
										actionTimings={actionTimings}
									/>
								</div>
							</CollapsibleContent>
						</Collapsible>

						<Collapsible
							open={isFinancialDataOpen}
							onOpenChange={setIsFinancialDataOpen}
							className="bg-white rounded-xl shadow-md overflow-hidden"
						>
							<div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-2 px-4">
								<CollapsibleTrigger className="w-full flex justify-between items-center text-white">
									<h2 className="font-bold flex items-center gap-2">
										<BarChart3 className="h-4 w-4" />
										Financial Data
									</h2>
									{isFinancialDataOpen ? (
										<ChevronUp className="h-4 w-4" />
									) : (
										<ChevronDown className="h-4 w-4" />
									)}
								</CollapsibleTrigger>
							</div>

							<CollapsibleContent>
								<Tabs
									defaultValue="transactions"
									className="w-full"
								>
									<div className="px-4 pt-3 pb-1 flex justify-end">
										<TabsList className="bg-emerald-100 p-0.5 h-7">
											<TabsTrigger
												value="transactions"
												className="text-xs h-6 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
											>
												Transactions
											</TabsTrigger>
											<TabsTrigger
												value="analysis"
												className="text-xs h-6 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
											>
												Analysis
											</TabsTrigger>
										</TabsList>
									</div>

									<TabsContent
										value="transactions"
										className="p-2"
									>
										<TransactionList
											selectedTimeframe={timeframe}
											selectedUnit={currentStep}
											actions={
												steps.find(
													(step) =>
														step?.tick ===
														currentStep
												)
													? [
															...(steps.find(
																(step) =>
																	step?.tick ===
																	currentStep
															)?.newActions ||
																[]),
															...(steps.find(
																(step) =>
																	step?.tick ===
																	currentStep
															)
																?.oldActiveActions ||
																[]),
													  ]
													: []
											}
											actionTimings={actionTimings}
											currentYear={currentStep}
										/>
									</TabsContent>

									<TabsContent
										value="analysis"
										className="p-2"
									>
										<SpendingGraph
											timeUnits={currentUnits}
											selectedUnit={currentStep}
											actionTimings={actionTimings}
											timeframe={timeframe}
											currentYear={currentStep}
										/>
									</TabsContent>
								</Tabs>
							</CollapsibleContent>
						</Collapsible>
					</div>
				</div>
			</div>
		</main>
	);
}
