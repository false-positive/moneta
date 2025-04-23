"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface WelcomeDialogProps {
	isOpen: boolean;
	title: string;
	onNext: () => void;
	children: React.ReactNode;
	showGradient?: boolean;
}

export function WelcomeDialog({
	isOpen,
	title,
	onNext,
	children,
	showGradient = false,
}: WelcomeDialogProps) {
	return (
		<Dialog open={isOpen}>
			<DialogContent
				showOverlay={false}
				className={`sm:max-w-[90vw] h-[90vh] ${
					showGradient
						? "before:absolute before:inset-[-200px] before:-z-10 before:[background:radial-gradient(circle_at_center,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.9)_30%,transparent_80%)] before:rounded-full"
						: ""
				} bg-transparent border-none shadow-none animate-fadeIn`}
			>
				<div className="flex flex-col items-center justify-center h-full space-y-6 py-8">
					<DialogTitle
						className="text-5xl font-bold text-[#6c5ce7] text-center tracking-wide animate-fadeIn"
						asChild
					>
						<h2 className="text-5xl font-bold text-purple-600 text-center tracking-wide animate-fadeIn">
							{title}
						</h2>
					</DialogTitle>
					<div className="text-2xl text-purple-600 text-center max-w-[500px] leading-relaxed animate-fadeIn animation-delay-100">
						{children}
					</div>
					<Button
						onClick={onNext}
						className="mt-4 bg-transparent text-purple-600 border-2 border-purple-600 px-6 py-2 rounded-md animate-[pulse_2s_ease-in-out_infinite] cursor-pointer hover:bg-transparent hover:text-[#6c5ce7] hover:border-[#6c5ce7]"
					>
						Got it!
						<ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				</div>
			</DialogContent>
			<style jsx global>{`
				@keyframes fadeIn {
					from {
						opacity: 0;
					}
					to {
						opacity: 1;
					}
				}

				.animate-fadeIn {
					animation: fadeIn 0.5s ease-out forwards;
				}

				.animation-delay-100 {
					animation-delay: 0.1s;
				}
			`}</style>
		</Dialog>
	);
}
