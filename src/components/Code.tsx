import { useState, useRef, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import Editor, { EditorDidMount, Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { MonacoBinding } from "y-monaco";
import { Socket, io } from "socket.io-client";

const ydocument = new Y.Doc();
const provider = new WebrtcProvider("monaco", ydocument);
const type = ydocument.getText("monaco");

function Code({ clickedIcon }: { clickedIcon: string }) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const [socket, setSocket] = useState<Socket>();
  const [editorContent, setEditorContent] = useState<string | undefined>("");

  useEffect(() => {
    // Connect to the socket server
    const socket = io("http://localhost:3000");

    setSocket(socket);

    // Listen for incoming data from the socket server
    socket.on("receive-code", (data) => {
      // Update editor content with the received data
      setEditorContent(data);
    });

    // Clean up the socket connection when unmounting
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const editorDiv = document.querySelector(".monaco-editor");

    if (editorDiv) {
      editorDiv.classList.add("rounded-editor"); // Adding the rounded corner class
    }

    return () => {
      if (editorDiv) {
        editorDiv.classList.remove("rounded-editor"); // Removing the class on component unmount
      }
    };
  }, []);

  const handleEditorChange = (value: string | undefined, event) => {
    console.log("Text before send", value);
    // You can emit changes back to the server if needed
    socket?.emit("send-code", value);

    // Update local state with the editor's content
    setEditorContent(value);
  };

  //   useEffect(() => {
  //     socket.on("receive-code", (text) => {});
  //   }, []);
  //   const handleEditorDidMount: EditorDidMount = (
  //     editor: editor.IStandaloneCodeEditor,
  //     monaco: Monaco
  //   ) => {
  //     // here is the editor instance
  //     // you can store it in `useRef` for further usage
  //     editorRef.current = editor;
  //     const monacoBinding = new MonacoBinding(
  //       type,
  //       editor.getModel()!,
  //       new Set([editor]),
  //       provider.awareness
  //     );
  //   };

  //   // className={`${clickedIcon !== "CodeBox" ? "hidden" : "block"}`}
  //   <Editor
  //   height="88%"
  //   width="85%"
  //   // className={`${clickedIcon !== "CodeBox" ? "hidden" : "block"}`}
  //   defaultLanguage="yaml"
  //   defaultValue={`a: 2
  // b: a + 30`}
  //   theme="vs-dark"
  //   value={editorContent}
  //   onChange={handleEditorChange}
  //   // onMount={handleEditorDidMount}
  // />
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleClick = () => {
    setIsOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* {clickedIcon && ( */}

      <section
        className={`editor-container ${
          clickedIcon === "CodeBox" ? "block flex-col" : "hidden"
        }`}
      >
        <div
          className="lang flex h-10 z-10 absolute justify-end mt-2"
          ref={dropdownRef}
        >
          <button
            onClick={toggleDropdown}
            type="button"
            className="w-28 text-secondary bg-gray-900 hover:text-gray-900 hover:bg-secondary hover:font-bold font-semibold px-4 py-2 rounded-xl transition-all duration-300 transform hover:translate-y-1 hover:shadow-lg opacity-80"
          >
            Language
          </button>
          {isOpen && (
            <div className="absolute z-10 mt-2 w-56 rounded-xl bg-gray-900 shadow-lg origin-top-left ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div
                className="py-1"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="options-menu"
              >
                <a
                  href="#"
                  className="block px-4 py-2 rounded-xl text-sm bg-gray-900 hover:text-gray-900 hover:bg-secondary"
                  role="menuitem"
                  onClick={handleClick}
                >
                  Action
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 rounded-xl text-sm bg-gray-900 hover:text-gray-900 hover:bg-secondary"
                  role="menuitem"
                  onClick={handleClick}
                >
                  Another action
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 rounded-xl text-sm bg-gray-900 hover:text-gray-900 hover:bg-secondary"
                  role="menuitem"
                  onClick={handleClick}
                >
                  Something else here
                </a>
              </div>
            </div>
          )}
        </div>
        {/* The background div for creating the illusion of rounded corners */}
        <div className="rounded-background">
          {/* The Monaco Editor */}
          <Editor
            height="88vh"
            width="90vw"
            defaultLanguage="yaml"
            className="block mt-10 ml-10 rounded-full"
            defaultValue={`a: 2
          b: a + 30`}
            theme="vs-dark"
            value={editorContent}
            onChange={handleEditorChange}
            // onMount={handleEditorDidMount}
          />{" "}
        </div>
      </section>

      {/* )} */}
    </>
  );
}

export default Code;
