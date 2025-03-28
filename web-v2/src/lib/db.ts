import Dexie, { type EntityTable } from "dexie";

export type Profile = {
  id: number;
  nickname: string;
};

export const db = new Dexie("Moneta") as Dexie & {
  profiles: EntityTable<Profile, "id">;
};

db.version(1).stores({
  profiles: "++id, nickname",
});
