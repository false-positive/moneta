"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

import { Action } from "@/lib/engine/actions";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
	TutorialHighlight,
	TutorialPopoverContent,
	TutorialSpot,
	TutorialTrigger,
} from "./tutorial";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "./ui/form";

// D3 Action Template Tree Visualization Component with React Integration
function ActionTemplateTreeVisualization({
	templates,
	setSelectedTemplate,
	appliedActionTemplateIds,
}: {
	templates: ReadonlyArray<ActionTemplate>;
	setSelectedTemplate: (template: ActionTemplate) => void;
	appliedActionTemplateIds: Set<number>;
}) {
	const quest = useSelector(questStore, (state) => state.context);
	const svgRef = useRef<SVGSVGElement>(null);
	const [transform, setTransform] = useState<d3.ZoomTransform>(
		d3.zoomIdentity
	);

	// Memoize wasApplied check for performance
	const wasApplied = useCallback(
		(template: ActionTemplate) => appliedActionTemplateIds.has(template.id),
		[appliedActionTemplateIds]
	);

	// Constants for node sizing and styling
	const baseSize = 22;
	const iconSize = 16;
	const initialScale = 2.5;

	// Generate rhombus path for nodes
	const getRhombusPath = useCallback((size: number) => {
		return `M 0,-${size} L ${size},0 L 0,${size} L -${size},0 Z`;
	}, []);

	// Setup zoom behavior
	useEffect(() => {
		if (!svgRef.current) return;

		const width = svgRef.current.clientWidth || 600;
		const height = svgRef.current.clientHeight || 400;
		const initialX = -(width / 2) - 400;
		const initialY = -(height / 2) - 50;

		const zoom = d3
			.zoom<SVGSVGElement, unknown>()
			.extent([
				[0, 0],
				[width, height],
			])
			.scaleExtent([0.5, 5])
			.on("zoom", (event) => {
				setTransform(event.transform);
			});

		const svg = d3.select(svgRef.current);
		svg.call(zoom);
		svg.call(
			zoom.transform,
			d3.zoomIdentity.translate(initialX, initialY).scale(initialScale)
		);

		// Set initial SVG attributes
		svg.attr("width", width)
			.attr("height", height)
			.attr("viewBox", `0 0 ${width} ${height}`)
			.attr("style", "max-width: 100%; height: auto;");
	}, []);

	// Node component with Radix UI integration
	const Node = useCallback(
		({ template }: { template: ActionTemplate }) => {
			const isUnlocked = template.isUnlocked(quest);
			const isApplied = wasApplied(template);
			const color = getCategoryColor(template);

			// Handle click events, preventing propagation to parent elements
			const handleClick = (e: React.MouseEvent) => {
				e.stopPropagation();
				if (isUnlocked) {
					setSelectedTemplate(template);
				}
			};

			return (
				<g
					transform={`translate(${template.hardcodedPosition.x},${template.hardcodedPosition.y})`}
					style={{ cursor: isUnlocked ? "pointer" : "not-allowed" }}
					onClick={handleClick}
				>
					{/* Rhombus shape */}
					<path
						d={getRhombusPath(baseSize)}
						fill={
							!isUnlocked ? "#f1f5f9" : isApplied ? color : "#fff"
						}
						stroke={!isUnlocked ? "#94a3b8" : color}
						strokeWidth={!isUnlocked ? 1 : isApplied ? 3 : 1.5}
						opacity={isUnlocked ? 1 : 0.7}
					/>

					{/* Icon */}
					<image
						href={template.iconImageHref}
						x={-iconSize / 2}
						y={-iconSize / 2}
						width={iconSize}
						height={iconSize}
						opacity={isUnlocked ? 1 : 0.4}
					/>

					{/* Radix UI Tutorial Spot integration using foreignObject */}
					<foreignObject
						x={-baseSize}
						y={-baseSize}
						width={baseSize * 2}
						height={baseSize * 2}
						style={{
							overflow: "visible",
							pointerEvents: "none",
						}}
					>
						<div
							style={{
								width: "100%",
								height: "100%",
								position: "relative",
								transform: `scale(${1 / (transform.k || 1)})`,
								transformOrigin: "center center",
							}}
						>
							<TutorialSpot
								marker={{
									kind: "action-template-tree",
									instance: { templateId: template.id },
								}}
							>
								<TutorialHighlight>
									<TutorialTrigger asChild>
										<div
											style={{
												position: "absolute",
												inset: 0,
												pointerEvents: "auto",
											}}
											onClick={handleClick}
										/>
									</TutorialTrigger>
								</TutorialHighlight>
								<TutorialPopoverContent />
							</TutorialSpot>
						</div>
					</foreignObject>
				</g>
			);
		},
		[quest, wasApplied, getRhombusPath, setSelectedTemplate, transform]
	);

	return (
		<div className="overflow-hidden bg-white dark:bg-slate-950 h-full shadow-inner">
			<svg ref={svgRef} className="w-full h-full">
				<g transform={transform.toString()}>
					{templates.map((template) => (
						<Node key={template.id} template={template} />
					))}
				</g>
			</svg>
		</div>
	);
}

// Helper to get form schema based on template kind
function getFormSchema(template: ActionTemplate) {
	if (template.templateKind === "user-customizable") {
		return template.userInputSchema;
	}
	// For constant templates, return an empty object schema
	return z.object({});
}

// Node Details Component
function NodeDetails({
	template,
	onActionTemplateChosen,
	wasApplied,
}: {
	template: ActionTemplate;
	onActionTemplateChosen: (
		actionTemplate: ActionTemplate,
		userInput: z.ZodRawShape
	) => void;
	wasApplied: boolean;
}) {
	const quest = useSelector(questStore, (state) => state.context);
	const isUnlocked = template.isUnlocked(quest);

	const schema = getFormSchema(template);
	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues:
			template.templateKind === "user-customizable"
				? Object.fromEntries(
						Object.entries(template.userInputSchema.shape).map(
							([name, field]) => [
								name,
								field._def.defaultValue?.() ?? 0,
							]
						)
				  )
				: {},
	});

	const onSubmit = (data: z.infer<typeof schema>) => {
		onActionTemplateChosen(template, data);
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

				{!wasApplied &&
					template.templateKind === "user-customizable" && (
						<div className="space-y-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
							<h4 className="font-medium text-gray-700">
								Configuration
							</h4>
							{Object.entries(template.userInputSchema.shape).map(
								([fieldName, fieldSchema]) => (
									<FormField
										key={fieldName}
										control={form.control}
										name={fieldName}
										render={({ field }) => (
											<FormItem>
												<FormLabel
													htmlFor={fieldName}
													className="text-sm text-gray-600"
												>
													{fieldSchema.description ||
														fieldName
															.charAt(0)
															.toUpperCase() +
															fieldName.slice(1)}
												</FormLabel>
												<FormControl>
													<Input
														id={fieldName}
														type="number"
														{...field}
														className="mt-1 focus:ring-indigo-500 focus:border-indigo-500"
														disabled={!isUnlocked}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								)
							)}
						</div>
					)}

				{!wasApplied && (
					<>
						{!isUnlocked && (
							<div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600">
								This action is currently locked. Keep playing to
								unlock it!
							</div>
						)}
						<TutorialSpot marker={{ kind: "post-action-button" }}>
							<TutorialTrigger asChild>
								<Button
									type="submit"
									className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
									disabled={!isUnlocked}
								>
									{getAction(template).kind === "investment"
										? "Invest"
										: getAction(template).kind === "income"
										? "Work"
										: "Accept Expense"}
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</TutorialTrigger>
							<TutorialPopoverContent />
						</TutorialSpot>
					</>
				)}
			</form>
		</Form>
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
								messages.map((msg, index) => (
									<div
										key={index}
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
					.map((a) => a.templateId)
					.concat(
						currentStep.continuingActions.map((a) => a.templateId)
					)
					.filter((tid): tid is number => !!tid)
			),
		[newActions, currentStep]
	);

	console.log(appliedActionTemplateIds);

	const handleActionTemplateChosen = (
		actionTemplate: ActionTemplate,
		userInput: z.ZodRawShape
	) => {
		const action = applyActionTemplate(actionTemplate, userInput);
		setNewActions([...newActions, action]);
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
		} catch {
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
			<TutorialSpot marker={{ kind: "actions-choice-container" }}>
				<TutorialHighlight>
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
									appliedActionTemplateIds={
										appliedActionTemplateIds
									}
								/>
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
								key={selectedTemplate.id}
								template={selectedTemplate}
								onActionTemplateChosen={
									handleActionTemplateChosen
								}
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
								disabled={newActions.length === 0}
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
