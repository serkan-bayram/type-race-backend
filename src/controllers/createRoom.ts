import { NextFunction, Request, Response } from "express";
import { db } from "../config/db.js";
import { roomsTable, usersTable } from "../schemas/schema.js";
import { userNameSchema } from "../schemas/zod-schemas.js";

export async function createRoom(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsedUserName = userNameSchema.safeParse(req.body?.userName);

    if (!parsedUserName.success) {
      res.status(400).json({ message: "Invalid user name" });
      return;
    }

    const room = await db.insert(roomsTable).values({}).returning();
    const roomId = room[0].id;

    const user = await db
      .insert(usersTable)
      .values({
        userName: parsedUserName.data,
        roomId: roomId,
        isRoomCreator: true,
      })
      .returning();

    res.status(200).json({ userId: user[0].id, roomId: roomId });
  } catch (error) {
    next(error);
  }
}
