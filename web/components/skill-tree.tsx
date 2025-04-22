"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSelector } from "@xstate/store/react";
import { questStore } from "@/lib/stores/quest-store";
import { getLatestStep, isQuestCompleted } from "@/lib/engine/quests";

import {
	allActionsList,
	initialNodes,
	type Node,
} from "@/lib/engine/skill-tree";
import {
	Sparkles,
	Zap,
	ArrowRight,
	Send,
	Lightbulb,
	Coins,
	TrendingUp,
	DollarSign,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
	TutorialSpot,
	TutorialTrigger,
	TutorialPopoverContent,
	TutorialHighlight,
} from "./tutorial";

export default function SkillTree() {
	const svgRef = useRef<SVGSVGElement>(null);
	const [nodes, setNodes] = useState<Node[]>(initialNodes);
	const [selectedNode, setSelectedNode] = useState<Node | null>(null);
	const [newlyUnlockedActions, setNewlyUnlockedActions] = useState<string[]>(
		[]
	);
	const [showChat, setShowChat] = useState(false);

	const [endPoints, setEndPoints] = useState<number>(0);
	const [initialPrice, setInitialPrice] = useState<number>(0);
	const [repeatedPrice, setRepeatedPrice] = useState<number>(0);

	const router = useRouter();

	// Get state from quest store
	const quest = useSelector(questStore, (s) => s.context);

	const { currentStep } = useMemo(() => {
		const currentStep = getLatestStep(quest);
		return {
			currentStep,
			steps: quest.steps,
		};
	}, [quest]);

	// Reset newlyUnlockedActions when component mounts or when currentStep changes
	useEffect(() => {
		setNewlyUnlockedActions([]);

		if (!currentStep) {
			router.push("/");
			return;
		}

		const activeActions = [
			...currentStep.continuingActions,
			...currentStep.newActions,
		];
		const unlockedActionNames = activeActions.map((action) => action.name);

		const updatedNodes = nodes.map((node) => {
			if (unlockedActionNames.includes(node.actionObject.name)) {
				return { ...node, unlocked: true };
			}
			return node;
		});

		setNodes(updatedNodes);
	}, [currentStep]);

	const unlockSkill = (nodeId: string) => {
		setNodes((prev) => {
			const updatedNodes = prev.map((node) =>
				node.id === nodeId ? { ...node, unlocked: true } : node
			);

			const unlockedNode = updatedNodes.find((n) => n.id === nodeId);
			if (unlockedNode) {
				// Update the action object with the configured values
				const updatedAction = {
					...unlockedNode.actionObject,
					investmentImpact: {
						...unlockedNode.actionObject.investmentImpact,
						initialPrice: initialPrice,
						repeatedPrice: repeatedPrice,
					},
					remainingSteps: endPoints,
				};

				unlockedNode.actionObject = updatedAction;

				// Add to newly unlocked actions
				setNewlyUnlockedActions((prevActions) => {
					return [...prevActions, unlockedNode.actionObject.name];
				});

				// Remove this line as we'll send actions only on confirm
				// questStore.send({
				//     type: "newActions",
				//     newActions: [updatedAction],
				// });
			} else {
				console.warn("⚠️ Node not found:", nodeId);
			}

			return updatedNodes;
		});
	};

	const getCategoryColor = (node: Node) => {
		if (node.actionObject.kind === "investment") return "#f59e0b";
		if (node.actionObject.kind === "income") return "#10b981";
		if (node.actionObject.kind === "expense") return "#ef4444";
		if (node.actionObject.kind === "other") return "#34d399";
		return "#3730a3";
	};

	// Dummy submit handler
	const handleSubmit = () => {
		// Get all unlocked nodes
		const newlyUnlockedNodes = nodes.filter((node) =>
			newlyUnlockedActions.includes(node.actionObject.name)
		);
		const unlockedActions = newlyUnlockedNodes.map(
			(node) => node.actionObject
		);

		console.log("Unlocked actions:", unlockedActions);

		questStore.send({
			type: "newActionsAppend",
			newActions: unlockedActions,
		});

		if (!isQuestCompleted(quest)) {
			router.push("/simulation");
		} else {
			router.push("/quest-end");
		}
	};

	// Function for chat/hint
	const [chatInput, setChatInput] = useState("");
	const [messages, setMessages] = useState<
		{ role: "user" | "assistant"; content: string }[]
	>([]);
	const chatEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const sendHint = async (question = "") => {
		if (!selectedNode) {
			return;
		}

		try {
			let body = JSON.stringify({
				action_name: selectedNode?.actionObject.name,
				actions: allActionsList,
			});

			if (question) {
				body = JSON.stringify({
					action_name: selectedNode?.actionObject.name,
					actions: allActionsList,
					question,
				});
			}

			const response = await fetch("http://192.168.74.18:5000/hint", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body,
			});

			if (response.ok) {
				const data = await response.json();
				const hint =
					data.response ||
					"🔍 Try clicking on a skill node to view more details.";
				setMessages((prev) => [
					...prev,
					{ role: "assistant", content: hint },
				]);
			} else {
				// Fallback in case of response error
				setMessages((prev) => [
					...prev,
					{
						role: "assistant",
						content:
							"🔍 Try clicking on a skill node to view more details.",
					},
				]);
			}
		} catch (error) {
			// Handle any errors and use a fallback hint
			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content:
						"🔍 Try clicking on a skill node to view more details.",
				},
			]);
		} finally {
			setShowChat(true);
		}
	};

	// Draw the D3 skill map
	useEffect(() => {
		if (!svgRef.current) return;

		const width = svgRef.current.clientWidth || 600;
		const height = svgRef.current.clientHeight || 400;

		d3.select(svgRef.current).selectAll("*").remove();

		const svg = d3
			.select(svgRef.current)
			.attr("width", width)
			.attr("height", height)
			.attr("viewBox", `0 0 ${width} ${height}`)
			.attr("style", "max-width: 100%; height: auto;");

		const g = svg.append("g");

		const baseSize = 22;
		const getNodeSize = () => baseSize;

		// Create node groups
		const nodeSelection = g
			.append("g")
			.selectAll("g")
			.data(nodes)
			.join("g")
			.attr("cursor", "pointer")
			.attr("transform", (d) => `translate(${d.x},${d.y})`)
			.on("click", (event, d) => {
				setInitialPrice(0);
				setRepeatedPrice(0);
				setEndPoints(d.actionObject.remainingSteps);
				setSelectedNode(d);
			});

		// Draw the rhombus shape
		nodeSelection
			.append("path")
			.attr("d", (d) => {
				const size = getNodeSize();
				return `M 0,-${size} L ${size},0 L 0,${size} L -${size},0 Z`;
			})
			.attr("fill", (d) => (d.unlocked ? getCategoryColor(d) : "#fff"))
			.attr("stroke", (d) => getCategoryColor(d))
			.attr("stroke-width", (d) => (!d.unlocked ? 3 : 1.5));

		// Append an icon inside each rhombus
		const iconSize = 16;
		nodeSelection
			.append("image")
			.attr("href", (d: Node) => d.icon || "/icons/default-icon.svg")
			.attr("x", -iconSize / 2)
			.attr("y", -iconSize / 2)
			.attr("width", iconSize)
			.attr("height", iconSize);

		// Setup Zoom
		const initialScale = 2.5;
		const initialX = -(width / 2) - 400;
		const initialY = -(height / 2) - 50;

		const zoom = d3
			.zoom()
			.extent([
				[0, 0],
				[width, height],
			])
			.scaleExtent([0.5, 5])
			.on("zoom", (event) => {
				g.attr("transform", event.transform);
			});

		svg.call(zoom as any);

		svg.call(
			zoom.transform as any,
			d3.zoomIdentity.translate(initialX, initialY).scale(initialScale)
		);
	}, [nodes]);

	return (
		<div className="flex flex-col md:flex-row gap-4 p-4 h-full">
			<TutorialSpot marker={{ kind: "actions-choice-container" }}>
				<TutorialHighlight>
					<div className="flex-1">
						<div className="h-full border-0 shadow-md overflow-hidden rounded-md bg-white dark:bg-slate-900">
							<div className="pb-2 pt-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-lg">
								<div className="text-white text-lg flex items-center gap-2 font-semibold">
									<Sparkles className="h-5 w-5" />
									Financial Journey - Step{" "}
									{quest.steps.length}
								</div>
							</div>
							<div className="h-full p-3">
								<div className="overflow-hidden bg-white dark:bg-slate-950 h-full shadow-inner">
									<svg
										ref={svgRef}
										className="w-full h-full"
									></svg>
								</div>
							</div>
						</div>
					</div>
				</TutorialHighlight>
				<TutorialPopoverContent isAdvanceable />
			</TutorialSpot>

			<div className="w-full md:w-80 relative">
				<div className="border-0 shadow-md overflow-hidden rounded-md bg-white dark:bg-slate-900">
					<div className="flex items-start justify-between pb-2 pt-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-lg">
						<div>
							<div className="text-white text-lg flex items-center gap-2 font-semibold">
								<Zap className="h-5 w-5" />
								Skill Details
							</div>
						</div>
						<div className="relative group mt-1">
							<button
								className="w-8 h-8 rounded-full bg-white/20 flex items-center
                  justify-center transition-all duration-300
                  hover:bg-white/30 hover:scale-110 group"
								onClick={() => sendHint()}
							>
								<Lightbulb className="h-5 w-5 text-white group-hover:animate-pulse" />
							</button>
						</div>
					</div>
					<div className="p-4">
						{selectedNode ? (
							<div className="space-y-4">
								<div className="p-3 bg-indigo-50 border-indigo-100">
									<h3 className="font-semibold text-lg text-indigo-800 flex items-center gap-2">
										{selectedNode.actionObject.kind ===
											"investment" && (
											<Coins className="h-5 w-5 text-amber-500" />
										)}
										{selectedNode.actionObject.kind ===
											"income" && (
											<TrendingUp className="h-5 w-5 text-emerald-500" />
										)}
										{selectedNode.actionObject.kind ===
											"expense" && (
											<DollarSign className="h-5 w-5 text-rose-500" />
										)}
										{selectedNode.actionObject.name}
									</h3>
									<p className="text-sm text-indigo-600 mt-1">
										{
											selectedNode.actionObject
												.shortDescription
										}
									</p>
									<div className="mt-2 text-xs font-medium text-indigo-500 bg-indigo-100 px-2 py-1 rounded-full inline-block">
										{selectedNode.actionObject.kind
											.charAt(0)
											.toUpperCase() +
											selectedNode.actionObject.kind.slice(
												1
											)}
									</div>
								</div>
								{!selectedNode.unlocked &&
									!(
										selectedNode.actionObject
											.canChangeInitialPrice ||
										selectedNode.actionObject
											.canChangeRepeatedPrice
									) && (
										<div className="space-y-2 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
											<h4 className="font-medium text-gray-700">
												Impact Details
											</h4>

											{selectedNode.actionObject
												.bankAccountImpact
												?.repeatedAbsoluteDelta !==
												0 && (
												<div className="flex items-center justify-between text-sm">
													<span className="text-gray-600">
														Bank Account Impact:
													</span>
													<span
														className={`font-medium ${
															selectedNode
																.actionObject
																.bankAccountImpact
																.repeatedAbsoluteDelta <
															0
																? "text-red-500"
																: "text-green-500"
														}`}
													>
														{
															selectedNode
																.actionObject
																.bankAccountImpact
																.repeatedAbsoluteDelta
														}{" "}
														BGN
													</span>
												</div>
											)}

											{selectedNode.actionObject.joyImpact
												?.repeatedAbsoluteDelta !==
												0 && (
												<div className="flex items-center justify-between text-sm">
													<span className="text-gray-600">
														Joy Impact:
													</span>
													<span className="font-medium text-purple-500">
														{
															selectedNode
																.actionObject
																.joyImpact
																.repeatedAbsoluteDelta
														}{" "}
														points
													</span>
												</div>
											)}

											{selectedNode.actionObject
												.freeTimeImpact
												?.repeatedAbsoluteDelta !==
												0 && (
												<div className="flex items-center justify-between text-sm">
													<span className="text-gray-600">
														Free Time Impact:
													</span>
													<span
														className={`font-medium ${
															selectedNode
																.actionObject
																.freeTimeImpact
																.repeatedAbsoluteDelta <
															0
																? "text-red-500"
																: "text-green-500"
														}`}
													>
														{
															selectedNode
																.actionObject
																.freeTimeImpact
																.repeatedAbsoluteDelta
														}{" "}
														hours/week
													</span>
												</div>
											)}

											<div className="flex items-center justify-between text-sm">
												<span className="text-gray-600">
													Duration:
												</span>
												<span className="font-medium text-blue-500">
													{selectedNode.actionObject
														.remainingSteps ===
													Infinity
														? "No end date"
														: selectedNode
																.actionObject
																.remainingSteps ===
														  1
														? "Once"
														: `${selectedNode.actionObject.remainingSteps} years`}
												</span>
											</div>
										</div>
									)}

								{/* ----------- Conditional Number Inputs ----------- */}
								{/** Example: show the number fields only if this action requires them */}
								{!selectedNode.unlocked &&
									(selectedNode.actionObject
										.canChangeInitialPrice ||
										selectedNode.actionObject
											.canChangeRepeatedPrice) && (
										<div className="space-y-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
											<h4 className="font-medium text-gray-700">
												Configuration
											</h4>
											{selectedNode.actionObject.kind ===
												"investment" && (
												<div>
													<Label
														htmlFor="ticks"
														className="text-sm text-gray-600"
													>
														Years
													</Label>
													<Input
														id="ticks"
														type="number"
														value={endPoints}
														onChange={(e) =>
															setEndPoints(
																Number(
																	e.target
																		.value
																)
															)
														}
														className="mt-1 focus:ring-indigo-500 focus:border-indigo-500"
													/>
												</div>
											)}
											{selectedNode.actionObject
												.canChangeInitialPrice && (
												<div>
													<Label
														htmlFor="initialPrice"
														className="text-sm text-gray-600"
													>
														Initial Price
													</Label>
													<Input
														id="initialPrice"
														type="number"
														value={initialPrice}
														onChange={(e) =>
															setInitialPrice(
																Number(
																	e.target
																		.value
																)
															)
														}
														className="mt-1 focus:ring-indigo-500 focus:border-indigo-500"
													/>
												</div>
											)}
											{selectedNode.actionObject
												.canChangeRepeatedPrice && (
												<div>
													<Label
														htmlFor="repeatedPrice"
														className="text-sm text-gray-600"
													>
														Repeated Price
													</Label>
													<Input
														id="repeatedPrice"
														type="number"
														value={repeatedPrice}
														onChange={(e) =>
															setRepeatedPrice(
																Number(
																	e.target
																		.value
																)
															)
														}
														className="mt-1 focus:ring-indigo-500 focus:border-indigo-500"
													/>
												</div>
											)}
										</div>
									)}
								{/* ----------- /Conditional Number Inputs ----------- */}

								<div className="space-y-2">
									{!selectedNode.unlocked && (
										<TutorialSpot
											marker={{
												kind: "post-action-button",
											}}
										>
											<TutorialTrigger asChild>
												<Button
													onClick={() =>
														unlockSkill(
															selectedNode.id
														)
													}
													className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white"
												>
													{selectedNode.actionObject
														.kind === "investment"
														? "Invest"
														: selectedNode
																.actionObject
																.kind ===
														  "income"
														? "Work"
														: "Accept Expense"}
													<ArrowRight className="ml-2 h-4 w-4" />
												</Button>
											</TutorialTrigger>
											<TutorialPopoverContent />
										</TutorialSpot>
									)}
								</div>
							</div>
						) : (
							<div className="flex flex-col items-center justify-center h-40 text-center p-4 bg-indigo-50 rounded-lg border border-indigo-100">
								<Zap className="h-10 w-10 text-indigo-400 mb-2" />
								<p className="text-indigo-600 font-medium">
									Click on a skill node to view details
								</p>
								<p className="text-xs text-indigo-500 mt-1">
									Explore the skill tree to unlock new
									abilities
								</p>
							</div>
						)}
					</div>
				</div>

				<div
					className={`fixed inset-0 z-50 flex items-center justify-center ${
						showChat
							? "pointer-events-auto"
							: "pointer-events-none opacity-0"
					}`}
				>
					<div
						className="absolute inset-0 bg-black opacity-50"
						onClick={() => setShowChat(false)}
					></div>
					<div
						className={`w-1/2 relative bg-white dark:bg-slate-900 rounded-md shadow-md transition-all duration-500 ease-in-out transform origin-top overflow-hidden ${
							showChat
								? "opacity-100 scale-y-100 h-96"
								: "opacity-100 scale-y-0 h-0"
						}`}
					>
						<div className="flex flex-col h-full border-0 shadow-md overflow-hidden rounded-md">
							<div className="pb-2 pt-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-lg">
								<div className="text-white text-lg flex items-center gap-2 font-semibold">
									<Lightbulb className="h-5 w-5" />
									Advisor Chat
								</div>
								<div className="text-indigo-100 text-sm">
									Ask for guidance or hints
								</div>
							</div>
							<div className="flex flex-col flex-1 space-y-2 overflow-hidden p-3">
								<div className="flex-1 overflow-y-auto border rounded-md p-2 space-y-2 bg-white dark:bg-slate-900 text-sm shadow-inner">
									{messages.length > 0 ? (
										messages.map((msg, idx) => (
											<div
												key={idx}
												className={`px-3 py-2 rounded-lg max-w-[90%] break-words ${
													msg.role === "user"
														? "ml-auto bg-indigo-500 text-white"
														: "mr-auto bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-200"
												}`}
											>
												{msg.content}
											</div>
										))
									) : (
										<div className="flex flex-col items-center justify-center h-full text-center p-4">
											<p className="text-gray-500 text-sm">
												Ask a question about the
												selected skill
											</p>
										</div>
									)}
									<div ref={chatEndRef} />
								</div>
								<form
									className="flex items-center gap-2 pt-2"
									onSubmit={(e) => {
										e.preventDefault();
										if (!chatInput.trim()) return;
										const input = chatInput.trim();
										setMessages((prev) => [
											...prev,
											{ role: "user", content: input },
										]);
										setChatInput("");
										sendHint(input);
									}}
								>
									<Textarea
										placeholder="Type your question..."
										className="flex-1 resize-none focus:ring-indigo-500 focus:border-indigo-500"
										rows={2}
										value={chatInput}
										onChange={(e) =>
											setChatInput(e.target.value)
										}
										onKeyDown={(e) => {
											if (
												e.key === "Enter" &&
												!e.shiftKey
											) {
												e.preventDefault();
												e.currentTarget.form?.requestSubmit();
											}
										}}
									/>
									<Button
										type="submit"
										className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white"
									>
										<Send className="h-4 w-4" />
									</Button>
								</form>
							</div>
						</div>
					</div>
				</div>

				<div className="absolute bottom-4 right-4">
					<TutorialSpot marker={{ kind: "submit-choice-button" }}>
						<TutorialTrigger asChild>
							<Button
								onClick={handleSubmit}
								className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white shadow-lg px-10 py-8 text-xl font-bold rounded-xl"
							>
								Submit Your Choice
								<ArrowRight className="ml-3 h-6 w-6" />
							</Button>
						</TutorialTrigger>
						<TutorialPopoverContent />
					</TutorialSpot>
				</div>
			</div>
		</div>
	);
}
