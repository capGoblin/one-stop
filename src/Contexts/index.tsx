import { useEffect } from "react";
import { io } from "socket.io-client";
// import { SocketContext } from "./SocketContext";
// interface Props {
//   children: ReactNode;
// }

const SocketProvider = () => {
  // const [socket, setSocket] = useState<Socket | undefined>();
  // const server_URL = process.env.SERVER_URL;

  useEffect(() => {
    // if (!server_URL) {
    //   throw new Error(
    //     "SERVER_URL is not defined in the environment variables."
    //   );
    // }
    // Initialize the socket when the component mounts
    const newSocket = io(
      "https://video-call-app-production-d4a0.up.railway.app"
    );
    console.log("connetced ? ftopm socketProveider");
    // setSocket(newSocket);

    // Clean up the socket when the component unmounts
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <>
      // @ts-ignore
      {/* <SocketContext.Provider value={{ socket }}>
        {" "}
        // @ts-ignore
        {props.children}
      </SocketContext.Provider> */}
    </>
  );
};

export default SocketProvider;
