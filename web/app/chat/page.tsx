"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChatInterface from "@/components/chat-interface";
import { Info } from "lucide-react";
import Link from "next/link";

export default function Home() {
	const handleResetChat = () => {
		// Remove the saved chat messages from localStorage
		localStorage.removeItem("chatMessages");
		// Reload the page to reinitialize the chat with default messages
		window.location.reload();
	};

	return (
		<main className="flex flex-col h-screen p-4">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
				{/* Left Column (1/3 width on medium screens and up) */}
				<div className="md:col-span-1 space-y-4 flex flex-col">
					<div className="flex justify-start">
						<button
							className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center
                         transition-all duration-300 hover:bg-primary/20 hover:scale-110
                         hover:shadow-lg group"
							onClick={() => console.log("Info icon clicked")}
						>
							<Info
								className="h-6 w-6 text-primary transition-all duration-300
                           group-hover:animate-pulse"
							/>
						</button>
					</div>
					<Card>
						<CardHeader>
							<CardTitle>Information Box</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<p>This is some important text information.</p>
								<p>Here's another line of text for this box.</p>
								<p>
									You can add as many text elements as needed
									here.
								</p>
							</div>
						</CardContent>
					</Card>
					<Button variant="outline" onClick={handleResetChat}>
						Reset Chat
					</Button>
				</div>

				{/* Right Column (2/3 width on medium screens and up) */}
				<div className="md:col-span-2 flex flex-col">
					<ChatInterface />
				</div>
			</div>

			{/* Centered Next button at the bottom */}
			<div className="flex justify-center py-6">
				<Link href="/choices">
					<Button size="lg">Next</Button>
				</Link>
			</div>
		</main>
	);
}
