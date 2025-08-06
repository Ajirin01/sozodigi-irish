"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/app/authLayout";
import Link from "next/link";
import Image from "next/image";
import { doctors2 } from '@/assets';
import { FaSpinner } from "react-icons/fa";
import { useToast } from "@/context/ToastContext";
import { useSearchParams } from "next/navigation";

const formInput =
  "border-[3px] border-primary-5 text-primary-2 rounded-[20px] overflow-hidden p-3 w-full placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-5";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { addToast } = useToast();

  const searchParams = useSearchParams();
  // const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const callbackUrl = "/admin";


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (res?.error) {
      let friendlyMessage = "An unexpected error occurred. Please try again.";
      if (res.error.toLowerCase().includes("credentials" || "Unauthorized")) {
        friendlyMessage = "Incorrect email or password.";
      } else if (res.error.toLowerCase().includes("network")) {
        friendlyMessage = "Network error. Please check your connection.";
      }
      setError(friendlyMessage);
      addToast(friendlyMessage, "error")
      setIsSubmitting(false);
    } else {
      addToast("Login successful!", "success")
      router.push(res.url || callbackUrl);
    }
  };

  return (
    <AuthLayout>
      <main className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl w-full py-12 sm:py-16 lg:py-20">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center">
            {/* LEFT SIDE IMAGE */}
            <div className="w-full lg:w-1/2 hidden lg:block">
              <Image
                src={doctors2.src} // Make sure this image exists in /public/images
                alt="Healthcare professionals"
                width={600}
                height={400}
                className="rounded-lg object-cover w-full h-auto"
              />
            </div>

            {/* RIGHT SIDE FORM */}
            <div className="w-full lg:w-1/2 bg-white p-8 sm:p-12  rounded-[24px]">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
                Welcome Back
              </h2>
              <p className="text-center text-gray-600 mb-6">
                Please sign in to access your account
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-y-5">
                {error && (
                  <p className="text-sm text-red-600 text-center">{error}</p>
                )}

                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={formInput}
                />

                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={formInput}
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 rounded-[20px] bg-[var(--color-primary-5)] text-white font-semibold text-lg hover:bg-[var(--color-primary-4)] transition-transform transform hover:scale-105 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <FaSpinner className="animate-spin mr-2" />
                  ) : null}
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </button>

                <div className="text-sm text-center text-gray-600">
                  Forgot password?{" "}
                  <Link
                    href="/auth/forgot-password"
                    className="text-[var(--color-primary-5)] underline"
                  >
                    Click here
                  </Link>
                </div>

                <div className="text-sm text-center text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    href="/auth/sign-up"
                    className="text-[var(--color-primary-5)] underline"
                  >
                    Sign Up
                  </Link>
                </div>
              </form>

              {/* <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Are you a healthcare specialist?{" "}
                  <Link
                    href="/auth/sign-up?role=specialist"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Sign in here
                  </Link>
                </p>
              </div> */}
            </div>
          </div>
        </div>
      </main>
    </AuthLayout>
  );
}
