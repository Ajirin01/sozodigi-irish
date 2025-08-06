"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { fetchData } from "@/utils/api";
import Image from "next/image";
import { useToast } from "@/context/ToastContext";
import { useSession } from "next-auth/react";
import { toPng } from "html-to-image";

const PrescriptionReceipt = () => {
  const { id } = useParams();
  const [appointmentSession, setAppointmentSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const [ disableDownload, setDisableDownload ] = useState(false)

  const receiptRef = useRef();

  const { data: session, status } = useSession();
  const token = session?.user?.jwt;

  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await fetchData(`video-sessions/${id}`, token);
        setAppointmentSession(res.session);
      } catch (error) {
        console.error(error);
        addToast("Failed to load prescription", "error");
      } finally {
        setLoading(false);
      }
    };
  
    if (status === "authenticated" && id && token) {
      loadSession();
    }
  }, [status, id, token]);  

  const handleDownload = async () => {
    setDisableDownload(true)
    if (!receiptRef.current) return;

    try {
      const dataUrl = await toPng(receiptRef.current, {
        quality: 1,
        cacheBust: true,
      });

      const link = document.createElement("a");
      link.download = "prescription.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image:", err);
      addToast("Failed to download image", "error");
    }finally{
        setDisableDownload(false)
    }
  };

  if (loading) return <p className="text-center mt-10">Loading prescription...</p>;

  if (!appointmentSession) return <p className="text-center mt-10">Prescription not found.</p>;

  return (
    <div className="relative p-6 max-w-3xl mx-auto bg-white shadow-xl rounded-lg mt-8 print:bg-white print:shadow-none print:p-0">
      <div ref={receiptRef} className="relative p-6 max-w-3xl mx-auto bg-white  rounded-lg mt-8">
            {/* Watermark Logo */}
            {/* <div className="absolute inset-0 opacity-10 z-0 flex items-center justify-center pointer-events-none print:hidden">
                <Image src="/images/logo/logo.png" alt="Logo watermark" width={300} height={300} />
            </div> */}

            {/* Header Logo */}
            <div className="text-center mb-4 z-10 relative">
                <Image src="/images/logo/logo.png" alt="Logo" width={120} height={120} className="mx-auto mb-2" />
                <p>11 The Avenue Folkstown Park. <br /> Balbriggan Co Dublin.</p>

                <br />
                <h2 className="text-xl font-semibold">Medical Prescription</h2>

            </div>

            <div className="z-10 relative mb-20">
                <div className="mb-4">
                <p><strong>Doctor:</strong> {appointmentSession.specialist?.firstName} {appointmentSession.specialist?.lastName}</p>
                <p><strong>Patient:</strong> {appointmentSession.user?.firstName} {appointmentSession.user?.lastName}</p>
                <p>{appointmentSession.user?.address?.street} <br/> {appointmentSession.user?.address?.city} <br/> {appointmentSession.user?.address?.state} <br /> {appointmentSession.user?.phone}</p>
                <p><strong>DOB</strong>: {appointmentSession.user?.DOB}</p>
                <p><strong>Date:</strong> {new Date(appointmentSession.createdAt).toLocaleString()}</p>
                </div>

                {appointmentSession.prescriptions.map((prescription, index) => (
                <div key={index} className="border-t pt-4 mb-4">
                    <p><strong>Medication:</strong> {prescription.medication}</p>
                    <p><strong>Dosage:</strong> {prescription.dosage}</p>
                    <p><strong>Instructions:</strong> {prescription.frequency}</p>
                </div>
                ))}

                {/* Doctor's signature */}
                <div className="mt-6 text-right">
                <img
                    src={`${process.env.NEXT_PUBLIC_NODE_BASE_URL}${appointmentSession.specialist?.signature}`}
                    alt="Doctor's Signature"
                    width={180}
                    height={80}
                    className="inline-block"
                />
                <p className="italic text-sm">Dr. {appointmentSession.specialist?.firstName} {appointmentSession.specialist?.lastName}</p>
                <p className="italic text-sm">Reg. NO:  {appointmentSession.specialist?.licenseNumber}</p>
              </div>

            </div>

            {/* Print button */}
            { !disableDownload && <div className="mt-6 text-center print:hidden">
                <button
                    onClick={handleDownload}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                    Download Prescription
                </button>
            </div>}
      </div>
    </div>
  );
};

export default PrescriptionReceipt;
