import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import wordRoutes from "./routes/word.js";
import { Server } from "socket.io";
import { createServer } from "http";
import { setTimeout } from "node:timers/promises";

dotenv.config({ path: process.cwd() + "/.env.local" });

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://typerace.serkanbayram.dev", // Websitenizin adresi
  },
});

io.on("connect_error", (err) => {
  console.error("Socket.IO bağlantı hatası:", err.message);
});


// Middleware
const corsOptions = {
  credentials: true,
  // TODO: Change this on production
  origin: "https://typerace.serkanbayram.dev",
};
app.use(cors(corsOptions));
app.use("/public", express.static("public"));
app.use(express.json());

// Routes
app.use("/api/words", wordRoutes);

let rooms: {
  roomId: string;
  // Undefined means game is not started
  status?: "started" | "finished";
  secondsLeft: number;
  users: { isCreator: boolean; id: string; WPM: number }[];
}[] = [];

// Socket
io.on("connection", (socket) => {
  console.log(`${socket.id} is connected`);

  socket.on("type", ({ WPM, roomId }) => {
    const room = rooms.find((room) => room.roomId === roomId);

    if (!room) return;

    const user = room.users.find((user) => user.id === socket.id);

    if (!user) return;

    user.WPM = WPM;

    io.to(room.roomId).emit("roomInfo", room);
  });

  socket.on("createRoom", ({ userName }) => {
    const room = {
      roomId: crypto.randomUUID(),
      secondsLeft: 60,
      users: [
        {
          isCreator: true,
          id: socket.id,
          userName: userName,
          WPM: 0,
        },
      ],
    };

    rooms.push(room);

    console.log("Room is created:", room);

    socket.join(room.roomId);
    io.to(socket.id).emit("createRoom", room.roomId);
    io.to(room.roomId).emit("roomInfo", room);
  });

  socket.on("joinRoom", ({ userName, roomId }) => {
    const room = rooms.find((room) => room.roomId === roomId);

    if (!room) {
      io.to(socket.id).emit("joinRoom", {
        ok: false,
        data: "Room does not exist",
      });
      return;
    }

    if (room.status === "started") {
      io.to(socket.id).emit("joinRoom", {
        ok: false,
        data: "This game is already started",
      });
      return;
    }

    const user = {
      userName: userName,
      id: socket.id,
      isCreator: false,
      WPM: 0,
    };

    room.users.push(user);

    console.log(`${socket.id} joined a room: `, rooms);

    socket.join(roomId);
    io.to(socket.id).emit("joinRoom", { ok: true, data: room.roomId });
    io.to(room.roomId).emit("roomInfo", room);
  });

  socket.on("startGame", async ({ roomId }) => {
    const room = rooms.find((room) => room.roomId === roomId);

    if (!room) {
      io.to(socket.id).emit("startGame", "Room does not exist");
      return;
    }

    const isCreator = room.users.some(
      (user) => socket.id === user.id && user.isCreator
    );

    if (!isCreator) {
      io.to(socket.id).emit("startGame", "Only the creator can start game");
      return;
    }

    io.to(room.roomId).emit("startGame", "Success");

    await setTimeout(3000);

    room.status = "started";
    io.to(room.roomId).emit("roomInfo", room);

    const interval = setInterval(() => {
      if (room.secondsLeft > 0) {
        room.secondsLeft -= 1;
      } else {
        room.status = "finished";
        clearInterval(interval);
      }
      io.to(room.roomId).emit("roomInfo", room);
    }, 1000);
  });

  socket.on("disconnect", () => {
    const socketId = socket.id;

    for (let index = 0; index < rooms.length; index++) {
      const userIndex = rooms[index].users.findIndex(
        (user) => user.id === socketId
      );

      // User is not in this room
      if (userIndex === -1) continue;

      rooms[index].users.splice(userIndex, 1);

      // If everyone left
      if (rooms[index].users.length === 0) {
        rooms.splice(index, 1);
      } else {
        // Notify the users
        io.to(rooms[index].roomId).emit("roomInfo", rooms[index]);
      }
    }

    console.log(`${socket.id} is disconnected`);
  });
});

server.listen(4001, () => {
  console.log(`Example app listening on port ${4001}`);
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong" });
});
