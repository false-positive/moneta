"use client";

import { useMemo, useState } from "react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import type { ActionTiming } from "@/components/timeline";
import type { TimePointKind } from "@/lib/engine/actions";

interface SpendingGraphProps {
	timeUnits: (string | number)[];
	selectedUnit: string | number;
	actionTimings: ActionTiming[];
	timeframe: TimePointKind;
}

const formatNumber = (value: number): string => {
	const absValue = Math.abs(value);
	if (absValue >= 1000000) {
		return `${(absValue / 1000000).toFixed(1)}M`;
	}
	if (absValue >= 1000) {
		return `${(absValue / 1000).toFixed(1)}k`;
	}
	return absValue.toFixed(0);
};

export function SpendingGraph({
	timeUnits,
	selectedUnit,
	actionTimings,
	timeframe,
}: SpendingGraphProps) {
	const [activeLines, setActiveLines] = useState<{
		bankAccount: boolean;
		income: boolean;
		expenses: boolean;
	}>({
		bankAccount: false,
		income: false,
		expenses: false,
	});

	// Process action timings to create chart data
	const chartData = useMemo(() => {
		let accumulatedNetWorth = 0; // Track net worth outside the map

		return timeUnits.map((unit, index) => {
			// Find actions that are active at this time point
			const activeActions = actionTimings.filter(
				(timing) =>
					Number(timing.startTimePoint) <= Number(unit) &&
					Number(timing.endTimePoint) >= Number(unit)
			);

			// Calculate income and expenses for this time point
			const income = activeActions.reduce((sum, action) => {
				return (
					sum +
					(action.action.kind === "income" &&
					action.action.bankAccountImpact.hasImpact
						? action.action.bankAccountImpact.repeatedAbsoluteDelta
						: 0)
				);
			}, 0);

			// Convert expenses to negative
			const expenses =
				-1 *
				activeActions.reduce((sum, action) => {
					return (
						sum +
						(action.action.kind === "expense" &&
						action.action.bankAccountImpact.hasImpact
							? Math.abs(
									action.action.bankAccountImpact
										.repeatedAbsoluteDelta
							  )
							: 0)
					);
				}, 0);

			accumulatedNetWorth += income + expenses; // expenses is already negative

			return {
				timePoint: unit,
				income,
				expenses,
				bankAccount: accumulatedNetWorth,
				isSelected: unit === selectedUnit,
			};
		});
	}, [timeUnits, actionTimings, selectedUnit]);

	const chartConfig = {
		income: {
			label: "Income",
			color: activeLines.income
				? "hsl(120 100% 25%)"
				: "hsl(120 100% 35%)", // Green
		},
		expenses: {
			label: "Expenses",
			color: activeLines.expenses ? "hsl(0 100% 45%)" : "hsl(0 100% 55%)", // Red
		},
		bankAccount: {
			label: "Bank Account",
			color: activeLines.bankAccount
				? "hsl(45 100% 45%)"
				: "hsl(45 100% 55%)", // Yellow
		},
	};

	const formatTimeLabel = (value: string | number) => {
		switch (timeframe) {
			case "year":
				return value;
			case "month":
				return value;
			case "week":
				return `W${value.toString().replace("Week ", "")}`;
			default:
				return `D${value.toString().replace("Day ", "")}`;
		}
	};

	const handleLineClick = (
		dataKey: "bankAccount" | "income" | "expenses"
	) => {
		setActiveLines((prev) => ({
			...prev,
			[dataKey]: !prev[dataKey],
		}));
	};

	return (
		<div className="h-full flex flex-col bg-white rounded-lg p-2 shadow-md">
			<h3 className="text-xs font-bold text-indigo-900 mb-2">
				Financial Analysis
			</h3>

			<div className="flex-1 w-full min-h-[300px] overflow-hidden">
				<ChartContainer
					config={chartConfig}
					className="min-h-[300px] overflow-hidden"
				>
					<LineChart
						data={chartData}
						margin={{
							top: 10,
							right: 10,
							left: 0,
							bottom: 20,
						}}
					>
						<CartesianGrid strokeDasharray="3 3" vertical={false} />
						<XAxis
							dataKey="timePoint"
							tickFormatter={(value) =>
								String(formatTimeLabel(value))
							}
							tick={{ fontSize: 12 }}
							tickLine={false}
							axisLine={false}
						/>
						<YAxis
							tickFormatter={(value) => `$${formatNumber(value)}`}
							tick={{ fontSize: 12 }}
							tickLine={false}
							axisLine={false}
						/>
						<Line
							type="monotone"
							dataKey="income"
							name="income"
							stroke={chartConfig.income.color}
							strokeWidth={2}
							dot={{ r: 2 }}
							activeDot={{ r: 4 }}
							onClick={() => handleLineClick("income")}
							style={{ cursor: "pointer" }}
						/>
						<Line
							type="monotone"
							dataKey="expenses"
							name="expenses"
							stroke={chartConfig.expenses.color}
							strokeWidth={2}
							dot={{ r: 2 }}
							activeDot={{ r: 4 }}
							onClick={() => handleLineClick("expenses")}
							style={{ cursor: "pointer" }}
						/>
						<Line
							type="monotone"
							dataKey="bankAccount"
							name="bankAccount"
							stroke={chartConfig.bankAccount.color}
							strokeWidth={3}
							dot={{ r: 2 }}
							activeDot={{ r: 4 }}
							onClick={() => handleLineClick("bankAccount")}
							style={{ cursor: "pointer" }}
						/>
						<ChartTooltip
							content={
								<ChartTooltipContent
									formatter={(
										value: string | number,
										name: string | number
									) => {
										const displayName =
											name === "bankAccount"
												? "Bank Account"
												: name === "income"
												? "Income"
												: name === "expenses"
												? "Expenses"
												: name;

										const numericValue = Number(value);
										const formattedValue =
											formatNumber(numericValue);
										const prefix =
											numericValue >= 0 ? "+" : "";

										return (
											<div className="flex min-w-[130px] items-center text-xs text-muted-foreground">
												{displayName}
												<div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
													{prefix}${formattedValue}
												</div>
											</div>
										);
									}}
								/>
							}
						/>
					</LineChart>
				</ChartContainer>
			</div>

			<div className="mt-auto pt-2 flex justify-between gap-2 text-xs">
				<div
					className={`flex items-center gap-1 px-3 py-1 rounded-full cursor-pointer ${
						activeLines.income ? "bg-green-200" : "bg-gray-100"
					}`}
					onClick={() => handleLineClick("income")}
				>
					<div className="w-3 h-3 rounded-full bg-green-500"></div>
					<span>Income</span>
				</div>
				<div
					className={`flex items-center gap-1 px-3 py-1 rounded-full cursor-pointer ${
						activeLines.expenses ? "bg-red-200" : "bg-gray-100"
					}`}
					onClick={() => handleLineClick("expenses")}
				>
					<div className="w-3 h-3 rounded-full bg-red-500"></div>
					<span>Expenses</span>
				</div>
				<div
					className={`flex items-center gap-1 px-3 py-1 rounded-full cursor-pointer ${
						activeLines.bankAccount
							? "bg-yellow-200"
							: "bg-gray-100"
					}`}
					onClick={() => handleLineClick("bankAccount")}
				>
					<div className="w-3 h-3 rounded-full bg-yellow-500"></div>
					<span>Bank Account</span>
				</div>
			</div>
		</div>
	);
}
