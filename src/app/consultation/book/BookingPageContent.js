'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import 'react-calendar/dist/Calendar.css'
import { fetchData, postData } from '@/utils/api'
import { useUser } from '@/context/UserContext'
import { useSession } from "next-auth/react";
import FullCalendar from '@fullcalendar/react'
import interactionPlugin from '@fullcalendar/interaction' // optional but useful
import dayGridPlugin from '@fullcalendar/daygrid'
import { useToast } from '@/context/ToastContext'
import { ClockIcon, DollarSignIcon, CheckCircleIcon } from "lucide-react";
// import Link from "next/link";


export default function ConsultationBookingPageContent() {
  const router = useRouter()
  const { user, loading } = useUser()

  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [calculatedCost, setCalculatedCost] = useState(0)

  const searchParams = useSearchParams()


  const [ consultant, setConsultant] = useState()
  const { addToast } = useToast()

  const alertSuccess = (msg) => addToast(msg, 'success')
  const alertError = (msg) => addToast(msg, 'error')

  const [consultMode, setConsultMode] = useState('appointment'); // 'appointment' | 'now'

  const [maxDuration, setMaxDuration] = useState(60);
  const [durationOptions, setDurationOptions] = useState([]);

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
    const fetchAvailableSlots = async () => {
      try {
        const res = await fetchData(`availabilities/slots/by?userRole=specialist&isBooked=false`, token)
        console.log(res.data)
        if (Array.isArray(res.data)) {
          setAvailableSlots(res.data)
        }
      } catch (err) {
        console.error('Failed to fetch slots by role:', err)
      }
    }

    if (token) fetchAvailableSlots()
  }, [token])

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

  useEffect(() => {
      const appointmentId = searchParams.get('appointmentId');
    
      const fetchAppointmentOrConsultant = async () => {
        try {
          if (appointmentId) {
            const apptRes = await fetchData(`/appointments/${appointmentId}`, token);
            if (apptRes) {
              setConsultant(apptRes.consultant); // use consultant from the fetched appointment
            }
          } else {
            // No appointmentId → fallback to fetching default consultant
            const res = await fetchData("users/get-all/no-pagination?role=specialist", token);
            const targetEmail = "olagokemubarakishola@gmail.com"; // The name you want to select

            const match = res.find(s => s.email === targetEmail);

            // console.log(match)

            if (match) {
              setConsultant(match);
            } else {
              console.warn(`Specialist "${targetEmail}" not found`);
            }
          }
        } catch (err) {
          console.error('Error fetching consultant/appointment:', err);
        }
      };
    
      if (token) {
        fetchAppointmentOrConsultant();
      }
    }, [token, searchParams]);
  
  function convertTo24Hour(timeStr) {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
  
    if (modifier === 'PM' && hours !== '12') {
      hours = parseInt(hours, 10) + 12;
    }
    if (modifier === 'AM' && hours === '12') {
      hours = '00';
    }
  
    return `${hours}:${minutes}`; 
  }

  const handleConfirm = async () => {
    event.preventDefault()
    if (!token || !session?.user?.id) return;
  
    setSubmitting(true);
    try {
      const appointmentData = {
        ...formData,
        date: selectedDate,
        timeSlot: selectedSlot.timeSlot,
        cost: calculatedCost,
        consultMode: consultMode,
        type: "general"
      }
      
      const time24 = convertTo24Hour(appointmentData.timeSlot); // "11:00 AM" → "11:00"
      const dateTimeISO = new Date(`${appointmentData.date}`);
  
      if (isNaN(dateTimeISO.getTime())) {
        throw new Error('Invalid date format');
      }
  
      const payload = {
        patient: session.user.id,
        consultant: consultant._id,
        date: dateTimeISO,
        duration: appointmentData.duration,
        type: appointmentData.type || 'medicalTourism',
        paymentStatus: 'pending',
        consultMode: appointmentData.consultMode,
      };

      
  
      // Save appointment details to sessionStorage for later use
      sessionStorage.setItem('orderData', JSON.stringify(payload));

      // Initiate payment request to the backend
      const paymentPayload = {
        amount: calculatedCost, // Ensure the cost is in the correct unit (e.g., dollars)
        email: session.user.email,
        productName: `Consultation with ${consultant.firstName}`,
      };

      // console.log(paymentPayload)
      // return

      const paymentRes = await postData('/payments/initiate', paymentPayload, token);

      if (paymentRes?.url) {
        // Redirect to Stripe payment page
        window.location.href = paymentRes.url;
      } else {
        alertError('Failed to initiate payment');
      }
    } catch (err) {
      console.error(err);
      alertError('Something went wrong while booking');
    } finally {
      setSubmitting(false);
    }
  };


  async function getSlotMaxDuration(selectedSlot, consultMode) {
    // Handle "Consult Now" mode — fixed 60-minute max
    if (consultMode === 'now') {
      return 60;
    }
    if (!selectedSlot) return 0;
  
    // Fallback for normal appointment slot
    if (!selectedSlot.id) return 0;
  
    try {
      // Fetch availability details by ID
      const slotData = await fetchData(`availabilities/${selectedSlot.id}`);
  
      if (!slotData || !slotData.startTime || !slotData.endTime) return 0;
  
      const [startH, startM] = slotData.startTime.split(':').map(Number);
      const [endH, endM] = slotData.endTime.split(':').map(Number);
  
      const start = new Date();
      start.setHours(startH, startM, 0, 0);
      const end = new Date();
      end.setHours(endH, endM, 0, 0);
  
      const diffMinutes = (end - start) / 60000;
  
      return diffMinutes;
  
    } catch (err) {
      console.error("Failed to fetch slot availability:", err);
      return 0;
    }
  }
  
  
  useEffect(() => {
    const fetchDuration = async () => {
      if (!selectedSlot?.id && consultMode !=="now") {
        setMaxDuration(0);
        setDurationOptions([]);
        return;
      }
  
      const max = await getSlotMaxDuration(selectedSlot, consultMode);

      setMaxDuration(max);
  
      const result = [];
      for (let i = 10; i <= max; i += 5) {
        result.push(i);
      }
      setDurationOptions(result);
    };
  
    fetchDuration();
  }, [selectedSlot, selectedDate]);
  
  
  const slotsForDate = selectedDate && consultMode !== "now"
  ? (() => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      const localDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      );

      // Ensure that the correct day is being selected
      const selectedDayIndex = localDate.getDay();
      const selectedDayName = days[selectedDayIndex];

      const daySlots = availableSlots.filter(slot => slot.dayOfWeek === selectedDayName);

      console.log(daySlots)

      const generatedSlots = [];
      for (const slot of daySlots) {
        const [startH, startM] = slot.startTime.split(':').map(Number);
        const [endH, endM] = slot.endTime.split(':').map(Number);

        let current = new Date(localDate);
        current.setHours(startH, startM, 0, 0);

        const endDate = new Date(localDate);
        endDate.setHours(endH, endM, 0, 0);

        while (current < endDate) {
          generatedSlots.push({id:slot._id, timeSlot: current.toTimeString().slice(0, 5)});
          current = new Date(current.getTime() + 30 * 60000);
        }
      }

      return generatedSlots;
    })()
  : [];

  // const handleChange = (e) => {
  //   const { name, value } = e.target
  //   console.log(value)
  //   setFormData({ ...formData, [name]: name === 'duration' ? parseInt(value) : value })
  // }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
      type: "general"
    }

    router.push(`/consultation/book/review?data=${encodeURIComponent(JSON.stringify(payload))}`)
  }

  return (
    <div className="flex justify-center px-4 py-8">
      <div className="w-full max-w-3xl mb-8">
        <div className="mb-8">
          {/* MODE SELECTOR */}
          <div className="mb-6 flex justify-center gap-4">
            <button
              type="button"
              onClick={() => setConsultMode('appointment')}
              className={`px-4 py-2 rounded-md font-semibold border transition ${
                consultMode === 'appointment'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              Book Appointment
            </button>
            <button
              type="button"
              onClick={() => setConsultMode('now')}
              className={`px-4 py-2 rounded-md font-semibold border transition ${
                consultMode === 'now'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              Consult Now
            </button>
          </div>
      
          {/* CALENDAR AND SLOT SELECTION (ONLY FOR APPOINTMENTS) */}
          {consultMode === 'appointment' && (
            <>
              <p className="mt-4 text-lg text-gray-600">
                Select a date and time for your consultation.
              </p>
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,dayGridWeek',
                }}
                height="auto"
                selectable={true}
                selectMirror={true}
                dateClick={(info) => {
                  const clickedDate = new Date(info.dateStr);
                  setSelectedDate(clickedDate);
                }}
                validRange={{ start: new Date().toISOString().split('T')[0] }}
              />
      
              {selectedDate && (
                <div className="mt-6 p-4 bg-white rounded-md shadow">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    Available Time Slots for {selectedDate.toDateString()}:
                  </h3>
      
                  {slotsForDate.length === 0 ? (
                    <p className="text-sm text-gray-500">No slots available for this day.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {slotsForDate.map((slot, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setSelectedSlot(slot);
                          }}
                          className={`px-4 py-2 rounded-md border ${
                            selectedSlot === slot.timeSlot
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {slot.timeSlot}
                        </button>
                      ))}
                    </div>
                  )}
      
                  {selectedSlot && (
                    <p className="mt-4 text-sm text-gray-700">
                      Selected Time: <span className="font-medium">{selectedSlot.timeSlot}</span>
                    </p>
                  )}
                </div>
              )}
            </>
          )}
      
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
            <form className="space-y-6 bg-white p-6 rounded-xl shadow">
              {consultMode === "now" ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
                  {[15, 30, 40, 60].map((min) => {
                    const isActive = formData.duration === min.toString();
                    const price = min * 2; // Customize pricing logic
                    return (
                      <div
                        key={min}
                        onClick={() => handleChange({ target: { name: "duration", value: min.toString() } })}
                        className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 ${
                          isActive
                            ? "bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-400"
                            : "bg-white text-gray-900 border-gray-200 hover:shadow-md hover:border-indigo-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-bold">{min} Minutes</h4>
                          {isActive && <CheckCircleIcon className="w-5 h-5 text-white" />}
                        </div>
                
                        <div className="mt-4 flex items-center gap-2 text-sm">
                          <ClockIcon className="w-4 h-4" />
                          <span>{min} mins session</span>
                        </div>
                
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <DollarSignIcon className="w-4 h-4" />
                          <span>${price.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
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
                    disabled={consultMode === "appointment" && !selectedSlot}
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
              )}
              <div className="text-sm text-gray-700">
                Estimated Cost:{' '}
                <span className="font-semibold text-gray-900">${calculatedCost}</span>
              </div>
      
              <div>
                <button
                  type="submit"
                  disabled={submitting || (consultMode === 'appointment' && !selectedSlot)}
                  className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                  onClick={() => handleConfirm()}
                >
                  {submitting ? 'Submitting...' : 'Pay Now'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
