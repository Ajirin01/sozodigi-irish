"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { postData } from "@/utils/api";
import AuthLayout from "@/app/authLayout";
import Link from "next/link";
import Image from "next/image";
import { doctors } from "@/assets";
import { useToast } from "@/context/ToastContext";
import { FaSpinner, FaEye, FaEyeSlash, FaCalendarAlt } from "react-icons/fa";
import ReCAPTCHA from "react-google-recaptcha";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const formInput =
  "border-[3px] border-primary-5 text-primary-2 rounded-[20px] overflow-hidden p-3 w-full placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-5";
const formLabel = "block text-sm font-semibold text-gray-700 mb-1 ml-1";

// Replace with your actual site key from Google reCAPTCHA v2
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_CAPTCHA_KEY;

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleFromUrl = searchParams.get("role") || "user";
  const callbackUrl = searchParams.get("callbackUrl");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [DOB, setDOB] = useState(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { addToast } = useToast();
  const alertSuccess = (msg) => addToast(msg, "success");
  const alertError = (msg) => addToast(msg, "error");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!agreeTerms) {
      alertError("You must agree to the Terms and Conditions.");
      return;
    }

    if (!DOB) {
      alertError("Please provide your Date of Birth.");
      return;
    }

    if (!captchaToken) {
      alertError("Please complete the CAPTCHA.");
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
        body: JSON.stringify({ email, password, role: roleFromUrl || "user", captchaToken, DOB }),
      });
      
      const data = await res.json();

      if (res.ok && data.userId) {
        addToast("Account created! Check your email for the OTP.", "success");
        let verifyUrl = `/auth/verify-otp?email=${email}`;
        if (callbackUrl) verifyUrl += `&callbackUrl=${encodeURIComponent(callbackUrl)}`;
        router.push(verifyUrl);
      } else {
        const knownErrors = {
          "email already registered": "An account with this email already exists.",
          "invalid input": "Please fill all fields correctly.",
        };
        const message =
          knownErrors[data?.message?.toLowerCase()] ||
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
              Create your {roleFromUrl || "user"} account
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Please fill in your details to get started
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-y-5">
              {error && (
                <p className="text-sm text-red-600 text-center">{error}</p>
              )}

              <div>
                <label className={formLabel}>Email</label>
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={formInput}
                />
              </div>

              <div className="relative">
                <label className={formLabel}>Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={formInput}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[38px] text-primary-5 hover:text-primary-7 transition-colors"
                >
                  {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
                </button>
              </div>

              {/* Date of Birth */}
              <div className="flex flex-col">
                <label className={formLabel}>Date of Birth</label>
                <div className="relative">
                  <DatePicker
                    selected={DOB}
                    onChange={(date) => setDOB(date)}
                    className={`${formInput} pl-10`}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select your date of birth"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    yearDropdownItemNumber={100}
                    scrollableYearDropdown
                    maxDate={new Date()}
                    required
                  />
                  <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-center ml-2">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 text-primary-6 bg-gray-100 border-gray-300 rounded focus:ring-primary-5 focus:ring-2"
                  required
                />
                <label htmlFor="agreeTerms" className="ml-2 text-sm font-medium text-gray-700">
                  I agree to the <Link href="/terms-and-conditions" className="text-primary-6 hover:underline">Terms and Conditions</Link>
                </label>
              </div>

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
                  href={callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login"}
                  className="text-primary-6 underline hover:text-primary-8 decoration-2 underline-offset-4"
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
