import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
// import {UserButton} from "@clerk/clerk-react";

const socket = io("http://localhost:3000");

const HomePage: React.FC = () => {
  const roomInputRef = useRef<HTMLInputElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const remoteVideoRefs: Record<string, React.RefObject<HTMLVideoElement>> = {};

  const callerIdRef = useRef<string>("");
  let callerId: string;

  const [localStream, setLocalStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();

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

  const [roomId, setRoomId] = useState<string>("");

  const createPeerConnection = async () => {
    const peerConnection = new RTCPeerConnection(iceServers);

    const remoteStream = new MediaStream();

    setRemoteStream(remoteStream);
    console.log(callerId);
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

      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      } else {
        console.log(
          "remoteVideoRef is null. The reference might not be properly set."
        );
      }
    };

    console.log(peerConnection);

    console.log(peerConnection);
    peerConnection.onicecandidate = sendIceCandidate;

    await addLocalTracks(peerConnection);

    setRtcPeerConnection(peerConnection);
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

      showVideoConference();
    }
  };

  const disconnectRoom = () => {
    console.log(rtcPeerConnection);
    console.log(localStream);
    if (rtcPeerConnection) {
      rtcPeerConnection.close();
    }

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    socket.emit("leaveRoom", roomId);

    const remoteVideo = remoteVideoRef.current;
    if (remoteVideo) {
      remoteVideo.srcObject = null;
    }
    const localVideo = localVideoRef.current;
    if (localVideo) {
      localVideo.srcObject = null;
    }

    socket.disconnect();
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

  const addLocalTracks = async (rtcPeerConnection: RTCPeerConnection) => {
    console.log(callerId);

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
      rtcPeerConnection.addTrack(track, stream as MediaStream);

      const addedTracks = rtcPeerConnection
        .getSenders()
        .map((sender) => sender.track);
      if (addedTracks.length > 0) {
        console.log("Tracks added to the RTCPeerConnection:");
        addedTracks.forEach((track) => {
          console.log(track?.kind);
        });
      } else {
        console.log("No tracks added to the RTCPeerConnection.");
      }

      console.log(callerId);
    });
  };

  const createOffer = async (rtcPeerConnection: RTCPeerConnection) => {
    try {
      const sessionDescription = await rtcPeerConnection.createOffer();
      console.log(callerId);
      console.log(sessionDescription);
      await rtcPeerConnection.setLocalDescription(sessionDescription);
      socket.emit("webrtc_offer", {
        type: "webrtc_offer",
        sdp: sessionDescription,
        roomId,
      });
      console.log(callerId);
      console.log(rtcPeerConnection);
    } catch (error) {
      console.error(error);
    }
  };

  const createAnswer = async (rtcPeerConnection: RTCPeerConnection) => {
    try {
      const sessionDescription = await rtcPeerConnection.createAnswer();
      console.log(callerId);
      console.log(sessionDescription);
      await rtcPeerConnection.setLocalDescription(sessionDescription);
      socket.emit("webrtc_answer", {
        type: "webrtc_answer",
        sdp: sessionDescription,
        roomId,
        callerId,
      });
      console.log(callerId);
      console.log(rtcPeerConnection);
    } catch (error) {
      console.error(error);
    }
  };

  const sendIceCandidate = (event: RTCPeerConnectionIceEvent) => {
    console.log(callerId);
    if (event.candidate) {
      if (callerId) console.log(callerId);

      socket.emit("webrtc_ice_candidate", {
        roomId,
        label: event.candidate.sdpMLineIndex,
        candidate: event.candidate.candidate,
      });
      if (callerId) console.log(callerId);
      console.log(callerId);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("room_created", async () => {
        console.log("Socket event callback: room_created");
        console.log(callerId);

        callerIdRef.current = socket.id;
        console.log(callerIdRef.current);
        callerId = callerIdRef.current;
        // setIsCaller(socket.id);
        console.log(callerId);
      });

      socket.on("room_joined", async () => {
        console.log("Socket event callback: room_joined");
        console.log(callerId);

        socket.emit("start_call", roomId, callerId);
        console.log(callerId);
      });

      socket.on("full_room", () => {
        console.log("Socket event callback: full_room");
        alert("The room is full, please try another one");
      });

      socket.on("userLeft", (userId) => {
        // Remove the video element for the user who left
        if (userId) {
          const remoteVideo = remoteVideoRef.current;
          if (remoteVideo) {
            remoteVideo.srcObject = null;
          }
        }
      });

      socket.on("start_call", async () => {
        console.log("Socket event callback: start_call");
        console.log(callerId);
        if (callerId) {
          console.log(callerId);

          socket.on("webrtc_ice_candidate", async (event) => {
            console.log("Socket event callback: webrtc_ice_candidate");

            console.log(callerId);
            const candidate = new RTCIceCandidate({
              sdpMLineIndex: event.label,
              candidate: event.candidate,
            });
            await (
              await peerConnection!
            )
              .addIceCandidate(candidate)
              .then(() => {
                console.log("added IceCandidate at start_call for caller.");
              })
              .catch((error) => {
                console.error(
                  "Error adding IceCandidate at start_call for caller",
                  error
                );
              });
          });

          const peerConnection = createPeerConnection();
          console.log(peerConnection);
          console.log(rtcPeerConnection);
          console.log(callerId);
          console.log(peerConnection);
          socket.on("webrtc_answer", async (event) => {
            console.log("Socket event callback: webrtc_answer");
            console.log(peerConnection);
            await (
              await peerConnection!
            )
              .setRemoteDescription(new RTCSessionDescription(event))
              .then(() => {
                console.log("Remote description set successfully.");
              })
              .catch((error) => {
                console.error("Error setting Remote description :", error);
              });
            console.log(callerId);
          });
          await createOffer(await peerConnection);
        }
      });

      socket.on("webrtc_offer", async (event) => {
        console.log("Socket event callback: webrtc_offer");
        console.log(callerId);
        if (!callerId) {
          console.log(callerId);

          socket.on("webrtc_ice_candidate", async (event) => {
            console.log("Socket event callback: webrtc_ice_candidate");
            console.log(callerId);
            const candidate = new RTCIceCandidate({
              sdpMLineIndex: event.label,
              candidate: event.candidate,
            });
            await (
              await peerConnection!
            )
              .addIceCandidate(candidate)
              .then(() => {
                console.log("added IceCandidate at start_call for callee");
              })
              .catch((error) => {
                console.error(
                  "Error adding IceCandidate at start_call for callee:",
                  error
                );
              });
          });

          const peerConnection = createPeerConnection();

          console.log(peerConnection);
          console.log(peerConnection);
          await (
            await peerConnection
          )
            .setRemoteDescription(new RTCSessionDescription(event))
            .then(() => {
              console.log("Remote description set successfully.");
            })
            .catch((error) => {
              console.error("Error setting remote description:", error);
            });
          await createAnswer(await peerConnection);
        }
      });
    }
  }, [roomId, socket, rtcPeerConnection]);

  // const navigate = useNavigate();

  // function handleSignOutClickEvent() {
  //   navigate("/sign-out/");
  // }

  return (
    <div>
      <div>
        <label>Room ID: </label>
        <input type="text" ref={roomInputRef} />
        <button onClick={joinRoom}>Connect</button>
        {/* <UserButton/>

        <button onClick={handleSignOutClickEvent}>Sign out</button> */}
      </div>
      <div>
        <div>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{
              height: "200px",
              width: "200px",
              border: "1px solid green",
            }}
          ></video>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{ height: "200px", width: "200px", border: "1px solid red" }}
          ></video>
          <button onClick={disconnectRoom}>Leave</button>
          {/*<TextEditor roomId={roomId}/>*/}
          {/*<Draw/>*/}
        </div>
      </div>
    </div>
  );
};

export default HomePage;

// import React, {useEffect, useRef, useState} from 'react';
// import {useNavigate} from 'react-router-dom';
// import {UserButton} from "@clerk/clerk-react";
// import io from "socket.io-client";
//
// const HomePage: React.FC = () => {
//   const roomInputRef = useRef<HTMLInputElement | null>(null);
//   const localVideoRef = useRef<HTMLVideoElement | null>(null);
//   const remoteVideoRefs: Record<string, React.RefObject<HTMLVideoElement>> = {};
//   const [localStream, setLocalStream] = useState<MediaStream>();
//   const [roomId, setRoomId] = useState<string>('');
//   const [peerConnections, setPeerConnections] = useState<Record<string, RTCPeerConnection>>(
//     {}
//   );
//
//   const iceServers = {
//     iceServers: [
//       {urls: 'stun:stun.l.google.com:19302'},
//       {urls: 'stun:stun1.l.google.com:19302'},
//       {urls: 'stun:stun2.l.google.com:19302'},
//       {urls: 'stun:stun3.l.google.com:19302'},
//       {urls: 'stun:stun4.l.google.com:19302'},
//     ],
//   };
//
//   const socket = io("http://localhost:3000");
//
//
//   const navigate = useNavigate();
//
//   useEffect(() => {
//     if (socket) {
//       socket.on('room_created', async () => {
//         const localStream = await navigator.mediaDevices.getUserMedia({
//           audio: true,
//           video: true,
//         });
//         setLocalStream(localStream);
//         if (localVideoRef.current) {
//           localVideoRef.current.srcObject = localStream;
//         }
//         createPeerConnections();
//       });
//
//       socket.on('room_joined', async () => {
//         const localStream = await navigator.mediaDevices.getUserMedia({
//           audio: true,
//           video: true,
//         });
//         setLocalStream(localStream);
//         if (localVideoRef.current) {
//           localVideoRef.current.srcObject = localStream;
//         }
//         createPeerConnections();
//       });
//
//       socket.on('full_room', () => {
//         alert('The room is full, please try another one');
//       });
//
//       socket.on('userLeft', (userId) => {
//         // Remove the video element for the user who left
//         const remoteVideo = remoteVideoRefs[userId]?.current;
//         if (remoteVideo) {
//           remoteVideo.srcObject = null;
//         }
//         // Close the peer connection
//         const peerConnection = peerConnections[userId];
//         if (peerConnection) {
//           peerConnection.close();
//         }
//       });
//
//       socket.on('webrtc_offer', async (event) => {
//         if (!peerConnections[event.callerId]) {
//           createPeerConnection(event.callerId);
//         }
//         const peerConnection = peerConnections[event.callerId];
//         await peerConnection.setRemoteDescription(new RTCSessionDescription(event.sdp));
//         const answer = await peerConnection.createAnswer();
//         await peerConnection.setLocalDescription(answer);
//         socket.emit('webrtc_answer', {
//           type: 'webrtc_answer',
//           sdp: answer,
//           roomId,
//           callerId: socket.id,
//         });
//       });
//
//       socket.on('webrtc_answer', async (event) => {
//         const peerConnection = peerConnections[event.callerId];
//         await peerConnection.setRemoteDescription(new RTCSessionDescription(event.sdp));
//       });
//
//       socket.on('webrtc_ice_candidate', async (event) => {
//         const peerConnection = peerConnections[event.callerId];
//         const candidate = new RTCIceCandidate({
//           sdpMLineIndex: event.label,
//           candidate: event.candidate,
//         });
//         await peerConnection.addIceCandidate(candidate);
//       });
//     }
//   }, [socket, roomId, peerConnections]);
//
//   const createPeerConnections = () => {
//     // Create a peer connection for each user in the room
//     socket.emit('get_users_in_room', roomId, (userIds: string[]) => {
//       const newPeerConnections: Record<string, RTCPeerConnection> = {};
//       userIds.forEach((userId) => {
//         if (userId !== socket.id) {
//           newPeerConnections[userId] = createPeerConnection(userId);
//         }
//       });
//       setPeerConnections(newPeerConnections);
//     });
//   };
//
//   const createPeerConnection = (remoteUserId: string) => {
//     const peerConnection = new RTCPeerConnection(iceServers);
//     // Add local tracks to the peer connection
//     localStream?.getTracks().forEach((track) => {
//       peerConnection.addTrack(track, localStream as MediaStream);
//     });
//     // Set up event listeners
//     peerConnection.ontrack = (event) => {
//       const remoteVideo = remoteVideoRefs[remoteUserId]?.current;
//       if (remoteVideo) {
//         remoteVideo.srcObject = event.streams[0];
//       }
//     };
//     peerConnection.onicecandidate = (event) => {
//       if (event.candidate) {
//         socket.emit('webrtc_ice_candidate', {
//           roomId,
//           callerId: socket.id,
//           targetUserId: remoteUserId,
//           label: event.candidate.sdpMLineIndex,
//           candidate: event.candidate.candidate,
//         });
//       }
//     };
//     // Create offer and set local description
//     peerConnection.createOffer().then((offer) => {
//       peerConnection.setLocalDescription(offer).then(() => {
//         socket.emit('webrtc_offer', {
//           type: 'webrtc_offer',
//           sdp: offer,
//           roomId,
//           callerId: socket.id,
//           targetUserId: remoteUserId,
//         });
//       });
//     });
//     return peerConnection;
//   };
//
//   const joinRoom = () => {
//     const room = roomInputRef.current?.value;
//
//     if (!room) {
//       alert('Please type a room ID');
//       return;
//     } else {
//       setRoomId(room);
//       socket.emit('join', room);
//     }
//   };
//
//   const disconnectRoom = () => {
//     // Close all peer connections
//     Object.values(peerConnections).forEach((peerConnection) => {
//       peerConnection.close();
//     });
//
//     if (localStream) {
//       localStream.getTracks().forEach((track) => track.stop());
//     }
//
//     socket.emit('leaveRoom', roomId);
//
//     const remoteVideo = remoteVideoRefs[socket.id]?.current;
//     if (remoteVideo) {
//       remoteVideo.srcObject = null;
//     }
//     const localVideo = localVideoRef.current;
//     if (localVideo) {
//       localVideo.srcObject = null;
//     }
//
//     socket.disconnect();
//   };
//
//   const handleSignOutClickEvent = () => {
//     navigate('/sign-out/');
//   };
//
//   return (
//     <div>
//       <div>
//         <label>Room ID: </label>
//         <input type="text" ref={roomInputRef}/>
//         <button onClick={joinRoom}>Connect</button>
//         <UserButton/>
//         <button onClick={handleSignOutClickEvent}>Sign out</button>
//       </div>
//       <div>
//         <div>
//           <video
//             ref={localVideoRef}
//             autoPlay
//             playsInline
//             muted
//             style={{height: '200px', width: '200px', border: '1px solid green'}}
//           ></video>
//           {Object.keys(peerConnections).map((userId) => (
//             <video
//               key={userId}
//               ref={(videoRef) => {
//                 if (videoRef) {
//                   remoteVideoRefs[userId] = React.createRef<HTMLVideoElement>();
//                   Object.assign(remoteVideoRefs[userId], {current: videoRef});
//                 }
//               }}
//
//
//               autoPlay
//               playsInline
//               style={{height: '200px', width: '200px', border: '1px solid red'}}
//             ></video>
//           ))}
//           <button onClick={disconnectRoom}>Leave</button>
//         </div>
//       </div>
//     </div>
//   );
// };
//
// export default HomePage;
//
