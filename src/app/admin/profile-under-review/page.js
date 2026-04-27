"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { fetchData } from "@/utils/api";
import { Loader2 } from "lucide-react";

export default function ProfileUnderReview() {
    const { data: session } = useSession();
    const [isApproved, setIsApproved] = useState(false);
    const [checking, setChecking] = useState(true);

    const checkStatus = async () => {
        if (!session?.user?.jwt) return;
        try {
            setChecking(true);
            const user = await fetchData("users/me", session.user.jwt);
            if (user.approvalStatus === "approved") {
                setIsApproved(true);
            }
        } catch (err) {
            console.error("Error checking approval status:", err);
        } finally {
            setChecking(false);
        }
    };

    useEffect(() => {
        if (session?.user?.jwt) {
            checkStatus();
        }
    }, [session]);

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 dark:text-gray-300 px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center dark:bg-gray-800 dark:text-gray-300">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 dark:text-gray-100">
            {isApproved ? "Profile Approved!" : "Profile Under Review"}
          </h1>
          
          {checking ? (
            <div className="flex flex-col items-center gap-4 py-4">
               <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
               <p className="text-sm text-gray-500">Checking your status...</p>
            </div>
          ) : isApproved ? (
            <>
              <p className="text-gray-600 mb-6 dark:text-gray-400">
                Great news! Your profile has been approved. 
                Please log out and log back in to activate your dashboard access.
              </p>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg"
              >
                Logout & Login to Continue
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-6 dark:text-gray-400">
                Thank you for registering as a Specialist. 
                Our team is currently reviewing your profile.
              </p>
              <p className="text-gray-600 mb-6 dark:text-gray-400">
                You will be notified via email once your profile is approved.
              </p>
              <div className="flex justify-center mb-6">
                <svg
                  className="w-24 h-24 text-blue-500 animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
              <button
                onClick={checkStatus}
                className="text-blue-600 font-medium hover:underline flex items-center justify-center gap-2"
              >
                Refresh Status
              </button>
            </>
          )}
        </div>
      </div>
    );
}
  