"use client";

import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type Action } from "@/lib/engine/actions";
import { TutorialSpot } from "./tutorial";

export interface ActionTiming {
	action: Action;
	startTimePoint: number;
	endTimePoint: number;
}

interface TimelineProps {
	timeUnits: (string | number)[];
	selectedUnit: string | number;
	nowMarker?: string | number;
	onUnitClick: (unit: string | number) => void;
	actionTimings: ActionTiming[];
}

const getActionColors = (joyImpact: any, isSelected: boolean = false) => {
	const joyValue = joyImpact.repeatedAbsoluteDelta;

	if (joyValue > 0) {
		return {
			bg: isSelected ? "bg-emerald-200" : "bg-emerald-100",
			border: isSelected ? "border-emerald-600" : "border-emerald-500",
			text: isSelected ? "text-emerald-800" : "text-emerald-700",
		};
	} else {
		return {
			bg: isSelected ? "bg-rose-200" : "bg-rose-100",
			border: isSelected ? "border-rose-600" : "border-rose-500",
			text: isSelected ? "text-rose-800" : "text-rose-700",
		};
	}
};

export function Timeline({
	timeUnits,
	selectedUnit,
	nowMarker,
	onUnitClick,
	actionTimings,
}: TimelineProps) {
	const [eventDetailsOpen, setEventDetailsOpen] = useState(false);
	const [selectedAction, setSelectedAction] = useState<Action | null>(null);

	const handleUnitClick = (unit: string | number) => {
		onUnitClick(Number(unit));
	};

	const lastTimePoint = timeUnits[timeUnits.length - 1];
	const normalizedActionTimings = actionTimings.map((timing) => ({
		...timing,
		endTimePoint:
			timing.endTimePoint === Infinity
				? typeof lastTimePoint === "string"
					? parseInt(lastTimePoint)
					: lastTimePoint
				: timing.endTimePoint,
	}));

	useEffect(() => {
		console.log("Action Timings:", normalizedActionTimings);
		console.log("Time Units:", timeUnits);
	}, []);

	return (
		<TutorialSpot marker={{ kind: "timeline" }}>
			<div className="w-full overflow-x-auto">
				<div className="min-w-[800px] mb-1">
					<div className="relative mb-6">
						<div
							className="h-0.5 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 absolute top-3"
							style={{ width: `${timeUnits.length * 80}px` }}
						/>

						<div
							className="flex"
							style={{ width: `${timeUnits.length * 80}px` }}
						>
							{timeUnits.map((unit) => (
								<div
									key={String(unit)}
									className="flex flex-col items-center"
									style={{ width: "80px", flexShrink: 0 }}
								>
									<div className="h-3 w-0.5 bg-gray-700 mb-0.5" />
									<TutorialSpot
										marker={{
											kind: "timeline-unit",
											instance: { unit },
										}}
									>
										<div
											className={`text-xs font-bold cursor-pointer px-2 py-0.5 rounded-full transition-all transform hover:scale-110 ${
												selectedUnit === unit
													? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
													: "bg-white text-gray-700 border border-gray-300 hover:border-indigo-400 hover:text-indigo-600"
											}`}
											onClick={() =>
												handleUnitClick(unit)
											}
										>
											{unit}
										</div>
									</TutorialSpot>
								</div>
							))}
						</div>

						{nowMarker && (
							<div
								className="absolute top-[-10px]"
								style={{
									left: `${
										timeUnits.indexOf(nowMarker) * 80 + 40
									}px`,
								}}
							>
								<div className="w-0 h-0 border-l-[5px] border-r-[5px] border-b-[10px] border-l-transparent border-r-transparent border-b-purple-600" />
							</div>
						)}
					</div>

					<div
						className="space-y-2"
						style={{ width: `${timeUnits.length * 80}px` }}
					>
						{normalizedActionTimings
							.filter((timing) => timing.action.name !== "Life")
							.map((timing, index) => {
								const startTimePoint = timing.startTimePoint;
								const endTimePoint = timing.endTimePoint;

								const startIndex = timeUnits.findIndex(
									(unit) => Number(unit) === startTimePoint
								);
								const endIndex = timeUnits.findIndex(
									(unit) => Number(unit) === endTimePoint
								);

								// Calculate position and width based on actual timepoints with right offset
								const timeSpan =
									endTimePoint - startTimePoint + 1;
								const left = startIndex * 80 + 40; // Added 40px offset (half a unit)
								const width = timeSpan * 80;

								const joyImpact = timing.action.joyImpact;

								const colors = getActionColors(
									joyImpact,
									selectedUnit === startTimePoint ||
										selectedUnit === endTimePoint
								);

								return (
									<div
										key={index}
										className="flex items-center"
									>
										<div className="w-4 flex-shrink-0"></div>
										<div className="flex-1 relative h-6 p-1">
											<div
												className={`absolute h-6 rounded-full border flex items-center justify-center text-xs font-medium transition-all cursor-pointer hover:shadow-md overflow-hidden ${colors.bg} ${colors.border} ${colors.text}`}
												style={{
													left: `${left}px`,
													width: `${width}px`,
													opacity:
														Number(selectedUnit) >=
															startTimePoint &&
														Number(selectedUnit) <=
															endTimePoint
															? 1
															: 0.7,
													transform:
														Number(selectedUnit) >=
															startTimePoint &&
														Number(selectedUnit) <=
															endTimePoint
															? "scale(1.05)"
															: "scale(1)",
												}}
												onClick={() => {
													setSelectedAction(
														timing.action
													);
													setEventDetailsOpen(true);
												}}
											>
												<span className="text-center whitespace-nowrap overflow-hidden text-ellipsis px-2 text-[10px]">
													{timing.action.name}
												</span>
											</div>
										</div>
									</div>
								);
							})}
					</div>
				</div>

				<Dialog
					open={eventDetailsOpen}
					onOpenChange={setEventDetailsOpen}
				>
					<DialogContent className="bg-white border-0 shadow-md">
						<DialogHeader>
							<DialogTitle className="text-sm font-bold text-indigo-700">
								{selectedAction?.name}
							</DialogTitle>
							<DialogDescription className="text-xs text-gray-600">
								{selectedAction?.shortDescription}
							</DialogDescription>
						</DialogHeader>
						<div className="p-2 bg-indigo-50 rounded-lg my-2">
							<div className="text-xs text-indigo-700 font-medium">
								Action Type
							</div>
							<div className="text-sm font-bold text-indigo-900 capitalize">
								{selectedAction?.kind}
							</div>
						</div>
						<DialogFooter>
							<Button
								onClick={() => setEventDetailsOpen(false)}
								variant="secondary"
							>
								Close
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</TutorialSpot>
	);
}
