import { Request, Response } from "express";
import { db } from "../config/db.js";
import { roomsTable, usersTable } from "../schemas/schema.js";
import { eq } from "drizzle-orm";

export async function getRoom(req: Request, res: Response) {
  const roomId = req.params.roomId;

  const results = await db
    .select()
    .from(roomsTable)
    .leftJoin(usersTable, eq(usersTable.roomId, roomsTable.id))
    .where(eq(roomsTable.id, roomId));

  const resultsObject = {
    room: results[0].rooms,
    users: [] as { id: string; userName: string }[],
  };

  results.forEach((result) => {
    if (result.users) {
      resultsObject.users.push({
        id: result.users.id,
        userName: result.users.userName,
      });
    }
  });

  res
    .status(200)
    .json({ room: resultsObject.room, users: resultsObject.users });
}
