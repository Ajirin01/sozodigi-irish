"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { FaSpinner, FaEye, FaEyeSlash } from "react-icons/fa";
import ReCAPTCHA from "react-google-recaptcha";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_CAPTCHA_KEY;

export default function CreateSpecialistPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!captchaToken) {
      addToast("Please complete the CAPTCHA.", "error");
      return;
    }

    setLoading(true);
    try {
      const BASE = process.env.NEXT_PUBLIC_NODE_API_BASE_URL || "http://localhost:5000/medical-tourism";
      const res = await fetch(`${BASE}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform": process.env.NEXT_PUBLIC_PLATFORM || "irish",
        },
        body: JSON.stringify({ email, password, role: "specialist", captchaToken }),
      });

      const data = await res.json();

      if (res.ok && data.userId) {
        addToast("Specialist account created! They will receive an OTP in their email.", "success");
        router.push("/admin/specialists");
      } else {
        const msg = data.message || "Registration failed. Please try again.";
        setError(msg);
        addToast(msg, "error");
      }
    } catch (err) {
      console.error("Creation error:", err);
      setError("Something went wrong. Please try again.");
      addToast("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Add New Specialist</h1>
      <p className="mb-6 text-gray-600 dark:text-gray-400">
        Create a base account for a specialist. They will receive an email with an OTP to verify their account, after which they can complete their profile and upload their documents.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold border border-red-100">
            {error}
          </div>
        )}

        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Specialist Email Address</label>
          <input
            type="email"
            placeholder="specialist@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-3 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="relative">
          <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Temporary Password</label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-3 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-[38px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
          </button>
        </div>

        <div className="pt-2">
          <ReCAPTCHA
            sitekey={RECAPTCHA_SITE_KEY}
            onChange={(token) => setCaptchaToken(token)}
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.push("/admin/specialists")}
            className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold flex items-center justify-center disabled:opacity-70"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-2" /> Creating...
              </>
            ) : (
              "Create Specialist"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
