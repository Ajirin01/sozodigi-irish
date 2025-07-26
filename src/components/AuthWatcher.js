"use client";
import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export default function AuthWatcher() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      const currentTime = Math.floor(Date.now() / 1000);
      const tokenExp = session?.user?.exp;

      if (tokenExp && tokenExp < currentTime) {
        console.warn("Session token expired. Logging out...");
        signOut({ callbackUrl: "/login" });
      }

      if (session?.error === "RefreshAccessTokenError") {
        console.warn("Refresh token error. Logging out...");
        signOut({ callbackUrl: "/login" });
      }
    }
  }, [status, session]);

  return null;
}
