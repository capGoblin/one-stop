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
