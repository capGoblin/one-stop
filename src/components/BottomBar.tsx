import { useState } from "react";
import { IconType } from "react-icons";
import { AiFillAudio, AiOutlineAudioMuted } from "react-icons/ai";
import { FaVideo, FaVideoSlash } from "react-icons/fa6";
import { MdCallEnd } from "react-icons/md";

interface Props {
  handleToggleMute: () => void;
  disconnectRoom: () => void;
  handleToggleVideo: () => void;
  clickedIcon: string;
}
// // TODO: touchup bottombar
// // handle routes and auth
// // TODO: add HomePage (mimic easyCall), remove CONNECT input
// // add nice mode switch (remove hide n seek)
// // add join n create functions and add recent stops
// // add cool audio border
// fix clerk sign up dialog
// draw lag
// write duplicate
// /// redirect to video
// and hide home
// add langs to db
// and recent stops functionality by the username from clerk and roomID matches then load recent stops and all stops
// // default to home
// // add codeEditor
// add Postgres, add Pion
const BottomBar = ({
  handleToggleMute,
  disconnectRoom,
  handleToggleVideo,
  clickedIcon,
}: Props) => {
  const [muteIcon, setMuteIcon] = useState<IconType>(AiOutlineAudioMuted);

  const [videoIcon, setVideoIcon] = useState<IconType>(FaVideoSlash);
  const toggleMuteIcon = () => {
    console.log(muteIcon);
    setMuteIcon((prevIcon: IconType) =>
      prevIcon === AiFillAudio ? AiOutlineAudioMuted : AiFillAudio
    );
  };

  const toggleVideoIcon = () => {
    console.log(videoIcon);
    setVideoIcon((prevIcon: IconType) =>
      prevIcon === FaVideo ? FaVideoSlash : FaVideo
    );
  };
  return (
    <>
      <div
        className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 z-60 flex justify-center space-x-20 ${
          clickedIcon !== "Video"
            ? "transition-all duration-300 transform translate-y-3 opacity-0 hover:opacity-100 hover:translate-y-0"
            : "transition-all duration-300 transform translate-y-6 opacity-100 hover:translate-y-0"
        }`}
      >
        <button
          className="text-secondary  bg-gray-900 hover:text-gray-900 hover:bg-secondary hover:font-bold font-semibold rounded-full w-min py-4 px-10 grow-0 mb-10 "
          onClick={() => {
            handleToggleMute();
            toggleMuteIcon();
          }}
        >
          {muteIcon === AiFillAudio ? (
            <AiOutlineAudioMuted className={"h-6 w-6"} />
          ) : (
            <AiFillAudio className={"h-6 w-6"} />
          )}
        </button>
        <button
          className="bg-red-600 hover:bg-red-600 hover:font-bold font-semibold rounded-full w-min py-3 px-36 grow-0 mb-10"
          onClick={disconnectRoom}
        >
          {<MdCallEnd />}
        </button>
        <button
          className="text-secondary bg-gray-900 hover:text-gray-900 hover:bg-secondary hover:font-bold font-semibold rounded-full w-min py-3 px-10 grow-0 mb-10"
          onClick={() => {
            handleToggleVideo();
            toggleVideoIcon();
          }}
        >
          {videoIcon === FaVideo ? (
            <FaVideoSlash className={"h-6 w-6"} />
          ) : (
            <FaVideo className={"h-6 w-6"} />
          )}
        </button>
      </div>
    </>
  );
};

export default BottomBar;
