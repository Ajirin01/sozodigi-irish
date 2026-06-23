// src/lib/socket.js
let socket;

export function getSocket() {
  if (typeof window === "undefined") return null; // SSR guard — never run on server

  if (!socket) {
    const { io } = require("socket.io-client"); // dynamic require — only on client
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
