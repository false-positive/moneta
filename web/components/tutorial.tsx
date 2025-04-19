"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

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
		<PopoverTrigger asChild>
			<Slot
				// TODO: these styles are for testing and intentionally obnoxious
				className={cn(
					isCurrent &&
						"!outline-8 !outline-indigo-500 animate-[pulse_1s_ease-in-out_infinite] shadow-[0_0_25px_rgba(99,102,241,0.7)] ring-8 ring-indigo-500/50 transition-all duration-300 hover:scale-110 relative before:absolute before:inset-0 before:animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] before:bg-indigo-500/30 before:rounded-[inherit]"
				)}
				{...props}
			/>
		</PopoverTrigger>
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
}

export function TutorialPopover({
	isAdvanceable,
	...popoverContentProps
}: TutorialPopoverProps) {
	const { step } = useStableCurrentTutorialStep();

	// we never reached this step, so don't render anything
	// XXX: is this okay? we need to verify with radix-ui and its internal `<Presence />` component
	if (!step) return null;

	return (
		<PopoverContent {...popoverContentProps}>
			<div>{step.description}</div>
			{isAdvanceable && (
				<Button
					variant="outline"
					onClick={() => tutorialStore.send({ type: "nextStep" })}
				>
					GOT ITTTT!!
				</Button>
			)}
		</PopoverContent>
	);
}

export function TutorialDialog(
	props: React.ComponentProps<typeof DialogContent>
) {
	const { step } = useStableCurrentTutorialStep();

	if (!step) return null;

	return (
		<DialogContent className="sm:max-w-[425px]">
			<DialogHeader>
				<DialogTitle>{step.title}</DialogTitle>
				<DialogDescription>{step.description}</DialogDescription>
			</DialogHeader>

			<DialogFooter>
				<Button
					onClick={() => tutorialStore.send({ type: "nextStep" })}
				>
					yep, got it
				</Button>
			</DialogFooter>
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
