import express from "express";
import { createRoom } from "../controllers/createRoom.js";
import { getRoom } from "../controllers/getRoom.js";

const router = express.Router();

router.post("/create", createRoom);
router.get("/:roomId", getRoom);

export default router;
