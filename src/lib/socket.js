// src/lib/socket.js
import { io } from "socket.io-client";

let socket;

export function getSocket() {
  if (!socket) {
    const platform = process.env.NEXT_PUBLIC_PLATFORM || "irish";
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000", {
      query: { platform }
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected, joining platform:", platform);
      socket.emit("join-platform", { platform });
    });
  }
  return socket;
}
