import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { projectsTable } from "./projects";

export const donationsTable = pgTable("donations", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  donorAddress: text("donor_address").notNull(),
  amountWei: text("amount_wei").notNull(),
  txHash: text("tx_hash"),
  cycleId: integer("cycle_id").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDonationSchema = createInsertSchema(donationsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donationsTable.$inferSelect;
