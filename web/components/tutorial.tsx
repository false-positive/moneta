import { markerMatches, TutorialSpotMarker } from "@/lib/engine/tutorials";
import { tutorialStore } from "@/lib/stores/tutorial-store";
import { useSelector } from "@xstate/store/react";
import { PropsWithChildren, createContext, use } from "react";
import invariant from "tiny-invariant";
import { Primitive } from "@radix-ui/react-primitive";
import { composeEventHandlers } from "@radix-ui/primitive";

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

export function TutorialTrigger(
	props: React.ComponentProps<typeof Primitive.button>
) {
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

	const onClick =
		currentMarker && markerMatches(tutorialSpot.marker, currentMarker)
			? composeEventHandlers(props.onClick, () => {
					tutorialStore.send({ type: "nextStep" });
			  })
			: props.onClick;

	return <Primitive.button {...props} onClick={onClick} />;
}
