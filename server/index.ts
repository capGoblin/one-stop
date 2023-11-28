import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import Document from "./Document";
import cors from "cors";

import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";

import DeltaStatic from "react-quill";
// import { DeltaStatic } from "react-quill";

const app = express();
const server = http.createServer(app);

mongoose
  .connect("mongodb://localhost:27017/doc")
  .then(() => console.log("Connected! to db"));

interface Users {
  id: string;
  name: string;
}
interface UserData {
  [room: string]: Users[];
}

interface SocketToRoom {
  [id: string]: string;
}

const users: UserData = {};

const socketToRoom: SocketToRoom = {};

const maximum = 3;

const io = new Server(server, {
  cors: {
    origin: [
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ],
    methods: ["GET", "POST"],
  },
});
console.log("sadgadgas");

app.use(cors());

app.use("/", express.static("public"));

const defaultValue = "cool?";

const findOrCreateDoc = async (id: string) => {
  if (id === null) return;

  // find and return
  const d = await Document.findById(id);
  if (d) return d;
  // const doc = await Document.create({ _id: id, data: defaultValue });

  // else create new and return
  return await Document.create({
    _id: id,
    doc: defaultValue,
    draw: [],
  });
};

io.on("connection", (socket) => {
  console.log(`${socket.id} user connected`);
  let thisRoomId;

  const TotalRooms = new Map<string, string[]>();
  socket.emit("totalRoomsUpdate", TotalRooms, thisRoomId);

  socket.on("join", async (data) => {
    if (users[data.room]) {
      const length = users[data.room].length;
      if (length === maximum) {
        socket.to(socket.id).emit("room_full");
        return;
      }
      users[data.room].push({ id: socket.id, name: data.name });
      socket.broadcast.emit("roomId", data.room);
    } else {
      users[data.room] = [{ id: socket.id, name: data.name }];
      socket.emit("room_created", data.room);
    }

    socketToRoom[socket.id] = data.room;

    socket.join(data.room);
    console.log(`[${socketToRoom[socket.id]}]: ${socket.id} enter`);

    const usersInThisRoom = users[data.room].filter(
      (user) => user.id !== socket.id
    );

    console.log(usersInThisRoom);

    socket.emit("room_joined", data.room);

    // thisRoomId = roomId;
    // const selectedRoom = io.sockets.adapter.rooms.get(roomId);
    // const numberOfClients = selectedRoom ? selectedRoom.size : 0;

    // if (numberOfClients === 0) {
    //   console.log(
    //     `Creating room ${roomId} and emitting room_created socket event by ${socket.id}`
    //   );
    //   await socket.join(roomId);

    //   if (!TotalRooms.has(roomId)) {
    //     TotalRooms.set(roomId, []);
    //   }
    //   TotalRooms.get(roomId)!.push(socket.id);

    //   socket.emit("room_created", roomId);
    //   // socket.emit("totalRoomsUpdate", TotalRooms, thisRoomId);
    // } else if (numberOfClients === 1) {
    //   console.log(
    //     `Joining room ${roomId} and emitting room_joined socket event by ${socket.id}`
    //   );
    //   await socket.join(roomId);

    //   // TotalRooms.get(roomId)?.push(socket.id);

    //   socket.emit("room_joined", roomId);
    //   // socket.broadcast.emit("roomId", roomId);
    //   // socket.emit("totalRoomsUpdate", TotalRooms, thisRoomId);
    // } else if (numberOfClients === 2) {
    //   console.log(
    //     `Joining room ${roomId} and emitting room_joined socket event by ${socket.id}`
    //   );
    //   await socket.join(roomId);

    //   // TotalRooms.get(roomId)?.push(socket.id);

    //   socket.emit("room_joined", roomId);
    //   // socket.emit("total_clients", numberOfClients);
    // } else {
    //   console.log(`Can't join room ${roomId}, emitting full_room socket event`);
    //   socket.emit("full_room", roomId);
    // }
  });

  socket.on("send-changes", async (as) => {
    // const document = await findOrCreateDoc("ha");
    // await socket.join(roomId);
    // setTimeout(() => socket.broadcast.emit("receive-changes", delta), 3000);
    // socket.broadcast.emit("receive-changes", document?.data);
  });
  // socket.on("send-changes", async (delta) => {
  //   console.log("text is in server", delta);

  //   const document = await findOrCreateDoc("ha");

  //   // await socket.join(roomId);
  //   // setTimeout(() => socket.broadcast.emit("receive-changes", delta), 3000);

  //   socket.broadcast.emit("receive-changes", document?.data);
  // });

  // socket.on("get-doc", async (roomIdFromClient) => {
  //   const document = await findOrCreateDoc(roomIdFromClient);
  //   if (document) {
  //     console.log("doc is treu seeeeeeeeeeeeee", document.data);
  //   }
  //   socket.emit("load-doc", document?.data);
  //   console.log("doc sent to client");

  socket.on("send-changes", (delta) => {
    console.log("text is in server");

    // await socket.join(roomId);
    // setTimeout(() => socket.broadcast.emit("receive-changes", delta), 3000);

    socket.broadcast.emit("receive-changes", delta);
  });

  socket.on(
    "save-doc",
    async (data: { roomId: string; delta: DeltaStatic }) => {
      console.log("hm ? in save-doc? ");
      console.log("asggadsgsdgddsds", data.roomId, data.delta);
      await Document.findByIdAndUpdate(data.roomId, { doc: data.delta });
    }
  );

  socket.on("save-draw", async (data) => {
    console.log("hm ? in save-draw? ");
    console.log("asggadsgsdgddsds", data.elements);
    await Document.findByIdAndUpdate(data.roomId, { draw: data.elements });
  });

  socket.on("send-contents", async (contents) => {
    console.log("contents is in server");

    // await socket.join(roomId);
    // setTimeout(() => socket.broadcast.emit("receive-changes", delta), 3000);

    socket.broadcast.emit("receive-contents", contents);
  });

  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);

    const array = TotalRooms.get(roomId);
    const index = array?.indexOf(socket.id);
    if (index !== -1) array?.splice(index as number, 1);

    // Broadcast to others in the same room that this user left
    socket.to(roomId).emit("userLeft", socket.id);
  });

  socket.on("send-data", (data) => {
    console.log(`${data} is in server`);

    // await socket.join(roomId);
    // setTimeout(() => {
    // Emit the "receive-data" event after a 2-second delay
    socket.broadcast.emit("receive-data", data);
    // }, 5000);
  });
  socket.on("start_call", (roomId: string, callerId: string) => {
    console.log(`Broadcasting start_call event to peers in room ${roomId}`);
    socket.broadcast.to(roomId).emit("start_call", callerId);
  });

  socket.on("webrtc_offer", (event: { roomId: string; sdp: string }) => {
    console.log(
      `Broadcasting webrtc_offer event to peers in room ${event.roomId}`
    );
    socket.broadcast.to(event.roomId).emit("webrtc_offer", event.sdp);
  });

  socket.on(
    "webrtc_answer",
    (event: { roomId: string; sdp: string; isCaller: string }) => {
      console.log(
        `Broadcasting webrtc_answer event to peers in room ${event.roomId}`
      );
      socket.broadcast
        .to(event.roomId)
        .to(event.isCaller)
        .emit("webrtc_answer", event.sdp);
    }
  );

  socket.on(
    "webrtc_ice_candidate",
    (event: { roomId: string; label: number; candidate: string }) => {
      console.log(
        `Broadcasting webrtc_ice_candidate event to peers in room ${event.roomId}`
      );
      socket.broadcast.to(event.roomId).emit("webrtc_ice_candidate", event);
    }
  );
});

app.get("/find/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const document = await findOrCreateDoc(id);
    console.log("heteteasg", document);

    if (document) {
      res.json({ doc: document.doc });
    } else {
      res.status(404).json({ message: "Document not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
app.get("/find_draw/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const document = await findOrCreateDoc(id);
    console.log("heteteasg", document);

    if (document) {
      res.json({ elements: document.draw });
    } else {
      res.status(404).json({ message: "Document not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
