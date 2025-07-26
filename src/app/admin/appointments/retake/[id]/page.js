'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import 'react-calendar/dist/Calendar.css'
import { fetchData } from '@/utils/api'
import { useUser } from '@/context/UserContext'
import { useSession } from "next-auth/react";
// import Link from "next/link";


export default function ConsultationBookingPageContent() {
  const router = useRouter()
  const { user, loading } = useUser()
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [calculatedCost, setCalculatedCost] = useState(0)

  const [consultMode, setConsultMode] = useState('now'); // 'now'

  const [maxDuration, setMaxDuration] = useState(60);
  const [durationOptions, setDurationOptions] = useState([]);

  const { id } = useParams()

  const appointmentId = id

  // console.log("5555555555", appointmentId)

  const { data: session } = useSession();
  const token = session?.user?.jwt;

  const COST_PER_MINUTE = 2

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    duration: 0,
  })
  

  // Add this logic to auto-fill time if 'now' is selected
  useEffect(() => {
    if (consultMode === 'now') {
      const now = new Date();
      const roundedNow = new Date(Math.ceil(now.getTime() / (15 * 60 * 1000)) * (15 * 60 * 1000)); // Round to next 15min
      setSelectedDate(roundedNow);
      setSelectedSlot({ timeSlot: 'Immediate', datetime: roundedNow });
      setFormData(prev => ({ ...prev, duration: '30' })); // Default duration
      setDurationOptions([15, 30, 45, 60]);
      setCalculatedCost(30 * 2); // e.g., $2/min
    } else {
      setSelectedDate(null);
      setSelectedSlot(null);
      setFormData(prev => ({ ...prev, duration: '' }));
    }
  }, [consultMode]);

  useEffect(() => {
    setCalculatedCost(formData.duration * COST_PER_MINUTE)
  }, [formData.duration])

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: `${user.firstName} ${user.lastName}` || '',
        email: user.email || '',
        phone: user.phone || '',
      }))
    }
  }, [user])

  useEffect(() => {
    if (selectedDate && consultMode !== "now") {
      console.log("selectedSlot", selectedSlot)
    //   console.log(selectedDate)
      const formattedDate = selectedDate.toISOString().split('T')[0]
      setFormData((prev) => ({ ...prev, preferredDate: formattedDate }))
      setFormData((prev) => ({ ...prev, id: selectedSlot?.id }))
      setSelectedSlot(null)
    }
  }, [selectedDate])
  

  const handleChange = (e) => {
    const { name, value } = e.target
    console.log(value)
    setFormData({ ...formData, [name]: name === 'duration' ? parseInt(value) : value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // console.log(selectedDate.toISOString().split('T')[0])

    if(consultMode === "now"){
      setSelectedDate(selectedDate.toISOString().split('T')[0])
    }

    // return

    const payload = {
      ...formData,
      date: selectedDate,
      timeSlot: selectedSlot.timeSlot,
      cost: calculatedCost,
      consultMode: consultMode,
      type: "general",
      appointmentId: appointmentId
    }

    router.push(`/consultation/book/review?data=${encodeURIComponent(JSON.stringify(payload))}`)
  }

  return (
    <div className="flex justify-center px-4 py-8">
      <div className="w-full max-w-3xl mb-8">
        <div className="mb-8">
          <h2>Please select duration and proceed to payment</h2>
          {/* FORM */}
          {loading ? (
            <div className="text-center text-gray-600">Checking login status...</div>
          ) : !user ? (
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <p className="text-lg text-gray-700 font-medium mb-4">
                Please log in to book a consultation.
              </p>
              <a
                href="/login"
                className="inline-block bg-indigo-600 text-white px-5 py-3 rounded-md font-semibold hover:bg-indigo-700 transition"
              >
                Log In
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
      
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
      
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  required
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
      
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                  Duration (minutes)
                </label>
                <select
                  required
                  name="duration"
                  id="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  disabled={consultMode === 'appointment' && !selectedSlot}
                  className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  {durationOptions.length === 0 ? (
                    <option value="">Select a slot first</option>
                  ) : (
                    durationOptions.map((min) => (
                      <option key={min} value={min}>
                        {min} minutes
                      </option>
                    ))
                  )}
                </select>
              </div>
      
              <div className="text-sm text-gray-700">
                Estimated Cost:{' '}
                <span className="font-semibold text-gray-900">${calculatedCost}</span>
              </div>
      
              <div>
                <button
                  type="submit"
                  disabled={submitting || (consultMode === 'appointment' && !selectedSlot)}
                  className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Book Appointment'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
