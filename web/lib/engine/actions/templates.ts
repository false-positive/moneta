import { Action } from ".";
import { z } from "zod";
import { Quest } from "../quests";
import { lifeAction } from "./standard-actions";

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
	 * The icon image href of the action.
	 */
	iconImageHref: string;
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
	) => Action;
}

type CreateActionOptions<
	TInitialAction extends InitialAction = InitialAction,
	TUserInput = unknown
> =
	| { actionTemplate: ConstantActionTemplate }
	| {
			actionTemplate: CustomizableActionTemplate<
				TInitialAction,
				TUserInput
			>;
			userInput: TUserInput;
	  };

/**
 * A template for an action.
 *
 * An action template is a definition of an action that can be created by the user.
 * It defines the values of each property of an action, as well as the schema the user may use to customize it.
 */
export type ActionTemplate<
	TInitialAction extends InitialAction = InitialAction,
	TUserInput = unknown
> = CreateActionOptions<TInitialAction, TUserInput>["actionTemplate"];

export const createActionTemplates = <
	TInitialAction extends InitialAction,
	TObject
>(
	actionTemplateArray: ReadonlyArray<ActionTemplate<TInitialAction, TObject>>
) => actionTemplateArray;
