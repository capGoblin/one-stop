import React, { createContext, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

interface SocketContextProps {
  socket: Socket | undefined;
}

export const SocketContext = createContext<SocketContextProps>({
  socket: undefined,
});

export const useSocket = () => {
  return useContext(SocketContext);
};
