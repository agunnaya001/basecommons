import { Router } from "express";
import { db, projectsTable, donationsTable } from "@workspace/db";
import { eq, desc, asc, ilike, or, sql } from "drizzle-orm";
import {
  CreateProjectBody,
  UpdateProjectBody,
  ListProjectsQueryParams,
} from "@workspace/api-zod";

const router = Router();

// GET /api/projects
router.get("/projects", async (req, res) => {
  try {
    const parsed = ListProjectsQueryParams.safeParse(req.query);
    const sort = parsed.success ? parsed.data.sort : "newest";
    const search = parsed.success ? parsed.data.search : undefined;

    let query = db.select().from(projectsTable);

    if (search) {
      query = query.where(
        or(
          ilike(projectsTable.name, `%${search}%`),
          ilike(projectsTable.description, `%${search}%`)
        )
      ) as typeof query;
    }

    switch (sort) {
      case "top_funded":
        query = query.orderBy(desc(sql`CAST(${projectsTable.totalDonationsWei} AS NUMERIC)`)) as typeof query;
        break;
      case "most_donors":
        query = query.orderBy(desc(projectsTable.donorCount)) as typeof query;
        break;
      case "top_matched":
        query = query.orderBy(desc(sql`CAST(${projectsTable.estimatedMatchWei} AS NUMERIC)`)) as typeof query;
        break;
      default:
        query = query.orderBy(desc(projectsTable.createdAt)) as typeof query;
    }

    const projects = await query;
    res.json(projects);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list projects" });
  }
});

// POST /api/projects
router.post("/projects", async (req, res) => {
  try {
    const parsed = CreateProjectBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request", issues: parsed.error.issues });
    }

    const { txHash, onChainId, ...projectData } = parsed.data;

    const [project] = await db
      .insert(projectsTable)
      .values({
        ...projectData,
        onChainId: onChainId ?? null,
      })
      .returning();

    res.status(201).json(project);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// GET /api/projects/:id
router.get("/projects/:id", async (req, res) => {
  try {
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, req.params.id));

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get project" });
  }
});

// PATCH /api/projects/:id
router.patch("/projects/:id", async (req, res) => {
  try {
    const parsed = UpdateProjectBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request", issues: parsed.error.issues });
    }

    const [project] = await db
      .update(projectsTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(projectsTable.id, req.params.id))
      .returning();

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update project" });
  }
});

export default router;
