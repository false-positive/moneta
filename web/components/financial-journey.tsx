"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, LockKeyholeOpen, HandCoins } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSelector } from "@xstate/store/react";
import { questStore } from "@/lib/stores/quest-store";
import {
	TutorialPopoverContent,
	TutorialSpot,
	TutorialTrigger,
} from "@/components/tutorial";
import { cn } from "@/lib/utils";
import { tutorialStore } from "@/lib/stores/tutorial-store";

interface FinancialJourneyProps {
	timeUnits: (string | number)[];
	onTimePointSelect: (timePoint: number) => void;
}

function JourneyNode({
	timePoint,
	timeUnit,
	point,
	nodeColor,
	nodeIcon,
	onClick,
	ref,
	className,
}: {
	timePoint: number;
	timeUnit: string | number;
	point: [number, number];
	nodeColor: string;
	nodeIcon: React.ReactNode;
	onClick: (e: React.MouseEvent) => void;
	ref?: React.RefObject<HTMLDivElement>;
	className?: string;
}) {
	const [showPopup, setShowPopup] = useState(false);
	const router = useRouter();

	const currentStep = useSelector(
		tutorialStore,
		(state) => state.context.steps[state.context.currentStepIndex]
	);

	// Get current selected timePoint
	const currentTimePoint = useSelector(
		questStore,
		(state) =>
			state.context.steps[state.context.currentStepIndex]?.timePoint
	);

	const isCurrentTimePoint = timePoint === currentTimePoint;

	// Check if this specific node is the current tutorial target
	const isCurrentTutorialNode =
		currentStep?.marker.kind === "journey-node" &&
		"instance" in currentStep.marker &&
		currentStep.marker.instance.timeUnit === timeUnit;

	const handleNodeClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onClick(e);

		// Only route to choices if this is the currently selected timePoint
		if (isCurrentTimePoint) {
			router.push("/choices");
		}
	};

	// HACK: className doesn't work and breaks everything
	className = ""; // :(

	return (
		<motion.div
			key={timePoint}
			className={cn("absolute flex flex-col items-center", className)}
			style={{
				left: `${point[0].toFixed(2)}px`,
				top: `${point[1].toFixed(2)}px`,
				zIndex: isCurrentTutorialNode ? 102 : 50,
			}}
			onClick={handleNodeClick}
			ref={ref}
		>
			<motion.div
				className="relative cursor-pointer"
				whileHover={{ scale: 1.1 }}
				onMouseEnter={() => setShowPopup(true)}
				onMouseLeave={() => setShowPopup(false)}
			>
				<div
					className={cn(
						"w-16 h-16 rounded-full border-4 flex items-center justify-center relative z-10 shadow-lg",
						nodeColor,
						className
					)}
				>
					{nodeIcon}
					<div className="absolute -bottom-8 bg-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
						{timeUnit}
					</div>
				</div>

				{showPopup && (
					<AnimatePresence>
						<motion.div
							initial={{ opacity: 0, y: -30 }}
							animate={{ opacity: 1, y: -110 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.3 }}
							className="absolute left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg z-50"
							onMouseEnter={() => setShowPopup(true)}
							onMouseLeave={(e) => {
								const rect =
									e.currentTarget.getBoundingClientRect();
								const isMovingToNode =
									e.clientY > rect.bottom &&
									Math.abs(
										e.clientX - (rect.left + rect.width / 2)
									) < 40;
								if (!isMovingToNode) {
									setShowPopup(false);
								}
							}}
						>
							<div className="text-sm font-bold whitespace-nowrap">
								Make a Choice
							</div>
							<div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-indigo-600"></div>
						</motion.div>
					</AnimatePresence>
				)}
			</motion.div>
		</motion.div>
	);
}

export function FinancialJourney({
	timeUnits,
	onTimePointSelect,
}: FinancialJourneyProps) {
	const [minWidth, setMinWidth] = useState(0);

	const initialTimePoint = useSelector(
		questStore,
		(state) => state.context.description.initialStep.timePoint
	);

	const timePoints = useMemo(
		() => timeUnits.map((_, index) => initialTimePoint + index),
		[timeUnits, initialTimePoint]
	);

	const pathPoints = useMemo(() => {
		const points: [number, number][] = [[50, 50]];
		const seedRandom = (n: number) => ((Math.sin(n) * 10000) % 1) * 40;

		for (let i = 1; i < timePoints.length; i++) {
			const [prevX, prevY] = points[i - 1];
			const direction = i % 3;

			const newX = prevX + 120 + seedRandom(i * 2);
			let newY = prevY;

			if (direction === 1) newY = prevY + 80 + seedRandom(i * 3);
			else if (direction === 2) newY = prevY - 80 - seedRandom(i * 5);

			points.push([newX, Math.max(50, Math.min(350, newY))]);
		}

		return points;
	}, [timePoints]);

	const pathString = useMemo(() => {
		if (!pathPoints || pathPoints.length < 2) return "";

		let path = `M ${pathPoints[0][0]} ${pathPoints[0][1]}`;

		for (let i = 1; i < pathPoints.length; i++) {
			const [prevX, prevY] = pathPoints[i - 1];
			const [currentX, currentY] = pathPoints[i];

			const controlX = prevX + (currentX - prevX) * 0.5;

			path += ` C ${controlX.toFixed(6)} ${prevY.toFixed(
				6
			)}, ${controlX.toFixed(6)} ${currentY.toFixed(
				6
			)}, ${currentX.toFixed(6)} ${currentY.toFixed(6)}`;
		}

		return path;
	}, [pathPoints]);

	useEffect(() => {
		if (pathPoints.length > 0 && minWidth === 0) {
			setMinWidth(Math.max(...pathPoints.map((p) => p[0])) + 100);
		}
	}, [pathPoints, minWidth]);

	const greatestUnlockedStepIndex = useSelector(
		questStore,
		(state) => state.context.greatestUnlockedStepIndex
	);

	const currentTimePoint = useSelector(
		questStore,
		(state) =>
			state.context.steps[state.context.currentStepIndex]?.timePoint
	);

	const getNodeAppearance = useCallback(
		(timePoint: number) => {
			if (timePoint === currentTimePoint) {
				return {
					color: "bg-purple-500 border-purple-600",
					icon: <HandCoins className="h-5 w-5 text-white" />,
				};
			}

			if (timePoint <= initialTimePoint + greatestUnlockedStepIndex) {
				return {
					color: "bg-indigo-500 border-indigo-600",
					icon: <LockKeyholeOpen className="h-5 w-5 text-white" />,
				};
			}

			return {
				color: "bg-gray-300 border-gray-400",
				icon: <Lock className="h-4 w-4 text-gray-500" />,
			};
		},
		[initialTimePoint, greatestUnlockedStepIndex, currentTimePoint]
	);

	return (
		<div className="relative w-full h-70 overflow-auto bg-gradient-to-b from-indigo-50 to-white rounded-lg">
			<div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-purple-100 opacity-30"></div>
			<div className="absolute bottom-20 right-20 w-16 h-16 rounded-full bg-indigo-100 opacity-30"></div>
			<div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-blue-100 opacity-20"></div>

			<div
				className="relative w-full h-[500px] overflow-auto"
				style={{ minWidth: `${minWidth}px` }}
			>
				<svg
					className="absolute top-0 left-0 w-full h-full"
					style={{ minWidth: `${minWidth}px` }}
				>
					<defs>
						<linearGradient
							id="pathGradient"
							x1="0%"
							y1="0%"
							x2="100%"
							y2="0%"
						>
							<stop offset="0%" stopColor="#8B5CF6" />
							<stop offset="50%" stopColor="#6366F1" />
							<stop offset="100%" stopColor="#EC4899" />
						</linearGradient>
					</defs>

					<path
						d={pathString}
						fill="none"
						stroke="url(#pathGradient)"
						strokeWidth="8"
						strokeLinecap="round"
						strokeDasharray="1, 0"
						className="drop-shadow-md"
					/>

					<path
						d={pathString}
						fill="none"
						stroke="#CBD5E1"
						strokeWidth="8"
						strokeLinecap="round"
						strokeDasharray="1, 15"
						strokeDashoffset="10"
						className="opacity-50"
					/>
				</svg>

				{timePoints.map((timePoint, index) => {
					const point = pathPoints[index];
					const { color, icon } = getNodeAppearance(timePoint);

					const timeUnit = timeUnits[index];

					const numericTimePoint = Number(timePoint);
					console.log(
						"Creating marker for timePoint:",
						numericTimePoint
					);

					return (
						<TutorialSpot
							key={timePoint}
							marker={{
								kind: "journey-node" as const,
								instance: { timeUnit },
							}}
						>
							<TutorialTrigger asChild>
								<JourneyNode
									timePoint={timePoint}
									timeUnit={timeUnit}
									point={point}
									nodeColor={color}
									nodeIcon={icon}
									onClick={() => onTimePointSelect(timePoint)}
								/>
							</TutorialTrigger>
							<TutorialPopoverContent />
						</TutorialSpot>
					);
				})}
			</div>
		</div>
	);
}
