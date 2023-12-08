import React, { useEffect, useState } from "react";

const HomePage = ({
  clickedIcon,
  roomInputRef,
  joinRoomInputRef,
  createRoom,
  joinRoom,
  user,
}: {
  clickedIcon: string;
  roomInputRef: React.MutableRefObject<HTMLInputElement | null>;
  joinRoomInputRef: React.MutableRefObject<HTMLInputElement | null>;
  createRoom: () => void;
  joinRoom: (id: string) => void;
  user: string | null | undefined;
}) => {
  const [roomId, setRoomId] = useState("");
  const [docIds, setDocIds] = useState<string[]>([]);

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
  useEffect(() => {
    if (clickedIcon !== "GoHome" || roomId !== "") return;
    const fetchDocument = async () => {
      console.log(user);
      try {
        const response = await fetch(
          `http://localhost:3000/find_recent_stops/${user}`
        );
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          // setDocIds(data.docIds);

          setDocIds((prevDocIds) => {
            const uniqueIds = new Set([...prevDocIds, ...data.docIds]);
            return [...uniqueIds];
          });
          console.log(docIds);
          // if (fetchOnce) return;

          // not to fetch and update empty data(which will be saved else)
          // if (
          //   JSON.stringify(data.doc) ===
          //   JSON.stringify({ ops: [{ insert: "\n" }] })
          // ) {
          //   return;
          // }

          // not to fetch and update, if data already exists
          // const del = quillRef.current?.getEditor().getContents();
          // if (JSON.stringify(data.doc) === JSON.stringify(del)) {
          //   return;
          // }

          // if (quillRef.current) {
          //   console.log(quillRef.current.getEditor());

          //   quillRef.current.getEditor().updateContents(data.doc);
          //   console.log(quillRef.current.getEditor().getContents());
          // }

          // setDocumentData(data.doc);
        } else {
          console.error("Failed to fetch document");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };
    // if (clickedIcon === "FileText") {
    // console.log(quillRef.current?.getEditor().getContents());
    fetchDocument();
    // setFetchOnce(true);
    // }
  }, [clickedIcon, roomId, user]);

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
        <div className={"flex flex-wrap h-full items-center justify-between"}>
          <div className="flex flex-col justify-around space-y-4 bg-gray-700 w-full sm:w-5/12 h-2/5 p-6 rounded-2xl">
            <div className="pl-3 font-semibold">Create a Stop</div>
            <input
              className="ml-3 placeholder:italic placeholder:text-secondary block bg-gray-900  rounded-md py-2 px-5 pl-9 pr-4 shadow-sm  focus:outline-none focus:ring-gray-700 focus:ring-1 sm:text-sm"
              type="text"
              ref={roomInputRef}
              placeholder="Type the damn Room Id..."
            />
            <button
              className="ml-3 text-secondary bg-gray-900 hover:text-gray-900 hover:bg-secondary hover:font-bold font-semibold tracking-wider py-2 px-6 rounded-lg w-min grow-0 transition-all duration-300 transform hover:translate-y-1 hover:shadow-lg"
              onClick={createRoom}
            >
              Create
            </button>
          </div>
          <div className="flex flex-col justify-around space-y-4 bg-gray-700 w-full sm:w-5/12 h-2/5 p-6 rounded-2xl">
            <div className="pl-3 font-semibold">Join a Stop</div>
            <input
              className="ml-3 placeholder:italic placeholder:text-secondary block bg-gray-900  rounded-md py-2 px-5 pl-9 pr-4 shadow-sm  focus:outline-none focus:ring-gray-700 focus:ring-1 sm:text-sm"
              type="text"
              ref={joinRoomInputRef}
              placeholder="Type the damn Room Id..."
              onChange={handleInputChange}
            />
            <button
              className="ml-3 text-secondary bg-gray-900 hover:text-gray-900 hover:bg-secondary hover:font-bold font-semibold tracking-wider py-2 px-6 rounded-lg w-min grow-0 transition-all duration-300 transform hover:translate-y-1 hover:shadow-lg"
              onClick={() => joinRoom(roomId)}
            >
              Join
            </button>
          </div>
          <div className="bg-gray-700 w-full p-4 h-2/5  rounded-2xl">
            <div className="pl-3 font-semibold">Recent Stops</div>

            {docIds.map((docId, index) => (
              <div
                className="bg-slate-800 rounded-2xl p-2 m-4 pl-8 cursor-pointer"
                key={index}
                onClick={() => joinRoom(docId)}
              >
                {docId}
              </div>
            ))}
            {/* <div className="">{docId}</div> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
