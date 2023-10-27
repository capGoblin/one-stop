import React, { useEffect, useState, useRef } from "react";
import io, { Socket } from "socket.io-client";

const socket = io("http://localhost:3000");

const App: React.FC = () => {
  const roomInputRef = useRef<HTMLInputElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const callerIdRef = useRef<string>("");
  let callerId: string;

  const [localStream, setLocalStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  // let stream: MediaStream;
  // let remoteStream: MediaStream;
  // const [callerId, setIsCaller] = useState<string>("");
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
    // console.log(callerId);
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

    await addLocalTracks(peerConnection);

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

      showVideoConference();
    }
  };

  const disconnectRoom = () => {
    console.log(rtcPeerConnection);
    console.log(localStream);
    if (rtcPeerConnection) {
      rtcPeerConnection.close();
    }
  
    // Stop the local stream if it exists.
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }


    socket.emit('leaveRoom', roomId);



    const remoteVideo = remoteVideoRef.current;
    if (remoteVideo) {
      remoteVideo.srcObject = null;
    }
    const localVideo = localVideoRef.current;
    if (localVideo) {
      localVideo.srcObject = null;
    }
  }

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
  //     console.log(callerId);
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

  //   console.log(callerId);
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

      console.log(callerId);
    });
  };

  const createOffer = async (rtcPeerConnection: RTCPeerConnection) => {
    try {
      const sessionDescription = await rtcPeerConnection.createOffer({
        offerToReceiveVideo: true,
        offerToReceiveAudio: true,
      });
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
        callerId
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
        // await setLocalMediaStream({
        //   audio: true,
        //   video: true,
        // });
        callerIdRef.current = socket.id;
        console.log(callerIdRef.current)
        callerId = callerIdRef.current;
        // setIsCaller(socket.id);
        console.log(callerId);
      });

      socket.on("room_joined", async () => {
        console.log("Socket event callback: room_joined");
        console.log(callerId);
        // await setLocalMediaStream({
        //   audio: true,
        //   video: true,
        // });
        socket.emit("start_call", roomId, callerId);
        console.log(callerId);
      });

      socket.on("full_room", () => {
        console.log("Socket event callback: full_room");
        alert("The room is full, please try another one");
      });

      socket.on('userLeft', (userId) => {
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

            // if (callerId) {
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
                  // Add any additional handling here if needed
                })
                .catch((error) => {
                  console.error(
                    "Error adding IceCandidate at start_call for caller",
                    error
                  );
                });
            // } else {
            //   console.log(callerId);
            //   const candidate = new RTCIceCandidate({
            //     sdpMLineIndex: event.label,
            //     candidate: event.candidate,
            //   });
            //   await (await peerConnection!).addIceCandidate(candidate);
            // }
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
          console.log(callerId);
          // peerConnection.onicecandidate = sendIceCandidate;
          console.log(peerConnection);
          socket.on("webrtc_answer", async (event) => {
            console.log("Socket event callback: webrtc_answer");
            console.log(peerConnection);

            if (callerId) {
              await (
                await peerConnection!
              )
                .setRemoteDescription(new RTCSessionDescription(event))
                .then(() => {
                  console.log("Remote description set successfully.");
                  // Add any additional handling here if needed
                })
                .catch((error) => {
                  console.error("Error setting Remote description :", error);
                });
              console.log(callerId);
            }
            // if (callerId) {
            //   console.log(callerId);
            //   pcCaller.ontrack = (event) => {
            //     if (remoteVideoRef.current) {
            //       remoteVideoRef.current.srcObject = event.streams[0];
            //     }

            //     console.log(remoteVideoRef);
            //     console.log(event.streams[0]);
            //   };
            // }
          });
          await createOffer(await peerConnection);
        }
      });

      // callee listens for offer and emits answer back to caller
      // <-
      socket.on("webrtc_offer", async (event) => {
        console.log("Socket event callback: webrtc_offer");
        console.log(callerId);
        if (!callerId) {
          console.log(callerId);

          socket.on("webrtc_ice_candidate", async (event) => {
            console.log("Socket event callback: webrtc_ice_candidate");

            // if (callerId) {
            //   console.log(callerId);
            //   const candidate = new RTCIceCandidate({
            //     sdpMLineIndex: event.label,
            //     candidate: event.candidate,
            //   });
            //   await (await peerConnection!).addIceCandidate(candidate);
            // } else {
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
                  // Add any additional handling here if needed
                })
                .catch((error) => {
                  console.error(
                    "Error adding IceCandidate at start_call for callee:",
                    error
                  );
                });
            // }
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
          await (
            await peerConnection
          )
            .setRemoteDescription(new RTCSessionDescription(event))
            .then(() => {
              console.log("Remote description set successfully.");
              // Add any additional handling here if needed
            })
            .catch((error) => {
              console.error("Error setting remote description:", error);
            });
          await createAnswer(await peerConnection);
        }
      });

      // caller listens for the answer from callee
      // .<-
      // socket.on("webrtc_answer", async (event) => {
      //   console.log("Socket event callback: webrtc_answer");

      //   if (callerId) {
      //     await rtcPeerConnection!
      //       .setRemoteDescription(new RTCSessionDescription(event))
      //       .then(() => {
      //         console.log("Remote description set successfully.");
      //         // Add any additional handling here if needed
      //       })
      //       .catch((error) => {
      //         console.error("Error setting remote description:", error);
      //       });
      //     console.log(callerId);
      //   }
      //   // if (callerId) {
      //   //   console.log(callerId);
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

      //   if (callerId) {
      //     console.log(callerId);
      //     const candidate = new RTCIceCandidate({
      //       sdpMLineIndex: event.label,
      //       candidate: event.candidate,
      //     });
      //     await rtcPeerConnection!.addIceCandidate(candidate);
      //   } else {
      //     console.log(callerId);
      //     const candidate = new RTCIceCandidate({
      //       sdpMLineIndex: event.label,
      //       candidate: event.candidate,
      //     });
      //     await rtcPeerConnection!.addIceCandidate(candidate);
      //   }
      // });
    }
  }, [roomId, socket, rtcPeerConnection]);



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
          <button onClick={disconnectRoom}>Leave</button>
        </div>
      </div>
    </div>
  );
};

export default App;
