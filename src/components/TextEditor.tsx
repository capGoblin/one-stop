import React, { useContext, useEffect, useRef, useState } from "react";
import ReactQuill, { DeltaStatic, Sources } from "react-quill";
import "react-quill/dist/quill.snow.css";
import io, { Socket } from "socket.io-client";
import useMeetStore from "../store";
import { SocketContext } from "../Contexts/SocketContext";

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

function TextEditor({ clickedIcon }: { clickedIcon: string }) {
  const { socket } = useContext(SocketContext);

  // const [socket, setSocket] = useState<Socket | null>();
  const { editorValue, setEditorValue } = useMeetStore();
  // const [quill, setQuill] = useState<>();
  // const [editorValue, setEditorValue] = useState("");
  const quillRef = useRef<ReactQuill>(); // Create a ref for the ReactQuill component

  // useEffect(() => {
  //   const socket = io("http://localhost:3000");
  //   setSocket(socket);

  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);

  useEffect(() => {
    socket?.on("receive-changes", (delta) => {
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

  return (
    // <div className="flex flex-col justify-center items-center">
    //   {/* <h1 style={{ textAlign: "center" }}>Excalidraw Example</h1> */}
    //   <div className="flex items-center justify-center h-screen w-screen">
    <div
      className={`flex flex-col items-center ${
        clickedIcon === "FileText" ? "block" : "hidden"
      }`}
    >
      {" "}
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={editorValue}
        modules={{
          toolbar: TOOLBAR_OPTIONS,
        }}
        onChange={handleTextChange}
      />
      //{" "}
    </div>
    //   </div>
    // </div>
  );

  // return <ReactQuill  value={value} onChange={setValue} />;
}

export default TextEditor;
