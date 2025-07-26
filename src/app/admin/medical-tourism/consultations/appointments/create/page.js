"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/context/ToastContext";
import { postData, fetchData } from "@/utils/api";
import Link from "next/link";

const CreateConsultationAppointmentPage = () => {
  const [form, setForm] = useState({
    patient: "",
    consultant: "",
    date: "",
    duration: "", // 🔹 Added duration field
    type: "medicalTourism"
  });

  const [patients, setPatients] = useState([]);
  const [consultants, setConsultants] = useState([]);

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
    try {
      await postData("consultation-appointments/create/custom", form, token);
      addToast("Appointment booked successfully!", "success");
      router.push("/admin/medical-tourism/consultations/appointments");
    } catch (error) {
      console.error(error);
      addToast("Failed to book appointment", "error");
    }
  };

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const patientRes = await fetchData("users/get-all/no-pagination", token);
        const consultantRes = await fetchData("users/get-all/no-pagination", token);
        setPatients(patientRes || []);
        setConsultants(consultantRes || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    if (token) loadUsers();
  }, [token]);

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 shadow">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Book Consultation Appointment</h1>
        <Link href="/admin/medical-tourism/appointments" className="text-indigo-600 hover:underline">
          Back
        </Link>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-medium mb-1">Patient</label>
          <select
            name="patient"
            value={form.patient}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded text-gray-600 dark:bg-gray-900 dark:text-gray-300"
          >
            <option value="">Select Patient</option>
            {patients.map((user) => (
              <option key={user._id} value={user._id}>
                {user.firstName + " " + user.lastName} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Consultant</label>
          <select
            name="consultant"
            value={form.consultant}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded text-gray-600 dark:bg-gray-900 dark:text-gray-300"
          >
            <option value="">Select Consultant</option>
            {consultants.map((user) => (
              <option key={user._id} value={user._id}>
                {user.firstName + " " + user.lastName} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Date & Time</label>
          <input
            type="datetime-local"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded text-gray-600 dark:bg-gray-900 dark:text-gray-300"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Duration (minutes)</label>
          <input
            type="number"
            name="duration"
            value={form.duration}
            onChange={handleChange}
            required
            min="5"
            className="w-full border px-3 py-2 rounded text-gray-600 dark:bg-gray-900 dark:text-gray-300"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange} // assuming you have a generic handleChange function
            className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-800 dark:text-white"
          >
            <option value="">Select Type</option> {/* Optional placeholder */}
            <option value="general">General</option>
            <option value="medicalTourism">Medical Tourism</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700 transition"
        >
          Book Appointment
        </button>
      </form>
    </div>
  );
};

export default CreateConsultationAppointmentPage;
