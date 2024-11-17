import { Request, Response } from "express";
import { db } from "../config/db.js";
import { roomsTable, usersTable } from "../schemas/schema.js";

export async function createRoom(req: Request, res: Response) {
  const room = await db.insert(roomsTable).values({}).returning();
  const roomId = room[0].id;

  const userName = req.body?.userName;

  if (!userName) {
    res.status(400).json({ error: "No username entered" });
    return;
  }

  const user = await db
    .insert(usersTable)
    .values({ userName: userName, roomId: roomId })
    .returning();

  res.status(200).json({ userId: user[0].id, roomId: roomId });
}
