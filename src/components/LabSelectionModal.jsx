"use client";

import { useEffect, useState } from "react";
import { fetchData, postData } from "@/utils/api";
import { useToast } from "@/context/ToastContext";

const LabSelectionModal = ({ isOpen, onClose, token, sessionId, user, onSuccess }) => {
  const { addToast } = useToast();
  const [labs, setLabs] = useState([]);
  const [filters, setFilters] = useState({ country: "", state: "", city: "" });
  const [selectedLab, setSelectedLab] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen) loadLabs();
  }, [isOpen, filters]);

  const loadLabs = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await fetchData(`laboratories/get-all/no-pagination?${query}`, token);
      setLabs(res.labs || []);
    } catch (err) {
      console.error("Failed to load labs", err);
      addToast("Failed to load labs", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedLab) return addToast("Select a lab to proceed", "error");

    try {
      setSending(true);
      await postData(
        "lab-results/refer/send-to-lab",
        {
          session: sessionId,
          patient: user._id,
          lab: selectedLab?._id,
        },
        token
      );

      addToast("Referral sent to lab and patient", "success");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Failed to send to lab", err);
      addToast("Error sending referral", "error");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
      <div className="bg-white rounded p-6 w-full max-w-2xl shadow-lg">
        <h2 className="text-xl font-bold mb-4">Select a Laboratory</h2>

        {/* Filter controls */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Country"
            value={filters.country}
            onChange={(e) => setFilters({ ...filters, country: e.target.value })}
            className="border p-2 rounded w-1/3"
          />
          <input
            type="text"
            placeholder="State"
            value={filters.state}
            onChange={(e) => setFilters({ ...filters, state: e.target.value })}
            className="border p-2 rounded w-1/3"
          />
          <input
            type="text"
            placeholder="City"
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className="border p-2 rounded w-1/3"
          />
        </div>

        {/* Labs list */}
        <div className="max-h-60 overflow-y-auto border rounded mb-4">
          {loading ? (
            <p className="p-4">Loading labs...</p>
          ) : labs.length ? (
            labs.map((lab) => (
              <div
                key={lab._id}
                onClick={() => setSelectedLab(lab)}
                className={`p-3 border-b hover:bg-gray-100 cursor-pointer ${
                  selectedLab?._id === lab._id ? "bg-blue-100" : ""
                }`}
              >
                <p className="font-medium">{lab.name}</p>
                <p className="text-sm text-gray-600">
                  {lab.address?.city || "—"}, {lab.address?.state || "—"}, {lab.address?.country || "—"}
                </p>
              </div>
            ))
          ) : (
            <p className="p-4">No labs found</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            disabled={!selectedLab || sending}
          >
            {sending ? "Sending..." : "Send to Lab" }
          </button>
        </div>
      </div>
    </div>
  );
};

export default LabSelectionModal;
