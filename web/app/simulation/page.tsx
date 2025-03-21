"use client";

import { useState } from "react";
import { FinancialJourney } from "@/components/financial-journey";
import { MetricsCard } from "@/components/metrics-card";
import { TransactionList } from "@/components/transaction-list";
import { SpendingGraph } from "@/components/spending-graph";
import { Timeline, type ActionTiming } from "@/components/timeline";
import type { Step, Action } from "@/lib/cases/actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Trophy,
	Sparkles,
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

const mockSteps: Step[] = Array.from({ length: 16 }, (_, i) => {
	const year = 2020 + i;
	return {
		tick: year,
		budget: 5000 + i * 500,
		isBudgetKnown: true,
		joy: 0.5 + Math.sin(i * 0.5) * 0.3 + i * 0.02,
		isJoyKnown: true,
		freeTime: 40 - i * 1.5 + Math.sin(i * 0.8) * 5,
		isFreeTimeKnown: true,
		newActions: [],
		appliedActions: [] as Action[],
	};
});

const mockMonthlySteps: Step[] = Array.from({ length: 12 }, (_, i) => {
	const month = i + 1;
	return {
		tick: month,
		budget: 5000 + i * 150,
		isBudgetKnown: true,
		joy: 0.5 + Math.sin(i * 0.7) * 0.2 + i * 0.01,
		isJoyKnown: true,
		freeTime: 40 - i * 0.5 + Math.sin(i * 0.9) * 3,
		isFreeTimeKnown: true,
		newActions: [],
		appliedActions: [] as Action[],
	};
});

const mockWeeklySteps: Step[] = Array.from({ length: 52 }, (_, i) => {
	const week = i + 1;
	return {
		tick: week,
		budget: 5000 + i * 40,
		isBudgetKnown: true,
		joy: 0.5 + Math.sin(i * 0.8) * 0.15 + i * 0.005,
		isJoyKnown: true,
		freeTime: 40 - i * 0.2 + Math.sin(i * 1.0) * 2,
		isFreeTimeKnown: true,
		newActions: [],
		appliedActions: [] as Action[],
	};
});

const mockDailySteps: Step[] = Array.from({ length: 30 }, (_, i) => {
	const day = i + 1;
	return {
		tick: day,
		budget: 5000 + i * 10,
		isBudgetKnown: true,
		joy: 0.5 + Math.sin(i * 0.9) * 0.1 + i * 0.002,
		isJoyKnown: true,
		freeTime: 40 - i * 0.1 + Math.sin(i * 1.1) * 1,
		isFreeTimeKnown: true,
		newActions: [],
		appliedActions: [] as Action[],
	};
});

const mockActionTimings: ActionTiming[] = [
	{
		action: {
			id: "action-1",
			name: "Software Developer Job",
			kind: "job",
			shortDescription: "Full-time software development position",
			joyImpact: 0.2,
		} as Action,
		startTick: 2020,
		endTick: 2025,
	},
	{
		action: {
			id: "action-2",
			name: "Apartment Rental",
			kind: "property",
			shortDescription: "Renting a 2-bedroom apartment",
			joyImpact: 0.1,
		} as Action,
		startTick: 2020,
		endTick: 2023,
	},
	{
		action: {
			id: "action-3",
			name: "Master's Degree",
			kind: "education",
			shortDescription: "Part-time master's in computer science",
			joyImpact: 0.15,
		} as Action,
		startTick: 2022,
		endTick: 2024,
	},
	{
		action: {
			id: "action-4",
			name: "Stock Investments",
			kind: "investment",
			shortDescription: "Diversified stock portfolio",
			joyImpact: 0.05,
		} as Action,
		startTick: 2021,
		endTick: 2035,
	},
	{
		action: {
			id: "action-5",
			name: "Condo Purchase",
			kind: "property",
			shortDescription: "Buying a condominium",
			joyImpact: -0.1,
		} as Action,
		startTick: 2024,
		endTick: 2035,
	},
	{
		action: {
			id: "action-7",
			name: "Senior Developer Role",
			kind: "job",
			shortDescription: "Promotion to senior developer",
			joyImpact: 0.25,
		} as Action,
		startTick: 2025,
		endTick: 2028,
	},
	{
		action: {
			id: "action-8",
			name: "Rental Property",
			kind: "property",
			shortDescription: "Investment in a rental property",
			joyImpact: 0.2,
		} as Action,
		startTick: 2027,
		endTick: 2035,
	},
];

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
	const [currentYear, setCurrentYear] = useState(2025);
	const [selectedYear, setSelectedYear] = useState(2025);
	const [timeframe, setTimeframe] = useState<
		"years" | "months" | "weeks" | "days"
	>("years");
	const [isYearStatsOpen, setIsYearStatsOpen] = useState(false);
	const [isTimelineOpen, setIsTimelineOpen] = useState(false);
	const [isFinancialDataOpen, setIsFinancialDataOpen] = useState(false);
	const [isQuestsOpen, setIsQuestsOpen] = useState(false);

	const currentSteps =
		timeframe === "years"
			? mockSteps
			: timeframe === "months"
			? mockMonthlySteps
			: timeframe === "weeks"
			? mockWeeklySteps
			: mockDailySteps;

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
		<main className="min-h-screen p-4 bg-gradient-to-b from-indigo-50 to-white">
			<div className="max-w-7xl mx-auto">
				<div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-md">
					<h1 className="text-2xl font-bold text-indigo-900 flex items-center gap-2">
						<span className="bg-indigo-600 text-white p-2 rounded-lg">
							<Trophy className="h-6 w-6" />
						</span>
						{/* TODO: Iva - fix not hardcoded */}
						Case 1
					</h1>

					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm">
							<Sparkles className="h-4 w-4 text-amber-500" />
							<span>Level {Math.floor(currentYear - 2020)}</span>
						</div>

						<div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">
							<Trophy className="h-4 w-4 text-emerald-500" />
							<span>Points: {(currentYear - 2020) * 125}</span>
						</div>
					</div>
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
									actionTimings={mockActionTimings}
									currentYear={selectedYear}
									onYearSelect={setSelectedYear}
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
												setSelectedYear(unit);
											} else {
												setSelectedYear(1);
											}
										}}
										actionTimings={mockActionTimings}
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
										steps={currentSteps}
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
										/>
									</TabsContent>

									<TabsContent
										value="analysis"
										className="p-2"
									>
										<SpendingGraph
											timeUnits={currentUnits}
											selectedUnit={selectedYear}
											actionTimings={mockActionTimings}
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
											<span className="bg-amber-200 text-amber-800 px-2 py-0.5 rounded text-xs">
												+50 pts
											</span>
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
											<span className="bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded text-xs">
												+75 pts
											</span>
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
											<span className="bg-purple-200 text-purple-800 px-2 py-0.5 rounded text-xs">
												+100 pts
											</span>
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
