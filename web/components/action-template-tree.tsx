"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSelector } from "@xstate/store/react";
import { questStore } from "@/lib/stores/quest-store";
import { getLatestStep, type Quest } from "@/lib/engine/quests";

import {
	allActionsList,
	initialNodes,
	type Node,
} from "@/lib/engine/action-template-tree";
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
			</div>

			<ConfigurationPanel
				node={node}
				endPoints={endPoints}
				setEndPoints={setEndPoints}
				initialPrice={initialPrice}
				setInitialPrice={setInitialPrice}
				repeatedPrice={repeatedPrice}
				setRepeatedPrice={setRepeatedPrice}
			/>

			{!node.unlocked && (
				<Button
					className="w-full"
					onClick={() => unlockActionTemplate(node.id)}
				>
					<Sparkles className="h-4 w-4 mr-2" />
					Unlock Action Template
				</Button>
			)}
		</div>
	);
}

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
	const handleSubmit = () => {
		if (!chatInput.trim()) return;

		setMessages((prev) => [...prev, { role: "user", content: chatInput }]);
		sendHint(chatInput);
		setChatInput("");
	};

	return (
		<div
			className={`fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-lg transition-transform duration-300 transform ${
				showChat ? "translate-y-0" : "translate-y-[calc(100%-3rem)]"
			}`}
		>
			<div
				className="p-3 bg-indigo-600 text-white rounded-t-lg cursor-pointer flex items-center justify-between"
				onClick={() => setShowChat(!showChat)}
			>
				<div className="flex items-center">
					<Lightbulb className="h-5 w-5 mr-2" />
					Ask a question about the selected action template
				</div>
				<Zap className="h-5 w-5" />
			</div>

			<div
				className={`transition-all duration-300 ${
					showChat ? "max-h-96" : "max-h-0"
				} overflow-hidden`}
			>
				<div className="p-4 h-64 overflow-y-auto space-y-4">
					{messages.map((message, index) => (
						<div
							key={index}
							className={`p-2 rounded-lg ${
								message.role === "assistant"
									? "bg-indigo-50 text-indigo-700"
									: "bg-gray-100 text-gray-700"
							}`}
						>
							{message.content}
						</div>
					))}
				</div>

				<div className="p-4 border-t">
					<div className="flex gap-2">
						<Textarea
							value={chatInput}
							onChange={(e) => setChatInput(e.target.value)}
							placeholder="Ask about this action template..."
							className="flex-grow"
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleSubmit();
								}
							}}
						/>
						<Button
							onClick={handleSubmit}
							className="self-end"
							disabled={!chatInput.trim()}
						>
							<Send className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

// Main ActionTemplateTree Component (refactored)
export default function ActionTemplateTree() {
	const router = useRouter();
	const [selectedNode, setSelectedNode] = useState<Node | null>(null);
	const [endPoints, setEndPoints] = useState(1);
	const [initialPrice, setInitialPrice] = useState(0);
	const [repeatedPrice, setRepeatedPrice] = useState(0);
	const [showChat, setShowChat] = useState(false);
	const [chatInput, setChatInput] = useState("");
	const [messages, setMessages] = useState<
		Array<{ role: "user" | "assistant"; content: string }>
	>([]);

	const quest = useSelector(questStore, (state) => state.context);
	const latestStep = useMemo(() => getLatestStep(quest), [quest]);

	const [nodes, setNodes] = useState(initialNodes);

	const getCategoryColor = (node: Node) => {
		switch (node.actionObject.kind) {
			case "investment":
				return "#f59e0b";
			case "income":
				return "#10b981";
			case "expense":
				return "#ef4444";
			default:
				return "#6366f1";
		}
	};

	const handleSubmit = () => {
		if (!selectedNode) return;

		const action = {
			...selectedNode.actionObject,
			remainingSteps: endPoints,
		} as any;

		if (selectedNode.actionObject.canChangeInitialPrice) {
			action.initialPrice = initialPrice;
		}

		if (selectedNode.actionObject.canChangeRepeatedPrice) {
			action.repeatedPrice = repeatedPrice;
		}

		questStore.send({
			type: "newActionsAppend",
			newActions: [action],
		});

		router.push("/simulation");
	};

	const sendHint = async (question = "") => {
		if (!selectedNode) return;

		const systemMessage = `You are an AI assistant helping users understand financial concepts and actions in a financial simulation game. The user is asking about the "${selectedNode.actionObject.name}" action. Here's the action's description: "${selectedNode.actionObject.llmDescription}"`;

		setMessages((prev) => [
			...prev,
			{
				role: "assistant",
				content:
					"I'm processing your question about " +
					selectedNode.actionObject.name +
					"...",
			},
		]);

		try {
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					messages: [
						{
							role: "system",
							content: systemMessage,
						},
						{
							role: "user",
							content:
								question ||
								"Tell me about this action and when I should use it.",
						},
					],
				}),
			});

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			const data = await response.json();

			setMessages((prev) => {
				// Remove the loading message
				const newMessages = prev.slice(0, -1);
				return [
					...newMessages,
					{
						role: "assistant",
						content: data.content,
					},
				];
			});
		} catch (error) {
			console.error("Error:", error);
			setMessages((prev) => {
				// Remove the loading message
				const newMessages = prev.slice(0, -1);
				return [
					...newMessages,
					{
						role: "assistant",
						content:
							"I apologize, but I encountered an error while processing your request. Please try again later.",
					},
				];
			});
		}
	};

	const unlockActionTemplate = (id: string) => {
		setNodes((prevNodes) =>
			prevNodes.map((node) =>
				node.id === id ? { ...node, unlocked: true } : node
			)
		);
	};

	return (
		<div className="flex h-screen">
			{/* Left Panel */}
			<div className="w-1/4 p-4 border-r bg-gray-50">
				<div className="space-y-4">
					<h2 className="text-2xl font-bold text-gray-800">
						Action Templates
					</h2>
					<p className="text-gray-600">
						Explore available action templates and their effects on
						your financial journey.
					</p>

					{selectedNode ? (
						<NodeDetails
							node={selectedNode}
							unlockActionTemplate={unlockActionTemplate}
							endPoints={endPoints}
							setEndPoints={setEndPoints}
							initialPrice={initialPrice}
							setInitialPrice={setInitialPrice}
							repeatedPrice={repeatedPrice}
							setRepeatedPrice={setRepeatedPrice}
						/>
					) : (
						<TutorialSpot
							marker={{ kind: "action-template-tree-click" }}
						>
							<div className="p-4 text-center text-gray-500 border-2 border-dashed rounded-lg">
								<TutorialTrigger>
									<TutorialPopoverContent>
										🔍 Try clicking on an action template
										node to view more details.
									</TutorialPopoverContent>
								</TutorialTrigger>
								Click on an action template node to view details
							</div>
						</TutorialSpot>
					)}

					{selectedNode?.unlocked && (
						<TutorialSpot
							marker={{ kind: "action-template-tree-start" }}
						>
							<Button className="w-full" onClick={handleSubmit}>
								<TutorialTrigger>
									<TutorialPopoverContent>
										🔍 Try clicking on an action template
										node to view more details.
									</TutorialPopoverContent>
								</TutorialTrigger>
								Start <ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</TutorialSpot>
					)}
				</div>
			</div>

			{/* Main Visualization Area */}
			<div className="flex-1 relative">
				<TutorialSpot marker={{ kind: "action-template-tree-explore" }}>
					<TutorialTrigger>
						<TutorialPopoverContent>
							🔍 Try clicking on an action template node to view
							more details.
						</TutorialPopoverContent>
					</TutorialTrigger>
					<ActionTemplateTreeVisualization
						nodes={nodes}
						setSelectedNode={setSelectedNode}
						getCategoryColor={getCategoryColor}
					/>
				</TutorialSpot>

				<div className="absolute bottom-4 left-4">
					<p className="text-sm text-gray-500">
						Explore the action template tree to unlock new
						possibilities
					</p>
				</div>
			</div>

			{selectedNode && (
				<ChatSystem
					showChat={showChat}
					setShowChat={setShowChat}
					messages={messages}
					chatInput={chatInput}
					setChatInput={setChatInput}
					sendHint={sendHint}
					setMessages={setMessages}
				/>
			)}
		</div>
	);
}
