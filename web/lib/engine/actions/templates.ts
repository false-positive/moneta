import { Action, ActionKind } from ".";
import { z } from "zod";
import { Quest } from "../quests";
import { lifeAction } from "./standard-actions";
import invariant from "tiny-invariant";
import { FieldValues } from "react-hook-form";

// Define what's required in an action
interface RequiredActionProperties {
	kind: ActionKind;
	name: string;
	shortDescription: string;
	llmDescription: string;
	remainingSteps: number;
}

interface ActionTemplateBase {
	/**
	 * A unique numeric identifier for the action template.
	 */
	id: number;
	/**
	 * The icon image href of the action.
	 */
	iconImageHref: string;

	/**
	 * The position of the action template in the action template tree.
	 *
	 * This is used to determine the order of the action templates in the tree.
	 *
	 * FIXME: Remove this once we have a proper positioning system.
	 */
	hardcodedPosition: {
		x: number;
		y: number;
	};

	/**
	 * Whether this action template is unlocked for the given quest state
	 */
	isUnlocked: (quest: Quest) => boolean;
}

interface ConstantActionTemplate extends ActionTemplateBase {
	templateKind: "constant";
	action: Action;
}

interface CustomizableActionTemplate<
	TBaseAction extends Partial<Action> &
		RequiredActionProperties = Partial<Action> & RequiredActionProperties,
	TUserInput extends z.ZodRawShape = z.ZodRawShape
> extends ActionTemplateBase {
	templateKind: "user-customizable";
	baseAction: TBaseAction;
	userInputSchema: z.ZodObject<TUserInput>;
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

// Private helper function for creating templates
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

export function createConstantTemplate(
	params: Omit<ConstantActionTemplate, "id" | "templateKind">
) {
	return createActionTemplate({
		templateKind: "constant",
		...params,
	});
}

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
