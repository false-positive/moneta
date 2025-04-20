import { tutorialQuestDescription } from "./00-tutorial-quest-description";

/**
 * A list of all available quest descriptions.
 *
 * The keys are the IDs of the quests, and the values are the quest descriptions.
 */
export const questDescriptions = {
	tutorial: tutorialQuestDescription,
} as const;

type QuestDescriptionID = keyof typeof questDescriptions;

/**
 * A list of all available quest descriptions, as shown in the quest selection UI.
 * This only shows the quest descriptions that are released to the public.
 */
export const questSelectionList = [
	"tutorial",
] as const satisfies QuestDescriptionID[];
