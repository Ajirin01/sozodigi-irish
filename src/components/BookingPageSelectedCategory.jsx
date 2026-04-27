'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { fetchData, postData } from '@/utils/api'
import { useUser } from '@/context/UserContext'
import { useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useToast } from '@/context/ToastContext'

import { useSelector, useDispatch } from "react-redux";
import ModalContainer from "@/components/gabriel/ModalContainer";

import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { format, isToday, startOfToday } from 'date-fns'
import BookingInstructions from '@/components/BookingInstructions'
import getMinutesDifference from '@/utils/getMinutesDifference'
import { 
  setPrice,
  setSpecialist,
  setDuration,
  setConsultMode,
  setSlot,
  resetBooking, 
  setAppointmentDate} from '@/store/specialistSlice'

import {
  PricingModal,
  CheckoutModal,
  FindSpecialistModal,j
} from "@/components/gabriel";

import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)


const ConsultationBookingPageContent = ({showSpecialistCategories, selectedCategory}) => {
  const dispatch = useDispatch();

  // console.log(!showSpecialistCategories)
  
  const specialist = useSelector((state) => state.specialist.specialist);
  const price = useSelector((state) => state.specialist.price);
  const duration = useSelector((state) => state.specialist.duration);

  const appointmentDate = useSelector(
    (state) => state.specialist.appointmentDate
  );

  
  const router = useRouter()

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const [slotSummary, setSlotSummary] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const startOfTodayVal = new Date();
  startOfTodayVal.setHours(0, 0, 0, 0);

  const [mounted, setMounted] = useState(false)
  const { user } = useUser()
  const { addToast } = useToast()
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const token = session?.user?.jwt

  const [selectedDate, setSelectedDate] = useState(startOfTodayVal)
  const [startOfTodayDate, setStartOfTodayDate] = useState(startOfTodayVal);
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [reason, setReason] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [loadingBooking, setLoadingBooking] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)

  const [categories, setCategories] = useState([])
  // const [selectedCategory, setSelectedCategory] = useState(null)
  const [specialistsByCategory, setSpecialistsByCategory] = useState([])

  const COST_PER_MINUTE = 2

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setStartOfTodayDate(today);
    setSelectedDate(today);
    setCurrentMonth(today);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (token) fetchSpecialistsByCategory()
  }, [token])

  useEffect(() => {
    if(showSpecialistCategories){
      if (token && selectedDate && specialistsByCategory.length > 0) {
        fetchAvailableSlots()
      }
    }else{
      if (token && selectedDate) {
        fetchAvailableSlots()
      }
    }
    
  }, [selectedDate, specialistsByCategory, token])

  const fetchSpecialistsByCategory = async () => {
    setLoadingCategories(true);
    try {
      const res = await fetchData('users/get-all/doctors/no-pagination', token);

      const filteredSpecialists = res.filter(
        specialist => specialist.specialty === selectedCategory
      );

      setSpecialistsByCategory(filteredSpecialists); // Directly set the filtered list

    } catch (err) {
      console.error('Failed to load specialists:', err);
      addToast('Could not load specialists for this category.', 'error');
    } finally {
      setLoadingCategories(false);
    }
  };

  
  const fetchAvailableSlots = async () => {
    setLoadingSlots(true);
    setAvailableSlots([]);
  
    try {
      const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const selectedDayName = weekdays[selectedDate.getDay()];
      const selectedDateString = selectedDate.toISOString().split('T')[0];
  
      const allSlots = [];
  
      // 1. Fetch appointments for selected date
      const appointmentRes = await fetchData(
        `consultation-appointments/all/no/pagination/?dateFrom=${selectedDateString}&dateTo=${selectedDateString}`,
        token
      );
      const bookedAppointments = appointmentRes || [];
  
      // 2. Create a set of booked slot IDs for fast lookup
      const bookedSlotIds = new Set(
        bookedAppointments.map((appointment) => appointment.slot?._id)
      );
  
      // 3. Loop through all specialists in the selected category
      for (const specialist of specialistsByCategory) {
        const res = await fetchData(
          `availabilities/slots/by?userRole=specialist&consultantId=${specialist._id}&isBooked=false`,
          token
        );
  
        const filtered = res.data.filter((slot) => {
          const slotId = slot._id;
          if (bookedSlotIds.has(slotId)) return false; // Exclude already booked slots
  
          if (!showSpecialistCategories && !selectedCategory) {
            if (slot.category !== "cert") return false;
  
            if (slot.type === 'recurring') {
              return slot.dayOfWeek === selectedDayName;
            } else if (slot.type === 'one-time') {
              return new Date(slot.date).toISOString().split('T')[0] === selectedDateString;
            }
          } else {
            if (slot.category !== "general") return false;
  
            if (slot.type === 'recurring') {
              return slot.dayOfWeek === selectedDayName;
            } else if (slot.type === 'one-time') {
              const parsedDate = format(new Date(slot.date), 'yyyy-MM-dd');
              const rawDateString = typeof slot.date === 'string' ? slot.date.substring(0, 10) : parsedDate;
              return parsedDate === selectedDateString || rawDateString === selectedDateString;
            }
          }
  
          return false;
        });

        // Filter out slots that have already passed if the date is today
        const now = new Date();
        const finalFiltered = filtered.filter((slot) => {
          if (!isToday(selectedDate)) return true; // Only filter if it's today
          
          const [hours, minutes] = slot.startTime.split(':');
          const slotStartTime = new Date(selectedDate);
          slotStartTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          
          if (slotStartTime <= now) return false;

          return true;
        });
  
        finalFiltered.forEach((slot) => {
          allSlots.push({ ...slot, consultant: specialist });
        });
      }
  
      setAvailableSlots(allSlots);
    } catch (err) {
      console.error('Error fetching slots:', err);
      addToast('Failed to load slots', 'error');
    } finally {
      setLoadingSlots(false);
    }
  };

  const fetchSlotSummary = async (month) => {
    if (!token) return;
    try {
      const year = month.getFullYear();
      const monthIdx = month.getMonth();
      const startDate = `${year}-${String(monthIdx + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(year, monthIdx + 1, 0).getDate();
      const endDate = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      
      const category = "general"; // For Finding Specialists by category
      
      const res = await fetchData(
        `availabilities/summary/slots?startDate=${startDate}&endDate=${endDate}&category=${category}`,
        token
      );
      if (res && res.success) {
        setSlotSummary(res.summary || {});
      }
    } catch (err) {
      console.error('Error fetching slot summary:', err);
    }
  };

  useEffect(() => {
    fetchSlotSummary(currentMonth);
  }, [token, currentMonth, selectedCategory]);
  

  if (!mounted) return null

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const selectedDayName = weekdays[selectedDate.getDay()]

  const openCheckoutModal = (price, duration) => {
    console.log(price)
    dispatch(setPrice(price));
    dispatch(setDuration(duration));
    setModalContent("checkoutModal");
    dispatch(setConsultMode("appointment"));
    dispatch(setSpecialist(selectedSlot.consultant))
    dispatch(setAppointmentDate(selectedDate.toISOString()))
    dispatch(setSlot(selectedSlot))
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalContent(null);
    dispatch(resetBooking());
  };

  if(!session){
    router.push("/login")
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-0">
      <h2 className="text-2xl font-bold mb-2">Book {selectedCategory} Consultation Appointment</h2>
      <BookingInstructions showSpecialistCategories={showSpecialistCategories} />

      <div className={`grid grid-cols-1 lg:grid-cols-2 [${showSpecialistCategories ? 'lg:grid-cols-3' : ''}] gap-3`}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Date for your Appointment
          </label>
          <div className="mb-2 font-semibold text-lg text-gray-700">
            {selectedDayName}, {selectedDate.toLocaleDateString()}
          </div>
          <div className="react-calendar-container bg-white p-4 rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <Calendar
              onChange={(value) => {
                if (value instanceof Date) setSelectedDate(value)
              }}
              value={selectedDate}
              minDate={startOfTodayDate}
              onActiveStartDateChange={({ activeStartDate }) => {
                if (activeStartDate) setCurrentMonth(activeStartDate)
              }}
              tileContent={({ date, view }) => {
                if (view !== 'month') return null;
                
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const dayNum = String(date.getDate()).padStart(2, '0');
                const dateKey = `${year}-${month}-${dayNum}`;
                const count = slotSummary[dateKey] || 0;

                if (count === 0) return null;

                return (
                  <span 
                    className="absolute flex items-center justify-center bg-red-600 text-white font-bold rounded-full border border-white shadow-sm z-50"
                    style={{
                      width: '18px',
                      height: '18px',
                      fontSize: '10px',
                      top: '2px',
                      right: '2px'
                    }}
                  >
                    {count}
                  </span>
                );
              }}
              className="border-none w-full"
            />
            <style jsx global>{`
              .react-calendar {
                border: none !important;
                font-family: inherit !important;
                width: 100% !important;
              }
              .react-calendar__tile {
                position: relative !important;
                height: 50px !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
                border-radius: 8px !important;
              }
              .react-calendar__tile--now {
                background: #e0e7ff !important;
                color: #4f46e5 !important;
                font-weight: bold !important;
              }
              .react-calendar__tile--active {
                background: #4f46e5 !important;
                color: white !important;
              }
              .react-calendar__navigation button {
                font-weight: bold !important;
                color: #374151 !important;
              }
              .react-calendar__month-view__weekdays__weekday {
                text-decoration: none !important;
                font-weight: bold !important;
                font-size: 0.8rem !important;
                color: #6b7280 !important;
              }
            `}</style>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          {loadingSlots ? (
            <div className="flex justify-center items-center h-32">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : availableSlots.length > 0 ? (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-800">
                Available Time Slots for {selectedDate.toLocaleDateString()}
              </h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {availableSlots.map((slot) => (
                  <div
                    key={slot._id}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedSlot?._id === slot._id 
                        ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200' 
                        : 'hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-gray-800">{slot.startTime} - {slot.endTime}</span>
                      <span className="text-xs font-medium px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                        ${(!showSpecialistCategories && price) ? price : getMinutesDifference(slot.startTime, slot.endTime) * COST_PER_MINUTE}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Consultant: {slot.consultant.firstName} {slot.consultant.lastName}
                    </div>
                  </div>
                ))}
              </div>

              {selectedSlot && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Appointment</label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      disabled={selectedSlot?.category === "cert"}
                      placeholder="Please describe why you are booking this consultation..."
                      className={`block w-full border-gray-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 ${
                        selectedSlot?.category === "cert" ? "bg-gray-50 cursor-not-allowed text-gray-500" : ""
                      }`}
                    />
                  </div>
                  <button
                    onClick={() => openCheckoutModal(
                      (!showSpecialistCategories && price) ? price : getMinutesDifference(selectedSlot.startTime, selectedSlot.endTime) * COST_PER_MINUTE,
                      getMinutesDifference(selectedSlot.startTime, selectedSlot.endTime)
                    )}
                    disabled={!selectedSlot || !reason || loadingBooking}
                    className="w-full bg-indigo-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                  >
                    {loadingBooking ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      'Book Appointment Now'
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="font-medium text-gray-600">No available slots for the selected date.</p>
              <p className="mt-2 text-sm text-gray-400">Please try another date or contact support.</p>
            </div>
          )}
        </div>

        {showModal && modalContent === "checkoutModal" && selectedSlot.consultant && (
          <ModalContainer
            modal={
              <Elements stripe={stripePromise}>
                <CheckoutModal
                  closeModal={closeModal}
                  amount={price}
                  currency="USD"
                  duration={duration}
                  date={new Date(selectedSlot.date)}
                  consultMode="appointment"
                />
              </Elements>
            }
          />
        )}
      </div>
    </div>
  )
}

export default ConsultationBookingPageContent
