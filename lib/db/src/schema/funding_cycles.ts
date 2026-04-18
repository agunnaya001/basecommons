import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";

export const fundingCyclesTable = pgTable("funding_cycles", {
  id: uuid("id").primaryKey().defaultRandom(),
  cycleId: integer("cycle_id").notNull().unique(),
  totalMatchingDistributedWei: text("total_matching_distributed_wei").notNull().default("0"),
  projectCount: integer("project_count").notNull().default(0),
  donationCount: integer("donation_count").notNull().default(0),
  uniqueDonors: integer("unique_donors").notNull().default(0),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type FundingCycle = typeof fundingCyclesTable.$inferSelect;
