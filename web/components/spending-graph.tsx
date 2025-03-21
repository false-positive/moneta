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

interface TimelineEvent {
	id: number;
	type: string;
	name: string;
	startUnit: string | number;
	endUnit: string | number;
	amount: number;
	monthlyPayment?: number;
	interestRate?: string;
	source?: string;
	description?: string;
}

interface SpendingGraphProps {
	events?: TimelineEvent[];
	timeUnits: (string | number)[];
	selectedUnit: string | number;
	actionTimings?: ActionTiming[];
}

export function SpendingGraph({
	events = [],
	timeUnits,
	selectedUnit,
	actionTimings = [],
}: SpendingGraphProps) {
	const [activeTab, setActiveTab] = useState("overview");
	const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(
		null
	);
	const [selectedAction, setSelectedAction] = useState<Action | null>(null);
	const [detailsOpen, setDetailsOpen] = useState(false);
	const [actionDetailsOpen, setActionDetailsOpen] = useState(false);

	const actionEvents = actionTimings.map((timing) => {
		const action = timing.action;
		let amount = 0;
		let type = "expense";

		// Determine if action generates income or expense
		if (action.kind === "job") {
			amount = (action as any).incomeAmount * 12; // Annual income
			type = "income";
		} else if (action.kind === "property") {
			amount =
				(action as any).propertyValue * (action as any).rentalYield; // Annual rental income
			type = "income";
		} else if (action.kind === "education") {
			amount = (action as any).cost;
			type = "expense";
		} else if (action.kind === "investment") {
			// IVA: to do - change maybe?
			amount = (action as any).maxInvestmentAmount || 0;
			type = "expense";
		} else if (action.kind === "business") {
			// IVA: to do - change maybe?
			amount = (action as any).initialInvestment;
			type = "expense"; // Initially an expense
		}

		return {
			id: Number.parseInt(action.id.split("-")[1]), // Extract numeric part of ID
			type,
			name: action.name,
			startUnit: timing.startTick,
			endUnit: timing.endTick,
			amount,
			monthlyPayment:
				type === "income"
					? amount / 12
					: amount / (timing.endTick - timing.startTick + 1) / 12,
			description: action.shortDescription,
			source: action.kind,
		};
	});

	// Combine action events with existing events
	const allEvents = [...events, ...actionEvents];

	// Generate chart data using all events
	const barChartData = timeUnits.map((unit) => {
		const unitData: any = {
			unit,
			income: 0,
			expense: 0,
			net: 0,
			isSelected: unit === selectedUnit,
		};

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

				if (event.type === "income") {
					unitData.income += value;
					unitData.net += value;
				} else {
					unitData.expense += value;
					unitData.net -= value;
				}

				if (!unitData.events) unitData.events = [];
				unitData.events.push(event);
			}
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
			// Check if the event is active in this unit
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

	const getEventColor = (event: TimelineEvent, opacity = 1) => {
		// Unique color palette for incomes and expenses
		const incomeColors = [
			[79, 70, 229], // Indigo #4F46E5
			[16, 185, 129], // Emerald #10B981
			[6, 182, 212], // Cyan #06B6D4
			[59, 130, 246], // Blue #3B82F6
			[14, 165, 233], // Sky #0EA5E9
			[20, 184, 166], // Teal #14B8A6
		];

		const expenseColors = [
			[244, 63, 94], // Rose #F43F5E
			[249, 115, 22], // Orange #F97316
			[234, 88, 12], // Amber #EA580C
			[217, 70, 239], // Fuchsia #D946EF
			[168, 85, 247], // Purple #A855F7
			[236, 72, 153], // Pink #EC4899
		];

		// Select color from palette based on event ID
		const palette = event.type === "income" ? incomeColors : expenseColors;
		const colorIndex = event.id % palette.length;
		const baseColor = palette[colorIndex];

		return `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${opacity})`;
	};

	// Handle clicking on a bar
	const handleBarClick = (data: any) => {
		// If the unit has events, show the first one
		if (data.events && data.events.length > 0) {
			setSelectedEvent(data.events[0]);
			setDetailsOpen(true);
		}
	};

	// Handle clicking on an area
	const handleAreaClick = (event: TimelineEvent) => {
		setSelectedEvent(event);
		setDetailsOpen(true);
	};

	// Handle clicking on an action
	const handleActionClick = (action: any) => {
		setSelectedAction(action);
		setActionDetailsOpen(true);
	};

	// Custom tooltip component for bar chart
	const CustomBarTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;

			return (
				<div className="bg-white p-2 border rounded-md shadow-md text-xs">
					<p className="font-bold">{label}</p>
					<p className="text-emerald-600 font-semibold">
						Income: ${data.income.toLocaleString()}
					</p>
					<p className="text-rose-600 font-semibold">
						Expense: ${data.expense.toLocaleString()}
					</p>
					<p
						className={`font-bold ${
							data.net >= 0 ? "text-emerald-600" : "text-rose-600"
						}`}
					>
						Net: ${data.net.toLocaleString()}
					</p>
					{data.events && data.events.length > 0 && (
						<div className="mt-1 pt-1 border-t">
							<p className="font-semibold">Active Events:</p>
							<ul className="text-[10px] space-y-0.5">
								{data.events
									.slice(0, 3)
									.map((event: TimelineEvent) => (
										<li
											key={event.id}
											className="flex items-center gap-1"
										>
											<span
												className="inline-block w-2 h-2 rounded-full"
												style={{
													backgroundColor:
														getEventColor(event),
												}}
											></span>
											<span>{event.name}</span>
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

	// Custom tooltip component for area chart
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
											className="flex items-center gap-1"
											style={{ color: entry.color }}
										>
											<span
												className="inline-block w-2 h-2 rounded-full"
												style={{
													backgroundColor:
														entry.color,
												}}
											></span>
											<span>
												{event.name}: $
												{Math.round(
													entry.value
												).toLocaleString()}
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
								<Legend wrapperStyle={{ fontSize: 10 }} />
								<Bar
									name="Income"
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
									name="Expense"
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
													event.id % 3
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
													event.id % 3
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

			{/* Action Details Dialog */}
			<Dialog
				open={actionDetailsOpen}
				onOpenChange={setActionDetailsOpen}
			>
				<DialogContent className="sm:max-w-[400px] bg-white border-0 shadow-md">
					<DialogHeader>
						<DialogTitle className="text-sm font-bold text-indigo-700">
							{selectedAction?.name}
						</DialogTitle>
						<DialogDescription className="text-xs text-gray-600">
							{selectedAction?.shortDescription}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-2 py-2">
						<div className="bg-indigo-50 p-2 rounded-lg">
							<div className="text-xs text-indigo-700 font-medium">
								Action Type
							</div>
							<div className="text-sm font-semibold text-indigo-900 capitalize">
								{selectedAction?.kind}
							</div>
						</div>
						{selectedAction && selectedAction.kind === "job" && (
							<div className="bg-emerald-50 p-2 rounded-lg">
								<div className="text-xs text-emerald-700 font-medium">
									Monthly Income
								</div>
								<div className="text-sm font-semibold text-emerald-900">
									$
									{(
										selectedAction as any
									).incomeAmount.toLocaleString()}
									/month
								</div>
							</div>
						)}
						{selectedAction &&
							selectedAction.kind === "education" && (
								<div className="bg-rose-50 p-2 rounded-lg">
									<div className="text-xs text-rose-700 font-medium">
										Total Cost
									</div>
									<div className="text-sm font-semibold text-rose-900">
										$
										{(
											selectedAction as any
										).cost.toLocaleString()}
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

			{/* Existing Event Details Dialog */}
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
					</div>

					<DialogFooter>
						<Button
							onClick={() => setDetailsOpen(false)}
							className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs py-1 h-7"
						>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
