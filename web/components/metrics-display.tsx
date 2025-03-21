"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Clock, Heart, Wallet, PiggyBank } from "lucide-react";

const metricsData = {
	2024: {
		capital: 125000,
		assets: 250000,
		cash: 15000,
		freeTimeHours: 24,
		joyIndex: 85,
	},
	2025: {
		capital: 150000,
		assets: 280000,
		cash: 18000,
		freeTimeHours: 22,
		joyIndex: 82,
	},
	2026: {
		capital: 180000,
		assets: 320000,
		cash: 22000,
		freeTimeHours: 20,
		joyIndex: 80,
	},
	2027: {
		capital: 210000,
		assets: 370000,
		cash: 25000,
		freeTimeHours: 18,
		joyIndex: 78,
	},
	2028: {
		capital: 250000,
		assets: 430000,
		cash: 30000,
		freeTimeHours: 16,
		joyIndex: 75,
	},
	2029: {
		capital: 300000,
		assets: 500000,
		cash: 35000,
		freeTimeHours: 20,
		joyIndex: 82,
	},
	2030: {
		capital: 380000,
		assets: 580000,
		cash: 105000,
		freeTimeHours: 25,
		joyIndex: 90,
	},
	2031: {
		capital: 400000,
		assets: 620000,
		cash: 80000,
		freeTimeHours: 15,
		joyIndex: 70,
	},
	2032: {
		capital: 450000,
		assets: 700000,
		cash: 90000,
		freeTimeHours: 22,
		joyIndex: 85,
	},
	2033: {
		capital: 500000,
		assets: 780000,
		cash: 100000,
		freeTimeHours: 26,
		joyIndex: 88,
	},
	2034: {
		capital: 550000,
		assets: 850000,
		cash: 110000,
		freeTimeHours: 20,
		joyIndex: 90,
	},
	2035: {
		capital: 600000,
		assets: 950000,
		cash: 120000,
		freeTimeHours: 30,
		joyIndex: 95,
	},
};

interface MetricsDisplayProps {
	selectedYear: number;
}

export function MetricsDisplay({ selectedYear }: MetricsDisplayProps) {
	const metrics =
		metricsData[selectedYear as keyof typeof metricsData] ||
		metricsData[2024];

	const pointChanges = {
		capital: 12,
		assets: 12,
		cash: 7,
		freeTime: 40,
		joy: metrics.joyIndex,
	};

	return (
		<Card className="border-0 shadow-md h-full bg-gradient-to-b from-purple-50 to-white">
			<CardHeader className="pb-1 pt-1.5 px-3 bg-purple-600 text-white">
				<CardTitle className="text-sm font-bold flex justify-between items-center">
					<span>Financial Quest</span>
					<div className="flex items-center gap-1 bg-purple-500 rounded-full px-2 py-0.5">
						<div className="text-yellow-300 text-xs">🏆</div>
						<span className="text-xs">
							Level {Math.floor(selectedYear - 2020)}
						</span>
					</div>
				</CardTitle>
			</CardHeader>

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
							${metrics.capital.toLocaleString()}
						</div>
						<div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
							<div
								className="h-full bg-purple-600 rounded-full"
								style={{
									width: `${Math.min(
										100,
										(metrics.capital / 1000000) * 100
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
							${metrics.assets.toLocaleString()}
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
							${metrics.cash.toLocaleString()}
						</div>
						<div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
							<div
								className="h-full bg-teal-600 rounded-full"
								style={{
									width: `${Math.min(
										100,
										(metrics.cash / 150000) * 100
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
							{metrics.freeTimeHours}h/w
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
							{metrics.joyIndex}%
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
