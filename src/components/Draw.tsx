import { useCallback, useEffect, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import debounce from "lodash.debounce";
import { io } from "socket.io-client";
import useMeetStore from "../store";

const server_URL = process.env.SERVER_URL;

if (!server_URL) {
  throw new Error("SERVER_URL is not defined in the environment variables.");
}

const socket = io(server_URL);

function Draw({
  clickedIcon,
  roomId,
  user,
}: {
  clickedIcon: string;
  movedRight: boolean;
  roomId: string;
  user: string | null | undefined;
}) {
  const { excalidrawAPI, setExcalidrawAPI } = useMeetStore();

  const [fetchOnce, setFetchOnce] = useState<boolean>(false);

  const debouncedUpdateScene = debounce((scene) => {
    if (excalidrawAPI) {
      excalidrawAPI.updateScene(scene);
      console.log(scene);
    } else console.log("excalidrawAPI is not defined.");
  }, 500);

  socket?.on("receive-data", (scene: readonly ExcalidrawElement[] | null) => {
    debouncedUpdateScene(scene);
  });

  useEffect(() => {
    if (clickedIcon !== "Draw" || roomId === "") return;
    const fetchDocument = async () => {
      try {
        const response = await fetch(
          `${server_URL}/find_draw/${roomId}/${user}`
        );
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          if (fetchOnce) return;
          if (
            excalidrawAPI &&
            Array.isArray(data.elements) &&
            data.elements.length !== 0
          ) {
            excalidrawAPI.updateScene(data);
            console.log("updated? ");
          } else console.log("excalidrawAPI is not updated.");
        } else {
          console.error("Failed to fetch document");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };
    if (clickedIcon === "Draw") {
      fetchDocument();

      setFetchOnce(true);
    }
  }, [clickedIcon, excalidrawAPI, fetchOnce, roomId, user]);

  const handleDataChange = useCallback(
    (elements: readonly ExcalidrawElement[] | null) => {
      const d = elements;
      console.log("hmmm");
      if (excalidrawAPI) {
        const sceneData = {
          elements: elements,
        };
        console.log(sceneData);
        socket?.emit("send-data", sceneData);

        const data = {
          elements,
          roomId,
        };

        if (clickedIcon === "Draw" && Array.isArray(d) && d.length !== 0) {
          socket.emit("save-draw", data);
          console.log(data);
        }
      } else {
        console.log(
          "excalidrawAPI or excalidrawData is falsy when sending data"
        );
      }
    },
    [excalidrawAPI, roomId, clickedIcon]
  );

  return (
    <>
      <div className="flex flex-col justify-center items-center relative z-0">
        <div
          className={`${
            clickedIcon === "Draw"
              ? "flex items-center justify-center h-screen w-screen ml-9 transition-all duration-200 ease-out"
              : "none"
          }`}
        >
          <div
            style={{
              height: "88%",
              width: "85%",
              marginLeft: "40px",
              // display: clickedIcon === "Draw" ? "block" : "hidden",
            }}
          >
            <Excalidraw
              ref={(api) => {
                if (!excalidrawAPI) {
                  setExcalidrawAPI(api as ExcalidrawImperativeAPI | undefined);
                }
              }}
              onChange={handleDataChange}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Draw;
