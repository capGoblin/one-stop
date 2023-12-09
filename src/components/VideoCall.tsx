import React, { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

import { UserButton, useUser } from "@clerk/clerk-react";
import useMeetStore from "../store";
import BottomBar from "./BottomBar";
import Draw from "./Draw";
import HomePage from "./HomePage";
import SideBar from "./SideBar";
import TextEditor from "./TextEditor";
import Video from "./Video";
import Code from "./Code";

const socket = io("http://localhost:3000");

const VideoCall: React.FC = () => {
  const { rtcPeerConnection, setRtcPeerConnection } = useMeetStore();
  const roomInputRef = useRef<HTMLInputElement | null>(null);
  const joinRoomInputRef = useRef<HTMLInputElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const { user } = useUser();
  const callerIdRef = useRef<string>("");
  let callerId: string;

  const [localStream, setLocalStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [inHome, setInHome] = useState<boolean>(true);

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
  // const [socketId, setSocketId] = useState<string>("");
  const [toastOnce, setToastOnce] = useState<boolean>(true);

  const createPeerConnection = async () => {
    const peerConnection = new RTCPeerConnection(iceServers);

    const remoteStream = new MediaStream();

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
    setInHome(false);
    setClickedIcon("Video");

    if (!room) {
      room = uuidv4();

      navigator.clipboard
        .writeText(room)
        .then(() => {
          toast.success("Room ID copied to clipboard!");
        })
        .catch((err) => {
          toast.error("Unable to copy Room ID:", err);
        });

      socket?.emit("join", { room, name: user?.fullName });
      setRoomId(room);
      return;
    } else {
      socket?.emit("join", { room, name: user?.fullName });

      showVideoConference();
    }
  };
  const joinRoom = (id: string) => {
    // const room = joinRoomInputRef.current?.value;
    const room = id;
    console.log(room);
    if (room) {
      console.log(room);
      socket?.emit("join", { room, name: user?.fullName });
      setRoomId(room);
    }

    setInHome(false);
    setClickedIcon("Video");
  };

  const disconnectRoom = async () => {
    if (rtcPeerConnection) {
      // Stop tracks in the streams
      rtcPeerConnection.getSenders().forEach((sender) => {
        if (sender.track) {
          sender.track.stop();
        }
      });
      rtcPeerConnection.close();
    }

    const remoteVideo = remoteVideoRef.current;
    if (remoteVideo) {
      const stream = remoteVideo.srcObject;
      if (stream instanceof MediaStream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      remoteVideo.srcObject = null;
    }

    const localVideo = localVideoRef.current;
    if (localVideo) {
      const stream = localVideo.srcObject;
      if (stream instanceof MediaStream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      localVideo.srcObject = null;
    }

    // console.log(rtcPeerConnection);
    // // console.log(localStream);
    // if (rtcPeerConnection) {
    //   rtcPeerConnection.close();
    // }

    socket?.emit("leaveRoom", roomId);

    // const remoteVideo = remoteVideoRef.current;
    // if (remoteVideo) {
    //   remoteVideo.srcObject = null;
    // }
    // const localVideo = localVideoRef.current;
    // if (localVideo) {
    //   localVideo.srcObject = null;
    // }

    socket?.disconnect();

    setClickedIcon("GoHome");
    setInHome(true);
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
    if (user?.fullName && roomId) {
      const fetchDocument = async () => {
        // console.log(user);
        const name = user?.fullName;
        try {
          const response = await fetch(
            `http://localhost:3000/create_doc/${roomId}/${name}`
          );
          if (response.ok) {
            console.log("doc created successfully");
          } else {
            console.error("Failed to fetch document");
          }
        } catch (error) {
          console.error("Error fetching document:", error);
        }
      };

      fetchDocument();
    }
  });

  useEffect(() => {
    const borderThreshold = 37;
    let borderThickness = 0; // Adjust this threshold value

    const setupAudioContext = () => {
      if (!localStream) return;

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(localStream);
      source.connect(analyser);
      // setLocalAudioContext(audioContext);

      // Visualize audio using border color for the video element
      const updateAudioBorder = () => {
        requestAnimationFrame(updateAudioBorder);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);

        const avg =
          dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
        // let borderThickness = 0;

        if (avg > borderThreshold) {
          borderThickness = Math.min(avg * 0.5, 2); // Adjust the maximum border thickness
        } else {
          // Apply decay or gradual decrease when below threshold
          borderThickness = Math.max(0, borderThickness - 1); // Adjust the decay rate
        }

        const borderSize = `${borderThickness}px`;

        if (localVideoRef.current) {
          localVideoRef.current.style.border = `solid orange ${borderSize}`;
        }
        if (inHome && localVideoRef.current) {
          localVideoRef.current.style.border = "";
        }
      };

      updateAudioBorder();
    };

    setupAudioContext();
  }, [inHome, localStream]);
  useEffect(() => {
    const borderThreshold = 37;
    let borderThickness = 0; // Adjust this threshold value

    const setupAudioContext = () => {
      if (!remoteStream) return;

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(remoteStream);
      source.connect(analyser);

      // Visualize audio using border color for the video element
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

        if (remoteVideoRef.current) {
          remoteVideoRef.current.style.border = `solid orange ${borderSize}`;
        }
      };

      updateAudioBorder();
    };

    setupAudioContext();
  }, [remoteStream]);

  useEffect(() => {
    socket.on("name_joined", (name: string) => {
      if (toastOnce) {
        // toast.success(`${name} has joined the Stop!`);
        toast(`${name} has joined the Stop!`, {
          // icon: "👏",
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        });
      }
      setToastOnce(false);
    });
  }, []);

  useEffect(() => {
    const body = document.querySelector("body");
    if (body) {
      body.style.overflow = "hidden";
    }

    return () => {
      if (body) body.style.overflow = "auto"; // Reset on component unmount
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("room_created", async () => {
        console.log("Socket event callback: room_created");
        console.log(callerId);

        callerIdRef.current = socket.id;
        console.log(callerIdRef.current);
        callerId = callerIdRef.current;
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

  const [clickedIcon, setClickedIcon] = useState<string>("GoHome");
  const [movedRight, setMovedRight] = useState(true);
  const handleToggle = () => {
    if (clickedIcon === "Draw") {
      return;
    }
    setMovedRight(!movedRight);
  };

  const handleToggleMute = async () => {
    const audioTracks = localStream?.getAudioTracks();

    audioTracks?.forEach((track) => {
      if (track.enabled) {
        track.enabled = false; // Mute the track
        console.log("muted");
      } else {
        track.enabled = true; // Unmute the track
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
      } else {
        track.enabled = true; // turn on the video
        console.log("unmuted");
      }
    });
  };

  return (
    <div className="h-screen">
      <div>
        <Toaster />
      </div>
      <div className="flex absolute w-auto h-12 m-6 items-center justify-end rounded-full">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-12 w-12 ",
            },
          }}
        />
      </div>

      {!inHome ? (
        <SideBar
          clickedIcon={(arg0) => {
            setClickedIcon(arg0);
          }}
        />
      ) : null}

      <div>
        <div className={`flex flex-col items-center`}>
          <div
            className={`${
              clickedIcon !== "Video" && !movedRight
                ? "fixed flex flex-col items-center justify-center z-10 left-20 top-10 space-y-0"
                : clickedIcon !== "Video" && movedRight
                ? "fixed flex flex-col items-center justify-center z-10 right-7 top-10 space-y-0"
                : ""
            }`}
          >
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
                  clickedIcon={clickedIcon}
                />
              </div>
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
                  clickedIcon={clickedIcon}
                />
              </div>
            </div>
          </div>
          {inHome && (
            <HomePage
              clickedIcon={clickedIcon}
              roomInputRef={roomInputRef}
              joinRoomInputRef={joinRoomInputRef}
              createRoom={createRoom}
              joinRoom={joinRoom}
              user={user?.fullName}
            />
          )}

          <TextEditor clickedIcon={clickedIcon} user={user?.fullName} />
          <Draw
            clickedIcon={clickedIcon}
            movedRight={true}
            roomId={roomId}
            user={user?.fullName}
          />

          <BottomBar
            handleToggleMute={handleToggleMute}
            disconnectRoom={disconnectRoom}
            handleToggleVideo={handleToggleVideo}
            clickedIcon={clickedIcon}
          />

          <Code clickedIcon={clickedIcon} user={user?.fullName} />
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
