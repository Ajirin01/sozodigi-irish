'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { postData } from '@/utils/api';
import { useToast } from '@/context/ToastContext';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { addToast } = useToast();
  const alertSuccess = (msg) => addToast(msg, 'success');
  const alertError = (msg) => addToast(msg, 'error');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await postData('users/auth/reset-password', {
        email,
        token,
        password,
      });

      setMessage(response.message || 'Password reset successfully.');
      alertSuccess('Password reset successfully.');

      // Redirect to login after success
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'An error occurred');
      alertError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!email || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-center text-red-500">Invalid or missing password reset link.</p>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold">Reset Password</h1>
            <p className="text-gray-500 mt-2">
              Enter your new password below
            </p>
          </div>

          {message && <div className="text-green-500 mb-4 text-center">{message}</div>}
          {error && <div className="text-red-500 mb-4 text-center">{error}</div>}

          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={6}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={6}
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-md text-white ${
                loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
