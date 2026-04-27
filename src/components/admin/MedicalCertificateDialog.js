import React, { useState } from 'react';
import Dialog from './Dialog';
import { postData, fetchData } from '@/utils/api';
import { useToast } from '@/context/ToastContext';
import { FaSignature, FaFileMedical } from 'react-icons/fa';

const MedicalCertificateDialog = ({
  show,
  onClose,
  appointment,
  session,
  token,
   specialistEmail
}) => {
  const [diagnosis, setDiagnosis] = useState(appointment?.illness || "");
  const [comment, setComment] = useState(appointment?.reason || "");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  if (!show) return null;

  const generateCertID = () => {
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `CH-${new Date().getFullYear()}-${rand}`;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const certID = generateCertID();
      
      // Fetch specialist signature
      const doctorData = await fetchData(`users/get/by-email?email=${specialistEmail}`, token);
      const doctorSignature = doctorData?.signature || "";

      const payload = {
        appointment: appointment._id,
        session: session?._id || null,
        patient: appointment.patient?._id || appointment.patient || appointment.user?._id || appointment.user,
        doctor: appointment.consultant?._id || appointment.consultant || appointment.specialist?._id || appointment.specialist,
        diagnosis,
        comment,
        certID,
        doctorSignature
      };

      const res = await postData("certificates/create", payload, token);
      if (res?.certificate && res?.certificate?._id) {
        addToast("Certificate created successfully!", "success");
        onClose();
      } else {
        addToast(res?.message || "Certificate creation failed.", "error");
      }
    } catch (error) {
      console.error("Certificate creation error:", error);
      addToast("Something went wrong while creating the certificate.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog title="Issue Medical Certificate" onClose={onClose}>
      <div className="space-y-4">
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-center gap-3">
          <FaFileMedical className="text-blue-600" />
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase">Patient</p>
            <p className="text-sm font-bold text-gray-800">
               {appointment.user?.firstName} {appointment.user?.lastName}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Diagnosis</label>
          <input
            type="text"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="e.g. Severe Migraine"
            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Comments / Recommendations</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Describe condition and rest period..."
            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2 ${
            loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Generating..." : <><FaSignature /> Generate Certificate</>}
        </button>
      </div>
    </Dialog>
  );
};

export default MedicalCertificateDialog;
