import {
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid().defaultRandom().primaryKey(),
  userName: varchar({ length: 255 }).notNull(),
  roomId: uuid().references(() => roomsTable.id),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp(),
  // TODO: Delete row if updateAt is a bit long
});

export const roomsTable = pgTable("rooms", {
  id: uuid().defaultRandom().primaryKey(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp(),
});
