"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetchData, postData } from "@/utils/api";
import { useToast } from "@/context/ToastContext";

const CreateConsultationDocumentation = () => {
  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const router = useRouter();
  const { addToast } = useToast();

  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({
    appointment: "",
    notes: "",
    document: null,
  });

  useEffect(() => {
    const loadAppointments = async () => {
      const res = await fetchData("consultation-appointments/get/all/simple", token);
      setAppointments(res.data || []);
    };
    if (token) loadAppointments();
  }, [token]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "document") {
      setForm((prev) => ({ ...prev, document: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.appointment || !form.document) {
      addToast("Please fill in all required fields", "error");
      return;
    }

    const formData = new FormData();
    formData.append("appointment", form.appointment);
    formData.append("notes", form.notes);
    formData.append("document", form.document);

    try {
      await postData("consultation-documents/create/custom", formData, token, true);
      addToast("Documentation created successfully", "success");
      router.push("/admin/medical-tourism/consultations/documentations");
    } catch (err) {
      addToast("Failed to create documentation", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow p-6">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
        Add Consultation Documentation
      </h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Appointment dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Appointment <span className="text-red-500">*</span>
          </label>
          <select
            name="appointment"
            value={form.appointment}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-900 dark:text-gray-300 shadow-sm text-sm"
            required
          >
            <option value="">Select appointment</option>
            {appointments.map((appt) => (
              <option key={appt._id} value={appt._id}>
                {appt.patient?.firstName} {appt.patient?.lastName} – {new Date(appt.date).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
            rows={4}
            placeholder="Optional notes..."
          />
        </div>

        {/* Document upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Upload Document <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            name="document"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleChange}
            className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 shadow-sm"
            required
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 text-gray-800 text-sm rounded shadow hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded shadow hover:bg-indigo-700"
          >
            Save Documentation
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateConsultationDocumentation;
