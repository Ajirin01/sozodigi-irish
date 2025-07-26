"use client"
import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { fetchData } from "@/utils/api"
import { useSession } from "next-auth/react"

const MedicalCertificate = () => {
  const { id } = useParams()
  const [certificate, setCertificate] = useState(null)
  const [loading, setLoading] = useState(true)

  const { data: session } = useSession()
  const token = session?.user?.jwt

  const API_URL = process.env.NEXT_PUBLIC_NODE_BASE_URL

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const res = await fetchData(`certificates/custom/get/${id}`, token)
        // console.log(res)
        setCertificate(res)
      } catch (error) {
        console.error("Failed to load certificate:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id && token) fetchCertificate()
  }, [id, token])

  if (loading) return <div className="text-center py-20">Loading certificate...</div>
  if (!certificate) return <div className="text-center py-20 text-red-500">Certificate not found.</div>

  const {
    diagnosis = "N/A",
    comment = "",
    issueDate,
    certID,
    patient,
    doctor,
    qrCodeUrl
  } = certificate

  const patientName = patient?.firstName+" "+patient?.lastName || "Unknown Patient"
  const patientID = patient?._id || "—"
  const doctorName = doctor?.firstName+" "+doctor?.lastName || "Unknown Doctor"
  const durationMatch = comment.match(/(\d+)\s*day/i)
  const duration = durationMatch ? durationMatch[1] : "a few"

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 py-10 print:p-0 flex justify-center print:bg-white">
      <div className="bg-white w-full max-w-[794px] border shadow print:shadow-none print:border-none p-6 sm:p-10 text-gray-900 relative">
        {/* Watermark */}
        <img src="/images/logo/icon.png" className="absolute inset-0 w-full h-full opacity-2 pointer-events-none object-contain" alt="Watermark" />

        <div className="border-6 border-[#9bb5b4] p-4 sm:p-6 md:p-10 text-center">
          {/* Header */}
          <div className="mb-10">
            <img
              src="/images/logo/logo.png"
              alt="Sozo Digicare"
              className="h-12 mx-auto mb-2"
            />
            <h2 className="text-base sm:text-lg font-bold">Sozo Digicare</h2>
            <p className="text-sm">11 The Avenue Folkstown Park.</p>
            <p className="text-sm mb-4">Balbriggan Co Dublin.</p>
            <h1
              className="text-xl sm:text-2xl md:text-[28px] lg:text-[34px] xl:text-[40px] font-bold text-[#335b75] uppercase tracking-wide mt-20 mb-20"
              style={{ fontFamily: "serif" }}
            >
              Medical Certificate for Sick Leave
            </h1>
          </div>

          {/* Body */}
          <div className="leading-8 mb-10 text-sm sm:text-base">
            <p>
              This certifies that <strong>{patientName}</strong> underwent a medical
              evaluation at <strong>Sozo Digicare</strong> on{" "}
              <strong>{new Date(issueDate).toLocaleDateString()}</strong> and is currently experiencing{" "}
              <strong>{diagnosis}</strong>.
            </p>

            <p className="mt-6">
              {comment || (
                <>
                  She is advised to refrain from work and physical activities for{" "}
                  <strong>{duration} days</strong> for her recovery.
                </>
              )}
            </p>
          </div>

          {/* Footer */}
          <div className="mt-4">
            <img
              src={`${API_URL}${qrCodeUrl}` || "/images/qrcode.png"}
              alt="QR Code"
              className="w-16 h-16 mx-auto my-15"
            />

            <div className="flex justify-center items-center mt-6">
              <div className="text-center">
                <p className="font-semibold">{doctorName}</p>
                <p className="text-sm -mt-1">Doctor/Examiner</p>
              </div>

              <div className="text-center">
                <img
                  src="/images/signature.png"
                  alt="Doctor's Signature"
                  className="w-28 h-auto"
                />
              </div>
            </div>

            <div className="mt-6 text-sm text-center">
              <p>Patient’s ID Number: <strong>{patientID}</strong></p>
              <p>Certificate ID: <strong>{certID}</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MedicalCertificate
