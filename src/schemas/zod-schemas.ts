import z from "zod";

export const userNameSchema = z.string().min(1).max(255);
export const roomIdSchema = z.string().uuid();
export const userIdSchema = z.string().uuid();
export const statusSchema = z.enum(["started", "finished", "notStarted"]);
