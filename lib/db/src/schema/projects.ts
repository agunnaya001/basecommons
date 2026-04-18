import { pgTable, text, integer, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const projectsTable = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  onChainId: text("on_chain_id"),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  category: text("category"),
  website: text("website"),
  twitterHandle: text("twitter_handle"),
  recipientAddress: text("recipient_address").notNull(),
  totalDonationsWei: text("total_donations_wei").notNull().default("0"),
  donorCount: integer("donor_count").notNull().default(0),
  estimatedMatchWei: text("estimated_match_wei").notNull().default("0"),
  cycleId: integer("cycle_id").notNull().default(1),
  active: boolean("active").notNull().default(true),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projectsTable).omit({
  id: true,
  totalDonationsWei: true,
  donorCount: true,
  estimatedMatchWei: true,
  cycleId: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projectsTable.$inferSelect;
