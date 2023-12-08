import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { editor } from "monaco-editor";
import * as monaco from "monaco-editor";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { Socket, io } from "socket.io-client";

const ydocument = new Y.Doc();
const provider = new WebrtcProvider("monaco", ydocument);
const type = ydocument.getText("monaco");
const SAVE_INTERVAL_MS = 2000;

type File = {
  name: string;
  language: string;
  value: string;
};

type Files = {
  [key: string]: File;
};

const files: Files = {
  Javascript: {
    name: "javascript",
    language: "javascript",
    value: "console.log('Hello, world!');",
  },
  Typescript: {
    name: "typescript",
    language: "typescript",
    value: "console.log('Hello, from Typescript');",
  },
  Python: {
    name: "python",
    language: "python",
    value: "print('Hello, world!')",
  },
  Java: {
    name: "java",
    language: "java",
    value: `public class HelloWorld {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello, world!");\n\t}\n}`,
  },
  Rust: {
    name: "rust",
    language: "rust",
    value: `fn main() {
    print!("Hello, World!");
}`,
  },
};

function Code({
  clickedIcon,
  user,
}: {
  clickedIcon: string;
  user: string | null | undefined;
}) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const [socket, setSocket] = useState<Socket>();
  // const [defaultLanguage, setDefaultLanguage] = useState<string>();
  const [fileName, setFileName] = useState<string>("Javascript");

  const file = files[fileName];

  const [editorContent, setEditorContent] = useState<string | undefined>("");

  const [roomId, setRoomId] = useState<string>("");

  const [fetchOnce, setFetchOnce] = useState<boolean>(false);

  // useEffect(() => {
  //   if (editorRef.current) {
  //     const editor = monaco.editor.create(editorRef.current, {
  //       value: code,
  //       language: language,
  //       theme: "vs-dark", // Adjust theme as needed
  //     });

  //     return () => {
  //       editor.dispose();
  //     };
  //   }
  // }, [language, code]);

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

  useEffect(() => {
    socket?.on("roomId", (roomIdFromServer: string) => {
      setRoomId(roomIdFromServer);
      console.log(roomIdFromServer);
    });
  }, [roomId, socket]);

  useEffect(() => {
    if (clickedIcon !== "CodeBox" || roomId === "") return;
    const fetchDocument = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/find_code/${roomId}/${user}`
        );
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          if (fetchOnce) return;
          setEditorContent(data.editorContent);
        } else {
          console.error("Failed to fetch document");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };
    if (clickedIcon === "CodeBox") {
      fetchDocument();
      setFetchOnce(true);
    }
  }, [clickedIcon, fetchOnce, roomId, user]);

  useEffect(() => {
    if (socket == null) return;

    const interval = setInterval(() => {
      console.log(editorContent);
      if (editorContent) {
        const data = {
          roomId,
          editorContent,
        };
        socket.emit("save-code", data);
      }
    }, SAVE_INTERVAL_MS);

    console.log("saved? ");

    return () => {
      clearInterval(interval);
    };
  }, [socket, roomId, editorContent]);

  const handleEditorChange = (value: string | undefined, event) => {
    console.log("Text before send", value);
    // You can emit changes back to the server if needed
    socket?.emit("send-code", value);

    // Update local state with the editor's content
    setEditorContent(value);
  };

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleClick = (clickedLang: string) => {
    console.log("handleClick called", clickedLang);
    setIsOpen(false);

    // let editorContent = "";

    // // Check the clicked language and set editor content accordingly
    // if (clickedLang === "script.js") {
    //   editorContent = "console.log('Hello, world!');";
    // } else if (clickedLang === "script.py") {
    //   editorContent = "print('Hello, world!')";
    // }

    // else if (clickedLang === "Java") {
    //   editorContent =
    //     'public class HelloWorld {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello, world!");\n\t}\n}';
    // }

    setFileName(clickedLang);
    // setEditorContent(editorContent);
    // setDefaultLanguage(clickedLang);
    // console.log(defaultLanguage);
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
                  onClick={(e) => handleClick(e.currentTarget.innerHTML)}
                >
                  Javascript
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 rounded-xl text-sm bg-gray-900 hover:text-gray-900 hover:bg-secondary"
                  role="menuitem"
                  onClick={(e) => handleClick(e.currentTarget.innerHTML)}
                >
                  Typescript
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 rounded-xl text-sm bg-gray-900 hover:text-gray-900 hover:bg-secondary"
                  role="menuitem"
                  onClick={(e) => handleClick(e.currentTarget.innerHTML)}
                >
                  Python
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 rounded-xl text-sm bg-gray-900 hover:text-gray-900 hover:bg-secondary"
                  role="menuitem"
                  onClick={(e) => handleClick(e.currentTarget.innerHTML)}
                >
                  Java
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 rounded-xl text-sm bg-gray-900 hover:text-gray-900 hover:bg-secondary"
                  role="menuitem"
                  onClick={(e) => handleClick(e.currentTarget.innerHTML)}
                >
                  Rust
                </a>
              </div>
            </div>
          )}
        </div>
        <div className="rounded-background">
          <Editor
            height="88vh"
            width="90vw"
            defaultLanguage={file.language}
            className="block mt-10 ml-10 rounded-full"
            defaultValue={`fsbfsdfsd`}
            theme="vs-dark"
            path={file.name}
            value={file.value}
            onChange={handleEditorChange}
          />{" "}
        </div>
      </section>
    </>
  );
}

export default Code;
