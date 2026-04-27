"use client";
import React, { useState, useEffect } from "react";
import { fetchData, postData } from "@/utils/api";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaFileMedical, FaUser, FaNotesMedical, FaCalendarCheck, FaSignature } from "react-icons/fa";
import { useToast } from "@/context/ToastContext";

const CreateMedicalCertificate = () => {
  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  const appointmentId = searchParams.get("appointment");
  const [appointment, setAppointment] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");

  const [diagnosis, setDiagnosis] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const generateCertID = () => {
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `CH-${new Date().getFullYear()}-${rand}`;
  };

  useEffect(() => {
    if (token) {
      if (appointmentId) {
        fetchAppointment(appointmentId);
      } else {
        fetchCompletedSessions();
      }
    }
  }, [appointmentId, token]);

  const fetchAppointment = async (id) => {
    setFetching(true);
    try {
      const res = await fetchData(`consultation-appointments/get/custom/${id}`, token);
      if (res && res._id) {
        setAppointment(res);
        setDiagnosis(res.illness || "");
        setComment(res.reason || "");
      }
    } catch (error) {
      addToast("Failed to load appointment details.", "error");
    } finally {
      setFetching(false);
    }
  };

  const fetchCompletedSessions = async () => {
    setFetching(true);
    try {
      // Get all sessions for the specialist
      const res = await fetchData(`video-sessions/by-user/all`, token);
      if (res?.success && res.sessions) {
        // Filter out sessions to only include those intended for medical certificate
        const filteredSessions = res.sessions.filter(s => {
           const reason = (s.appointment?.reason || "").toLowerCase();
           return reason.includes("certificate");
        });
        setSessions(filteredSessions);
      }
    } catch (error) {
      addToast("Failed to load sessions.", "error");
    } finally {
      setFetching(false);
    }
  };

  const handleSessionChange = (e) => {
    const sId = e.target.value;
    setSelectedSessionId(sId);
    const selected = sessions.find(s => s._id === sId);
    if (selected) {
      setAppointment(selected.appointment);
      setDiagnosis(selected.appointment?.illness || "");
      setComment(selected.sessionNotes || selected.appointment?.reason || "");
    }
  };

  const handleSubmit = async () => {
    if (!appointment) {
        addToast("Please select a session or appointment.", "error");
        return;
    }

    setLoading(true);

    try {
      const certID = generateCertID();
      const doctorData = await fetchData(`users/get/by-email?email=${session.user.email}`, token);
      const doctorSignature = doctorData?.signature || "";

      const payload = {
        appointment: appointment._id,
        session: selectedSessionId || null,
        patient: appointment.patient?._id || appointment.user?._id,
        doctor: appointment.consultant?._id || appointment.specialist?._id,
        diagnosis,
        comment,
        certID,
        doctorSignature
      };

      const res = await postData("certificates/create", payload, token);
      if (res?.certificate && res?.certificate?._id) {
        addToast("Certificate created successfully!", "success");
        router.push(`/admin/medical-certificates/${res.certificate._id}`);
      } else {
        addToast(res?.message || "Certificate creation failed.", "error");
      }
    } catch (error) {
      addToast("Something went wrong while creating the certificate.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 mt-6">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <FaFileMedical className="text-3xl" />
             </div>
             <div>
               <h1 className="text-2xl font-bold">Issue Medical Certificate</h1>
               <p className="text-blue-100 opacity-90 text-sm">Create a verified medical certificate for your patient.</p>
             </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {!appointmentId && (
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <FaCalendarCheck className="text-blue-500" /> Select Completed Session
              </label>
              <select 
                value={selectedSessionId} 
                onChange={handleSessionChange}
                className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="">-- Choose a session --</option>
                {sessions.map(s => (
                  <option key={s._id} value={s._id}>
                    {new Date(s.createdAt).toLocaleDateString()} - {s.user?.firstName} {s.user?.lastName} ({s.appointment?.reason || "General Consultation"})
                  </option>
                ))}
              </select>
            </div>
          )}

          {appointment && (
            <div className="p-6 bg-blue-50 dark:bg-gray-900/50 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                <FaUser className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Patient</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">
                  {(appointment.patient?.firstName || appointment.user?.firstName) + " " + (appointment.patient?.lastName || appointment.user?.lastName)}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <FaNotesMedical className="text-blue-500" /> Diagnosis
              </label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Severe Migraine, Viral Fever"
                className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white dark:bg-gray-800"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <FaNotesMedical className="text-blue-500" /> Professional Comments / Recommendations
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                placeholder="Describe the medical condition and rest period recommended..."
                className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white dark:bg-gray-800"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleSubmit}
              disabled={loading || !appointment}
              className={`flex-1 py-4 rounded-2xl text-white font-bold text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                loading ? "bg-blue-300 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-200 dark:hover:shadow-none"
              }`}
            >
              {loading ? "Generating Certificate..." : <><FaSignature /> Generate Certificate</>}
            </button>
            <button
              onClick={() => router.back()}
              className="px-8 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMedicalCertificate;
