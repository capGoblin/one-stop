import React, { useEffect, useRef, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types/types";
import io, { Socket } from "socket.io-client";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";

interface ExData {
  elements: readonly ExcalidrawElement[] | null;
  appState?: AppState;
  files?: BinaryFiles;
}

function Draw() {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI>();

  const [socket, setSocket] = useState<Socket | null>(null);

  const [isCollaborating, setIsCollaborating] = useState<boolean>(false);
  const [string, setString] = useState<string>("");
  const [excalidrawData, setExcalidrawData] = useState<ExData | null>(null);
  const [name, setName] = useState<string>("");

  const previousElements = useRef<readonly ExcalidrawElement[]>([]);

  useEffect(() => {
    const socket = io("http://localhost:3000");
    setSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!excalidrawAPI) {
      return;
    }
    // to open the library sidebar
    excalidrawAPI.updateScene({ appState: { openSidebar: "library" } });
  }, [excalidrawAPI]);
  useEffect(() => {
    if (socket) {
      socket.on("receive-data", (data) => {
        if (excalidrawAPI) {
          console.log(data, "received");
          const updateScene = () => {
            const sceneData = {
              elements: data.elements,
              // appState: data.appState,
            };
            excalidrawAPI.updateScene(data);
          };
          updateScene();
        } else {
          console.log("excalidrawAPI is falsy", excalidrawAPI);
        }
      });
    }
  }, [excalidrawAPI, socket]);
  useEffect(() => {
    const handleDataChange = (
      excalidrawData: ExData | null,
      // elements: readonly ExcalidrawElement[] | null,
      // state: AppState,
    ): void => {
      if (excalidrawAPI && excalidrawData) {
        // Check if the length of elements is larger than the previousElements
        // if (elements.length > previousElements.current.length) {
        const sceneData = {
          elements: excalidrawData.elements,
          // appState: excalidrawData.appState,
        };
        console.log(sceneData);
        socket?.emit("send-data", sceneData);
        // }

        // Update previousElements with the current elements
        // previousElements.current = elements;
      } else {
        console.log(
          "excalidrawAPI or excalidrawData is falsy when sending data",
        );
      }
    };

    // const drawingBuffer = [];
    //
    // function addToDrawingBuffer(data) {
    //   drawingBuffer.push(data);
    // }
    //

    // setInterval(() => {
    //   if (excalidrawData) {
    handleDataChange(excalidrawData);
    // drawingBuffer.length = 0; // Clear the buffer
    //   }
    // }, 1000);
  }, [excalidrawData]);

  function throttle(callback: (...args: never[]) => void, delay: number) {
    let previousCall = new Date().getTime();

    return function (...args: never[]) {
      const time = new Date().getTime();

      if (time - previousCall >= delay) {
        previousCall = time;
        callback(...args);
      }
    };
  }

  function rateLimit(fn, limit, interval) {
    let count = 0;
    let lastReset = new Date().getTime();
    return function (...args) {
      const now = new Date().getTime();
      if (now - lastReset >= interval) {
        count = 0;
        lastReset = now;
      }

      if (count < limit) {
        fn(...args);
        count++;
      }
    };
  }

  function savaChanges(
    elements: readonly ExcalidrawElement[] | null,
    state: AppState,
    // state: Readonly<
    //   Partial<
    //     AppState & {
    //       [T in keyof LegacyAppState]: LegacyAppState[T][0];
    //     }
    //   >
    // > | null
  ) {
    console.log("inside saveChanges");
    setExcalidrawData({ elements, appState: state });

    console.log(excalidrawData);
  }

  return (
    <>
      <h1 style={{ textAlign: "center" }}>Excalidraw Example</h1>
      <div
        style={{ height: "500px", width: "700px" }}
        className="custom-styles"
      >
        <input type="textbox" onChange={(e) => setName(e.target.value)} />
        <label style={{ fontSize: "16px", fontWeight: "bold" }}>
          <input
            type="checkbox"
            checked={isCollaborating}
            onChange={() => {
              if (!isCollaborating) {
                const collaborators = new Map();
                collaborators.set("id1", {
                  username: "Doremon",
                  avatarUrl: "../../../../img/doremon.png",
                });
                collaborators.set("id3", {
                  username: "Pika",
                  avatarUrl: "../../../../img/pika.jpeg",
                });
                excalidrawAPI?.updateScene({ collaborators });
              } else {
                excalidrawAPI?.updateScene({
                  collaborators: new Map(),
                });
              }
              setIsCollaborating(!isCollaborating);
            }}
          />
          Show Collaborators
        </label>{" "}
        <Excalidraw
          // excalidrawRef="excalidrawRef"
          // style
          ref={(api) => {
            if (!excalidrawAPI) {
              setExcalidrawAPI(api as ExcalidrawImperativeAPI | undefined);
            }
          }}
          onChange={throttle(savaChanges, 3000)}
          // renderTopRightUI={() => (
          // <LiveCollaborationTrigger
          //   isCollaborating={isCollaborating}
          //   onSelect={() => {
          //     window.alert("You clicked on collab button");
          //     setIsCollaborating(true);
          //   }}
          // />
          // <LiveCollaborationTrigger
          //   isCollaborating={isCollaborating}
          //   onSelect={() => {
          //     console.log(name);
          //     if (!isCollaborating) {
          //       const collaborators = new Map();
          //       collaborators.set("SAF", {
          //         username: name,
          //         avatarUrl: "../../../../img/doremon.png",
          //       });
          //       collaborators.set("asfsafas", {
          //         username: "some name",
          //         avatarUrl: "../../../../img/doremon.png",
          //       });
          //
          //       excalidrawAPI?.updateScene({
          //         collaborators: collaborators,
          //       });
          //       console.log(collaborators);
          //     } else {
          //       excalidrawAPI?.updateScene({
          //         collaborators: new Map(),
          //       });
          //     }
          //     setIsCollaborating(true);
          //   }}
          // />
          // )}
        />
      </div>
    </>
  );
}

export default Draw;
