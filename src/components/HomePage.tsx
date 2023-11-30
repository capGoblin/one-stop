import React, { useEffect, useState } from "react";

const HomePage = ({
  clickedIcon,
  roomInputRef,
  createRoom,
  joinRoom,
}: {
  clickedIcon: string;
  roomInputRef: React.MutableRefObject<HTMLInputElement | null>;
  createRoom: () => void;
  joinRoom: (room: string) => void;
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

  const [roomId, setRoomId] = useState("");

  // const join = (roomId) => {
  //   // Logic to join the room with the provided roomId
  //   console.log('Joining room:', roomId);
  // };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoomId(event.target.value);
  };

  return (
    <>
      <div
        className={`flex flex-col h-screen w-10/12 ${
          clickedIcon === "GoHome" ? "block" : "hidden"
        }
        `}
      >
        {/* <div className="flex space-x-10 h-24 items-center justify-center"> */}
        {/* <div className=""> */}
        {/* <label>Room ID: </label>
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
        </button> */}
        {/* </div> */}
        <div className={"flex flex-wrap h-full items-center justify-between"}>
          {/* <div className="justify-evenly"> */}
          <div className="flex flex-col justify-around space-y-4 bg-gray-700 w-full sm:w-5/12 h-2/5 p-8 rounded-2xl">
            <div className="">Create a Stop</div>
            <input
              className="placeholder:italic placeholder:text-secondary block bg-gray-900  rounded-md py-2 px-5 pl-9 pr-4 shadow-sm  focus:outline-none focus:ring-gray-700 focus:ring-1 sm:text-sm"
              type="text"
              ref={roomInputRef}
              placeholder="Type the damn Room Id..."
            />
            <button
              className="text-secondary bg-gray-900 hover:text-gray-900 hover:bg-secondary hover:font-bold font-semibold tracking-wider py-2 px-6 rounded-lg w-min grow-0 transition-all duration-300 transform hover:translate-y-1 hover:shadow-lg"
              onClick={createRoom}
            >
              Create
            </button>
          </div>
          <div className="flex flex-col  justify-around space-y-4 bg-gray-700 w-full sm:w-5/12 h-2/5 p-8 rounded-2xl">
            <div className="">Join a Stop</div>
            <input
              className="placeholder:italic placeholder:text-secondary block bg-gray-900  rounded-md py-2 px-5 pl-9 pr-4 shadow-sm  focus:outline-none focus:ring-gray-700 focus:ring-1 sm:text-sm"
              type="text"
              // ref={roomInputRef}
              placeholder="Type the damn Room Id..."
              onChange={handleInputChange}
            />
            <button
              className="text-secondary bg-gray-900 hover:text-gray-900 hover:bg-secondary hover:font-bold font-semibold tracking-wider py-2 px-6 rounded-lg w-min grow-0 transition-all duration-300 transform hover:translate-y-1 hover:shadow-lg"
              onClick={() => joinRoom(roomId)}
            >
              Join
            </button>
          </div>
          {/* </div> */}
          <div className="bg-gray-700 w-full p-8 h-2/5  rounded-2xl">
            <div className="">Recent Stops</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
