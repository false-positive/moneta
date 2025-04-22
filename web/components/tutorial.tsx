"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TutorialSpotMarker } from "@/lib/engine/tutorials";
import {
	tutorialStore,
	useStableMatchingCurrentTutorialStep,
} from "@/lib/stores/tutorial-store";
import { cn } from "@/lib/utils";
import { composeEventHandlers } from "@radix-ui/primitive";
import { Primitive } from "@radix-ui/react-primitive";
import { Slot } from "@radix-ui/react-slot";
import { createContext, PropsWithChildren, use } from "react";
import invariant from "tiny-invariant";
import { Popover, PopoverAnchor, PopoverContent } from "./ui/popover";
import { Check, ArrowRight } from "lucide-react";

const TutorialSpotContext = createContext<{
	marker: TutorialSpotMarker;
} | null>(null);

export function TutorialSpot({
	marker,
	children,
}: PropsWithChildren<{ marker: TutorialSpotMarker }>) {
	return (
		<TutorialSpotContext.Provider value={{ marker }}>
			<TutorialPopoverRoot>{children}</TutorialPopoverRoot>
		</TutorialSpotContext.Provider>
	);
}

function TutorialPopoverRoot(props: React.ComponentProps<typeof Slot>) {
	const { isCurrent } = useStableCurrentTutorialStep();
	return (
		<Popover open={isCurrent}>
			<Dialog open={isCurrent}>{props.children}</Dialog>
		</Popover>
	);
}

export function TutorialHighlight(props: React.ComponentProps<typeof Slot>) {
	const { isCurrent } = useStableCurrentTutorialStep();

	return (
		<PopoverAnchor asChild>
			<Slot
				className={cn(
					isCurrent && [
						"!outline-4 !outline-indigo-500 rounded-xl",
						"animate-[pulse_2s_ease-in-out_infinite]",
						"shadow-[0_0_15px_rgba(99,102,241,0.5)]",
						"ring-4 ring-indigo-500/30",
						"transition-all duration-300 hover:scale-105",
						"relative z-[102]", // Higher than the overlay
						"before:absolute before:inset-0",
						"before:bg-indigo-500/20",
						"before:rounded-xl",
					]
				)}
				{...props}
			/>
		</PopoverAnchor>
	);
}

export function TutorialTrigger(
	props: React.ComponentProps<typeof Primitive.button>
) {
	const { isCurrent } = useStableCurrentTutorialStep();

	const onClick = isCurrent
		? composeEventHandlers(props.onClick, () => {
				tutorialStore.send({ type: "nextStep" });
		  })
		: props.onClick;

	return (
		<TutorialHighlight>
			<Primitive.button {...props} onClick={onClick} />
		</TutorialHighlight>
	);
}

interface TutorialPopoverProps
	extends React.ComponentProps<typeof PopoverContent> {
	isAdvanceable?: boolean;
	side?: "top" | "right" | "bottom" | "left";
	pulse?: boolean;
}

export function TutorialPopoverContent({
	isAdvanceable,
	...popoverContentProps
}: TutorialPopoverProps) {
	const { step } = useStableCurrentTutorialStep();

	// we never reached this step, so don't render anything
	// XXX: is this okay? we need to verify with radix-ui and its internal `<Presence />` component
	if (!step) return null;

	return (
		<PopoverContent
			{...popoverContentProps}
			className="w-[320px] bg-white border-2 border-indigo-100 shadow-xl rounded-xl p-5 z-[103]" // Higher than overlay and highlighted elements
			side={step.popoverSide || "top"}
			sideOffset={15}
			align="center"
			style={{
				position: "relative",
				zIndex: 103,
				pointerEvents: "auto",
			}}
		>
			<div className="space-y-4">
				<div className="text-sm text-zinc-600 leading-relaxed text-center">
					{step.description}
				</div>
				{isAdvanceable && (
					<Button
						variant="ghost"
						size="sm"
						className={cn(
							"w-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
							"hover:text-indigo-700 hover:scale-[1.02] active:scale-[0.98]",
							"transition-all duration-200 font-medium tracking-wide",
							"relative z-[103]" // Ensure button is also clickable
						)}
						onClick={() => tutorialStore.send({ type: "nextStep" })}
					>
						<Check className="h-4 w-4" />
						Got it!
					</Button>
				)}
			</div>
			{step.pulse && (
				<style jsx global>{`
					@keyframes pulse {
						0%,
						100% {
							transform: scale(1);
						}
						50% {
							transform: scale(1.02);
						}
					}
				`}</style>
			)}
		</PopoverContent>
	);
}

export function TutorialDialogContent() {
	const { step } = useStableCurrentTutorialStep();

	if (!step) return null;

	return (
		<DialogContent
			className="sm:max-w-[90vw] h-[90vh] bg-transparent border-none shadow-none animate-fadeIn rounded-xl before:absolute before:inset-[-200px] before:-z-10 before:[background:radial-gradient(circle_at_center,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.9)_30%,transparent_80%)] before:rounded-full"
			style={{ zIndex: 103 }} // Ensure dialog content is also above overlay
		>
			<div className="flex flex-col items-center justify-center h-full space-y-6 py-8">
				{step.title && (
					<h2 className="text-4xl font-bold text-[#6c5ce7] text-center tracking-wide animate-fadeIn">
						{step.title}
					</h2>
				)}

				<p className="text-2xl text-[#6c5ce7] text-center max-w-[500px] leading-relaxed animate-fadeIn animation-delay-100">
					{step.description}
				</p>

				<Button
					onClick={() => tutorialStore.send({ type: "nextStep" })}
					className="mt-4 bg-transparent text-[#6c5ce7] border-2 border-[#6c5ce7] px-6 py-2 rounded-md animate-[pulse_2s_ease-in-out_infinite] cursor-pointer hover:bg-transparent hover:text-[#6c5ce7] hover:border-[#6c5ce7]"
				>
					Continue
					<ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			</div>

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

				.animation-delay-200 {
					animation-delay: 0.2s;
				}
			`}</style>
		</DialogContent>
	);
}

function useStableCurrentTutorialStep() {
	const tutorialSpot = use(TutorialSpotContext);
	invariant(
		tutorialSpot,
		"TutorialTrigger must be used within a TutorialSpot"
	);

	return useStableMatchingCurrentTutorialStep(tutorialSpot.marker);
}
