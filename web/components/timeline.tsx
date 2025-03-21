"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Action, Step } from "@/lib/cases/actions";

// Export the ActionTiming interface so it can be imported by other components
export interface ActionTiming {
	action: Action;
	startTick: number;
	endTick: number;
}

interface TimelineProps {
	timeUnits: (string | number)[];
	steps: Step[];
	selectedUnit: string | number;
	nowMarker?: string | number;
	unitType: "years" | "months" | "weeks" | "days";
	onUnitClick: (unit: string | number) => void;
	actionTimings: ActionTiming[];
}

const getActionColors = (
	joyValue: number,
	kind: string,
	isSelected: boolean = false
) => {
	// Base colors based on joy value
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
	steps,
	selectedUnit,
	nowMarker,
	unitType,
	onUnitClick,
	actionTimings,
}: TimelineProps) {
	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const [unitToConfirm, setUnitToConfirm] = useState<string | number | null>(
		null
	);
	const [eventDetailsOpen, setEventDetailsOpen] = useState(false);
	const [selectedAction, setSelectedAction] = useState<Action | null>(null);

	const handleUnitClick = (unit: string | number) => {
		onUnitClick(unit);
	};

	const handleUnitDoubleClick = (unit: string | number) => {
		setUnitToConfirm(unit);
		setConfirmationOpen(true);
	};

	const handleConfirm = () => {
		if (unitToConfirm !== null) {
			console.log(`Unit ${unitToConfirm} confirmed for selection`);
		}
		setConfirmationOpen(false);
	};

	const handleActionClick = (action: Action) => {
		setSelectedAction(action);
		setEventDetailsOpen(true);
	};

	return (
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
								<div
									className={`text-xs font-bold cursor-pointer px-2 py-0.5 rounded-full transition-all transform hover:scale-110 ${
										selectedUnit === unit
											? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
											: "bg-white text-gray-700 border border-gray-300 hover:border-indigo-400 hover:text-indigo-600"
									}`}
									onClick={() => handleUnitClick(unit)}
									onDoubleClick={() =>
										handleUnitDoubleClick(unit)
									}
								>
									{unit}
								</div>
							</div>
						))}
					</div>

					{nowMarker && timeUnits.includes(nowMarker) && (
						<div
							className="absolute top-[-10px]"
							style={{
								left: `${
									(timeUnits.indexOf(nowMarker) /
										timeUnits.length) *
									(timeUnits.length * 80)
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
					{actionTimings.map((timing) => {
						const startUnit = timing.startTick;
						const endUnit = timing.endTick;

						const startIndex = timeUnits.indexOf(startUnit);
						const endIndex = timeUnits.indexOf(endUnit);

						const left = startIndex * 80;
						const width = (endIndex - startIndex + 1) * 80;

						const joyImpact =
							timing.action.kind === "business"
								? (timing.action as any).joyImpact.success
								: (timing.action as any).joyImpact;

						const colors = getActionColors(
							joyImpact,
							timing.action.kind,
							selectedUnit === startUnit ||
								selectedUnit === endUnit
						);

						return (
							<div
								key={timing.action.id}
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
													startUnit &&
												Number(selectedUnit) <= endUnit
													? 1
													: 0.7,
											transform:
												Number(selectedUnit) >=
													startUnit &&
												Number(selectedUnit) <= endUnit
													? "scale(1.05)"
													: "scale(1)",
										}}
										onClick={() =>
											handleActionClick(timing.action)
										}
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

			<Dialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
				<DialogContent className="bg-white border-0 shadow-md">
					<DialogHeader>
						<DialogTitle className="text-sm font-bold text-indigo-700">
							Confirm Selection
						</DialogTitle>
						<DialogDescription className="text-xs text-gray-600">
							Are you sure you want to select {unitToConfirm} (
							{unitType}) for planning?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="flex gap-2 mt-2">
						<Button
							variant="outline"
							onClick={() => setConfirmationOpen(false)}
							className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs py-1 h-8"
						>
							Cancel
						</Button>
						<Button
							onClick={handleConfirm}
							className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs py-1 h-8"
						>
							Confirm
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={eventDetailsOpen} onOpenChange={setEventDetailsOpen}>
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
							className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs py-1 h-8"
						>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
