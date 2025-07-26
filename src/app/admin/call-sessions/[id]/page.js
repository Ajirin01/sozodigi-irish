"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetchData, updateData } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";

const SessionDetailsPage = () => {
  const { id } = useParams();
  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const { addToast } = useToast();

  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [form, setForm] = useState({
    prescriptions: [],
    labReferrals: [],
    sessionNotes: "",
  });

  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await fetchData(`video-sessions/${id}`, token);
        setSessionData(res.session);
        setForm({
          prescriptions: res.session.prescriptions || [],
          labReferrals: res.session.labReferrals || [],
          sessionNotes: res.session.sessionNotes || "",
        });
      } catch (error) {
        console.error(error);
        addToast("Failed to load session", "error");
      } finally {
        setLoading(false);
      }
    };
    if (id && token) loadSession();
  }, [id, token]);

  const handleChange = (index, field, value, type) => {
    const updated = [...form[type]];
    updated[index][field] = value;
    setForm({ ...form, [type]: updated });
  };

  const addNewField = (type) => {
    const newField =
      type === "prescriptions"
        ? { medication: "", dosage: "", frequency: "" }
        : { testName: "", labName: "", note: "", status: "pending" };
    setForm({ ...form, [type]: [...form[type], newField] });
  };

  const removeField = (type, index) => {
    const updated = form[type].filter((_, i) => i !== index);
    setForm({ ...form, [type]: updated });
  };

  const updateSession = async () => {
    setUpdating(true);
    try {
      await updateData(
        `video-sessions/${id}`,
        {
          ...sessionData,
          prescriptions: form.prescriptions,
          labReferrals: form.labReferrals,
          sessionNotes: form.sessionNotes,
        },
        token
      );
      addToast("Session updated successfully", "success");
    } catch (error) {
      console.error(error);
      addToast("Failed to update session", "error");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p>Loading session details...</p>;

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 dark:text-gray-200 p-6 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Manage Session</h1>

      <div className="mb-4">
        <p>
          <strong>Doctor:</strong> {sessionData.specialist?.firstName}{" "}
          {sessionData.specialist?.lastName}
        </p>
        <p>
          <strong>Patient:</strong> {sessionData.user?.firstName}{" "}
          {sessionData.user?.lastName}
        </p>
        <p>
          <strong>Created:</strong>{" "}
          {new Date(sessionData.createdAt).toLocaleString()}
        </p>
      </div>

      {/* Session Notes */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Session Notes</h2>
        <textarea
          className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
          rows={5}
          placeholder="Enter session notes..."
          value={form.sessionNotes}
          onChange={(e) => setForm({ ...form, sessionNotes: e.target.value })}
        />
      </div>

      {/* Prescriptions */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Prescriptions</h2>
        {form.prescriptions.map((p, i) => (
          <div key={i} className="mb-3 grid grid-cols-3 gap-2 items-center">
            <input
              type="text"
              className="input"
              placeholder="Medication"
              value={p.medication}
              onChange={(e) =>
                handleChange(i, "medication", e.target.value, "prescriptions")
              }
            />
            <input
              type="text"
              className="input"
              placeholder="Dosage"
              value={p.dosage}
              onChange={(e) =>
                handleChange(i, "dosage", e.target.value, "prescriptions")
              }
            />
            <div className="flex gap-2">
              <input
                type="text"
                className="input"
                placeholder="Frequency"
                value={p.frequency}
                onChange={(e) =>
                  handleChange(i, "frequency", e.target.value, "prescriptions")
                }
              />
              <button
                onClick={() => removeField("prescriptions", i)}
                className="text-red-600"
              >
                ×
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() => addNewField("prescriptions")}
          className="text-blue-600 mt-2"
        >
          + Add Prescription
        </button>
        <div className="mt-2">
          <Link
            href={`/admin/doctor-prescriptions/${id}`}
            target="_blank"
            className="text-indigo-600 underline text-sm"
          >
            📄 Preview Prescription Sheet
          </Link>
        </div>
      </div>

      {/* Lab Referrals */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Lab Referrals</h2>
        {form.labReferrals.map((r, i) => (
          <div key={i} className="mb-3 grid grid-cols-4 gap-2 items-center">
            <input
              type="text"
              className="input"
              placeholder="Test Name"
              value={r.testName}
              onChange={(e) =>
                handleChange(i, "testName", e.target.value, "labReferrals")
              }
            />
            <input
              type="text"
              className="input"
              placeholder="Lab Name"
              value={r.labName}
              onChange={(e) =>
                handleChange(i, "labName", e.target.value, "labReferrals")
              }
            />
            <input
              type="text"
              className="input"
              placeholder="Note"
              value={r.note}
              onChange={(e) =>
                handleChange(i, "note", e.target.value, "labReferrals")
              }
            />
            <div className="flex gap-2">
              <select
                className="input"
                value={r.status}
                onChange={(e) =>
                  handleChange(i, "status", e.target.value, "labReferrals")
                }
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={() => removeField("labReferrals", i)}
                className="text-red-600"
              >
                ×
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() => addNewField("labReferrals")}
          className="text-blue-600 mt-2"
        >
          + Add Lab Referral
        </button>
        <div className="mt-2">
          <Link
            href={`/admin/lab-referrals/${id}`}
            target="_blank"
            className="text-indigo-600 underline text-sm"
          >
            📄 Preview Referral Sheet
          </Link>
        </div>
      </div>

      {/* Update Button */}
      <button
        onClick={updateSession}
        disabled={updating}
        className="bg-indigo-600 text-white px-6 py-2 rounded"
      >
        {updating ? "Updating..." : "Update Session"}
      </button>
    </div>
  );
};

export default SessionDetailsPage;
