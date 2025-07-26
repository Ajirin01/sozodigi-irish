"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSpecialist,
  setPrice,
  setDuration,
  resetBooking,
} from "@/store/specialistSlice";
import ModalContainer from "@/components/gabriel/ModalContainer";
import { PricingModal, CheckoutModal, FindSpecialistModal } from "@/components/gabriel";
import { motion } from "framer-motion";

import {
  Cardiologist, Dermatologist, Endocrinologist, GeneralPractitioner,
  Neurologist, Oncologist, PreventiveMedicineSpecialist, OrthopedicSurgeon,
  Pediatrician, Psychiatrist, Surgeon, Urologist, Gynecologist
} from "@/assets";

const socket = typeof window !== "undefined" ? require("socket.io-client")(process.env.NEXT_PUBLIC_SOCKET_URL) : null;

const specialistCategories = [
  { name: "Cardiology", desc: "Heart and blood vessel diseases.", image: Cardiologist },
  { name: "Dermatology", desc: "Skin, hair, and nail conditions.", image: Dermatologist },
  { name: "Endocrinology", desc: "Hormone-related disorders.", image: Endocrinologist },
  { name: "Gastroenterology", desc: "Digestive system and related organs.", image: GeneralPractitioner },
  { name: "Neurology", desc: "Nervous system disorders.", image: Neurologist },
  { name: "Oncology", desc: "Cancer diagnosis and treatment.", image: Oncologist },
  { name: "Ophthalmology", desc: "Eye diseases and conditions.", image: PreventiveMedicineSpecialist },
  { name: "Orthopedics", desc: "Bones, joints, and muscles.", image: OrthopedicSurgeon },
  { name: "Pediatrics", desc: "Child health care.", image: Pediatrician },
  { name: "Psychiatry", desc: "Mental health disorders.", image: Psychiatrist },
  { name: "Surgery", desc: "Surgical procedures and care.", image: Surgeon },
  { name: "Urology", desc: "Urinary tract and male health.", image: Urologist },
  { name: "Gynecology", desc: "Female reproductive health.", image: Gynecologist },
];

const SpecialistCategories = () => {
  const dispatch = useDispatch();
  const specialist = useSelector((state) => state.specialist.specialist);
  const duration = useSelector((state) => state.specialist.duration);

  const [onlineSpecialists, setOnlineSpecialists] = useState([]);
  const [modalContent, setModalContent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;
  const pageCount = Math.ceil(specialistCategories.length / itemsPerPage);

  useEffect(() => {
    if (!socket) return;
    socket.emit("get-online-specialists");
    socket.on("update-specialists", (data) => setOnlineSpecialists(data));
    return () => socket.off("update-specialists");
  }, []);

  const openCheckoutModal = (price, duration) => {
    dispatch(setPrice(price));
    dispatch(setDuration(duration));
    setModalContent("checkoutModal");
    setShowModal(true);
  };

  const handleBooking = (category) => {
    const available = onlineSpecialists.filter((sp) => sp.specialty === category);
    setSelectedCategory(category);
    if (available.length > 0) {
      dispatch(setSpecialist(available[0]));
      setModalContent("pricingModal");
    } else {
      setModalContent("findSpecialistModal");
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setModalContent(null);
    setShowModal(false);
    dispatch(resetBooking());
  };

  const startIdx = currentPage * itemsPerPage;
  const currentItems = specialistCategories.slice(startIdx, startIdx + itemsPerPage);

  return (
    <section className="py-16 px-4 md:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
          Our Departments
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentItems.map((spec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="relative h-52">
                <img
                  src={spec.image?.src || spec.image}
                  alt={spec.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-lg font-bold">{spec.name}</h3>
                  <p className="text-sm opacity-80">{spec.desc}</p>
                </div>
              </div>
              <div className="p-4 text-center">
                <button
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium"
                  onClick={() => handleBooking(spec.name)}
                >
                  BOOK APPOINTMENT
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination controls */}
        <div className="flex justify-center mt-10 gap-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            disabled={currentPage === 0}
            className={`px-4 py-2 rounded-lg text-sm font-medium border ${
              currentPage === 0
                ? "text-gray-400 border-gray-300 cursor-not-allowed"
                : "text-gray-700 border-gray-500 hover:bg-gray-100"
            }`}
          >
            Previous
          </button>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, pageCount - 1))
            }
            disabled={currentPage === pageCount - 1}
            className={`px-4 py-2 rounded-lg text-sm font-medium border ${
              currentPage === pageCount - 1
                ? "text-gray-400 border-gray-300 cursor-not-allowed"
                : "text-gray-700 border-gray-500 hover:bg-gray-100"
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal Handling */}
      {showModal && modalContent === "findSpecialistModal" && (
        <ModalContainer
          modal={
            <FindSpecialistModal
              category={selectedCategory}
              closeModal={closeModal}
            />
          }
        />
      )}
      {showModal && modalContent === "pricingModal" && (
        <ModalContainer
          modal={
            <PricingModal
              closeModal={closeModal}
              setPrice={(p) => dispatch(setPrice(p))}
              setDuration={(d) => dispatch(setDuration(d))}
              onConfirm={(p, d) => openCheckoutModal(p, d)}
            />
          }
        />
      )}
      {showModal && modalContent === "checkoutModal" && specialist && (
        <ModalContainer
          modal={
            <CheckoutModal
              closeModal={closeModal}
              currency="USD"
              duration={duration}
              date={new Date()}
              consultMode="now"
            />
          }
        />
      )}
    </section>
  );
};

export default SpecialistCategories;
