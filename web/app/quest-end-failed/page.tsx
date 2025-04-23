"use client";

import { useEffect, useState } from "react";
import { useSelector } from "@xstate/store/react";
import { questStore } from "@/lib/stores/quest-store";
import { XCircle, AlertTriangle, Clock, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { getFailedMetrics } from "@/lib/engine/quests";

export default function QuestFailurePage() {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const { steps, description } = useSelector(questStore, (s) => s.context);
	const lastStep = steps[steps.length - 1];

	if (!lastStep) return null;

	const failedMetrics = getFailedMetrics(lastStep);
	const metrics = {
		joy: Math.max(0, Math.min(100, Math.round(lastStep.joy))),
		money: Math.round(lastStep.bankAccount),
		freeTime: Math.min(100, lastStep.freeTimeHours),
	};

	const timeframeText = {
		year: "years",
		month: "months",
		week: "weeks",
		day: "days",
	}[description.timePointKind];

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 p-4 relative overflow-hidden">
			<div className="absolute inset-0 bg-gray-950 z-0 overflow-hidden">
				{mounted && (
					<div className="relative w-full h-full">
						{Array.from({ length: 200 }).map((_, i) => (
							<motion.div
								key={i}
								className="absolute bg-blue-100/70"
								style={{
									width: Math.random() * 1 + 0.5,
									height: Math.random() * 20 + 15,
									left: `${Math.random() * 100}%`,
									top: "-50px",
									transform: `rotate(${
										Math.random() * 10 + 5
									}deg)`,
								}}
								animate={{
									y: ["0vh", "100vh"],
									opacity: [0.7, 0.5, 0],
								}}
								transition={{
									duration: Math.random() * 0.5 + 0.5,
									repeat: Infinity,
									delay: Math.random() * 2,
									ease: "linear",
								}}
							/>
						))}

						{Array.from({ length: 30 }).map((_, i) => (
							<motion.div
								key={`red-${i}`}
								className="absolute bg-red-400/40"
								style={{
									width: Math.random() * 1 + 0.5,
									height: Math.random() * 20 + 15,
									left: `${Math.random() * 100}%`,
									top: "-50px",
									transform: `rotate(${
										Math.random() * 10 + 5
									}deg)`,
								}}
								animate={{
									y: ["0vh", "100vh"],
									opacity: [0.5, 0.3, 0],
								}}
								transition={{
									duration: Math.random() * 0.5 + 0.5,
									repeat: Infinity,
									delay: Math.random() * 2,
									ease: "linear",
								}}
							/>
						))}

						<motion.div
							className="absolute inset-0 bg-blue-50/80"
							animate={{ opacity: [0, 0, 0.9, 0, 0.3, 0] }}
							transition={{
								duration: 0.7,
								repeat: Infinity,
								repeatDelay: Math.random() * 15 + 10,
								ease: "easeOut",
							}}
						/>

						<motion.div
							className="absolute inset-0 bg-red-900/30"
							animate={{ opacity: [0, 0, 0.7, 0, 0.2, 0] }}
							transition={{
								duration: 0.5,
								repeat: Infinity,
								repeatDelay: Math.random() * 30 + 25,
								ease: "easeOut",
							}}
						/>

						<motion.div
							className="absolute bg-white blur-[1px] z-10"
							style={{
								width: Math.random() * 2 + 1,
								height: 0,
								left: `${Math.random() * 100}%`,
								top: `${Math.random() * 30}%`,
							}}
							animate={{
								height: [0, Math.random() * 300 + 200, 0],
								opacity: [0, 0.9, 0],
							}}
							transition={{
								duration: 0.3,
								repeat: Infinity,
								repeatDelay: Math.random() * 20 + 15,
								ease: "easeOut",
							}}
						/>

						{Array.from({ length: 12 }).map((_, i) => (
							<motion.div
								key={`cloud-${i}`}
								className="absolute bg-gray-800 rounded-full blur-lg opacity-50"
								style={{
									width: Math.random() * 300 + 150,
									height: Math.random() * 80 + 60,
									left: `${Math.random() * 120 - 10}%`,
									top: `${Math.random() * 40}%`,
								}}
								animate={{
									x: [0, Math.random() * 50 - 25],
								}}
								transition={{
									duration: Math.random() * 30 + 20,
									repeat: Infinity,
									repeatType: "reverse",
									ease: "easeInOut",
								}}
							/>
						))}

						{Array.from({ length: 6 }).map((_, i) => (
							<motion.div
								key={`fog-${i}`}
								className="absolute bg-gray-700/20 rounded-full blur-[40px]"
								style={{
									width: Math.random() * 500 + 300,
									height: Math.random() * 200 + 100,
									left: `${Math.random() * 100}%`,
									top: `${Math.random() * 100}%`,
								}}
								animate={{
									x: [0, Math.random() * 100 - 50],
									opacity: [0.1, 0.2, 0.1],
								}}
								transition={{
									duration: Math.random() * 40 + 30,
									repeat: Infinity,
									repeatType: "reverse",
									ease: "easeInOut",
								}}
							/>
						))}
					</div>
				)}
			</div>

			<div className="max-w-3xl mx-auto relative z-10">
				<div className="text-center mb-8 mt-8">
					<div className="flex justify-center mb-4">
						<div className="relative">
							<XCircle className="h-20 w-20 text-red-500" />
							<div className="absolute inset-0 animate-pulse opacity-50">
								<XCircle className="h-20 w-20 text-red-500" />
							</div>
						</div>
					</div>
					<h1 className="text-5xl font-extrabold text-red-500 mb-2 tracking-tight">
						QUEST FAILED
					</h1>
				</div>

				<div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-lg p-6 mb-8 border border-gray-700 transform transition-all hover:scale-[1.01]">
					<h2 className="text-2xl font-bold text-center text-red-400 mb-4">
						Goal not achieved
					</h2>
					<div className="bg-gray-800/70 rounded-lg p-4 mb-4">
						<p className="text-xl text-center text-gray-200 italic">
							"{description.goal.description}"
						</p>
					</div>
					<p className="text-center text-gray-300">
						Your journey through {steps.length} {timeframeText} has
						ended in failure.
					</p>
				</div>

				<div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-700">
					<h2 className="text-2xl font-bold text-center text-red-400 mb-6 flex items-center justify-center">
						<AlertTriangle className="mr-2 h-6 w-6" />
						Reasons for failure
					</h2>

					<div className="grid grid-cols-1 gap-6 mb-6">
						{Object.entries({
							bankAccount: {
								title: "Financial Crisis",
								icon: (
									<Wallet className="h-6 w-6 text-red-400" />
								),
								message: `Your bank account went negative ($${metrics.money.toLocaleString()})`,
							},
							joy: {
								title: "Happiness Depleted",
								icon: (
									<AlertTriangle className="h-6 w-6 text-red-400" />
								),
								message: "Your joy levels dropped below zero",
							},
							freeTimeHours: {
								title: "Burnout",
								icon: (
									<Clock className="h-6 w-6 text-red-400" />
								),
								message: "You ran out of free time completely",
							},
						}).map(
							([key, { title, icon, message }]) =>
								failedMetrics[
									key as keyof typeof failedMetrics
								] && (
									<div
										key={key}
										className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-5 border border-gray-700 shadow-sm"
									>
										<div className="flex items-center mb-3">
											<div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-700 mr-4">
												{icon}
											</div>
											<div>
												<h3 className="text-lg font-bold text-gray-200">
													{title}
												</h3>
												<p className="text-gray-300">
													{message}
												</p>
											</div>
										</div>
										<div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
											<div className="h-full bg-red-500 rounded-full w-full" />
										</div>
									</div>
								)
						)}
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{[
							{
								title: "Joy",
								value: `${metrics.joy}%`,
								failed: failedMetrics.joy,
								showBar: true,
								barValue: metrics.joy,
							},
							{
								title: "Wealth",
								value: `$${metrics.money.toLocaleString()}`,
								failed: failedMetrics.bankAccount,
								showBar: false,
							},
							{
								title: "Free Time",
								value: `${metrics.freeTime}%`,
								failed: failedMetrics.freeTimeHours,
								showBar: true,
								barValue: metrics.freeTime,
							},
						].map(({ title, value, failed, showBar, barValue }) => (
							<div
								key={title}
								className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-5 text-center border border-gray-700 shadow-sm"
							>
								<h3 className="text-lg font-bold text-gray-200 mb-1">
									{title}
								</h3>
								<div className="text-3xl font-bold text-red-400 mb-2">
									{value}
								</div>
								{showBar && (
									<div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
										<div
											className="h-full bg-red-500 rounded-full"
											style={{ width: `${barValue}%` }}
										/>
									</div>
								)}
								{failed && (
									<p className="mt-3 text-red-400 text-sm font-semibold">
										Critical failure
									</p>
								)}
							</div>
						))}
					</div>
				</div>

				<div className="flex justify-center mb-12">
					<button
						className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-10 rounded-full shadow-lg transition-all transform hover:scale-105"
						onClick={() =>
							(window.location.href = "/quest-selection")
						}
					>
						Choose New Quest
					</button>
				</div>
			</div>
		</div>
	);
}
