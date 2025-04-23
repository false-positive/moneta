"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ActionTiming } from "@/components/timeline";

type TransactionDisplay = {
	id: string;
	name: string;
	amount: number;
	date: string;
	type: string;
	isActive: boolean;
};

interface TransactionListProps {
	actionTimings: ActionTiming[];
	currentTimePoint: number;
}

export function TransactionList({
	actionTimings = [],
	currentTimePoint,
}: TransactionListProps) {
	const [activeTab, setActiveTab] = useState("current");

	// Active actions for the current timepoint
	const activeActionTimings = actionTimings.filter(
		(timing) =>
			timing.startTimePoint <= currentTimePoint &&
			timing.endTimePoint >= currentTimePoint
	);

	const mapTimingToTransaction = (
		timing: ActionTiming,
		isActive: boolean
	): TransactionDisplay => {
		const action = timing.action;
		let amount = 0;

		console.log("Timing:", timing);
		console.log("Action:", action);
		console.log("Action Kind:", action.kind);
		console.log("Action Impact:", action.bankAccountImpact);

		if (action.kind === "income" && action.bankAccountImpact.hasImpact) {
			amount = action.bankAccountImpact.repeatedAbsoluteDelta;
		} else if (
			action.kind === "expense" &&
			action.bankAccountImpact.hasImpact
		) {
			amount = Math.abs(action.bankAccountImpact.repeatedAbsoluteDelta);
		} else if (
			action.kind === "investment" &&
			action.investmentImpact.hasImpact
		) {
			amount = action.capital || action.investmentImpact.initialPrice;
		}

		return {
			id: action.name,
			name: action.name,
			amount,
			date: `${timing.startTimePoint} - ${timing.endTimePoint}`,
			type: action.kind,
			isActive,
		};
	};

	// Convert active timings to transactions
	const activeTransactions: TransactionDisplay[] = activeActionTimings.map(
		(timing) => mapTimingToTransaction(timing, true)
	);

	// Get completed/inactive actions
	const inactiveTransactions: TransactionDisplay[] = actionTimings
		.filter((timing) => timing.endTimePoint < currentTimePoint)
		.map((timing) => mapTimingToTransaction(timing, false));

	const getTransactionColor = (type: string) => {
		if (type === "income") {
			return {
				bg: "bg-emerald-100",
				text: "text-emerald-600",
				sign: "+",
				pill: "bg-emerald-100 text-emerald-700",
				label: "Income",
			};
		} else if (type === "investment") {
			return {
				bg: "bg-blue-100",
				text: "text-blue-600",
				sign: "~",
				pill: "bg-blue-100 text-blue-700",
				label: "Investment",
			};
		}
		return {
			bg: "bg-rose-100",
			text: "text-rose-600",
			sign: "-",
			pill: "bg-rose-100 text-rose-700",
			label: "Expense",
		};
	};

	const TransactionItem = ({ item }: { item: TransactionDisplay }) => {
		const colors = getTransactionColor(item.type);
		return (
			<div
				key={item.id}
				className={`flex items-center justify-between p-1.5 bg-white rounded-lg border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors ${
					!item.isActive && "opacity-70"
				}`}
			>
				<div className="flex items-center gap-2">
					<div
						className={`px-2 py-0.5 rounded-full text-xs ${colors.pill}`}
					>
						{colors.label}
					</div>
					<span className="text-sm font-medium">{item.name}</span>
				</div>
				<div className="flex items-center gap-2">
					<span className={`text-sm font-semibold ${colors.text}`}>
						{colors.sign} {item.amount.toLocaleString()} lv
					</span>
				</div>
			</div>
		);
	};

	useEffect(() => {
		console.log("Active Transactions:", activeTransactions);
		console.log("Inactive Transactions:", inactiveTransactions);
	}, [activeTransactions, inactiveTransactions]);

	return (
		<div className="bg-white rounded-lg p-2">
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
					{activeTransactions.map((item) => (
						<TransactionItem key={item.id} item={item} />
					))}
				</TabsContent>

				<TabsContent
					value="history"
					className="space-y-1.5 max-h-[200px] overflow-y-auto"
				>
					{inactiveTransactions.map((item) => (
						<TransactionItem key={item.id} item={item} />
					))}
				</TabsContent>
			</Tabs>
		</div>
	);
}
