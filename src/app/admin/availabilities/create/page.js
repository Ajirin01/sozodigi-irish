"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/context/ToastContext";
import { postData } from "@/utils/api";
import Link from "next/link";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import { FaClock } from "react-icons/fa";

const CreateConsultantAvailabilityPage = () => {
  const [form, setForm] = useState({
    type: "recurring",
    category: "general",
    dayOfWeek: "",
    date: new Date(),
    startTime: "09:00",
    endTime: "17:00",
  });

  const [submitting, setSubmitting] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(15);

  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const router = useRouter();
  const { addToast } = useToast();

  const calculateEndTime = (startTime, duration) => {
    if (!startTime) return "17:00";
    const [hours, minutes] = startTime.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    date.setMinutes(date.getMinutes() + duration);
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const newForm = { ...prev, [name]: value };
      if (name === "category" && value === "cert") {
        setSelectedDuration(15);
        newForm.endTime = calculateEndTime(prev.startTime, 15);
      }
      return newForm;
    });
  };

  const handleStartTimeChange = (value) => {
    setForm((prev) => ({
      ...prev,
      startTime: value,
      endTime: calculateEndTime(value, selectedDuration),
    }));
  };

  const handleDurationChange = (duration) => {
    setSelectedDuration(duration);
    setForm((prev) => ({
      ...prev,
      endTime: calculateEndTime(prev.startTime, duration),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      user: session?.user?.id,
      type: form.type,
      startTime: form.startTime,
      endTime: form.endTime,
      category: form.category,
      ...(form.type === "recurring"
        ? { dayOfWeek: form.dayOfWeek }
        : { date: form.date }),
    };

    try {
      await postData("availabilities/create/custom", payload, token);
      addToast("Availability created successfully!", "success");
      router.push("/admin/availabilities");
    } catch (error) {
      console.error(error);
      addToast(error.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const durationOptions = [15, 30, 45];

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Set Consultant Availability</h1>
        <Link
          href="/admin/availabilities"
          className="text-sm text-indigo-600 hover:underline"
        >
          Back
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type Selector */}
        <div>
          <label className="block mb-1 font-medium">Availability Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-800 dark:text-gray-200"
          >
            <option value="recurring">Recurring (weekly)</option>
            <option value="one-time">One-Time</option>
          </select>
        </div>

        {/* Category Selector */}
        <div>
          <label className="block mb-1 font-medium">Consultation Reason <br/> (<small className="text-red-500">Note: No action required if consultation is not for medical certificate</small>)</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-800 dark:text-gray-200"
          >
            <option value="general">General Consultation</option>
            <option value="cert">Medical Certificate Consultation</option>
          </select>
        </div>

        {/* Conditional Field */}
        {form.type === "recurring" ? (
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Day of the Week</label>
            <select
              name="dayOfWeek"
              value={form.dayOfWeek}
              onChange={handleChange}
              required
              className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700"
            >
              <option value="" className="dark:bg-gray-800">Select Day</option>
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                (day) => (
                  <option key={day} value={day} className="dark:bg-gray-800">
                    {day}
                  </option>
                )
              )}
            </select>
          </div>
        ) : (
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Select Date</label>
            <DatePicker
              selected={form.date}
              onChange={(date) => setForm((prev) => ({ ...prev, date }))}
              dateFormat="MMMM d, yyyy"
              className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700"
            />
          </div>
        )}

        {/* Time Selection Section */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-6">
          <div>
            <label className="block mb-2 font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <FaClock className="text-indigo-500" /> Select Start Time
            </label>
            <div className="grid grid-cols-2 gap-2 p-2 bg-white dark:bg-gray-800 border-2 border-indigo-100 dark:border-gray-700 rounded-xl shadow-inner">
              <select 
                value={form.startTime.split(':')[0]}
                onChange={(e) => {
                  const mins = form.startTime.split(':')[1];
                  handleStartTimeChange(`${e.target.value}:${mins}`);
                }}
                className="bg-transparent font-black text-2xl py-2 outline-none text-center appearance-none cursor-pointer hover:text-indigo-600 dark:text-gray-100 dark:hover:text-indigo-400"
              >
                {Array.from({length: 24}).map((_, i) => (
                  <option key={i} value={String(i).padStart(2, '0')} className="dark:bg-gray-800">
                    {String(i).padStart(2, '0')}
                  </option>
                ))}
              </select>
              <select 
                value={form.startTime.split(':')[1]}
                onChange={(e) => {
                  const hours = form.startTime.split(':')[0];
                  handleStartTimeChange(`${hours}:${e.target.value}`);
                }}
                className="bg-transparent font-black text-2xl py-2 outline-none text-center appearance-none cursor-pointer hover:text-indigo-600 dark:text-gray-100 dark:hover:text-indigo-400 border-l border-indigo-50 dark:border-gray-700"
              >
                {['00', '15', '30', '45'].map(m => (
                  <option key={m} value={m} className="dark:bg-gray-800">{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-3 font-bold text-gray-700 dark:text-gray-300">Choose Duration</label>
            <div className="grid grid-cols-3 gap-3">
              {durationOptions
                .filter(opt => form.category === 'cert' ? opt === 15 : true)
                .map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleDurationChange(opt)}
                  className={`py-4 rounded-xl font-black text-sm transition-all border-2 flex flex-col items-center gap-1 ${
                    selectedDuration === opt 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105' 
                      : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                  }`}
                >
                  <span className="text-xl">
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-4 rounded-xl font-black text-lg shadow-xl shadow-indigo-200 dark:shadow-none transition-all ${
            submitting 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1 active:scale-95 text-white"
          }`}
        >
          {submitting ? "Creating..." : "Create Availability"}
        </button>
      </form>
    </div>
  );
};

export default CreateConsultantAvailabilityPage;
