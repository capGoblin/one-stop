import { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import io, { Socket } from "socket.io-client";

import useMeetStore from "../store";
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

const SAVE_INTERVAL_MS = 2000;

const server_URL = process.env.SERVER_URL;

function TextEditor({
  clickedIcon,
  user,
}: {
  clickedIcon: string;
  user: string | null | undefined;
}) {
  const [socket, setSocket] = useState<Socket | null>();
  const { editorValue, setEditorValue } = useMeetStore();

  useEffect(() => {
    if (!server_URL) {
      throw new Error(
        "SERVER_URL is not defined in the environment variables."
      );
    }
    const socket = io(server_URL);

    setSocket(socket);
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const body = document.querySelector("body");
    if (body) {
      if (clickedIcon === "FileText") {
        // className={"h-14"}
        // body.style.overflow = "hidden";
      } else {
        body.style.overflow = "auto"; // Reset to allow scrolling
      }
    }

    return () => {
      if (body) body.style.overflow = "auto"; // Reset on component unmount
    };
  }, [clickedIcon]);

  const quillRef = useRef<ReactQuill>(null); // Create a ref for the ReactQuill component

  const [roomId, setRoomId] = useState<string>("");
  // @ts-ignore
  const [documentData, setDocumentData] = useState<DeltaStatic>();

  const [fetchOnce, setFetchOnce] = useState<boolean>(false);

  useEffect(() => {
    socket?.on("roomId", (roomIdFromServer: string) => {
      setRoomId(roomIdFromServer);
      console.log(roomIdFromServer);
    });
  }, [roomId, socket]);

  useEffect(() => {
    if (clickedIcon !== "FileText" || roomId === "") return;
    const fetchDocument = async () => {
      try {
        const response = await fetch(`${server_URL}/find/${roomId}/${user}`);
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          // if (fetchOnce) return;

          // not to fetch and update empty data(which will be saved else)
          if (
            JSON.stringify(data.doc) ===
            JSON.stringify({ ops: [{ insert: "\n" }] })
          ) {
            return;
          }

          // not to fetch and update, if data already exists
          const del = quillRef.current?.getEditor().getContents();
          if (JSON.stringify(data.doc) === JSON.stringify(del)) {
            return;
          }

          if (quillRef.current) {
            console.log(quillRef.current.getEditor());

            quillRef.current.getEditor().updateContents(data.doc);
            console.log(quillRef.current.getEditor().getContents());
          }

          setDocumentData(data.doc);
        } else {
          console.error("Failed to fetch document");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };
    if (clickedIcon === "FileText") {
      console.log(quillRef.current?.getEditor().getContents());
      fetchDocument();
      setFetchOnce(true);
    }
  }, [clickedIcon, fetchOnce, roomId, user]);

  useEffect(() => {
    if (socket == null) return;

    const interval = setInterval(() => {
      const delta = quillRef.current?.getEditor().getContents();
      console.log(delta);
      if (delta && delta.ops && delta.ops.length >= 1) {
        console.log(delta);
        const data = {
          roomId,
          delta,
        };

        if (
          JSON.stringify(data.delta) !==
          JSON.stringify({ ops: [{ insert: "\n" }] })
        ) {
          socket.emit("save-doc", data);
        }
      }
    }, SAVE_INTERVAL_MS);

    console.log("saved? ");

    return () => {
      clearInterval(interval);
    };
  }, [socket, quillRef, roomId]);

  useEffect(() => {
    if (quillRef.current) {
      console.log(quillRef.current.getEditor());

      quillRef.current.getEditor().updateContents(documentData);

      console.log(quillRef.current.getEditor().getContents());
    }
  }, [documentData]);
  useEffect(() => {
    // @ts-ignore
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

  function handleTextChange(
    value: string, // @ts-ignore
    delta: DeltaStatic, // @ts-ignore
    source: Sources
  ): void {
    if (source == "user") {
      setEditorValue(value);
      socket?.emit("send-changes", delta);
    }
  }

  return (
    <ReactQuill
      ref={quillRef}
      theme="snow"
      className={`${clickedIcon !== "FileText" ? "hidden" : "block"}`}
      value={editorValue}
      modules={{
        syntax: true,
        toolbar: TOOLBAR_OPTIONS,
      }}
      onChange={handleTextChange}
    />
  );
}
export default TextEditor;
