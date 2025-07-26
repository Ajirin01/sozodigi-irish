"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import { useDispatch } from "react-redux";
import { setPrice } from "@/store/specialistSlice";
import ConsultationBookingPageContent from "@/components/BookingPage";

const certificateItems = [
  {
    title: "Fitness Certificate",
    description: "Work and Student Sickness Certificate",
    price: "20",
    image: "/images/fitness.jpg",
  },
  {
    title: "Visa Medical Certificate",
    description: "Certificate of Good Health / Health Declaration",
    price: "20",
    image: "/images/visa.jpeg",
  },
  {
    title: "Travel Cancellation Certificate",
    description: "Travel and Holiday Cancellation Certificate",
    price: "20",
    image: "/images/travel.jpg",
  },
  {
    title: "Fit to Work Certificate",
    description: "Fit-to-work Certificate",
    price: "20",
    image: "/images/work.jpg",
  },
  {
    title: "Travel With Medication Letter",
    description: "Travel With Medication Letter",
    price: "20",
    image: "/images/medication.jpg",
  },
  {
    title: "GP Referral Letter",
    description: "Doctor Referral Letter",
    price: "20",
    image: "/images/referral.jpeg",
  },
  {
    title: "Youth Camp Certificate",
    description: "Youth Camp or Trip Medical Certificate",
    price: "20",
    image: "/images/youth.jpg",
  },
  {
    title: "Fit to Cruise Certificate",
    description: "Fit-to-Cruise Medical Certificate",
    price: "20",
    image: "/images/travel.jpg",
  },
];

export default function CertificateList({ max }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const dispatch = useDispatch();

  const openDialog = (cert) => {
    setSelectedCert(cert);
    dispatch(setPrice(cert.price));
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setSelectedCert(null);
  };

  const displayedItems = max ? certificateItems.slice(0, max) : certificateItems;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedItems.map((cert, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition-shadow flex flex-col"
          >
            <img
              src={cert.image}
              alt={cert.title}
              className="w-full h-40 object-cover rounded-xl mb-4"
            />
            <h3 className="text-lg font-semibold text-center text-gray-800">
              {cert.title}
            </h3>
            <p className="text-sm text-gray-600 text-center">{cert.description}</p>
            <p className="text-lg font-bold text-center text-[var(--color-primary-7)] mt-4">
              €{cert.price}
            </p>
            <button
              onClick={() => openDialog(cert)}
              className="mt-4 w-full py-2 px-4 bg-[var(--color-primary-6)] text-white rounded-xl hover:bg-[var(--color-primary-7)] transition"
            >
              Book Appointment
            </button>
          </motion.div>
        ))}
      </div>

      {/* Booking Dialog */}
      <Dialog
        open={isOpen}
        onClose={closeDialog}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      >
        <div className="relative bg-white max-w-4xl w-full rounded-2xl p-6 flex gap-6 overflow-auto max-h-[90vh]">
          <button
            onClick={closeDialog}
            className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
          >
            <X size={20} />
          </button>
          <div className="w-full">
            <ConsultationBookingPageContent showSpecialistCategories={false} />
          </div>
        </div>
      </Dialog>
    </>
  );
}
