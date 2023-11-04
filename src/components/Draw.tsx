// import React, { useEffect, useRef, useState } from "react";
// import { Excalidraw } from "@excalidraw/excalidraw";
// import {
//   AppState,
//   ExcalidrawImperativeAPI,
// } from "@excalidraw/excalidraw/types/types";
// import io, { Socket } from "socket.io-client";
// import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
// import { ImportedDataState } from "@excalidraw/excalidraw/types/data/types";
//
// function Draw(props) {
//   const excalidrawRef = useRef<ExcalidrawImperativeAPI>(null);
//
//   // const [excalidrawAPI, setExcalidrawAPI] =
//   //   useState<ExcalidrawAPIRefValue | null>(null);
//   // useHandleLibrary({ excalidrawAPI });
//   // const [isCollaborating, setIsCollaborating] = useState(false);
//   const [socket, setSocket] = useState<Socket>();
//
//   const [excalidrawData, setExcalidrawData] = useState<ImportedDataState>();
//
//   // useEffect(() => {}, []);
//
//   useEffect(() => {
//     const socket = io("http://localhost:3000");
//     setSocket(socket);
//
//     return () => {
//       socket.disconnect();
//     };
//   }, []);
//
//   // useEffect(() => {
//   //   if (excalidrawData) socket?.emit("send-data", excalidrawData);
//   // }, [excalidrawData, socket]);
//
//   // const handleCollaborationButtonClick = () => {
//   //   // Toggle collaboration status
//   //   setIsCollaborating(!isCollaborating);
//   //
//   //   // Send a message to the server indicating collaboration status
//   //   socket?.emit("collaborationStatus", isCollaborating);
//   // };
//   //
//   // useEffect(() => {
//   //   // Send the excalidraw data to other users when it changes
//   //
//   //   // Listen for changes from other users
//   //   socket?.on("excalidraw-data", (data) => {
//   //     setExcalidrawData(data);
//   //   });
//   //
//   //   const collaboration = LiveCollaborationTrigger({
//   //     isCollaborating,
//   //     onSelect: handleCollaborationButtonClick,
//   //   });
//   //
//   //   // Initialize the Socket.IO client
//   //   collaboration.initializeSocketClient();
//   //
//   //   if (excalidrawData) {
//   //     socket?.emit("excalidraw-data", excalidrawData);
//   //   }
//   // }, [excalidrawData, socket]);
//
//   // const h = () => {
//   //   const k = new LiveCollaboration();
//   //   k.initializeSocketClient();
//   //
//   //   new LiveCollaborationTrigger();
//   // };
//
//   function handleDataChange(
//     elements: readonly ExcalidrawElement[],
//     state: AppState,
//   ): void {
//     const data: ImportedDataState = {
//       elements: [...elements],
//       appState: { ...state },
//     };
//     setExcalidrawData(data);
//     // console.log("Elements :", elements, "State : ", state);
//   }
//
//   return (
//     <>
//       <h1 style={{ textAlign: "center" }}>Excalidraw Example</h1>
//       <div style={{ height: "500px" }} className="custom-styles">
//         <Excalidraw
//           ref={excalidrawRef}
//           // initialData={excalidrawData}
//           onChange={handleDataChange}
//           // onChange={(elements, state) => {
//           //   setExcalidrawData({ elements, appState: state });
//           //   console.info("Elements :", elements, "State : ", state);
//           // }}
//           // renderTopRightUI={() => (
//           //   <LiveCollaborationTrigger
//           //     isCollaborating={isCollaborating}
//           //     onSelect={() => {
//           //       window.alert("You clicked on collab button");
//           //       setIsCollaborating(true);
//           //     }}
//           //   />
//           // )}
//         />
//       </div>
//     </>
//   );
// }
//
// export default Draw;

import React, { useEffect, useRef, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import io, { Socket } from "socket.io-client";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";

function Draw() {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI>();

  const [socket, setSocket] = useState<Socket | null>(null);

  const [isCollaborating, setIsCollaborating] = useState<boolean>(false);
  const [string, setString] = useState<string>("");

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
              appState: data.appState,
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

  const handleDataChange = (
    elements: readonly ExcalidrawElement[] | null,
    // state: Readonly<
    //   Partial<
    //     AppState & {
    //       [T in keyof LegacyAppState]: LegacyAppState[T][0];
    //     }
    //   >
    // > | null,
  ): void => {
    if (excalidrawAPI && elements) {
      // Check if the length of elements is larger than the previousElements
      // if (elements.length > previousElements.current.length) {
      const sceneData = { elements: elements };
      console.log(sceneData);
      socket?.emit("send-data", sceneData);
      // }

      // Update previousElements with the current elements
      // previousElements.current = elements;
    } else {
      console.log("excalidrawAPI is falsy when sending data");
    }
  };

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

  return (
    <>
      <h1 style={{ textAlign: "center" }}>Excalidraw Example</h1>
      <div
        style={{ height: "500px", width: "700px" }}
        className="custom-styles"
      >
        <Excalidraw
          ref={(api) => {
            if (!excalidrawAPI) {
              setExcalidrawAPI(api);
            }
          }}
          onChange={throttle(handleDataChange, 3000)}
          // renderTopRightUI={() => (
          //   <LiveCollaborationTrigger
          //     isCollaborating={false}
          //     onSelect={() => {
          //       if (!isCollaborating) {
          //         const collaborators = new Map();
          //         collaborators.set(string, {
          //           username: "Doremon",
          //           avatarUrl: "../../../../img/doremon.png",
          //         });
          //
          //         excalidrawAPI?.updateScene({
          //           collaborators: collaborators,
          //         });
          //       } else {
          //         excalidrawAPI?.updateScene({
          //           collaborators: new Map(),
          //         });
          //       }
          //       setIsCollaborating(!isCollaborating);
          //     }}
          //   />
          // )}
        />
      </div>
    </>
  );
}

export default Draw;

// function Draw() {
//   // const excalidrawRef = useRef<ExcalidrawImperativeAPI>(null);
//   const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI>();
//   const previousElements = useRef<ExcalidrawElement[] | null>(null);
//
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [excalidrawData, setExcalidrawData] = useState<SceneData | null>(null);
//
//   const [isCollaborating, setIsCollaborating] = useState<boolean>(false);
//   const [string, setString] = useState<string>("");
//
//   useEffect(() => {
//     const socket = io("http://localhost:3000");
//     setSocket(socket);
//
//     return () => {
//       socket.disconnect();
//     };
//   }, []);
//
//   useEffect(() => {
//     if (socket) {
//       socket.on("receive-data", (data) => {
//         // Update the excalidrawData state here
//         // setExcalidrawData(data);
//         // dataGot = data;
//
//         console.log("Received data:", data);
//         console.log("excalidrawAPI:", excalidrawAPI);
//
//         if (excalidrawAPI) {
//           console.log(data, "agsgagfas");
//           const updateScene = () => {
//             const sceneData = {
//               elements: data,
//             };
//             excalidrawAPI.updateScene(sceneData);
//           };
//           updateScene();
//           // excalidrawAPI.updateScene({
//           //   elements: data,
//           // });
//         } else {
//           console.log("excalidrawAPI is falsy", excalidrawAPI);
//         }
//         // } else {
//         //   console.log("excalidrawAPI is falsy", excalidrawAPI);
//         // }
//       });
//     }
//   }, [excalidrawAPI, socket]);
//
//   // useEffect(() => {
//   //   if (excalidrawData) {
//   //     console.log(excalidrawData);
//   //   }
//   //   console.log("excalidrawData not available");
//   // }, [excalidrawData]);
//
//   function areElementsEqual(
//     arr1: readonly ExcalidrawElement[],
//     arr2: readonly ExcalidrawElement[],
//   ) {
//     if (arr1.length !== arr2.length) {
//       return false;
//     }
//
//     for (let i = 0; i < arr1.length; i++) {
//       if (!isElementEqual(arr1[i], arr2[i])) {
//         return false;
//       }
//     }
//
//     return true;
//   }
//
//   function isElementEqual(
//     element1: ExcalidrawElement,
//     element2: ExcalidrawElement,
//   ): boolean {
//     // Check if the element types are equal
//     if (element1.type !== element2.type) {
//       return false;
//     }
//
//     // Check other relevant properties for equality based on the element type
//     // For example, if it's a text element, compare text content, font size, etc.
//
//     // You'll need to implement specific comparisons for each element subtype
//
//     // If all comparisons pass, the elements are considered equal
//     return true;
//   }
//
//   const handleDataChange = (
//     elements: readonly ExcalidrawElement[],
//     // appState: AppState,
//   ): void => {
//     if (excalidrawAPI && elements) {
//       // const data: SceneData = {
//       //   elements: [...elements],
//       //   // appState: { ...appState },
//       // };
//
//       // if (
//       //   !previousElements.current ||
//       //   !areElementsEqual(previousElements.current, elements)
//       // ) {
//       // Elements have changed, update the previousElements reference
//       // previousElements.current = elements.slice();
//       socket?.emit("send-data", elements);
//       // }
//
//       // console.log(elements);
//       //
//       // socket?.emit("send-data", elements);
//       // setExcalidrawData(data);
//
//       // Avoid updating state directly here
//     } else {
//       console.log("excalidrawAPI is falsy when sending data");
//     }
//   };
//
//   return (
//     <>
//       <h1 style={{ textAlign: "center" }}>Excalidraw Example</h1>
//       <div
//         style={{ height: "500px", width: "700px" }}
//         className="custom-styles"
//       >
//         {/*<label style={{ fontSize: "16px", fontWeight: "bold" }}>*/}
//         {/*  <input*/}
//         {/*    type="checkbox"*/}
//         {/*    checked={isCollaborating}*/}
//         {/*    onChange={() => {*/}
//         {/*      if (!isCollaborating) {*/}
//         {/*        const collaborators = new Map();*/}
//         {/*        collaborators.set("id1", {*/}
//         {/*          username: "Doremon",*/}
//         {/*          avatarUrl: "../../../../img/doremon.png",*/}
//         {/*        });*/}
//         {/*        collaborators.set("id3", {*/}
//         {/*          username: "Pika",*/}
//         {/*          avatarUrl: "../../../../img/pika.jpeg",*/}
//         {/*        });*/}
//         {/*        excalidrawRef.current?.updateScene({ collaborators });*/}
//         {/*      } else {*/}
//         {/*        excalidrawRef.current?.updateScene({*/}
//         {/*          collaborators: new Map(),*/}
//         {/*        });*/}
//         {/*      }*/}
//         {/*      setIsCollaborating(!isCollaborating);*/}
//         {/*    }}*/}
//         {/*  />*/}
//         {/*  Show Collaborators*/}
//         {/*</label>*/}
//
//         {/*<input*/}
//         {/*  type="text"*/}
//         {/*  placeholder="yup"*/}
//         {/*  value={string}*/}
//         {/*  onChange={(e) => setString(e.target.value)}*/}
//         {/*></input>*/}
//         {/*{excalidrawAPI && (*/}
//         <Excalidraw
//           ref={(api) => {
//             if (!excalidrawAPI) {
//               setExcalidrawAPI(api as ExcalidrawImperativeAPI | undefined);
//             }
//           }}
//           onChange={handleDataChange}
//           renderTopRightUI={() => (
//             <LiveCollaborationTrigger
//               isCollaborating={false}
//               onSelect={
//                 () => {
//                   if (!isCollaborating) {
//                     const collaborators = new Map();
//                     collaborators.set(string, {
//                       username: "Doremon",
//                       avatarUrl: "../../../../img/doremon.png",
//                     });
//
//                     excalidrawAPI?.updateScene({
//                       collaborators: collaborators,
//                     });
//                   } else {
//                     excalidrawAPI?.updateScene({
//                       collaborators: new Map(),
//                     });
//                   }
//                   setIsCollaborating(!isCollaborating);
//                 }
//
//                 //
//                 // window.alert("You clicked on collab button");
//                 // setIsCollaborating(true);
//               }
//             />
//           )}
//         />
//         {/*)}*/}
//       </div>
//     </>
//   );
// }
