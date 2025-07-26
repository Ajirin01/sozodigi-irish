import React, { useState, useEffect } from 'react';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const BookAppointment = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch available specialties
    const fetchSpecialties = async () => {
      try {
        const response = await axios.get('/api/specialties');
        setSpecialties(response.data.data);
      } catch (error) {
        toast.error('Error fetching specialties');
      }
    };
    fetchSpecialties();
  }, []);

  useEffect(() => {
    if (selectedSpecialty && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedSpecialty, selectedDate]);

  const fetchAvailableSlots = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/appointments/available-slots', {
        params: {
          specialty: selectedSpecialty,
          date: selectedDate.toISOString().split('T')[0],
        },
      });
      setAvailableSlots(response.data.data);
    } catch (error) {
      toast.error('Error fetching available slots');
    }
    setLoading(false);
  };

  const handleBookAppointment = async () => {
    if (!selectedSlot || !reason) {
      toast.error('Please select a time slot and provide a reason');
      return;
    }

    try {
      const response = await axios.post('/api/appointments/book', {
        availabilityId: selectedSlot._id,
        timeSlotIndex: selectedSlot.timeSlotIndex,
        reason,
      });

      if (response.data.success) {
        toast.success('Appointment booked successfully');
        // Reset form
        setSelectedSlot(null);
        setReason('');
        // Refresh available slots
        fetchAvailableSlots();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error booking appointment');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Book an Appointment</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Specialty
            </label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a specialty</option>
              {specialties.map((specialty) => (
                <option key={specialty._id} value={specialty.name}>
                  {specialty.name}
                </option>
              ))}
            </select>
          </div>

          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            minDate={new Date()}
            className="rounded-lg shadow-md"
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          {loading ? (
            <div className="text-center">Loading available slots...</div>
          ) : availableSlots.length > 0 ? (
            <>
              <h3 className="text-lg font-medium mb-4">Available Time Slots</h3>
              <div className="space-y-4">
                {availableSlots.map((slot) => (
                  <div
                    key={slot._id}
                    className={`p-4 border rounded-md cursor-pointer ${
                      selectedSlot?._id === slot._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <div className="font-medium">
                      Dr. {slot.doctor.firstName} {slot.doctor.lastName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(slot.date).toLocaleDateString()} at{' '}
                      {slot.timeSlots[0].startTime} - {slot.timeSlots[0].endTime}
                    </div>
                  </div>
                ))}
              </div>

              {selectedSlot && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Visit
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows="3"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Please describe your reason for the visit"
                  />
                </div>
              )}

              <button
                onClick={handleBookAppointment}
                disabled={!selectedSlot || !reason}
                className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Book Appointment
              </button>
            </>
          ) : (
            <div className="text-center text-gray-500">
              {selectedSpecialty ? (
                <>
                  <p>No available slots for the selected date.</p>
                  <p className="mt-2">
                    Please contact our call center at{' '}
                    <a href="tel:+1234567890" className="text-blue-600">
                      +1 (234) 567-890
                    </a>{' '}
                    for assistance.
                  </p>
                </>
              ) : (
                <p>Please select a specialty to view available slots.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookAppointment; 