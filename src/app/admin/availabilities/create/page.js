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

  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const router = useRouter();
  const { addToast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const [startHour, startMinute] = form.startTime.split(":").map(Number);
    const [endHour, endMinute] = form.endTime.split(":").map(Number);

    const start = new Date();
    start.setHours(startHour, startMinute, 0, 0);
    const end = new Date();
    end.setHours(endHour, endMinute, 0, 0);

    const diffMs = end - start;
    const diffMins = diffMs / (1000 * 60);

    if (diffMins < 10) {
      addToast(
        diffMins < 0
          ? "End time must be after start time."
          : "Availability must be at least 10 minutes.",
        "error"
      );
      setSubmitting(false);
      return;
    }

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

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Set Consultant Availability</h1>
        <Link
          href="/admin/medical-tourism/consultations/availability"
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

        {/* Type Selector */}
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
            <label className="block mb-1 font-medium">Day of the Week</label>
            <select
              name="dayOfWeek"
              value={form.dayOfWeek}
              onChange={handleChange}
              required
              className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-800 dark:text-gray-200"
            >
              <option value="">Select Day</option>
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                (day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                )
              )}
            </select>
          </div>
        ) : (
          <div>
            <label className="block mb-1 font-medium">Select Date</label>
            <DatePicker
              selected={form.date}
              onChange={(date) => setForm((prev) => ({ ...prev, date }))}
              dateFormat="MMMM d, yyyy"
              className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-800 dark:text-gray-200"
            />
          </div>
        )}

        {/* Time Range Pickers */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Start Time</label>
            <TimePicker
              value={form.startTime}
              onChange={(value) => setForm((prev) => ({ ...prev, startTime: value }))}
              disableClock
              className="w-full"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">End Time</label>
            <TimePicker
              value={form.endTime}
              onChange={(value) => setForm((prev) => ({ ...prev, endTime: value }))}
              disableClock
              className="w-full"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className={`w-full ${
            submitting ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
          } text-white py-2 rounded font-medium transition`}
        >
          {submitting ? "Creating..." : "Create Availability"}
        </button>
      </form>
    </div>
  );
};

export default CreateConsultantAvailabilityPage;
