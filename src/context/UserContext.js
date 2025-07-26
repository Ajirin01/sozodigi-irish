"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchData } from "@/utils/api"; // 👈 import the util

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      if (status === "authenticated" && session?.user) {
        const userId = session.user.id;
        const token = session.user.jwt;

        console.log(userId)

        const fullUser = await fetchData('users/'+userId, token);

        if (fullUser) {
          setUser(fullUser); // full user object from backend
        } else {
          setUser(session.user); // fallback to session user
        }
      }
      setLoading(false);
    };

    getUserData();
  }, [session, status]);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
