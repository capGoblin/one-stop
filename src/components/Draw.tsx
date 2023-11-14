import { useCallback, useState } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
// import "./App.css";
import { io } from "socket.io-client";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { Excalidraw } from "@excalidraw/excalidraw";
import debounce from "lodash.debounce";

const socket = io("http://localhost:8080");

function Draw() {
  // const [socket, setSocket] = useState<Socket | null>(null);
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI>();

  // const [pendingUpdates, setPendingUpdates] = useState([]);
  // const update = () => {
  //   setPendingUpdates((prev) => [...prev, data]);
  // };

  const debouncedUpdateScene = debounce((scene) => {
    if (excalidrawAPI) {
      excalidrawAPI.updateScene(scene);
    } else console.log("excalidrawAPI is not defined.");
  }, 500);

  socket.on("receive-data", (scene: readonly ExcalidrawElement[] | null) => {
    console.log(scene, "received");
    debouncedUpdateScene(scene);
  });

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
        socket.emit("send-data", sceneData);
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
    [excalidrawAPI]
  );

  return (
    <>
      <div className="flex flex-col justify-center items-center">
        {/* <h1 style={{ textAlign: "center" }}>Excalidraw Example</h1> */}
        <div className="flex items-center justify-center h-screen w-screen">
          <div style={{ height: "90%", width: "80%" }}>
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
          </div>
        </div>
      </div>
    </>
  );
}

export default Draw;

// import React, { useEffect, useRef, useState } from "react";
// import { Excalidraw } from "@excalidraw/excalidraw";
// import {
//   AppState,
//   BinaryFiles,
//   ExcalidrawAPIRefValue,
//   ExcalidrawImperativeAPI,
// } from "@excalidraw/excalidraw/types/types";
// import io, { Socket } from "socket.io-client";
// import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";

// interface ExData {
//   elements: readonly ExcalidrawElement[] | null;
//   appState?: AppState;
//   files?: BinaryFiles;
// }

// function Draw() {
//   const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawAPIRefValue>();

//   const [socket, setSocket] = useState<Socket | null>(null);

//   const [isCollaborating, setIsCollaborating] = useState<boolean>(false);
//   const [string, setString] = useState<string>("");
//   const [excalidrawData, setExcalidrawData] = useState<ExData | null>(null);
//   const [name, setName] = useState<string>("");

//   const previousElements = useRef<readonly ExcalidrawElement[]>([]);

//   useEffect(() => {
//     const socket = io("http://localhost:3000");
//     setSocket(socket);

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   useEffect(() => {
//     if (!excalidrawAPI) {
//       return;
//     }
//     // to open the library sidebar
//     excalidrawAPI.updateScene({ appState: { openSidebar: "library" } });
//   }, [excalidrawAPI]);
//   useEffect(() => {
//     if (socket) {
//       socket.on("receive-data", (data) => {
//         if (excalidrawAPI) {
//           console.log(data, "received");
//           const updateScene = () => {
//             const sceneData = {
//               elements: data.elements,
//               // appState: data.appState,
//             };
//             excalidrawAPI.updateScene(data);
//           };
//           updateScene();
//         } else {
//           console.log("excalidrawAPI is falsy", excalidrawAPI);
//         }
//       });
//     }
//   }, [excalidrawAPI, socket]);
//   useEffect(() => {
//     const handleDataChange = (
//       excalidrawData: ExData | null,
//       // elements: readonly ExcalidrawElement[] | null,
//       // state: AppState,
//     ): void => {
//       if (excalidrawAPI && excalidrawData) {
//         // Check if the length of elements is larger than the previousElements
//         // if (elements.length > previousElements.current.length) {
//         const sceneData = {
//           elements: excalidrawData.elements,
//           // appState: excalidrawData.appState,
//         };
//         console.log(sceneData);
//         socket?.emit("send-data", sceneData);
//         // }

//         // Update previousElements with the current elements
//         // previousElements.current = elements;
//       } else {
//         console.log(
//           "excalidrawAPI or excalidrawData is falsy when sending data",
//         );
//       }
//     };

//     // const drawingBuffer = [];
//     //
//     // function addToDrawingBuffer(data) {
//     //   drawingBuffer.push(data);
//     // }
//     //

//     // setInterval(() => {
//     //   if (excalidrawData) {
//     handleDataChange(excalidrawData);
//     // drawingBuffer.length = 0; // Clear the buffer
//     //   }
//     // }, 1000);
//   }, [excalidrawData]);

//   function throttle(callback: (...args: never[]) => void, delay: number) {
//     let previousCall = new Date().getTime();

//     return function (...args: never[]) {
//       const time = new Date().getTime();

//       if (time - previousCall >= delay) {
//         previousCall = time;
//         callback(...args);
//       }
//     };
//   }

//   function rateLimit(fn, limit, interval) {
//     let count = 0;
//     let lastReset = new Date().getTime();
//     return function (...args) {
//       const now = new Date().getTime();
//       if (now - lastReset >= interval) {
//         count = 0;
//         lastReset = now;
//       }

//       if (count < limit) {
//         fn(...args);
//         count++;
//       }
//     };
//   }

//   function throttledHandleDataChange(
//     elements: readonly ExcalidrawElement[] | null,
//   ) {
//     const throttledHandleDataChange = throttle(handleDataChange, 500);
//   }

//   function savaChanges(
//     elements: readonly ExcalidrawElement[] | null,
//     state: AppState,
//     // state: Readonly<
//     //   Partial<
//     //     AppState & {
//     //       [T in keyof LegacyAppState]: LegacyAppState[T][0];
//     //     }
//     //   >
//     // > | null
//   ) {
//     console.log("inside saveChanges");
//     setExcalidrawData({ elements, appState: state });

//     console.log(excalidrawData);
//   }

//   return (
//     <>
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
