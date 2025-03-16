import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const searchResultSchema = z.object({
  blockNo: z.string(),
  partNo: z.string(),
  thickness: z.string(),
  nos: z.string(),
  color1: z.string(),
  color2: z.string()
});

export type SearchResult = z.infer<typeof searchResultSchema>;
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
