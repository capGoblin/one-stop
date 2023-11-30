import { useEffect } from "react";
import { io } from "socket.io-client";
// import { SocketContext } from "./SocketContext";
// interface Props {
//   children: ReactNode;
// }

const SocketProvider = () => {
  // const [socket, setSocket] = useState<Socket | undefined>();

  useEffect(() => {
    // Initialize the socket when the component mounts
    const newSocket = io("http://localhost:3000");
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
