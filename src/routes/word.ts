import express from "express";
import { getEnglish, getTurkish } from "../controllers/word.js";

const router = express.Router();

router.get("/turkish", getTurkish);
router.get("/english", getEnglish);

export default router;
