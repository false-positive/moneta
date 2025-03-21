import {Action} from "@/lib/cases/actions";
import {allActionsList as a1} from "@/lib/cases/standard-actions";
import {
  allActionsList as a2
} from "@/lib/cases/actions-18";

export const allActionsList = {...a1, ...a2};

export interface Node {
  id: string
  unlocked: boolean
  icon: string
  actionObject: Action
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

interface Link {
  source: string
  target: string
}

export const initialNodes: Node[] = [
  { id: "lifeAction", unlocked: true, x: 600, y: 300, icon: "/icons/lifeAction.svg", actionObject: allActionsList.lifeAction },

  { id: "liveWithParentsAction", unlocked: false, x: 575, y: 275, icon: "/icons/liveWithParentsAction.png", actionObject: allActionsList.liveWithParentsAction },
  { id: "savingsDepositAction", unlocked: false, x: 625, y: 275, icon: "/icons/savingsDepositAction.png", actionObject: allActionsList.savingsDepositAction },
  { id: "pensionDepositAction", unlocked: false, x: 650, y: 250, icon: "/icons/pensionDepositAction.svg", actionObject: allActionsList.pensionDepositAction },
  { id: "etfInvestmentOnceAction", unlocked: false, x: 650, y: 300, icon: "/icons/etfInvestmentOnceAction.png", actionObject: allActionsList.etfInvestmentOnceAction },
  { id: "etfInvestmentRepeatedAction", unlocked: false, x: 675, y: 325, icon: "/icons/etfInvestmentRepeatedAction.png", actionObject: allActionsList.etfInvestmentRepeatedAction },
  { id: "stocksInvestmentAction", unlocked: false, x: 675, y: 275, icon: "/icons/stocksInvestmentAction.png", actionObject: allActionsList.stocksInvestmentAction },
  { id: "cryptoInvestmentAction", unlocked: false, x: 700, y: 250, icon: "/icons/cryptoInvestmentAction.png", actionObject: allActionsList.cryptoInvestmentAction },
  { id: "goldInvestmentAction", unlocked: false, x: 725, y: 275, icon: "/icons/goldInvestmentAction.png", actionObject: allActionsList.goldInvestmentAction },

  { id: "skiTripAction", unlocked: false, x: 575, y: 325, icon: "/icons/skiTripAction.png", actionObject: allActionsList.skiTripAction },
  { id: "hobbyMotorbikeRidingAction", unlocked: false, x: 550, y: 300, icon: "/icons/hobbyMotorbikeRidingAction.png", actionObject: allActionsList.hobbyMotorbikeRidingAction },
  { id: "partyingAction", unlocked: false, x: 550, y: 350, icon: "/icons/partyingAction.png", actionObject: allActionsList.partyingAction },
  { id: "havingAKidAction", unlocked: false, x: 600, y: 350, icon: "/icons/havingAKidAction.png", actionObject: allActionsList.havingAKidAction },

  { id: "waiterPartTimeJobAction", unlocked: false, x: 600, y: 250, icon: "/icons/waiterPartTimeJobAction.png", actionObject: allActionsList.waiterPartTimeJobAction },
  { id: "waiterFullTimeJobAction", unlocked: false, x: 625, y: 225, icon: "/icons/waiterFullTimeJobAction.png", actionObject: allActionsList.waiterFullTimeJobAction },
  { id: "juniorSweJobAction", unlocked: false, x: 575, y: 225, icon: "/icons/juniorSweJobAction.png", actionObject: allActionsList.juniorSweJobAction },
  { id: "seniorSweJobAction", unlocked: false, x: 600, y: 200, icon: "/icons/seniorSweJobAction.png", actionObject: allActionsList.seniorSweJobAction },
]

export const links: Link[] = [
  { source: "lifeAction", target: "liveWithParentsAction" },
  { source: "lifeAction", target: "savingsDepositAction" },
  { source: "etfInvestmentOnceAction", target: "etfInvestmentRepeatedAction" },
]
