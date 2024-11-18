import { NextFunction, Request, Response } from "express";
import { db } from "../config/db.js";
import { roomsTable, usersTable } from "../schemas/schema.js";
import { eq } from "drizzle-orm";
import { roomIdSchema, userNameSchema } from "../schemas/zod-schemas.js";
import { z } from "zod";

const schema = z.object({
  userName: userNameSchema,
  roomId: roomIdSchema,
});

export async function joinRoom(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ message: "Invalid room id or user name" });
      return;
    }

    const { roomId, userName } = parsed.data;

    const room = await db
      .select()
      .from(roomsTable)
      .where(eq(roomsTable.id, roomId))
      .limit(0);

    if (room.length === 0) {
      res.status(404).json({ message: "This room does not exists" });
      return;
    }

    await db.insert(usersTable).values({ userName: userName, roomId: roomId });
    res.status(200).json({ message: "Success" });
  } catch (error) {
    next(error);
  }
}
