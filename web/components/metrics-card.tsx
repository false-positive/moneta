"use client";

import { Card, CardContent } from "@/components/ui/card";
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
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

interface MetricsCardProps {
	selectedYear: number;
	steps: Step[];
}

export function MetricsCard({ selectedYear, steps }: MetricsCardProps) {
	const currentStep = steps.find((step) => step.tick === selectedYear);
	if (!currentStep) {
		return null;
	}
	// IVA TODO : not hardcoded
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
			const baseExpense = currentStep.budget * 0.3;
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

		propertyValue: currentStep.appliedActions.reduce((sum, action) => {
			if (action.kind === "property") {
				return sum + (action as any).propertyValue;
			}
			return sum;
		}, 0),
		businessValue: currentStep.appliedActions.reduce((sum, action) => {
			if (action.kind === "business") {
				return sum + (action as any).initialInvestment * 1.5;
			}
			return sum;
		}, 0),
		investmentValue: currentStep.appliedActions.reduce((sum, action) => {
			if (action.kind === "investment") {
				return sum + ((action as any).maxInvestmentAmount || 0);
			}
			return sum;
		}, 0),
	};

	const pointChanges = {
		assets: 8,
		freeTime: 10,
		joy: metrics.joyIndex,
	};

	return (
		<Card className="border-0 shadow-md overflow-hidden bg-gradient-to-b from-indigo-50 to-white">
			<div className="bg-indigo-600 py-1.5 px-3 flex justify-between items-center">
				<h2 className="text-sm font-bold text-white">
					Financial Quest
				</h2>
				<div className="flex items-center gap-1 bg-indigo-500 rounded-full px-2 py-0.5">
					<div className="text-yellow-300 text-xs">🏆</div>
					<span className="text-white font-bold text-xs">
						Level {Math.floor(selectedYear - 2020)}
					</span>
				</div>
			</div>

			<CardContent className="p-2 space-y-2">
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
									$
									{Math.round(
										metrics.assets
									).toLocaleString()}
								</div>
								<div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
									<div
										className="h-full bg-blue-600 rounded-full"
										style={{
											width: `${Math.min(
												100,
												(metrics.assets / 1000000) * 100
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
									{Math.round(
										metrics.assets
									).toLocaleString()}
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
													width: `${Math.min(
														100,
														(metrics.propertyValue /
															metrics.assets) *
															100
													)}%`,
												}}
											></div>
										</div>
									</div>
								</div>

								<div className="flex items-center gap-2">
									<div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
										<Briefcase className="h-4 w-4 text-indigo-600" />
									</div>
									<div className="flex-1">
										<div className="flex justify-between">
											<span className="text-xs font-medium text-gray-600">
												Business
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
													width: `${Math.min(
														100,
														(metrics.businessValue /
															metrics.assets) *
															100
													)}%`,
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
													width: `${Math.min(
														100,
														(metrics.investmentValue /
															metrics.assets) *
															100
													)}%`,
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
							{metrics.freeTimeHours}h/w
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

				<div className="bg-white rounded-lg p-2 shadow-sm">
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
							{metrics.joyIndex}%
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
							$
							{Math.round(metrics.monthlyIncome).toLocaleString()}
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
