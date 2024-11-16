import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";

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
app.get("/api/hello", (req: Request, res: Response) => {
  res.status(200).send("Hello!");
});

app.listen(4001, () => {
  console.log(`Example app listening on port ${4001}`);
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
