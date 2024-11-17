import express from "express";
import { createRoom } from "../controllers/createRoom.js";
import { getRoom } from "../controllers/getRoom.js";
import { joinRoom } from "../controllers/joinRoom.js";

const router = express.Router();

router.post("/create", createRoom);
router.post("/join", joinRoom);
router.get("/:roomId", getRoom);

export default router;
