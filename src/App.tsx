// import { io } from "socket.io-client";
// import "./App.css";
// import { useEffect, useState } from "react";

// const socket = io("http://localhost:3000");

// function App() {
//   const [roomName, setRoomName] = useState("");
//   let localStream: MediaStream;

//   const peerConnectionCaller = new RTCPeerConnection();
//   const peerConnectionCallee = new RTCPeerConnection();

//   // socket.emit("connection", socket);

//   useEffect(() => {
//     socket.on("answer", async (answer) => {
//       try {
//         // Parse the answer
//         const remoteAnswer = new RTCSessionDescription(answer);

//         // Set the remote answer description on the caller side
//         await peerConnectionCaller.setRemoteDescription(remoteAnswer);

//         console.log("setRemoteDescription set in caller");
//       } catch (error) {
//         console.error("Error setting remote description", error);
//       }
//     });
//   }, []);

//   // callee listens for offer to emit answer

//   useEffect(() => {
//     // callee listens for offer to emit answer
//     socket.on("offer", async (offer) => {
//       try {
//         // Parse the offer
//         const remoteOffer = new RTCSessionDescription(offer);

//         // Set the remote offer
//         await peerConnectionCallee.setRemoteDescription(remoteOffer);
//         console.log("setRemoteDescription set in callee");

//         const answer = await peerConnectionCallee.createAnswer();

//         // Set the local description
//         await peerConnectionCallee.setLocalDescription(answer);

//         // Emit the answer back to the caller
//         socket.emit("answer", answer, roomName);
//       } catch (error) {
//         console.error("Error generating answer", error);
//       }

//       peerConnectionCallee.onicecandidate = (event) => {
//         if (event.candidate)
//           socket.emit("ice-candidate", event.candidate, roomName);
//       };
//     });
//   }, [roomName]);

//   // caller listens for answer to setRemoteDescription

//   // socket.on("ice-candidate", (candidate) => {
//   //   const iceCandidate = new RTCIceCandidate(candidate);

//   //   // Add the ICE candidate to the peer connection
//   //   peerConnection
//   //     .addIceCandidate(iceCandidate)
//   //     .then(() => {
//   //       console.log("ICE candidate added successfully");
//   //     })
//   //     .catch((error) => {
//   //       console.error("Error adding ICE candidate:", error);
//   //     });
//   // });

//   // caller emitts offer to callee
//   const handleCallClick = async () => {
//     const offer = await peerConnectionCaller.createOffer();

//     // Set the local description first
//     await peerConnectionCaller.setLocalDescription(offer);

//     socket.emit("offer", offer, roomName);

//     peerConnectionCaller.onicecandidate = (event) => {
//       if (event.candidate)
//         socket.emit("ice-candidate", event.candidate, roomName);
//     };
//   };

//   // peerConnection.onicecandidate = (event) => {
//   //   if (event.candidate)
//   //     socket.emit("ice-candidate", event.candidate, roomName);
//   // };

//   // const handleAnswerClick = async () => {

//   // };

//   const handleRoomSubmit = async () => {
//     socket.emit("join-room", roomName);

//     localStream = await navigator.mediaDevices.getUserMedia({
//       video: true,
//       audio: true,
//     });
//     localStream.getTracks().forEach((track) => {
//       peerConnectionCaller.addTrack(track, localStream);
//       peerConnectionCallee.addTrack(track, localStream);
//     });
//   };
//   return (
//     <>
//       <input
//         placeholder="Enter a Room Name to Join"
//         value={roomName}
//         onChange={(e) => {
//           setRoomName(e.target.value);
//           // console.log(e);
//         }}
//       />
//       <button type="submit" onClick={handleRoomSubmit}>
//         Enter Room
//       </button>
//       <button className="call" onClick={handleCallClick}>
//         Call or send SDP
//       </button>
//       {/* <button className="answer" onClick={handleAnswerClick}>
//         accept or answer SDP
//       </button> */}
//     </>
//   );
// }

// export default App;

import React, { useEffect, useState, useRef } from "react";
import io, { Socket } from "socket.io-client";

const socket = io("http://localhost:3000");

const App: React.FC = () => {
  const roomInputRef = useRef<HTMLInputElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // const [socket, setSocket] = useState<Socket | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isCaller, setIsCaller] = useState<boolean>(false);
  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
    ],
  };
  // const peerConnectionCaller = new RTCPeerConnection(iceServers);
  // const peerConnectionCallee = new RTCPeerConnection(iceServers);

  const remoteStreamMS = new MediaStream();
  const [isRoomCreator, setIsRoomCreator] = useState<boolean>(false);
  const [rtcPeerConnection, setRtcPeerConnection] =
    useState<RTCPeerConnection>();
  const [roomId, setRoomId] = useState<string>("");

  // useEffect(() => {

  //   socketInstance.on("connect", () => {
  //     console.log("Socket connected");
  //   });

  //   setSocket(socketInstance);

  //   return () => {
  //     if (socketInstance) {
  //       socketInstance.disconnect();
  //     }
  //   };
  // }, []);

  const joinRoom = () => {
    const room = roomInputRef.current?.value;

    if (!room) {
      alert("Please type a room ID");
      return;
    }

    setRoomId(room);
    socket.emit("join", room);
    showVideoConference();
  };

  const showVideoConference = () => {
    if (roomInputRef.current) {
      roomInputRef.current.disabled = true;
    }

    if (localVideoRef.current) {
      localVideoRef.current.style.display = "block";
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.style.display = "block";
    }
  };

  const setLocalMediaStream = async (constraints: MediaStreamConstraints) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      console.log(localVideoRef);
      console.log(localVideoRef.current);
      console.log(
        localVideoRef.current ? localVideoRef.current.srcObject : "hm"
      );
    } catch (error) {
      console.error("Could not get user media", error);
    }
  };

  const setRemoteMediaStream = (event: RTCTrackEvent) => {
    console.log("Remote Tracks:", event.streams[0].getTracks());
    console.log("Remote Tracks:", event.streams[0]);
    event.streams[0].getTracks().forEach((track) => {
      remoteStreamMS.addTrack(track);
    });
    setRemoteStream(event.streams[0]);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamMS;
      //   remoteVideoRef.current.srcObject = event.streams[0];
    }
    console.log(remoteStream);
    console.log(remoteStreamMS);
    console.log(remoteVideoRef);
    console.log(remoteVideoRef.current);
    console.log(
      remoteVideoRef.current ? remoteVideoRef.current.srcObject : "hm"
    );
  };

  const addLocalTracks = (rtcPeerConnection: RTCPeerConnection) => {
    console.log(isCaller);
    localStream?.getTracks().forEach((track) => {
      rtcPeerConnection.addTrack(track, localStream as MediaStream);
    });
  };

  const createOffer = async (rtcPeerConnection: RTCPeerConnection) => {
    try {
      const sessionDescription = await rtcPeerConnection.createOffer({
        offerToReceiveVideo: true, // This is important to receive the video
        offerToReceiveAudio: true, // Make sure audio is received as well
      });
      rtcPeerConnection.setLocalDescription(sessionDescription);
      socket?.emit("webrtc_offer", {
        type: "webrtc_offer",
        sdp: sessionDescription,
        roomId,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const createAnswer = async (rtcPeerConnection: RTCPeerConnection) => {
    try {
      const sessionDescription = await rtcPeerConnection.createAnswer();
      rtcPeerConnection.setLocalDescription(sessionDescription);
      socket.emit("webrtc_answer", {
        type: "webrtc_answer",
        sdp: sessionDescription,
        roomId,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const sendIceCandidate = (event: RTCPeerConnectionIceEvent) => {
    if (event.candidate) {
      socket.emit("webrtc_ice_candidate", {
        roomId,
        label: event.candidate.sdpMLineIndex,
        candidate: event.candidate.candidate,
      });
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("room_created", async () => {
        console.log("Socket event callback: room_created");
        await setLocalMediaStream({
          audio: true,
          video: true,
        });
        setIsRoomCreator(true);
        setIsCaller(true);
      });

      socket.on("room_joined", async () => {
        console.log("Socket event callback: room_joined");
        await setLocalMediaStream({
          audio: true,
          video: true,
        });
        // user who joined after host starts a call
        socket.emit("start_call", roomId);
      });

      socket.on("full_room", () => {
        console.log("Socket event callback: full_room");
        alert("The room is full, please try another one");
      });

      // listens for the call(user who joined after host) so caller(host) can createOffer and emit to callee (user who joined after host)
      // ->
      socket.on("start_call", async () => {
        console.log("Socket event callback: start_call");
        if (isCaller) {
          const peerConnection = new RTCPeerConnection(iceServers);
          console.log(peerConnection);
          setRtcPeerConnection(peerConnection);
          console.log(peerConnection);
          addLocalTracks(peerConnection);
          console.log("safasfassaf cant get stream");

          console.log("safasfassaf cant get stream");

          peerConnection.onicecandidate = sendIceCandidate;
          await createOffer(peerConnection);
        }
      });

      // callee listens for offer and emits answer back to caller
      // <-
      socket.on("webrtc_offer", async (event) => {
        console.log("Socket event callback: webrtc_offer");
        if (!isCaller) {
          const peerConnection = new RTCPeerConnection(iceServers);
          console.log(peerConnection);
          setRtcPeerConnection(peerConnection);
          // console.log(rtcPeerConnection);
          addLocalTracks(peerConnection);
          console.log("safasfassaf cant get stream");
          peerConnection.ontrack = (event) => {
            if (remoteVideoRef.current) {
              console.log(remoteVideoRef.current);
              remoteVideoRef.current.srcObject = event.streams[0];
              console.log(remoteVideoRef.current.srcObject);
            } else {
              console.log("safasfassaf cant get stream");
            }
          };
          peerConnection.onicecandidate = sendIceCandidate;
          peerConnection.setRemoteDescription(new RTCSessionDescription(event));
          await createAnswer(peerConnection);
        }
      });

      // caller listens for the answer from callee
      // .<-
      socket.on("webrtc_answer", (event) => {
        console.log("Socket event callback: webrtc_answer");
        console.log(isCaller);
        rtcPeerConnection!.setRemoteDescription(
          new RTCSessionDescription(event)
        );
        console.log(rtcPeerConnection);
        if (rtcPeerConnection) {
          console.log(isCaller);
          rtcPeerConnection.ontrack = (event) => {
            console.log(remoteVideoRef.current);
            if (remoteVideoRef.current) {
              console.log(remoteVideoRef.current);
              remoteVideoRef.current.srcObject = event.streams[0];
              console.log(remoteVideoRef.current.srcObject);
            } else {
              console.log("safasfassaf cant get stream");
            }
          };
        }
      });

      socket.on("webrtc_ice_candidate", (event) => {
        console.log("Socket event callback: webrtc_ice_candidate");

        if (isCaller) {
          // Handle ice candidate for the caller
          const candidate = new RTCIceCandidate({
            sdpMLineIndex: event.label,
            candidate: event.candidate,
          });
          rtcPeerConnection!.addIceCandidate(candidate);
          console.log(rtcPeerConnection);
        } else {
          // Handle ice candidate for the callee
          const candidate = new RTCIceCandidate({
            sdpMLineIndex: event.label,
            candidate: event.candidate,
          });
          rtcPeerConnection!.addIceCandidate(candidate);
          console.log(rtcPeerConnection);
        }
      });
    }
  }, [isRoomCreator, roomId, socket]);

  return (
    <div>
      <div>
        <label>Room ID: </label>
        <input type="text" ref={roomInputRef} />
        <button onClick={joinRoom}>Connect</button>
      </div>
      <div>
        <div>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted
            style={{ border: "1px solid green" }}
            // style={{ display: "none" }}
          ></video>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            style={{ border: "1px solid red" }}
          ></video>
        </div>
      </div>
    </div>
  );
};

export default App;

// import React, { useEffect, useState, useRef } from "react";
// import io, { Socket } from "socket.io-client";

// const socket = io("http://localhost:3000");

// const App: React.FC = () => {
//   const roomInputRef = useRef<HTMLInputElement | null>(null);
//   const localVideoRef = useRef<HTMLVideoElement | null>(null);
//   const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

//   const [localStream, setLocalStream] = useState<MediaStream | null>(null);
//   const [isCaller, setIsCaller] = useState<boolean>(false);
//   const [rtcPeerConnection, setRtcPeerConnection] =
//     useState<RTCPeerConnection>();
//   const [roomId, setRoomId] = useState<string>("");

//   const iceServers = {
//     iceServers: [
//       { urls: "stun:stun.l.google.com:19302" },
//       { urls: "stun:stun1.l.google.com:19302" },
//       { urls: "stun:stun2.l.google.com:19302" },
//       { urls: "stun:stun3.l.google.com:19302" },
//       { urls: "stun:stun4.l.google.com:19302" },
//     ],
//   };

//   const remoteStreamMS = new MediaStream();

//   const joinRoom = () => {
//     const room = roomInputRef.current?.value;

//     if (!room) {
//       alert("Please type a room ID");
//       return;
//     }

//     setRoomId(room);
//     socket.emit("join", room);
//     showVideoConference();
//   };

//   const showVideoConference = () => {
//     if (roomInputRef.current) {
//       roomInputRef.current.disabled = true;
//     }

//     if (localVideoRef.current) {
//       localVideoRef.current.style.display = "block";
//     }

//     if (remoteVideoRef.current) {
//       remoteVideoRef.current.style.display = "block";
//     }
//   };

//   const setLocalMediaStream = async (constraints: MediaStreamConstraints) => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia(constraints);
//       setLocalStream(stream);
//       if (localVideoRef.current) {
//         localVideoRef.current.srcObject = stream;
//       }
//     } catch (error) {
//       console.error("Could not get user media", error);
//     }
//   };

//   const setRemoteMediaStream = (event: RTCTrackEvent) => {
//     console.log(isCaller);
//     event.streams[0].getTracks().forEach((track) => {
//       remoteStreamMS.addTrack(track);
//     });
//     if (remoteVideoRef.current) {
//       remoteVideoRef.current.srcObject = remoteStreamMS;
//     }
//   };

//   const addLocalTracks = (rtcPeerConnection: RTCPeerConnection) => {
//     console.log(isCaller);
//     localStream?.getTracks().forEach((track) => {
//       // callee doesn't add tracks
//       rtcPeerConnection.addTrack(track, localStream as MediaStream);

//       const addedTracks = rtcPeerConnection
//         .getSenders()
//         .map((sender) => sender.track);
//       if (addedTracks.length > 0) {
//         console.log("Tracks added to the RTCPeerConnection:");
//         addedTracks.forEach((track) => {
//           console.log(track?.kind); // "audio" or "video"
//         });
//       } else {
//         console.log("No tracks added to the RTCPeerConnection.");
//       }

//       console.log(isCaller);
//     });
//   };

//   const createOffer = async (rtcPeerConnection: RTCPeerConnection) => {
//     try {
//       const sessionDescription = await rtcPeerConnection.createOffer({
//         offerToReceiveVideo: true,
//         offerToReceiveAudio: true,
//       });
//       rtcPeerConnection.setLocalDescription(sessionDescription);
//       socket?.emit("webrtc_offer", {
//         type: "webrtc_offer",
//         sdp: sessionDescription,
//         roomId,
//       });
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const createAnswer = async (rtcPeerConnection: RTCPeerConnection) => {
//     try {
//       const sessionDescription = await rtcPeerConnection.createAnswer();
//       rtcPeerConnection.setLocalDescription(sessionDescription);
//       socket.emit("webrtc_answer", {
//         type: "webrtc_answer",
//         sdp: sessionDescription,
//         roomId,
//       });
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const sendIceCandidate = (event: RTCPeerConnectionIceEvent) => {
//     console.log(isCaller);
//     if (event.candidate) {
//       if (isCaller) console.log(isCaller);

//       socket.emit("webrtc_ice_candidate", {
//         roomId,
//         label: event.candidate.sdpMLineIndex,
//         candidate: event.candidate.candidate,
//       });
//       if (isCaller) console.log(isCaller);
//       console.log(isCaller);
//     }
//   };

//   useEffect(() => {
//     if (socket) {
//       socket.on("room_created", async () => {
//         console.log("Socket event callback: room_created");
//         await setLocalMediaStream({
//           audio: true,
//           video: true,
//         });
//         setIsCaller(true);
//       });

//       socket.on("room_joined", async () => {
//         console.log("Socket event callback: room_joined");
//         await setLocalMediaStream({
//           audio: true,
//           video: true,
//         });
//         socket.emit("start_call", roomId);
//       });

//       socket.on("full_room", () => {
//         console.log("Socket event callback: full_room");
//         alert("The room is full, please try another one");
//       });

//       socket.on("start_call", async () => {
//         console.log("Socket event callback: start_call");
//         console.log(isCaller);
//         if (isCaller) {
//           console.log(isCaller);
//           const peerConnection = new RTCPeerConnection(iceServers);
//           console.log(peerConnection);
//           setRtcPeerConnection(peerConnection);
//           console.log(peerConnection);
//           addLocalTracks(peerConnection);
//           console.log(isCaller);
//           peerConnection.onicecandidate = sendIceCandidate;
//           await createOffer(peerConnection);
//         }
//       });

//       // callee listens for offer and emits answer back to caller
//       // <-
//       socket.on("webrtc_offer", async (event) => {
//         console.log("Socket event callback: webrtc_offer");
//         console.log(isCaller);
//         if (!isCaller) {
//           console.log(isCaller);
//           const peerConnection = new RTCPeerConnection(iceServers);
//           console.log(peerConnection);
//           setRtcPeerConnection(peerConnection);
//           console.log(peerConnection);
//           addLocalTracks(peerConnection);
//           peerConnection.ontrack = setRemoteMediaStream;
//           peerConnection.onicecandidate = sendIceCandidate;
//           peerConnection.setRemoteDescription(new RTCSessionDescription(event));
//           await createAnswer(peerConnection);
//         }
//       });

//       // caller listens for the answer from callee
//       // .<-
//       socket.on("webrtc_answer", (event) => {
//         console.log("Socket event callback: webrtc_answer");
//         rtcPeerConnection!
//           .setRemoteDescription(new RTCSessionDescription(event))
//           .then(() => {
//             console.log("Remote description set successfully.");
//             // Add any additional handling here if needed
//           })
//           .catch((error) => {
//             console.error("Error setting remote description:", error);
//           });
//         console.log(isCaller);
//         if (rtcPeerConnection) {
//           console.log(isCaller);
//           rtcPeerConnection.ontrack = (event) => {
//             if (remoteVideoRef.current) {
//               remoteVideoRef.current.srcObject = event.streams[0];
//             }
//           };
//         }
//       });

//       socket.on("webrtc_ice_candidate", (event) => {
//         console.log("Socket event callback: webrtc_ice_candidate");

//         if (isCaller) {
//           console.log(isCaller);
//           const candidate = new RTCIceCandidate({
//             sdpMLineIndex: event.label,
//             candidate: event.candidate,
//           });
//           rtcPeerConnection!.addIceCandidate(candidate);
//         } else {
//           console.log(isCaller);
//           const candidate = new RTCIceCandidate({
//             sdpMLineIndex: event.label,
//             candidate: event.candidate,
//           });
//           rtcPeerConnection!.addIceCandidate(candidate);
//         }
//       });
//     }
//   }, [isCaller, roomId, socket]);

//   return (
//     <div>
//       <div>
//         <label>Room ID: </label>
//         <input type="text" ref={roomInputRef} />
//         <button onClick={joinRoom}>Connect</button>
//       </div>
//       <div>
//         <div>
//           <video
//             ref={localVideoRef}
//             autoPlay
//             playsInline
//             muted
//             style={{ border: "1px solid green" }}
//           ></video>
//           <video
//             ref={remoteVideoRef}
//             autoPlay
//             playsInline
//             style={{ border: "1px solid red" }}
//           ></video>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default App;
