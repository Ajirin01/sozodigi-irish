"use client"
import React, { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { fetchData } from "@/utils/api"
import { useSession } from "next-auth/react"
import MedicalCertificateComponent from "@/components/MedicalCertificate"
import { FaCheckCircle, FaExclamationTriangle, FaDownload, FaLock } from "react-icons/fa"

const PublicCertificateVerification = () => {
  const { certID } = useParams()
  const { data: session, status: sessionStatus } = useSession()
  const [certificate, setCertificate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [downloading, setDownloading] = useState(false)
  const certRef = useRef(null)

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const cert = await fetchData(`certificates/get/by/${certID}`)
        if (!cert) {
          setError("Certificate not found or invalid.")
        } else {
          setCertificate(cert)
        }
      } catch (err) {
        setError("Error fetching certificate.")
      } finally {
        setLoading(false)
      }
    }

    if (certID) fetchCertificate()
  }, [certID])

  // Only the patient who owns this certificate can download
  const isOwner =
    session?.user?.id === certificate?.patient?._id ||
    session?.user?.id === String(certificate?.patient?._id)

  const canDownload = sessionStatus === "authenticated" && isOwner

  const handleDownloadPDF = async () => {
    if (!certRef.current) return
    setDownloading(true)
    try {
      const { toPng } = await import("html-to-image")
      const { default: jsPDF } = await import("jspdf").catch(() => null)

      const dataUrl = await toPng(certRef.current, {
        quality: 1,
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      })

      if (jsPDF) {
        const img = new window.Image()
        img.src = dataUrl
        img.onload = () => {
          const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [img.width, img.height] })
          pdf.addImage(dataUrl, "PNG", 0, 0, img.width, img.height)
          pdf.save(`Medical_Certificate_${certID}.pdf`)
          setDownloading(false)
        }
      } else {
        const link = document.createElement("a")
        link.download = `Medical_Certificate_${certID}.png`
        link.href = dataUrl
        link.click()
        setDownloading(false)
      }
    } catch (err) {
      console.error("Download failed:", err)
      setDownloading(false)
    }
  }

  if (loading) {
    return <div className="flex flex-col items-center justify-center min-h-screen py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-500 font-bold">Verifying Certificate...</p>
    </div>
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-2xl text-center border border-red-50">
        <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h1>
        <p className="text-gray-500">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-gray-100 rounded-xl font-bold">Try Again</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Verified badge */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-full font-bold text-lg mb-4 shadow-sm border border-green-200">
            <FaCheckCircle /> Officially Verified Certificate
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Certificate Verification</h1>
          <p className="text-gray-500 mt-2">This document has been verified against our secure medical records.</p>
        </div>

        {/* Download section */}
        <div className="flex justify-center mb-6 print:hidden">
          {canDownload ? (
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
                downloading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-95"
              }`}
            >
              <FaDownload />
              {downloading ? "Preparing Download..." : "Download Certificate (PDF)"}
            </button>
          ) : sessionStatus === "authenticated" && !isOwner ? (
            // Logged in but not the owner — show nothing
            null
          ) : (
            // Not logged in — prompt to login
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 font-semibold shadow-sm">
              <FaLock />
              <span>
                <a href="/login" className="underline hover:text-amber-900 font-bold">Log in</a> to download your certificate
              </span>
            </div>
          )}
        </div>

        {/* Certificate (used for screenshot capture) */}
        <div ref={certRef}>
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

        <div className="mt-10 max-w-[794px] mx-auto p-6 bg-blue-50 border border-blue-100 rounded-2xl text-center print:hidden">
          <p className="text-blue-800 text-sm font-medium">
            Questions about this document? Contact <span className="font-bold">support@sozodigicare.com</span> with reference <span className="font-bold">{certificate.certID}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default PublicCertificateVerification
