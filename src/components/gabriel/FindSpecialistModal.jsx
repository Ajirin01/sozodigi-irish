"use client";

import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { FaUserMd, FaCalendarAlt, FaStar, FaTimes, FaRegSadTear } from "react-icons/fa";
import { motion } from "framer-motion";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import ConsultationBookingPageContent from "@/components/BookingPageSelectedCategory"

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, { transports: ["websocket"] });

const FindSpecialistModal = ({ category, closeModal, setTheSpecialist }) => {
  const [specialist, setSpecialist] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  // console.log('$$$$$$$$$$$$$$$$$$$$$',category)

  useEffect(() => {
    socket.emit("get-online-specialists");

    const handleUpdate = (data) => {
      const matched = data.find((sp) => sp.specialistCategory === category);
      setSpecialist(matched || null);
      setLoading(false);
    };

    socket.on("update-specialists", handleUpdate);

    return () => {
      socket.off("update-specialists", handleUpdate);
    };
  }, [category]);

  const handleCallSpecialist = () => {
    closeModal();
    // setTheSpecialist(specialist);
  };

  const openDialog = () => {
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    // setSelectedService(null);
    setModalContent(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (!specialist) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gradient-to-br from-blue-100 to-purple-100 p-8 rounded-lg shadow-xl max-w-md w-full mx-auto relative"
        >
          <button
            onClick={closeModal}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <FaTimes className="text-xl" />
          </button>
          <div className="text-center space-y-6">
            <FaRegSadTear className="text-6xl text-blue-500 mx-auto" />
            <h2 className="text-3xl font-bold text-gray-800">We're Sorry</h2>
            <p className="text-lg text-gray-600">
              No specialists in <strong>{category}</strong> are online at the moment.
            </p>

            {/* Book Appointment Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={
                  openDialog}
              className="bg-blue-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-600 transition duration-300 ease-in-out w-full"
            >
              Book Appointment
            </motion.button>

            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={closeModal}
              className="bg-white text-gray-700 px-6 py-3 rounded-full font-semibold border border-gray-300 hover:bg-gray-100 transition duration-300 ease-in-out w-full"
            >
              Close
            </motion.button>
          </div>
        </motion.div>
        {/* Booking Dialog */}
        <Dialog
          open={isOpen && modalContent === null}
          onClose={closeDialog}
          className="fixed inset-0 z-999999999 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <div className="relative bg-white max-w-4xl w-full rounded-2xl p-6 flex gap-6 overflow-auto max-h-[90vh]">
            <button
              onClick={closeDialog}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
            >
              <X size={20} />
            </button>
            <div className="w-full">
              <ConsultationBookingPageContent showSpecialistCategories={false} selectedCategory={category} />
            </div>
          </div>
        </Dialog>
      </>
    );

  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-auto relative"
    >
      <button
        onClick={closeModal}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
      >
        <FaTimes className="text-xl" />
      </button>
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Available Specialist</h2>
      <div className="space-y-6">
        <div className="flex items-center justify-center">
          <img
            src={specialist.profileImage || "https://via.placeholder.com/150"}
            alt={`${specialist.firstName} ${specialist.lastName}`}
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
          />
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-gray-800">{`${specialist.firstName} ${specialist.lastName}`}</h3>
          <p className="text-blue-600 font-medium">{specialist.specialistCategory}</p>
        </div>
        <div className="space-y-2">
          {specialist.yearsOfExperience && (
            <div className="flex items-center">
              <FaUserMd className="text-blue-500 mr-2" />
              <p><strong>Experience:</strong> {specialist.yearsOfExperience} years</p>
            </div>
          )}
          <div className="flex items-center">
            <FaCalendarAlt className="text-blue-500 mr-2" />
            <p><strong>Availability:</strong> Now</p>
          </div>
          {specialist.rating && (
            <div className="flex items-center">
              <FaStar className="text-yellow-400 mr-2" />
              <p><strong>Rating:</strong> {specialist.rating}/5</p>
            </div>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCallSpecialist}
          className="w-full bg-blue-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-600 transition duration-300 ease-in-out"
        >
          Call this Specialist
        </motion.button>
      </div>
    </motion.div>
  );
};

export default FindSpecialistModal;
