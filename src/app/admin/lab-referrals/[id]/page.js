"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { fetchData, postData, updateData } from "@/utils/api";
import Image from "next/image";
import { useToast } from "@/context/ToastContext";
import { useSession } from "next-auth/react";
import { toPng } from "html-to-image";
import LabSelectionModal from "@/components/LabSelectionModal";

const LabReferralReceipt = () => {
  const { id } = useParams();
  const [appointmentSession, setAppointmentSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [disableDownload, setDisableDownload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showLabModal, setShowLabModal] = useState(false);
  const receiptRef = useRef();

  const { data: session, status } = useSession();
  const token = session?.user?.jwt;
  const role = session?.user?.role;
  const { addToast } = useToast();

  const isSpecialist = role === "specialist";
  const isLabAdmin = role === "labAdmin";

  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await fetchData(`video-sessions/${id}`, token);
        setAppointmentSession(res.session);
      } catch (error) {
        console.error(error);
        addToast("Failed to load referral", "error");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated" && id && token) {
      loadSession();
    }
  }, [status, id, token]);

  const waitForImagesToLoad = (element) => {
    const images = element.querySelectorAll("img");
    const promises = Array.from(images).map((img) => {
      if (!img.complete || img.naturalWidth === 0) {
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }
    });
    return Promise.all(promises);
  };

  const handleDownload = async () => {
    setDisableDownload(true);
    if (!receiptRef.current) return;

    try {
      await waitForImagesToLoad(receiptRef.current);

      const dataUrl = await toPng(receiptRef.current, {
        quality: 1,
        cacheBust: true,
      });

      const link = document.createElement("a");
      link.download = "lab-referral.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image:", err);
      addToast("Failed to download image", "error");
    } finally {
      setDisableDownload(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadResult = async () => {
    if (!selectedFile || !appointmentSession) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("result", selectedFile);
      formData.append("sessionId", id);

      const result = await updateData(
        `lab-results/referrals/${appointmentSession.id}`,
        formData,
        token,
        true
      );

      if (result.success) {
        addToast("Result uploaded successfully", "success");
      } else {
        addToast("Upload failed", "error");
      }
    } catch (error) {
      console.error("Upload error:", error);
      addToast("Error uploading result", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSendToLab = async (labId) => {
    try {
      const res = await postData(
        "video-sessions/send-to-lab",
        { sessionId: id, labId },
        token
      );
      if (res.success) {
        addToast("Referral sent to lab successfully", "success");
        setShowLabModal(false);
      } else {
        addToast("Failed to send referral", "error");
      }
    } catch (error) {
      console.error("Send to lab error:", error);
      addToast("Error sending to lab", "error");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading referral...</p>;
  if (!appointmentSession)
    return <p className="text-center mt-10">Referral not found.</p>;

  return (
    <div className="relative p-6 max-w-3xl mx-auto shadow-xl rounded-lg mt-8 bg-white dark:bg-gray-900 dark:text-gray-300 border border-gray-200">
      <div ref={receiptRef} className="relative bg-white dark:bg-gray-900 dark:text-gray-300 p-6 rounded-lg">
        <div className="text-center mb-4">
          <Image
            src="/images/logo/logo.png"
            alt="Logo"
            width={120}
            height={120}
            className="mx-auto mb-2"
          />
          <h2 className="text-xl font-semibold">Laboratory Referral</h2>
        </div>

        <div className="mb-20">
          <div className="mb-4">
            <p>
              <strong>Doctor:</strong>{" "}
              {appointmentSession.specialist?.firstName}{" "}
              {appointmentSession.specialist?.lastName}
            </p>
            <p>
              <strong>Patient:</strong> {appointmentSession.user?.firstName}{" "}
              {appointmentSession.user?.lastName}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(appointmentSession.createdAt).toLocaleString()}
            </p>
          </div>

          {appointmentSession.labReferrals?.map((referral, index) => (
            <div key={index} className="border-t pt-4 mb-4">
              <p>
                <strong>Test Name:</strong> {referral.testName}
              </p>
              {referral.labName && (
                <p>
                  <strong>Lab:</strong> {referral.labName}
                </p>
              )}
              {referral.note && (
                <p>
                  <strong>Note:</strong> {referral.note}
                </p>
              )}
              <p>
                <strong>Status:</strong> {referral.status}
              </p>
              <p>
                <strong>Referral Date:</strong>{" "}
                {new Date(referral.referralDate).toLocaleString()}
              </p>
            </div>
          ))}

          {appointmentSession.labResultFile && (
            <div className="mt-4 text-blue-600 underline">
              <a
                href={appointmentSession.labResultFile}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Uploaded Lab Result
              </a>
            </div>
          )}

          <div className="mt-6 text-right">
            {appointmentSession.specialist?.signature ? (
              <img
                src={`${process.env.NEXT_PUBLIC_NODE_BASE_URL}${appointmentSession.specialist.signature}`}
                alt="Doctor's Signature"
                width={180}
                height={80}
                className="inline-block"
                crossOrigin="anonymous"
              />
            ) : (
              <p className="italic text-sm text-gray-500">
                No signature uploaded.
              </p>
            )}
            <p className="italic text-sm">
              Dr. {appointmentSession.specialist?.firstName}{" "}
              {appointmentSession.specialist?.lastName}
            </p>
            <p className="italic text-sm">
              Reg. NO: {appointmentSession.specialist?.licenseNumber}
            </p>
          </div>
        </div>

        {!disableDownload && (
          <div className="mt-6 flex flex-col items-center gap-4 print:hidden">
            <button
              onClick={handleDownload}
              className="bg-amber-600 text-white px-6 py-2 rounded hover:bg-amber-700"
              disabled={disableDownload}
            >
              {disableDownload ? "Generating..." : "Download Referral"}
            </button>

            {isSpecialist && (
              <button
                onClick={() => setShowLabModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Send to Lab
              </button>
            )}

            {isLabAdmin && (
              <div className="flex flex-col items-center gap-2">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="border p-2 rounded"
                />
                <button
                  onClick={handleUploadResult}
                  disabled={uploading || !selectedFile}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  {uploading ? "Uploading..." : "Upload Result"}
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      <LabSelectionModal
        isOpen={showLabModal}
        onClose={() => setShowLabModal(false)}
        token={token}
        sessionId={id}
        user={appointmentSession?.user}
        onSuccess={() => {
          setShowLabModal(false);
        }}
      />
    </div>
  );
};

export default LabReferralReceipt;
