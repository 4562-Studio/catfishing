import * as schema from "./schema";
import { drizzle } from "drizzle-orm/libsql";
import env from "../util/env";

export const db = drizzle(env.DATABASE_URL, {
  schema,
});
