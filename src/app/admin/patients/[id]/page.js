"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { fetchData } from "@/utils/api";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  FaUser, FaEnvelope, FaPhone, FaVideo, FaFileMedical,
  FaPrescriptionBottleAlt, FaFlask, FaArrowLeft
} from "react-icons/fa";

const apiUrl = process.env.NEXT_PUBLIC_NODE_BASE_URL;

const tabs = [
  { key: "overview", label: "Overview" },
  { key: "sessions", label: "Call Sessions" },
  { key: "certificates", label: "Certificates" },
  { key: "prescriptions", label: "Prescriptions" },
  { key: "lab-referrals", label: "Lab Referrals" },
];

const PatientDetailPage = () => {
  const { id } = useParams();
  const { data: session } = useSession();
  const token = session?.user?.jwt;

  const [activeTab, setActiveTab] = useState("overview");
  const [patient, setPatient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labReferrals, setLabReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token || !id) return;
    const load = async () => {
      try {
        const [p, s, c, pr, lr] = await Promise.all([
          fetchData(`users/${id}`, token),
          fetchData(`video-sessions/by-user/${id}`, token).catch(() => []),
          fetchData(`certificates/by-patient/${id}`, token).catch(() => []),
          fetchData(`video-sessions/by-user/${id}/prescriptions`, token).catch(() => []),
          fetchData(`video-sessions/by-user/${id}/lab-referrals`, token).catch(() => []),
        ]);
        setPatient(p);
        setSessions(Array.isArray(s) ? s : s?.sessions || []);
        setCertificates(Array.isArray(c) ? c : []);
        setPrescriptions(Array.isArray(pr) ? pr : []);
        setLabReferrals(Array.isArray(lr) ? lr : []);
      } catch (e) {
        console.error(e);
        setError(e.message || "Failed to load patient details. You might not have permission to view this record.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, id]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
    </div>
  );

  if (!patient) return (
    <div className="text-center py-20 text-red-500 font-bold">Patient not found.</div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back */}
        <Link href="/admin/patients" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold mb-6">
          <FaArrowLeft /> Back to Patients
        </Link>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Patient Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {patient.profileImage ? (
            <img src={`${apiUrl}${patient.profileImage}`} alt="" className="w-20 h-20 rounded-full object-cover border-4 border-blue-100" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center border-4 border-blue-100">
              <FaUser className="text-blue-400 text-3xl" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{patient.firstName} {patient.lastName}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
              {patient.email && <span className="flex items-center gap-1"><FaEnvelope />{patient.email}</span>}
              {patient.phone && <span className="flex items-center gap-1"><FaPhone />{patient.phone}</span>}
            </div>
            {patient.DOB && <p className="text-sm text-gray-400 mt-1">DOB: {new Date(patient.DOB).toLocaleDateString()}</p>}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            {[
              { icon: <FaVideo />, label: "Sessions", count: sessions.length, color: "bg-blue-50 text-blue-700" },
              { icon: <FaFileMedical />, label: "Certificates", count: certificates.length, color: "bg-emerald-50 text-emerald-700" },
              { icon: <FaPrescriptionBottleAlt />, label: "Prescriptions", count: prescriptions.length, color: "bg-purple-50 text-purple-700" },
              { icon: <FaFlask />, label: "Lab Referrals", count: labReferrals.length, color: "bg-amber-50 text-amber-700" },
            ].map(s => (
              <div key={s.label} className={`rounded-xl px-4 py-3 text-center ${s.color}`}>
                <div className="text-xl mb-1">{s.icon}</div>
                <div className="text-2xl font-extrabold">{s.count}</div>
                <div className="text-xs font-semibold">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-1 mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Panels */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">

          {/* Overview */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Patient Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "First Name", value: patient.firstName },
                  { label: "Last Name", value: patient.lastName },
                  { label: "Email", value: patient.email },
                  { label: "Phone", value: patient.phone || "—" },
                  { label: "Date of Birth", value: patient.DOB ? new Date(patient.DOB).toLocaleDateString() : "—" },
                  { label: "Gender", value: patient.gender || "—" },
                  { label: "Address", value: patient.address ? `${patient.address.street || ""} ${patient.address.city || ""} ${patient.address.state || ""}`.trim() : "—" },
                  { label: "Nationality", value: patient.nationality || "—" },
                  { label: "Account Status", value: patient.isVerified ? "Verified" : "Unverified" },
                  { label: "Member Since", value: new Date(patient.createdAt).toLocaleDateString() },
                ].map(field => (
                  <div key={field.label} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{field.label}</p>
                    <p className="font-semibold text-gray-800 dark:text-white">{field.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Call Sessions */}
          {activeTab === "sessions" && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Call Sessions ({sessions.length} total)</h2>
              {sessions.length === 0 ? (
                <p className="text-gray-400 text-center py-10">No sessions found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-gray-100 dark:border-gray-700">
                        <th className="pb-3 font-bold text-gray-500">Date</th>
                        <th className="pb-3 font-bold text-gray-500">Specialist</th>
                        <th className="pb-3 font-bold text-gray-500">Status</th>
                        <th className="pb-3 font-bold text-gray-500">Duration</th>
                        <th className="pb-3 font-bold text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                      {sessions.map(s => (
                        <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="py-3 text-gray-700 dark:text-gray-300">{new Date(s.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 text-gray-700 dark:text-gray-300">{s.specialist?.firstName} {s.specialist?.lastName}</td>
                          <td className="py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${s.endTime ? "bg-gray-100 text-gray-600" : "bg-emerald-100 text-emerald-700"}`}>
                              {s.endTime ? "Ended" : "Active"}
                            </span>
                          </td>
                          <td className="py-3 text-gray-500 font-medium">{s.durationInMinutes ? `${s.durationInMinutes}m` : "—"}</td>
                          <td className="py-3">
                            <Link href={`/admin/call-sessions/${s._id}`} className="text-blue-600 hover:underline text-xs font-semibold">View</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Certificates */}
          {activeTab === "certificates" && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Medical Certificates ({certificates.length} total)</h2>
              {certificates.length === 0 ? (
                <p className="text-gray-400 text-center py-10">No certificates found.</p>
              ) : (
                <div className="space-y-3">
                  {certificates.map(c => (
                    <div key={c._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600">
                      <div>
                        <p className="font-bold text-gray-800 dark:text-white">{c.certID}</p>
                        <p className="text-sm text-gray-500">Issued: {new Date(c.issueDate).toLocaleDateString()} · Dr. {c.doctor?.firstName} {c.doctor?.lastName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 italic">"{c.diagnosis}"</p>
                      </div>
                      <Link href={`/admin/medical-certificates/${c._id}`} className="ml-4 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shrink-0">
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Prescriptions */}
          {activeTab === "prescriptions" && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Prescription History ({prescriptions.length} total)</h2>
              {prescriptions.length === 0 ? (
                <p className="text-gray-400 text-center py-10">No prescriptions found.</p>
              ) : (
                <div className="space-y-3">
                  {prescriptions.map((session, si) => (
                    session.prescriptions?.map((rx, ri) => (
                      <div key={`${si}-${ri}`} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-bold text-gray-800 dark:text-white">{rx.medication}</p>
                          <span className="text-xs text-gray-400">{new Date(session.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Dosage: <strong>{rx.dosage}</strong></p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Instructions: {rx.frequency}</p>
                        <p className="text-xs text-gray-400 mt-1">Dr. {session.specialist?.firstName} {session.specialist?.lastName}</p>
                      </div>
                    ))
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Lab Referrals */}
          {activeTab === "lab-referrals" && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Lab Referral History ({labReferrals.length} total)</h2>
              {labReferrals.length === 0 ? (
                <p className="text-gray-400 text-center py-10">No lab referrals found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-gray-100 dark:border-gray-700">
                        <th className="pb-3 font-bold text-gray-500">Test</th>
                        <th className="pb-3 font-bold text-gray-500">Notes</th>
                        <th className="pb-3 font-bold text-gray-500">Date</th>
                        <th className="pb-3 font-bold text-gray-500">Status</th>
                        <th className="pb-3 font-bold text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                      {labReferrals.map(lr => (
                        <tr key={lr._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="py-3 font-semibold text-gray-800 dark:text-white">{lr.testName || lr.test || "Lab Test"}</td>
                          <td className="py-3 text-gray-500">{lr.notes || "—"}</td>
                          <td className="py-3 text-gray-500">{new Date(lr.createdAt || lr.date).toLocaleDateString()}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              lr.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                            }`}>
                              {lr.status || "pending"}
                            </span>
                          </td>
                          <td className="py-3">
                            <Link href={`/admin/lab-referrals/${lr._id}`} className="text-blue-600 hover:underline text-xs font-semibold">View</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetailPage;
