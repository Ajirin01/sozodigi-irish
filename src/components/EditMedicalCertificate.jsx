"use client"
import React, { useState } from "react"

const MedicalCertificate = ({
  patientName = "Emma Davis",
  issueDate = "2024-05-10",
  diagnosis: defaultDiagnosis = "bronchitis symptoms",
  duration: defaultDuration = 5,
  doctor = "Dr. Robert Michaels",
  patientID = "6677889",
  certID = "CH–2024–34567",
}) => {
  const [diagnosis, setDiagnosis] = useState(defaultDiagnosis)
  const [duration, setDuration] = useState(defaultDuration)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async () => {
    setLoading(true)
    setMessage("")

    try {
      const res = await fetch("/api/update-certificate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientID,
          certID,
          diagnosis,
          duration,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setMessage("Certificate updated successfully.")
      } else {
        setMessage(data.error || "Update failed.")
      }
    } catch (err) {
      setMessage("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

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
            <h1 className="text-[34px] font-bold text-[#335b75] uppercase tracking-wide mt-20 mb-20 font-serif">
              Medical Certificate for Sick Leave
            </h1>
          </div>

          {/* Body */}
          <div className="leading-8 mb-10 text-sm sm:text-base text-left">
            <p>
              This certifies that <strong>{patientName}</strong> underwent a
              medical evaluation at <strong>Saint Mary’s Medical Center</strong>{" "}
              on <strong>{issueDate}</strong> and is currently experiencing{" "}
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="border-b border-gray-400 px-1 font-semibold"
              />.
            </p>

            <p className="mt-6">
              They are advised to refrain from work and physical activities for{" "}
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-16 border-b border-gray-400 px-1 font-semibold text-center"
              />{" "}
              days for recovery.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-6">
            <img
              src="/images/qrcode.png"
              alt="QR Code"
              className="w-16 h-16 mx-auto my-8"
            />

            <div className="flex flex-col sm:flex-row justify-between items-center mt-6">
              {/* Doctor Info */}
              <div className="text-center">
                <p className="font-semibold">{doctor}</p>
                <p className="text-sm -mt-1">Doctor/Examiner</p>
              </div>

              {/* Signature */}
              <div className="text-center mt-4 sm:mt-0">
                <img
                  src="/images/signature.png"
                  alt="Doctor's Signature"
                  className="w-28 h-auto"
                />
              </div>
            </div>

            <div className="mt-6 text-sm text-center">
              <p>
                Patient’s ID Number: <strong>{patientID}</strong>
              </p>
              <p>
                Certificate ID: <strong>{certID}</strong>
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
