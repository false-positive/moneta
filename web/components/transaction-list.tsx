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
		(transaction) => transaction.isActive
	);

	const historyTransactions = allTransactions.filter(
		(transaction) => !transaction.isActive
	);

	const getTransactionColor = (type: string) => {
		if (type === "income") {
			return {
				bg: "bg-emerald-100",
				text: "text-emerald-600",
				sign: "+",
			};
		}
		return {
			bg: "bg-rose-100",
			text: "text-rose-600",
			sign: "-",
		};
	};

	return (
		<div className="bg-white rounded-lg p-2 shadow-md">
			<h3 className="text-xs font-bold text-indigo-900 mb-2">
				Transactions
			</h3>

			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="w-full"
			>
				<TabsList className="grid w-full grid-cols-2 mb-2 bg-indigo-100 p-0.5 rounded-lg h-7">
					<TabsTrigger
						value="current"
						className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-md text-xs h-6"
					>
						Current
					</TabsTrigger>
					<TabsTrigger
						value="history"
						className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-md text-xs h-6"
					>
						History
					</TabsTrigger>
				</TabsList>

				<TabsContent
					value="current"
					className="space-y-1.5 max-h-[200px] overflow-y-auto"
				>
					{currentTransactions.length > 0 ? (
						currentTransactions.map((item) => {
							const colors = getTransactionColor(item.type);

							return (
								<div
									key={item.id}
									className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-gray-100 shadow-sm"
								>
									<div className="flex items-center gap-2">
										<div
											className={`w-7 h-7 rounded-full flex items-center justify-center ${colors.bg}`}
										>
											<span
												className={`text-sm font-bold ${colors.text}`}
											>
												{colors.sign}
											</span>
										</div>
										<div>
											<p className="font-medium text-gray-800 text-xs">
												{item.name}
											</p>
											<p className="text-[10px] text-gray-500">
												{item.date}
											</p>
										</div>
									</div>
									<span
										className={`font-bold text-xs ${colors.text}`}
									>
										{colors.sign}$
										{item.amount.toLocaleString()}
									</span>
								</div>
							);
						})
					) : (
						<div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg text-xs">
							<p>No current transactions for {selectedUnit}</p>
						</div>
					)}
				</TabsContent>

				<TabsContent
					value="history"
					className="space-y-1.5 max-h-[200px] overflow-y-auto"
				>
					{historyTransactions.length > 0 ? (
						historyTransactions.map((item) => {
							const colors = getTransactionColor(item.type);

							return (
								<div
									key={item.id}
									className="flex items-center justify-between p-1.5 bg-gray-50 rounded-lg border border-gray-100 opacity-70"
								>
									<div className="flex items-center gap-2">
										<div
											className={`w-7 h-7 rounded-full flex items-center justify-center ${colors.bg}`}
										>
											<span
												className={`text-sm font-bold ${colors.text}`}
											>
												{colors.sign}
											</span>
										</div>
										<div>
											<p className="font-medium text-gray-700 text-xs">
												{item.name}
											</p>
											<p className="text-[10px] text-gray-500">
												{item.date}{" "}
											</p>
										</div>
									</div>
									<span
										className={`font-bold text-xs ${colors.text}`}
									>
										{colors.sign}$
										{item.amount.toLocaleString()}
									</span>
								</div>
							);
						})
					) : (
						<div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg text-xs">
							<p>No historical transactions for {selectedUnit}</p>
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
