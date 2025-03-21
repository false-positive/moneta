export type Step = {
	tick: number;
	budget: number;
	isBudgetKnown: boolean;
	joy: number;
	isJoyKnown: boolean;
	freeTime: number;
	isFreeTimeKnown: boolean;
	// Actions, which were introduced in this step
	newActions: Action[];
	// Actions, which were applied up to this step (including the new ones, minus the old ones)
	appliedActions: Action[];
};

// Base Action type with discriminated union via 'kind' property
export type Action =
	| InvestmentAction
	| JobAction
	| BusinessAction
	| PropertyAction
	| EntertainmentAction
	| PurchaseAction
	| LifeChoiceAction
	| EducationAction
	| JobSearchAction
	| NoOpAction;

// Base type for all actions
export type BaseAction = {
	id: string;
	name: string;
	shortDescription: string; // Short description for UI display
	llmDescription: string; // Detailed description for LLM context
	timesApplied: number;
	kind: string;
	poll: (state: Step) => boolean;
};

// Investment action type
export type InvestmentAction = BaseAction & {
	kind: "investment";
	minBudget: number;
	riskLevel: "none" | "very_low" | "low" | "medium" | "high" | "very_high";
	maxInvestmentPercent: number; // % of budget that can be invested
	maxInvestmentAmount: number; // max amount regardless of percentage
	baseReturnRate: number; // average return rate
	volatility: number; // 0-1, how volatile the returns are
	joyImpact: number; // base joy impact
	joyLossOnBadOutcome?: number; // optional penalty on bad outcome
	modifier: (this: InvestmentAction, state: Step) => Step;
};

// Job action type
export type JobAction = BaseAction & {
	kind: "job";
	requiredFreeTime: number;
	incomeAmount: number;
	freeTimeReduction: number;
	joyImpact: number;
	modifier: (this: JobAction, state: Step) => Step;
};

// Business action type
export type BusinessAction = BaseAction & {
	kind: "business";
	initialInvestment: number;
	minBudget: number;
	requiredFreeTime: number;
	freeTimeReduction: number;
	successProbability: {
		high: number; // Probability threshold for high success
		medium: number; // Probability threshold for medium success
	};
	returns: {
		high: number; // Return multiplier for high success
		medium: number; // Return multiplier for medium success
		low: number; // Return multiplier for low success
	};
	joyImpact: {
		success: number;
		failure: number;
	};
	modifier: (this: BusinessAction, state: Step) => Step;
};

// Property action type
export type PropertyAction = BaseAction & {
	kind: "property";
	propertyValue: number;
	rentalYield: number;
	freeTimeReduction: number;
	joyImpact: number;
	modifier: (this: PropertyAction, state: Step) => Step;
};

// Entertainment action type
export type EntertainmentAction = BaseAction & {
	kind: "entertainment";
	cost: number;
	joyImpact: number;
	freeTimeReduction: number;
	modifier: (this: EntertainmentAction, state: Step) => Step;
};

// Major purchase action type
export type PurchaseAction = BaseAction & {
	kind: "purchase";
	cost: number;
	joyImpact: number;
	freeTimeImpact: number;
	modifier: (this: PurchaseAction, state: Step) => Step;
};

// Life choice action type
export type LifeChoiceAction = BaseAction & {
	kind: "life_choice";
	initialCost: number;
	ongoingBudgetImpact: number;
	joyImpact: number;
	freeTimeImpact: number;
	minBudget: number;
	minJoy?: number;
	minFreeTime?: number;
	modifier: (this: LifeChoiceAction, state: Step) => Step;
};

// Education action type
export type EducationAction = BaseAction & {
	kind: "education";
	cost: number;
	joyImpact: number;
	freeTimeReduction: number;
	modifier: (this: EducationAction, state: Step) => Step;
};

// Job search action type
export type JobSearchAction = BaseAction & {
	kind: "job_search";
	requiredFreeTime: number;
	freeTimeReduction: number;
	successRate: number;
	salaryIncrease: number;
	joyImpacts: {
		success: number;
		failure: number;
	};
	modifier: (this: JobSearchAction, state: Step) => Step;
};

// NoOp action type
export type NoOpAction = BaseAction & {
	kind: "no_op";
	modifier: (this: NoOpAction, state: Step) => Step;
};

// Action factory registry
const ActionFactories = {
	// Investment action factory
	createInvestmentAction: (
		params: Omit<InvestmentAction, "kind" | "modifier"> & {
			kind?: "investment";
		}
	): InvestmentAction => ({
		...params,
		id: params.id || Math.random().toString(36).substring(2, 15),
		kind: "investment",
		timesApplied: params.timesApplied || 0,
		modifier: function (state) {
			const investment = Math.min(
				state.budget * this.maxInvestmentPercent,
				this.maxInvestmentAmount
			);

			let actualReturns = 0;

			if (this.riskLevel === "none" || this.riskLevel === "very_low") {
				// For no risk or very low risk investments, returns are stable
				actualReturns = investment * this.baseReturnRate;
			} else {
				// For higher risk investments, apply volatility
				const marketLuck = Math.random();

				if (this.riskLevel === "low") {
					actualReturns =
						investment *
						(marketLuck > 0.2
							? this.baseReturnRate
							: this.baseReturnRate * 0.5);
				} else if (this.riskLevel === "medium") {
					if (marketLuck > 0.2) {
						actualReturns = investment * this.baseReturnRate;
					} else {
						actualReturns = -investment * (this.volatility / 2);
					}
				} else if (this.riskLevel === "high") {
					if (marketLuck > 0.6) {
						actualReturns = investment * this.baseReturnRate;
					} else if (marketLuck > 0.3) {
						actualReturns = investment * (this.baseReturnRate / 3);
					} else {
						actualReturns =
							-investment * ((this.volatility * 2) / 3);
					}
				} else if (this.riskLevel === "very_high") {
					if (marketLuck > 0.7) {
						actualReturns = investment * this.baseReturnRate;
					} else if (marketLuck > 0.5) {
						actualReturns =
							investment * (this.baseReturnRate * 0.43);
					} else if (marketLuck > 0.3) {
						actualReturns = 0;
					} else {
						actualReturns = -investment * this.volatility;
					}
				}
			}

			this.timesApplied++;

			return {
				...state,
				budget: state.budget + actualReturns,
				joy:
					state.joy +
					(actualReturns > 0
						? this.joyImpact
						: this.joyLossOnBadOutcome
						? -this.joyLossOnBadOutcome
						: 0),
			};
		},
	}),

	// Job action factory
	createJobAction: (
		params: Omit<JobAction, "kind" | "modifier"> & {
			kind?: "job";
		}
	): JobAction => ({
		...params,
		kind: "job",
		timesApplied: params.timesApplied || 0,
		modifier: function (state) {
			this.timesApplied++;

			return {
				...state,
				budget: state.budget + this.incomeAmount,
				freeTime:
					this.timesApplied > 1
						? state.freeTime
						: state.freeTime - this.freeTimeReduction,
				joy: state.joy + this.joyImpact,
			};
		},
	}),

	// Business action factory
	createBusinessAction: (
		params: Omit<BusinessAction, "kind" | "modifier"> & {
			kind?: "business";
		}
	): BusinessAction => ({
		...params,
		kind: "business",
		timesApplied: params.timesApplied || 0,
		modifier: function (state) {
			const businessLuck = Math.random();
			let profit;

			if (businessLuck > this.successProbability.high) {
				profit = this.initialInvestment * this.returns.high;
			} else if (businessLuck > this.successProbability.medium) {
				profit = this.initialInvestment * this.returns.medium;
			} else {
				profit = this.initialInvestment * this.returns.low;
			}

			this.timesApplied++;

			return {
				...state,
				budget: state.budget + profit - this.initialInvestment,
				freeTime: state.freeTime - this.freeTimeReduction,
				joy:
					state.joy +
					(profit > 0
						? this.joyImpact.success
						: this.joyImpact.failure),
			};
		},
	}),

	// Property action factory
	createPropertyAction: (
		params: Omit<PropertyAction, "kind" | "modifier"> & {
			kind?: "property";
		}
	): PropertyAction => ({
		...params,
		kind: "property",
		timesApplied: params.timesApplied || 0,
		modifier: function (state) {
			const monthlyRent = this.propertyValue * this.rentalYield;

			this.timesApplied++;

			return {
				...state,
				budget: state.budget - this.propertyValue + monthlyRent,
				freeTime: state.freeTime - this.freeTimeReduction,
				joy: state.joy + this.joyImpact,
			};
		},
	}),

	// Entertainment action factory
	createEntertainmentAction: (
		params: Omit<EntertainmentAction, "kind" | "modifier"> & {
			kind?: "entertainment";
		}
	): EntertainmentAction => ({
		...params,
		kind: "entertainment",
		timesApplied: params.timesApplied || 0,
		modifier: function (state) {
			this.timesApplied++;

			return {
				...state,
				budget: state.budget - this.cost,
				joy: state.joy + this.joyImpact,
				freeTime: state.freeTime - this.freeTimeReduction,
			};
		},
	}),

	// Purchase action factory
	createPurchaseAction: (
		params: Omit<PurchaseAction, "kind" | "modifier"> & {
			kind?: "purchase";
		}
	): PurchaseAction => ({
		...params,
		kind: "purchase",
		timesApplied: params.timesApplied || 0,
		modifier: function (state) {
			this.timesApplied++;

			return {
				...state,
				budget: state.budget - this.cost,
				joy: state.joy + this.joyImpact,
				freeTime: state.freeTime + this.freeTimeImpact,
			};
		},
	}),

	// Life choice action factory
	createLifeChoiceAction: (
		params: Omit<LifeChoiceAction, "kind" | "modifier"> & {
			kind?: "life_choice";
		}
	): LifeChoiceAction => ({
		...params,
		kind: "life_choice",
		timesApplied: params.timesApplied || 0,
		modifier: function (state) {
			this.timesApplied++;

			return {
				...state,
				budget:
					state.budget - this.initialCost + this.ongoingBudgetImpact,
				joy: state.joy + this.joyImpact,
				freeTime: state.freeTime + this.freeTimeImpact,
			};
		},
	}),

	// Education action factory
	createEducationAction: (
		params: Omit<EducationAction, "kind" | "modifier"> & {
			kind?: "education";
		}
	): EducationAction => ({
		...params,
		kind: "education",
		timesApplied: params.timesApplied || 0,
		modifier: function (state) {
			this.timesApplied++;

			return {
				...state,
				budget: state.budget - this.cost,
				joy: state.joy + this.joyImpact,
				freeTime: state.freeTime - this.freeTimeReduction,
			};
		},
	}),

	// Job search action factory
	createJobSearchAction: (
		params: Omit<JobSearchAction, "kind" | "modifier"> & {
			kind?: "job_search";
		}
	): JobSearchAction => ({
		...params,
		kind: "job_search",
		timesApplied: params.timesApplied || 0,
		modifier: function (state) {
			const jobSearchLuck = Math.random();
			const isSuccessful = jobSearchLuck > 1 - this.successRate;
			const salaryIncrease = isSuccessful ? this.salaryIncrease : 0;

			this.timesApplied++;

			return {
				...state,
				budget: state.budget + salaryIncrease,
				joy:
					state.joy +
					(isSuccessful
						? this.joyImpacts.success
						: this.joyImpacts.failure),
				freeTime: state.freeTime - this.freeTimeReduction,
			};
		},
	}),

	// NoOp action factory
	createNoOpAction: (
		params: Omit<NoOpAction, "kind" | "modifier"> & {
			kind?: "no_op";
		}
	): NoOpAction => ({
		...params,
		kind: "no_op",
		timesApplied: params.timesApplied || 0,
		modifier: function (state) {
			this.timesApplied++;
			return state;
		},
	}),
};

// Helper to get an array of all action types for clients
const ActionTypes = {
	investment: "investment",
	job: "job",
	business: "business",
	property: "property",
	entertainment: "entertainment",
	purchase: "purchase",
	life_choice: "life_choice",
	education: "education",
	job_search: "job_search",
	no_op: "no_op",
} as const;

// Type for action kind (string literal union)
type ActionKind = (typeof ActionTypes)[keyof typeof ActionTypes];

// Using the factories to create the actions
const actions: Action[] = [
	// Investment actions
	ActionFactories.createInvestmentAction({
		name: "InvestBank",
		shortDescription: "Safe bank account with no returns",
		llmDescription: "Invest in a bank account - Safe but no returns",
		minBudget: 1000,
		riskLevel: "none",
		maxInvestmentPercent: 1.0,
		maxInvestmentAmount: Number.MAX_SAFE_INTEGER,
		baseReturnRate: 0.0,
		volatility: 0,
		joyImpact: 5,
		poll: (state) => state.budget > 1000,
		timesApplied: 0,
		id: Math.random().toString(36).substring(2, 15),
	}),

	ActionFactories.createInvestmentAction({
		name: "InvestSavings",
		shortDescription: "Low-risk savings with minimal returns",
		llmDescription:
			"Invest in a savings account - Safe with very low returns",
		minBudget: 1000,
		riskLevel: "very_low",
		maxInvestmentPercent: 0.3,
		maxInvestmentAmount: 10000,
		baseReturnRate: 0.003,
		volatility: 0,
		joyImpact: 7,
		poll: (state) => state.budget > 1000,
		timesApplied: 0,
		id: Math.random().toString(36).substring(2, 15),
	}),

	ActionFactories.createInvestmentAction({
		name: "InvestPension",
		shortDescription: "Safe pension account with low-medium returns",
		llmDescription:
			"Invest in a pension account - Safe with low-medium returns",
		minBudget: 5000,
		riskLevel: "low",
		maxInvestmentPercent: 0.2,
		maxInvestmentAmount: 20000,
		baseReturnRate: 0.025,
		volatility: 0.01,
		joyImpact: 10,
		poll: (state) => state.budget > 5000,
		timesApplied: 0,
		id: Math.random().toString(36).substring(2, 15),
	}),

	ActionFactories.createInvestmentAction({
		name: "InvestETF",
		shortDescription: "Medium-risk ETFs with medium returns",
		llmDescription: "Invest in ETFs - Medium risk with medium returns",
		minBudget: 2000,
		riskLevel: "medium",
		maxInvestmentPercent: 0.4,
		maxInvestmentAmount: 30000,
		baseReturnRate: 0.07,
		volatility: 0.05,
		joyImpact: 15,
		joyLossOnBadOutcome: 10,
		poll: (state) => state.budget > 2000,
		timesApplied: 0,
		id: Math.random().toString(36).substring(2, 15),
	}),

	ActionFactories.createInvestmentAction({
		name: "InvestStocks",
		shortDescription: "High-risk stocks with potentially high returns",
		llmDescription:
			"Invest in stocks - High risk with potentially high returns",
		minBudget: 2000,
		riskLevel: "high",
		maxInvestmentPercent: 0.25,
		maxInvestmentAmount: 25000,
		baseReturnRate: 0.15,
		volatility: 0.15,
		joyImpact: 20,
		joyLossOnBadOutcome: 20,
		poll: (state) => state.budget > 2000,
		timesApplied: 0,
		id: Math.random().toString(36).substring(2, 15),
	}),

	ActionFactories.createInvestmentAction({
		name: "InvestCrypto",
		shortDescription: "Very high-risk cryptocurrency with volatile returns",
		llmDescription:
			"Invest in cryptocurrency - Very high risk with volatile returns",
		minBudget: 1000,
		riskLevel: "very_high",
		maxInvestmentPercent: 0.1,
		maxInvestmentAmount: 10000,
		baseReturnRate: 0.35,
		volatility: 0.35,
		joyImpact: 25,
		joyLossOnBadOutcome: 30,
		poll: (state) => state.budget > 1000,
		timesApplied: 0,
		id: Math.random().toString(36).substring(2, 15),
	}),

	ActionFactories.createInvestmentAction({
		name: "InvestGold",
		shortDescription: "Medium-high risk gold investment",
		llmDescription:
			"Invest in gold - Medium-high risk, good hedge against market crashes",
		minBudget: 3000,
		riskLevel: "medium",
		maxInvestmentPercent: 0.15,
		maxInvestmentAmount: 15000,
		baseReturnRate: 0.07,
		volatility: 0.05,
		joyImpact: 8,
		poll: (state) => state.budget > 3000,
		timesApplied: 0,
		id: Math.random().toString(36).substring(2, 15),
	}),

	// Job actions
	ActionFactories.createJobAction({
		name: "GetBasicJob",
		shortDescription: "40-hour job without education requirement",
		llmDescription: "Get a 40-hour job without education requirement",
		requiredFreeTime: 40,
		incomeAmount: 2500,
		freeTimeReduction: 40,
		joyImpact: 10,
		poll: (state) => state.freeTime > 40,
		timesApplied: 0,
		id: Math.random().toString(36).substring(2, 15),
	}),

	ActionFactories.createJobAction({
		name: "GetEducatedJob",
		shortDescription: "40-hour job requiring education",
		llmDescription: "Get a 40-hour job requiring education",
		requiredFreeTime: 40,
		incomeAmount: 4000,
		freeTimeReduction: 40,
		joyImpact: 15,
		poll: (state) => state.freeTime > 40,
		timesApplied: 0,
		id: Math.random().toString(36).substring(2, 15),
	}),

	ActionFactories.createJobAction({
		name: "GetIntensiveJob",
		shortDescription: "60-80 hour job without education",
		llmDescription: "Get a 60-80 hour job without education",
		requiredFreeTime: 80,
		incomeAmount: 4000,
		freeTimeReduction: 70,
		joyImpact: -5,
		poll: (state) => state.freeTime > 80,
		timesApplied: 0,
		id: Math.random().toString(36).substring(2, 15),
	}),

	ActionFactories.createJobAction({
		name: "GetIntensiveEducatedJob",
		shortDescription: "60-80 hour job requiring education",
		llmDescription: "Get a 60-80 hour job requiring education",
		requiredFreeTime: 80,
		incomeAmount: 7000,
		freeTimeReduction: 70,
		joyImpact: 5,
		poll: (state) => state.freeTime > 80,
		timesApplied: 0,
		id: Math.random().toString(36).substring(2, 15),
	}),

	// Business action
	ActionFactories.createBusinessAction({
		name: "StartBusiness",
		shortDescription: "Start your own business",
		llmDescription: "Start your own business",
		initialInvestment: 10000,
		minBudget: 10000,
		requiredFreeTime: 60,
		freeTimeReduction: 60,
		successProbability: {
			high: 0.7,
			medium: 0.4,
		},
		returns: {
			high: 0.5,
			medium: 0.1,
			low: -0.3,
		},
		joyImpact: {
			success: 25,
			failure: -15,
		},
		poll: (state) => state.budget > 10000 && state.freeTime > 60,
		timesApplied: 0,
		id: Math.random().toString(36).substring(2, 15),
	}),

	// Property action
	ActionFactories.createPropertyAction({
		name: "RentProperty",
		shortDescription: "Rent out a property",
		llmDescription: "Rent out a property",
		propertyValue: 50000,
		rentalYield: 0.007,
		freeTimeReduction: 5,
		joyImpact: 15,
		poll: (state) => state.budget > 50000,
		timesApplied: 0,
		id: Math.random().toString(36).substring(2, 15),
	}),

	// Entertainment actions
	ActionFactories.createEntertainmentAction({
		name: "BasicFun",
		shortDescription: "Basic entertainment",
		llmDescription: "Have some basic entertainment like going to cinema",
		cost: 50,
		joyImpact: 10,
		freeTimeReduction: 2,
		poll: (state) => state.budget > 50,
		timesApplied: 0,
		id: Math.random().toString(36).substring(2, 15),
	}),

	ActionFactories.createEntertainmentAction({
		name: "MediumFun",
		shortDescription: "Medium-cost entertainment",
		llmDescription: "Have medium-cost entertainment like a weekend trip",
		cost: 500,
		joyImpact: 25,
		freeTimeReduction: 10,
		poll: (state) => state.budget > 500,
		timesApplied: 0,
		id: Math.random().toString(36).substring(2, 15),
	}),

	ActionFactories.createEntertainmentAction({
		name: "ExpensiveFun",
		shortDescription: "Expensive entertainment",
		llmDescription: "Have expensive entertainment like a luxury vacation",
		cost: 5000,
		joyImpact: 50,
		freeTimeReduction: 20,
		poll: (state) => state.budget > 5000,
		timesApplied: 0,
		id: Math.random().toString(36).substring(2, 15),
	}),

	// Purchase actions
	ActionFactories.createPurchaseAction({
		name: "BuyHouse",
		shortDescription: "Purchase a house",
		llmDescription: "Purchase a house",
		cost: 100000,
		joyImpact: 40,
		freeTimeImpact: -10,
		poll: (state) => state.budget > 100000,
		timesApplied: 0,
		id: Math.random().toString(36).substring(2, 15),
	}),

	ActionFactories.createPurchaseAction({
		name: "BuyCar",
		shortDescription: "Purchase a car",
		llmDescription: "Purchase a car",
		cost: 20000,
		joyImpact: 30,
		freeTimeImpact: 5,
		poll: (state) => state.budget > 20000,
		timesApplied: 0,
		id: Math.random().toString(36).substring(2, 15),
	}),

	// Life choice actions
	ActionFactories.createLifeChoiceAction({
		name: "HaveKids",
		shortDescription: "Have children",
		llmDescription: "Have children",
		initialCost: 10000,
		ongoingBudgetImpact: 0,
		joyImpact: 60,
		freeTimeImpact: -40,
		minBudget: 30000,
		minFreeTime: 20,
		poll: (state) => state.budget > 30000 && state.freeTime > 20,
		timesApplied: 0,
		id: Math.random().toString(36).substring(2, 15),
	}),

	// Education action
	ActionFactories.createEducationAction({
		name: "GetEducation",
		shortDescription: "Invest in education",
		llmDescription: "Invest in education",
		cost: 10000,
		joyImpact: 20,
		freeTimeReduction: 20,
		poll: (state) => state.budget > 10000 && state.freeTime > 20,
		timesApplied: 0,
		id: Math.random().toString(36).substring(2, 15),
	}),

	// Job search action
	ActionFactories.createJobSearchAction({
		name: "ChangeJobs",
		shortDescription: "Look for a new job",
		llmDescription: "Look for a new job",
		requiredFreeTime: 10,
		freeTimeReduction: 5,
		successRate: 0.5,
		salaryIncrease: 500,
		joyImpacts: {
			success: 15,
			failure: -5,
		},
		poll: (state) => state.freeTime > 10,
		timesApplied: 0,
		id: Math.random().toString(36).substring(2, 15),
	}),

	ActionFactories.createLifeChoiceAction({
		name: "GetMarried",
		shortDescription: "Get married",
		llmDescription: "Get married",
		initialCost: 20000,
		ongoingBudgetImpact: 1000,
		joyImpact: 70,
		freeTimeImpact: -10,
		minBudget: 20000,
		minJoy: 50,
		poll: (state) => state.budget > 20000 && state.joy > 50,
		timesApplied: 0,
		id: Math.random().toString(36).substring(2, 15),
	}),

	ActionFactories.createNoOpAction({
		name: "NoOp",
		shortDescription: "Do nothing",
		llmDescription: "Do nothing",
		poll: (state) => true,
		timesApplied: 0,
		id: Math.random().toString(36).substring(2, 15),
	}),
];

// Export the type registry and factories for client use
export { ActionTypes, ActionFactories, actions };
