import { Request, Response } from "express";
import { roomsTable, roomStatuses, usersTable } from "../schemas/schema.js";
import { db } from "../config/db.js";
import { eq } from "drizzle-orm";

export async function updateRoomStatus(req: Request, res: Response) {
  const status = req.body?.status;
  const userId = req.body?.userId;
  const roomId = req.body?.roomId;

  if (!userId || !roomId || !status || !roomStatuses.includes(status)) {
    res.status(400).json({ error: "Something went wrong" });
    return;
  }

  const results = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  const user = results[0];

  if (!user.isRoomCreator) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  await db
    .update(roomsTable)
    .set({ status: status })
    .where(eq(roomsTable.id, roomId));

  res.status(200).json({ message: "Success" });
}
