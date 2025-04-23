import { noOpAction } from "@/lib/engine/actions/standard-actions";
import { getCurrentStep, QuestDescription } from "..";
import {
	absoluteImpact,
	constantPercent,
	defineExperiences,
	impact,
	percentImpact,
} from "../../actions";
import {
	ActionTemplate,
	applyActionTemplate,
	createConstantTemplate,
} from "../../actions/templates";

const { getStepExperience, experienceGain } = defineExperiences<
	"housing" | "work" | "waiter" | "car"
>();

const INITIAL_BANK_ACCOUNT = 100;
const CAR_PRICE = 5000;

const lifeActionTemplate = createConstantTemplate({
	action: {
		...noOpAction,
		name: "Live on your own",
		kind: "expense",
		shortDescription: "Pay for living expenses",
		llmDescription:
			"Pay for rent, utilities, food, and other basic living expenses",
		bankAccountImpact: impact({
			repeatedAbsoluteDelta: -INITIAL_BANK_ACCOUNT + 100,
			repeatedPercent: constantPercent(-2 / 12),
		}), // levs per month + inflation per month
		joyImpact: percentImpact(-10),
		freeTimeImpact: absoluteImpact(100), // hours per week
		remainingSteps: Infinity,
		gainedExperiences: experienceGain("housing"),
	},
	iconImageHref: "/icons/lifeAction.svg",
	hardcodedPosition: { x: 600, y: 300 },
	isUnlocked: () => true,
});

const waiterPartTimeJobTemplate = createConstantTemplate({
	action: {
		...noOpAction,
		name: "Part-time job as a waiter",
		kind: "income",
		shortDescription: "Part-time work as a waiter",
		llmDescription:
			"Entry-level job that provides flexible hours and basic income while allowing time for other activities",
		bankAccountImpact: absoluteImpact(700), // levs per month
		joyImpact: absoluteImpact(-5),
		freeTimeImpact: absoluteImpact(-20), // hours per week
		remainingSteps: Infinity,
		gainedExperiences: experienceGain(["work", "waiter"]),
	},
	iconImageHref: "/icons/waiterPartTimeJobAction.png",
	hardcodedPosition: { x: 600, y: 250 },
	isUnlocked: () => true,
});

export const tutorialQuestDescription: QuestDescription = {
	personAge: 18,
	questLLMDescription: `Ivan is 18 years old and has ${INITIAL_BANK_ACCOUNT} lv. in his bank account. He lives alone and needs to save ${CAR_PRICE} lv. in 12 months to buy his first car.`,
	maxStepCount: 12,
	timePointKind: "month",
	initialStep: {
		timePoint: 1,
		bankAccount: INITIAL_BANK_ACCOUNT,
		joy: 100,
		freeTimeHours: 8 * 7 * 30,
		newActions: [],
		continuingActions: [applyActionTemplate(lifeActionTemplate, {})],
		experience: new Map(),
	},
	goal: {
		description: "Save enough money to buy your first car in 12 months",
		challengeText: "Buy your first car!",
		ageText: "You are 18 years old...",
		// goalReached: ({ lastStep }) => lastStep.bankAccount >= 15000,
		goalReached: ({ lastStep }) => getStepExperience(lastStep, "car") > 0,
	},
	actionTemplates: [
		lifeActionTemplate,
		createConstantTemplate({
			action: {
				...noOpAction,
				name: "Live with parents",
				kind: "expense",
				shortDescription:
					"Living expenses when living with your parents",
				llmDescription:
					"Living with your parents - lower expenses but may affect your independence and joy",
				bankAccountImpact: impact({
					repeatedAbsoluteDelta: -200,
					repeatedPercent: constantPercent(-2 / 12),
				}), // levs and inflation per month
				joyImpact: percentImpact(-15),
				freeTimeImpact: absoluteImpact(120),
				remainingSteps: Infinity,
				gainedExperiences: experienceGain("housing"),
			},
			iconImageHref: "/icons/liveWithParentsAction.png",
			hardcodedPosition: { x: 575, y: 275 },
			isUnlocked: () => true,
		}),
		waiterPartTimeJobTemplate,
		createConstantTemplate({
			action: {
				...noOpAction,
				name: "Full-time job as a waiter",
				kind: "income",
				shortDescription: "Full-time work as a waiter",
				llmDescription:
					"Full-time position with better pay but requires more time commitment",
				bankAccountImpact: absoluteImpact(1400), // levs per month
				joyImpact: absoluteImpact(-12),
				freeTimeImpact: absoluteImpact(-40), // hours per week
				remainingSteps: Infinity,
				gainedExperiences: experienceGain(["work", "waiter"]),
			},
			iconImageHref: "/icons/waiterFullTimeJobAction.png",
			hardcodedPosition: { x: 625, y: 225 },
			isUnlocked: (quest) =>
				getStepExperience(getCurrentStep(quest), "waiter") > 0,
		}),
		createConstantTemplate({
			action: {
				...noOpAction,
				name: "Buy a Car",
				kind: "expense",
				shortDescription: "Purchase your first car",
				llmDescription:
					"Buy your first car - a significant financial milestone that requires careful saving",
				bankAccountImpact: absoluteImpact(-CAR_PRICE),
				joyImpact: absoluteImpact(30),
				freeTimeImpact: absoluteImpact(-5),
				remainingSteps: 1,
				gainedExperiences: experienceGain("car"),
			},
			iconImageHref: "/icons/carPurchaseAction.svg",
			hardcodedPosition: { x: 650, y: 300 },
			isUnlocked: (quest) =>
				getCurrentStep(quest).bankAccount >= CAR_PRICE,
		}),
	] satisfies readonly ActionTemplate[],
	tutorialSteps: [
		{
			marker: { kind: "welcome-dialog" },
			title: "Let's begin with your first choice!",
			description: <></>,
			popoverSide: "bottom",
			blockInteractions: true,
		},
		{
			marker: { kind: "actions-choice-container" },
			title: "Your First Choice",
			description: (
				<>
					In this section you can make your first choice.
					<br />
					Choose <strong>one action</strong> that aligns with your
					goals and preferences. You can pick more later.
					<br />
					Click on an action to select it and view more details.
				</>
			),
			popoverSide: "right",
			blockInteractions: true,
		},
		{
			marker: {
				kind: "action-template-tree",
				instance: { templateId: waiterPartTimeJobTemplate.id },
			},
			title: "Your First Job",
			description: (
				<>
					{"Let's"} start with a basic job as a waiter.
					<br />
					This will give you a steady income to build upon.
					<br />
					Click on this node to see the details and apply for the job.
				</>
			),
			popoverSide: "right",
			blockInteractions: false,
		},
		{
			marker: { kind: "post-action-button" },
			title: "Lock In Your Move",
			description: (
				<>
					After choosing your actions for the month, click here to{" "}
					<strong>confirm</strong> them.
					<br />
					This will lock in your decisions.
				</>
			),
			popoverSide: "bottom",
			blockInteractions: false,
		},
		{
			marker: { kind: "submit-choice-button" },
			title: "Choose Your Actions",
			description: (
				<>
					Click here when you are done making choices for now.
					<br />
					Each choice will influence your finances, so pick carefully
					based on your goals and available options.
				</>
			),
			popoverSide: "bottom",
			pulse: false,
		},
		{
			marker: { kind: "decision-roadmap" },
			title: "Your Financial Map",
			description: (
				<>
					This is your decisions <strong>Roadmap</strong> — a visual
					overview of the steps {"you've"} made in time.
					<br />
					Use the roadmap to jump between different months in your
					simulation. From here, you can select any point of time and
					make new choices or amend old ones!
				</>
			),
			popoverSide: "left",
			blockInteractions: true,
		},
		{
			marker: {
				kind: "journey-node",
				instance: { timeUnit: "Feb" },
			},
			title: "Next Month Awaits",
			description: (
				<>
					These {'"levels"'} represent the months in your simulation.
					<br />
					Click on the second step to select it as{" "}
					<strong>current</strong>.
					<br />
					You already made a decision for the first one, so now select
					the <strong>second</strong>.
				</>
			),
			popoverSide: "top",
			pulse: true,
			blockInteractions: false,
		},
		{
			marker: { kind: "timeline" },
			title: "Navigate Time",
			description: (
				<>
					This is the timeline component - it displays all your
					decisions in time, their durations and impact.
					<br />
					Click on a month to select it as <strong>current</strong>.
				</>
			),
			popoverSide: "top",
			blockInteractions: true,
		},
		{
			marker: { kind: "metrics-card" },
			title: "Track Key Metrics",
			description: (
				<>
					This panel shows important metrics about your life in the
					simulation such as your <strong>assets</strong>,{" "}
					<strong>level of joy</strong>, and{" "}
					<strong>free time</strong>.
					<br />
					Here you can also find your income and expenses for the
					current time period. <br />
					Use it to monitor how each decision affects your overall
					progress.
				</>
			),
			popoverSide: "left",
			blockInteractions: true,
		},
		{
			marker: { kind: "financial-data" },
			title: "Detailed View",
			description: (
				<>
					Here {"you'll"} find a breakdown of all financial
					transactions and results.
					<br />
					This is useful for analyzing the impact of each decision in
					more detail.
				</>
			),
			popoverSide: "left",
			blockInteractions: true,
		},
		{
			marker: { kind: "graphs" },
			title: "Financial Progress",
			description: (
				<>
					Here you can find graphics that show your financial
					progress.
					<br />
					This is useful for analyzing the impact of each decision in
					more detail.
				</>
			),
			popoverSide: "left",
			blockInteractions: true,
		},
		{
			marker: { kind: "steps-done-dialog" },
			title: "That's it!",
			description: (
				<>
					{"You've"} got the basics!
					<br />
					From now on, you can explore, experiment, and build your own
					financial path.
					<br />
					The tutorial will finish automatically once you reach your
					goal of buying a car.
				</>
			),
			popoverSide: "bottom",
			blockInteractions: true,
		},
	],
};
