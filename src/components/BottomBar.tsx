import React, { useEffect, useState } from "react";

interface Props {
  handleToggleMute: () => void;
  disconnectRoom: () => void;
  handleToggleVideo: () => void;
  clickedIcon: string;
}

const BottomBar = ({
  handleToggleMute,
  disconnectRoom,
  handleToggleVideo,
  clickedIcon,
}: Props) => {
  return (
    // transition-all duration-300 transform translate-y-3 opacity-0 hover:opacity-100 hover:translate-y-0
    // transition-all duration-300 transform translate-y-6 opacity-100 hover:translate-y-0

    <>
      <div
        className={`flex w-screen justify-center space-x-20 ${
          clickedIcon !== "Video"
            ? "transition-all duration-300 transform translate-y-10 opacity-100 hover:opacity-100 hover:translate-y-0"
            : "transition-all duration-300 transform translate-y-6 opacity-100 hover:translate-y-0"
        }`}
      >
        <button
          className="text-secondary bg-gray-900 hover:text-gray-900 hover:bg-secondary hover:font-bold font-semibold rounded-full w-min py-4 px-10 grow-0 mb-10 "
          onClick={handleToggleMute}
        >
          Mute
        </button>
        <button
          className="text-secondary bg-gray-900 hover:text-gray-900 hover:bg-secondary hover:font-bold font-semibold rounded-full w-min py-3 px-36 grow-0 mb-10"
          onClick={disconnectRoom}
        >
          End
        </button>
        <button
          className="text-secondary bg-gray-900 hover:text-gray-900 hover:bg-secondary hover:font-bold font-semibold rounded-full w-min py-3 px-10 grow-0 mb-10"
          onClick={handleToggleVideo}
        >
          Camera
        </button>
      </div>
    </>
  );
};

export default BottomBar;
