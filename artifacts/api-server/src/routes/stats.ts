import { Router } from "express";
import { db, projectsTable, donationsTable, fundingCyclesTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";

const router = Router();

// GET /api/stats
router.get("/stats", async (req, res) => {
  try {
    const [projectStats] = await db
      .select({
        totalProjectCount: sql<number>`count(*)`,
        activeProjectCount: sql<number>`count(*) filter (where ${projectsTable.active} = true)`,
        totalDonationsWei: sql<string>`COALESCE(SUM(CAST(${projectsTable.totalDonationsWei} AS NUMERIC)), 0)::text`,
        totalDonorCount: sql<number>`COALESCE(SUM(${projectsTable.donorCount}), 0)`,
      })
      .from(projectsTable);

    const [donorStats] = await db
      .select({
        totalUniqueDonors: sql<number>`count(distinct ${donationsTable.donorAddress})`,
      })
      .from(donationsTable);

    const [cycleStats] = await db
      .select({
        currentCycleId: sql<number>`COALESCE(MAX(${projectsTable.cycleId}), 1)`,
      })
      .from(projectsTable);

    const [distributed] = await db
      .select({
        totalDistributedWei: sql<string>`COALESCE(SUM(CAST(${fundingCyclesTable.totalMatchingDistributedWei} AS NUMERIC)), 0)::text`,
      })
      .from(fundingCyclesTable);

    res.json({
      totalProjectCount: Number(projectStats.totalProjectCount),
      activeProjectCount: Number(projectStats.activeProjectCount),
      totalDonationsWei: projectStats.totalDonationsWei || "0",
      totalDonorCount: Number(projectStats.totalDonorCount),
      totalUniqueDonors: Number(donorStats.totalUniqueDonors),
      matchingPoolWei: "10000000000000000000", // 10 ETH placeholder pool
      currentCycleId: Number(cycleStats.currentCycleId),
      totalDistributedWei: distributed.totalDistributedWei || "0",
      topCategoryByDonors: null,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get stats" });
  }
});

// GET /api/stats/leaderboard
router.get("/stats/leaderboard", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 50);

    const projects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.active, true))
      .orderBy(desc(sql`CAST(${projectsTable.totalDonationsWei} AS NUMERIC)`))
      .limit(limit);

    // Compute QF shares
    const totalSqrtSum = projects.reduce((acc, p) => {
      const donations = BigInt(p.totalDonationsWei);
      const sqrt = BigInt(Math.floor(Math.sqrt(Number(donations))));
      return acc + sqrt;
    }, BigInt(0));

    const leaderboard = projects.map((project, idx) => {
      const donations = BigInt(project.totalDonationsWei);
      const sqrt = BigInt(Math.floor(Math.sqrt(Number(donations))));
      const matchShare =
        totalSqrtSum > BigInt(0)
          ? (Number(sqrt) / Number(totalSqrtSum)) * 100
          : 0;

      return {
        rank: idx + 1,
        project,
        matchShare: Math.round(matchShare * 100) / 100,
      };
    });

    res.json(leaderboard);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get leaderboard" });
  }
});

// GET /api/stats/funding-cycles
router.get("/stats/funding-cycles", async (req, res) => {
  try {
    const cycles = await db
      .select()
      .from(fundingCyclesTable)
      .orderBy(desc(fundingCyclesTable.cycleId));

    res.json(cycles);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get funding cycles" });
  }
});

export default router;
