"use client";

import { FinancialJourney } from "@/components/financial-journey";
import { MetricsCard } from "@/components/metrics-card";
import { SpendingGraph } from "@/components/spending-graph";
import { Timeline } from "@/components/timeline";
import { TransactionList } from "@/components/transaction-list";
import {
	TutorialDialogContent,
	TutorialHighlight,
	TutorialPopoverContent,
	TutorialSpot,
	TutorialTrigger,
} from "@/components/tutorial";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimePointKind, type Step } from "@/lib/engine/actions";
import { getActionDurations } from "@/lib/engine/quests";
import { questStore } from "@/lib/stores/quest-store";
import { useSelector } from "@xstate/store/react";
import {
	BarChart3,
	ChevronDown,
	ChevronUp,
	Clock,
	Route,
	Trophy,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
	const [isYearStatsOpen, setIsYearStatsOpen] = useState(true);
	const [isTimelineOpen, setIsTimelineOpen] = useState(true);
	const [isFinancialDataOpen, setIsFinancialDataOpen] = useState(true);

	// Get current simulation state from XState store
	const context = useSelector(questStore, (s) => s.context);

	const {
		currentStep,
		timeframe,
		steps: allSteps,
	}: {
		currentStep: Step;
		timeframe: TimePointKind;
		steps: Step[];
	} = useMemo(() => {
		const currentStep = context.steps[context.currentStepIndex];
		const data = {
			currentStep,
			timeframe: context.description.timePointKind, // "year" | "month" | "week" | "day"
			steps: context.steps, // All simulation steps
		};
		return data;
	}, [context]); // Recompute when context changes

	const currentStepIndex = useSelector(
		questStore,
		(s) => s.context.currentStepIndex
	);

	// Calculate action timings (when actions start/end)
	const actionTimings = useMemo(() => {
		const timings = getActionDurations(context);

		return timings;
	}, [context]); // Recompute when steps change

	// Handle selection of a specific time point in the journey
	const handleStepSelect = (timeUnit: string | number) => {
		// @ts-expect-error because we know the first unit is a string
		const newIndex = currentUnits.indexOf(timeUnit);

		if (newIndex !== -1) {
			questStore.send({
				type: "currentStepIndexChange",
				newCurrentStepIndex: newIndex,
			});
		}
	};

	// Select appropriate time units based on timeframe
	const currentUnits =
		timeframe === "year"
			? yearUnits
			: timeframe === "month"
			? monthUnits
			: timeframe === "week"
			? weekUnits
			: dayUnits;

	useEffect(() => {
		console.log("Current step:", currentStep);
	}, [currentStep]);

	return (
		<main className="min-h-screen p-4 bg-indigo-50 flex justify-center">
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
						<TutorialSpot marker={{ kind: "decision-roadmap" }}>
							<TutorialHighlight>
								<div className="timeline-container">
									<div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
										<div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-2 px-4">
											<h2 className="text-white font-bold flex items-center gap-2">
												<Route className="h-4 w-4" />
												Decisions roadmap
											</h2>
										</div>
										<div className="p-2">
											<FinancialJourney
												timeUnits={currentUnits}
												onTimePointSelect={
													handleStepSelect
												}
											/>
										</div>
									</div>
								</div>
							</TutorialHighlight>
							<TutorialPopoverContent isAdvanceable />
						</TutorialSpot>

						<TutorialSpot marker={{ kind: "timeline" }}>
							<TutorialHighlight>
								<div className="timeline-container">
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
													selectedUnit={
														currentUnits[
															currentStepIndex
														]
													}
													nowMarker={
														currentStep.timePoint
													}
													onUnitClick={
														handleStepSelect
													}
													actionTimings={actionTimings.map(
														(timing) => ({
															action: timing.action,
															startTimePoint:
																timing.startTimePoint,
															endTimePoint:
																timing.endTimePoint,
														})
													)}
												/>
											</div>
										</CollapsibleContent>
									</Collapsible>
								</div>
							</TutorialHighlight>
							<TutorialPopoverContent isAdvanceable />
						</TutorialSpot>
					</div>

					<div className="space-y-6">
						<TutorialSpot marker={{ kind: "metrics-card" }}>
							<TutorialHighlight>
								<div className="timeline-container">
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
											<div className="p-4">
												<MetricsCard
													selectedTime={
														currentStep.timePoint
													}
													steps={allSteps}
													actionTimings={actionTimings.map(
														(timing) => ({
															action: timing.action,
															startTimePoint:
																timing.startTimePoint,
															endTimePoint:
																timing.endTimePoint,
														})
													)}
												/>
											</div>
										</CollapsibleContent>
									</Collapsible>
								</div>
							</TutorialHighlight>
							<TutorialPopoverContent isAdvanceable />
						</TutorialSpot>

						<TutorialSpot marker={{ kind: "financial-data" }}>
							<TutorialHighlight>
								<div className="timeline-container">
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
														<TutorialSpot
															marker={{
																kind: "graphs",
															}}
														>
															<TutorialTrigger
																asChild
															>
																<TabsTrigger
																	value="analysis"
																	className="text-xs h-6 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
																>
																	Analysis
																</TabsTrigger>
															</TutorialTrigger>
															<TutorialPopoverContent />
														</TutorialSpot>
													</TabsList>
												</div>

												<TabsContent
													value="transactions"
													className="p-2"
												>
													<TransactionList
														actionTimings={getActionDurations(
															{
																...context,
																description:
																	context.description,
																steps: allSteps,
																currentStepIndex:
																	allSteps.findIndex(
																		(
																			step
																		) =>
																			step.timePoint ===
																			currentStep.timePoint
																	),
																greatestUnlockedStepIndex:
																	context.greatestUnlockedStepIndex,
															}
														)}
														currentTimePoint={
															currentStep.timePoint
														}
													/>
												</TabsContent>

												<TabsContent
													value="analysis"
													className="p-2"
												>
													<TutorialSpot
														marker={{
															kind: "graph-container",
														}}
													>
														<TutorialHighlight>
															<div className="timeline-container">
																<SpendingGraph
																	timeUnits={
																		currentUnits
																	}
																	selectedUnit={
																		currentStep.timePoint
																	}
																	actionTimings={
																		actionTimings
																	}
																	timeframe={
																		timeframe
																	}
																/>
															</div>
														</TutorialHighlight>
														<TutorialPopoverContent
															isAdvanceable
														/>
													</TutorialSpot>
												</TabsContent>
											</Tabs>
										</CollapsibleContent>
									</Collapsible>
								</div>
							</TutorialHighlight>
							<TutorialPopoverContent isAdvanceable />
						</TutorialSpot>
						<TutorialSpot marker={{ kind: "steps-done-dialog" }}>
							<TutorialDialogContent />
						</TutorialSpot>
					</div>
				</div>
			</div>
		</main>
	);
}
