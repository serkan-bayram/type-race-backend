import { Request, Response } from "express";
import { db } from "../config/db.js";
import { usersTable } from "../schemas/schema.js";

export async function joinRoom(req: Request, res: Response) {
  const userName = req.body?.userName;
  const roomId = req.body?.roomId;

  if (!userName || !roomId) {
    res.status(400).json({ error: "Missing room id or username" });
    return;
  }

  await db.insert(usersTable).values({ userName: userName, roomId: roomId });

  res.status(200).json({ message: "Success" });
}
