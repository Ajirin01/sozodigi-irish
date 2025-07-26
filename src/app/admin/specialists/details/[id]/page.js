"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchData, updateData } from "@/utils/api";
import Image from "next/image";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { useSession } from "next-auth/react";
import { useToast } from "@/context/ToastContext";

const SpecialistDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const { addToast } = useToast();

  const [specialist, setSpecialist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusDialog, setStatusDialog] = useState({ open: false, newStatus: null });

  useEffect(() => {
    if (!token || !id) return;
    fetchSpecialist();
  }, [token, id]);

  const fetchSpecialist = async () => {
    try {
      setLoading(true);
      const data = await fetchData(`users/${id}`, token);
      setSpecialist(data);
    } catch (error) {
      console.error("Failed to fetch specialist:", error);
      addToast("Failed to load specialist", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async () => {
    if (!statusDialog.newStatus || !specialist) return;
    try {
      await updateData(`users/${specialist._id}/status`, { status: statusDialog.newStatus }, token);
      setSpecialist({ ...specialist, approvalStatus: statusDialog.newStatus });
      addToast(`Specialist marked as ${statusDialog.newStatus}`, "success");
    } catch (error) {
      addToast("Failed to update status", "error");
      console.error(error);
    } finally {
      setStatusDialog({ open: false, newStatus: null });
    }
  };

  const openStatusDialog = (newStatus) => setStatusDialog({ open: true, newStatus });

  if (loading) return <div className="p-6">Loading specialist data...</div>;
  if (!specialist) return <div className="p-6">Specialist not found.</div>;

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Specialist Detail</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p><strong>Name:</strong> {specialist.firstName} {specialist.lastName}</p>
          <p><strong>Email:</strong> {specialist.email}</p>
          <p><strong>Specialty:</strong> {specialist.specialty}</p>
          <p><strong>Approval Status:</strong> <span className="capitalize">{specialist.approvalStatus}</span></p>
          <p><strong>Bio:</strong> {specialist.bio || "N/A"}</p>
        </div>
        <div>
          <p className="font-semibold mb-2">Uploaded License:</p>
          {specialist.practicingLicense ? (
            <a
              href={`${process.env.NEXT_PUBLIC_NODE_BASE_URL}/${specialist.practicingLicense}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border p-2 bg-gray-50 dark:bg-gray-800 rounded"
            >
              View Document
            </a>
          ) : (
            <p>No license uploaded.</p>
          )}
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => openStatusDialog("approved")}
          className="border border-green-400 text-green-400 py-2 px-4 hover:border-green-600 hover:text-green-600"
        >
          Approve
        </button>
        <button
          onClick={() => openStatusDialog("rejected")}
          className="border border-red-400 text-red-400 py-2 px-4 hover:border-red-600 hover:text-red-600"
        >
          Reject
        </button>
      </div>

      <ConfirmationDialog
        isOpen={statusDialog.open}
        onClose={() => setStatusDialog({ open: false, newStatus: null })}
        onConfirm={updateStatus}
        title="Update Specialist Status"
        message={`Are you sure you want to mark this specialist as ${statusDialog.newStatus}?`}
        confirmText="Yes, update"
        cancelText="Cancel"
      />
    </div>
  );
};

export default SpecialistDetailPage;
