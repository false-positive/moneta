"use client";

import { useState, useEffect } from "react";
import { FinancialJourney } from "@/components/financial-journey";
import { MetricsCard } from "@/components/metrics-card";
import { TransactionList } from "@/components/transaction-list";
import { SpendingGraph } from "@/components/spending-graph";
import { Timeline, type ActionTiming } from "@/components/timeline";
import type { Step, Action } from "@/lib/cases/actions";
import {
	lifeAction,
	waiterJobAction,
	savingsDepositAction,
	pensionInvestmentAction,
} from "@/lib/cases/standard-actions";
import { CaseDescription, simulateWithActions } from "@/lib/cases/index";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Trophy,
	ArrowRight,
	ChevronDown,
	ChevronUp,
	BarChart3,
	Target,
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

const createHardcodedSimulation = () => {
	return; // ~божо

	const INITIAL_BANK_ACCOUNT = 20000;

	const initialStep: Step = {
		tick: 2020,
		bankAccount: INITIAL_BANK_ACCOUNT,
		joy: 100,
		freeTime: 100,
		newActions: [],
		isBankAccountKnown: true,
		isJoyKnown: true,
		isFreeTimeKnown: true,
		oldActiveActions: [{ ...lifeAction }],
	};

	const caseDescription: CaseDescription = {
		personName: "Financial Explorer",
		caseLLMDescriptipn:
			"A financial simulation exploring different career and investment choices",
		stepCount: 5,
		tickKind: "year",
		initialStep,
	};

	// Define actions for each year
	const newActionsPerTick: Action[][] = [
		// Year 2021 - Add waiter job
		[
			{
				...waiterJobAction,
				remainingTicks: 3, // 3 years
			},
		],

		// Year 2022 - Add savings deposit
		[
			{
				...savingsDepositAction,
				remainingTicks: 2, // 2 years
				capital: 1000,
			},
		],

		// Year 2023 - No new actions
		[],

		// Year 2024 - No new actions
		[],

		// Year 2025 - Start fresh with more investment
		[
			{
				...pensionInvestmentAction,
				remainingTicks: 3, // 3 years
				capital: 5000,
			},
		],
	];

	const yearlySteps = simulateWithActions(caseDescription, newActionsPerTick);

	const generateActionTimings = (steps: Step[]): ActionTiming[] => {
		console.log("[simulation] generateActionTimings", steps);
		const actionMap = new Map<string, ActionTiming>();

		for (const step of steps) {
			step.newActions.forEach((action) => {
				console.log("[simulation] action", action);
				const actionKey = `${action.name}-${action.kind}`;
				const endTick =
					action.remainingTicks === Infinity
						? step.tick + 15
						: step.tick + action.remainingTicks;

				console.log("[simulation] actionKey", actionKey);
				console.log("[simulation] endTick", endTick);

				actionMap.set(actionKey, {
					action: { ...action },
					startTick: step.tick,
					endTick,
				});
				console.log("[simulation] actionKey", actionKey);
			});
		}

		return Array.from(actionMap.values());
	};

	const actionTimings = generateActionTimings(yearlySteps);

	return {
		yearlySteps,
		actionTimings,
		caseDescription,
	};
};

const generateSubTimeframeSteps = (
	yearlySteps: Step[],
	selectedYear?: number
) => {
	return; // ~божо

	const monthlySteps: Step[] = [];
	const weeklySteps: Step[] = [];
	const dailySteps: Step[] = [];

	// If we have steps from the yearly steps
	if (yearlySteps.length > 0) {
		// Find the correct yearly step to base sub-timeframe steps on
		// Either use the selected year, or fall back to the most recent year
		const baseYearlyStep = selectedYear
			? yearlySteps.find((step) => step.tick === selectedYear) ||
			  yearlySteps[yearlySteps.length - 1]
			: yearlySteps[yearlySteps.length - 1];

		// Monthly steps - spread the yearly values over 12 months
		for (let month = 1; month <= 12; month++) {
			const factor = month / 12;
			monthlySteps.push({
				tick: month,
				bankAccount: baseYearlyStep.bankAccount * factor,
				joy: baseYearlyStep.joy * (0.9 + 0.1 * factor),
				freeTime: baseYearlyStep.freeTime * (0.9 + 0.1 * factor),
				newActions: month === 6 ? [...baseYearlyStep.newActions] : [],
				oldActiveActions: [...baseYearlyStep.oldActiveActions],
				isBankAccountKnown: baseYearlyStep.isBankAccountKnown,
				isJoyKnown: baseYearlyStep.isJoyKnown,
				isFreeTimeKnown: baseYearlyStep.isFreeTimeKnown,
			});
		}

		// Weekly steps - 52 weeks
		for (let week = 1; week <= 52; week++) {
			const factor = week / 52;
			weeklySteps.push({
				tick: week,
				bankAccount: baseYearlyStep.bankAccount * factor,
				joy: baseYearlyStep.joy * (0.9 + 0.1 * factor),
				freeTime: baseYearlyStep.freeTime * (0.9 + 0.1 * factor),
				newActions: week === 26 ? [...baseYearlyStep.newActions] : [],
				oldActiveActions: [...baseYearlyStep.oldActiveActions],
				isBankAccountKnown: baseYearlyStep.isBankAccountKnown,
				isJoyKnown: baseYearlyStep.isJoyKnown,
				isFreeTimeKnown: baseYearlyStep.isFreeTimeKnown,
			});
		}

		// Daily steps - 30 days
		for (let day = 1; day <= 30; day++) {
			const factor = day / 30;
			dailySteps.push({
				tick: day,
				bankAccount: (baseYearlyStep.bankAccount * factor) / 12,
				joy: baseYearlyStep.joy * (0.95 + 0.05 * factor),
				freeTime: baseYearlyStep.freeTime * (0.95 + 0.05 * factor),
				newActions: day === 15 ? [...baseYearlyStep.newActions] : [],
				oldActiveActions: [...baseYearlyStep.oldActiveActions],
				isBankAccountKnown: baseYearlyStep.isBankAccountKnown,
				isJoyKnown: baseYearlyStep.isJoyKnown,
				isFreeTimeKnown: baseYearlyStep.isFreeTimeKnown,
			});
		}
	}

	return { monthlySteps, weeklySteps, dailySteps };
};

export default function Simulation() {
	const [currentYear, setCurrentYear] = useState(2020);
	const [selectedYear, setSelectedYear] = useState(2020);

	const [isYearStatsOpen, setIsYearStatsOpen] = useState(true);
	const [isTimelineOpen, setIsTimelineOpen] = useState(true);
	const [isFinancialDataOpen, setIsFinancialDataOpen] = useState(true);
	const [isQuestsOpen, setIsQuestsOpen] = useState(false);
	const [yearlySteps, setYearlySteps] = useState<Step[]>([]);
	const [monthlySteps, setMonthlySteps] = useState<Step[]>([]);
	const [weeklySteps, setWeeklySteps] = useState<Step[]>([]);
	const [dailySteps, setDailySteps] = useState<Step[]>([]);
	const [actionTimings, setActionTimings] = useState<ActionTiming[]>([]);
	const [caseDescription, setCaseDescription] = useState<CaseDescription>();
	const timeframe = "years";

	useEffect(() => {
		const currentYearStep = yearlySteps.find(
			(step) => step.tick === currentYear
		);
		if (currentYearStep) {
			console.log("[simulation] Current Year Information:", {
				year: currentYear,
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
		} else {
			console.log("No data for year:", currentYear);
		}
	}, [currentYear, yearlySteps]);

	useEffect(() => {
		const currentYearStep = yearlySteps.find(
			(step) => step.tick === currentYear
		);
		if (currentYearStep) {
			console.log("Current Year Information:", {
				year: currentYear,
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

			// Log active action timings for debugging
			const activeTimings = actionTimings.filter(
				(timing) =>
					timing.startTick <= currentYear &&
					timing.endTick >= currentYear
			);

			console.log(
				"[simulation] Active action timings for year",
				currentYear,
				":",
				activeTimings
			);
		} else {
			console.log("No data for year:", currentYear);
		}
	}, [currentYear, yearlySteps, actionTimings]);

	useEffect(() => {
		// const { yearlySteps, actionTimings, caseDescription } =
		// 	createHardcodedSimulation();
		// const { monthlySteps, weeklySteps, dailySteps } =
		// 	generateSubTimeframeSteps(yearlySteps);

		const yearlySteps = SuperJSON.parse(
			localStorage.getItem("steps") || "[]"
		) as Step[];

		const firstYear = yearlySteps[0]?.tick || 2020;
		setCurrentYear(firstYear);
		setSelectedYear(firstYear);

		const caseDescription = SuperJSON.parse(
			localStorage.getItem("case") || "{}"
		) as CaseDescription;

		setYearlySteps(yearlySteps);
		setCaseDescription(caseDescription);
		// setMonthlySteps(monthlySteps);
		// setWeeklySteps(weeklySteps);
		// setDailySteps(dailySteps);
		setActionTimings(actionTimings);
	}, []);

	useEffect(() => {
		if (yearlySteps.length > 0) {
			// const { monthlySteps, weeklySteps, dailySteps } =
			// 	generateSubTimeframeSteps(yearlySteps, selectedYear);
			// setMonthlySteps(monthlySteps);
			// setWeeklySteps(weeklySteps);
			// setDailySteps(dailySteps);
		}
	}, [selectedYear, yearlySteps]);

	useEffect(() => {
		if (timeframe === "years") {
			setCurrentYear(selectedYear);
		}
	}, [selectedYear, timeframe]);

	const handleYearSelect = (year: number) => {
		setSelectedYear(year);
		if (timeframe === "years") {
			setCurrentYear(year);
		}
	};

	const currentSteps =
		timeframe === "years"
			? yearlySteps
			: timeframe === "months"
			? monthlySteps
			: timeframe === "weeks"
			? weeklySteps
			: dailySteps;

	const currentUnits =
		timeframe === "years"
			? yearUnits
			: timeframe === "months"
			? monthUnits
			: timeframe === "weeks"
			? weekUnits
			: dayUnits;

	const getTimeUnitDisplay = () => {
		if (timeframe === "years") {
			return `Year ${selectedYear}`;
		} else if (timeframe === "months") {
			return `${monthUnits[selectedYear - 1]} 2023`;
		} else if (timeframe === "weeks") {
			return `Week ${selectedYear}`;
		} else {
			return `Day ${selectedYear}`;
		}
	};

	return (
		<main className="min-h-screen p-4 bg-gradient-to-b from-indigo-50 to-white flex justify-center">
			<div className="max-w-6xl w-full">
				<div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-md">
					<h1 className="text-2xl font-bold text-indigo-900 flex items-center gap-2">
						<span className="bg-indigo-600 text-white p-2 rounded-lg">
							<Trophy className="h-6 w-6" />
						</span>
						{caseDescription?.personName}'s Financial Journey
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
								<FinancialJourney
									steps={currentSteps}
									timeUnits={currentUnits}
									actionTimings={actionTimings}
									currentYear={selectedYear}
									onYearSelect={handleYearSelect}
								/>
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
										steps={currentSteps}
										selectedUnit={selectedYear}
										unitType={timeframe}
										onUnitClick={(unit) => {
											if (typeof unit === "number") {
												handleYearSelect(unit);
											} else {
												handleYearSelect(1);
											}
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
										{getTimeUnitDisplay()} Stats
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
										selectedYear={selectedYear}
										steps={currentSteps.map((step) => ({
											...step,
											oldActiveActions: [
												...step.oldActiveActions,
												...step.newActions,
											],
										}))}
										actionTimings={actionTimings}
										timeframe={timeframe}
										currentYear={currentYear}
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
											selectedUnit={selectedYear}
											actions={
												currentSteps.find(
													(step) =>
														step?.tick ===
														selectedYear
												)
													? [
															...(currentSteps.find(
																(step) =>
																	step?.tick ===
																	selectedYear
															)?.newActions ||
																[]),
															...(currentSteps.find(
																(step) =>
																	step?.tick ===
																	selectedYear
															)
																?.oldActiveActions ||
																[]),
													  ]
													: []
											}
											actionTimings={actionTimings}
											currentYear={currentYear}
										/>
									</TabsContent>

									<TabsContent
										value="analysis"
										className="p-2"
									>
										<SpendingGraph
											timeUnits={currentUnits}
											selectedUnit={selectedYear}
											actionTimings={actionTimings}
											timeframe={timeframe}
											currentYear={currentYear}
										/>
									</TabsContent>
								</Tabs>
							</CollapsibleContent>
						</Collapsible>

						<Collapsible
							open={isQuestsOpen}
							onOpenChange={setIsQuestsOpen}
							className="bg-white rounded-xl shadow-md overflow-hidden"
						>
							<div className="bg-gradient-to-r from-amber-500 to-orange-500 py-2 px-4">
								<CollapsibleTrigger className="w-full flex justify-between items-center text-white">
									<h2 className="font-bold flex items-center gap-2">
										<Target className="h-4 w-4" />
										Financial Quests
									</h2>
									{isQuestsOpen ? (
										<ChevronUp className="h-4 w-4" />
									) : (
										<ChevronDown className="h-4 w-4" />
									)}
								</CollapsibleTrigger>
							</div>

							<CollapsibleContent>
								<div className="p-4 space-y-3">
									<div className="border border-amber-200 rounded-lg p-3 bg-amber-50">
										<div className="flex justify-between items-center">
											<h3 className="font-bold text-amber-800 text-sm">
												Diversify Investments
											</h3>
										</div>
										<p className="text-amber-700 text-xs mt-1">
											Allocate your portfolio across
											different asset classes
										</p>
										<div className="mt-2 flex justify-end">
											<button className="text-xs flex items-center gap-1 text-amber-600 hover:text-amber-800">
												Start Quest{" "}
												<ArrowRight className="h-3 w-3" />
											</button>
										</div>
									</div>

									<div className="border border-emerald-200 rounded-lg p-3 bg-emerald-50">
										<div className="flex justify-between items-center">
											<h3 className="font-bold text-emerald-800 text-sm">
												Emergency Fund
											</h3>
											{/* <span className="bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded text-xs">
													+75 pts
												</span> */}
										</div>
										<p className="text-emerald-700 text-xs mt-1">
											Save 6 months of expenses in a
											liquid account
										</p>
										<div className="mt-2 flex justify-end">
											<button className="text-xs flex items-center gap-1 text-emerald-600 hover:text-emerald-800">
												Start Quest{" "}
												<ArrowRight className="h-3 w-3" />
											</button>
										</div>
									</div>

									<div className="border border-purple-200 rounded-lg p-3 bg-purple-50">
										<div className="flex justify-between items-center">
											<h3 className="font-bold text-purple-800 text-sm">
												Retirement Planning
											</h3>
											{/* <span className="bg-purple-200 text-purple-800 px-2 py-0.5 rounded text-xs">
													+100 pts
												</span> */}
										</div>
										<p className="text-purple-700 text-xs mt-1">
											Set up automatic contributions to
											retirement accounts
										</p>
										<div className="mt-2 flex justify-end">
											<button className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-800">
												Start Quest{" "}
												<ArrowRight className="h-3 w-3" />
											</button>
										</div>
									</div>
								</div>
							</CollapsibleContent>
						</Collapsible>
					</div>
				</div>
			</div>
		</main>
	);
}
