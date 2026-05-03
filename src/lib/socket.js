// src/lib/socket.js
import { io } from "socket.io-client";

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected, joining platform:", process.env.NEXT_PUBLIC_PLATFORM || "global");
      socket.emit("join-platform", { platform: process.env.NEXT_PUBLIC_PLATFORM || "global" });
    });
  }
  return socket;
}
