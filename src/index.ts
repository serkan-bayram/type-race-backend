import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import roomRoutes from "./routes/room.js";

dotenv.config({ path: process.cwd() + "/.env.local" });

const app = express();

// Middleware
const corsOptions = {
  credentials: true,
  // TODO: Change this on production
  origin: "http://localhost:5173",
};
app.use(cors(corsOptions));
app.use("/public", express.static("public"));
app.use(express.json());

// Routes
app.use("/api/room", roomRoutes);

app.listen(4001, () => {
  console.log(`Example app listening on port ${4001}`);
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong" });
});
