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
		freeTimeHours: 28,
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

	return (
		<Card className="border-0 shadow-sm h-full">
			<CardHeader className="pb-2">
				<CardTitle className="text-lg font-medium text-[#3c3c3c]">
					Metrics for {selectedYear}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					<div className="flex items-center gap-4">
						<div className="w-12 h-12 rounded-full bg-[#e6f9e6] flex items-center justify-center flex-shrink-0">
							<DollarSign className="h-6 w-6 text-[#58CC02]" />
						</div>
						<div className="flex-1">
							<div className="text-sm text-[#6f7780]">
								Capital
							</div>
							<div className="text-xl font-bold text-[#3c3c3c]">
								${metrics.capital.toLocaleString()}
							</div>
						</div>
					</div>

					<div className="flex items-center gap-4">
						<div className="w-12 h-12 rounded-full bg-[#e6f9e6] flex items-center justify-center flex-shrink-0">
							<Wallet className="h-6 w-6 text-[#58CC02]" />
						</div>
						<div className="flex-1">
							<div className="text-sm text-[#6f7780]">Assets</div>
							<div className="text-xl font-bold text-[#3c3c3c]">
								${metrics.assets.toLocaleString()}
							</div>
						</div>
					</div>

					<div className="flex items-center gap-4">
						<div className="w-12 h-12 rounded-full bg-[#e6f9e6] flex items-center justify-center flex-shrink-0">
							<PiggyBank className="h-6 w-6 text-[#58CC02]" />
						</div>
						<div className="flex-1">
							<div className="text-sm text-[#6f7780]">Cash</div>
							<div className="text-xl font-bold text-[#3c3c3c]">
								${metrics.cash.toLocaleString()}
							</div>
						</div>
					</div>

					<div className="flex items-center gap-4">
						<div className="w-12 h-12 rounded-full bg-[#e6f9e6] flex items-center justify-center flex-shrink-0">
							<Clock className="h-6 w-6 text-[#58CC02]" />
						</div>
						<div className="flex-1">
							<div className="text-sm text-[#6f7780]">
								Free Time
							</div>
							<div className="text-xl font-bold text-[#3c3c3c]">
								{metrics.freeTimeHours} hours/week
							</div>
						</div>
					</div>

					<div className="flex items-center gap-4">
						<div className="w-12 h-12 rounded-full bg-[#e6f9e6] flex items-center justify-center flex-shrink-0">
							<Heart className="h-6 w-6 text-[#58CC02]" />
						</div>
						<div className="flex-1">
							<div className="text-sm text-[#6f7780]">Joy</div>
							<div className="flex items-center">
								<div className="text-xl font-bold text-[#3c3c3c] mr-2">
									{metrics.joyIndex}%
								</div>
								<div className="flex">
									{[...Array(5)].map((_, i) => (
										<div
											key={i}
											className={`w-2 h-6 mx-0.5 rounded-full ${
												i <
												Math.round(
													metrics.joyIndex / 20
												)
													? "bg-[#58CC02]"
													: "bg-[#e5e5e5]"
											}`}
										></div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
