"use client"
import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { fetchData } from "@/utils/api"

const PublicCertificateVerification = () => {
  const { certID } = useParams()
  const [certificate, setCertificate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const cert = await fetchData(`certificates/get/by/${certID}`) // Assuming you don’t have a /by-cert-id endpoint

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

  if (loading) {
    return <div className="text-center mt-20 text-gray-600">Verifying certificate...</div>
  }

  if (error) {
    return <div className="text-center mt-20 text-red-600 text-lg">{error}</div>
  }

  return (
    <div className="max-w-2xl mx-auto mt-20 bg-white p-6 rounded shadow text-gray-800">
      <h1 className="text-2xl font-bold text-green-700 mb-4">✅ Certificate Verified</h1>
      <p className="mb-2">
        This medical certificate with ID <strong>{certificate.certID}</strong> is valid and has been
        officially issued by <strong>Sozo Digicare</strong>.
      </p>

      <div className="mt-6 border-t pt-4 text-sm">
        <p><strong>Patient:</strong> {certificate?.patient?.firstName+" "+certificate?.patient?.lastName || "N/A"}</p>
        <p><strong>Doctor:</strong> {certificate?.doctor?.firstName+" "+certificate?.patient?.lastName || "N/A"}</p>
        <p><strong>Diagnosis:</strong> {certificate.diagnosis}</p>
        <p><strong>Issued on:</strong> {new Date(certificate.issueDate).toLocaleDateString()}</p>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-sm">
        <p>
          ⚠️ This certificate has been digitally issued. For physical copies or official correspondence,
          please contact Sozo Digicare via our support page.
        </p>
      </div>
    </div>
  )
}

export default PublicCertificateVerification
