// import React, { useEffect, useState, useRef } from "react";
// import io, { Socket } from "socket.io-client";

// const socket = io("http://localhost:3000");

// const App: React.FC = () => {
//   // const [roomId, setRoomId] = useState<string>("");
//   // const [roomId, setRoomId] = useState<string>("");

//   const localVideoRef = React.createRef<HTMLVideoElement>();
//   const remoteVideoRef = React.createRef<HTMLVideoElement>();
//   // const roomInputRef = useRef<HTMLInputElement | null>(null);
//   // const localVideoRef = useRef<HTMLVideoElement | null>(null);
//   // const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

//   // const [socket, setSocket] = useState<Socket | null>(null);
//   // const [localStream, setLocalStream] = useState<MediaStream | null>(null);
//   // const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
//   const [isCaller, setIsCaller] = useState<string>("");
//   const iceServers = {
//     iceServers: [
//       { urls: "stun:stun.l.google.com:19302" },
//       { urls: "stun:stun1.l.google.com:19302" },
//       { urls: "stun:stun2.l.google.com:19302" },
//       { urls: "stun:stun3.l.google.com:19302" },
//       { urls: "stun:stun4.l.google.com:19302" },
//     ],
//   };

//   // const remoteStreamMS = new MediaStream();
//   // const [isRoomCreator, setIsRoomCreator] = useState<boolean>(false);
//   // const [rtcPeerConnection, setRtcPeerConnection] =
//   //   useState<RTCPeerConnection | null>(null);
//   const peerConnectionCaller = new RTCPeerConnection(iceServers);
//   console.log(peerConnectionCaller);

//   console.log(peerConnectionCaller);

//   const peerConnectionCallee = new RTCPeerConnection(iceServers);
//   console.log(peerConnectionCallee);
//   // const peerConnectionCallee = new RTCPeerConnection(iceServers);

//   useEffect(() => {
//     console.log(peerConnectionCallee);
//   }, [peerConnectionCallee]);

//   let roomId: string;

//   // if (!socket || !roomId) {
//   //   return; // Prevent the effect from running if the dependencies are not available
//   // }

//   // useEffect(() => {
//   //   socket.on("connect", () => {
//   //     console.log("Socket connected");
//   //   });

//   //   // setSocket(socket);

//   //   return () => {
//   //     if (socket) {
//   //       socket.disconnect();
//   //     }
//   //   };
//   // }, []);

//   const joinRoom = (event: React.FormEvent) => {
//     // const room = roomInputRef.current?.value;
//     event?.preventDefault(); // Prevent the default form submission
//     const roomInput = event.currentTarget.querySelector(
//       'input[name="roomInput"]'
//     ) as HTMLInputElement;
//     roomId = roomInput.value;

//     if (!roomId) {
//       alert("Please type a room ID");
//       return;
//     }

//     // if (!roomId) {
//     //   alert("Please type a room ID");
//     //   return;
//     // }

//     // roomIdv = roomId;
//     socket.emit("join", roomId);
//     // showVideoConference();
//   };

//   // const showVideoConference = () => {
//   //   if (roomInputRef.current) {
//   //     roomInputRef.current.disabled = true;
//   //   }

//   //   if (localVideoRef.current) {
//   //     localVideoRef.current.style.display = "block";
//   //   }

//   //   if (remoteVideoRef.current) {
//   //     remoteVideoRef.current.style.display = "block";
//   //   }
//   // };

//   // const setLocalMediaStream = async (constraints: MediaStreamConstraints) => {
//   //   try {
//   //     const stream = await navigator.mediaDevices.getUserMedia(constraints);
//   //     setLocalStream(stream);
//   //     if (localVideoRef.current) {
//   //       localVideoRef.current.srcObject = stream;
//   //     }

//   //     console.log(localVideoRef);
//   //     console.log(localVideoRef.current);
//   //     console.log(
//   //       localVideoRef.current ? localVideoRef.current.srcObject : "hm"
//   //     );
//   //   } catch (error) {
//   //     console.error("Could not get user media", error);
//   //   }
//   // };

//   // const setRemoteMediaStream = (event: RTCTrackEvent) => {
//   //   console.log("Remote Tracks:", event.streams[0].getTracks());
//   //   console.log("Remote Tracks:", event.streams[0]);
//   //   event.streams[0].getTracks().forEach((track) => {
//   //     remoteStreamMS.addTrack(track);
//   //   });
//   //   setRemoteStream(event.streams[0]);
//   //   if (remoteVideoRef.current) {
//   //     remoteVideoRef.current.srcObject = remoteStreamMS;
//   //     //   remoteVideoRef.current.srcObject = event.streams[0];
//   //   }
//   //   console.log(remoteStream);
//   //   console.log(remoteStreamMS);
//   //   console.log(remoteVideoRef);
//   //   console.log(remoteVideoRef.current);
//   //   console.log(
//   //     remoteVideoRef.current ? remoteVideoRef.current.srcObject : "hm"
//   //   );
//   // };

//   // const addLocalTracks = (rtcPeerConnection: RTCPeerConnection) => {
//   //   console.log(isCaller);
//   //   localStream?.getTracks().forEach((track) => {
//   //     rtcPeerConnection.addTrack(track, localStream as MediaStream);
//   //   });
//   // };

//   const createOffer = async (rtcPeerConnection: RTCPeerConnection) => {
//     try {
//       const sessionDescription = await rtcPeerConnection.createOffer({
//         offerToReceiveVideo: true, // This is important to receive the video
//         offerToReceiveAudio: true, // Make sure audio is received as well
//       });
//       console.log(roomId);
//       await rtcPeerConnection.setLocalDescription(sessionDescription);
//       socket.emit("webrtc_offer", {
//         type: "webrtc_offer",
//         sdp: sessionDescription,
//         roomId,
//       });
//       console.log(rtcPeerConnection);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const createAnswer = async (rtcPeerConnection: RTCPeerConnection) => {
//     try {
//       const sessionDescription = await rtcPeerConnection.createAnswer();
//       await rtcPeerConnection.setLocalDescription(sessionDescription);
//       socket.emit("webrtc_answer", {
//         type: "webrtc_answer",
//         sdp: sessionDescription,
//         roomId,
//       });
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   // const sendIceCandidate = (event: RTCPeerConnectionIceEvent) => {
//   //   if (event.candidate) {
//   //     socket.emit("webrtc_ice_candidate", {
//   //       roomId,
//   //       label: event.candidate.sdpMLineIndex,
//   //       candidate: event.candidate.candidate,
//   //     });
//   //   }
//   // };

//   useEffect(() => {
//     if (socket) {
//       socket.on("room_created", async () => {
//         console.log("Socket event callback: room_created");
//         console.log(isCaller);
//         // await setLocalMediaStream({
//         //   audio: true,
//         //   video: true,
//         // });
//         // setIsRoomCreator(true);
//         setIsCaller(socket.id);
//       });

//       socket.on("room_joined", async () => {
//         console.log("Socket event callback: room_joined");
//         console.log(isCaller);
//         // await setLocalMediaStream({
//         //   audio: true,
//         //   video: true,
//         // });
//         // user who joined after host starts a call
//         socket.emit("start_call", roomId, isCaller);
//       });

//       socket.on("full_room", () => {
//         console.log("Socket event callback: full_room");
//         alert("The room is full, please try another one");
//       });

//       // listens for the call(user who joined after host) so caller(host) can createOffer and emit to callee (user who joined after host)
//       // ->
//       socket.on("start_call", async () => {
//         console.log("Socket event callback: start_call");
//         console.log(isCaller);
//         if (isCaller) {
//           console.log(isCaller);
//           // const peerConnection = new RTCPeerConnection(iceServers);
//           console.log(peerConnectionCaller);
//           // setRtcPeerConnection(peerConnection);
//           console.log(peerConnectionCallee);
//           // addLocalTracks(peerConnection);
//           console.log("safasfassaf cant get stream");

//           console.log("safasfassaf cant get stream");

//           // peerConnection.onicecandidate = sendIceCandidate;
//           await createOffer(peerConnectionCaller);
//         }
//       });

//       // callee listens for offer and emits answer back to caller
//       // <-
//       socket.on("webrtc_offer", async (event) => {
//         console.log("Socket event callback: webrtc_offer");
//         console.log(isCaller);
//         if (!isCaller) {
//           // const peerConnection = new RTCPeerConnection(iceServers);
//           console.log(isCaller);
//           console.log(peerConnectionCaller);

//           console.log(peerConnectionCaller);
//           // addLocalTracks(peerConnection);
//           console.log("safasfassaf cant get stream");
//           // peerConnection.ontrack = (event) => {
//           //   if (remoteVideoRef.current) {
//           //     console.log(remoteVideoRef.current);
//           //     remoteVideoRef.current.srcObject = event.streams[0];
//           //     console.log(remoteVideoRef.current.srcObject);
//           //   } else {
//           //     console.log("safasfassaf cant get stream");
//           //   }
//           // };
//           // peerConnection.onicecandidate = sendIceCandidate;
//           peerConnectionCallee
//             .setRemoteDescription(new RTCSessionDescription(event))
//             .then(() => {
//               console.log("callee's RemoteDescription is set");
//             })
//             .catch(() => {
//               console.log("callee's RemoteDescription is set");
//             });
//           await createAnswer(peerConnectionCallee);
//         }
//       });

//       // caller listens for the answer from callee
//       // .<-
//       socket.on("webrtc_answer", (event) => {
//         console.log("Socket event callback: webrtc_answer");
//         console.log(isCaller);
//         console.log(peerConnectionCaller);
//         console.log(peerConnectionCallee);
//         peerConnectionCaller
//           .setRemoteDescription(new RTCSessionDescription(event))
//           .then(() => {
//             console.log("caller's RemoteDescription is set");
//           })
//           .catch(() => {
//             console.log("caller's RemoteDescription is set");
//           });
//         console.log(peerConnectionCaller);
//         // if (rtcPeerConnection) {
//         //   console.log(isCaller);
//         //   rtcPeerConnection.ontrack = (event) => {
//         //     console.log(remoteVideoRef.current);
//         //     if (remoteVideoRef.current) {
//         //       console.log(remoteVideoRef.current);
//         //       remoteVideoRef.current.srcObject = event.streams[0];
//         //       console.log(remoteVideoRef.current.srcObject);
//         //     } else {
//         //       console.log("safasfassaf cant get stream");
//         //     }
//         //   };
//         // }
//       });
//     }
//     //   socket.on("webrtc_ice_candidate", (event) => {
//     //     console.log("Socket event callback: webrtc_ice_candidate");

//     //     if (isCaller) {
//     //       // Handle ice candidate for the caller
//     //       const candidate = new RTCIceCandidate({
//     //         sdpMLineIndex: event.label,
//     //         candidate: event.candidate,
//     //       });
//     //       rtcPeerConnection!.addIceCandidate(candidate);
//     //       console.log(rtcPeerConnection);
//     //     } else {
//     //       // Handle ice candidate for the callee
//     //       const candidate = new RTCIceCandidate({
//     //         sdpMLineIndex: event.label,
//     //         candidate: event.candidate,
//     //       });
//     //       rtcPeerConnection!.addIceCandidate(candidate);
//     //       console.log(rtcPeerConnection);
//     //     }
//     //   });
//     // }

//     // return () => {
//     //   socket.disconnect();
//     // };
//   }, []);

//   return (
//     <div>
//       <div>
//         <label>Room ID: </label>

//         <form onSubmit={joinRoom}>
//           <input type="text" name="roomInput" />
//           <button type="submit">Connect</button>
//         </form>

//         {/* <input
//           type="text"
//           value={roomId}
//           onChange={(e) => setRoomId(e.target.value)}
//         />
//         <button onClick={joinRoom}>Connect</button> */}
//         {/* <input type="text" ref={roomInputRef} />
//         <button onClick={joinRoom}>Connect</button> */}
//       </div>
//       <div>
//         <div>
//           <video
//             ref={remoteVideoRef}
//             autoPlay
//             playsInline
//             muted
//             style={{ border: "1px solid green" }}
//           ></video>
//           <video
//             ref={localVideoRef}
//             autoPlay
//             playsInline
//             style={{ border: "1px solid red" }}
//           ></video>
//           {/* <video
//             ref={remoteVideoRef}
//             autoPlay
//             playsInline
//             muted
//             style={{ border: "1px solid green" }}
//             // style={{ display: "none" }}
//           ></video> */}
//           {/* <video
//             ref={localVideoRef}
//             autoPlay
//             playsInline
//             style={{ border: "1px solid red" }}
//           ></video> */}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default App;

import React, { useEffect, useState, useRef } from "react";
import io, { Socket } from "socket.io-client";

const socket = io("http://localhost:3000");

const App: React.FC = () => {
  const roomInputRef = useRef<HTMLInputElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  // let stream: MediaStream;
  // let remoteStream: MediaStream;
  const [isCaller, setIsCaller] = useState<string>("");
  const [rtcPeerConnection, setRtcPeerConnection] =
    useState<RTCPeerConnection>();

  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
    ],
  };
  // const pcCaller = new RTCPeerConnection(iceServers);
  // const pcCallee = new RTCPeerConnection(iceServers);
  // console.log(pcCaller);
  // console.log(pcCallee);
  const [roomId, setRoomId] = useState<string>("");

  // const remoteStreamMS = new MediaStream();
  const createPeerConnection = () => {
    const peerConnection = new RTCPeerConnection(iceServers);

    const remoteStream = new MediaStream();

    setRemoteStream(remoteStream);
    console.log(isCaller);
    console.log(remoteStream);
    if (remoteVideoRef.current) {
      console.log(remoteVideoRef.current.srcObject);
      remoteVideoRef.current.srcObject = remoteStream;
      console.log(remoteVideoRef.current.srcObject);
    } else {
      if (remoteVideoRef.current) console.log(remoteVideoRef.current);
      console.log("remoteVideoRef is null why????");
    }
    peerConnection.ontrack = (event) => {
      console.log("ontrack event triggered.");

      // Add remote tracks to the remoteStream
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });

      // Ensure that remoteVideoRef has a reference
      if (remoteVideoRef.current) {
        // Set the srcObject of the remote video element
        remoteVideoRef.current.srcObject = remoteStream;
      } else {
        console.log(
          "remoteVideoRef is null. The reference might not be properly set."
        );
      }
    };

    console.log(peerConnection);
    // peerConnection.ontrack = (event) => {
    //   if (remoteVideoRef.current) {
    //     console.log(remoteVideoRef.current.srcObject);
    //     remoteVideoRef.current.srcObject = event.streams[0];
    //   } else {
    //     if (remoteVideoRef.current) console.log(remoteVideoRef.current);
    //     console.log("remoteVideoRef is null why????");
    //   }
    // };

    // remoteStream = new MediaStream();
    // console.log(isCaller);
    // console.log(remoteStream);
    // if (remoteVideoRef.current) {
    //   console.log(remoteVideoRef.current.srcObject);
    //   remoteVideoRef.current.srcObject = remoteStream;
    //   console.log(remoteVideoRef.current.srcObject);
    // } else {
    //   if (remoteVideoRef.current) console.log(remoteVideoRef.current);
    //   console.log("remoteVideoRef is null why????");
    // }
    // peerConnection.ontrack = (event) => {
    //   console.log("ontrack event triggered.");

    //   // Add remote tracks to the remoteStream
    //   event.streams[0].getTracks().forEach((track) => {
    //     remoteStream.addTrack(track);
    //   });

    //   // Ensure that remoteVideoRef has a reference
    //   if (remoteVideoRef.current) {
    //     // Set the srcObject of the remote video element
    //     remoteVideoRef.current.srcObject = remoteStream;
    //   } else {
    //     console.log(
    //       "remoteVideoRef is null. The reference might not be properly set."
    //     );
    //   }
    // };

    console.log(peerConnection);
    peerConnection.onicecandidate = sendIceCandidate;

    addLocalTracks(peerConnection);

    setRtcPeerConnection(peerConnection); // Set it here
    return peerConnection;
  };

  const joinRoom = () => {
    const room = roomInputRef.current?.value;

    if (!room) {
      alert("Please type a room ID");
      return;
    } else {
      setRoomId(room);
      socket.emit("join", room);

      // if (isCaller) {
      //   const peerConnection = createPeerConnection(); // Create and set RTC peer connection
      //   addLocalTracks(peerConnection);
      //   createOffer(peerConnection);
      // }

      showVideoConference();
    }
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

  // const setLocalMediaStream = async (constraints: MediaStreamConstraints) => {
  //   try {
  //     console.log(isCaller);
  //     stream = await navigator.mediaDevices.getUserMedia(constraints);
  //     console.log(stream);
  //     // setLocalStream(stream);
  //     // console.log(localStream);
  //     if (localVideoRef.current) {
  //       localVideoRef.current.srcObject = stream;
  //     }
  //     console.log(localVideoRef);
  //   } catch (error) {
  //     console.error("Could not get user media", error);
  //   }
  // };

  // const setRemoteMediaStream = (event: RTCTrackEvent) => {

  //   console.log(isCaller);
  //   event.streams[0].getTracks().forEach((track) => {
  //     remoteStream.addTrack(track);
  //   });
  //   // if (remoteVideoRef.current) {
  //   //   console.log(remoteVideoRef.current.srcObject);
  //   // } else {
  //   //   if (remoteVideoRef.current) console.log(remoteVideoRef.current);
  //   //   console.log("remoteVideoRef is null why????");
  //   // }
  // };

  const addLocalTracks = async (rtcPeerConnection: RTCPeerConnection) => {
    console.log(isCaller);

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setLocalStream(stream);
    console.log(stream);
    // setLocalStream(stream);
    console.log(localStream);
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    stream.getTracks().forEach((track) => {
      // callee doesn't add tracks
      rtcPeerConnection.addTrack(track, stream as MediaStream);

      const addedTracks = rtcPeerConnection
        .getSenders()
        .map((sender) => sender.track);
      if (addedTracks.length > 0) {
        console.log("Tracks added to the RTCPeerConnection:");
        addedTracks.forEach((track) => {
          console.log(track?.kind); // "audio" or "video"
        });
      } else {
        console.log("No tracks added to the RTCPeerConnection.");
      }

      console.log(isCaller);
    });
  };

  const createOffer = async (rtcPeerConnection: RTCPeerConnection) => {
    try {
      const sessionDescription = await rtcPeerConnection.createOffer({
        offerToReceiveVideo: true,
        offerToReceiveAudio: true,
      });
      console.log(isCaller);
      console.log(sessionDescription);
      await rtcPeerConnection.setLocalDescription(sessionDescription);
      socket.emit("webrtc_offer", {
        type: "webrtc_offer",
        sdp: sessionDescription,
        roomId,
      });
      console.log(isCaller);
      console.log(rtcPeerConnection);
    } catch (error) {
      console.error(error);
    }
  };

  const createAnswer = async (rtcPeerConnection: RTCPeerConnection) => {
    try {
      const sessionDescription = await rtcPeerConnection.createAnswer();
      console.log(isCaller);
      console.log(sessionDescription);
      await rtcPeerConnection.setLocalDescription(sessionDescription);
      socket.emit("webrtc_answer", {
        type: "webrtc_answer",
        sdp: sessionDescription,
        roomId,
      });
      console.log(isCaller);
      console.log(rtcPeerConnection);
    } catch (error) {
      console.error(error);
    }
  };

  const sendIceCandidate = (event: RTCPeerConnectionIceEvent) => {
    console.log(isCaller);
    if (event.candidate) {
      if (isCaller) console.log(isCaller);

      socket.emit("webrtc_ice_candidate", {
        roomId,
        label: event.candidate.sdpMLineIndex,
        candidate: event.candidate.candidate,
      });
      if (isCaller) console.log(isCaller);
      console.log(isCaller);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("room_created", async () => {
        console.log("Socket event callback: room_created");
        console.log(isCaller);
        // await setLocalMediaStream({
        //   audio: true,
        //   video: true,
        // });
        setIsCaller(socket.id);
        console.log(isCaller);
      });

      socket.on("room_joined", async () => {
        console.log("Socket event callback: room_joined");
        console.log(isCaller);
        // await setLocalMediaStream({
        //   audio: true,
        //   video: true,
        // });
        socket.emit("start_call", roomId);
        console.log(isCaller);
      });

      socket.on("full_room", () => {
        console.log("Socket event callback: full_room");
        alert("The room is full, please try another one");
      });

      socket.on("start_call", async () => {
        console.log("Socket event callback: start_call");
        console.log(isCaller);
        if (isCaller) {
          console.log(isCaller);

          socket.on("webrtc_ice_candidate", async (event) => {
            console.log("Socket event callback: webrtc_ice_candidate");

            if (isCaller) {
              console.log(isCaller);
              const candidate = new RTCIceCandidate({
                sdpMLineIndex: event.label,
                candidate: event.candidate,
              });
              await peerConnection!
                .addIceCandidate(candidate)
                .then(() => {
                  console.log("added IceCandidate at start_call for caller.");
                  // Add any additional handling here if needed
                })
                .catch((error) => {
                  console.error(
                    "Error adding IceCandidate at start_call for caller",
                    error
                  );
                });
            } else {
              console.log(isCaller);
              const candidate = new RTCIceCandidate({
                sdpMLineIndex: event.label,
                candidate: event.candidate,
              });
              await peerConnection!.addIceCandidate(candidate);
            }
          });

          const peerConnection = createPeerConnection();
          // const peerConnection = new RTCPeerConnection(iceServers);
          console.log(peerConnection);
          // setRtcPeerConnection(peerConnection);
          console.log(rtcPeerConnection);

          // addLocalTracks(peerConnection);

          // peerConnection.ontrack = (event) => {
          //   if (remoteVideoRef.current) {
          //     remoteVideoRef.current.srcObject = event.streams[0];
          //   }

          //   console.log(remoteVideoRef);
          //   console.log(event.streams[0]);
          // };
          console.log(isCaller);
          // peerConnection.onicecandidate = sendIceCandidate;
          console.log(peerConnection);
          socket.on("webrtc_answer", async (event) => {
            console.log("Socket event callback: webrtc_answer");
            console.log(peerConnection);

            if (isCaller) {
              await peerConnection!
                .setRemoteDescription(new RTCSessionDescription(event))
                .then(() => {
                  console.log("Remote description set successfully.");
                  // Add any additional handling here if needed
                })
                .catch((error) => {
                  console.error("Error setting Remote description :", error);
                });
              console.log(isCaller);
            }
            // if (isCaller) {
            //   console.log(isCaller);
            //   pcCaller.ontrack = (event) => {
            //     if (remoteVideoRef.current) {
            //       remoteVideoRef.current.srcObject = event.streams[0];
            //     }

            //     console.log(remoteVideoRef);
            //     console.log(event.streams[0]);
            //   };
            // }
          });
          await createOffer(peerConnection);
        }
      });

      // callee listens for offer and emits answer back to caller
      // <-
      socket.on("webrtc_offer", async (event) => {
        console.log("Socket event callback: webrtc_offer");
        console.log(isCaller);
        if (!isCaller) {
          console.log(isCaller);

          socket.on("webrtc_ice_candidate", async (event) => {
            console.log("Socket event callback: webrtc_ice_candidate");

            if (isCaller) {
              console.log(isCaller);
              const candidate = new RTCIceCandidate({
                sdpMLineIndex: event.label,
                candidate: event.candidate,
              });
              await peerConnection!.addIceCandidate(candidate);
            } else {
              console.log(isCaller);
              const candidate = new RTCIceCandidate({
                sdpMLineIndex: event.label,
                candidate: event.candidate,
              });
              await peerConnection!
                .addIceCandidate(candidate)
                .then(() => {
                  console.log("added IceCandidate at start_call for callee");
                  // Add any additional handling here if needed
                })
                .catch((error) => {
                  console.error(
                    "Error adding IceCandidate at start_call for callee:",
                    error
                  );
                });
            }
          });

          const peerConnection = createPeerConnection();

          // const peerConnection = new RTCPeerConnection(iceServers);
          console.log(peerConnection);
          // setRtcPeerConnection(peerConnection);
          console.log(peerConnection);

          // addLocalTracks(peerConnection);

          // peerConnection.ontrack = (event) => {
          //   if (remoteVideoRef.current) {
          //     remoteVideoRef.current.srcObject = event.streams[0];
          //   }

          //   console.log(remoteVideoRef);
          //   console.log(event.streams[0]);
          // };

          // // pcCallee.ontrack = setRemoteMediaStream;
          // peerConnection.onicecandidate = sendIceCandidate;
          await peerConnection
            .setRemoteDescription(new RTCSessionDescription(event))
            .then(() => {
              console.log("Remote description set successfully.");
              // Add any additional handling here if needed
            })
            .catch((error) => {
              console.error("Error setting remote description:", error);
            });
          await createAnswer(peerConnection);
        }
      });

      // caller listens for the answer from callee
      // .<-
      // socket.on("webrtc_answer", async (event) => {
      //   console.log("Socket event callback: webrtc_answer");

      //   if (isCaller) {
      //     await rtcPeerConnection!
      //       .setRemoteDescription(new RTCSessionDescription(event))
      //       .then(() => {
      //         console.log("Remote description set successfully.");
      //         // Add any additional handling here if needed
      //       })
      //       .catch((error) => {
      //         console.error("Error setting remote description:", error);
      //       });
      //     console.log(isCaller);
      //   }
      //   // if (isCaller) {
      //   //   console.log(isCaller);
      //   //   pcCaller.ontrack = (event) => {
      //   //     if (remoteVideoRef.current) {
      //   //       remoteVideoRef.current.srcObject = event.streams[0];
      //   //     }

      //   //     console.log(remoteVideoRef);
      //   //     console.log(event.streams[0]);
      //   //   };
      //   // }
      // });

      // socket.on("webrtc_ice_candidate", async (event) => {
      //   console.log("Socket event callback: webrtc_ice_candidate");

      //   if (isCaller) {
      //     console.log(isCaller);
      //     const candidate = new RTCIceCandidate({
      //       sdpMLineIndex: event.label,
      //       candidate: event.candidate,
      //     });
      //     await rtcPeerConnection!.addIceCandidate(candidate);
      //   } else {
      //     console.log(isCaller);
      //     const candidate = new RTCIceCandidate({
      //       sdpMLineIndex: event.label,
      //       candidate: event.candidate,
      //     });
      //     await rtcPeerConnection!.addIceCandidate(candidate);
      //   }
      // });
    }
  }, [isCaller, roomId, socket, rtcPeerConnection]);

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
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{ border: "1px solid green" }}
          ></video>
          <video
            ref={remoteVideoRef}
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
