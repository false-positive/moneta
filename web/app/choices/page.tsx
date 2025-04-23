"use client";

import { ActionTemplateTree } from "@/components/action-template-tree";
import { TutorialDialogContent, TutorialSpot } from "@/components/tutorial";
import { FlowingMoneyBackground } from "@/components/flowing-money-background";

export default function ChoicesPage() {
	return (
		<main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white relative overflow-hidden flex flex-col">
			<FlowingMoneyBackground color="#6366f1" opacity={0.08} />
			<div className="relative z-10 flex-1 p-4 container mx-auto max-w-6xl text-center">
				<TutorialSpot marker={{ kind: "welcome-dialog" }}>
					<TutorialDialogContent />
				</TutorialSpot>
				<h1 className="text-3xl font-bold mb-6 mt-10 text-center text-[#6c3483]">
					What is the best financial choice in your opinion?
				</h1>
				<div className="h-[calc(100vh-200px)] mx-auto">
					<ActionTemplateTree />
				</div>
			</div>
		</main>
	);
}
