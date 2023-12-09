"use strict";
// import express from "express";
// import http from "http";
// import { Server, Socket } from "socket.io";
// // import cors from "cors";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    },
});
app.use("/", express_1.default.static("public"));
io.on("connection", (socket) => {
    console.log(`${socket.id} user connected`);
    const TotalRooms = new Map();
    socket.on("join", async (roomId) => {
        const selectedRoom = io.sockets.adapter.rooms.get(roomId);
        const numberOfClients = selectedRoom ? selectedRoom.size : 0;
        if (numberOfClients === 0) {
            console.log(`Creating room ${roomId} and emitting room_created socket event by ${socket.id}`);
            await socket.join(roomId);
            if (!TotalRooms.has(roomId)) {
                TotalRooms.set(roomId, []);
            }
            TotalRooms.get(roomId).push(socket.id);
            socket.emit("room_created", roomId);
        }
        else if (numberOfClients === 1) {
            console.log(`Joining room ${roomId} and emitting room_joined socket event by ${socket.id}`);
            await socket.join(roomId);
            TotalRooms.get(roomId)?.push(socket.id);
            socket.emit("room_joined", roomId);
        }
        else if (numberOfClients === 2) {
            console.log(`Joining room ${roomId} and emitting room_joined socket event by ${socket.id}`);
            await socket.join(roomId);
            TotalRooms.get(roomId)?.push(socket.id);
            socket.emit("room_joined", roomId);
        }
        else {
            console.log(`Can't join room ${roomId}, emitting full_room socket event`);
            socket.emit("full_room", roomId);
        }
    });
    socket.on('leaveRoom', (roomId) => {
        socket.leave(roomId);
        const array = TotalRooms.get(roomId);
        const index = array?.indexOf(socket.id);
        if (index !== -1)
            array?.splice(index, 1);
        // Broadcast to others in the same room that this user left
        socket.to(roomId).emit('userLeft', socket.id);
    });
    socket.on("start_call", (roomId, isCaller) => {
        console.log(`Broadcasting start_call event to peers in room ${roomId}`);
        socket.broadcast.to(roomId).to(isCaller).emit("start_call");
    });
    socket.on("webrtc_offer", (event) => {
        console.log(`Broadcasting webrtc_offer event to peers in room ${event.roomId}`);
        socket.broadcast.to(event.roomId).emit("webrtc_offer", event.sdp);
    });
    socket.on("webrtc_answer", (event) => {
        console.log(`Broadcasting webrtc_answer event to peers in room ${event.roomId}`);
        socket.broadcast.to(event.roomId).emit("webrtc_answer", event.sdp);
    });
    socket.on("webrtc_ice_candidate", (event) => {
        console.log(`Broadcasting webrtc_ice_candidate event to peers in room ${event.roomId}`);
        socket.broadcast.to(event.roomId).emit("webrtc_ice_candidate", event);
    });
});
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
});
// bACK UP DRAW
// function Draw() {
//   // const excalidrawRef = useRef<ExcalidrawImperativeAPI>(null);
//   const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI>();
//   const previousElements = useRef<ExcalidrawElement[] | null>(null);
//
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [excalidrawData, setExcalidrawData] = useState<SceneData | null>(null);
//
//   const [isCollaborating, setIsCollaborating] = useState<boolean>(false);
//   const [string, setString] = useState<string>("");
//
//   useEffect(() => {
//     const socket = io("http://localhost:3000");
//     setSocket(socket);
//
//     return () => {
//       socket.disconnect();
//     };
//   }, []);
//
//   useEffect(() => {
//     if (socket) {
//       socket.on("receive-data", (data) => {
//         // Update the excalidrawData state here
//         // setExcalidrawData(data);
//         // dataGot = data;
//
//         console.log("Received data:", data);
//         console.log("excalidrawAPI:", excalidrawAPI);
//
//         if (excalidrawAPI) {
//           console.log(data, "agsgagfas");
//           const updateScene = () => {
//             const sceneData = {
//               elements: data,
//             };
//             excalidrawAPI.updateScene(sceneData);
//           };
//           updateScene();
//           // excalidrawAPI.updateScene({
//           //   elements: data,
//           // });
//         } else {
//           console.log("excalidrawAPI is falsy", excalidrawAPI);
//         }
//         // } else {
//         //   console.log("excalidrawAPI is falsy", excalidrawAPI);
//         // }
//       });
//     }
//   }, [excalidrawAPI, socket]);
//
//   // useEffect(() => {
//   //   if (excalidrawData) {
//   //     console.log(excalidrawData);
//   //   }
//   //   console.log("excalidrawData not available");
//   // }, [excalidrawData]);
//
//   function areElementsEqual(
//     arr1: readonly ExcalidrawElement[],
//     arr2: readonly ExcalidrawElement[],
//   ) {
//     if (arr1.length !== arr2.length) {
//       return false;
//     }
//
//     for (let i = 0; i < arr1.length; i++) {
//       if (!isElementEqual(arr1[i], arr2[i])) {
//         return false;
//       }
//     }
//
//     return true;
//   }
//
//   function isElementEqual(
//     element1: ExcalidrawElement,
//     element2: ExcalidrawElement,
//   ): boolean {
//     // Check if the element types are equal
//     if (element1.type !== element2.type) {
//       return false;
//     }
//
//     // Check other relevant properties for equality based on the element type
//     // For example, if it's a text element, compare text content, font size, etc.
//
//     // You'll need to implement specific comparisons for each element subtype
//
//     // If all comparisons pass, the elements are considered equal
//     return true;
//   }
//
//   const handleDataChange = (
//     elements: readonly ExcalidrawElement[],
//     // appState: AppState,
//   ): void => {
//     if (excalidrawAPI && elements) {
//       // const data: SceneData = {
//       //   elements: [...elements],
//       //   // appState: { ...appState },
//       // };
//
//       // if (
//       //   !previousElements.current ||
//       //   !areElementsEqual(previousElements.current, elements)
//       // ) {
//       // Elements have changed, update the previousElements reference
//       // previousElements.current = elements.slice();
//       socket?.emit("send-data", elements);
//       // }
//
//       // console.log(elements);
//       //
//       // socket?.emit("send-data", elements);
//       // setExcalidrawData(data);
//
//       // Avoid updating state directly here
//     } else {
//       console.log("excalidrawAPI is falsy when sending data");
//     }
//   };
//
//   return (
//     <>
//       <h1 style={{ textAlign: "center" }}>Excalidraw Example</h1>
//       <div
//         style={{ height: "500px", width: "700px" }}
//         className="custom-styles"
//       >
//         {/*<label style={{ fontSize: "16px", fontWeight: "bold" }}>*/}
//         {/*  <input*/}
//         {/*    type="checkbox"*/}
//         {/*    checked={isCollaborating}*/}
//         {/*    onChange={() => {*/}
//         {/*      if (!isCollaborating) {*/}
//         {/*        const collaborators = new Map();*/}
//         {/*        collaborators.set("id1", {*/}
//         {/*          username: "Doremon",*/}
//         {/*          avatarUrl: "../../../../img/doremon.png",*/}
//         {/*        });*/}
//         {/*        collaborators.set("id3", {*/}
//         {/*          username: "Pika",*/}
//         {/*          avatarUrl: "../../../../img/pika.jpeg",*/}
//         {/*        });*/}
//         {/*        excalidrawRef.current?.updateScene({ collaborators });*/}
//         {/*      } else {*/}
//         {/*        excalidrawRef.current?.updateScene({*/}
//         {/*          collaborators: new Map(),*/}
//         {/*        });*/}
//         {/*      }*/}
//         {/*      setIsCollaborating(!isCollaborating);*/}
//         {/*    }}*/}
//         {/*  />*/}
//         {/*  Show Collaborators*/}
//         {/*</label>*/}
//
//         {/*<input*/}
//         {/*  type="text"*/}
//         {/*  placeholder="yup"*/}
//         {/*  value={string}*/}
//         {/*  onChange={(e) => setString(e.target.value)}*/}
//         {/*></input>*/}
//         {/*{excalidrawAPI && (*/}
//         <Excalidraw
//           ref={(api) => {
//             if (!excalidrawAPI) {
//               setExcalidrawAPI(api as ExcalidrawImperativeAPI | undefined);
//             }
//           }}
//           onChange={handleDataChange}
//           renderTopRightUI={() => (
//             <LiveCollaborationTrigger
//               isCollaborating={false}
//               onSelect={
//                 () => {
//                   if (!isCollaborating) {
//                     const collaborators = new Map();
//                     collaborators.set(string, {
//                       username: "Doremon",
//                       avatarUrl: "../../../../img/doremon.png",
//                     });
//
//                     excalidrawAPI?.updateScene({
//                       collaborators: collaborators,
//                     });
//                   } else {
//                     excalidrawAPI?.updateScene({
//                       collaborators: new Map(),
//                     });
//                   }
//                   setIsCollaborating(!isCollaborating);
//                 }
//
//                 //
//                 // window.alert("You clicked on collab button");
//                 // setIsCollaborating(true);
//               }
//             />
//           )}
//         />
//         {/*)}*/}
//       </div>
//     </>
//   );
// }
