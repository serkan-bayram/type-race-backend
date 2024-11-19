import express from "express";
import { getTurkishWords } from "../controllers/getTurkishWords.js";

const router = express.Router();

router.get("/turkish", getTurkishWords);

export default router;
