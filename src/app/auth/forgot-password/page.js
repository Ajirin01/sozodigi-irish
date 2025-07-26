'use client';

import { useState } from 'react';
import { postData } from '@/utils/api';
import { useToast } from '@/context/ToastContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { addToast } = useToast();
  const alertSuccess = (msg) => addToast(msg, 'success');
  const alertError = (msg) => addToast(msg, 'error');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await postData('users/auth/forgot-password', { email });
      setMessage(response.message || 'Password reset instructions sent to your email.');
      alertSuccess('Password reset email sent');
    } catch (err) {
      setError(err.message || 'An error occurred');
      alertError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
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
            <h1 className="text-2xl font-bold">Forgot Password</h1>
            <p className="text-gray-500 mt-2">
              Enter your email address to receive password reset instructions
            </p>
          </div>

          {message && <div className="text-green-500 mb-4 text-center">{message}</div>}
          {error && <div className="text-red-500 mb-4 text-center">{error}</div>}

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-md text-white ${
                loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Sending...' : 'Send Reset Email'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
