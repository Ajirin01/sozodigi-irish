'use client'

import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog } from "@headlessui/react";
import Calendar from "react-calendar";
import { CheckCircle, X } from "lucide-react";
import 'react-calendar/dist/Calendar.css';
import { useSelector, useDispatch } from "react-redux";

import { setPrice} from '@/store/specialistSlice'

import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from 'next/link';
import ConsultationBookingPageContent from "@/components/BookingPage"
import CertificateList from "@/components/CertificateList";

function CertificatesConsultationPageContent() {
  const searchParams = useSearchParams();
  const rescheduleId = searchParams.get("reschedule");

  const [isOpen, setIsOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentStep, setCurrentStep] = useState(1);

  const dispatch = useDispatch()

  if (rescheduleId) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="mb-8 flex justify-between items-center border-b pb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Reschedule Appointment</h1>
              <p className="text-gray-500 mt-1">Select a new date and time for your consultation.</p>
            </div>
            <Link href="/admin/appointments" className="text-indigo-600 hover:text-indigo-800 font-medium">
              ← Back to Appointments
            </Link>
          </div>
          <ConsultationBookingPageContent showSpecialistCategories={false} />
        </div>
      </div>
    );
  }

  const openDialog = (cert) => {
    setSelectedCert(cert);
    setIsOpen(true);
    setCurrentStep(1);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setSelectedCert(null);
  };

  const steps = [
    "Select a date and time",
    "Enter your details",
    "Confirm and pay",
    "Receive your confirmation"
  ];

  return (
    <div className="min-h-screen px-6 bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--color-primary-7)] to-[var(--color-primary-5)] text-white py-20 rounded-b-3xl shadow-lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center px-4"
        >
          <h1 className="text-4xl font-bold mb-4">Doctor Letters & Sick Notes</h1>
          <p className="text-lg opacity-90">Same-day letters, sick notes, medical certificates and referral letters</p>
        </motion.div>
      </div>

      {/* Terms */}
      <section className="max-w-4xl mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl shadow-lg p-8 space-y-6 border border-gray-100"
        >
          <div className="flex items-center justify-center gap-3">
            <CheckCircle className="text-primary-7 w-6 h-6" />
            <h2 className="text-2xl font-bold text-gray-800">
              Terms & Conditions – Certificates Consultation
            </h2>
          </div>

          <div className="space-y-5 text-gray-700 text-sm sm:text-base leading-relaxed">
            <div className="bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition">
              <p>
                <span className="font-semibold text-primary-9">Doctor’s Discretion:</span> Certificates are issued only after a consultation, at the sole discretion of the doctor based on clinical judgment.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition">
              <p>
                <span className="font-semibold text-primary-9">No Refund Policy:</span> If no certificate is issued, the consultation fee remains non-refundable.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition">
              <p>
                <span className="font-semibold text-primary-9">Pre-Consultation Confirmation:</span> If you're unsure whether your request qualifies for a certificate, please contact support before proceeding.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition">
              <p>
                <span className="font-semibold text-primary-9">Independent Medical Judgment:</span> All medical decisions are made by the consulting doctor in accordance with their clinical expertise and platform guidelines.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition">
              <p>
                <span className="font-semibold text-primary-9">Face-to-Face May Be Required:</span> If deemed necessary, doctors may request an in-person consultation for patient safety or legal reasons.
              </p>
            </div>

            <div className="text-sm text-gray-600 text-center pt-4">
              By booking a certificate consultation, you agree to all the above terms.
            </div>
          </div>
        </motion.div>
      </section>


      {/* Certificates */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.4 }} 
          className="text-2xl font-bold text-gray-800 mb-8 text-center"
        >
          Available Certificates
        </motion.h2>
        
        <CertificateList />
      </section>

    </div>
  );
}

export default function CertificatesConsultationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CertificatesConsultationPageContent />
    </Suspense>
  );
}
