import { markerMatches, TutorialSpotMarker } from "@/lib/engine/tutorials";
import { tutorialStore } from "@/lib/stores/tutorial-store";
import { cn } from "@/lib/utils";
import { composeEventHandlers } from "@radix-ui/primitive";
import { Primitive } from "@radix-ui/react-primitive";
import { Slot } from "@radix-ui/react-slot";
import { useSelector } from "@xstate/store/react";
import { createContext, PropsWithChildren, use, useRef } from "react";
import invariant from "tiny-invariant";
import { Button } from "./ui/button";
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
	const isCurrent = useIsCurrent();
	return <Popover open={isCurrent}>{props.children}</Popover>;
}

export function TutorialHighlight(props: React.ComponentProps<typeof Slot>) {
	const isCurrent = useIsCurrent();

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
	const isCurrent = useIsCurrent();

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
	const isCurrent = useIsCurrent();
	const currentContent = useSelector(
		tutorialStore,
		(state) =>
			state.context.steps.at(state.context.currentStepIndex)?.description
	);

	// Store the current content in a ref, so we keep showing the old value if the tutorial advanced to the next step
	// This fixes a bug where we move on to the next step, but the popover is still mounted because the exit animation is still playing
	// It used to re-render with the new content, which is intended for the next step.
	// This is to fix #42
	const currentContentRef = useRef(currentContent);
	if (isCurrent) {
		currentContentRef.current = currentContent;
	}

	return (
		<PopoverContent {...popoverContentProps}>
			<div>{currentContentRef.current}</div>
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

function useIsCurrent() {
	const tutorialSpot = use(TutorialSpotContext);
	invariant(
		tutorialSpot,
		"TutorialTrigger must be used within a TutorialSpot"
	);

	const currentMarker = useSelector(
		tutorialStore,
		(state) =>
			state.context.steps.at(state.context.currentStepIndex)?.marker
	);

	return currentMarker && markerMatches(currentMarker, tutorialSpot.marker);
}
