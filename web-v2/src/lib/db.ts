import { defaultProfile, type Profile } from "@/game/profile";
import Dexie, { type EntityTable } from "dexie";

type ProfileWithID = Profile & { id: number };

export const db = new Dexie("Moneta") as Dexie & {
  profiles: EntityTable<ProfileWithID>;
};

db.version(1).stores({
  profiles: "++id, nickname",
});

db.on("populate", (tx) => {
  tx.table("profiles").add({
    id: 1,
    ...defaultProfile,
  } satisfies ProfileWithID);
});
