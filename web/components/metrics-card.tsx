"use client";

import {
	ArrowUpRight,
	ArrowDownRight,
	Wallet,
	Clock,
	Heart,
} from "lucide-react";
import type { Step } from "@/lib/engine/actions";
import { type ActionTiming } from "@/components/timeline";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useMemo } from "react";

export interface MetricsCardProps {
	selectedTime: number;
	steps: Step[];
	actionTimings: ActionTiming[];
}

export function MetricsCard({
	selectedTime,
	steps,
	actionTimings,
}: MetricsCardProps) {
	const currentStep = useMemo(
		() => steps.find((step) => step.timePoint === selectedTime),
		[steps, selectedTime]
	);

	const activeTimings = useMemo(
		() =>
			actionTimings.filter(
				(timing) =>
					timing.startTimePoint <= selectedTime &&
					timing.endTimePoint >= selectedTime
			),
		[actionTimings, selectedTime]
	);

	if (!currentStep) {
		return null;
	}

	// Get actions that are active at this specific time point
	const activeActions = activeTimings.map((timing) => timing.action);

	const allActions = [
		...currentStep.newActions,
		...currentStep.continuingActions,
		...activeActions.filter((timingAction) => {
			const isInContinuingActions = currentStep.continuingActions.some(
				(action) => action.name === timingAction.name
			);
			const isInNewActions = currentStep.newActions.some(
				(action) => action.name === timingAction.name
			);
			return !isInContinuingActions && !isInNewActions;
		}),
	];

	// Calculate metrics for this specific step
	const metrics = {
		income: allActions.reduce((sum, action) => {
			if (
				action.kind === "income" &&
				action.bankAccountImpact.hasImpact
			) {
				return sum + action.bankAccountImpact.repeatedAbsoluteDelta;
			}
			return sum;
		}, 0),
		expenses: allActions.reduce((sum, action) => {
			if (
				action.kind === "expense" &&
				action.bankAccountImpact.hasImpact
			) {
				return (
					sum +
					Math.abs(action.bankAccountImpact.repeatedAbsoluteDelta)
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
		assets: currentStep.bankAccount,
		freeTime: currentStep.freeTimeHours,
		joyIndex: Math.max(0, Math.min(100, Math.round(currentStep.joy))),
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
							</div>
							<div className="text-sm font-bold text-blue-900 ml-1">
								{Math.round(metrics.assets).toLocaleString()} lv
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
						<div className="p-4">
							<h3 className="font-semibold mb-2">
								Assets Breakdown
							</h3>
							<div className="space-y-2">
								<div className="flex justify-between">
									<span>Bank Account:</span>
									<span>
										{Math.round(
											metrics.assets
										).toLocaleString()}{" "}
										lv
									</span>
								</div>
								<div className="flex justify-between">
									<span>Investments:</span>
									<span>
										{Math.round(
											metrics.investmentCapital
										).toLocaleString()}{" "}
										lv
									</span>
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
					</div>
					<div className="text-sm font-bold text-amber-900 ml-1">
						{metrics.freeTime} %
					</div>
					<div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
						<div
							className="h-full bg-amber-600 rounded-full"
							style={{
								width: `${Math.min(100, metrics.freeTime)}%`,
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
						<span className="text-xs font-bold">Income</span>
					</div>
					<span className="text-lg font-bold text-emerald-700">
						{Math.round(metrics.income).toLocaleString()} lv
					</span>
				</div>
				<div className="flex flex-col items-center bg-rose-50 p-2 rounded-lg">
					<div className="flex items-center gap-1 text-rose-600 mb-1">
						<ArrowDownRight className="h-4 w-4" />
						<span className="text-xs font-bold">Expenses</span>
					</div>
					<span className="text-lg font-bold text-rose-700">
						{Math.round(metrics.expenses).toLocaleString()} lv
					</span>
				</div>
			</div>
		</div>
	);
}
