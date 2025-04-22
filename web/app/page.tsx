"use client";

import type React from "react";

import { useState } from "react";
import { Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FlowingMoneyBackground } from "@/components/flowing-money-background";

export default function Home() {
	const [hover, setHover] = useState(false);
	return (
		<div className="min-h-screen bg-gradient-to-b from-[#ffffff] to-[#f8f5ff] flex flex-col items-center justify-center p-4 overflow-hidden relative">
			<FlowingMoneyBackground color="#8e44ad" opacity={0.15} />

			<div className="relative z-10 w-full flex flex-col items-center">
				<header className="w-full flex flex-col items-center justify-center mb-20">
					<div
						className="bg-[#8e44ad] text-white p-4 rounded-full mb-4"
						style={{
							boxShadow: "0 0 15px rgba(142, 68, 173, 0.5)",
						}}
					>
						<Coins size={48} />
					</div>
					<h1 className="text-6xl font-extrabold text-[#6c3483] tracking-wider">
						MONETA
					</h1>
				</header>

				<main className="w-full max-w-md flex flex-col items-center z-10">
					<div
						className={`w-full transition-all duration-300 ${
							hover ? "scale-105" : "scale-100"
						}`}
					>
						<Link href="/quest-selection" className="block w-full">
							<Button
								className="w-full bg-[#8e44ad] hover:bg-[#9b59b6] text-white py-12 rounded-2xl text-3xl font-extrabold transition-all duration-300 border-2 border-[#9b59b6]"
								style={{
									boxShadow:
										"0 0 15px rgba(142, 68, 173, 0.5)",
								}}
								onMouseEnter={() => setHover(true)}
								onMouseLeave={() => setHover(false)}
							>
								PLAY
							</Button>
						</Link>
					</div>

					<p className="mt-8 text-center text-[#6c3483] text-lg font-medium">
						Start learning by playing
					</p>
				</main>
			</div>
		</div>
	);
}
