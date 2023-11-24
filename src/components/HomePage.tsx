import React, { useEffect } from "react";

const HomePage = ({
  clickedIcon,
  roomInputRef,
  joinRoom,
}: {
  clickedIcon: string;
  roomInputRef: React.MutableRefObject<HTMLInputElement | null>;
  joinRoom: () => void;
}) => {
  useEffect(() => {
    const body = document.querySelector("body");

    if (body) {
      if (clickedIcon === "GoHome") {
        body.style.overflow = "hidden";
      } else {
        body.style.overflow = "auto"; // Reset to allow scrolling
      }
    }

    return () => {
      if (body) body.style.overflow = "auto"; // Reset on component unmount
    };
  }, [clickedIcon]);

  return (
    <>
      <div
        className={`flex flex-col h-screen w-10/12 ${
          clickedIcon === "GoHome" ? "block" : "hidden"
        }
        `}
      >
        <div className="flex space-x-10 h-24 items-center justify-center">
          {/* <div className=""> */}
          {/* <label>Room ID: </label> */}
          <input
            className="placeholder:italic placeholder:text-secondary block bg-gray-900  rounded-md py-2 px-5 pl-9 pr-4 shadow-sm  focus:outline-none focus:ring-gray-700 focus:ring-1 sm:text-sm"
            type="text"
            ref={roomInputRef}
            placeholder="Type the damn Room Id..."
          />
          <button
            className="text-secondary bg-gray-900 hover:text-gray-900 hover:bg-secondary hover:font-bold font-semibold tracking-wider py-2 px-6 rounded-lg w-min grow-0 transition-all duration-300 transform hover:translate-y-1 hover:shadow-lg"
            onClick={joinRoom}
          >
            Connect
          </button>
        </div>
        <div className={"flex flex-wrap h-full items-center"}>
          <div className="w-full md:w-2/3 h-1/4 p-4">
            {" "}
            {/* Adjusted width */}
            <div className="bg-gray-700 p-6 rounded-md">Card 1</div>
          </div>
          <div className="w-full md:w-1/3 h-1/4 p-4">
            {" "}
            {/* Adjusted width */}
            <div className="bg-gray-700 p-6 rounded-md">Card 2</div>
          </div>
          <div className="w-full p-4 h-1/4 ">
            <div className="bg-gray-700 p-6 rounded-md">Card 3</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
