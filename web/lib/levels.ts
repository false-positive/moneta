type Step = {
  tick: number;
  budget: number;
  isBudgetKnown: boolean;
  happiness: number;
  isHappinessKnown: boolean;
  freeTime: number;
  isFreeTimeKnown: boolean;
  // Actions, which were introduced in this step
  newActions: Action[];
  // Actions, which were applied up to this step (including the new ones, minus the old ones)
  appliedActions: Action[];
};

// Base Action type with discriminated union via 'kind' property
type Action =
  | InvestmentAction
  | JobAction
  | BusinessAction
  | PropertyAction
  | EntertainmentAction
  | PurchaseAction
  | LifeChoiceAction
  | EducationAction
  | JobSearchAction;

// Base type for all actions
type BaseAction = {
  name: string;
  shortDescription: string; // Short description for UI display
  llmDescription: string; // Detailed description for LLM context
  kind: string;
  poll: (state: Step) => boolean;
};

// Investment action type
type InvestmentAction = BaseAction & {
  kind: "investment";
  minBudget: number;
  riskLevel: "none" | "very_low" | "low" | "medium" | "high" | "very_high";
  maxInvestmentPercent: number; // % of budget that can be invested
  maxInvestmentAmount: number; // max amount regardless of percentage
  baseReturnRate: number; // average return rate
  volatility: number; // 0-1, how volatile the returns are
  happinessImpact: number; // base happiness impact
  happinessLossOnBadOutcome?: number; // optional penalty on bad outcome
  modifier: (state: Step) => Step;
};

// Job action type
type JobAction = BaseAction & {
  kind: "job";
  requiredFreeTime: number;
  incomeAmount: number;
  freeTimeReduction: number;
  happinessImpact: number;
  modifier: (state: Step) => Step;
};

// Business action type
type BusinessAction = BaseAction & {
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
  happinessImpact: {
    success: number;
    failure: number;
  };
  modifier: (state: Step) => Step;
};

// Property action type
type PropertyAction = BaseAction & {
  kind: "property";
  propertyValue: number;
  rentalYield: number;
  freeTimeReduction: number;
  happinessImpact: number;
  modifier: (state: Step) => Step;
};

// Entertainment action type
type EntertainmentAction = BaseAction & {
  kind: "entertainment";
  cost: number;
  happinessImpact: number;
  freeTimeReduction: number;
  modifier: (state: Step) => Step;
};

// Major purchase action type
type PurchaseAction = BaseAction & {
  kind: "purchase";
  cost: number;
  happinessImpact: number;
  freeTimeImpact: number;
  modifier: (state: Step) => Step;
};

// Life choice action type
type LifeChoiceAction = BaseAction & {
  kind: "life_choice";
  initialCost: number;
  ongoingBudgetImpact: number;
  happinessImpact: number;
  freeTimeImpact: number;
  minBudget: number;
  minHappiness?: number;
  minFreeTime?: number;
  modifier: (state: Step) => Step;
};

// Education action type
type EducationAction = BaseAction & {
  kind: "education";
  cost: number;
  happinessImpact: number;
  freeTimeReduction: number;
  modifier: (state: Step) => Step;
};

// Job search action type
type JobSearchAction = BaseAction & {
  kind: "job_search";
  requiredFreeTime: number;
  freeTimeReduction: number;
  successRate: number;
  salaryIncrease: number;
  happinessImpacts: {
    success: number;
    failure: number;
  };
  modifier: (state: Step) => Step;
};

const actions: Action[] = [
  // Investment actions
  {
    name: "InvestBank",
    shortDescription: "Safe bank account with no returns",
    llmDescription: "Invest in a bank account - Safe but no returns",
    kind: "investment",
    minBudget: 1000,
    riskLevel: "none",
    maxInvestmentPercent: 1.0,
    maxInvestmentAmount: Number.MAX_SAFE_INTEGER,
    baseReturnRate: 0.0,
    volatility: 0,
    happinessImpact: 5,
    modifier: (state) => {
      return {
        ...state,
        happiness: state.happiness + 5, // Security feeling but no returns
      };
    },
    poll: (state) => state.budget > 1000,
  },
  {
    name: "InvestSavings",
    shortDescription: "Low-risk savings with minimal returns",
    llmDescription: "Invest in a savings account - Safe with very low returns",
    kind: "investment",
    minBudget: 1000,
    riskLevel: "very_low",
    maxInvestmentPercent: 0.3,
    maxInvestmentAmount: 10000,
    baseReturnRate: 0.003,
    volatility: 0,
    happinessImpact: 7,
    modifier: (state) => {
      const action = actions.find(
        (a) => a.name === "InvestSavings"
      ) as InvestmentAction;
      const investment = Math.min(
        state.budget * action.maxInvestmentPercent,
        action.maxInvestmentAmount
      );
      const returns = investment * action.baseReturnRate;

      return {
        ...state,
        budget: state.budget + returns,
        happiness: state.happiness + action.happinessImpact,
      };
    },
    poll: (state) => state.budget > 1000,
  },
  {
    name: "InvestPension",
    shortDescription: "Safe pension account with low-medium returns",
    llmDescription:
      "Invest in a pension account - Safe with low-medium returns",
    kind: "investment",
    minBudget: 5000,
    riskLevel: "low",
    maxInvestmentPercent: 0.2,
    maxInvestmentAmount: 20000,
    baseReturnRate: 0.025,
    volatility: 0.01,
    happinessImpact: 10,
    modifier: (state) => {
      const action = actions.find(
        (a) => a.name === "InvestPension"
      ) as InvestmentAction;
      const investment = Math.min(
        state.budget * action.maxInvestmentPercent,
        action.maxInvestmentAmount
      );
      const returns = investment * action.baseReturnRate;

      return {
        ...state,
        budget: state.budget + returns,
        happiness: state.happiness + action.happinessImpact,
      };
    },
    poll: (state) => state.budget > 5000,
  },
  {
    name: "InvestETF",
    shortDescription: "Medium-risk ETFs with medium returns",
    llmDescription: "Invest in ETFs - Medium risk with medium returns",
    kind: "investment",
    minBudget: 2000,
    riskLevel: "medium",
    maxInvestmentPercent: 0.4,
    maxInvestmentAmount: 30000,
    baseReturnRate: 0.07,
    volatility: 0.05,
    happinessImpact: 15,
    happinessLossOnBadOutcome: 10,
    modifier: (state) => {
      const action = actions.find(
        (a) => a.name === "InvestETF"
      ) as InvestmentAction;
      const investment = Math.min(
        state.budget * action.maxInvestmentPercent,
        action.maxInvestmentAmount
      );
      const marketLuck = Math.random();
      const actualReturns =
        marketLuck > 0.2
          ? investment * action.baseReturnRate
          : -investment * 0.03;

      return {
        ...state,
        budget: state.budget + actualReturns,
        happiness:
          state.happiness +
          (actualReturns > 0
            ? action.happinessImpact
            : -action.happinessLossOnBadOutcome!),
      };
    },
    poll: (state) => state.budget > 2000,
  },
  {
    name: "InvestStocks",
    shortDescription: "High-risk stocks with potentially high returns",
    llmDescription:
      "Invest in stocks - High risk with potentially high returns",
    kind: "investment",
    minBudget: 2000,
    riskLevel: "high",
    maxInvestmentPercent: 0.25,
    maxInvestmentAmount: 25000,
    baseReturnRate: 0.15,
    volatility: 0.15,
    happinessImpact: 20,
    happinessLossOnBadOutcome: 20,
    modifier: (state) => {
      const action = actions.find(
        (a) => a.name === "InvestStocks"
      ) as InvestmentAction;
      const investment = Math.min(
        state.budget * action.maxInvestmentPercent,
        action.maxInvestmentAmount
      );
      const marketLuck = Math.random();
      let actualReturns;

      if (marketLuck > 0.6) {
        actualReturns = investment * action.baseReturnRate;
      } else if (marketLuck > 0.3) {
        actualReturns = investment * (action.baseReturnRate / 3);
      } else {
        actualReturns = -investment * ((action.volatility * 2) / 3);
      }

      return {
        ...state,
        budget: state.budget + actualReturns,
        happiness:
          state.happiness +
          (actualReturns > 0
            ? action.happinessImpact
            : -action.happinessLossOnBadOutcome!),
      };
    },
    poll: (state) => state.budget > 2000,
  },
  {
    name: "InvestCrypto",
    shortDescription: "Very high-risk cryptocurrency with volatile returns",
    llmDescription:
      "Invest in cryptocurrency - Very high risk with volatile returns",
    kind: "investment",
    minBudget: 1000,
    riskLevel: "very_high",
    maxInvestmentPercent: 0.1,
    maxInvestmentAmount: 10000,
    baseReturnRate: 0.35,
    volatility: 0.35,
    happinessImpact: 25,
    happinessLossOnBadOutcome: 30,
    modifier: (state) => {
      const action = actions.find(
        (a) => a.name === "InvestCrypto"
      ) as InvestmentAction;
      const investment = Math.min(
        state.budget * action.maxInvestmentPercent,
        action.maxInvestmentAmount
      );
      const marketLuck = Math.random();
      let actualReturns;

      if (marketLuck > 0.7) {
        actualReturns = investment * action.baseReturnRate;
      } else if (marketLuck > 0.5) {
        actualReturns = investment * (action.baseReturnRate * 0.43);
      } else if (marketLuck > 0.3) {
        actualReturns = 0;
      } else {
        actualReturns = -investment * action.volatility;
      }

      return {
        ...state,
        budget: state.budget + actualReturns,
        happiness:
          state.happiness +
          (actualReturns > 0
            ? action.happinessImpact
            : -action.happinessLossOnBadOutcome!),
      };
    },
    poll: (state) => state.budget > 1000,
  },
  {
    name: "InvestGold",
    shortDescription: "Medium-high risk gold investment",
    llmDescription:
      "Invest in gold - Medium-high risk, good hedge against market crashes",
    kind: "investment",
    minBudget: 3000,
    riskLevel: "medium",
    maxInvestmentPercent: 0.15,
    maxInvestmentAmount: 15000,
    baseReturnRate: 0.07,
    volatility: 0.05,
    happinessImpact: 8,
    modifier: (state) => {
      const action = actions.find(
        (a) => a.name === "InvestGold"
      ) as InvestmentAction;
      const investment = Math.min(
        state.budget * action.maxInvestmentPercent,
        action.maxInvestmentAmount
      );
      const marketLuck = Math.random();
      const actualReturns =
        investment *
        (marketLuck > 0.5
          ? action.baseReturnRate
          : action.baseReturnRate * 0.3);

      return {
        ...state,
        budget: state.budget + actualReturns,
        happiness: state.happiness + action.happinessImpact,
      };
    },
    poll: (state) => state.budget > 3000,
  },

  // Income stream actions
  {
    name: "GetBasicJob",
    shortDescription: "40-hour job without education requirement",
    llmDescription: "Get a 40-hour job without education requirement",
    kind: "job",
    requiredFreeTime: 40,
    incomeAmount: 2500,
    freeTimeReduction: 40,
    happinessImpact: 10,
    modifier: (state) => {
      const action = actions.find((a) => a.name === "GetBasicJob") as JobAction;
      return {
        ...state,
        budget: state.budget + action.incomeAmount,
        freeTime: state.freeTime - action.freeTimeReduction,
        happiness: state.happiness + action.happinessImpact,
      };
    },
    poll: (state) => state.freeTime > 40,
  },
  {
    name: "GetEducatedJob",
    shortDescription: "40-hour job requiring education",
    llmDescription: "Get a 40-hour job requiring education",
    kind: "job",
    requiredFreeTime: 40,
    incomeAmount: 4000,
    freeTimeReduction: 40,
    happinessImpact: 15,
    modifier: (state) => {
      const action = actions.find(
        (a) => a.name === "GetEducatedJob"
      ) as JobAction;
      return {
        ...state,
        budget: state.budget + action.incomeAmount,
        freeTime: state.freeTime - action.freeTimeReduction,
        happiness: state.happiness + action.happinessImpact,
      };
    },
    poll: (state) => state.freeTime > 40,
  },
  {
    name: "GetIntensiveJob",
    shortDescription: "60-80 hour job without education",
    llmDescription: "Get a 60-80 hour job without education",
    kind: "job",
    requiredFreeTime: 80,
    incomeAmount: 4000,
    freeTimeReduction: 70,
    happinessImpact: -5,
    modifier: (state) => {
      const action = actions.find(
        (a) => a.name === "GetIntensiveJob"
      ) as JobAction;
      return {
        ...state,
        budget: state.budget + action.incomeAmount,
        freeTime: state.freeTime - action.freeTimeReduction,
        happiness: state.happiness + action.happinessImpact,
      };
    },
    poll: (state) => state.freeTime > 80,
  },
  {
    name: "GetIntensiveEducatedJob",
    shortDescription: "60-80 hour job requiring education",
    llmDescription: "Get a 60-80 hour job requiring education",
    kind: "job",
    requiredFreeTime: 80,
    incomeAmount: 7000,
    freeTimeReduction: 70,
    happinessImpact: 5,
    modifier: (state) => {
      const action = actions.find(
        (a) => a.name === "GetIntensiveEducatedJob"
      ) as JobAction;
      return {
        ...state,
        budget: state.budget + action.incomeAmount,
        freeTime: state.freeTime - action.freeTimeReduction,
        happiness: state.happiness + action.happinessImpact,
      };
    },
    poll: (state) => state.freeTime > 80,
  },
  {
    name: "StartBusiness",
    shortDescription: "Start your own business",
    llmDescription: "Start your own business",
    kind: "business",
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
    happinessImpact: {
      success: 25,
      failure: -15,
    },
    modifier: (state) => {
      const action = actions.find(
        (a) => a.name === "StartBusiness"
      ) as BusinessAction;
      const businessLuck = Math.random();
      let profit;

      if (businessLuck > action.successProbability.high) {
        profit = action.initialInvestment * action.returns.high;
      } else if (businessLuck > action.successProbability.medium) {
        profit = action.initialInvestment * action.returns.medium;
      } else {
        profit = action.initialInvestment * action.returns.low;
      }

      return {
        ...state,
        budget: state.budget + profit - action.initialInvestment,
        freeTime: state.freeTime - action.freeTimeReduction,
        happiness:
          state.happiness +
          (profit > 0
            ? action.happinessImpact.success
            : action.happinessImpact.failure),
      };
    },
    poll: (state) => state.budget > 10000 && state.freeTime > 60,
  },
  {
    name: "RentProperty",
    shortDescription: "Rent out a property",
    llmDescription: "Rent out a property",
    kind: "property",
    propertyValue: 50000,
    rentalYield: 0.007,
    freeTimeReduction: 5,
    happinessImpact: 15,
    modifier: (state) => {
      const action = actions.find(
        (a) => a.name === "RentProperty"
      ) as PropertyAction;
      const monthlyRent = action.propertyValue * action.rentalYield;

      return {
        ...state,
        budget: state.budget - action.propertyValue + monthlyRent,
        freeTime: state.freeTime - action.freeTimeReduction,
        happiness: state.happiness + action.happinessImpact,
      };
    },
    poll: (state) => state.budget > 50000,
  },

  // Expense actions
  {
    name: "BasicFun",
    shortDescription: "Basic entertainment",
    llmDescription: "Have some basic entertainment like going to cinema",
    kind: "entertainment",
    cost: 50,
    happinessImpact: 10,
    freeTimeReduction: 2,
    modifier: (state) => {
      const action = actions.find(
        (a) => a.name === "BasicFun"
      ) as EntertainmentAction;
      return {
        ...state,
        budget: state.budget - action.cost,
        happiness: state.happiness + action.happinessImpact,
        freeTime: state.freeTime - action.freeTimeReduction,
      };
    },
    poll: (state) => state.budget > 50,
  },
  {
    name: "MediumFun",
    shortDescription: "Medium-cost entertainment",
    llmDescription: "Have medium-cost entertainment like a weekend trip",
    kind: "entertainment",
    cost: 500,
    happinessImpact: 25,
    freeTimeReduction: 10,
    modifier: (state) => {
      const action = actions.find(
        (a) => a.name === "MediumFun"
      ) as EntertainmentAction;
      return {
        ...state,
        budget: state.budget - action.cost,
        happiness: state.happiness + action.happinessImpact,
        freeTime: state.freeTime - action.freeTimeReduction,
      };
    },
    poll: (state) => state.budget > 500,
  },
  {
    name: "ExpensiveFun",
    shortDescription: "Expensive entertainment",
    llmDescription: "Have expensive entertainment like a luxury vacation",
    kind: "entertainment",
    cost: 5000,
    happinessImpact: 50,
    freeTimeReduction: 20,
    modifier: (state) => {
      const action = actions.find(
        (a) => a.name === "ExpensiveFun"
      ) as EntertainmentAction;
      return {
        ...state,
        budget: state.budget - action.cost,
        happiness: state.happiness + action.happinessImpact,
        freeTime: state.freeTime - action.freeTimeReduction,
      };
    },
    poll: (state) => state.budget > 5000,
  },
  {
    name: "BuyHouse",
    shortDescription: "Purchase a house",
    llmDescription: "Purchase a house",
    kind: "purchase",
    cost: 100000,
    happinessImpact: 40,
    freeTimeImpact: -10,
    modifier: (state) => {
      const action = actions.find(
        (a) => a.name === "BuyHouse"
      ) as PurchaseAction;
      return {
        ...state,
        budget: state.budget - action.cost,
        happiness: state.happiness + action.happinessImpact,
        freeTime: state.freeTime + action.freeTimeImpact,
      };
    },
    poll: (state) => state.budget > 100000,
  },
  {
    name: "BuyCar",
    shortDescription: "Purchase a car",
    llmDescription: "Purchase a car",
    kind: "purchase",
    cost: 20000,
    happinessImpact: 30,
    freeTimeImpact: 5,
    modifier: (state) => {
      const action = actions.find((a) => a.name === "BuyCar") as PurchaseAction;
      return {
        ...state,
        budget: state.budget - action.cost,
        happiness: state.happiness + action.happinessImpact,
        freeTime: state.freeTime + action.freeTimeImpact,
      };
    },
    poll: (state) => state.budget > 20000,
  },
  {
    name: "HaveKids",
    shortDescription: "Have children",
    llmDescription: "Have children",
    kind: "life_choice",
    initialCost: 10000,
    ongoingBudgetImpact: 0,
    happinessImpact: 60,
    freeTimeImpact: -40,
    minBudget: 30000,
    minFreeTime: 20,
    modifier: (state) => {
      const action = actions.find(
        (a) => a.name === "HaveKids"
      ) as LifeChoiceAction;
      return {
        ...state,
        budget: state.budget - action.initialCost + action.ongoingBudgetImpact,
        happiness: state.happiness + action.happinessImpact,
        freeTime: state.freeTime + action.freeTimeImpact,
      };
    },
    poll: (state) => state.budget > 30000 && state.freeTime > 20,
  },

  // Other actions
  {
    name: "GetEducation",
    shortDescription: "Invest in education",
    llmDescription: "Invest in education",
    kind: "education",
    cost: 10000,
    happinessImpact: 20,
    freeTimeReduction: 20,
    modifier: (state) => {
      const action = actions.find(
        (a) => a.name === "GetEducation"
      ) as EducationAction;
      return {
        ...state,
        budget: state.budget - action.cost,
        happiness: state.happiness + action.happinessImpact,
        freeTime: state.freeTime - action.freeTimeReduction,
      };
    },
    poll: (state) => state.budget > 10000 && state.freeTime > 20,
  },
  {
    name: "ChangeJobs",
    shortDescription: "Look for a new job",
    llmDescription: "Look for a new job",
    kind: "job_search",
    requiredFreeTime: 10,
    freeTimeReduction: 5,
    successRate: 0.5,
    salaryIncrease: 500,
    happinessImpacts: {
      success: 15,
      failure: -5,
    },
    modifier: (state) => {
      const action = actions.find(
        (a) => a.name === "ChangeJobs"
      ) as JobSearchAction;
      const jobSearchLuck = Math.random();
      const isSuccessful = jobSearchLuck > 1 - action.successRate;
      const salaryIncrease = isSuccessful ? action.salaryIncrease : 0;

      return {
        ...state,
        budget: state.budget + salaryIncrease,
        happiness:
          state.happiness +
          (isSuccessful
            ? action.happinessImpacts.success
            : action.happinessImpacts.failure),
        freeTime: state.freeTime - action.freeTimeReduction,
      };
    },
    poll: (state) => state.freeTime > 10,
  },
  {
    name: "GetMarried",
    shortDescription: "Get married",
    llmDescription: "Get married",
    kind: "life_choice",
    initialCost: 20000,
    ongoingBudgetImpact: 1000,
    happinessImpact: 70,
    freeTimeImpact: -10,
    minBudget: 20000,
    minHappiness: 50,
    modifier: (state) => {
      const action = actions.find(
        (a) => a.name === "GetMarried"
      ) as LifeChoiceAction;
      return {
        ...state,
        budget: state.budget - action.initialCost + action.ongoingBudgetImpact,
        happiness: state.happiness + action.happinessImpact,
        freeTime: state.freeTime + action.freeTimeImpact,
      };
    },
    poll: (state) => state.budget > 20000 && state.happiness > 50,
  },
];
