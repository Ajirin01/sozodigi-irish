"use client"
import React, { useState, useEffect } from "react"
import { updateData, fetchData } from "@/utils/api"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"

const MedicalCertificate = () => {
  const params = useParams()
  const certificateId = params.id
  const { data: session } = useSession()
  const token = session?.user?.jwt

  const [certificate, setCertificate] = useState(null)
  const [diagnosis, setDiagnosis] = useState("")
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const getCertificate = async () => {
      try {
        const res = await fetchData(`certificates/${certificateId}`, token)
        if (res) {
          setCertificate(res)
          setDiagnosis(res.diagnosis)
          setComment(res.comment)
        }
      } catch (err) {
        console.error("Failed to fetch certificate", err)
      }
    }

    if (certificateId && token) {
      getCertificate()
    }
  }, [certificateId, token])

  const handleSubmit = async () => {
    setLoading(true)
    setMessage("")

    try {
      const res = await updateData(`certificates/update/${certificateId}`, {
        diagnosis,
        comment,
      }, token)

      if (res?.success || res?.status === 200) {
        setMessage("Certificate updated successfully.")
      } else {
        setMessage(res?.error || "Update failed.")
      }
    } catch (err) {
      setMessage("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  if (!certificate) return <div className="text-center py-20">Loading...</div>

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 py-10 print:p-0 flex justify-center print:bg-white">
      <div className="bg-white w-full max-w-[794px] border shadow print:shadow-none print:border-none p-6 sm:p-10 text-gray-900 relative">
        {/* Watermark */}
        <img
          src="/images/logo/icon.png"
          className="absolute inset-0 w-full h-full opacity-5 pointer-events-none object-contain"
          alt="Watermark"
        />

        <div className="border-6 border-[#9bb5b4] p-4 sm:p-6 md:p-10 text-center relative z-10">
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
            <h1 className="text-[34px] font-bold text-[#335b75] uppercase tracking-wide mt-20 mb-20 font-serif" style={{ fontFamily: "serif" }}>
              Medical Certificate for Sick Leave
            </h1>
          </div>

          {/* Body */}
          <div className="leading-8 mb-10 text-sm sm:text-base text-left">
            <p>
              This certifies that <strong>{certificate?.patient?.name || "Patient"}</strong> underwent a
              medical evaluation at <strong>Sozo Digicare Online Medical Consultations</strong>{" "}
              on <strong>{new Date(certificate?.issueDate).toLocaleDateString()}</strong> and is currently experiencing{" "}
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="border-b border-gray-400 px-1 font-semibold w-full sm:w-auto"
              />.
            </p>

            <p className="mt-6">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded resize-none text-sm sm:text-base"
                rows={3}
              />
            </p>
          </div>

          {/* Footer */}
          <div className="mt-6">
            <img
              src={certificate.qrCodeUrl || "/images/qrcode.png"}
              alt="QR Code"
              className="w-16 h-16 mx-auto my-8"
            />

            <div className="flex justify-center items-center mt-6">
              {/* Doctor Info */}
              <div className="text-center">
                <p className="font-semibold">{certificate?.doctor?.name || "Doctor"}</p>
                <p className="text-sm -mt-1">Doctor/Examiner</p>
              </div>

              {/* Signature */}
              <div className="text-center">
                <img
                  src="/images/signature.png"
                  alt="Doctor's Signature"
                  className="w-28 h-auto"
                />
              </div>
            </div>

            {/* Patient IDs */}
            <div className="mt-6 text-sm text-center">
              <p>
                Patient’s ID Number: <strong>{certificate?.patientID}</strong>
              </p>
              <p>
                Certificate ID: <strong>{certificate?.certID}</strong>
              </p>
            </div>

            {/* Save Button */}
            <div className="mt-8 text-center">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[#335b75] text-white font-semibold py-2 px-6 rounded hover:bg-[#264456] transition"
              >
                {loading ? "Saving..." : "Save Updates"}
              </button>
              {message && (
                <p className="mt-3 text-sm text-green-600">{message}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MedicalCertificate
