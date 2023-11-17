import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import SideBar from "./SideBar";
import TextEditor from "./TextEditor";
import Draw from "./Draw";
import useMeetStore from "../store";

const socket = io("http://localhost:3000");

const HomePage: React.FC = () => {
  const { rtcPeerConnection, setRtcPeerConnection } = useMeetStore();
  // TODO: use something from mesh for roomInputRef
  const roomInputRef = useRef<HTMLInputElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const callerIdRef = useRef<string>("");
  let callerId: string;

  // const remoteVideoRefs: Record<string, React.RefObject<HTMLVideoElement>> = {};

  // const [localStream, setLocalStream] = useState<MediaStream>();
  // const [remoteStream, setRemoteStream] = useState<MediaStream>();

  // const [rtcPeerConnection, setRtcPeerConnection] =
  //   useState<RTCPeerConnection>();

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

    // setRemoteStream(remoteStream);
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
    // console.log(localStream);
    if (rtcPeerConnection) {
      rtcPeerConnection.close();
    }

    // if (localStream) {
    //   localStream.getTracks().forEach((track) => track.stop());
    // }

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
    // setLocalStream(stream);
    console.log(stream);
    // setLocalStream(stream);
    // console.log(localStream);
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

  const [clickedIcon, setClickedIcon] = useState<string>("Video");

  return (
    <div>
      <div className="flex space-x-10 mt-10">
        {/* <div className=""> */}
        {/* <label>Room ID: </label> */}
        <input
          className="placeholder:italic placeholder:text-secondary block bg-gray-900  rounded-md py-2 px-5 pl-9 pr-4 shadow-sm  focus:outline-none focus:ring-gray-700 focus:ring-1 sm:text-sm"
          type="text"
          ref={roomInputRef}
          placeholder="Type the damn Room Id..."
        />
        <button
          className="text-secondary bg-gray-900 hover:text-gray-900 hover:bg-secondary hover:font-bold font-semibold tracking-wider py-2 px-6 rounded-lg w-min grow-0"
          onClick={joinRoom}
        >
          Connect
        </button>
      </div>
      <SideBar
        clickedIcon={(arg0) => {
          setClickedIcon(arg0);
          // console.log(arg0);
        }}
      />
      {/* <div>
        <label>Room ID: </label>
        <input type="text" ref={roomInputRef} />
        <button onClick={joinRoom}>Connect</button> */}
      {/* <UserButton /> */}

      {/* <button onClick={handleSignOutClickEvent}>Sign out</button> */}
      {/* </div> */}
      <div>
        <div
          className={`flex flex-col items-center ${
            clickedIcon === "Video" ? "block" : "none"
          }`}
        >
          {/* <div className="flex flex-col justify-evenly"> */}

          {/* <div className="flex space-x-10"> */}
          {/* <div className="mx-auto"> */}
          <div className="flex">
            <video
              className="m-20"
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{
                height: "250px",
                width: "60%",
                border: "1px solid green",
                display: clickedIcon === "Video" ? "block" : "none",
              }}
            ></video>
            <video
              className="m-20"
              ref={remoteVideoRef}
              autoPlay
              playsInline
              style={{
                height: "250px",
                width: "60%",
                border: "1px solid red",
                display: clickedIcon === "Video" ? "block" : "none",
              }}
            ></video>
          </div>
          {/* </div> */}
          <button
            className="text-secondary bg-gray-900 hover:text-gray-900 hover:bg-secondary hover:font-bold font-semibold tracking-wider rounded-lg w-min py-2 px-6 grow-0 mb-10"
            style={{
              display: clickedIcon === "Video" ? "block" : "none",
            }}
            onClick={disconnectRoom}
          >
            Leave
          </button>
          {/* </div> */}
        </div>
        {/* {clickedIcon === "Video" ? (
          // <div className="flex flex-col items-center justify-center h-screen space-x-20">
          
        ) : null} */}

        {clickedIcon === "FileText" ? <TextEditor roomId={roomId} /> : null}
        {clickedIcon === "Draw" ? <Draw /> : null}
      </div>
    </div>
  );
};

export default HomePage;
