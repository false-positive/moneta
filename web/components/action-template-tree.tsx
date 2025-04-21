"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSelector } from "@xstate/store/react";
import { questStore } from "@/lib/stores/quest-store";
import { getCurrentStep, getLatestStep } from "@/lib/engine/quests";

import {
	allActionsList,
	initialNodes,
	type Node,
} from "@/lib/engine/action-templates-tree";
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
} from "./tutorial";

// D3 Action Template Tree Visualization Component
function ActionTemplateTreeVisualization({
	nodes,
	setSelectedNode,
	getCategoryColor,
}: {
	nodes: Node[];
	setSelectedNode: (node: Node) => void;
	getCategoryColor: (node: Node) => string;
}) {
	const svgRef = useRef<SVGSVGElement>(null);

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
	}, [nodes, setSelectedNode, getCategoryColor]);

	return (
		<div className="overflow-hidden bg-white dark:bg-slate-950 h-full shadow-inner">
			<svg ref={svgRef} className="w-full h-full"></svg>
		</div>
	);
}

// Configuration Panel Component
function ConfigurationPanel({
	node,
	endPoints,
	setEndPoints,
	initialPrice,
	setInitialPrice,
	repeatedPrice,
	setRepeatedPrice,
}: {
	node: Node;
	endPoints: number;
	setEndPoints: (value: number) => void;
	initialPrice: number;
	setInitialPrice: (value: number) => void;
	repeatedPrice: number;
	setRepeatedPrice: (value: number) => void;
}) {
	if (
		!node.actionObject.canChangeInitialPrice &&
		!node.actionObject.canChangeRepeatedPrice
	) {
		return null;
	}

	return (
		<div className="space-y-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
			<h4 className="font-medium text-gray-700">Configuration</h4>
			{node.actionObject.kind === "investment" && (
				<div>
					<Label htmlFor="ticks" className="text-sm text-gray-600">
						Years
					</Label>
					<Input
						id="ticks"
						type="number"
						value={endPoints}
						onChange={(e) => setEndPoints(Number(e.target.value))}
						className="mt-1 focus:ring-indigo-500 focus:border-indigo-500"
					/>
				</div>
			)}
			{node.actionObject.canChangeInitialPrice && (
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
							setInitialPrice(Number(e.target.value))
						}
						className="mt-1 focus:ring-indigo-500 focus:border-indigo-500"
					/>
				</div>
			)}
			{node.actionObject.canChangeRepeatedPrice && (
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
							setRepeatedPrice(Number(e.target.value))
						}
						className="mt-1 focus:ring-indigo-500 focus:border-indigo-500"
					/>
				</div>
			)}
		</div>
	);
}

// Node Details Component
function NodeDetails({
	node,
	unlockActionTemplate,
	endPoints,
	setEndPoints,
	initialPrice,
	setInitialPrice,
	repeatedPrice,
	setRepeatedPrice,
}: {
	node: Node;
	unlockActionTemplate: (id: string) => void;
	endPoints: number;
	setEndPoints: (value: number) => void;
	initialPrice: number;
	setInitialPrice: (value: number) => void;
	repeatedPrice: number;
	setRepeatedPrice: (value: number) => void;
}) {
	return (
		<div className="space-y-4">
			<div className="p-3 bg-indigo-50 border-indigo-100">
				<h3 className="font-semibold text-lg text-indigo-800 flex items-center gap-2">
					{node.actionObject.kind === "investment" && (
						<Coins className="h-5 w-5 text-amber-500" />
					)}
					{node.actionObject.kind === "income" && (
						<TrendingUp className="h-5 w-5 text-emerald-500" />
					)}
					{node.actionObject.kind === "expense" && (
						<DollarSign className="h-5 w-5 text-rose-500" />
					)}
					{node.actionObject.name}
				</h3>
				<p className="text-sm text-indigo-600 mt-1">
					{node.actionObject.shortDescription}
				</p>
				<div className="mt-2 text-xs font-medium text-indigo-500 bg-indigo-100 px-2 py-1 rounded-full inline-block">
					{node.actionObject.kind.charAt(0).toUpperCase() +
						node.actionObject.kind.slice(1)}
				</div>
			</div>

			{!node.unlocked && (
				<ConfigurationPanel
					node={node}
					endPoints={endPoints}
					setEndPoints={setEndPoints}
					initialPrice={initialPrice}
					setInitialPrice={setInitialPrice}
					repeatedPrice={repeatedPrice}
					setRepeatedPrice={setRepeatedPrice}
				/>
			)}

			<div className="space-y-2">
				{!node.unlocked && (
					<Button
						onClick={() => unlockActionTemplate(node.id)}
						className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white"
					>
						{node.actionObject.kind === "investment"
							? "Invest"
							: node.actionObject.kind === "income"
							? "Work"
							: "Accept Expense"}
						<ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				)}
			</div>
		</div>
	);
}

// Chat System Component
function ChatSystem({
	showChat,
	setShowChat,
	messages,
	chatInput,
	setChatInput,
	sendHint,
	setMessages,
}: {
	showChat: boolean;
	setShowChat: (show: boolean) => void;
	messages: Array<{ role: "user" | "assistant"; content: string }>;
	chatInput: string;
	setChatInput: (input: string) => void;
	sendHint: (question?: string) => void;
	setMessages: React.Dispatch<
		React.SetStateAction<
			Array<{ role: "user" | "assistant"; content: string }>
		>
	>;
}) {
	const chatEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	return (
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
										Ask a question about the selected action
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
								onChange={(e) => setChatInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter" && !e.shiftKey) {
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
	);
}

export function ActionTemplateTree() {
	const [nodes, setNodes] = useState<Node[]>(initialNodes);
	const [selectedNode, setSelectedNode] = useState<Node | null>(null);
	const [newlyUnlockedActions, setNewlyUnlockedActions] = useState<string[]>(
		[]
	);
	const [showChat, setShowChat] = useState(false);
	const [endPoints, setEndPoints] = useState<number>(0);
	const [initialPrice, setInitialPrice] = useState<number>(0);
	const [repeatedPrice, setRepeatedPrice] = useState<number>(0);
	const [chatInput, setChatInput] = useState("");
	const [messages, setMessages] = useState<
		Array<{ role: "user" | "assistant"; content: string }>
	>([]);

	const router = useRouter();

	// Get state from quest store
	const currentStep = useSelector(questStore, (state) =>
		getCurrentStep(state.context)
	);
	const questDescription = useSelector(
		questStore,
		(state) => state.context.description
	);

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

	const getCategoryColor = (node: Node) => {
		if (node.actionObject.kind === "investment") return "#f59e0b";
		if (node.actionObject.kind === "income") return "#10b981";
		if (node.actionObject.kind === "expense") return "#ef4444";
		if (node.actionObject.kind === "other") return "#34d399";
		return "#3730a3";
	};

	const handleSubmit = () => {
		const newlyUnlockedNodes = nodes.filter((node) =>
			newlyUnlockedActions.includes(node.actionObject.name)
		);
		const unlockedActions = newlyUnlockedNodes.map(
			(node) => node.actionObject
		);
		questStore.send({
			type: "newActionsAppend",
			newActions: unlockedActions,
		});
		router.push("/simulation");
	};

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
					"🔍 Try clicking on a action node to view more details.";
				setMessages((prev) => [
					...prev,
					{ role: "assistant", content: hint },
				]);
			} else {
				setMessages((prev) => [
					...prev,
					{
						role: "assistant",
						content:
							"🔍 Try clicking on a action node to view more details.",
					},
				]);
			}
		} catch (error) {
			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content:
						"🔍 Try clicking on a action node to view more details.",
				},
			]);
		} finally {
			setShowChat(true);
		}
	};

	return (
		<div className="flex flex-col md:flex-row gap-4 p-4 h-full">
			<div className="flex-1">
				<div className="h-full border-0 shadow-md overflow-hidden rounded-md bg-white dark:bg-slate-900">
					<div className="pb-2 pt-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-lg">
						<div className="text-white text-lg flex items-center gap-2 font-semibold">
							<Sparkles className="h-5 w-5" />
							<span>
								Financial Journey -{" "}
								<span className="capitalize">
									{questDescription.timePointKind}
								</span>{" "}
								{currentStep.timePoint}
							</span>
						</div>
					</div>
					<div className="h-full p-3">
						<ActionTemplateTreeVisualization
							nodes={nodes}
							setSelectedNode={(node) => {
								setInitialPrice(0);
								setRepeatedPrice(0);
								setEndPoints(node.actionObject.remainingSteps);
								setSelectedNode(node);
							}}
							getCategoryColor={getCategoryColor}
						/>
					</div>
				</div>
			</div>

			<div className="w-full md:w-80 relative">
				<div className="border-0 shadow-md overflow-hidden rounded-md bg-white dark:bg-slate-900">
					<div className="flex items-start justify-between pb-2 pt-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-lg">
						<div>
							<div className="text-white text-lg flex items-center gap-2 font-semibold">
								<Zap className="h-5 w-5" />
								Action Details
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
							<NodeDetails
								node={selectedNode}
								unlockActionTemplate={(id) => {
									setNodes((prev) => {
										const updatedNodes = prev.map((node) =>
											node.id === id
												? {
														...node,
														unlocked: true,
														actionObject: {
															...node.actionObject,
															investmentImpact: {
																...node
																	.actionObject
																	.investmentImpact,
																initialPrice,
																repeatedPrice,
															},
															remainingSteps:
																endPoints,
														},
												  }
												: node
										);
										const unlockedNode = updatedNodes.find(
											(n) => n.id === id
										);
										if (unlockedNode) {
											setNewlyUnlockedActions(
												(prevActions) => [
													...prevActions,
													unlockedNode.actionObject
														.name,
												]
											);
										}
										return updatedNodes;
									});
								}}
								endPoints={endPoints}
								setEndPoints={setEndPoints}
								initialPrice={initialPrice}
								setInitialPrice={setInitialPrice}
								repeatedPrice={repeatedPrice}
								setRepeatedPrice={setRepeatedPrice}
							/>
						) : (
							<div className="flex flex-col items-center justify-center h-40 text-center p-4 bg-indigo-50 rounded-lg border border-indigo-100">
								<Zap className="h-10 w-10 text-indigo-400 mb-2" />
								<p className="text-indigo-600 font-medium">
									Click on a action node to view details
								</p>
								<p className="text-xs text-indigo-500 mt-1">
									Explore the action tree to unlock new
									abilities
								</p>
							</div>
						)}
					</div>
				</div>

				<ChatSystem
					showChat={showChat}
					setShowChat={setShowChat}
					messages={messages}
					chatInput={chatInput}
					setChatInput={setChatInput}
					sendHint={sendHint}
					setMessages={setMessages}
				/>

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
