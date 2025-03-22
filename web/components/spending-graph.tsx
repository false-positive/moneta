"use client";

import { useState } from "react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	ReferenceLine,
	Cell,
	AreaChart,
	Area,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Action } from "@/lib/cases/actions";
import type { ActionTiming } from "@/components/timeline";
import type { Step } from "@/lib/cases/actions";

interface SpendingGraphProps {
	steps?: Step[];
	timeUnits: (string | number)[];
	selectedUnit: string | number;
	actionTimings?: ActionTiming[];
	timeframe?: "years" | "months" | "weeks" | "days";
	currentYear?: number;
}

export function SpendingGraph({
	steps = [],
	timeUnits,
	selectedUnit,
	actionTimings = [],
}: SpendingGraphProps) {
	const [activeTab, setActiveTab] = useState("overview");
	const [selectedEvent, setSelectedEvent] = useState<Step | null>(null);
	const [selectedAction, setSelectedAction] = useState<Action | null>(null);
	const [detailsOpen, setDetailsOpen] = useState(false);
	const [actionDetailsOpen, setActionDetailsOpen] = useState(false);

	const actionEvents = actionTimings.map((timing) => {
		const action = timing.action;
		let amount = 0;
		let type = "expense";

		if (action.kind === "income") {
			amount = action.bankAccountImpact.hasImpact
				? action.bankAccountImpact.repeatedAbsoluteDelta
				: 0;
			type = "income";
		} else if (action.kind === "expense") {
			amount = action.bankAccountImpact.hasImpact
				? Math.abs(action.bankAccountImpact.repeatedAbsoluteDelta)
				: 0;
			type = "expense";
		} else if (action.kind === "investment") {
			amount = action.investmentImpact.hasImpact
				? action.capital || action.investmentImpact.initialPrice
				: 0;
			type = "expense";
		}

		return {
			id:
				typeof action.name === "string"
					? action.name.split(" ").join("-").toLowerCase()
					: 0,
			type,
			name: action.name,
			startUnit: timing.startTick,
			endUnit: timing.endTick,
			amount,
			monthlyPayment:
				type === "income"
					? amount / 12
					: amount /
					  Math.max(1, (timing.endTick - timing.startTick + 1) * 12),
			description: action.shortDescription,
			source: action.kind,
		};
	});

	const allEvents = [...actionEvents];

	const barChartData = timeUnits.map((unit) => {
		const unitData: any = {
			unit,
			income: 0,
			expense: 0,
			net: 0,
			isSelected: unit === selectedUnit,
		};

		allEvents.forEach((event) => {
			if (event.type === "income") {
				unitData.income += event.amount;
				unitData.net += event.amount;
			} else {
				unitData.expense += event.amount;
				unitData.net -= event.amount;
			}

			if (!unitData.events) unitData.events = [];
			unitData.events.push(event);
		});

		return unitData;
	});

	const areaChartData = timeUnits.map((unit) => {
		const unitData: any = {
			unit,
			isSelected: unit === selectedUnit,
		};

		allEvents.forEach((event) => {
			unitData[`${event.type}_${event.id}`] = 0;
		});

		allEvents.forEach((event) => {
			if (
				typeof event.startUnit === "number" &&
				event.startUnit <= Number(unit) &&
				typeof event.endUnit === "number" &&
				event.endUnit >= Number(unit)
			) {
				const value =
					event.monthlyPayment && event.monthlyPayment > 0
						? event.monthlyPayment * 12
						: event.amount /
						  Math.max(
								1,
								Number(event.endUnit) -
									Number(event.startUnit) +
									1
						  );

				unitData[`${event.type}_${event.id}`] = value;
			}
		});

		return unitData;
	});

	const incomeEvents = allEvents.filter((event) => event.type === "income");
	const expenseEvents = allEvents.filter((event) => event.type === "expense");

	const getEventColor = (event: Step, opacity = 1) => {
		const incomeColors = [
			[79, 70, 229],
			[16, 185, 129],
			[6, 182, 212],
			[59, 130, 246],
			[14, 165, 233],
			[20, 184, 166],
		];

		const expenseColors = [
			[244, 63, 94],
			[249, 115, 22],
			[234, 88, 12],
			[217, 70, 239],
			[168, 85, 247],
			[236, 72, 153],
		];

		const palette = event.type === "income" ? incomeColors : expenseColors;
		const colorIndex =
			typeof event.id === "number" ? event.id % palette.length : 0;
		const baseColor = palette[colorIndex];

		return `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${opacity})`;
	};

	const handleBarClick = (data: any) => {
		if (data.events && data.events.length > 0) {
			setSelectedEvent(data.events[0]);
			setDetailsOpen(true);
		}
	};

	const handleAreaClick = (event: Step) => {
		setSelectedEvent(event);
		setDetailsOpen(true);
	};

	const CustomBarTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;

			return (
				<div className="bg-white p-2 border rounded-md shadow-md text-xs">
					<p className="font-bold">{label}</p>
					<p className="text-emerald-600 font-semibold">
						Income: $
						{data.income.toLocaleString(undefined, {
							minimumFractionDigits: 0,
							maximumFractionDigits: 0,
						})}
					</p>
					<p className="text-rose-600 font-semibold">
						Expense: $
						{data.expense.toLocaleString(undefined, {
							minimumFractionDigits: 0,
							maximumFractionDigits: 0,
						})}
					</p>
					<p
						className={`font-bold ${
							data.net >= 0 ? "text-emerald-600" : "text-rose-600"
						}`}
					>
						Net: $
						{data.net.toLocaleString(undefined, {
							minimumFractionDigits: 0,
							maximumFractionDigits: 0,
						})}
					</p>
					{data.events && data.events.length > 0 && (
						<div className="mt-1 pt-1 border-t">
							<p className="font-semibold">Active Events:</p>
							<ul className="text-[10px] space-y-0.5">
								{data.events
									.slice(0, 3)
									.map((step: Step, index: number) => (
										<li
											key={index}
											className="flex items-center gap-1"
										>
											<span
												className="inline-block w-2 h-2 rounded-full"
												style={{
													backgroundColor:
														getEventColor(step),
												}}
											></span>
											<span className="flex-1">
												{step.name}
											</span>
											<span
												className={`text-[8px] px-1 py-0.5 rounded-full ${
													step.type === "income"
														? "bg-emerald-100 text-emerald-700"
														: "bg-rose-100 text-rose-700"
												}`}
											>
												{step.source || step.type}
											</span>
										</li>
									))}
								{data.events.length > 3 && (
									<li className="text-gray-500">
										+{data.events.length - 3} more
									</li>
								)}
							</ul>
						</div>
					)}
				</div>
			);
		}

		return null;
	};

	const CustomAreaTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-white p-2 border rounded-md shadow-md text-xs">
					<p className="font-bold">{label}</p>
					<div className="mt-1">
						{payload
							.filter((entry: any) => entry.value > 0)
							.slice(0, 4)
							.map((entry: any, index: number) => {
								const eventId = Number.parseInt(
									entry.dataKey.split("_")[1]
								);
								const event = allEvents.find(
									(e) => e.id === eventId
								);

								if (event) {
									return (
										<p
											key={index}
											className="flex items-center gap-1 mb-0.5"
											style={{ color: entry.color }}
										>
											<span
												className="inline-block w-2 h-2 rounded-full"
												style={{
													backgroundColor:
														entry.color,
												}}
											></span>
											<span className="flex-1 truncate">
												{event.name}: $
												{Math.round(
													entry.value
												).toLocaleString(undefined, {
													minimumFractionDigits: 0,
													maximumFractionDigits: 0,
												})}
											</span>
											<span
												className={`text-[8px] px-1 py-0.5 rounded-full ${
													event.type === "income"
														? "bg-emerald-100 text-emerald-700"
														: "bg-rose-100 text-rose-700"
												}`}
											>
												{event.source || event.type}
											</span>
										</p>
									);
								}
								return null;
							})}
						{payload.filter((entry: any) => entry.value > 0)
							.length > 4 && (
							<p className="text-gray-500 text-[10px]">
								+
								{payload.filter((entry: any) => entry.value > 0)
									.length - 4}{" "}
								more
							</p>
						)}
					</div>
				</div>
			);
		}

		return null;
	};

	return (
		<div className="h-full flex flex-col bg-white rounded-lg p-2 shadow-md">
			<h3 className="text-xs font-bold text-indigo-900 mb-2">
				Financial Analysis
			</h3>

			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="flex-1 flex flex-col"
			>
				<TabsList className="mb-2 bg-indigo-100 p-0.5 rounded-lg h-7">
					<TabsTrigger
						value="overview"
						className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-md text-xs h-6"
					>
						Overview
					</TabsTrigger>
					<TabsTrigger
						value="details"
						className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-md text-xs h-6"
					>
						Details
					</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="flex-1 flex flex-col">
					<div className="flex-1 min-h-[180px]">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart
								data={barChartData}
								margin={{
									top: 5,
									right: 5,
									left: 0,
									bottom: 5,
								}}
								barSize={6}
							>
								<CartesianGrid
									strokeDasharray="3 3"
									opacity={0.2}
								/>
								<XAxis dataKey="unit" tick={{ fontSize: 10 }} />
								<YAxis
									tickFormatter={(value) =>
										`$${
											value >= 1000
												? (value / 1000).toFixed(0) +
												  "k"
												: value
										}`
									}
									tick={{ fontSize: 10 }}
								/>
								<Tooltip content={<CustomBarTooltip />} />
								<Legend
									wrapperStyle={{ fontSize: 10 }}
									formatter={(value) => {
										return (
											<span className="text-xs font-medium">
												{value}
											</span>
										);
									}}
								/>
								<Bar
									name="Income (work, investments)"
									dataKey="income"
									fill="#10B981"
									onClick={handleBarClick}
									cursor="pointer"
									radius={[2, 2, 0, 0]}
								>
									{barChartData.map((entry, index) => (
										<Cell
											key={`income-${index}`}
											fill={
												entry.isSelected
													? "#059669"
													: "#10B981"
											}
											opacity={entry.isSelected ? 1 : 0.8}
										/>
									))}
								</Bar>
								<Bar
									name="Expense (housing, education)"
									dataKey="expense"
									fill="#F43F5E"
									onClick={handleBarClick}
									cursor="pointer"
									radius={[2, 2, 0, 0]}
								>
									{barChartData.map((entry, index) => (
										<Cell
											key={`expense-${index}`}
											fill={
												entry.isSelected
													? "#E11D48"
													: "#F43F5E"
											}
											opacity={entry.isSelected ? 1 : 0.8}
										/>
									))}
								</Bar>
								<ReferenceLine y={0} stroke="#000" />
								{barChartData.findIndex((d) => d.isSelected) !==
									-1 && (
									<ReferenceLine
										x={selectedUnit}
										stroke="#6366F1"
										strokeWidth={1}
										strokeDasharray="3 3"
									/>
								)}
							</BarChart>
						</ResponsiveContainer>
					</div>
				</TabsContent>

				<TabsContent value="details" className="flex-1 flex flex-col">
					<div className="flex-1 min-h-[180px]">
						<Tabs
							defaultValue="income"
							className="h-full flex flex-col"
						>
							<TabsList className="mb-1 bg-indigo-100 p-0.5 rounded-lg h-6">
								<TabsTrigger
									value="income"
									className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-md text-[10px] h-5"
								>
									Income
								</TabsTrigger>
								<TabsTrigger
									value="expense"
									className="data-[state=active]:bg-rose-600 data-[state=active]:text-white rounded-md text-[10px] h-5"
								>
									Expenses
								</TabsTrigger>
							</TabsList>

							<TabsContent value="income" className="flex-1">
								<div className="text-[9px] text-gray-500 mb-1 px-1 flex justify-end">
									<div className="flex items-center gap-1">
										<span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
										<span>Income from work</span>
									</div>
									<div className="flex items-center gap-1 ml-2">
										<span className="inline-block w-2 h-2 rounded-full bg-teal-500"></span>
										<span>Income from investments</span>
									</div>
								</div>
								<ResponsiveContainer width="100%" height="100%">
									<AreaChart
										data={areaChartData}
										margin={{
											top: 5,
											right: 5,
											left: 0,
											bottom: 5,
										}}
									>
										<CartesianGrid
											strokeDasharray="3 3"
											opacity={0.2}
										/>
										<XAxis
											dataKey="unit"
											tick={{ fontSize: 10 }}
										/>
										<YAxis
											tickFormatter={(value) =>
												`$${
													value >= 1000
														? (
																value / 1000
														  ).toFixed(0) + "k"
														: value
												}`
											}
											tick={{ fontSize: 10 }}
										/>
										<Tooltip
											content={<CustomAreaTooltip />}
										/>
										<Legend
											wrapperStyle={{ fontSize: 10 }}
										/>
										{incomeEvents.map((event, index) => (
											<Area
												key={event.id}
												type="monotone"
												dataKey={`income_${event.id}`}
												name={event.name}
												stackId={`income_${
													typeof event.id === "number"
														? event.id % 3
														: 0
												}`}
												fill={getEventColor(event, 0.7)}
												stroke={getEventColor(event)}
												strokeWidth={1}
												activeDot={{
													onClick: () =>
														handleAreaClick(event),
													style: {
														cursor: "pointer",
													},
													r: 4,
												}}
											/>
										))}
										{areaChartData.findIndex(
											(d) => d.isSelected
										) !== -1 && (
											<ReferenceLine
												x={selectedUnit}
												stroke="#6366F1"
												strokeWidth={1}
												strokeDasharray="3 3"
											/>
										)}
									</AreaChart>
								</ResponsiveContainer>
							</TabsContent>

							<TabsContent value="expense" className="flex-1">
								<div className="text-[9px] text-gray-500 mb-1 px-1 flex justify-end">
									<div className="flex items-center gap-1">
										<span className="inline-block w-2 h-2 rounded-full bg-rose-500"></span>
										<span>Regular expenses</span>
									</div>
									<div className="flex items-center gap-1 ml-2">
										<span className="inline-block w-2 h-2 rounded-full bg-purple-500"></span>
										<span>Investments</span>
									</div>
								</div>
								<ResponsiveContainer width="100%" height="100%">
									<AreaChart
										data={areaChartData}
										margin={{
											top: 5,
											right: 5,
											left: 0,
											bottom: 5,
										}}
									>
										<CartesianGrid
											strokeDasharray="3 3"
											opacity={0.2}
										/>
										<XAxis
											dataKey="unit"
											tick={{ fontSize: 10 }}
										/>
										<YAxis
											tickFormatter={(value) =>
												`$${
													value >= 1000
														? (
																value / 1000
														  ).toFixed(0) + "k"
														: value
												}`
											}
											tick={{ fontSize: 10 }}
										/>
										<Tooltip
											content={<CustomAreaTooltip />}
										/>
										<Legend
											wrapperStyle={{ fontSize: 10 }}
										/>
										{expenseEvents.map((event, index) => (
											<Area
												key={event.id}
												type="monotone"
												dataKey={`expense_${event.id}`}
												name={event.name}
												stackId={`expense_${
													typeof event.id === "number"
														? event.id % 3
														: 0
												}`}
												fill={getEventColor(event, 0.7)}
												stroke={getEventColor(event)}
												strokeWidth={1}
												activeDot={{
													onClick: () =>
														handleAreaClick(event),
													style: {
														cursor: "pointer",
													},
													r: 4,
												}}
											/>
										))}
										{areaChartData.findIndex(
											(d) => d.isSelected
										) !== -1 && (
											<ReferenceLine
												x={selectedUnit}
												stroke="#6366F1"
												strokeWidth={1}
												strokeDasharray="3 3"
											/>
										)}
									</AreaChart>
								</ResponsiveContainer>
							</TabsContent>
						</Tabs>
					</div>
				</TabsContent>
			</Tabs>

			<Dialog
				open={actionDetailsOpen}
				onOpenChange={setActionDetailsOpen}
			>
				<DialogContent className="sm:max-w-[400px] bg-white border-0 shadow-md">
					<DialogHeader>
						<DialogTitle className="text-sm font-bold text-indigo-700 flex items-center justify-between">
							<span>{selectedAction?.name}</span>
							<span
								className={`text-xs px-2 py-0.5 rounded-full ${
									selectedAction?.kind === "income"
										? "bg-emerald-100 text-emerald-700"
										: selectedAction?.kind === "expense"
										? "bg-rose-100 text-rose-700"
										: selectedAction?.kind === "investment"
										? "bg-blue-100 text-blue-700"
										: "bg-amber-100 text-amber-700"
								}`}
							>
								{selectedAction?.kind}
							</span>
						</DialogTitle>
						<DialogDescription className="text-xs text-gray-600">
							{selectedAction?.shortDescription}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-2 py-2">
						<div className="p-2 rounded-lg bg-indigo-50">
							<div className="text-xs text-indigo-700 font-medium">
								Duration
							</div>
							<div className="text-sm font-semibold text-indigo-900">
								{selectedAction && (
									<div className="flex justify-between items-center">
										<span>
											{Math.round(
												selectedAction.remainingTicks /
													12
											)}{" "}
											years (
											{selectedAction.remainingTicks}{" "}
											months)
										</span>
										{selectedAction.remainingTicks ===
											Infinity && (
											<span className="text-[10px] bg-indigo-200 px-1.5 py-0.5 rounded-full text-indigo-700">
												Ongoing
											</span>
										)}
									</div>
								)}
							</div>
						</div>

						{selectedAction &&
							selectedAction.bankAccountImpact.hasImpact && (
								<div
									className={`p-2 rounded-lg ${
										selectedAction.bankAccountImpact
											.repeatedAbsoluteDelta >= 0
											? "bg-emerald-50"
											: "bg-rose-50"
									}`}
								>
									<div
										className={`text-xs font-medium ${
											selectedAction.bankAccountImpact
												.repeatedAbsoluteDelta >= 0
												? "text-emerald-700"
												: "text-rose-700"
										}`}
									>
										{selectedAction.bankAccountImpact
											.repeatedAbsoluteDelta >= 0
											? "Monthly Income"
											: "Monthly Cost"}
									</div>
									<div
										className={`text-sm font-bold ${
											selectedAction.bankAccountImpact
												.repeatedAbsoluteDelta >= 0
												? "text-emerald-900"
												: "text-rose-900"
										}`}
									>
										$
										{Math.abs(
											selectedAction.bankAccountImpact
												.repeatedAbsoluteDelta
										).toLocaleString()}
										{selectedAction.bankAccountImpact
											.repeatedPercent !== 0 && (
											<span className="text-xs ml-1 font-normal">
												+{" "}
												{
													selectedAction
														.bankAccountImpact
														.repeatedPercent
												}
												% monthly
											</span>
										)}
									</div>
								</div>
							)}

						{selectedAction &&
							selectedAction.investmentImpact.hasImpact && (
								<div className="p-2 rounded-lg bg-blue-50">
									<div className="text-xs font-medium text-blue-700">
										Investment Details
									</div>
									<div className="grid grid-cols-2 gap-2 mt-1">
										<div>
											<div className="text-[10px] text-blue-500">
												Initial Investment
											</div>
											<div className="text-sm font-bold text-blue-900">
												$
												{(
													selectedAction.capital ||
													selectedAction
														.investmentImpact
														.initialPrice
												).toLocaleString()}
											</div>
										</div>
										<div>
											<div className="text-[10px] text-blue-500">
												Expected Return
											</div>
											<div className="text-sm font-bold text-blue-900">
												{
													selectedAction
														.investmentImpact
														.repeatedPercent
												}
												%{" "}
												{selectedAction.investmentImpact
													.repeatedAbsoluteDelta !==
													0 &&
													`+ $${selectedAction.investmentImpact.repeatedAbsoluteDelta}`}
											</div>
										</div>
									</div>
								</div>
							)}

						{selectedAction &&
							(selectedAction.joyImpact.hasImpact ||
								selectedAction.freeTimeImpact.hasImpact) && (
								<div className="p-2 rounded-lg bg-purple-50">
									<div className="text-xs font-medium text-purple-700">
										Lifestyle Impact
									</div>
									<div className="grid grid-cols-2 gap-2 mt-1">
										{selectedAction.joyImpact.hasImpact && (
											<div>
												<div className="text-[10px] text-purple-500">
													Joy Impact
												</div>
												<div
													className={`text-sm font-semibold ${
														selectedAction.joyImpact
															.repeatedPercent >=
														0
															? "text-emerald-600"
															: "text-rose-600"
													}`}
												>
													{selectedAction.joyImpact
														.repeatedPercent >= 0
														? "+"
														: ""}
													{
														selectedAction.joyImpact
															.repeatedPercent
													}
													%
												</div>
											</div>
										)}
										{selectedAction.freeTimeImpact
											.hasImpact && (
											<div>
												<div className="text-[10px] text-purple-500">
													Free Time
												</div>
												<div
													className={`text-sm font-semibold ${
														selectedAction
															.freeTimeImpact
															.repeatedAbsoluteDelta >=
														0
															? "text-emerald-600"
															: "text-rose-600"
													}`}
												>
													{selectedAction
														.freeTimeImpact
														.repeatedAbsoluteDelta >=
													0
														? "+"
														: ""}
													{
														selectedAction
															.freeTimeImpact
															.repeatedAbsoluteDelta
													}{" "}
													hrs/week
												</div>
											</div>
										)}
									</div>
								</div>
							)}
					</div>

					<DialogFooter>
						<Button
							onClick={() => setActionDetailsOpen(false)}
							className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs py-1 h-7"
						>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Existing Event Details Dialog
			<Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
				<DialogContent className="sm:max-w-[400px] bg-white border-0 shadow-md">
					<DialogHeader>
						<DialogTitle
							className={
								selectedEvent?.type === "income"
									? "text-sm font-bold text-emerald-700"
									: "text-sm font-bold text-rose-700"
							}
						>
							{selectedEvent?.name}
						</DialogTitle>
						<DialogDescription className="text-xs text-gray-600">
							{selectedEvent?.startUnit === selectedEvent?.endUnit
								? `Period: ${selectedEvent?.startUnit}`
								: `Period: ${selectedEvent?.startUnit} - ${selectedEvent?.endUnit}`}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-2 py-2">
						<div className="grid grid-cols-2 gap-2">
							<div className="bg-gray-50 p-2 rounded-lg">
								<div className="text-xs text-gray-500">
									Amount
								</div>
								<div className="text-sm font-semibold text-gray-900">
									${selectedEvent?.amount?.toLocaleString()}
								</div>
							</div>

							{selectedEvent?.monthlyPayment &&
								selectedEvent.monthlyPayment > 0 && (
									<div className="bg-gray-50 p-2 rounded-lg">
										<div className="text-xs text-gray-500">
											Monthly
										</div>
										<div className="text-sm font-semibold text-gray-900">
											$
											{selectedEvent?.monthlyPayment?.toLocaleString()}
											/mo
										</div>
									</div>
								)}
						</div>
					</div> */}

			{/* <DialogFooter>
						<Button
							onClick={() => setDetailsOpen(false)}
							className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs py-1 h-7"
						>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog> */}
		</div>
	);
}
