"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
	ArrowUpRight,
	ArrowDownRight,
	DollarSign,
	Wallet,
	PiggyBank,
	Clock,
	Smile,
} from "lucide-react";
import { Step } from "@/lib/cases/actions";

interface MetricsCardProps {
	selectedYear: number;
	steps: Step[];
}

export function MetricsCard({ selectedYear, steps }: MetricsCardProps) {
	const currentStep = steps.find((step) => step.tick === selectedYear);

	if (!currentStep) {
		return null;
	}

	const metrics = {
		monthlyIncome: currentStep.appliedActions.reduce((sum, action) => {
			if (action.kind === "job") {
				return sum + (action as any).incomeAmount;
			}
			if (action.kind === "property") {
				return (
					sum +
					((action as any).propertyValue *
						(action as any).rentalYield) /
						12
				);
			}
			return sum;
		}, 0),

		monthlyExpenses: currentStep.appliedActions.reduce((sum, action) => {
			let baseExpense = currentStep.budget * 0.3;
			if (action.kind === "education") {
				return sum + (action as any).cost / 12;
			}
			return baseExpense;
		}, 0),

		capital: currentStep.appliedActions.reduce((sum, action) => {
			if (action.kind === "investment") {
				return sum + ((action as any).maxInvestmentAmount || 0);
			}
			return sum;
		}, currentStep.budget * 12),

		assets: currentStep.appliedActions.reduce((sum, action) => {
			if (action.kind === "property") {
				return sum + (action as any).propertyValue;
			}
			if (action.kind === "business") {
				return sum + (action as any).initialInvestment * 1.5;
			}
			return sum;
		}, 0),

		cash: Math.max(
			0,
			currentStep.budget -
				currentStep.appliedActions.reduce((sum, action) => {
					if (action.kind === "education") {
						return sum + (action as any).cost / 12;
					}
					return sum;
				}, 0)
		),

		freeTimeHours: currentStep.freeTime,

		joyIndex: Math.round(currentStep.joy * 10),
	};

	return (
		<Card>
			<CardContent className="space-y-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="w-12 h-12 rounded-full bg-[#e6f9e6] flex items-center justify-center flex-shrink-0">
							<DollarSign className="h-6 w-6 text-[#58CC02]" />
						</div>
						<span className="text-sm font-medium">Capital</span>
					</div>
					<span className="font-bold">
						${Math.round(metrics.capital).toLocaleString()}
					</span>
				</div>

				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="w-12 h-12 rounded-full bg-[#e6f9e6] flex items-center justify-center flex-shrink-0">
							<Wallet className="h-6 w-6 text-[#58CC02]" />
						</div>
						<span className="text-sm font-medium">Assets</span>
					</div>
					<span className="font-bold">
						${Math.round(metrics.assets).toLocaleString()}
					</span>
				</div>

				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="w-12 h-12 rounded-full bg-[#e6f9e6] flex items-center justify-center flex-shrink-0">
							<PiggyBank className="h-6 w-6 text-[#58CC02]" />
						</div>
						<span className="text-sm font-medium">Cash</span>
					</div>
					<span className="font-bold">
						${Math.round(metrics.cash).toLocaleString()}
					</span>
				</div>

				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="w-12 h-12 rounded-full bg-[#e6f9e6] flex items-center justify-center flex-shrink-0">
							<Clock className="h-6 w-6 text-[#58CC02]" />
						</div>
						<span className="text-sm font-medium">Free Time</span>
					</div>
					<span className="font-bold">
						{metrics.freeTimeHours}h/w
					</span>
				</div>

				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="w-12 h-12 rounded-full bg-[#e6f9e6] flex items-center justify-center flex-shrink-0">
							<Smile className="h-6 w-6 text-[#58CC02]" />
						</div>
						<span className="text-sm font-medium">Joy</span>
					</div>
					<span className="font-bold">{metrics.joyIndex}%</span>
				</div>

				<div className="pt-4 border-t flex flex-row gap-3 items-right justify-end">
					<div className="flex items-center gap-1 text-green-500">
						<ArrowUpRight className="h-4 w-4" />
						<span className="font-bold">
							$
							{Math.round(metrics.monthlyIncome).toLocaleString()}
						</span>
					</div>
					<div className="flex items-center gap-1 text-red-500">
						<ArrowDownRight className="h-4 w-4" />
						<span className="font-bold">
							$
							{Math.round(
								metrics.monthlyExpenses
							).toLocaleString()}
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
