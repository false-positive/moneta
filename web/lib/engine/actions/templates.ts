import { Action } from ".";
import { z } from "zod";
import { Quest } from "../quests";
import { lifeAction } from "./standard-actions";
import invariant from "tiny-invariant";

// Things we need to display in the choices UI
type RequiredActionKeys =
	| "kind"
	| "name"
	| "shortDescription"
	| "llmDescription";

interface InitialAction
	extends Omit<Partial<Action>, RequiredActionKeys>,
		Pick<Action, RequiredActionKeys> {}

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
}

type IsUnlockedFn<TActionTemplate extends ActionTemplateBase> = (
	quest: Quest,
	actionTemplate: TActionTemplate
) => boolean;

interface ConstantActionTemplate extends ActionTemplateBase {
	templateKind: "constant";
	action: Action;
	isUnlocked: IsUnlockedFn<ConstantActionTemplate>;
}

export interface CustomizableActionTemplate<
	TInitialAction extends InitialAction = InitialAction,
	TUserInput = unknown
> extends ActionTemplateBase {
	templateKind: "user-customizable";

	/**
	 * Default values and base descriptions of the action.
	 *
	 * Properties like its kind, name and descriptions are required. The rest can be optionally provided
	 */
	initialAction: TInitialAction;

	isUnlocked: IsUnlockedFn<
		CustomizableActionTemplate<TInitialAction, TUserInput>
	>;

	userInputSchema: z.Schema<TUserInput>;
	apply: (
		this: void,
		initialAction: TInitialAction,
		userInput: TUserInput
	) => Omit<Action, "templateId">;
}

/**
 * A template for an action.
 *
 * An action template is a definition of an action that can be created by the user.
 * It defines the values of each property of an action, as well as the schema the user may use to customize it.
 */
export type ActionTemplate<
	TInitialAction extends InitialAction = InitialAction,
	TUserInput = unknown
> =
	| ConstantActionTemplate
	| CustomizableActionTemplate<TInitialAction, TUserInput>;

let id = 0;

export const createActionTemplate = <
	TInitialAction extends InitialAction,
	TObject
>(
	// FIXME: Cursed type stuff
	actionTemplate:
		| Omit<ConstantActionTemplate, "id">
		| Omit<CustomizableActionTemplate<TInitialAction, TObject>, "id">
): ActionTemplate<TInitialAction, TObject> => {
	return { id: ++id, ...actionTemplate };
};

export const createActionTemplates = <
	TInitialAction extends InitialAction,
	TObject
>(
	// FIXME: More cursed type stuff
	actionTemplateArray: ReadonlyArray<
		Parameters<typeof createActionTemplate<TInitialAction, TObject>>[0]
	>
): ReadonlyArray<ActionTemplate<TInitialAction, TObject>> =>
	actionTemplateArray.map((actionTemplate) =>
		createActionTemplate(actionTemplate)
	);

export function applyActionTemplate<
	TInitialAction extends InitialAction,
	TUserInput
>(
	actionTemplate: ActionTemplate<TInitialAction, TUserInput>,
	userInput: TUserInput
) {
	if (actionTemplate.templateKind === "constant") {
		return { ...actionTemplate.action, templateId: actionTemplate.id };
	}

	if (actionTemplate.templateKind === "user-customizable") {
		const action = actionTemplate.apply(
			actionTemplate.initialAction,
			userInput
		);
		return { ...action, templateId: actionTemplate.id };
	}

	// @ts-expect-error: This will never be reached and if it does, it's a bug
	actionTemplate.templateKind;
	invariant(false);
}

export function getAction<TInitialAction extends InitialAction, TUserInput>(
	actionTemplate: ActionTemplate<TInitialAction, TUserInput>
) {
	if (actionTemplate.templateKind === "constant") {
		return actionTemplate.action;
	}

	if (actionTemplate.templateKind === "user-customizable") {
		return actionTemplate.initialAction;
	}

	// @ts-expect-error: This will never be reached and if it does, it's a bug
	actionTemplate.templateKind;
	invariant(false);
}
