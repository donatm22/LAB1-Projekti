import { io } from "socket.io-client";
import { API_BASE_URL } from "../config/api";
import { tokenStorage } from "./api";

let socket = null;

export const getSocket = () => {
  const user = tokenStorage.getUser();

  if (!user?.id) {
    return null;
  }

  if (!socket) {
    socket = io(API_BASE_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
  }

  if (socket.connected) {
    socket.emit("register", user.id);
  } else {
    socket.once("connect", () => {
      socket.emit("register", user.id);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
