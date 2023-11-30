import { createContext, useContext } from "react";
import { Socket } from "socket.io-client";

interface SocketContextProps {
  socket: Socket | undefined;
}

export const SocketContext = createContext<SocketContextProps>({
  socket: undefined,
});

export const useSocket = () => {
  return useContext(SocketContext);
};
