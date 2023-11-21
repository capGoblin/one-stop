// import React, { useContext, useEffect, useRef, useState } from "react";
// import ReactQuill, { DeltaStatic, Sources } from "react-quill";
// import "react-quill/dist/quill.snow.css";
// import io, { Socket } from "socket.io-client";
// import useMeetStore from "../store";
// import { SocketContext } from "../Contexts/SocketContext";

// const TOOLBAR_OPTIONS = [
//   [{ header: [1, 2, 3, 4, 5, 6, false] }],
//   [{ font: [] }],
//   [{ list: "ordered" }, { list: "bullet" }],
//   ["bold", "italic", "underline"],
//   [{ color: [] }, { background: [] }],
//   [{ script: "sub" }, { script: "super" }],
//   [{ align: [] }],
//   ["image", "blockquote", "code-block"],
//   ["clean"],
// ];

// function TextEditor({ clickedIcon }: { clickedIcon: string }) {
//   const { socket } = useContext(SocketContext);

//   // const [socket, setSocket] = useState<Socket | null>();
//   const { editorValue, setEditorValue } = useMeetStore();
//   // const [quill, setQuill] = useState<>();
//   // const [editorValue, setEditorValue] = useState("");
//   const quillRef = useRef<ReactQuill>(); // Create a ref for the ReactQuill component

//   // useEffect(() => {
//   //   const socket = io("http://localhost:3000");
//   //   setSocket(socket);

//   //   return () => {
//   //     socket.disconnect();
//   //   };
//   // }, []);

//   useEffect(() => {
//     // if (clickedIcon !== "FileText") {
//     //   socket?.on("receive-contents", (contents) => {
//     //     console.log(contents);

//     //     quillRef.current?.getEditor().updateContents(contents);
//     //     console.log(quillRef.current?.getEditor());
//     //   });
//     // }
//     socket?.on("receive-changes", (delta) => {
//       console.log(delta);

//       console.log("delta got in client");

//       if (quillRef.current) {
//         console.log(quillRef.current.getEditor());
//         console.log("safas");
//         quillRef.current.getEditor().updateContents(delta);
//       }

//       console.log(quillRef.current!.getEditor());
//     });
//   }, [clickedIcon, quillRef, socket]);

//   // useEffect(() => {
//   //   console.log("quillRef:", quillRef.current);
//   //   console.log("quillRef:", quillRef.current?.getEditor());
//   //   console.log("quillRefsa:", quillRef.current?.getEditor());
//   // }, [quillRef]);

//   // useEffect(() => {
//   //   Quill.on("text-change", function (delta, oldDelta, source) {
//   //     if (source == "user") {
//   //       console.log("A user action triggered this change.");
//   //       socket?.emit("send-changes", delta);
//   //     }
//   //   });
//   // }, []);

//   function handleTextChange(
//     value: string,
//     delta: DeltaStatic,
//     source: Sources
//   ): void {
//     if (source == "user") {
//       setEditorValue(value);
//       socket?.emit("send-changes", delta);
//       // socket?.emit("send-contents", quillRef.current?.getEditorContents());
//       // console.log(quillRef.current?.getEditorContents());
//       console.log(delta);
//     }
//   }

//   return (
//     // <div className="flex flex-col justify-center items-center">
//     //   {/* <h1 style={{ textAlign: "center" }}>Excalidraw Example</h1> */}
//     //   <div className="flex items-center justify-center h-screen w-screen">
//     <div
//       className={`flex flex-col items-center ${
//         clickedIcon === "FileText" ? "block" : "hidden"
//       }`}
//     >
//       {" "}
//       <ReactQuill
//         ref={quillRef}
//         theme="snow"
//         value={editorValue}
//         modules={{
//           toolbar: TOOLBAR_OPTIONS,
//         }}
//         onChange={handleTextChange}
//       />
//       //{" "}
//     </div>
//     //   </div>
//     // </div>
//   );

//   // return <ReactQuill  value={value} onChange={setValue} />;
// }

// export default TextEditor;
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import ReactQuill, { DeltaStatic, Sources } from "react-quill";
import "react-quill/dist/quill.snow.css";
import io, { Socket } from "socket.io-client";
import useMeetStore from "../store";
import { SocketContext } from "../Contexts/SocketContext";
import Document from "../../server/Document";
import { useParams } from "react-router-dom";
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
];

//  TODO: works when it is live!
// when one types, save every 2 sec
// when other user clicks clickedIcon, fetch updated new one
// const socket = io("http://localhost:3000");
const SAVE_INTERVAL_MS = 2000;
function TextEditor({ clickedIcon }: { clickedIcon: string }) {
  const [socket, setSocket] = useState<Socket | null>();

  // const { socket } = useContext(SocketContext);

  const { id: documentId } = useParams();

  // const [socket, setSocket] = useState<Socket | null>();
  const { editorValue, setEditorValue } = useMeetStore();

  useEffect(() => {
    const socket = io("http://localhost:3000");
    setSocket(socket);
    return () => {
      socket.disconnect();
    };
  }, []);

  // const [quill, setQuill] = useState<>();
  // const [editorValue, setEditorValue] = useState("");
  const quillRef = useRef<ReactQuill>(null); // Create a ref for the ReactQuill component

  const [roomId, setRoomId] = useState<string>("");
  // useEffect(() => {
  //   const socket = io("http://localhost:3000");
  //   setSocket(socket);
  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);

  const [documentData, setDocumentData] = useState<string>("");

  const getLatestDoc = async (roomId: string) => {
    const d = await Document.findById(roomId);
    if (d) return d;
  };

  useEffect(() => {
    socket?.on("roomId", (roomIdFromServer: string) => {
      setRoomId(roomIdFromServer);
      console.log(roomIdFromServer);
      socket?.emit("getem", roomId);
    });
  }, [roomId, socket]);

  // useEffect(() => {
  //   const fetchDocument = async (roomID: string) => {
  //     try {
  //       const response = await fetch(`http://localhost:3000/find/${roomID}`);
  //       if (response.ok) {
  //         const data = await response.json();
  //         console.log(data.data);

  //         if (quillRef.current) {
  //           console.log(quillRef.current.getEditor());
  //           quillRef.current.getEditor().insertText(0, "data.data");
  //         }
  //         setDocumentData(data);
  //       } else {
  //         console.error("Failed to fetch document");
  //       }
  //     } catch (error) {
  //       console.error("Error fetching document:", error);
  //     }
  //   };
  //   // socket?.on("room_joined", (roomIdFromServer: string) => {
  //   //   setRoomId(roomIdFromServer);
  //   //   console.log(roomIdFromServer);
  //   //   fetchDocument(roomIdFromServer);
  //   // });

  //   // Fetch only if roomId is not an empty string
  // }, [roomId, quillRef]);
  /////////////////////////////////////
  // useEffect(() => {
  //   const fetchDocument = async () => {
  //     try {
  //       const response = await fetch(`http://localhost:3000/find/${roomId}`);
  //       if (response.ok) {
  //         const data = await response.json();
  //         console.log(data);

  //         setDocumentData(data.data);
  //       } else {
  //         console.error("Failed to fetch document");
  //       }
  //     } catch (error) {
  //       console.error("Error fetching document:", error);
  //     }
  //   };
  //   if (roomId !== "") {
  //     fetchDocument();
  //   }
  // }, [roomId, clickedIcon]);
  useEffect(() => {
    if (clickedIcon !== "FileText" || roomId === "") return;
    const fetchDocument = async () => {
      try {
        const response = await fetch(`http://localhost:3000/find/${roomId}`);
        if (response.ok) {
          const data = await response.json();
          console.log(data);

          if (quillRef.current) {
            console.log(quillRef.current.getEditor());
            quillRef.current.getEditor().insertText(0, data.data);
            console.log(quillRef.current.getEditor().getContents());
          }

          setDocumentData(data.data);
        } else {
          console.error("Failed to fetch document");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };
    if (clickedIcon === "FileText") {
      fetchDocument();
    }
  }, [clickedIcon, roomId]);
  /////////////////////
  // useEffect(() => {
  //   const fetchDocument = async () => {
  //     try {
  //       const response = await fetch(`http://localhost:3000/find/${roomId}`);
  //       if (response.ok) {
  //         const data = await response.json();
  //         console.log(data);

  //         setDocumentData(data.data);
  //       } else {
  //         console.error("Failed to fetch document");
  //       }
  //     } catch (error) {
  //       console.error("Error fetching document:", error);
  //     }
  //   };
  //   fetchDocument();
  // }, []);

  // useEffect(() => {
  //   if (roomId === undefined) return;
  //   const doc = getLatestDoc(roomId);

  //   if (quillRef.current) {
  //     console.log(quillRef.current.getEditor());
  //     quillRef.current.getEditor().insertText(0, doc);
  //   }
  // }, [clickedIcon, roomId]);
  useEffect(() => {
    if (socket == null) return;

    const interval = setInterval(() => {
      const delta = quillRef.current?.getEditor().getContents();
      if (delta && delta.ops && delta.ops.length > 0) {
        const firstInsert = delta.ops[0].insert;
        if (typeof firstInsert === "string" && firstInsert.trim().length > 0) {
          console.log(firstInsert);
          const data = {
            roomId,
            string: firstInsert,
          };
          // socket.emit("save-doc", { roomId, saveDoc: firstInsert });
          socket.emit("save-doc", data);
        }
      }
    }, SAVE_INTERVAL_MS);

    console.log("saved? ");

    return () => {
      clearInterval(interval);
    };
  }, [socket, quillRef, roomId]);
  // useEffect(() => {
  //   socket?.on("load-doc", (data: string) => {
  //     if (data === null) return;
  //     console.log(data);
  //     const init: string = `${data}`;
  //     if (quillRef.current) {
  //       console.log(quillRef.current.getEditor());
  //       quillRef.current.getEditor().insertText(0, init);
  //       console.log(quillRef.current.getEditor());
  //     } else {
  //       console.log("realyy? ");
  //     }
  //   });

  //   socket?.emit("get-doc", roomId);

  //   console.log("doc", roomId);
  // }, [roomId, socket, quillRef]);

  useEffect(() => {
    if (quillRef.current) {
      console.log(quillRef.current.getEditor());
      quillRef.current.getEditor().insertText(0, documentData);
      console.log(quillRef.current.getEditor().getContents());
    }
  }, [documentData]);
  useEffect(() => {
    socket?.on("receive-changes", (delta: DeltaStatic) => {
      console.log(delta);
      console.log("delta got in client");
      if (quillRef.current) {
        console.log(quillRef.current.getEditor());
        quillRef.current.getEditor().updateContents(delta);
      }
      console.log(quillRef.current!.getEditor());
    });
  }, [quillRef, socket]);
  // useEffect(() => {
  //   console.log("quillRef:", quillRef.current);
  //   console.log("quillRef:", quillRef.current?.getEditor());
  //   console.log("quillRefsa:", quillRef.current?.getEditor());
  // }, [quillRef]);
  // useEffect(() => {
  //   Quill.on("text-change", function (delta, oldDelta, source) {
  //     if (source == "user") {
  //       console.log("A user action triggered this change.");
  //       socket?.emit("send-changes", delta);
  //     }
  //   });
  // }, []);
  function handleTextChange(
    value: string,
    delta: DeltaStatic,
    source: Sources
  ): void {
    if (source == "user") {
      setEditorValue(value);
      socket?.emit("send-changes", delta);
    }
  }

  // const editorStyles = {
  //   opacity: clickedIcon !== "FileText" ? 0 : 1,
  //   // transition: "opacity 0.3s ease-in-out", // Add a transition for a smooth opacity change
  //   display: "block",
  // };

  return (
    // <div className="flex flex-col justify-center items-center">
    //   {/* <h1 style={{ textAlign: "center" }}>Excalidraw Example</h1> */}
    //   <div className="flex items-center justify-center h-screen w-screen">

    <ReactQuill
      ref={quillRef}
      theme="snow"
      className={`flex flex-col ${
        clickedIcon !== "FileText" ? "hidden" : "block"
      }  `}
      value={editorValue}
      modules={{
        syntax: true,
        toolbar: TOOLBAR_OPTIONS,
      }}
      onChange={handleTextChange}
      // style={editorStyles}
    />
    //{" "}
    //   </div>
    // </div>
  );
}
export default TextEditor;
