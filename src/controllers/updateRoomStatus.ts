import { NextFunction, Request, Response } from "express";
import { roomsTable, roomStatuses, usersTable } from "../schemas/schema.js";
import { db } from "../config/db.js";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  roomIdSchema,
  statusSchema,
  userIdSchema,
} from "../schemas/zod-schemas.js";

const schema = z.object({
  status: statusSchema,
  userId: userIdSchema,
  roomId: roomIdSchema,
});

export async function updateRoomStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ message: "Invalid update request" });
      return;
    }

    const { userId, roomId, status } = parsed.data;

    const results = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    const user = results[0];

    if (!user.isRoomCreator) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    await db
      .update(roomsTable)
      .set({ status: status })
      .where(eq(roomsTable.id, roomId));

    res.status(200).json({ message: "Success" });
  } catch (error) {
    next(error);
  }
}
