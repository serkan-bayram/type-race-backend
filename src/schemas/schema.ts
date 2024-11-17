import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// TODO: We should clear unused entries

export const usersTable = pgTable("users", {
  id: uuid().defaultRandom().primaryKey(),
  userName: varchar({ length: 255 }).notNull(),
  roomId: uuid().references(() => roomsTable.id),
  isRoomCreator: boolean().default(false).notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp(),
});

export const roomStatuses = ["notStarted", "finished", "started"];
export const status = pgEnum("status", ["notStarted", "finished", "started"]);

export const roomsTable = pgTable("rooms", {
  id: uuid().defaultRandom().primaryKey(),
  status: status().default("notStarted").notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp(),
});
