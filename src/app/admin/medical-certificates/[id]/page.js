"use client"
import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { fetchData } from "@/utils/api"
import { useSession } from "next-auth/react"
import { useToast } from "@/context/ToastContext"
import MedicalCertificateComponent from "@/components/MedicalCertificate"

const MedicalCertificatePage = () => {
  const { id } = useParams()
  const [certificate, setCertificate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sendingEmail, setSendingEmail] = useState(false)

  const { data: session } = useSession()
  const token = session?.user?.jwt
  const { addToast } = useToast()

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const res = await fetchData(`certificates/custom/get/${id}`, token)
        setCertificate(res)
      } catch (error) {
        console.error("Failed to load certificate:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id && token) fetchCertificate()
  }, [id, token])

  const handleSendEmail = async () => {
    setSendingEmail(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_NODE_BASE_URL}/medical-tourism/certificates/send-email/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        addToast('Certificate emailed to patient successfully! 📧', 'success');
      } else {
        addToast(data.message || 'Failed to send email.', 'error');
      }
    } catch (error) {
      addToast('An error occurred while sending email.', 'error');
    } finally {
      setSendingEmail(false)
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>;
  
  if (!certificate) return <div className="text-center py-20 text-red-500 font-bold">Certificate not found.</div>

  const canSendEmail = ["admin", "superAdmin", "specialist"].includes(session?.user?.role);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-y-auto pb-10">
      <div className="max-w-4xl mx-auto pt-10">
        <div className="flex flex-col items-end mb-6 px-4 print:hidden">
          <div className="flex gap-4">
            {canSendEmail && (
              <button 
                onClick={handleSendEmail}
                disabled={sendingEmail}
                className={`${sendingEmail ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700'} text-white px-6 py-2 rounded-xl font-bold transition-colors shadow-lg flex items-center gap-2`}
              >
                {sendingEmail ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div> Sending...</>
                ) : (
                  'Send to Patient Email'
                )}
              </button>
            )}
            <button 
              onClick={() => window.print()}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg"
            >
              Print Certificate
            </button>
          </div>
        </div>
        
        <MedicalCertificateComponent
          patientName={`${certificate.patient?.firstName} ${certificate.patient?.lastName}`}
          issueDate={certificate.issueDate}
          diagnosis={certificate.diagnosis}
          comment={certificate.comment}
          doctor={`${certificate.doctor?.firstName} ${certificate.doctor?.lastName}`}
          patientID={certificate.patient?._id}
          certID={certificate.certID}
          qrCodeUrl={certificate.qrCodeUrl}
          doctorSignature={certificate.doctorSignature}
        />
      </div>
    </div>
  )
}

export default MedicalCertificatePage
