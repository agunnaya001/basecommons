import { Router } from "express";
import { db, donationsTable, projectsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { RecordDonationBody } from "@workspace/api-zod";

const router = Router();

// POST /api/projects/:id/donate
router.post("/projects/:id/donate", async (req, res) => {
  try {
    const parsed = RecordDonationBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request", issues: parsed.error.issues });
    }

    const projectId = req.params.id;

    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId));

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const [donation] = await db
      .insert(donationsTable)
      .values({
        projectId,
        donorAddress: parsed.data.donorAddress,
        amountWei: parsed.data.amountWei,
        txHash: parsed.data.txHash ?? null,
        cycleId: parsed.data.cycleId,
      })
      .returning();

    // Update project totals
    const newTotal = BigInt(project.totalDonationsWei) + BigInt(parsed.data.amountWei);

    // Count unique donors
    const [{ count }] = await db
      .select({ count: sql<number>`count(distinct ${donationsTable.donorAddress})` })
      .from(donationsTable)
      .where(eq(donationsTable.projectId, projectId));

    await db
      .update(projectsTable)
      .set({
        totalDonationsWei: newTotal.toString(),
        donorCount: Number(count),
        updatedAt: new Date(),
      })
      .where(eq(projectsTable.id, projectId));

    res.status(201).json(donation);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to record donation" });
  }
});

// GET /api/projects/:id/donations
router.get("/projects/:id/donations", async (req, res) => {
  try {
    const donations = await db
      .select()
      .from(donationsTable)
      .where(eq(donationsTable.projectId, req.params.id))
      .orderBy(desc(donationsTable.createdAt));

    res.json(donations);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list donations" });
  }
});

// GET /api/donations/recent
router.get("/donations/recent", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    const donations = await db
      .select({
        id: donationsTable.id,
        projectId: donationsTable.projectId,
        donorAddress: donationsTable.donorAddress,
        amountWei: donationsTable.amountWei,
        txHash: donationsTable.txHash,
        cycleId: donationsTable.cycleId,
        createdAt: donationsTable.createdAt,
        projectName: projectsTable.name,
        projectImageUrl: projectsTable.imageUrl,
      })
      .from(donationsTable)
      .leftJoin(projectsTable, eq(donationsTable.projectId, projectsTable.id))
      .orderBy(desc(donationsTable.createdAt))
      .limit(limit);

    res.json(donations);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list recent donations" });
  }
});

export default router;
