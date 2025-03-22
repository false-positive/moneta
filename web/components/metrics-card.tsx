"use client";

import {
	ArrowUpRight,
	ArrowDownRight,
	Wallet,
	Clock,
	Heart,
	Info,
	Building,
	Briefcase,
	TrendingUp,
} from "lucide-react";
import type { Step } from "@/lib/cases/actions";
import { type ActionTiming } from "@/components/timeline";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

export interface MetricsCardProps {
	selectedYear: number;
	currentYear: number;
	timeframe: "years" | "months" | "weeks" | "days";
	steps: Step[];
	actionTimings: ActionTiming[];
}

export function MetricsCard({
	selectedYear,
	timeframe,
	steps,
	actionTimings,
}: MetricsCardProps) {
	const currentStep = steps.find((step) => step.tick === selectedYear);

	const activeTimings = actionTimings.filter(
		(timing) =>
			timing.startTick <= selectedYear && timing.endTick >= selectedYear
	);

	if (!currentStep) {
		return null;
	}

	const activeTimingActions = activeTimings.map((timing) => timing.action);

	const allActions = [
		...currentStep.newActions,
		...currentStep.oldActiveActions,
		...activeTimingActions.filter(
			(timingAction) =>
				!currentStep.oldActiveActions.some(
					(action) => action.name === timingAction.name
				) &&
				!currentStep.newActions.some(
					(action) => action.name === timingAction.name
				)
		),
	];

	const timeScaling = {
		years: 1,
		months: 1 / 12,
		weeks: 1 / 52,
		days: 1 / 365,
	};

	const scaling = timeScaling[timeframe];

	const metrics = {
		monthlyIncome: allActions.reduce((sum, action) => {
			if (
				action.kind === "income" &&
				action.bankAccountImpact.hasImpact
			) {
				const impact = action.bankAccountImpact.repeatedAbsoluteDelta;
				return (
					sum +
					(impact > 0 ? impact * (timeframe === "years" ? 1 : 1) : 0)
				);
			}
			return sum;
		}, 0),

		monthlyExpenses: allActions.reduce((sum, action) => {
			if (
				action.kind === "expense" &&
				action.bankAccountImpact.hasImpact
			) {
				const impact = action.bankAccountImpact.repeatedAbsoluteDelta;
				return (
					sum +
					(impact < 0
						? Math.abs(impact) * (timeframe === "years" ? 1 : 1)
						: 0)
				);
			}
			return sum;
		}, 0),

		investmentCapital: allActions.reduce((sum, action) => {
			if (action.kind === "investment") {
				return sum + action.capital;
			}
			return sum;
		}, 0),

		assets:
			currentStep.bankAccount +
			allActions.reduce((sum, action) => {
				if (action.kind === "investment") {
					return sum + action.capital * scaling;
				}
				return sum;
			}, 0),

		cash: currentStep.bankAccount,
		freeTimeHours: currentStep.freeTime,
		joyIndex: Math.max(0, Math.min(100, Math.round(currentStep.joy))),

		propertyValue: allActions.reduce((sum, action) => {
			if (
				action.kind === "investment" &&
				action.name.toLowerCase().includes("property")
			) {
				return sum + action.capital * scaling;
			}
			return sum;
		}, 0),

		businessValue: allActions.reduce((sum, action) => {
			if (
				action.kind === "investment" &&
				action.name.toLowerCase().includes("business")
			) {
				return sum + action.capital * scaling;
			}
			return sum;
		}, 0),

		investmentValue: allActions.reduce((sum, action) => {
			if (
				action.kind === "investment" &&
				!action.name.toLowerCase().includes("property") &&
				!action.name.toLowerCase().includes("business")
			) {
				return sum + action.capital * scaling;
			}
			return sum;
		}, 0),
	};

	const pointChanges = {
		assets: Math.floor((metrics.assets * scaling) / 1000),
		freeTime: Math.floor((metrics.freeTimeHours * scaling) / 4),
		joy: Math.floor((metrics.joyIndex * scaling) / 10),
	};

	return (
		<div className="p-3">
			<div className="grid grid-cols-2 gap-2">
				<Popover>
					<PopoverTrigger asChild>
						<div className="bg-white rounded-lg p-2 shadow-sm cursor-pointer hover:bg-blue-50 transition-colors">
							<div className="flex items-center justify-between mb-1">
								<div className="flex items-center gap-1.5">
									<div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
										<Wallet className="h-4 w-4 text-blue-600" />
									</div>
									<span className="text-xs font-bold text-blue-900">
										Assets
									</span>
								</div>
								<div className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
									<span>+{pointChanges.assets}</span>
									<Info className="h-3 w-3" />
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
												(metrics.assets + 50000)) *
												100
										)}%`,
									}}
								></div>
							</div>
						</div>
					</PopoverTrigger>
					<PopoverContent className="w-72 p-0 bg-white shadow-xl border-0">
						<div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 text-white">
							<h3 className="font-bold text-sm">
								Assets Breakdown
							</h3>
							<p className="text-xs text-blue-100">
								Your total assets: $
								{Math.round(metrics.assets).toLocaleString()}
							</p>
						</div>
						<div className="p-3 space-y-3">
							<div className="flex items-center gap-2">
								<div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
									<Building className="h-4 w-4 text-blue-600" />
								</div>
								<div className="flex-1">
									<div className="flex justify-between">
										<span className="text-xs font-medium text-gray-600">
											Property
										</span>
										<span className="text-xs font-bold text-blue-700">
											$
											{Math.round(
												metrics.propertyValue
											).toLocaleString()}
										</span>
									</div>
									<div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
										<div
											className="h-full bg-blue-600 rounded-full"
											style={{
												width: `${
													metrics.assets > 0
														? Math.min(
																100,
																(metrics.propertyValue /
																	metrics.assets) *
																	100
														  )
														: 0
												}%`,
											}}
										></div>
									</div>
								</div>
							</div>

							<div className="flex items-center gap-2">
								<div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
									<Briefcase className="h-4 w-4 text-indigo-600" />
								</div>
								{/* IVA TO DO - get info */}
								<div className="flex-1">
									<div className="flex justify-between">
										<span className="text-xs font-medium text-gray-600">
											Bank
										</span>
										<span className="text-xs font-bold text-indigo-700">
											$
											{Math.round(
												metrics.businessValue
											).toLocaleString()}
										</span>
									</div>
									<div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
										<div
											className="h-full bg-indigo-600 rounded-full"
											style={{
												width: `${
													metrics.assets > 0
														? Math.min(
																100,
																(metrics.businessValue /
																	metrics.assets) *
																	100
														  )
														: 0
												}%`,
											}}
										></div>
									</div>
								</div>
							</div>

							<div className="flex items-center gap-2">
								<div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
									<TrendingUp className="h-4 w-4 text-purple-600" />
								</div>
								<div className="flex-1">
									<div className="flex justify-between">
										<span className="text-xs font-medium text-gray-600">
											Investments
										</span>
										<span className="text-xs font-bold text-purple-700">
											$
											{Math.round(
												metrics.investmentValue
											).toLocaleString()}
										</span>
									</div>
									<div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
										<div
											className="h-full bg-purple-600 rounded-full"
											style={{
												width: `${
													metrics.assets > 0
														? Math.min(
																100,
																(metrics.investmentValue /
																	metrics.assets) *
																	100
														  )
														: 0
												}%`,
											}}
										></div>
									</div>
								</div>
							</div>
						</div>
					</PopoverContent>
				</Popover>

				<div className="bg-white rounded-lg p-2 shadow-sm">
					<div className="flex items-center justify-between mb-1">
						<div className="flex items-center gap-1.5">
							<div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
								<Clock className="h-4 w-4 text-amber-600" />
							</div>
							<span className="text-xs font-bold text-amber-900">
								Free Time
							</span>
						</div>
						<div className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full text-xs font-bold">
							+{pointChanges.freeTime}
						</div>
					</div>
					<div className="text-sm font-bold text-amber-900 ml-1">
						{metrics.freeTimeHours.toFixed(1)}h/w
					</div>
					<div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
						<div
							className="h-full bg-amber-600 rounded-full"
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

			<div className="bg-white rounded-lg p-2 shadow-sm mt-2">
				<div className="flex items-center justify-between mb-1">
					<div className="flex items-center gap-1.5">
						<div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
							<Heart className="h-4 w-4 text-rose-600" />
						</div>
						<span className="text-xs font-bold text-rose-900">
							Joy
						</span>
					</div>
					<div className="bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full text-xs font-bold">
						+{pointChanges.joy}
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
								className={`w-4 h-6 rounded-sm ${
									i < Math.round(metrics.joyIndex / 20)
										? "bg-rose-500"
										: "bg-gray-200"
								}`}
							></div>
						))}
					</div>
				</div>
			</div>

			<div className="mt-2 pt-2 border-t border-gray-200 grid grid-cols-2 gap-2">
				<div className="flex flex-col items-center bg-emerald-50 p-2 rounded-lg">
					<div className="flex items-center gap-1 text-emerald-600 mb-1">
						<ArrowUpRight className="h-4 w-4" />
						<span className="text-xs font-bold">
							Monthly Income
						</span>
					</div>
					<span className="text-lg font-bold text-emerald-700">
						${Math.round(metrics.monthlyIncome).toLocaleString()}
					</span>
				</div>
				<div className="flex flex-col items-center bg-rose-50 p-2 rounded-lg">
					<div className="flex items-center gap-1 text-rose-600 mb-1">
						<ArrowDownRight className="h-4 w-4" />
						<span className="text-xs font-bold">
							Monthly Expenses
						</span>
					</div>
					<span className="text-lg font-bold text-rose-700">
						${Math.round(metrics.monthlyExpenses).toLocaleString()}
					</span>
				</div>
			</div>
		</div>
	);
}
