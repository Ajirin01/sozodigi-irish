'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ThankYouPage() {
  const router = useRouter()

  useEffect(() => {
    // Optional: clear localStorage or query params if you stored appointment state
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-20">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md text-center">
        <div className="text-green-600 text-5xl mb-4">✓</div>
        <h1 className="text-2xl font-semibold mb-2 text-gray-800">
          Thank you for your booking!
        </h1>
        <p className="text-gray-600 mb-6">
          Your consultation appointment has been successfully scheduled. A confirmation email has been sent.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md"
          >
            Return to Home
          </button>
          <button
            onClick={() => router.push('/medical-tourism')}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md"
          >
            Browse More Services
          </button>
        </div>
      </div>
    </div>
  )
}
