"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	ActionTemplate,
	applyActionTemplate,
	getAction,
} from "@/lib/engine/actions/templates";
import { getCurrentStep } from "@/lib/engine/quests";
import { questStore } from "@/lib/stores/quest-store";
import { useSelector } from "@xstate/store/react";
import * as d3 from "d3";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
	ArrowRight,
	Coins,
	DollarSign,
	Lightbulb,
	Send,
	Sparkles,
	TrendingUp,
	Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
	TutorialPopoverContent,
	TutorialSpot,
	TutorialTrigger,
} from "./tutorial";
import { Action } from "@/lib/engine/actions";

// D3 Action Template Tree Visualization Component
function ActionTemplateTreeVisualization({
	templates,
	setSelectedTemplate,
	appliedActionTemplateIds,
}: {
	templates: ReadonlyArray<ActionTemplate>;
	setSelectedTemplate: (template: ActionTemplate) => void;
	appliedActionTemplateIds: Set<number>;
}) {
	const svgRef = useRef<SVGSVGElement>(null);

	const wasApplied = useCallback(
		(template: ActionTemplate) => {
			console.log(template.id, appliedActionTemplateIds.has(template.id));
			return appliedActionTemplateIds.has(template.id);
		},
		[appliedActionTemplateIds]
	);

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
			.data(templates)
			.join("g")
			.attr("cursor", "pointer")
			.attr(
				"transform",
				(d) =>
					`translate(${d.hardcodedPosition.x},${d.hardcodedPosition.y})`
			)
			.on("click", (event, d) => {
				setSelectedTemplate(d);
			});

		// Draw the rhombus shape
		nodeSelection
			.append("path")
			.attr("d", (d) => {
				const size = getNodeSize();
				return `M 0,-${size} L ${size},0 L 0,${size} L -${size},0 Z`;
			})
			.attr("fill", (d) => (wasApplied(d) ? getCategoryColor(d) : "#fff"))
			.attr("stroke", (d) => getCategoryColor(d))
			.attr("stroke-width", (d) => (wasApplied(d) ? 3 : 1.5));

		// Append an icon inside each rhombus
		const iconSize = 16;
		nodeSelection
			.append("image")
			.attr("href", (d) => d.iconImageHref)
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

		// TODO(tech-debt): Fix d3 type assertions - d3-zoom types need to be properly imported and used
		svg.call(zoom as any);

		svg.call(
			// TODO(tech-debt): Fix d3 type assertions - d3-zoom types need to be properly imported and used
			zoom.transform as any,
			d3.zoomIdentity.translate(initialX, initialY).scale(initialScale)
		);
	}, [templates, setSelectedTemplate, wasApplied]);

	return (
		<div className="overflow-hidden bg-white dark:bg-slate-950 h-full shadow-inner">
			<svg ref={svgRef} className="w-full h-full"></svg>
		</div>
	);
}

// Configuration Panel Component
function ConfigurationPanel({
	template,
	endPoints,
	setEndPoints,
	initialPrice,
	setInitialPrice,
	repeatedPrice,
	setRepeatedPrice,
}: {
	template: ActionTemplate;
	endPoints: number;
	setEndPoints: (value: number) => void;
	initialPrice: number;
	setInitialPrice: (value: number) => void;
	repeatedPrice: number;
	setRepeatedPrice: (value: number) => void;
}) {
	// TODO(tech-debt): Fix this pattern of getting action from template - it's a hack that needs proper typing
	const action =
		template.templateKind === "constant"
			? template.action
			: template.initialAction;

	if (!action.canChangeInitialPrice && !action.canChangeRepeatedPrice) {
		return null;
	}

	return (
		<div className="space-y-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
			<h4 className="font-medium text-gray-700">Configuration</h4>
			{action.kind === "investment" && (
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
			{action.canChangeInitialPrice && (
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
			{action.canChangeRepeatedPrice && (
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
	template,
	onActionTemplateChosen,
	endPoints,
	setEndPoints,
	initialPrice,
	setInitialPrice,
	repeatedPrice,
	setRepeatedPrice,
	wasApplied,
}: {
	template: ActionTemplate;
	onActionTemplateChosen: (actionTemplate: ActionTemplate) => void;
	endPoints: number;
	setEndPoints: (value: number) => void;
	initialPrice: number;
	setInitialPrice: (value: number) => void;
	repeatedPrice: number;
	setRepeatedPrice: (value: number) => void;
	wasApplied: boolean;
}) {
	return (
		<div className="space-y-4">
			<div className="p-3 bg-indigo-50 border-indigo-100">
				<h3 className="font-semibold text-lg text-indigo-800 flex items-center gap-2">
					{getAction(template).kind === "investment" && (
						<Coins className="h-5 w-5 text-amber-500" />
					)}
					{getAction(template).kind === "income" && (
						<TrendingUp className="h-5 w-5 text-emerald-500" />
					)}
					{getAction(template).kind === "expense" && (
						<DollarSign className="h-5 w-5 text-rose-500" />
					)}
					{getAction(template).name}
				</h3>
				<p className="text-sm text-indigo-600 mt-1">
					{getAction(template).shortDescription}
				</p>
				<div className="mt-2 text-xs font-medium text-indigo-500 bg-indigo-100 px-2 py-1 rounded-full inline-block">
					{getAction(template).kind.charAt(0).toUpperCase() +
						getAction(template).kind.slice(1)}
				</div>
			</div>

			{!wasApplied && (
				<ConfigurationPanel
					template={template}
					endPoints={endPoints}
					setEndPoints={setEndPoints}
					initialPrice={initialPrice}
					setInitialPrice={setInitialPrice}
					repeatedPrice={repeatedPrice}
					setRepeatedPrice={setRepeatedPrice}
				/>
			)}

			<div className="space-y-2">
				{!wasApplied && (
					<Button
						onClick={() => onActionTemplateChosen(template)}
						className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white"
					>
						{getAction(template).kind === "investment"
							? "Invest"
							: getAction(template).kind === "income"
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
	sendHint,
	setMessages,
}: {
	showChat: boolean;
	setShowChat: (show: boolean) => void;
	messages: Array<{ role: "user" | "assistant"; content: string }>;
	sendHint: (question?: string) => void;
	setMessages: React.Dispatch<
		React.SetStateAction<
			Array<{ role: "user" | "assistant"; content: string }>
		>
	>;
}) {
	const [chatInput, setChatInput] = useState("");

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
	const [selectedTemplate, setSelectedTemplate] =
		useState<ActionTemplate | null>(null);
	const [newActions, setNewActions] = useState<Action[]>([]);

	const [showChat, setShowChat] = useState(false);
	const [messages, setMessages] = useState<
		Array<{ role: "user" | "assistant"; content: string }>
	>([]);

	// TODO(tech-debt): These should be removed soon and replaced with the configurable action template's own schema
	const [endPoints, setEndPoints] = useState<number>(0);
	const [initialPrice, setInitialPrice] = useState<number>(0);
	const [repeatedPrice, setRepeatedPrice] = useState<number>(0);

	const router = useRouter();

	// Get state from quest store
	const currentStep = useSelector(questStore, (state) =>
		getCurrentStep(state.context)
	);
	const questDescription = useSelector(
		questStore,
		(state) => state.context.description
	);

	const appliedActionTemplateIds = useMemo(
		() =>
			new Set(
				newActions
					.filter((a) => a.templateId)
					.map((a): number => a.templateId!)
			),
		[newActions]
	);

	console.log(appliedActionTemplateIds);

	const handleActionTemplateChosen = (actionTemplate: ActionTemplate) => {
		const action = applyActionTemplate(actionTemplate, {
			remainingSteps: endPoints,
			initialPrice,
			repeatedPrice,
		});
		setNewActions([...newActions, action]);

		setSelectedTemplate(null);
		setEndPoints(0);
		setInitialPrice(0);
		setRepeatedPrice(0);
	};

	const handleSubmit = () => {
		questStore.send({
			type: "newActionsAppend",
			newActions,
		});
		router.push("/simulation");
	};

	const sendHint = async (question = "") => {
		if (!selectedTemplate) {
			return;
		}

		try {
			const { name } = getAction(selectedTemplate);

			let body = JSON.stringify({
				action_name: name,
				actions: questDescription.actionTemplates.map(getAction),
			});

			if (question) {
				body = JSON.stringify({
					action_name: name,
					actions: questDescription.actionTemplates.map(getAction),
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
					"🔍 Try clicking on an action node to view more details.";
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
							"🔍 Try clicking on an action node to view more details.",
					},
				]);
			}
		} catch (error) {
			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content:
						"🔍 Try clicking on an action node to view more details.",
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
							templates={questDescription.actionTemplates}
							setSelectedTemplate={setSelectedTemplate}
							appliedActionTemplateIds={appliedActionTemplateIds}
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
						{selectedTemplate ? (
							<NodeDetails
								template={selectedTemplate}
								onActionTemplateChosen={
									handleActionTemplateChosen
								}
								endPoints={endPoints}
								setEndPoints={setEndPoints}
								initialPrice={initialPrice}
								setInitialPrice={setInitialPrice}
								repeatedPrice={repeatedPrice}
								setRepeatedPrice={setRepeatedPrice}
								wasApplied={appliedActionTemplateIds.has(
									selectedTemplate.id
								)}
							/>
						) : (
							<div className="flex flex-col items-center justify-center h-40 text-center p-4 bg-indigo-50 rounded-lg border border-indigo-100">
								<Zap className="h-10 w-10 text-indigo-400 mb-2" />
								<p className="text-indigo-600 font-medium">
									Click on an action node to view details
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

function getCategoryColor(template: ActionTemplate) {
	const action = getAction(template);

	if (action.kind === "investment") return "#f59e0b";
	if (action.kind === "income") return "#10b981";
	if (action.kind === "expense") return "#ef4444";
	if (action.kind === "other") return "#34d399";
	return "#3730a3";
}
