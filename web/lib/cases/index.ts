import { Action } from "./actions";

import { Step } from "./actions";

export type Case = {
  personName: string;
  caseLLMDescriptipn: string;
  initialStep: Step;
};

export function applyNewAction(steps: Step[], action: Action) {
  return steps.map((step) => {
    if (action.poll(step)) {
      return (
        action.modifier as (this: typeof action, state: Step) => Step
      ).call(action, step);
    }
    return step;
  });
}
