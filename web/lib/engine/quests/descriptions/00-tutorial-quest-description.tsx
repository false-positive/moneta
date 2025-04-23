import { noOpAction } from "@/lib/engine/actions/standard-actions";
import { z } from "zod";
import { getCurrentStep, QuestDescription } from "..";
import {
	absoluteImpact,
	constantPercent,
	defineExperiences,
	historyPercent,
	impact,
	noImpact,
	percentImpact,
} from "../../actions";
import {
	ActionTemplate,
	applyActionTemplate,
	createConstantTemplate,
	createCustomizableTemplate,
} from "../../actions/templates";

const { getStepExperience, experienceGain } = defineExperiences<
	| "housing"
	| "stable-investments"
	| "savings-deposit"
	| "etf-investment"
	| "btc-investment"
	| "gold-investment"
	| "work"
	| "waiter"
	| "swe"
	| "swe-junior"
	| "swe-senior"
>();

const lifeActionTemplate = createConstantTemplate({
	action: {
		...noOpAction,
		name: "Life",
		kind: "expense",
		shortDescription: "Pay for living expenses",
		llmDescription:
			"Pay for rent, utilities, food, and other basic living expenses",
		bankAccountImpact: impact({
			repeatedAbsoluteDelta: -1000,
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

export const tutorialQuestDescription: QuestDescription = {
	personAge: 18,
	questLLMDescription:
		"Ivan is 18 years old and has 5000 BGN in his bank account. He lives alone and is looking for ways to grow his savings while maintaining a good work-life balance.",
	maxStepCount: 5,
	timePointKind: "year",
	initialStep: {
		timePoint: 2020,
		bankAccount: 5000,
		joy: 100,
		freeTimeHours: 100,
		newActions: [],
		continuingActions: [applyActionTemplate(lifeActionTemplate, {})],
		experience: new Map(),
	},
	goal: {
		description: "Save enough money to buy your first car",
		challengeText: "Buy your first car!",
		ageText: "You are 18 years old...",
		goalReached: ({}) => false,
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
					repeatedAbsoluteDelta: -(200 * 12),
					repeatedPercent: constantPercent(-2),
				}), // levs and inflation per year
				joyImpact: percentImpact(-15), // Increased negative joy impact to reflect reduced independence
				freeTimeImpact: absoluteImpact(120), // More free time as parents help with chores
				remainingSteps: Infinity,
				gainedExperiences: experienceGain("housing"),
			},
			iconImageHref: "/icons/liveWithParentsAction.png",
			hardcodedPosition: { x: 575, y: 275 },
			isUnlocked: (quest) => quest.description.personAge <= 25,
		}),
		createCustomizableTemplate({
			baseAction: {
				name: "Savings Deposit",
				kind: "investment",
				shortDescription: "Deposit money into a savings account",
				llmDescription:
					"A low-risk way to grow your money with guaranteed interest",
				remainingSteps: 2, // years
				joyImpact: noImpact,
				freeTimeImpact: noImpact,
				gainedExperiences: experienceGain([
					"savings-deposit",
					"stable-investments",
				]),
			},
			userInputSchema: z.object({
				initialDeposit: z.coerce
					.number()
					.min(1000, "Minimum deposit is 1,000 BGN")
					.max(50000, "Maximum deposit is 50,000 BGN")
					.default(5000)
					.describe("Initial deposit amount"),
				monthlyDeposit: z.coerce
					.number()
					.min(0, "Monthly deposit cannot be negative")
					.max(5000, "Maximum monthly deposit is 5,000 BGN")
					.default(0)
					.describe("Optional monthly deposit amount"),
			}),
			apply: (baseAction, userInput) => ({
				...noOpAction,
				...baseAction,
				investmentImpact: impact({
					repeatedPercent: constantPercent(0.2),
					initialPrice: userInput.initialDeposit,
					repeatedPrice: userInput.monthlyDeposit,
				}),
			}),
			iconImageHref: "/icons/savingsDepositAction.png",
			hardcodedPosition: { x: 625, y: 275 },
			isUnlocked: (quest) =>
				quest.steps[quest.currentStepIndex].bankAccount >= 1000,
		}),
		createCustomizableTemplate({
			baseAction: {
				name: "ETF Investment",
				kind: "investment",
				shortDescription: "Invest in a diversified ETF fund",
				llmDescription:
					"A balanced investment in a diversified portfolio of stocks through an ETF",
				remainingSteps: 10, // years
				joyImpact: noImpact,
				freeTimeImpact: noImpact,
				gainedExperiences: experienceGain([
					"etf-investment",
					"stable-investments",
				]),
			},
			userInputSchema: z.object({
				initialInvestment: z.coerce
					.number()
					.min(1000, "Minimum investment is 1,000 BGN")
					.max(100000, "Maximum investment is 100,000 BGN")
					.default(10000)
					.describe("Initial investment amount"),
				monthlyInvestment: z.coerce
					.number()
					.min(0, "Monthly investment cannot be negative")
					.max(10000, "Maximum monthly investment is 10,000 BGN")
					.default(0)
					.describe("Optional monthly investment amount"),
			}),
			apply: (baseAction, userInput) => ({
				...noOpAction,
				...baseAction,
				investmentImpact: impact({
					repeatedPercent: historyPercent("etf"),
					initialPrice: userInput.initialInvestment,
					repeatedPrice: userInput.monthlyInvestment,
				}),
			}),
			iconImageHref: "/icons/etfInvestmentOnceAction.png",
			hardcodedPosition: { x: 650, y: 300 },
			isUnlocked: (quest) => {
				const currentStep = getCurrentStep(quest);
				const hasSavings =
					getStepExperience(currentStep, "savings-deposit") > 0;
				return hasSavings && currentStep.bankAccount >= 5000;
			},
		}),
		createConstantTemplate({
			action: {
				...noOpAction,
				name: "Stock Investment",
				kind: "investment",
				shortDescription: "Buy an individual stock",
				llmDescription: "Buy an individual stock",
				investmentImpact: impact({
					repeatedPercent: constantPercent(10),
					initialPrice: 5000,
				}),
				joyImpact: noImpact,
				freeTimeImpact: noImpact,
				remainingSteps: 10, // years
				canChangeInitialPrice: true,
				canChangeRepeatedPrice: true,
			},
			iconImageHref: "/icons/stocksInvestmentAction.png",
			hardcodedPosition: { x: 675, y: 275 },
			isUnlocked: () => false,
		}),
		createCustomizableTemplate({
			baseAction: {
				name: "Crypto Investment",
				kind: "investment",
				shortDescription: "Invest in cryptocurrency",
				llmDescription:
					"High-risk, high-volatility investment in cryptocurrency. Only invest what you can afford to lose!",
				remainingSteps: 5, // years
				joyImpact: noImpact,
				freeTimeImpact: noImpact,
			},
			userInputSchema: z.object({
				investmentAmount: z.coerce
					.number()
					.min(500, "Minimum crypto investment is 500 BGN")
					.max(50000, "Maximum crypto investment is 50,000 BGN")
					.default(5000)
					.describe("How much would you like to invest in crypto?"),
			}),
			apply: (baseAction, userInput) => ({
				...noOpAction,
				...baseAction,
				investmentImpact: impact({
					repeatedPercent: historyPercent("btc"),
					initialPrice: userInput.investmentAmount,
				}),
				gainedExperiences: experienceGain("btc-investment"),
			}),
			iconImageHref: "/icons/cryptoInvestmentAction.png",
			hardcodedPosition: { x: 700, y: 250 },
			isUnlocked: (quest) => {
				const currentStep = getCurrentStep(quest);
				const hasStableInvestments =
					getStepExperience(currentStep, "stable-investments") > 0;
				return hasStableInvestments && currentStep.bankAccount >= 10000;
			},
		}),
		createCustomizableTemplate({
			baseAction: {
				name: "Gold Investment",
				kind: "investment",
				shortDescription: "Buy investment gold",
				llmDescription:
					"A traditional store of value that can help protect against inflation",
				remainingSteps: 5, // years
				joyImpact: noImpact,
				freeTimeImpact: noImpact,
			},
			userInputSchema: z.object({
				investmentAmount: z.coerce
					.number()
					.min(1000, "Minimum gold investment is 1,000 BGN")
					.max(100000, "Maximum gold investment is 100,000 BGN")
					.default(5000)
					.describe("How much would you like to invest in gold?"),
			}),
			apply: (baseAction, userInput) => ({
				...noOpAction,
				...baseAction,
				investmentImpact: impact({
					repeatedPercent: historyPercent("gold"),
					initialPrice: userInput.investmentAmount,
				}),
				gainedExperiences: experienceGain("gold-investment"),
			}),
			iconImageHref: "/icons/goldInvestmentAction.png",
			hardcodedPosition: { x: 725, y: 275 },
			isUnlocked: (quest) => {
				const currentStep = getCurrentStep(quest);
				const hasStableInvestments =
					getStepExperience(currentStep, "stable-investments") > 0;
				return hasStableInvestments && currentStep.bankAccount >= 15000;
			},
		}),
		createCustomizableTemplate({
			baseAction: {
				name: "Partying",
				kind: "expense",
				shortDescription: "Going out and partying with friends",
				llmDescription:
					"Regular social activities and parties with friends - good for joy but costs money and time",
				remainingSteps: 12, // one year commitment
				freeTimeImpact: absoluteImpact(-4), // base hours per week
			},
			userInputSchema: z.object({
				monthlyBudget: z.coerce
					.number()
					.min(50, "Minimum monthly party budget is 50 BGN")
					.max(1000, "Maximum monthly party budget is 1,000 BGN")
					.default(200)
					.describe("Monthly party budget"),
				frequency: z.coerce
					.number()
					.min(1, "Minimum once per month")
					.max(8, "Maximum twice per week")
					.default(4)
					.describe("Times per month"),
			}),
			apply: (baseAction, userInput) => ({
				...noOpAction,
				...baseAction,
				bankAccountImpact: absoluteImpact(
					-(userInput.monthlyBudget * 12)
				), // yearly impact
				joyImpact: absoluteImpact(
					Math.min(30, userInput.frequency * 3)
				), // joy scales with frequency but caps at 30
				freeTimeImpact: absoluteImpact(-(userInput.frequency * 4)), // 4 hours per party
			}),
			iconImageHref: "/icons/partyingAction.png",
			hardcodedPosition: { x: 550, y: 350 },
			isUnlocked: (quest) =>
				quest.steps[quest.currentStepIndex].bankAccount >= 1000,
		}),
		createConstantTemplate({
			action: {
				...noOpAction,
				name: "Ski Trip",
				kind: "expense",
				shortDescription: "Go skiing",
				llmDescription:
					"Take a week-long ski trip - great for joy but expensive",
				bankAccountImpact: absoluteImpact(-2000),
				joyImpact: absoluteImpact(50),
				freeTimeImpact: absoluteImpact(-40), // hours per week
				remainingSteps: 1, // year
			},
			iconImageHref: "/icons/skiTripAction.png",
			hardcodedPosition: { x: 575, y: 325 },
			isUnlocked: (quest) => {
				const currentStep = getCurrentStep(quest);
				const hasStableIncome = currentStep.continuingActions.some(
					(action) =>
						action.kind === "income" &&
						action.bankAccountImpact.repeatedAbsoluteDelta >=
							1400 * 12
				);
				return hasStableIncome && currentStep.bankAccount >= 3000;
			},
		}),
		createConstantTemplate({
			action: {
				...noOpAction,
				name: "Hobby Motorbike Riding",
				kind: "expense",
				shortDescription: "Buying and servicing a motorbike",
				llmDescription:
					"Buy a motorbike and enjoy riding it as a hobby - expensive but very enjoyable",
				bankAccountImpact: absoluteImpact(-20000), // initial purchase
				joyImpact: absoluteImpact(20),
				freeTimeImpact: absoluteImpact(-10), // hours per week for riding and maintenance
				remainingSteps: Infinity,
			},
			iconImageHref: "/icons/hobbyMotorbikeRidingAction.png",
			hardcodedPosition: { x: 550, y: 300 },
			isUnlocked: (quest) => {
				const currentStep = getCurrentStep(quest);
				const hasStableIncome = currentStep.continuingActions.some(
					(action) =>
						action.kind === "income" &&
						action.bankAccountImpact.repeatedAbsoluteDelta >=
							2000 * 12
				);
				return hasStableIncome && currentStep.bankAccount >= 25000;
			},
		}),
		createConstantTemplate({
			action: {
				...noOpAction,
				name: "Having A Kid",
				kind: "expense",
				shortDescription:
					"Having a kid and paying all the expenses they bring",
				llmDescription:
					"Start a family - a lifelong commitment that brings joy but requires significant financial stability",
				bankAccountImpact: impact({
					repeatedAbsoluteDelta: -(2000 * 12), // yearly child expenses
					repeatedPercent: constantPercent(-5), // additional cost increase
				}),
				joyImpact: absoluteImpact(40),
				freeTimeImpact: absoluteImpact(-60), // significant time commitment
				remainingSteps: Infinity,
			},
			iconImageHref: "/icons/havingAKidAction.png",
			hardcodedPosition: { x: 600, y: 350 },
			isUnlocked: (quest) => {
				const currentStep = getCurrentStep(quest);
				const hasStableIncome = currentStep.continuingActions.some(
					(action) =>
						action.kind === "income" &&
						action.bankAccountImpact.repeatedAbsoluteDelta >=
							3000 * 12
				);
				const hasHousing =
					getStepExperience(currentStep, "housing") > 0;
				return (
					hasStableIncome &&
					hasHousing &&
					quest.steps[quest.currentStepIndex].bankAccount >= 50000
				);
			},
		}),
		createConstantTemplate({
			action: {
				...noOpAction,
				name: "Part-time job as a waiter",
				kind: "income",
				shortDescription: "Part-time work as a waiter",
				llmDescription:
					"Entry-level job that provides flexible hours and basic income while allowing time for other activities",
				bankAccountImpact: absoluteImpact(700 * 12), // levs per year
				joyImpact: absoluteImpact(-5),
				freeTimeImpact: absoluteImpact(-20), // hours per week
				remainingSteps: Infinity,
				gainedExperiences: experienceGain(["work", "waiter"]),
			},
			iconImageHref: "/icons/waiterPartTimeJobAction.png",
			hardcodedPosition: { x: 600, y: 250 },
			isUnlocked: () => true, // Always available as entry-level job
		}),
		createConstantTemplate({
			action: {
				...noOpAction,
				name: "Full-time job as a waiter",
				kind: "income",
				shortDescription: "Full-time work as a waiter",
				llmDescription:
					"Full-time position with better pay but requires more time commitment",
				bankAccountImpact: absoluteImpact(1400 * 12), // levs per year
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
				name: "Job as a junior software engineer",
				kind: "income",
				shortDescription: "Work as a software engineer",
				llmDescription:
					"Entry-level software development position with good pay and career growth potential",
				bankAccountImpact: absoluteImpact(3000 * 12), // levs per year
				joyImpact: absoluteImpact(-8),
				freeTimeImpact: absoluteImpact(-40), // hours per week
				remainingSteps: Infinity,

				gainedExperiences: experienceGain([
					"work",
					"swe",
					"swe-junior",
				]),
			},
			iconImageHref: "/icons/juniorSweJobAction.png",
			hardcodedPosition: { x: 575, y: 225 },
			isUnlocked: (quest) => {
				const currentStep = getCurrentStep(quest);
				const hasWorkExperience =
					getStepExperience(currentStep, "work") > 0;
				return hasWorkExperience && currentStep.timePoint >= 2021;
			},
		}),
		createConstantTemplate({
			action: {
				...noOpAction,
				name: "Job as a senior software engineer",
				kind: "income",
				shortDescription: "Work as a software engineer",
				llmDescription:
					"Senior software development position with excellent compensation and work-life balance",
				bankAccountImpact: absoluteImpact(5000 * 12), // levs per year
				joyImpact: absoluteImpact(-8),
				freeTimeImpact: absoluteImpact(-40), // hours per week
				remainingSteps: Infinity,
				gainedExperiences: experienceGain(["swe", "swe-senior"]),
			},
			iconImageHref: "/icons/seniorSweJobAction.png",
			hardcodedPosition: { x: 600, y: 200 },
			isUnlocked: (quest) => {
				const currentStep = getCurrentStep(quest);
				const juniorYears = getStepExperience(
					currentStep,
					"swe-junior"
				);
				return juniorYears >= 3;
			},
		}),
	] satisfies readonly ActionTemplate[],
	tutorialSteps: [
		{
			marker: { kind: "welcome-dialog" },
			title: "Lets begin with your first choice!",
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
				instance: { templateId: 12 },
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
			// FIXME: This should be true, but we need to fix the tutorial first
			blockInteractions: false,
		},
		{
			marker: { kind: "post-action-button" },
			title: "Lock In Your Move",
			description: (
				<>
					After choosing your actions for the year, click here to{" "}
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
					Use the roadmap to jump between different years in your
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
				instance: { timePoint: 2021 },
			},
			title: "Next Year Awaits",
			description: (
				<>
					These {'"levels"'} represent the time in your simulation.
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
			// FIXME: This should be true, but we need to fix the tutorial first
			blockInteractions: false,
		},
		{
			marker: {
				kind: "action-template-tree",
				instance: { templateId: 3 },
			},
			title: "Savings Deposit",
			description: (
				<>
					Now you can make a savings deposit! This is a safe way to
					grow your money.
					<br />
					Click on the third step to select it as{" "}
					<strong>current</strong>
					.
					<br />
					Consider how much you want to deposit and for how long.
				</>
			),
			popoverSide: "top",
			pulse: true,
			blockInteractions: false,
		},
		{
			marker: { kind: "post-action-button" },
			title: "Lock In Your Move",
			description: (
				<>
					You can modify the duration and other metrics of your
					choices.
					<br />
					Click here when you are done.
				</>
			),
			popoverSide: "bottom",
			blockInteractions: false,
		},
		{
			marker: { kind: "submit-choice-button" },
			title: "Make More Choices",
			description: (
				<>
					Continue building your strategy and moving forward in your
					journey.
				</>
			),
			popoverSide: "bottom",
			blockInteractions: false,
		},
		{
			marker: { kind: "timeline" },
			title: "Navigate Time",
			description: (
				<>
					This is the timeline component - it displayes all your
					decisions in time, their durations and impact.
					<br />
					Click on a year to select it as <strong>current</strong>.
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
					Here you’ll find a breakdown of all financial transactions
					and results.
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
			title: "Detailed View",
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
			marker: { kind: "graph-container" },
			title: "Detailed View",
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
					goal.
				</>
			),
			popoverSide: "bottom",
			blockInteractions: true,
		},
	],
};
