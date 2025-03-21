import {Action} from "@/lib/cases/actions";
import {allActionsList} from "@/lib/cases/standard-actions";

export interface Node {
  id: string
  name: string
  description: string
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
  {
    id: "core",
    name: "Core Skill",
    description: "The foundation of all other skills",
    unlocked: true,
    x: 300,
    y: 200,
    icon: "/icons/core.svg",
    actionObject: allActionsList.lifeAction
  },
  { id: "skill1", name: "Skill 1", description: "First branch skill", unlocked: false, x: 275, y: 175, icon: "/icons/skill1.svg", actionObject: allActionsList.sweJobAction },
  { id: "skill2", name: "Skill 2", description: "Second branch skill", unlocked: false, x: 325, y: 175, icon: "/icons/skill2.svg", actionObject: allActionsList.waiterJobAction },
  { id: "skill3", name: "Skill 3", description: "Third branch skill", unlocked: false, x: 275, y: 225, icon: "/icons/skill3.svg", actionObject: allActionsList.savingsDepositAction },
]

export const links: Link[] = [
  { source: "core", target: "skill1" },
  { source: "core", target: "skill2" },
  { source: "core", target: "skill3" },
]
