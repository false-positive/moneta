import { defaultProfile } from "@/game/profile";
import { createStore } from "@xstate/store";

export const store = createStore({
  // Initial context
  context: {
    profile: defaultProfile,
  },
  // Transitions
  on: {
    changeNickname: (context, event: { newNickname: string }) => ({
      ...context,
      name: event.newNickname,
    }),
  },
});
