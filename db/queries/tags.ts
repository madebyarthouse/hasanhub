import { asc } from "drizzle-orm";
import { Tag } from "../schema";
import type { ReturnTypeOrDb } from "./types";

export const listTags = (db: ReturnTypeOrDb) => {
  return db.select().from(Tag).orderBy(asc(Tag.name));
};
