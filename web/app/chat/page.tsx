"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChatInterface from "@/components/chat-interface";
import {
	Info,
	PiggyBank,
	Clock,
	Heart,
	HelpCircle,
	GitGraph,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const initialData = {
	joy: 75,
	budget: 3500,
	freeTime: 18,
};

export default function ChatPage() {
	const handleResetChat = () => {
		// Remove the saved chat messages from localStorage
		localStorage.removeItem("chatMessages");
		// Reload the page to reinitialize the chat with default messages
		window.location.reload();
	};

	return (
		<main className="flex flex-col h-screen p-4 bg-gradient-to-b from-indigo-50 to-white">
			<div className="max-w-5xl mx-auto w-full flex-grow flex flex-col">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
					{/* Left Column (1/3 width on medium screens and up) */}
					<div className="md:col-span-1 space-y-4 flex flex-col">
						<div className="flex justify-start">
							<button
								className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center
                         transition-all duration-300 hover:bg-primary/20 hover:scale-110
                         hover:shadow-lg group"
								onClick={() => {}}
							>
								<Info
									className="h-6 w-6 text-primary transition-all duration-300
                           group-hover:animate-pulse"
								/>
							</button>
						</div>

						{/* Known Information Card */}
						<Card className="border-0 shadow-md overflow-hidden">
							<CardHeader className="pb-2 pt-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600">
								<CardTitle className="text-white text-sm font-bold flex items-center gap-2">
									<Info className="h-4 w-4" />
									Financial Profile
								</CardTitle>
							</CardHeader>
							<CardContent className="p-4 space-y-4">
								<div className="mb-4">
									<h3 className="text-sm font-medium text-indigo-800 flex items-center gap-1 mb-2">
										<div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
											<Info className="h-3 w-3 text-indigo-600" />
										</div>
										Known Information
									</h3>

									<div className="bg-white rounded-lg p-2 shadow-sm border border-gray-100">
										<div className="flex items-center gap-2 mb-1">
											<div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
												<PiggyBank className="h-4 w-4 text-emerald-600" />
											</div>
											<div>
												<div className="text-xs text-gray-500">
													Budget
												</div>
												<div className="text-sm font-bold text-emerald-700">
													${initialData.budget}
												</div>
											</div>
										</div>
										<div className="h-1 bg-gray-200 rounded-full overflow-hidden">
											<div
												className="h-full bg-emerald-500 rounded-full"
												style={{
													width: `${Math.min(
														100,
														(initialData.budget /
															10000) *
															100
													)}%`,
												}}
											></div>
										</div>
									</div>

									<div className="bg-white rounded-lg p-2 shadow-sm border border-gray-100">
										<div className="flex items-center gap-2 mb-1">
											<div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
												<Heart className="h-4 w-4 text-rose-600" />
											</div>
											<div>
												<div className="text-xs text-gray-500">
													Joy
												</div>
												<div className="text-sm font-bold text-rose-700">
													{initialData.joy}%
												</div>
											</div>
										</div>
										<div className="flex gap-0.5">
											{[...Array(5)].map((_, i) => (
												<div
													key={i}
													className={`w-full h-5 rounded-sm ${
														i <
														Math.round(
															initialData.joy / 20
														)
															? "bg-rose-500"
															: "bg-gray-200"
													}`}
												></div>
											))}
										</div>
									</div>

									<div className="bg-white rounded-lg p-2 shadow-sm border border-gray-100">
										<div className="flex items-center gap-2 mb-1">
											<div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
												<Clock className="h-4 w-4 text-amber-600" />
											</div>
											<div>
												<div className="text-xs text-gray-500">
													Free Time
												</div>
												<div className="text-sm font-bold text-amber-700">
													{initialData.freeTime}h/w
												</div>
											</div>
										</div>
										<div className="h-1 bg-gray-200 rounded-full overflow-hidden">
											<div
												className="h-full bg-amber-500 rounded-full"
												style={{
													width: `${Math.min(
														100,
														(initialData.freeTime /
															40) *
															100
													)}%`,
												}}
											></div>
										</div>
									</div>
								</div>

								<div className="mt-6">
									<h3 className="text-sm font-medium text-indigo-800 flex items-center gap-1 mb-3">
										<div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
											<Info className="h-3 w-3 text-indigo-600" />
										</div>
										Information to Discover
									</h3>

									<motion.div
										animate={{
											boxShadow: [
												"0 0 0 rgba(99, 102, 241, 0.4)",
												"0 0 8px rgba(99, 102, 241, 0.8)",
												"0 0 0 rgba(99, 102, 241, 0.4)",
											],
										}}
										transition={{
											duration: 2,
											repeat: Number.POSITIVE_INFINITY,
										}}
										className="bg-white rounded-lg p-2 border border-indigo-200 relative mb-3"
									>
										<div className="flex justify-center items-center h-16">
											<HelpCircle className="h-12 w-12 text-indigo-300" />
										</div>
									</motion.div>

									<motion.div
										animate={{
											boxShadow: [
												"0 0 0 rgba(99, 102, 241, 0.4)",
												"0 0 8px rgba(99, 102, 241, 0.8)",
												"0 0 0 rgba(99, 102, 241, 0.4)",
											],
										}}
										transition={{
											duration: 2,
											repeat: Number.POSITIVE_INFINITY,
										}}
										className="bg-white rounded-lg p-2 border border-indigo-200 relative mb-3"
									>
										<div className="flex justify-center items-center h-16">
											<HelpCircle className="h-12 w-12 text-indigo-300" />
										</div>
									</motion.div>

									<motion.div
										animate={{
											boxShadow: [
												"0 0 0 rgba(99, 102, 241, 0.4)",
												"0 0 8px rgba(99, 102, 241, 0.8)",
												"0 0 0 rgba(99, 102, 241, 0.4)",
											],
										}}
										transition={{
											duration: 2,
											repeat: Number.POSITIVE_INFINITY,
										}}
										className="bg-white rounded-lg p-2 border border-indigo-200 relative mb-3"
									>
										<div className="flex justify-center items-center h-16">
											<HelpCircle className="h-12 w-12 text-indigo-300" />
										</div>
									</motion.div>
								</div>
							</CardContent>
						</Card>
						<Button variant="outline" onClick={handleResetChat}>
							Reset Chat
						</Button>
					</div>

					<div className="md:col-span-2 flex flex-col">
						<ChatInterface />
					</div>
				</div>

				<div className="flex justify-center py-6">
					<Link href="/choices">
						<Button
							size="lg"
							className="p-6 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90"
						>
							<GitGraph className="h-6 w-6 mr-3" />
							Simulate
						</Button>
					</Link>
				</div>
			</div>
		</main>
	);
}
