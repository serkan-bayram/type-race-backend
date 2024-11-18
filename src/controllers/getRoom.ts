import { NextFunction, Request, Response } from "express";
import { db } from "../config/db.js";
import { roomsTable, usersTable } from "../schemas/schema.js";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { roomIdSchema } from "../schemas/zod-schemas.js";

const schema = z.object({ roomId: roomIdSchema });

export async function getRoom(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = schema.safeParse(req.params);

    if (!parsed.success) {
      res.status(400).json({ message: "Invalid room id" });
      return;
    }

    const { roomId } = parsed.data;

    const results = await db
      .select()
      .from(roomsTable)
      .leftJoin(usersTable, eq(usersTable.roomId, roomsTable.id))
      .where(eq(roomsTable.id, roomId));

    const resultsObject = {
      room: results[0].rooms,
      users: [] as { id: string; userName: string; isRoomCreator: boolean }[],
    };

    results.forEach((result) => {
      if (result.users) {
        resultsObject.users.push({
          id: result.users.id,
          userName: result.users.userName,
          isRoomCreator: result.users.isRoomCreator,
        });
      }
    });

    res
      .status(200)
      .json({ room: resultsObject.room, users: resultsObject.users });
  } catch (error) {
    next(error);
  }
}
