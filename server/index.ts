// import express from "express";
// import http from "http";
// import { Server, Socket } from "socket.io";
// // import cors from "cors";

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: ["http://localhost:5173", "http://localhost:5174"],
//   },
// });

// io.on("connection", (socket: Socket) => {
//   console.log("user connected", socket.id);

//   socket.on("join-room", (roomName) => {
//     socket.join(roomName);
//     console.log(`User joined room ${roomName}`);
//   });

//   let callerSocketId = "";
//   socket.on("offer", (offer, roomName) => {
//     socket.broadcast.to(roomName).emit("offer", offer);
//     callerSocketId = socket.id;
//   });

//   socket.on("answer", (answer, roomName) => {
//     io.to(roomName).to(callerSocketId).emit("answer", answer);
//   });

//   socket.on("ice-candidate", (candidate, roomName) => {
//     io.to(roomName).emit("ice-candidate", candidate);
//   });

//   socket.on("disconnect", () => {
//     console.log(`User with socket ID ${socket.id} disconnected`);
//   });
// });
// const PORT = 3000;

// server.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });
import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
  },
});

app.use("/", express.static("public"));

io.on("connection", (socket) => {
  console.log(`${socket.id} user connected`);


  const TotalRooms = new Map<string, string[]>();


  socket.on("join", async (roomId: string) => {
    const selectedRoom = io.sockets.adapter.rooms.get(roomId);
    const numberOfClients = selectedRoom ? selectedRoom.size : 0;


    
    if (numberOfClients === 0) {
      console.log(
        `Creating room ${roomId} and emitting room_created socket event by ${socket.id}`
      );
      await socket.join(roomId);



      
      if (!TotalRooms.has(roomId)) {
        TotalRooms.set(roomId, []);
      }
      TotalRooms.get(roomId)!.push(socket.id); 
      




      socket.emit("room_created", roomId);
    } else if (numberOfClients === 1) {
      console.log(
        `Joining room ${roomId} and emitting room_joined socket event by ${socket.id}`
      );
      await socket.join(roomId);

      TotalRooms.get(roomId)?.push(socket.id); 


      socket.emit("room_joined", roomId);
    } else {
      console.log(`Can't join room ${roomId}, emitting full_room socket event`);
      socket.emit("full_room", roomId);
    }
  });
  
  socket.on('leaveRoom', (roomId) => {
    socket.leave(roomId);

    const array = TotalRooms.get(roomId);
    const index = array?.indexOf(socket.id);
    if (index !== -1) array?.splice(index as number, 1);


    
    // Broadcast to others in the same room that this user left
    socket.to(roomId).emit('userLeft', socket.id);
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

  socket.on("webrtc_answer", (event: { roomId: string; sdp: string , isCaller: string }) => {
    console.log(
      `Broadcasting webrtc_answer event to peers in room ${event.roomId}`
    );
    socket.broadcast.to(event.roomId).to(event.isCaller).emit("webrtc_answer", event.sdp);
  });

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

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
