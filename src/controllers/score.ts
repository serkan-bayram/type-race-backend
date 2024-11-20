import { Request, Response } from "express";
import { db } from "../config/db.js";
import { usersTable } from "../schemas/schema.js";
import { desc } from "drizzle-orm";

export async function getScores(req: Request, res: Response) {
  const scores = await db
    .select()
    .from(usersTable)
    .orderBy(desc(usersTable.score));

  res.status(200).json({ scores: scores });
}
