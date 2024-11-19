import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import roomRoutes from "./routes/room.js";
import { Server } from "socket.io";
import { createServer } from "http";

dotenv.config({ path: process.cwd() + "/.env.local" });

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173" },
});

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

type GameStatus = "started" | "finished";

let rooms: {
  roomId: string;
  // Undefined means game is not started
  status?: GameStatus;
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
      io.to(socket.id).emit("joinRoom", "Room does not exists");
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
    io.to(socket.id).emit("joinRoom", "Success");
    io.to(room.roomId).emit("roomInfo", room);
  });

  socket.on("startGame", ({ roomId }) => {
    const room = rooms.find((room) => room.roomId === roomId);

    if (!room) {
      io.to(socket.id).emit("startGame", "Room does not exists");
      return;
    }

    const isCreator = room.users.some(
      (user) => socket.id === user.id && user.isCreator
    );

    if (!isCreator) {
      io.to(socket.id).emit("startGame", "Only the creator can start game");
      return;
    }

    room.status = "started";
    io.to(socket.id).emit("startGame", "Success");

    const interval = setInterval(() => {
      if (room.secondsLeft > 0) {
        room.secondsLeft -= 1;
        io.to(room.roomId).emit("roomInfo", room);
      } else {
        room.status = "finished";
        io.to(room.roomId).emit("roomInfo", room);
        clearInterval(interval);
      }
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
