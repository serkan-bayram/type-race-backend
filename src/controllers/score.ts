import { Request, Response } from "express";
import { db } from "../config/db.js";
import { usersTable } from "../schemas/schema.js";

export async function getScores(req: Request, res: Response) {
  const scores = await db.select().from(usersTable);

  res.status(200).json({ scores: scores });
}
