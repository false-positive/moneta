import { Action, ActionKind } from ".";
import { z } from "zod";
import { Quest } from "../quests";
import { lifeAction } from "./standard-actions";
import invariant from "tiny-invariant";
import { FieldValues } from "react-hook-form";

/**
 * The required properties that must be present in any action template.
 * These properties are mandatory regardless of whether the template is constant or customizable.
 */
interface RequiredActionProperties {
	kind: ActionKind;
	name: string;
	shortDescription: string;
	llmDescription: string;
	remainingSteps: number;
}

/**
 * The base interface for all action templates.
 * Contains common properties that are shared between constant and customizable templates.
 */
interface ActionTemplateBase {
	/**
	 * A unique numeric identifier for the action template.
	 * This is used to track which templates have been applied and to reference templates.
	 */
	id: number;

	/**
	 * The icon image href of the action.
	 * This is displayed in the action tree visualization and action details panel.
	 */
	iconImageHref: string;

	/**
	 * The position of the action template in the action tree.
	 * This is used to determine the order of the action templates in the tree.
	 *
	 * FIXME: Remove this once we have a proper positioning system.
	 */
	hardcodedPosition: {
		x: number;
		y: number;
	};

	/**
	 * Whether this action template is unlocked for the given quest state.
	 * Used to progressively reveal actions as the user advances in the quest.
	 *
	 * @param quest - The current quest state to check against
	 * @returns Whether the template should be available to the user
	 */
	isUnlocked: (quest: Quest) => boolean;
}

/**
 * A constant action template that contains a predefined action with fixed properties.
 * Used for simple actions that don't require user customization.
 */
interface ConstantActionTemplate extends ActionTemplateBase {
	templateKind: "constant";
	action: Action;
}

/**
 * A customizable action template that allows user configuration through a form schema.
 * Used for actions that need user input to be fully defined.
 *
 * @template TBaseAction - The type of the base action, must include required properties
 * @template TUserInput - The Zod schema shape for user input
 */
interface CustomizableActionTemplate<
	TBaseAction extends Partial<Action> &
		RequiredActionProperties = Partial<Action> & RequiredActionProperties,
	TUserInput extends z.ZodRawShape = z.ZodRawShape
> extends ActionTemplateBase {
	templateKind: "user-customizable";
	/**
	 * The base action that contains the unchangeable properties.
	 * Must include all required properties, but other properties are optional.
	 */
	baseAction: TBaseAction;
	/**
	 * The Zod schema that defines and validates user input.
	 * Used to generate forms and validate user input before creating the action.
	 */
	userInputSchema: z.ZodObject<TUserInput>;
	/**
	 * Function that combines the base action with user input to create the final action.
	 *
	 * @param baseAction - The template's base action
	 * @param userInput - The validated user input
	 * @returns The complete action with all properties defined
	 */
	apply: (
		baseAction: TBaseAction,
		userInput: z.infer<z.ZodObject<TUserInput>>
	) => Action;
}

/**
 * A template for an action.
 *
 * An action template is a definition of an action that can be created by the user.
 * It defines the values of each property of an action, as well as the schema the user may use to customize it.
 */
export type ActionTemplate =
	| ConstantActionTemplate
	| CustomizableActionTemplate;

let id = 0;

/**
 * Creates an action template with a unique ID.
 * This is a private helper function used by the public template creation functions.
 *
 * @param template - The template to create, without an ID
 * @returns The complete template with a unique ID
 */
function createActionTemplate(
	template: Omit<ConstantActionTemplate, "id">
): ActionTemplate;
function createActionTemplate<
	TBaseAction extends Partial<Action> & RequiredActionProperties,
	TUserInput extends z.ZodRawShape
>(
	template: Omit<CustomizableActionTemplate<TBaseAction, TUserInput>, "id">
): ActionTemplate;
function createActionTemplate(
	template:
		| Omit<ConstantActionTemplate, "id">
		| Omit<CustomizableActionTemplate, "id">
) {
	return { id: ++id, ...template };
}

/**
 * Creates a constant action template.
 * Use this for actions that don't require any user input.
 *
 * @param params - The template parameters without ID and templateKind
 * @returns A constant action template
 */
export function createConstantTemplate(
	params: Omit<ConstantActionTemplate, "id" | "templateKind">
) {
	return createActionTemplate({
		templateKind: "constant",
		...params,
	});
}

/**
 * Creates a customizable action template.
 * Use this for actions that need user input to be fully defined.
 *
 * @template TBaseAction - The type of the base action, must include required properties
 * @template TUserInput - The Zod schema shape for user input
 * @param params - The template parameters without ID and templateKind
 * @returns A customizable action template
 */
export function createCustomizableTemplate<
	TBaseAction extends Partial<Action> & RequiredActionProperties,
	TUserInput extends z.ZodRawShape
>(
	params: Omit<
		CustomizableActionTemplate<TBaseAction, TUserInput>,
		"id" | "templateKind"
	>
) {
	return createActionTemplate({
		templateKind: "user-customizable",
		...params,
	});
}

/**
 * Applies an action template to create a concrete action.
 * For constant templates, returns the predefined action.
 * For customizable templates, combines the base action with user input.
 *
 * @template TUserInput - The Zod schema shape for user input
 * @param actionTemplate - The template to apply
 * @param userInput - The user input to apply to the template
 * @returns A concrete action with all properties defined
 */
export function applyActionTemplate<TUserInput extends z.ZodRawShape>(
	actionTemplate: ActionTemplate,
	userInput: z.infer<z.ZodObject<TUserInput>>
) {
	if (actionTemplate.templateKind === "constant") {
		return { ...actionTemplate.action, templateId: actionTemplate.id };
	}

	if (actionTemplate.templateKind === "user-customizable") {
		const action = actionTemplate.apply(
			actionTemplate.baseAction,
			userInput
		);
		return { ...action, templateId: actionTemplate.id };
	}

	// @ts-expect-error: This will never be reached and if it does, it's a bug
	actionTemplate.templateKind;
	invariant(false);
}

/**
 * Gets the base action from a template.
 * For constant templates, returns the predefined action.
 * For customizable templates, returns the base action.
 *
 * @param actionTemplate - The template to get the action from
 * @returns The action or base action from the template
 */
export function getAction(actionTemplate: ActionTemplate) {
	if (actionTemplate.templateKind === "constant") {
		return actionTemplate.action;
	}

	if (actionTemplate.templateKind === "user-customizable") {
		return actionTemplate.baseAction;
	}

	// @ts-expect-error: This will never be reached and if it does, it's a bug
	actionTemplate.templateKind;
	invariant(false);
}
