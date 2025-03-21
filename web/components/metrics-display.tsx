"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Clock, Heart, Wallet, PiggyBank } from "lucide-react";
import type { ActionTiming } from "@/components/timeline";
import { useEffect } from "react";

interface MetricsDisplayProps {
	selectedYear: number;
	timeframe: "years" | "months" | "weeks" | "days";
	actionTimings?: ActionTiming[];
}

export function MetricsDisplay({
	selectedYear,
	timeframe,
	actionTimings = [],
}: MetricsDisplayProps) {
	const activeTimings = actionTimings.filter(
		(timing) =>
			timing.startTick <= selectedYear && timing.endTick >= selectedYear
	);

	const activeActions = activeTimings.map((timing) => timing.action);

	const timeScaling = {
		years: 1,
		months: 1 / 12,
		weeks: 1 / 52,
		days: 1 / 365,
	};

	const scaling = timeScaling[timeframe];

	const calculatedMetrics = {
		monthlyIncome: activeActions.reduce((sum, action) => {
			if (
				action.kind === "income" &&
				action.bankAccountImpact.hasImpact
			) {
				return (
					sum +
					action.bankAccountImpact.repeatedAbsoluteDelta *
						(timeframe === "years" ? 1 : 1)
				);
			}
			return sum;
		}, 0),

		monthlyExpenses: activeActions.reduce((sum, action) => {
			if (
				action.kind === "expense" &&
				action.bankAccountImpact.hasImpact
			) {
				return (
					sum +
					Math.abs(action.bankAccountImpact.repeatedAbsoluteDelta) *
						(timeframe === "years" ? 1 : 1)
				);
			}
			return sum;
		}, 0),

		investmentValue: activeActions.reduce((sum, action) => {
			if (
				action.kind === "investment" &&
				action.investmentImpact.hasImpact
			) {
				return sum + action.investmentImpact.initialPrice * scaling;
			}
			return sum;
		}, 0),

		freeTimeHours: activeActions.reduce((hours, action) => {
			if (action.freeTimeImpact.hasImpact) {
				return (
					hours +
					action.freeTimeImpact.repeatedAbsoluteDelta *
						(timeframe !== "years" ? scaling : 1)
				);
			}
			return hours;
		}, 40 * (timeframe !== "years" ? scaling : 1)),

		joyIndex: Math.min(
			100,
			Math.max(
				0,
				Math.round(
					activeActions.reduce((joy, action) => {
						if (action.joyImpact.hasImpact) {
							return joy + action.joyImpact.repeatedPercent / 100;
						}
						return joy;
					}, 0.5) * 100
				)
			)
		),
	};

	const defaultMetrics = {
		capital: 10000,
		assets: 10000,
		cash: 5000,
		freeTimeHours: 40,
		joyIndex: 50,
	};

	const metrics = {
		capital:
			calculatedMetrics.investmentValue +
				(calculatedMetrics.monthlyIncome -
					calculatedMetrics.monthlyExpenses) *
					12 || defaultMetrics.capital,
		assets:
			calculatedMetrics.investmentValue +
				(calculatedMetrics.monthlyIncome -
					calculatedMetrics.monthlyExpenses) *
					12 || defaultMetrics.assets,
		cash:
			(calculatedMetrics.monthlyIncome -
				calculatedMetrics.monthlyExpenses) *
				6 || defaultMetrics.cash,
		freeTimeHours:
			calculatedMetrics.freeTimeHours || defaultMetrics.freeTimeHours,
		joyIndex: calculatedMetrics.joyIndex || defaultMetrics.joyIndex,
	};

	const pointChanges = {
		capital: Math.floor(metrics.capital / 10000),
		assets: Math.floor(metrics.assets / 20000),
		cash: Math.floor(metrics.cash / 2000),
		freeTime: Math.max(10, metrics.freeTimeHours),
		joy: metrics.joyIndex,
	};

	return (
		<Card className="border-0 shadow-md h-full bg-gradient-to-b from-purple-50 to-white">
			<CardContent className="p-2 space-y-2">
				<div className="grid grid-cols-2 gap-2">
					<div className="bg-white rounded-lg p-2 shadow-sm">
						<div className="flex items-center justify-between mb-1">
							<div className="flex items-center gap-1.5">
								<div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center">
									<DollarSign className="h-3.5 w-3.5 text-purple-600" />
								</div>
								<span className="text-xs font-bold text-purple-900">
									Capital
								</span>
							</div>
							<div className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full text-xs font-bold">
								+{pointChanges.capital}
							</div>
						</div>
						<div className="text-sm font-bold text-purple-900 ml-1">
							${Math.round(metrics.capital).toLocaleString()}
						</div>
						<div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
							<div
								className="h-full bg-purple-600 rounded-full"
								style={{
									width: `${Math.min(
										100,
										(metrics.capital /
											(metrics.capital + 200000)) *
											100
									)}%`,
								}}
							></div>
						</div>
					</div>

					<div className="bg-white rounded-lg p-2 shadow-sm">
						<div className="flex items-center justify-between mb-1">
							<div className="flex items-center gap-1.5">
								<div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
									<Wallet className="h-3.5 w-3.5 text-blue-600" />
								</div>
								<span className="text-xs font-bold text-blue-900">
									Assets
								</span>
							</div>
							<div className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full text-xs font-bold">
								+{pointChanges.assets}
							</div>
						</div>
						<div className="text-sm font-bold text-blue-900 ml-1">
							${Math.round(metrics.assets).toLocaleString()}
						</div>
						<div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
							<div
								className="h-full bg-blue-600 rounded-full"
								style={{
									width: `${Math.min(
										100,
										(metrics.assets /
											(metrics.assets + 200000)) *
											100
									)}%`,
								}}
							></div>
						</div>
					</div>

					<div className="bg-white rounded-lg p-2 shadow-sm">
						<div className="flex items-center justify-between mb-1">
							<div className="flex items-center gap-1.5">
								<div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center">
									<PiggyBank className="h-3.5 w-3.5 text-teal-600" />
								</div>
								<span className="text-xs font-bold text-teal-900">
									Cash
								</span>
							</div>
							<div className="bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full text-xs font-bold">
								+{pointChanges.cash}
							</div>
						</div>
						<div className="text-sm font-bold text-teal-900 ml-1">
							${Math.round(metrics.cash).toLocaleString()}
						</div>
						<div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
							<div
								className="h-full bg-teal-600 rounded-full"
								style={{
									width: `${Math.min(
										100,
										(metrics.cash /
											(metrics.cash + 30000)) *
											100
									)}%`,
								}}
							></div>
						</div>
					</div>

					<div className="bg-white rounded-lg p-2 shadow-sm">
						<div className="flex items-center justify-between mb-1">
							<div className="flex items-center gap-1.5">
								<div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center">
									<Clock className="h-3.5 w-3.5 text-orange-600" />
								</div>
								<span className="text-xs font-bold text-orange-900">
									Free Time
								</span>
							</div>
							<div className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full text-xs font-bold">
								+{pointChanges.freeTime}
							</div>
						</div>
						<div className="text-sm font-bold text-orange-900 ml-1">
							{metrics.freeTimeHours.toFixed(1)}h/w
						</div>
						<div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
							<div
								className="h-full bg-orange-600 rounded-full"
								style={{
									width: `${Math.min(
										100,
										(metrics.freeTimeHours / 40) * 100
									)}%`,
								}}
							></div>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg p-2 shadow-sm">
					<div className="flex items-center justify-between mb-1">
						<div className="flex items-center gap-1.5">
							<div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center">
								<Heart className="h-3.5 w-3.5 text-rose-600" />
							</div>
							<span className="text-xs font-bold text-rose-900">
								Joy
							</span>
						</div>
						<div className="bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full text-xs font-bold">
							+{metrics.joyIndex}
						</div>
					</div>
					<div className="flex justify-between items-center">
						<div className="text-sm font-bold text-rose-900 ml-1">
							{metrics.joyIndex.toFixed(0)}%
						</div>
						<div className="flex gap-0.5">
							{[...Array(5)].map((_, i) => (
								<div
									key={i}
									className={`w-4 h-5 rounded-sm ${
										i < Math.round(metrics.joyIndex / 20)
											? "bg-rose-500"
											: "bg-gray-200"
									}`}
								></div>
							))}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
