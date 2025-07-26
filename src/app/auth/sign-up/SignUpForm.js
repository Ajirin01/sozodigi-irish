"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { postData } from "@/utils/api";
import AuthLayout from "@/app/authLayout";
import Link from "next/link";
import Image from "next/image";
import { doctors } from "@/assets";
import { useToast } from "@/context/ToastContext";
import { FaSpinner } from "react-icons/fa";
import ReCAPTCHA from "react-google-recaptcha";

const formInput =
  "border-[3px] border-primary-5 text-primary-2 rounded-[20px] overflow-hidden p-3 w-full placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-5";

// Replace with your actual site key from Google reCAPTCHA v2
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_CAPTCHA_KEY;

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleFromUrl = searchParams.get("role");

  console.log(RECAPTCHA_SITE_KEY)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
  });

  const [captchaToken, setCaptchaToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { addToast } = useToast();
  const alertSuccess = (msg) => addToast(msg, "success");
  const alertError = (msg) => addToast(msg, "error");

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      role: roleFromUrl || "user",
    }));
  }, [roleFromUrl]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!captchaToken) {
      setError("Please verify the CAPTCHA.");
      alertError("Please complete the CAPTCHA.");
      setLoading(false);
      return;
    }

    try {
      const res = await postData("users/register", {
        ...formData,
        captchaToken,
      });

      console.log(res)

      if (res?.userId) {
        alertSuccess("Sign-up successful! Check your email for OTP.");
        router.push(`/auth/verify-otp?email=${formData.email}`);
      } else {
        const knownErrors = {
          "email already registered": "An account with this email already exists.",
          "invalid input": "Please fill all fields correctly.",
        };
        const message =
          knownErrors[res?.message?.toLowerCase()] ||
          "Registration failed. Please try again.";
        setError(message);
        alertError(message);
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(err?.message || "Something went wrong. Please try again.");
      alertError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl w-full py-12 sm:py-16 lg:py-20">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center">
          {/* LEFT SIDE IMAGE */}
          <div className="w-full lg:w-1/2 hidden lg:block">
            <Image
              src={doctors.src}
              alt="Healthcare professionals"
              width={600}
              height={400}
              className="rounded-lg object-cover w-full h-auto"
            />
          </div>

          {/* RIGHT SIDE FORM */}
          <div className="w-full lg:w-1/2 bg-white p-8 sm:p-12 rounded-[24px]">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
              Create your {formData.role} account
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Please fill in your details to get started
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-y-5">
              {error && (
                <p className="text-sm text-red-600 text-center">{error}</p>
              )}

              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                value={formData.email}
                onChange={handleChange}
                className={formInput}
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                value={formData.password}
                onChange={handleChange}
                className={formInput}
              />

              {/* reCAPTCHA box */}
              <ReCAPTCHA
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={(token) => setCaptchaToken(token)}
                className="mx-auto"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 rounded-[20px] bg-[var(--color-primary-5)] text-white font-semibold text-lg hover:bg-[var(--color-primary-4)] transition-transform transform hover:scale-105 flex items-center justify-center"
              >
                {loading && <FaSpinner className="animate-spin mr-2" />}
                {loading ? "Signing Up..." : "Sign Up"}
              </button>

              <div className="text-sm text-center text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-[var(--color-primary-5)] underline"
                >
                  Sign In
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
