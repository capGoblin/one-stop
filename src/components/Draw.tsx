import { useCallback, useEffect, useState } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
// import "./App.css";
import { Excalidraw } from "@excalidraw/excalidraw";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import debounce from "lodash.debounce";
import { io } from "socket.io-client";
import useMeetStore from "../store";
// import { SocketContext } from "../Contexts/SocketContext";

const socket = io("http://localhost:3000");
// const SAVE_INTERVAL_MS = 2000;

function Draw({
  clickedIcon,
  // movedRight,
  roomId,
}: {
  clickedIcon: string;
  movedRight: boolean;
  roomId: string;
}) {
  // const { socket } = useContext(SocketContext);

  // const [socket, setSocket] = useState<Socket | null>(null);
  // const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI>();
  const { excalidrawAPI, setExcalidrawAPI } = useMeetStore();

  const [fetchOnce, setFetchOnce] = useState<boolean>(false);

  // const [pendingUpdates, setPendingUpdates] = useState([]);
  // const update = () => {
  //   setPendingUpdates((prev) => [...prev, data]);
  // };

  const debouncedUpdateScene = debounce((scene) => {
    if (excalidrawAPI) {
      excalidrawAPI.updateScene(scene);
      console.log(scene);
    } else console.log("excalidrawAPI is not defined.");
  }, 500);

  socket?.on("receive-data", (scene: readonly ExcalidrawElement[] | null) => {
    // console.log(scene, "received");
    debouncedUpdateScene(scene);
  });

  useEffect(() => {
    if (clickedIcon !== "Draw" || roomId === "") return;
    const fetchDocument = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/find_draw/${roomId}`
        );
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          if (fetchOnce) return;

          // not to fetch and update empty data(which will be saved else)
          // if (
          //   JSON.stringify(data.data) ===
          //   JSON.stringify({ ops: [{ insert: "\n" }] })
          // ) {
          //   return;
          // }

          // not to fetch and update, if data already exists
          // const del = quillRef.current?.getEditor().getContents();
          // if (JSON.stringify(data.data) === JSON.stringify(del)) {
          //   return;
          // }
          if (
            excalidrawAPI &&
            Array.isArray(data.elements) &&
            data.elements.length !== 0
          ) {
            excalidrawAPI.updateScene(data);
            console.log("updated? ");
          } else console.log("excalidrawAPI is not updated.");

          // if (quillRef.current) {
          //   console.log(quillRef.current.getEditor());

          //   // quillRef.current.getEditor().insertText(0, data.data);
          //   quillRef.current.getEditor().updateContents(data.data);
          //   console.log(quillRef.current.getEditor().getContents());
          // }

          // setDocumentData(data.data);
        } else {
          console.error("Failed to fetch document");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };
    if (clickedIcon === "Draw") {
      // console.log(quillRef.current?.getEditor().getContents());
      // if (
      //   JSON.stringify(quillRef.current?.getEditor().getContents()) ===
      //   JSON.stringify({ ops: [{ insert: "\n" }] })
      // ) {
      // socket.emit("save-doc", data);
      fetchDocument();
      // }

      // fetchDocument();
      setFetchOnce(true);
    }
  }, [clickedIcon, excalidrawAPI, fetchOnce, roomId]);

  // useEffect(() => {
  //   if (socket == null) return;

  //   const interval = setInterval(() => {
  //     // const delta = quillRef.current?.getEditor().getContents();
  //     // console.log(delta);
  //     if (scene !== []) {
  //       // const firstInsert = delta.ops[0].insert;
  //       // if (typeof firstInsert === "string") {
  //       // console.log(delta);
  //       const data = {
  //         scene,
  //         roomId,
  //       };
  //       // socket.emit("save-doc", { roomId, saveDoc: firstInsert });

  //       if (
  //         // JSON.stringify(data.delta) !==
  //         // JSON.stringify({ ops: [{ insert: "\n" }] })
  //       ) {
  //         socket.emit("save-draw", data);
  //       }
  //       // }
  //     }
  //   }, SAVE_INTERVAL_MS);

  //   console.log("saved? ");

  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, [socket, quillRef, roomId]);
  // socket.on("receive-data", (data) => {
  //   console.log(data, "received");

  //   update();
  //   // setPendingUpdates((prev) => [...prev, data]);
  // });

  // useEffect(() => {
  //   if (pendingUpdates.length) {
  //     // batch-update scene
  //     excalidrawAPI?.updateScene(pendingUpdates);

  //     setPendingUpdates([]);
  //   }
  // }, [pendingUpdates]);

  // useEffect(() => {

  // socket.on("receive-data", (data) => {
  //   console.log(data, "received");

  // const updateScene = () => {
  //   const sceneData = {
  //     elements: data.elements,
  //     // appState: data.appState,
  //   };
  //   if (excalidrawAPI) {
  //     excalidrawAPI.updateScene(data);
  //   } else console.log("excalidrawAPI is not defined.");
  // };
  // updateScene();

  // });

  // }, [excalidrawAPI]);
  // socket.on("receive-data", (data) => {
  //   console.log(data, "received");
  //   const updateScene = () => {
  //     const sceneData = {
  //       elements: data.elements,
  //       // appState: data.appState,
  //     };
  //     excalidrawAPI.updateScene(data);
  //   };
  //   updateScene();
  // });
  // const socket = io("http://localhost:3000");

  // useEffect(() => {
  //   const socket = io("http://localhost:3000");
  //   setSocket(socket);
  //   socket.on("receive-data", (data) => {
  //     if (excalidrawAPI) {
  //       console.log(data, "received");
  //       const updateScene = () => {
  //         const sceneData = {
  //           elements: data.elements,
  //           // appState: data.appState,
  //         };
  //         excalidrawAPI.updateScene(data);
  //       };
  //       updateScene();
  //     } else {
  //       console.log("excalidrawAPI is falsy", excalidrawAPI);
  //     }
  //   });

  //   return () => {
  //     socket.disconnect();
  //     console.log(`${socket.id} disconnected`);
  //   };
  // }, [excalidrawAPI]);

  // useEffect(() => {
  //   // if (socket) {
  //     // }
  //   }, []);

  const handleDataChange = useCallback(
    (elements: readonly ExcalidrawElement[] | null) => {
      const d = elements;
      // const handleDataChange = (
      // elements: readonly ExcalidrawElement[] | null
      // state: AppState,
      // ): void => {
      console.log("hmmm");
      if (excalidrawAPI) {
        // Check if the length of elements is larger than the previousElements
        // if (elements.length > previousElements.current.length) {
        const sceneData = {
          elements: elements,
          // appState: excalidrawData.appState,
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

        // }

        // Update previousElements with the current elements
        // previousElements.current = elements;
      } else {
        console.log(
          "excalidrawAPI or excalidrawData is falsy when sending data"
        );
      }
      // };

      // handleDataChange()
      //...
    },
    [excalidrawAPI, roomId, clickedIcon]
  );

  return (
    // full mr-32
    // full ml-72
    <>
      <div className="flex flex-col justify-center items-center relative z-0">
        {/* <h1 style={{ textAlign: "center" }}>Excalidraw Example</h1> */}
        <div
          className={`${
            // clickedIcon !== "Video" && roomId === ""
            //   ? "flex items-center justify-center h-screen w-screen transition-all duration-200 ease-out"
            // clickedIcon !== "Video" && !movedRight
            //   ? "flex justify-end items-start h-screen w-screen mt-10 mr-28 transition-all duration-200 ease-out"
            // clickedIcon !== "Video" && movedRight
            //   ? "flex items-center justify-start h-screen w-screen ml-64 transition-all duration-200 ease-out"
            clickedIcon === "Draw"
              ? "flex items-center justify-center h-screen w-screen ml-9 transition-all duration-200 ease-out"
              : "none"
          }`}
        >
          <div
            // className={`${clickedIcon === "Draw" ? "block" : "hidden"}`}
            style={{
              height: "88%",
              width: "85%",
              marginLeft: "40px",
              // display: clickedIcon === "Draw" ? "block" : "hidden",
            }}
          >
            {/* <input type="textbox" onChange={(e) => setName(e.target.value)} /> */}
            {/* <label style={{ fontSize: "16px", fontWeight: "bold" }}> */}
            {/* <input
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
            </label>{" "} */}

            <Excalidraw
              // excalidrawRef="excalidrawRef"
              // style
              // className={"flex"}
              ref={(api) => {
                if (!excalidrawAPI) {
                  setExcalidrawAPI(api as ExcalidrawImperativeAPI | undefined);
                }
              }}
              // onChange={throttle(savaChanges, 3000)}
              onChange={handleDataChange}
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

            {/* {clickedIcon === "Draw" ? (
              <Excalidraw
                // excalidrawRef="excalidrawRef"
                // style
                ref={(api) => {
                  if (!excalidrawAPI) {
                    setExcalidrawAPI(
                      api as ExcalidrawImperativeAPI | undefined
                    );
                  }
                }}
                // onChange={throttle(savaChanges, 3000)}
                onChange={handleDataChange}
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
            ) : (
              <Excalidraw
                // excalidrawRef="excalidrawRef"
                // style
                ref={(api) => {
                  if (!excalidrawAPI) {
                    setExcalidrawAPI(
                      api as ExcalidrawImperativeAPI | undefined
                    );
                  }
                }}
                // onChange={handleDataChange}
              />
            )} */}
          </div>
        </div>
      </div>
    </>
  );
}

export default Draw;

//       <h1 style={{ textAlign: "center" }}>Excalidraw Example</h1>
//       <div
//         style={{ height: "500px", width: "700px" }}
//         className="custom-styles"
//       >
//         <input type="textbox" onChange={(e) => setName(e.target.value)} />
//         <label style={{ fontSize: "16px", fontWeight: "bold" }}>
//           <input
//             type="checkbox"
//             checked={isCollaborating}
//             onChange={() => {
//               if (!isCollaborating) {
//                 const collaborators = new Map();
//                 collaborators.set("id1", {
//                   username: "Doremon",
//                   avatarUrl: "../../../../img/doremon.png",
//                 });
//                 collaborators.set("id3", {
//                   username: "Pika",
//                   avatarUrl: "../../../../img/pika.jpeg",
//                 });
//                 excalidrawAPI?.updateScene({ collaborators });
//               } else {
//                 excalidrawAPI?.updateScene({
//                   collaborators: new Map(),
//                 });
//               }
//               setIsCollaborating(!isCollaborating);
//             }}
//           />
//           Show Collaborators
//         </label>{" "}
//         <Excalidraw
//           // excalidrawRef="excalidrawRef"
//           // style
//           ref={(api) => {
//             if (!excalidrawAPI) {
//               setExcalidrawAPI(api as ExcalidrawImperativeAPI | undefined);
//             }
//           }}
//           // onChange={throttle(savaChanges, 3000)}
//           onChange={throttledHandleDataChange}
//           // renderTopRightUI={() => (
//           // <LiveCollaborationTrigger
//           //   isCollaborating={isCollaborating}
//           //   onSelect={() => {
//           //     window.alert("You clicked on collab button");
//           //     setIsCollaborating(true);
//           //   }}
//           // />
//           // <LiveCollaborationTrigger
//           //   isCollaborating={isCollaborating}
//           //   onSelect={() => {
//           //     console.log(name);
//           //     if (!isCollaborating) {
//           //       const collaborators = new Map();
//           //       collaborators.set("SAF", {
//           //         username: name,
//           //         avatarUrl: "../../../../img/doremon.png",
//           //       });
//           //       collaborators.set("asfsafas", {
//           //         username: "some name",
//           //         avatarUrl: "../../../../img/doremon.png",
//           //       });
//           //
//           //       excalidrawAPI?.updateScene({
//           //         collaborators: collaborators,
//           //       });
//           //       console.log(collaborators);
//           //     } else {
//           //       excalidrawAPI?.updateScene({
//           //         collaborators: new Map(),
//           //       });
//           //     }
//           //     setIsCollaborating(true);
//           //   }}
//           // />
//           // )}
//         />
//       </div>
//     </>
//   );
// }

// export default Draw;
