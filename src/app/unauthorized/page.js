"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  useEffect(() => {
    document.title = "Unauthorized";
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8 max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
        <p className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Unauthorized Access</p>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You do not have permission to view this page.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-md transition duration-300"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
