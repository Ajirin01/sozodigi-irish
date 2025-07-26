import React, { useState } from 'react'

const BookingInstructions = ({showSpecialistCateogies}) => {
  const [showInstructions, setShowInstructions] = useState(true)

  return (
    <div className="max-w-lg mb-6">
      <button
        onClick={() => setShowInstructions(!showInstructions)}
        className="flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-800 focus:outline-none"
        aria-expanded={showInstructions}
        aria-controls="booking-instructions"
      >
        <span>{showInstructions ? 'Close instructions' : 'Need help booking? click here!'}</span>
        <svg
          className={`w-5 h-5 transition-transform duration-300 ${
            showInstructions ? 'rotate-180' : 'rotate-0'
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showInstructions && (
        <div
          id="booking-instructions"
          className="bg-blue-50 border border-blue-300 text-blue-800 p-4 rounded-md mt-3"
        >
          <ol className="list-decimal list-inside space-y-1 text-sm leading-relaxed">
            {showSpecialistCateogies && <li>Select a specialist category.</li>}
            <li>Choose a date from the calendar.</li>
            <li>Select an available time slot.</li>
            <li>
              Enter the reason for your visit and click <strong>Book Appointment</strong>.
            </li>
          </ol>
        </div>
      )}
    </div>
  )
}

export default BookingInstructions
