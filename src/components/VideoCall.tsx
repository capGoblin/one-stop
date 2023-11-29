import React, { useContext, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import toast, { Toaster } from "react-hot-toast";

import { useNavigate } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import useMeetStore from "../store";
import SideBar from "./SideBar";
import Video from "./Video";
import BottomBar from "./BottomBar";
import Draw from "./Draw";
import HomePage from "./HomePage";
import TextEditor from "./TextEditor";
// import GridLayout from "react-grid-layout";
// import { Responsive as ResponsiveGridLayout } from "react-grid-layout";
// import { SocketContext, useSocket } from "../Contexts/SocketContext";
// TODO: Batch Update the draw and text once comp switched
const socket = io("http://localhost:3000");

const VideoCall: React.FC = () => {
  // const { socket } = useContext(SocketContext);
  // const { socket } = useSocket();
  const { rtcPeerConnection, setRtcPeerConnection } = useMeetStore();
  // TODO: use something from mesh for roomInputRef
  const roomInputRef = useRef<HTMLInputElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  // TODO: room&user management to global
  const callerIdRef = useRef<string>("");
  let callerId: string;

  // const remoteVideoRefs: Record<string, React.RefObject<HTMLVideoElement>> = {};
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [shareId, setShareId] = useState<string>();

  // const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const audioBarsRef = useRef<HTMLDivElement[]>([]);

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

  // const [audioContext, setAudioContext] = useState<AudioContext>();
  const [localAudioContext, setLocalAudioContext] =
    useState<AudioContext | null>(null);
  const [remoteAudioContext, setRemoteAudioContext] =
    useState<AudioContext | null>(null);

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
        setRemoteStream(remoteStream);
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

  const createRoom = () => {
    let room = roomInputRef.current?.value;

    if (!room) {
      room = uuidv4();

      navigator.clipboard
        .writeText(room)
        .then(() => {
          toast.success("Room ID copied to clipboard!");
          // Optionally, set a state or trigger a success message
        })
        .catch((err) => {
          toast.error("Unable to copy Room ID:", err);
          // Optionally, handle errors or show a failure message
        });
      // copyRoomId(room);
      // toast.success("Room ID copied to clipboard!");
      setShareId(room);
      // toast w/ copied

      socket?.emit("join", { room, name: "saf" });
      setRoomId(room);
      // alert("Please type a room ID");
      return;
    } else {
      // setRoomId(room);
      // room = uuidv4();
      setShareId(room);
      socket?.emit("join", { room, name: "saf" });

      showVideoConference();
    }
  };
  const joinRoom = (room: string) => {
    // let room = roomInputRef.current?.value;
    if (room) {
      socket?.emit("join", { room, name: "saf" });
      setRoomId(room);
    }
    // if (!room) {
    //   room = uuidv4();
    //   setRoomId(room);
    //   socket?.emit("join", { room, name: "saf" });

    //   navigator.clipboard
    //     .writeText(roomId)
    //     .then(() => {
    //       toast.success("Room ID copied to clipboard!");
    //       // Optionally, set a state or trigger a success message
    //     })
    //     .catch((err) => {
    //       toast.error("Unable to copy Room ID:", err);
    //       // Optionally, handle errors or show a failure message
    //     });
    //   // copyRoomId(room);
    //   // toast.success("Room ID copied to clipboard!");
    //   setShareId(room);
    //   // toast w/ copied

    //   // alert("Please type a room ID");
    //   return;
    // } else {
    //   setRoomId(room);
    //   // room = uuidv4();
    //   setShareId(room);
    //   socket?.emit("join", { room, name: "saf" });

    //   showVideoConference();
    // }
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

    socket?.emit("leaveRoom", roomId);

    const remoteVideo = remoteVideoRef.current;
    if (remoteVideo) {
      remoteVideo.srcObject = null;
    }
    const localVideo = localVideoRef.current;
    if (localVideo) {
      localVideo.srcObject = null;
    }

    socket?.disconnect();
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
      socket?.emit("webrtc_offer", {
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
      socket?.emit("webrtc_answer", {
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

      socket?.emit("webrtc_ice_candidate", {
        roomId,
        label: event.candidate.sdpMLineIndex,
        candidate: event.candidate.candidate,
      });
      if (callerId) console.log(callerId);
      console.log(callerId);
    }
  };

  useEffect(() => {
    const borderThreshold = 37;
    let borderThickness = 0;

    const setupAudioContext = (
      stream: MediaStream | undefined,
      setAudioContext: React.Dispatch<
        React.SetStateAction<AudioContext | null>
      >,
      videoRef: React.RefObject<HTMLVideoElement>
    ) => {
      if (!stream || !videoRef.current) return;

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      setAudioContext(audioContext);

      const updateAudioBorder = () => {
        requestAnimationFrame(updateAudioBorder);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);

        const avg =
          dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;

        if (avg > borderThreshold) {
          borderThickness = Math.min(avg * 0.5, 2); // Adjust the maximum border thickness
        } else {
          // Apply decay or gradual decrease when below threshold
          borderThickness = Math.max(0, borderThickness - 1); // Adjust the decay rate
        }

        const borderSize = `${borderThickness}px`;

        if (videoRef.current) {
          videoRef.current.style.border = `solid secondary ${borderSize}`;
        }
      };

      updateAudioBorder();
    };

    setupAudioContext(localStream, setLocalAudioContext, localVideoRef);
    setupAudioContext(remoteStream, setRemoteAudioContext, remoteVideoRef);
  }, [localStream, remoteStream]);

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

  const navigate = useNavigate();

  function handleSignOutClickEvent() {
    navigate("/sign-out/");
  }

  const [clickedIcon, setClickedIcon] = useState<string>("Video");
  const [movedRight, setMovedRight] = useState(false);
  const handleToggle = () => {
    if (clickedIcon === "Draw") {
      return;
    }
    setMovedRight(!movedRight);
  };

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);

  const handleToggleMute = async () => {
    const audioTracks = localStream?.getAudioTracks();

    audioTracks?.forEach((track) => {
      if (track.enabled) {
        track.enabled = false; // Mute the track
        console.log("muted");
        setIsMuted(true);
      } else {
        track.enabled = true; // Unmute the track
        setIsMuted(false);
        console.log("unmuted");
      }
    });
  };
  const handleToggleVideo = async () => {
    const videoTracks = localStream?.getVideoTracks();

    videoTracks?.forEach((track) => {
      if (track.enabled) {
        track.enabled = false; // turn off the video
        console.log("turned off");
        setIsVideoOn(false);
      } else {
        track.enabled = true; // turn on the video
        setIsVideoOn(true);
        console.log("unmuted");
      }
    });
  };

  // const audioBars = Array.from({ length: 100 }, (_, index) => (
  //   <div
  //     key={index}
  //     ref={(el) => (audioBarsRef.current[index] = el as HTMLDivElement)}
  //     className="bg-blue-500 w-2 h-1 m-1 rounded"
  //   ></div>
  // ));

  return (
    // <TextEditor clickedIcon={clickedIcon} />

    <div>
      <div>
        <Toaster />
      </div>
      <UserButton />
      <button onClick={handleSignOutClickEvent}>Sign out</button>
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

      {/* </div> */}
      <div>
        <div className={`flex flex-col items-center`}>
          {/* <div className="flex flex-col justify-evenly"> */}

          {/* <div className="flex space-x-10"> */}
          {/* <div className="mx-auto"> */}
          <div
            className={`${
              clickedIcon !== "Video" && !movedRight
                ? "fixed flex flex-col items-center justify-center z-10 left-20 top-10 space-y-0"
                : clickedIcon !== "Video" && movedRight
                ? "fixed flex flex-col items-center justify-center z-10 right-7 top-10 space-y-0"
                : ""
            }`}
          >
            {/* <button
              className={`${
                clickedIcon !== "Video" && roomId !== ""
                  ? "text-secondary bg-gray-900 hover:text-gray-900 hover:bg-secondary hover:font-bold font-semibold rounded-lg w-min py-2 px-20 grow-0 opacity-75"
                  : ""
              }`}
              disabled={clickedIcon === "Video" || roomId === ""}
              onClick={handleClick}
            >
              {clickedIcon === "Video" || roomId === "" ? "" : "Toggle"}
            </button> */}
            <div
              className={`${
                clickedIcon === "Video" ? "flex justify-center" : ""
              }`}
            >
              <div onClick={handleToggle}>
                <Video
                  className={`${
                    clickedIcon !== "Video" && !movedRight
                      ? "m-28 rounded-full cursor-pointer"
                      : clickedIcon !== "Video" && movedRight
                      ? "m-10 rounded-full cursor-pointer"
                      : ""
                  }`}
                  reff={localVideoRef}
                  muted={true}
                  style={{
                    height: clickedIcon !== "Video" ? "30vh" : "60vh",
                    width: clickedIcon !== "Video" ? "30vh" : "80vh",
                    // border: "solid orange px", // Initialize with no border
                  }}
                />
              </div>
              {/* {audioBars} */}
              <div onClick={handleToggle}>
                <Video
                  className={`${
                    clickedIcon !== "Video" && !movedRight
                      ? "m-28 rounded-full cursor-pointer"
                      : clickedIcon !== "Video" && movedRight
                      ? "m-10 rounded-full cursor-pointer"
                      : ""
                  }`}
                  reff={remoteVideoRef}
                  muted={false}
                  style={{
                    height: clickedIcon !== "Video" ? "30vh" : "60vh",
                    width: clickedIcon !== "Video" ? "30vh" : "80vh",
                    border: "solid orange 0px", // Initialize with no border
                  }}
                />
              </div>
            </div>
          </div>

          {/* {clickedIcon !== "Video" ? (
            <div
              id="overlap"
              className="flex flex-col justify-center absolute z-10"
            >
              <div>
                <Video
                  reff={localVideoRef}
                  muted={true}
                  clickedIcon={clickedIcon}
                  style={{ height: "10vh" }}
                />
              </div>
              <div>
                <Video
                  reff={remoteVideoRef}
                  muted={false}
                  clickedIcon={clickedIcon}
                />
              </div>
            </div>
          ) : null} */}

          {/* <div className="flex"> */}
          {/* <Video
              name={"smthng"}
              reff={localVideoRef}
              muted={true}
              clickedIcon={clickedIcon}
            />
            <Video
              name={"smthng"}
              reff={remoteVideoRef}
              muted={false}
              clickedIcon={clickedIcon}
            /> */}
          {/* <video
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
            ></video> */}
          {/* </div> */}
          {/* </div> */}
          {/* <button
            className="text-secondary bg-gray-900 hover:text-gray-900 hover:bg-secondary hover:font-bold font-semibold tracking-wider rounded-lg w-min py-2 px-6 grow-0 mb-10"
            style={{
              display: clickedIcon === "Video" ? "block" : "none",
            }}
            onClick={handleToggleVideo}
          >
            Leave
          </button> */}

          {/* </div> */}

          {/* <div className="flex space-x-10 mt-10"> */}
          {/* <div className=""> */}
          {/* <label>Room ID: </label> */}
          {/* <input
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
            </button> */}
          {/* </div> */}

          <HomePage
            clickedIcon={clickedIcon}
            roomInputRef={roomInputRef}
            createRoom={createRoom}
            joinRoom={joinRoom}
          />

          <TextEditor clickedIcon={clickedIcon} />
          <Draw clickedIcon={clickedIcon} movedRight={true} roomId={roomId} />

          <BottomBar
            handleToggleMute={handleToggleMute}
            disconnectRoom={disconnectRoom}
            handleToggleVideo={handleToggleVideo}
            clickedIcon={clickedIcon}
          />
        </div>
        {/* {clickedIcon === "Video" ? (
          // <div className="flex flex-col items-center justify-center h-screen space-x-20">

        ) : null} */}

        {/* <TextEditor clickedIcon={clickedIcon} /> */}

        {/* {clickedIcon === "Draw" ? <Draw /> : null} */}
      </div>
    </div>
  );
};

export default VideoCall;