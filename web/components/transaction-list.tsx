"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const transactionData = {
	years: {
		2024: [
			{
				id: 1,
				name: "Salary",
				amount: 5000,
				date: "Jan 15",
				type: "income",
				isActive: true,
				endYear: 2035,
			},
			{
				id: 2,
				name: "Rent",
				amount: 1500,
				date: "Jan 16",
				type: "expense",
				isActive: true,
				endYear: 2030,
			},
			{
				id: 3,
				name: "Groceries",
				amount: 120,
				date: "Jan 17",
				type: "expense",
				isActive: true,
				endYear: 2024,
			},
			{
				id: 4,
				name: "Freelance",
				amount: 800,
				date: "Jan 20",
				type: "income",
				isActive: true,
				endYear: 2024,
			},
		],
		2025: [
			{
				id: 1,
				name: "Salary",
				amount: 5500,
				date: "Jan 15",
				type: "income",
				isActive: true,
				endYear: 2035,
			},
			{
				id: 2,
				name: "Credit 1 Payment",
				amount: 3000,
				date: "Jan 16",
				type: "expense",
				isActive: true,
				endYear: 2027,
			},
			{
				id: 3,
				name: "Rent",
				amount: 1600,
				date: "Jan 17",
				type: "expense",
				isActive: true,
				endYear: 2030,
			},
			{
				id: 4,
				name: "Bonus",
				amount: 2000,
				date: "Jan 25",
				type: "income",
				isActive: true,
				endYear: 2025,
			},
			{
				id: 5,
				name: "Old Loan",
				amount: 500,
				date: "Jan 10",
				type: "expense",
				isActive: false,
				endYear: 2024,
			},
		],
		2026: [
			{
				id: 1,
				name: "Salary",
				amount: 6000,
				date: "Jan 15",
				type: "income",
				isActive: true,
				endYear: 2035,
			},
			{
				id: 2,
				name: "Credit 1 Payment",
				amount: 3000,
				date: "Jan 16",
				type: "expense",
				isActive: true,
				endYear: 2027,
			},
			{
				id: 3,
				name: "Credit 2 Payment",
				amount: 4500,
				date: "Jan 17",
				type: "expense",
				isActive: true,
				endYear: 2029,
			},
			{
				id: 4,
				name: "Rent",
				amount: 1700,
				date: "Jan 18",
				type: "expense",
				isActive: true,
				endYear: 2030,
			},
			{
				id: 5,
				name: "Old Loan",
				amount: 500,
				date: "Jan 10",
				type: "expense",
				isActive: false,
				endYear: 2024,
			},
			{
				id: 6,
				name: "Previous Bonus",
				amount: 2000,
				date: "Jan 25",
				type: "income",
				isActive: false,
				endYear: 2025,
			},
		],
	},
	months: {
		Jan: [
			{
				id: 1,
				name: "Salary",
				amount: 5000,
				date: "Jan 15",
				type: "income",
				isActive: true,
			},
			{
				id: 2,
				name: "Rent",
				amount: 1500,
				date: "Jan 16",
				type: "expense",
				isActive: true,
			},
			{
				id: 3,
				name: "Groceries",
				amount: 120,
				date: "Jan 17",
				type: "expense",
				isActive: true,
			},
			{
				id: 4,
				name: "Freelance",
				amount: 800,
				date: "Jan 20",
				type: "income",
				isActive: true,
			},
		],
		Feb: [
			{
				id: 1,
				name: "Salary",
				amount: 5000,
				date: "Feb 15",
				type: "income",
				isActive: true,
			},
			{
				id: 2,
				name: "Rent",
				amount: 1500,
				date: "Feb 16",
				type: "expense",
				isActive: true,
			},
			{
				id: 3,
				name: "Groceries",
				amount: 130,
				date: "Feb 17",
				type: "expense",
				isActive: true,
			},
			{
				id: 4,
				name: "Freelance",
				amount: 850,
				date: "Feb 20",
				type: "income",
				isActive: true,
			},
		],
	},
	weeks: {
		"Week 1": [
			{
				id: 1,
				name: "Groceries",
				amount: 120,
				date: "Monday",
				type: "expense",
				isActive: true,
			},
			{
				id: 2,
				name: "Dining Out",
				amount: 80,
				date: "Wednesday",
				type: "expense",
				isActive: true,
			},
			{
				id: 3,
				name: "Gas",
				amount: 40,
				date: "Friday",
				type: "expense",
				isActive: true,
			},
		],
		"Week 2": [
			{
				id: 1,
				name: "Groceries",
				amount: 110,
				date: "Monday",
				type: "expense",
				isActive: true,
			},
			{
				id: 2,
				name: "Entertainment",
				amount: 50,
				date: "Saturday",
				type: "expense",
				isActive: true,
			},
			{
				id: 3,
				name: "Dining Out",
				amount: 90,
				date: "Sunday",
				type: "expense",
				isActive: true,
			},
		],
	},
	days: {
		Mon: [
			{
				id: 1,
				name: "Coffee",
				amount: 5,
				date: "8:00 AM",
				type: "expense",
				isActive: true,
			},
			{
				id: 2,
				name: "Lunch",
				amount: 15,
				date: "12:30 PM",
				type: "expense",
				isActive: true,
			},
			{
				id: 3,
				name: "Snack",
				amount: 3,
				date: "3:00 PM",
				type: "expense",
				isActive: true,
			},
		],
		Tue: [
			{
				id: 1,
				name: "Coffee",
				amount: 5,
				date: "8:00 AM",
				type: "expense",
				isActive: true,
			},
			{
				id: 2,
				name: "Lunch",
				amount: 12,
				date: "12:30 PM",
				type: "expense",
				isActive: true,
			},
			{
				id: 3,
				name: "Snack",
				amount: 3,
				date: "3:00 PM",
				type: "expense",
				isActive: true,
			},
		],
	},
};

// Default transactions for units without specific data
const defaultTransactions = [
	{
		id: 1,
		name: "Salary",
		amount: 5000,
		date: "15th",
		type: "income",
		isActive: true,
	},
	{
		id: 2,
		name: "Rent",
		amount: 1500,
		date: "16th",
		type: "expense",
		isActive: true,
	},
	{
		id: 3,
		name: "Utilities",
		amount: 200,
		date: "17th",
		type: "expense",
		isActive: true,
	},
	{
		id: 4,
		name: "Groceries",
		amount: 150,
		date: "18th",
		type: "expense",
		isActive: true,
	},
];

interface TransactionListProps {
	selectedTimeframe: "years" | "months" | "weeks" | "days";
	selectedUnit: string | number;
}

export function TransactionList({
	selectedTimeframe,
	selectedUnit,
}: TransactionListProps) {
	const [activeTab, setActiveTab] = useState("current");

	const timeframeData = transactionData[selectedTimeframe] || {};
	const allTransactions: typeof defaultTransactions =
		timeframeData[selectedUnit as keyof typeof timeframeData] ||
		defaultTransactions;

	const currentTransactions = allTransactions.filter(
		(transaction) => transaction.isActive,
	);

	const historyTransactions = allTransactions.filter(
		(transaction) => !transaction.isActive,
	);

	return (
		<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
			<TabsList className="grid w-full grid-cols-2 mb-4">
				<TabsTrigger value="current">Current</TabsTrigger>
				<TabsTrigger value="history">History</TabsTrigger>
			</TabsList>

			<TabsContent value="current" className="space-y-3">
				{currentTransactions.length > 0 ? (
					currentTransactions.map((item) => (
						<div
							key={item.id}
							className="flex items-center justify-between p-3 bg-[#f7f7f7] rounded-lg"
						>
							<div className="flex items-center gap-3">
								<div
									className={`w-10 h-10 rounded-full flex items-center justify-center ${
										item.type === "income"
											? "bg-[#e6f9e6]"
											: "bg-[#ffebeb]"
									}`}
								>
									<span
										className={`text-lg ${
											item.type === "income"
												? "text-[#58CC02]"
												: "text-[#ff4b4b]"
										}`}
									>
										{item.type === "income" ? "+" : "-"}
									</span>
								</div>
								<div>
									<p className="font-medium text-[#3c3c3c]">
										{item.name}
									</p>
									<p className="text-xs text-[#6f7780]">
										{item.date}
									</p>
								</div>
							</div>
							<span
								className={`font-bold ${
									item.type === "income"
										? "text-[#58CC02]"
										: "text-[#ff4b4b]"
								}`}
							>
								{item.type === "income" ? "+" : "-"}$
								{item.amount.toLocaleString()}
							</span>
						</div>
					))
				) : (
					<div className="text-center py-6 text-[#6f7780]">
						No current transactions for {selectedUnit}
					</div>
				)}
			</TabsContent>

			<TabsContent value="history" className="space-y-3">
				{historyTransactions.length > 0 ? (
					historyTransactions.map((item) => (
						<div
							key={item.id}
							className="flex items-center justify-between p-3 bg-[#f7f7f7] rounded-lg opacity-70"
						>
							<div className="flex items-center gap-3">
								<div
									className={`w-10 h-10 rounded-full flex items-center justify-center ${
										item.type === "income"
											? "bg-[#e6f9e6]"
											: "bg-[#ffebeb]"
									}`}
								>
									<span
										className={`text-lg ${
											item.type === "income"
												? "text-[#58CC02]"
												: "text-[#ff4b4b]"
										}`}
									>
										{item.type === "income" ? "+" : "-"}
									</span>
								</div>
								<div>
									<p className="font-medium text-[#3c3c3c]">
										{item.name}
									</p>
								</div>
							</div>
							<span
								className={`font-bold ${
									item.type === "income"
										? "text-[#58CC02]"
										: "text-[#ff4b4b]"
								}`}
							>
								{item.type === "income" ? "+" : "-"}$
								{item.amount.toLocaleString()}
							</span>
						</div>
					))
				) : (
					<div className="text-center py-6 text-[#6f7780]">
						No historical transactions for {selectedUnit}
					</div>
				)}
			</TabsContent>
		</Tabs>
	);
}
