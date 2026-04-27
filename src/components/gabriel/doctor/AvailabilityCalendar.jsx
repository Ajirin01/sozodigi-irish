import React, { useState } from 'react';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { toast } from 'react-toastify';

import { FaPlus, FaTrash, FaCalendarAlt, FaClock, FaExclamationTriangle } from 'react-icons/fa';

const AvailabilityCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState('weekly');
  const [loading, setLoading] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(15);

  const addTimeSlot = () => {
    setTimeSlots([
      ...timeSlots,
      { startTime: '', endTime: '', duration: selectedDuration, isBooked: false }
    ]);
  };

  const removeTimeSlot = (index) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const calculateEndTime = (startTime, duration) => {
    if (!startTime) return '';
    const [hours, minutes] = startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    date.setMinutes(date.getMinutes() + duration);
    return date.toTimeString().slice(0, 5);
  };

  const isOverlapping = (start1, end1, start2, end2) => {
    if (!start1 || !end1 || !start2 || !end2) return false;
    return start1 < end2 && start2 < end1;
  };

  const checkClashes = (slots) => {
    return slots.map((slot, i) => {
      const hasClash = slots.some((otherSlot, j) => {
        if (i === j) return false;
        return isOverlapping(slot.startTime, slot.endTime, otherSlot.startTime, otherSlot.endTime);
      });
      return { ...slot, hasClash };
    });
  };

  const updateTimeSlot = (index, field, value) => {
    let newTimeSlots = [...timeSlots];
    if (field === 'startTime') {
      newTimeSlots[index].startTime = value;
      newTimeSlots[index].endTime = calculateEndTime(value, newTimeSlots[index].duration);
    } else if (field === 'duration') {
      newTimeSlots[index].duration = value;
      newTimeSlots[index].endTime = calculateEndTime(newTimeSlots[index].startTime, value);
    }
    
    newTimeSlots = checkClashes(newTimeSlots);
    setTimeSlots(newTimeSlots);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (timeSlots.length === 0) {
      toast.error('Please add at least one time slot');
      return;
    }

    setLoading(true);
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
      console.error('Error setting availability:', error);
      toast.error(error.response?.data?.message || 'Error setting availability');
    } finally {
      setLoading(false);
    }
  };

  const durationOptions = [15, 30, 45];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen rounded-3xl mt-8 transition-colors">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Side: Calendar and Recurring Settings */}
        <div className="w-full md:w-1/2 space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-[32px] shadow-xl border border-gray-100 dark:border-gray-800 transition-all hover:shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-3">
              <FaCalendarAlt className="text-blue-600" /> Select Date
            </h2>
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              minDate={new Date()}
              className="!w-full !border-none !rounded-2xl !font-sans overflow-hidden dark:!bg-gray-900 dark:!text-gray-200"
            />
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-[32px] shadow-xl border border-gray-100 dark:border-gray-800 transition-all hover:shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Recurring Options</h3>
            <label className="flex items-center gap-3 p-3 rounded-2xl hover:bg-blue-50 dark:hover:bg-gray-800 cursor-pointer transition-colors border-2 border-transparent hover:border-blue-500">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded-lg focus:ring-blue-500 bg-transparent"
              />
              <span className="text-gray-700 dark:text-gray-300 font-semibold">Make this a recurring availability</span>
            </label>

            {isRecurring && (
              <div className="mt-4 animate-fadeIn">
                <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 ml-2 mb-2">Repeat Interval</label>
                <select
                  value={recurringPattern}
                  onChange={(e) => setRecurringPattern(e.target.value)}
                  className="w-full p-4 border-[3px] border-blue-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="weekly">Every Week</option>
                  <option value="biweekly">Every 2 Weeks</option>
                  <option value="monthly">Every Month</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Time Slots */}
        <div className="w-full md:w-1/2">
          <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-[32px] shadow-xl border border-gray-100 dark:border-gray-800 h-full flex flex-col transition-all hover:shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-3 text-blue-900">
              <FaClock className="text-blue-600" /> Set Time Slots
            </h2>
            
            <div className="flex-1 space-y-4 mb-8 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
              {timeSlots.length === 0 ? (
                <div className="text-center py-12 bg-blue-50 dark:bg-gray-900 rounded-2xl border-2 border-dashed border-blue-200 dark:border-gray-800">
                  <p className="text-blue-700 dark:text-blue-400 font-medium">No time slots added yet</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Click the button below to start building your schedule</p>
                </div>
              ) : (
                timeSlots.map((slot, index) => (
                  <div key={index} className={`p-6 bg-white dark:bg-gray-800 rounded-[24px] border-2 transition-all hover:shadow-xl animate-slideIn group relative overflow-hidden ${
                    slot.hasClash ? 'border-red-400 bg-red-50/10' : 'border-blue-100 dark:border-gray-700 hover:border-blue-500'
                  }`}>
                    <div className={`absolute top-0 left-0 w-2 h-full ${slot.hasClash ? 'bg-red-500' : 'bg-blue-600'}`}></div>
                    
                    {slot.hasClash && (
                      <div className="absolute top-2 left-4 flex items-center gap-1 text-red-600 bg-white/80 dark:bg-gray-900/80 px-2 py-0.5 rounded-full text-[10px] font-black z-10 border border-red-100 dark:border-red-900 shadow-sm">
                        <FaExclamationTriangle size={8} /> CLASH DETECTED
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center gap-6 mt-2">
                      <div className="w-full sm:w-1/3">
                        <label className="text-xs font-black text-blue-900 dark:text-blue-400 uppercase tracking-wider mb-2 block ml-1">
                          <FaClock className="inline mr-1" /> Start Time
                        </label>
                        
                        {/* Custom Time Grid Picker */}
                        <div className="relative group/picker">
                          <div className="grid grid-cols-2 gap-1 p-1 bg-gray-50 dark:bg-gray-900/50 border-2 border-blue-50 dark:border-gray-700 rounded-2xl shadow-inner">
                            <select 
                              value={slot.startTime ? slot.startTime.split(':')[0] : '09'}
                              onChange={(e) => {
                                const mins = slot.startTime ? slot.startTime.split(':')[1] : '00';
                                updateTimeSlot(index, 'startTime', `${e.target.value}:${mins}`);
                              }}
                              className="bg-transparent font-black text-xl p-2 outline-none text-center appearance-none cursor-pointer hover:text-blue-600 dark:text-gray-100"
                            >
                              {Array.from({length: 24}).map((_, i) => (
                                <option key={i} value={String(i).padStart(2, '0')} className="bg-white dark:bg-gray-800">
                                  {String(i).padStart(2, '0')}
                                </option>
                              ))}
                            </select>
                            <select 
                              value={slot.startTime ? slot.startTime.split(':')[1] : '00'}
                              onChange={(e) => {
                                const hours = slot.startTime ? slot.startTime.split(':')[0] : '09';
                                updateTimeSlot(index, 'startTime', `${hours}:${e.target.value}`);
                              }}
                              className="bg-transparent font-black text-xl p-2 outline-none text-center appearance-none cursor-pointer hover:text-blue-600 border-l border-blue-50 dark:border-gray-700"
                            >
                              {['00', '15', '30', '45'].map(m => (
                                <option key={m} value={m} className="bg-white dark:bg-gray-800">{m}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-full sm:w-2/3">
                        <label className="text-xs font-black text-blue-900 dark:text-blue-400 uppercase tracking-wider mb-2 block ml-1">Select Duration</label>
                        <div className="grid grid-cols-3 gap-3">
                          {durationOptions.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => updateTimeSlot(index, 'duration', opt)}
                              className={`relative overflow-hidden py-4 rounded-2xl font-black text-sm transition-all border-2 flex flex-col items-center justify-center gap-1 ${
                                slot.duration === opt 
                                  ? 'bg-gradient-to-br from-blue-600 to-blue-800 text-white border-blue-600 shadow-lg scale-105 z-10' 
                                  : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50/30'
                              }`}
                            >
                              <span className={`text-xl ${slot.duration === opt ? 'text-white' : 'text-blue-300'}`}>
                                {opt === 15 && '⚡'}
                                {opt === 30 && '🕒'}
                                {opt === 45 && '⏳'}
                              </span>
                              {opt} mins
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeTimeSlot(index)}
                      className="absolute top-4 right-4 text-gray-200 dark:text-gray-600 hover:text-red-500 transition-colors p-2"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={addTimeSlot}
                className="w-full py-4 border-2 border-dashed border-blue-500 dark:border-blue-800 text-blue-700 dark:text-blue-400 font-bold rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-center gap-2 group"
              >
                <FaPlus className="group-hover:rotate-90 transition-transform" /> Add New Slot
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || timeSlots.length === 0}
                className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-extrabold text-xl rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
              >
                {loading ? 'Saving Schedule...' : 'Save Availability'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar; 