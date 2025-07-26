'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { postData } from '@/utils/api';
import { useToast } from "@/context/ToastContext";
import { signIn } from "next-auth/react";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [resendTimer, setResendTimer] = useState(60);

  const { addToast } = useToast();

  const alertSuccess = (msg) => addToast(msg, "success");
  const alertError = (msg) => addToast(msg, "error");

  useEffect(() => {
    const interval = setInterval(() => {
      if (resendTimer > 0) {
        setResendTimer(resendTimer - 1);
      } else {
        setIsResendDisabled(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleOTPChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Move focus to the next input field if a value is entered
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[data-index="${index + 1}"]`);
      if (nextInput) {
        nextInput.focus();
      }
    } else if (!value && index > 0) {
      const prevInput = document.querySelector(`input[data-index="${index - 1}"]`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handlePaste = (e) => {
    const clipboardData = e.clipboardData || window.clipboardData;
    const pastedData = clipboardData.getData('Text').slice(0, 6).split('');
    setOtp(pastedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setLoading(true);
    try {
      const response = await postData('users/otp/verify', {
        email,
        otp: otpValue,
      });

      setMessage(response.message);
      setError('');
      setIsResendDisabled(true);
      setResendTimer(60);

      alertSuccess('OTP Verified successfully');
      
      // Optionally, sign in the user after successful OTP verification
      const loginRes = await signIn('credentials', {
        redirect: false,
        email,
        token: response.token,
        callbackUrl: response.redirectTo === 'complete-profile' 
          ? `/auth/complete-profile?email=${email}`
          : '/admin',
      });

      if (loginRes?.error) {
        console.log(loginRes)
        alertError('Login failed after OTP verification');
        setError(loginRes.error);
      } else {
        console.log(loginRes)
        router.push(loginRes.url); // Redirect to the correct URL
      }

    } catch (err) {
      setError(err.message || 'An error occurred');
      alertError(err.message || 'An error occurred')
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await postData('users/otp/resend', { email });
      setMessage('OTP has been resent to your email');
      setError('');
      setIsResendDisabled(true);
      setResendTimer(60);
    } catch (err) {
      setError(err.response?.data || 'An error occurred');
      setMessage('');
    }
  };

  return (
    <div
        className="relative px-6 lg:px-8"
        style={{
          backgroundImage: "url('/images/Medical-tourism.jpg')",
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      >
        <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
            <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Verify OTP</h1>
            <p className="text-gray-500 mt-2">Please enter the OTP sent to your email</p>
            </div>

            {message && <div className="text-green-500 mb-4 text-center">{message}</div>}
            {error && <div className="text-red-500 mb-4 text-center">{error}</div>}

            <form onSubmit={handleSubmit}>
            <div className="mb-4 flex justify-between">
                {otp.map((value, index) => (
                <input
                    key={index}
                    type="text"
                    value={value}
                    onChange={(e) => handleOTPChange(e, index)}
                    onPaste={handlePaste}
                    maxLength={1}
                    data-index={index}
                    className="w-12 h-12 text-center text-xl font-bold border-b-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                ))}
            </div>

            <div className="mt-6 flex justify-between">
                <button
                type="submit"
                className={`py-2 px-4 rounded-md text-white ${loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                disabled={loading}
                >
                {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button
                type="button"
                onClick={handleResendOTP}
                disabled={isResendDisabled}
                className="py-2 px-4 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50"
                >
                Resend OTP ({isResendDisabled ? resendTimer : 'Resend'})
                </button>
            </div>
            </form>
        </div>
        </div>
    </div>
  );
}
