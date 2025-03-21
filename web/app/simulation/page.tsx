"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Timeline } from "@/components/timeline";
import { MetricsCard } from "@/components/metrics-card";
import { TransactionList } from "@/components/transaction-list";
import { SpendingGraph } from "@/components/spending-graph";
import type { Step, Action } from "@/lib/cases";

type ActionWithTiming = {
	action: Action;
	startTick: number;
	endTick: number;
};

type ModifierFn = (state: Step) => Step;

const timeUnits = Array.from({ length: 20 }, (_, i) => 2024 + i);

const mockActionsWithTiming: ActionWithTiming[] = [
	{
		action: {
			id: "job-1",
			name: "Entry Level Job",
			shortDescription: "Software Developer Position",
			llmDescription: "Entry level software development position",
			timesApplied: 1,
			kind: "job" as const,
			requiredFreeTime: 40,
			incomeAmount: 5000,
			freeTimeReduction: 40,
			joyImpact: 6,
			modifier: ((state: Step) => state) as ModifierFn,
			poll: () => true,
		},
		startTick: 2024,
		endTick: 2033,
	},
	{
		action: {
			id: "investment-1",
			name: "Stock Market Investment",
			shortDescription: "Index Fund Investment",
			llmDescription: "Long-term index fund investment strategy",
			timesApplied: 1,
			kind: "investment" as const,
			minBudget: 10000,
			riskLevel: "medium" as const,
			maxInvestmentPercent: 30,
			maxInvestmentAmount: 20000,
			baseReturnRate: 0.08,
			volatility: 0.15,
			joyImpact: 3,
			modifier: ((state: Step) => state) as ModifierFn,
			poll: () => true,
		},
		startTick: 2025,
		endTick: 2025,
	},
	{
		action: {
			id: "property-1",
			name: "First Property",
			shortDescription: "Small Apartment Investment",
			llmDescription: "Investment in a small apartment for rental income",
			timesApplied: 1,
			kind: "property" as const,
			propertyValue: 250000,
			rentalYield: 0.05,
			freeTimeReduction: 5,
			joyImpact: 4,
			modifier: ((state: Step) => state) as ModifierFn,
			poll: () => true,
		},
		startTick: 2026,
		endTick: 2026,
	},
	{
		action: {
			id: "business-1",
			name: "Side Business",
			shortDescription: "Tech Consulting Business",
			llmDescription: "Started a tech consulting side business",
			timesApplied: 1,
			kind: "business" as const,
			initialInvestment: 15000,
			minBudget: 15000,
			requiredFreeTime: 10,
			freeTimeReduction: 10,
			successProbability: {
				high: 0.3,
				medium: 0.6,
			},
			returns: {
				high: 3,
				medium: 1.5,
				low: 0.5,
			},
			joyImpact: {
				success: 8,
				failure: -3,
			},
			modifier: ((state: Step) => state) as ModifierFn,
			poll: () => true,
		},
		startTick: 2027,
		endTick: 2027,
	},
	{
		action: {
			id: "education-1",
			name: "MBA Program",
			shortDescription: "Part-time MBA",
			llmDescription: "Enrolled in a part-time MBA program",
			timesApplied: 1,
			kind: "education" as const,
			cost: 60000,
			freeTimeReduction: 15,
			joyImpact: -2,
			modifier: ((state: Step) => state) as ModifierFn,
			poll: () => true,
		},
		startTick: 2028,
		endTick: 2028,
	},
	{
		action: {
			id: "job-2",
			name: "Senior Position",
			shortDescription: "Senior Management Role",
			llmDescription: "Promoted to senior management position",
			timesApplied: 1,
			kind: "job" as const,
			requiredFreeTime: 45,
			incomeAmount: 12000,
			freeTimeReduction: 45,
			joyImpact: 8,
			modifier: ((state: Step) => state) as ModifierFn,
			poll: () => true,
		},
		startTick: 2030,
		endTick: 2039,
	},
	{
		action: {
			id: "property-2",
			name: "Second Property",
			shortDescription: "Commercial Property Investment",
			llmDescription: "Investment in a commercial property",
			timesApplied: 1,
			kind: "property" as const,
			propertyValue: 500000,
			rentalYield: 0.07,
			freeTimeReduction: 8,
			joyImpact: 5,
			modifier: ((state: Step) => state) as ModifierFn,
			poll: () => true,
		},
		startTick: 2031,
		endTick: 2031,
	},
	{
		action: {
			id: "investment-2",
			name: "Angel Investment",
			shortDescription: "Tech Startup Investment",
			llmDescription: "Angel investment in a promising tech startup",
			timesApplied: 1,
			kind: "investment" as const,
			minBudget: 50000,
			riskLevel: "high" as const,
			maxInvestmentPercent: 20,
			maxInvestmentAmount: 100000,
			baseReturnRate: 0.25,
			volatility: 0.5,
			joyImpact: 5,
			modifier: ((state: Step) => state) as ModifierFn,
			poll: () => true,
		},
		startTick: 2032,
		endTick: 2032,
	},
];

const mockSteps: Step[] = timeUnits.map((tick) => {
	const newActions = mockActionsWithTiming
		.filter((actionWithTiming) => actionWithTiming.startTick === tick)
		.map((actionWithTiming) => actionWithTiming.action);

	const appliedActions = mockActionsWithTiming
		.filter(
			(actionWithTiming) =>
				actionWithTiming.startTick <= tick &&
				actionWithTiming.endTick >= tick
		)
		.map((actionWithTiming) => actionWithTiming.action);

	const baseStep = {
		tick,
		isBudgetKnown: true,
		isJoyKnown: true,
		isFreeTimeKnown: true,
		newActions,
		appliedActions,
	};

	const budget =
		12000 +
		(tick - 2024) * 10000 +
		appliedActions.reduce((sum, action) => {
			if (action.kind === "job")
				return sum + (action as any).incomeAmount;
			if (action.kind === "property")
				return (
					sum +
					((action as any).propertyValue *
						(action as any).rentalYield) /
						12
				);
			return sum;
		}, 0);

	const joy = Math.min(
		10,
		Math.max(
			1,
			7 +
				appliedActions.reduce((sum, action) => {
					switch (action.kind) {
						case "job":
						case "property":
						case "investment":
						case "education":
							return sum + (action as any).joyImpact;
						case "business":
							return sum + (action as any).joyImpact.success / 2;
						case "job_search":
							return sum + (action as any).joyImpacts.success / 2;
						default:
							return sum;
					}
				}, 0) /
					appliedActions.length
		)
	);

	const freeTime = Math.max(
		0,
		40 -
			appliedActions.reduce((sum, action) => {
				switch (action.kind) {
					case "job":
					case "property":
					case "business":
					case "education":
						return sum + (action as any).freeTimeReduction;
					default:
						return sum;
				}
			}, 0)
	);

	const step = {
		...baseStep,
		budget,
		joy,
		freeTime,
	};

	return step;
});

// Reorganize mockActionsWithTiming to ensure sequential actions are together
mockActionsWithTiming.sort((a, b) => {
	// First sort by start time
	if (a.startTick !== b.startTick) {
		return a.startTick - b.startTick;
	}
	// Then by end time
	if (a.endTick !== b.endTick) {
		return a.endTick - b.endTick;
	}
	// Finally by action name for stable sorting
	return a.action.name.localeCompare(b.action.name);
});

export default function Simulation() {
	const [selectedUnit, setSelectedUnit] = useState(2024);
	const unitType: "year" = "year";

	const handleUnitClick = (unit: string | number) => {
		setSelectedUnit(Number(unit));
	};

	return (
		<div className="bg-[#f5f7f9] min-h-screen">
			<main className="container mx-auto p-4 space-y-6 py-6">
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
					<div className="lg:col-span-3">
						<Card className="border-0 shadow-sm overflow-hidden">
							<CardContent className="p-6">
								<Timeline
									timeUnits={timeUnits}
									steps={mockSteps.map((step) => step.tick)}
									selectedUnit={selectedUnit}
									nowMarker={2024}
									unitType={unitType}
									onUnitClick={handleUnitClick}
									actionTimings={mockActionsWithTiming}
								/>
							</CardContent>
						</Card>
					</div>
					<div className="lg:col-span-1">
						<MetricsCard
							selectedYear={selectedUnit}
							steps={mockSteps}
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<Card className="border-0 shadow-sm">
						<CardContent>
							<TransactionList
								selectedTimeframe="years"
								selectedUnit={selectedUnit}
							/>
						</CardContent>
					</Card>

					<Card className="border-0 shadow-sm">
						<CardContent className="h-[350px]">
							<SpendingGraph
								events={[]}
								timeUnits={timeUnits}
								selectedUnit={selectedUnit}
								actionTimings={mockActionsWithTiming}
							/>
						</CardContent>
					</Card>
				</div>
			</main>
		</div>
	);
}
