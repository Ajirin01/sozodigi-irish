"use client"
import React, { useState, useEffect } from "react"
import { fetchData, postData } from "@/utils/api"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"

const CreateMedicalCertificate = () => {
  const { data: session } = useSession()
  const token = session?.user?.jwt
  const router = useRouter()
  const searchParams = useSearchParams()

  const appointmentId = searchParams.get("appointment")
  const [appointment, setAppointment] = useState(null)

  const [diagnosis, setDiagnosis] = useState("")
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const generateCertID = () => {
    const rand = Math.floor(10000 + Math.random() * 90000)
    return `CH-${new Date().getFullYear()}-${rand}`
  }

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await fetchData(`consultation-appointments/get/custom/${appointmentId}`, token)
        console.log(res)
        if (res && res._id) {
          setAppointment(res)
        }
      } catch (error) {
        console.error("Failed to fetch appointment:", error)
        setMessage("Error loading appointment details.")
      }
    }

    if (appointmentId && token) {
      fetchAppointment()
    }
  }, [appointmentId, token])

  const handleSubmit = async () => {
    if (!appointment) return

    setLoading(true)
    setMessage("")

    try {
      const certID = generateCertID()

      const payload = {
        appointment: appointment._id,
        patient: appointment.patient._id,
        doctor: appointment.consultant._id,
        diagnosis,
        comment,
        certID,
      }

      const res = await postData("certificates/create", payload, token)
      console.log(res)
      if (res?.certificate && res?.certificate?._id) {
        router.push(`/admin/medical-certificates/${res.certificate._id}`)
      } else {
        setMessage("Certificate creation failed.")
      }
    } catch (error) {
      console.error("Error creating certificate:", error)
      setMessage("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  if (!appointment) {
    return <div className="text-center py-20">Loading appointment...</div>
  }

  return (
    <div className="max-w-xl mx-auto p-6 mt-10 bg-white border rounded shadow">
      <h1 className="text-xl font-semibold mb-4">Create Medical Certificate</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Diagnosis</label>
        <input
          type="text"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-[#335b75] text-white font-semibold py-2 px-4 rounded hover:bg-[#264456]"
      >
        {loading ? "Creating..." : "Create Certificate"}
      </button>

      {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
    </div>
  )
}

export default CreateMedicalCertificate
