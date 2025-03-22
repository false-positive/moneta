"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { allActionsList, initialNodes, Node } from "@/lib/cases/skill-tree";
import { Info } from "lucide-react";
import { computeNextStep, Step } from "@/lib/cases/actions";
import SuperJSON from "superjson";
import { lifeAction } from "@/lib/cases/standard-actions";
import invariant from "tiny-invariant";

export default function SkillTree() {
	const svgRef = useRef<SVGSVGElement>(null);
	const stepsRef = useRef<Step[]>([]);
	const [nodes, setNodes] = useState<Node[]>(initialNodes);
	const [selectedNode, setSelectedNode] = useState<Node | null>(null);
	const [newlyUnlockedActions, setNewlyUnlockedActions] = useState<string[]>(
		[]
	);
	const [showChat, setShowChat] = useState(false);

	// Example local states for two number inputs
	const [ticks, setTicks] = useState<number>(0);
	const [initialPrice, setInitialPrice] = useState<number>(0);
	const [repeatedPrice, setRepeatedPrice] = useState<number>(0);

	useEffect(() => {
		const storedSteps = localStorage.getItem("steps");
		const parsedSteps: Step[] = SuperJSON.parse(storedSteps || "[]");

		if (parsedSteps && parsedSteps.length > 0) {
			stepsRef.current = parsedSteps;
		} else {
			window.location.href = "/";
		}

		console.log(">>>", stepsRef.current);

		const currentStep = stepsRef.current[stepsRef.current.length - 1];
		const activeActions = [
			...currentStep.oldActiveActions,
			...currentStep.newActions,
		];
		const unlockedActionNames = activeActions.map((action) => action.name);

		console.log(">>>", { unlockedActionNames });

		const updatedNodes = nodes.map((node) => {
			if (unlockedActionNames.includes(node.actionObject.name)) {
				return { ...node, unlocked: true };
			}
			return node;
		});

		console.log(">>>", { updatedNodes });

		setNodes(updatedNodes);
	}, []);

	// Unlock skill
	const unlockSkill = (nodeId: string) => {
		setNodes((prev) => {
			const updatedNodes = prev.map((node) =>
				node.id === nodeId ? { ...node, unlocked: true } : node
			);

			// Update selectedNode if needed
			if (selectedNode && selectedNode.id === nodeId) {
				setSelectedNode(
					updatedNodes.find((node) => node.id === nodeId) || null
				);
			}

			// Add to newly unlocked actions
			const unlockedNode = updatedNodes.find((n) => n.id === nodeId);
			if (unlockedNode) {
				unlockedNode.actionObject.investmentImpact.initialPrice =
					initialPrice;
				unlockedNode.actionObject.investmentImpact.repeatedPrice =
					repeatedPrice;
				unlockedNode.actionObject.remainingTicks = ticks;

				setNewlyUnlockedActions((prevActions) => [
					...prevActions,
					unlockedNode.actionObject.name,
				]);
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

		const nextStep = computeNextStep(
			stepsRef.current[stepsRef.current.length - 1],
			unlockedActions,
			"year"
		);

		stepsRef.current.push(nextStep);
		localStorage.setItem("steps", SuperJSON.stringify(stepsRef.current));

		window.location.reload();
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

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/hint`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body,
				}
			);

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
				setTicks(d.actionObject.remainingTicks);
				setSelectedNode(d);
			});

		// Draw the rhombus shape
		nodeSelection
			.append("path")
			.attr("d", (d) => {
				const size = getNodeSize(d);
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
			zoom.transform,
			d3.zoomIdentity.translate(initialX, initialY).scale(initialScale)
		);
	}, [nodes]);

	return (
		<div className="flex flex-col md:flex-row gap-4 p-4 h-full">
			<div className="flex-1">
				<Card className="h-full">
					<CardHeader>
						<CardTitle>Year {stepsRef.current.length}</CardTitle>
					</CardHeader>
					<CardContent className="h-full">
						<div className="border rounded-md overflow-hidden bg-slate-50 dark:bg-slate-950 h-full">
							<svg ref={svgRef} className="w-full h-full"></svg>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* The details container */}
			<div className="w-full md:w-80 relative">
				<Card>
					<CardHeader className="flex items-start justify-between">
						<div>
							<CardTitle>Skill Details</CardTitle>
							<CardDescription>
								Select a skill to view details
							</CardDescription>
						</div>
						<div className="relative group mt-1">
							<button
								className="w-7 h-7 rounded-full bg-black/80 flex items-center
                  justify-center transition-all duration-300
                  hover:bg-black hover:scale-110 group"
								onClick={() => sendHint()}
							>
								<Info className="h-6 w-6 text-white group-hover:animate-pulse" />
							</button>
						</div>
					</CardHeader>
					<CardContent>
						{selectedNode ? (
							<div className="space-y-4">
								<div>
									<h3 className="font-semibold text-lg">
										{selectedNode.actionObject.name}
									</h3>
									<p className="text-sm text-muted-foreground">
										{
											selectedNode.actionObject
												.shortDescription
										}
									</p>
								</div>

								{/* ----------- Conditional Number Inputs ----------- */}
								{/** Example: show the number fields only if this action requires them */}
								{!selectedNode.unlocked && (
									<div className="space-y-2">
										{selectedNode.actionObject.kind ===
											"investment" && (
											<div>
												<Label htmlFor="ticks">
													Years
												</Label>
												<Input
													id="ticks"
													type="number"
													value={ticks}
													onChange={(e) =>
														setTicks(
															Number(
																e.target.value
															)
														)
													}
												/>
											</div>
										)}
										{selectedNode.actionObject
											.canChangeInitialPrice && (
											<div>
												<Label htmlFor="initialPrice">
													Initial Price
												</Label>
												<Input
													id="initialPrice"
													type="number"
													value={initialPrice}
													onChange={(e) =>
														setInitialPrice(
															Number(
																e.target.value
															)
														)
													}
												/>
											</div>
										)}
										{selectedNode.actionObject
											.canChangeRepeatedPrice && (
											<div>
												<Label htmlFor="repeatedPrice">
													Repeated Price
												</Label>
												<Input
													id="repeatedPrice"
													type="number"
													value={repeatedPrice}
													onChange={(e) =>
														setRepeatedPrice(
															Number(
																e.target.value
															)
														)
													}
												/>
											</div>
										)}
									</div>
								)}
								{/* ----------- /Conditional Number Inputs ----------- */}

								<div className="space-y-2">
									{!selectedNode.unlocked && (
										<Button
											onClick={() =>
												unlockSkill(selectedNode.id)
											}
											className="w-full"
										>
											{selectedNode.actionObject.kind ===
											"investment"
												? "Invest"
												: selectedNode.actionObject
														.kind === "income"
												? "Work"
												: "Accept Expense"}
										</Button>
									)}
								</div>
							</div>
						) : (
							<p className="text-muted-foreground">
								Click on a skill node to view details
							</p>
						)}
					</CardContent>
				</Card>

				{/* Expandable Chat */}
				<div
					className={`mt-4 transition-all duration-500 ease-in-out transform origin-top overflow-hidden
          ${
				showChat
					? "opacity-100 scale-y-100 h-96"
					: "opacity-0 scale-y-0 h-0"
			}`}
				>
					<Card className="flex flex-col h-full">
						<CardHeader>
							<CardTitle>Chat</CardTitle>
							<CardDescription>
								Ask for guidance or hints
							</CardDescription>
						</CardHeader>

						<CardContent className="flex flex-col flex-1 space-y-2 overflow-hidden">
							{/* Message list */}
							<div className="flex-1 overflow-y-auto border rounded-md p-2 space-y-2 bg-slate-50 dark:bg-slate-900 text-sm">
								{messages.map((msg, idx) => (
									<div
										key={idx}
										className={`px-2 py-1 rounded-md max-w-[90%] break-words ${
											msg.role === "user"
												? "ml-auto bg-blue-500 text-white"
												: "mr-auto bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
										}`}
									>
										{msg.content}
									</div>
								))}
								<div ref={chatEndRef} />
							</div>

							{/* Input area */}
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
									className="flex-1 resize-none"
									rows={2}
									value={chatInput}
									onChange={(e) =>
										setChatInput(e.target.value)
									}
									onKeyDown={(e) => {
										if (e.key === "Enter" && !e.shiftKey) {
											e.preventDefault();
											e.currentTarget.form?.requestSubmit();
										}
									}}
								/>
								<Button type="submit">Send</Button>
							</form>
						</CardContent>
					</Card>
				</div>

				{/* Submit button at the bottom-right */}
				<div className="absolute bottom-4 right-4">
					<Button onClick={handleSubmit}>Submit</Button>
				</div>
			</div>
		</div>
	);
}
