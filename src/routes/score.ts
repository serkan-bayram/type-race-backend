import express from "express";
import { getScores } from "../controllers/score.js";

const router = express.Router();

router.get("/all", getScores);

export default router;
