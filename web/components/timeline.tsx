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
import { Action, Step } from "@/lib/cases/actions";

export interface ActionTiming {
	action: Action;
	startTick: number;
	endTick: number;
}

export interface TimelineProps {
	timeUnits: (string | number)[];
	steps: number[];
	selectedUnit: string | number;
	nowMarker?: string | number;
	unitType: "month" | "year";
	onUnitClick: (unit: string | number) => void;
	actionTimings: ActionTiming[];
}

const getActionColors = (joyValue: number) => {
	if (joyValue > 0) {
		return "bg-[#e6f9e6] border-[#58CC02] text-[#58CC02]";
	}
	return "bg-[#ffebeb] border-[#ff4b4b] text-[#ff4b4b]";
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
		null,
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
			<div className="min-w-[800px] mb-2">
				<div className="relative mb-6">
					<div
						className="h-0.5 bg-[#3c3c3c] absolute top-4"
						style={{ width: `${timeUnits.length * 100}px` }}
					/>

					<div
						className="flex"
						style={{ width: `${timeUnits.length * 100}px` }}
					>
						{timeUnits.map((unit) => (
							<div
								key={String(unit)}
								className="flex flex-col items-center"
								style={{ width: "100px", flexShrink: 0 }}
							>
								<div className="h-3 w-0.5 bg-[#3c3c3c] mb-1" />
								<div
									className={`text-sm font-medium cursor-pointer px-2 py-1 rounded-full ${
										selectedUnit === unit
											? "bg-[#58CC02] text-white"
											: "text-[#3c3c3c] hover:bg-[#e6f9e6]"
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
							className="absolute top-[-12px]"
							style={{
								left: `${
									(timeUnits.indexOf(nowMarker) /
										timeUnits.length) *
									(timeUnits.length * 100)
								}px`,
							}}
						>
							<div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[12px] border-l-transparent border-r-transparent border-b-[#6b46c1]" />
						</div>
					)}
				</div>

				<div
					className="space-y-4"
					style={{ width: `${timeUnits.length * 100}px` }}
				>
					{actionTimings.map((timing) => {
						const startUnit = timing.startTick;
						const endUnit = timing.endTick;

						const startIndex = timeUnits.indexOf(startUnit);
						const endIndex = timeUnits.indexOf(endUnit);

						const left = startIndex * 100;
						const width = (endIndex - startIndex + 1) * 100;

						return (
							<div
								key={timing.action.id}
								className="flex items-center"
							>
								<div className="w-8 flex-shrink-0"></div>
								<div className="flex-1 relative h-8 p-2">
									<div
										className={`absolute h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium transition-all cursor-pointer hover:shadow-md overflow-hidden ${(() => {
											const joyImpact =
												timing.action.kind ===
												"business"
													? (timing.action as any)
															.joyImpact.success
													: (timing.action as any)
															.joyImpact;
											return getActionColors(joyImpact);
										})()}`}
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
										<span className="text-center whitespace-nowrap overflow-hidden text-ellipsis px-2">
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
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirm your choice</DialogTitle>
						<DialogDescription>
							Are you sure you want to select {unitToConfirm} (
							{unitType})?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="flex gap-2 mt-4">
						<Button
							variant="outline"
							onClick={() => setConfirmationOpen(false)}
						>
							Cancel
						</Button>
						<Button
							onClick={handleConfirm}
							className="bg-[#58CC02] hover:bg-[#4bac00]"
						>
							Confirm
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={eventDetailsOpen} onOpenChange={setEventDetailsOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="text-[#6b46c1]">
							{selectedAction?.name}
						</DialogTitle>
						<DialogDescription>
							{selectedAction?.shortDescription}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button onClick={() => setEventDetailsOpen(false)}>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
