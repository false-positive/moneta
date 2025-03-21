"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChatInterface from "@/components/chat-interface";
import { Info } from "lucide-react";
import Link from "next/link";
import { useCallback } from "react";

export default function Home() {
	const handleResetChat = useCallback(() => {
		// Remove the saved chat messages from localStorage
		localStorage.removeItem("chatMessages");
		// Reload the page to reinitialize the chat with default messages
		window.location.reload();
	}, []);

	return (
		// Match the main gradient background from page.tsx
		<main className="min-h-screen p-4 bg-gradient-to-b from-indigo-50 to-white">
			<div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Left Column */}
				<div className="md:col-span-1 space-y-4 flex flex-col">
					{/* Info button + Information Box in a styled card */}
					<div className="bg-white rounded-xl shadow-md overflow-hidden">
						{/* Gradient header for the card */}
						<div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-2 px-4">
							<div className="flex justify-start">
								<button
									className="w-12 h-12 rounded-full bg-white/10 flex items-center
                             justify-center transition-all duration-300
                             hover:bg-white/20 hover:scale-110 group"
									onClick={() => console.log("Info icon clicked")}
								>
									<Info className="h-6 w-6 text-white group-hover:animate-pulse" />
								</button>
							</div>
							<h2 className="text-white font-bold text-xl mt-3">
								Information Box
							</h2>
						</div>
						<div className="p-4 space-y-2">
							<p className="text-gray-700">
								This is some important text information.
							</p>
							<p className="text-gray-700">
								Here's another line of text for this box.
							</p>
							<p className="text-gray-700">
								You can add as many text elements as needed here.
							</p>
							<Button
								variant="outline"
								onClick={handleResetChat}
								className="mt-4 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
							>
								Reset Chat
							</Button>
						</div>
					</div>
				</div>

				{/* Right Column: Chat area in a white card */}
				<div className="md:col-span-2 flex flex-col">
						<ChatInterface />
				</div>
			</div>

			{/* Centered Next button at the bottom */}
			<div className="flex justify-center py-6">
				<Link href="/choices">
					<Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white">
						Next
					</Button>
				</Link>
			</div>
		</main>
	);
}
