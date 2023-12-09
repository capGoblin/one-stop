import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import Document from "./Document";
import cors from "cors";
import { config } from "dotenv";
config();
import DeltaStatic from "react-quill";

const app = express();
const server = http.createServer(app);
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  throw new Error("MONGODB_URI is not defined in the environment variables.");
}
mongoose.connect(mongoURI).then(() => console.log("Connected! to db"));

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

const maximum = 10;

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
console.log("sadgadgas");

app.use(cors());

app.use("/", express.static("public"));

const defaultValue = "cool?";

// const findOrCreateDoc = async (id: string, name: string) => {
//   if (id === null || name === null) return;

//   // find and return
//   const existingDoc = await Document.findById(id);

//   if (existingDoc) {
//     console.log("existingDoc", existingDoc);
//     // Check if the name is already in the users array
//     if (!existingDoc.users.includes(name)) {
//       console.log("name", name);
//       existingDoc.users.push(name);
//       await existingDoc.save();
//       console.log("save", existingDoc);
//     }
//     return existingDoc;
//   }
//   // const doc = await Document.create({ _id: id, data: defaultValue });

//   // else create new and return
//   return await Document.create({
//     _id: id,
//     doc: defaultValue,
//     draw: [],
//     code: "",
//     users: [name],
//   });
// };

const findOrCreateDoc = async (id: string, name: string) => {
  if (id === null || name === null) return;

  const filter = { _id: id }; // Assuming _id is the unique identifier in your Document model
  const update = {
    $addToSet: { users: name }, // Ensure uniqueness in the users array
    $setOnInsert: { doc: defaultValue, draw: [], code: "" }, // Set default values on insert
  };

  const options = {
    new: true, // Return the modified document rather than the original
    upsert: true, // Create a new document if it doesn't exist
  };

  const updatedDoc = await Document.findOneAndUpdate(filter, update, options);

  return updatedDoc;
};

const getAllDocIdsForUser = async (userName: string) => {
  if (userName === null) return [];

  try {
    const docs = await Document.find({ users: userName }, "_id");
    console.log("docs", docs);
    const docIds = docs
      .map((doc) => (doc._id ? doc._id.toString() : null))
      .filter((id) => id !== null);
    // Convert ObjectId to string directly
    console.log("docIds", docIds);
    return docIds;
  } catch (error) {
    // Handle any errors that occur during the query
    console.error("Error fetching document IDs:", error);
    return [];
  }
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
        console.log("emmited max users? room full?");
        socket.to(socket.id).emit("room_full");
        return;
      }
      users[data.room].push({ id: socket.id, name: data.name });
      socket.to(data.room).emit("name_joined", data.name);
      socket.broadcast.emit("roomId", data.room);
      socket.to(socket.id).emit("socket_id", socket.id);
    } else {
      users[data.room] = [{ id: socket.id, name: data.name }];
      socket.emit("room_created", data.room);
      socket.to(socket.id).emit("socket_id", socket.id);
    }

    socketToRoom[socket.id] = data.room;

    socket.join(data.room);
    console.log(`[${socketToRoom[socket.id]}]: ${socket.id} enter`);

    const usersInThisRoom = users[data.room].filter(
      (user) => user.id !== socket.id
    );

    console.log(usersInThisRoom);

    socket.emit("room_joined", data.room);
  });

  socket.on("send-code", (text: string) => {
    console.log("code in server", text);

    socket.broadcast.emit("receive-code", text);
  });

  //TextEditor
  socket.on("send-changes", (delta) => {
    console.log("text is in server");

    socket.broadcast.emit("receive-changes", delta);
  });
  //TextEditor
  socket.on(
    "save-doc",
    async (data: { roomId: string; delta: DeltaStatic }) => {
      console.log("hm ? in save-doc? ", data);
      console.log("asggadsgsdgddsds", data.roomId, data.delta);
      await Document.findByIdAndUpdate(data.roomId, { doc: data.delta });
    }
  );
  //Draw
  socket.on("send-data", (data) => {
    console.log(`${data} is in server`);
    socket.broadcast.emit("receive-data", data);
  });
  //Draw
  socket.on("save-draw", async (data) => {
    console.log("hm ? in save-draw? ");
    console.log("asggadsgsdgddsds", data.elements);
    await Document.findByIdAndUpdate(data.roomId, { draw: data.elements });
  });

  socket.on("send-contents", async (contents) => {
    console.log("contents is in server");

    socket.broadcast.emit("receive-contents", contents);
  });
  socket.on(
    "save-code",
    async (data: { roomId: string; editorContent: string }) => {
      console.log("hm ? in save-code? ", data);
      await Document.findByIdAndUpdate(data.roomId, {
        code: data.editorContent,
      });
    }
  );

  socket.on("leaveRoom", (userId, roomId) => {
    socket.leave(userId);
    console.log("left ? ", userId);
    if (users[userId]) {
      const updatedUsers = users[userId].filter((user) => user.id !== userId);
      users[userId] = updatedUsers;
    }

    // Broadcast to others in the same room that this user left
    socket.to(roomId).emit("userLeft", socket.id);
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

app.get("/find/:id/:name", async (req, res) => {
  const { id, name } = req.params;

  try {
    const document = await findOrCreateDoc(id, name);
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
app.get("/find_draw/:id/:name", async (req, res) => {
  const { id, name } = req.params;

  try {
    const document = await findOrCreateDoc(id, name);
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
app.get("/find_code/:id/:name", async (req, res) => {
  const { id, name } = req.params;

  try {
    const document = await findOrCreateDoc(id, name);
    console.log("heteteasg", document);

    if (document) {
      res.json({ editorContent: document.code });
    } else {
      res.status(404).json({ message: "Document not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
app.get("/find_recent_stops/:name", async (req, res) => {
  const { name } = req.params;

  try {
    const docIds = await getAllDocIdsForUser(name);
    // console.log("heteteasg", document);

    if (docIds) {
      res.json({ docIds });
    } else {
      res.status(404).json({ message: "Document not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
app.get("/create_doc/:id/:name", async (req, res) => {
  const { id, name } = req.params;

  try {
    const document = await findOrCreateDoc(id, name);
    // console.log("heteteasg", document);

    if (document) {
      res.sendStatus(200);
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
