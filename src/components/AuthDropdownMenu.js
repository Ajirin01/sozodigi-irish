"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { User2Icon } from "lucide-react"; // Make sure lucide-react is installed

export default function AuthDropdown() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const { user } = useUser();

  const toggleDropdown = () => setOpen((prev) => !prev);
  const closeDropdown = () => setOpen(false);

  const logout = () => {
    signOut({ callbackUrl: "/login" });
    closeDropdown();
  };

  return (
    <>
      {/* Desktop dropdown */}
      <div className="relative hidden lg:flex lg:items-center">
        <button
          onClick={toggleDropdown}
          className="ml-6 flex items-center gap-2 px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-500"
        >
          <User2Icon className="w-5 h-5" />
          {session ? user?.firstName || "User" : "Account"}
        </button>

        {open && (
          <div
            className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-50"
            onMouseLeave={closeDropdown}
          >
            <ul className="py-2 text-sm text-gray-700">
              {session ? (
                <>
                  <li>
                    <a
                      href="/admin"
                      onClick={closeDropdown}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Dashboard
                    </a>
                  </li>
                  <li>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link
                    href="/login"
                    onClick={closeDropdown}
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Login
                  </Link>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
