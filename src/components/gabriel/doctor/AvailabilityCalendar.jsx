import React, { useState } from 'react';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const AvailabilityCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState('weekly');

  const addTimeSlot = () => {
    setTimeSlots([
      ...timeSlots,
      { startTime: '', endTime: '', isBooked: false }
    ]);
  };

  const removeTimeSlot = (index) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index, field, value) => {
    const newTimeSlots = [...timeSlots];
    newTimeSlots[index][field] = value;
    setTimeSlots(newTimeSlots);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/appointments/availability', {
        date: selectedDate,
        timeSlots,
        isRecurring,
        recurringPattern: isRecurring ? recurringPattern : null
      });

      if (response.data.success) {
        toast.success('Availability set successfully');
        setTimeSlots([]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error setting availability');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Set Your Availability</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            minDate={new Date()}
            className="rounded-lg shadow-md"
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recurring Availability
              </label>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2">Set as recurring</span>
                </label>
              </div>
            </div>

            {isRecurring && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recurring Pattern
                </label>
                <select
                  value={recurringPattern}
                  onChange={(e) => setRecurringPattern(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Slots
              </label>
              {timeSlots.map((slot, index) => (
                <div key={index} className="flex items-center space-x-4 mb-2">
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <span>to</span>
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeTimeSlot(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addTimeSlot}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                + Add Time Slot
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save Availability
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar; 