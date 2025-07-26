"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetchData, updateData } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";

const EditConsultationAppointmentPage = () => {
  const [form, setForm] = useState({
    patient: "",
    consultant: "",
    date: "",
    duration: "",
    type: "medicalTourism",
    status: "pending"
  });

  const [patients, setPatients] = useState([]);
  const [consultants, setConsultants] = useState([]);

  const router = useRouter();
  const { id } = useParams();
  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const { addToast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersRes, appointmentRes] = await Promise.all([
          fetchData("users/get-all/no-pagination", token),
          fetchData(`consultation-appointments/get/custom/${id}`, token),
        ]);

        const patientsList = usersRes.filter((user) => (user.role === "user" || user.role === "patient"));
        const consultantsList = usersRes.filter((user) => (user.role === "consultant" || user.role === "specialist" || user.role === "admin"));

        setPatients(patientsList);
        setConsultants(consultantsList);

        // console.log(appointmentRes)

        if (appointmentRes) {
          setForm({
            patient: appointmentRes.patient?._id || "",
            consultant: appointmentRes.consultant?._id || "",
            date: appointmentRes.date ? appointmentRes.date.slice(0, 16) : "",
            duration: appointmentRes.duration?.toString() || "",
            type: appointmentRes.type || "medicalTourism",
            status: appointmentRes.status || "pending", // add this
          });
        }
      } catch (err) {
        console.error("Error loading data", err);
        addToast("Failed to load appointment data", "error");
      }
    };

    if (token && id) {
      loadData();
    }
  }, [token, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatePayload = {
        consultant: form.consultant,
        date: form.date,
        duration: parseInt(form.duration),
        status: form.status, // include status
      };
      await updateData(`consultation-appointments/${id}`, updatePayload, token);
      addToast("Appointment updated successfully!", "success");
      router.push("/admin/medical-tourism/consultations/appointments");
    } catch (err) {
      console.error("Error updating appointment:", err);
      addToast("Failed to update appointment", "error");
    }
  };

  const getUserDisplayName = (userId) => {
    const user = patients.find((u) => u._id === userId);
    return user ? `${user.firstName} ${user.lastName} (${user.email})` : "";
  };

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 shadow">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Edit Consultation Appointment</h1>
        <Link
          href="/admin/medical-tourism/consultations/appointments"
          className="text-indigo-600 hover:underline"
        >
          Back
        </Link>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Patient (Read-only) */}
        <div>
          <label className="block font-medium mb-1">Patient</label>
          <input
            type="text"
            value={getUserDisplayName(form.patient)}
            disabled
            className="w-full border px-3 py-2 rounded bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
          />
        </div>

        {/* Consultant */}
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
                {user.firstName} {user.lastName} ({user.email})
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
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

        {/* Duration */}
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

        {/* Type */}
        <div>
          <label className="block font-medium mb-1">Type</label>
          <input
            type="text"
            name="type"
            value={form.type}
            disabled
            className="w-full border px-3 py-2 rounded bg-gray-100 text-gray-500 dark:bg-gray-800"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block font-medium mb-1">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded text-gray-600 dark:bg-gray-900 dark:text-gray-300"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>


        <button
          type="submit"
          className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700 transition"
        >
          Update Appointment
        </button>
      </form>
    </div>
  );
};

export default EditConsultationAppointmentPage;
