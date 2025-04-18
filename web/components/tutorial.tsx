import { markerMatches, TutorialSpotMarker } from "@/lib/engine/tutorials";
import { tutorialStore } from "@/lib/stores/tutorial-store";
import { useSelector } from "@xstate/store/react";
import { PropsWithChildren, createContext, forwardRef, use } from "react";
import invariant from "tiny-invariant";
import { Primitive } from "@radix-ui/react-primitive";
import { composeEventHandlers } from "@radix-ui/primitive";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const TutorialSpotContext = createContext<{
	marker: TutorialSpotMarker;
} | null>(null);

export function TutorialSpot({
	marker,
	children,
}: PropsWithChildren<{ marker: TutorialSpotMarker }>) {
	return (
		<TutorialSpotContext.Provider value={{ marker }}>
			{children}
		</TutorialSpotContext.Provider>
	);
}

export function TutorialHighlight(props: React.ComponentProps<typeof Slot>) {
	const isCurrent = useIsCurrent();

	return (
		<Slot
			// TODO: these styles are for testing and intentionally obnoxious
			className={cn(
				isCurrent &&
					"!outline-8 !outline-indigo-500 animate-[pulse_1s_ease-in-out_infinite] shadow-[0_0_25px_rgba(99,102,241,0.7)] ring-8 ring-indigo-500/50 transition-all duration-300 hover:scale-110 relative before:absolute before:inset-0 before:animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] before:bg-indigo-500/30 before:rounded-[inherit]"
			)}
			{...props}
		/>
	);
}

export const TutorialTrigger = forwardRef<
	HTMLButtonElement,
	React.ComponentProps<typeof Primitive.button>
>((props, ref) => {
	const isCurrent = useIsCurrent();

	const onClick = isCurrent
		? composeEventHandlers(props.onClick, () => {
				tutorialStore.send({ type: "nextStep" });
		  })
		: props.onClick;

	return (
		<TutorialHighlight>
			<Primitive.button {...props} ref={ref} onClick={onClick} />
		</TutorialHighlight>
	);
});

TutorialTrigger.displayName = "TutorialTrigger";

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
