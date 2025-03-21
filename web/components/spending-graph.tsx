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
import { Action } from "@/lib/cases/actions";
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

		if (action.kind === "job") {
			amount = (action as any).incomeAmount * 12;
			type = "income";
		} else if (action.kind === "property") {
			amount =
				(action as any).propertyValue * (action as any).rentalYield;
			type = "income";
		} else if (action.kind === "education") {
			amount = (action as any).cost;
		} else if (action.kind === "investment") {
			amount = (action as any).maxInvestmentAmount || 0;
		} else if (action.kind === "business") {
			amount = (action as any).initialInvestment;
		}

		return {
			id: parseInt(action.id.split("-")[1]),
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

	const allEvents = [...events, ...actionEvents];

	const getEventColor = (event: TimelineEvent, opacity = 1) => {
		const seededRandom = (seed: number) => {
			const x = Math.sin(seed) * 10000;
			return x - Math.floor(x);
		};

		const combineSeed = (str: string, num: number) => {
			let hash = 0;
			for (let i = 0; i < str.length; i++) {
				hash = (hash << 5) - hash + str.charCodeAt(i);
				hash |= 0;
			}
			return hash + num * 1000;
		};

		const seed = combineSeed(event.name + event.type, event.id);
		const BASE_EVENTS = 47;
		const position = seed % BASE_EVENTS;
		const normalizedPosition = position / BASE_EVENTS;
		const nameHash = combineSeed(event.name, 0);
		const phaseOffset = (nameHash % 17) / 17;

		const PHI = 0.618033988749895;
		let hue = ((normalizedPosition + phaseOffset) * 360 * PHI) % 360;

		if (event.type === "income") {
			hue = 90 + (hue % 180);
		} else {
			if (hue > 90 && hue < 270) {
				hue = (hue + 180) % 360;
			}
		}

		const saturationBase = event.type === "income" ? 80 : 75;
		const saturationVariation = 20;
		const saturation =
			saturationBase + seededRandom(seed * 13) * saturationVariation;

		const lightnessBase = event.type === "income" ? 42 : 55;
		const lightnessVariation = 18;
		const lightness =
			lightnessBase + seededRandom(seed * 7) * lightnessVariation;

		function hslToRgb(h: number, s: number, l: number): number[] {
			h /= 360;
			s /= 100;
			l /= 100;

			let r, g, b;

			if (s === 0) {
				r = g = b = l;
			} else {
				const hue2rgb = (p: number, q: number, t: number) => {
					if (t < 0) t += 1;
					if (t > 1) t -= 1;
					if (t < 1 / 6) return p + (q - p) * 6 * t;
					if (t < 1 / 2) return q;
					if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
					return p;
				};

				const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
				const p = 2 * l - q;

				r = hue2rgb(p, q, h + 1 / 3);
				g = hue2rgb(p, q, h);
				b = hue2rgb(p, q, h - 1 / 3);
			}

			return [
				Math.round(r * 255),
				Math.round(g * 255),
				Math.round(b * 255),
			];
		}

		const rgb = hslToRgb(hue, saturation, lightness);
		return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`;
	};

	const barChartData = timeUnits.map((unit) => {
		const unitData: any = {
			unit,
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

				unitData[`${event.type}_${event.id}`] = value;

				if (!unitData.totalIncome) unitData.totalIncome = 0;
				if (!unitData.totalExpense) unitData.totalExpense = 0;
				if (!unitData.events) unitData.events = [];

				if (event.type === "income") {
					unitData.totalIncome += value;
				} else {
					unitData.totalExpense += value;
				}

				unitData.events.push(event);
			}
		});

		unitData.net =
			(unitData.totalIncome || 0) - (unitData.totalExpense || 0);
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

	const handleAreaClick = (event: TimelineEvent) => {
		setSelectedEvent(event);
		setDetailsOpen(true);
	};

	const CustomBarTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;

			const incomeEntries = payload.filter(
				(entry: any) =>
					entry.dataKey.startsWith("income_") && entry.value > 0
			);

			const expenseEntries = payload.filter(
				(entry: any) =>
					entry.dataKey.startsWith("expense_") && entry.value > 0
			);

			return (
				<div className="bg-white p-4 border rounded-md shadow-md max-w-[300px]">
					<p className="font-bold border-b pb-1 mb-2">{label}</p>

					{incomeEntries.length > 0 && (
						<div className="mb-3">
							<p className="font-semibold text-[#58CC02] border-b border-dashed border-gray-200 pb-1 mb-1">
								Total Income: $
								{(data.totalIncome || 0).toLocaleString()}
							</p>
							<div className="space-y-1 ml-1">
								{incomeEntries.map((entry: any) => {
									const eventId = Number.parseInt(
										entry.dataKey.split("_")[1]
									);
									const event = allEvents.find(
										(e) => e.id === eventId
									);

									if (event) {
										return (
											<div
												key={entry.dataKey}
												className="flex items-center gap-2"
											>
												<span
													className="inline-block w-3 h-3 rounded-full"
													style={{
														backgroundColor:
															entry.color,
													}}
												></span>
												<span className="font-medium">
													{event.name}:
												</span>
												<span>
													$
													{entry.value.toLocaleString()}
												</span>
											</div>
										);
									}
									return null;
								})}
							</div>
						</div>
					)}

					{expenseEntries.length > 0 && (
						<div className="mb-3">
							<p className="font-semibold text-[#ff4b4b] border-b border-dashed border-gray-200 pb-1 mb-1">
								Total Expenses: $
								{(data.totalExpense || 0).toLocaleString()}
							</p>
							<div className="space-y-1 ml-1">
								{expenseEntries.map((entry: any) => {
									const eventId = Number.parseInt(
										entry.dataKey.split("_")[1]
									);
									const event = allEvents.find(
										(e) => e.id === eventId
									);

									if (event) {
										return (
											<div
												key={entry.dataKey}
												className="flex items-center gap-2"
											>
												<span
													className="inline-block w-3 h-3 rounded-full"
													style={{
														backgroundColor:
															entry.color,
													}}
												></span>
												<span className="font-medium">
													{event.name}:
												</span>
												<span>
													$
													{entry.value.toLocaleString()}
												</span>
											</div>
										);
									}
									return null;
								})}
							</div>
						</div>
					)}

					<p
						className={`font-bold pt-1 border-t ${
							data.net >= 0 ? "text-[#58CC02]" : "text-[#ff4b4b]"
						}`}
					>
						Net: ${data.net.toLocaleString()}
					</p>
				</div>
			);
		}
		return null;
	};

	const CustomAreaTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			const incomeEntries = payload.filter(
				(entry: any) =>
					entry.dataKey.startsWith("income_") && entry.value > 0
			);

			const expenseEntries = payload.filter(
				(entry: any) =>
					entry.dataKey.startsWith("expense_") && entry.value > 0
			);

			return (
				<div className="bg-white p-4 border rounded-md shadow-md max-w-[300px]">
					<p className="font-bold border-b pb-1 mb-2">{label}</p>

					{incomeEntries.length > 0 && (
						<div className="mb-2">
							<p className="font-semibold text-[#58CC02]">
								Income
							</p>
							{incomeEntries.map((entry: any, index: number) => {
								const eventId = Number.parseInt(
									entry.dataKey.split("_")[1]
								);
								const event = allEvents.find(
									(e) => e.id === eventId
								);

								if (event) {
									return (
										<div
											key={index}
											className="flex items-center gap-2 ml-2"
										>
											<span
												className="inline-block w-3 h-3 rounded-full"
												style={{
													backgroundColor:
														entry.color,
												}}
											></span>
											<span className="font-medium">
												{event.name}:
											</span>
											<span>
												${entry.value.toLocaleString()}
											</span>
										</div>
									);
								}
								return null;
							})}
						</div>
					)}

					{expenseEntries.length > 0 && (
						<div>
							<p className="font-semibold text-[#ff4b4b]">
								Expenses
							</p>
							{expenseEntries.map((entry: any, index: number) => {
								const eventId = Number.parseInt(
									entry.dataKey.split("_")[1]
								);
								const event = allEvents.find(
									(e) => e.id === eventId
								);

								if (event) {
									return (
										<div
											key={index}
											className="flex items-center gap-2 ml-2"
										>
											<span
												className="inline-block w-3 h-3 rounded-full"
												style={{
													backgroundColor:
														entry.color,
												}}
											></span>
											<span className="font-medium">
												{event.name}:
											</span>
											<span>
												${entry.value.toLocaleString()}
											</span>
										</div>
									);
								}
								return null;
							})}
						</div>
					)}

					{payload.length === 0 && <p>No data for this period</p>}
				</div>
			);
		}
		return null;
	};

	return (
		<div className="h-full flex flex-col">
			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="flex-1 flex flex-col"
			>
				<TabsList className="mb-4">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="details">Detailed View</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="flex-1 flex flex-col">
					<div className="flex-1 min-h-[300px]">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart
								data={barChartData}
								margin={{
									top: 20,
									right: 30,
									left: 20,
									bottom: 5,
								}}
								barGap={2}
								barSize={12}
							>
								<CartesianGrid
									strokeDasharray="3 3"
									opacity={0.2}
								/>
								<XAxis dataKey="unit" />
								<YAxis
									tickFormatter={(value) =>
										`$${
											value >= 1000
												? (value / 1000).toFixed(1) +
												  "k"
												: value
										}`
									}
								/>
								<Tooltip content={<CustomBarTooltip />} />
								<Legend />
								<ReferenceLine y={0} stroke="#000" />

								{incomeEvents.map((event) => (
									<Bar
										key={`income_${event.id}`}
										dataKey={`income_${event.id}`}
										name={event.name}
										stackId="income"
										fill={getEventColor(event, 0.9)}
										stroke={getEventColor(event)}
										strokeWidth={1}
									/>
								))}

								{expenseEvents.map((event) => (
									<Bar
										key={`expense_${event.id}`}
										dataKey={`expense_${event.id}`}
										name={event.name}
										stackId="expense"
										fill={getEventColor(event, 0.9)}
										stroke={getEventColor(event)}
										strokeWidth={1}
									/>
								))}

								{barChartData.findIndex(
									(d: any) => d.isSelected
								) !== -1 && (
									<ReferenceLine
										x={selectedUnit}
										stroke="#6b46c1"
										strokeWidth={2}
										strokeDasharray="3 3"
									/>
								)}
							</BarChart>
						</ResponsiveContainer>
					</div>
				</TabsContent>

				<TabsContent value="details" className="flex-1 flex flex-col">
					<div className="flex-1 min-h-[300px]">
						<Tabs
							defaultValue="income"
							className="h-full flex flex-col"
						>
							<TabsList className="mb-2">
								<TabsTrigger value="income">Income</TabsTrigger>
								<TabsTrigger value="expense">
									Expenses
								</TabsTrigger>
							</TabsList>

							<TabsContent value="income" className="flex-1">
								<ResponsiveContainer width="100%" height="100%">
									<AreaChart
										data={areaChartData}
										margin={{
											top: 20,
											right: 30,
											left: 20,
											bottom: 5,
										}}
									>
										<CartesianGrid
											strokeDasharray="3 3"
											opacity={0.2}
										/>
										<XAxis dataKey="unit" />
										<YAxis
											tickFormatter={(value) =>
												`$${
													value >= 1000
														? (
																value / 1000
														  ).toFixed(1) + "k"
														: value
												}`
											}
										/>
										<Tooltip
											content={<CustomAreaTooltip />}
										/>
										<Legend />
										{incomeEvents.map((event, index) => (
											<Area
												key={event.id}
												type="monotone"
												dataKey={`income_${event.id}`}
												name={event.name}
												stackId={index % 3}
												fill={getEventColor(
													event,
													0.75
												)}
												stroke={getEventColor(event)}
												strokeWidth={2}
												activeDot={{
													onClick: () =>
														handleAreaClick(event),
													style: {
														cursor: "pointer",
													},
													r: 6,
												}}
											/>
										))}
										{areaChartData.findIndex(
											(d) => d.isSelected
										) !== -1 && (
											<ReferenceLine
												x={selectedUnit}
												stroke="#6b46c1"
												strokeWidth={2}
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
											top: 20,
											right: 30,
											left: 20,
											bottom: 5,
										}}
									>
										<CartesianGrid
											strokeDasharray="3 3"
											opacity={0.2}
										/>
										<XAxis dataKey="unit" />
										<YAxis
											tickFormatter={(value) =>
												`$${
													value >= 1000
														? (
																value / 1000
														  ).toFixed(1) + "k"
														: value
												}`
											}
										/>
										<Tooltip
											content={<CustomAreaTooltip />}
										/>
										<Legend />
										{expenseEvents.map((event, index) => (
											<Area
												key={event.id}
												type="monotone"
												dataKey={`expense_${event.id}`}
												name={event.name}
												stackId={`e${index % 3}`}
												fill={getEventColor(
													event,
													0.75
												)}
												stroke={getEventColor(event)}
												strokeWidth={2}
												activeDot={{
													onClick: () =>
														handleAreaClick(event),
													style: {
														cursor: "pointer",
													},
													r: 6,
												}}
											/>
										))}
										{areaChartData.findIndex(
											(d) => d.isSelected
										) !== -1 && (
											<ReferenceLine
												x={selectedUnit}
												stroke="#6b46c1"
												strokeWidth={2}
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
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle className="text-[#6b46c1]">
							{selectedAction?.name}
						</DialogTitle>
						<DialogDescription>
							{selectedAction?.shortDescription}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						<div>
							<div className="text-sm text-muted-foreground">
								Action Type
							</div>
							<div className="text-lg font-semibold">
								{selectedAction?.kind}
							</div>
						</div>
						{selectedAction && selectedAction.kind === "job" && (
							<div>
								<div className="text-sm text-muted-foreground">
									Monthly Income
								</div>
								<div className="text-lg font-semibold text-[#58CC02]">
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
								<div>
									<div className="text-sm text-muted-foreground">
										Total Cost
									</div>
									<div className="text-lg font-semibold text-[#ff4b4b]">
										$
										{(
											selectedAction as any
										).cost.toLocaleString()}
									</div>
								</div>
							)}
						{selectedAction &&
							selectedAction.kind === "business" && (
								<div>
									<div className="text-sm text-muted-foreground">
										Initial Investment
									</div>
									<div className="text-lg font-semibold text-[#ff4b4b]">
										$
										{(
											selectedAction as any
										).initialInvestment.toLocaleString()}
									</div>
								</div>
							)}
						{selectedAction &&
							selectedAction.kind === "investment" && (
								<div>
									<div className="text-sm text-muted-foreground">
										Maximum Investment
									</div>
									<div className="text-lg font-semibold text-[#ff4b4b]">
										$
										{(
											selectedAction as any
										).maxInvestmentAmount.toLocaleString()}
									</div>
								</div>
							)}
						{selectedAction &&
							selectedAction.kind === "property" && (
								<div>
									<div className="text-sm text-muted-foreground">
										Property Value
									</div>
									<div className="text-lg font-semibold">
										$
										{(
											selectedAction as any
										).propertyValue.toLocaleString()}
									</div>
								</div>
							)}
					</div>

					<DialogFooter>
						<Button onClick={() => setActionDetailsOpen(false)}>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle
							className={
								selectedEvent?.type === "income"
									? "text-[#58CC02]"
									: "text-[#ff4b4b]"
							}
						>
							{selectedEvent?.name}
						</DialogTitle>
						<DialogDescription>
							{selectedEvent?.startUnit === selectedEvent?.endUnit
								? `Period: ${selectedEvent?.startUnit}`
								: `Period: ${selectedEvent?.startUnit} - ${selectedEvent?.endUnit}`}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<div className="text-sm text-muted-foreground">
									Amount
								</div>
								<div className="text-lg font-semibold">
									${selectedEvent?.amount?.toLocaleString()}
								</div>
							</div>

							{selectedEvent?.monthlyPayment &&
								selectedEvent.monthlyPayment > 0 && (
									<div>
										<div className="text-sm text-muted-foreground">
											Monthly Payment
										</div>
										<div className="text-lg font-semibold">
											$
											{selectedEvent?.monthlyPayment?.toLocaleString()}
											/month
										</div>
									</div>
								)}

							{selectedEvent?.interestRate && (
								<div>
									<div className="text-sm text-muted-foreground">
										Interest Rate
									</div>
									<div className="text-lg font-semibold">
										{selectedEvent?.interestRate}
									</div>
								</div>
							)}

							{selectedEvent?.source && (
								<div>
									<div className="text-sm text-muted-foreground">
										Source
									</div>
									<div className="text-lg font-semibold">
										{selectedEvent?.source}
									</div>
								</div>
							)}
						</div>

						{selectedEvent?.description && (
							<div>
								<div className="text-sm text-muted-foreground">
									Description
								</div>
								<div className="text-base">
									{selectedEvent?.description}
								</div>
							</div>
						)}
					</div>

					<DialogFooter>
						<Button onClick={() => setDetailsOpen(false)}>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
