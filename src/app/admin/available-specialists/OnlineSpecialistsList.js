"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useSelector, useDispatch } from "react-redux";
import {
  PricingModal,
  CheckoutModal,
  FindSpecialistModal,
} from "@/components/gabriel";
import ModalContainer from "@/components/gabriel/ModalContainer";
import { cards } from "@/data/cards";
import { FaSearch, FaFilter, FaUserMd } from "react-icons/fa";
import { motion } from "framer-motion";

import {
  setSpecialist,
  setPrice,
  setDuration,
  resetBooking,
} from "@/store/specialistSlice";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

const SpecialistPage = () => {
  const dispatch = useDispatch();

  const specialist = useSelector((state) => state.specialist.specialist);
  const price = useSelector((state) => state.specialist.price);
  const duration = useSelector((state) => state.specialist.duration);
  const appointmentDate = useSelector(
    (state) => state.specialist.appointmentDate
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [onlineSpecialists, setOnlineSpecialists] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  useEffect(() => {
    socket.emit("get-online-specialists");
    socket.on("update-specialists", (data) => {
      setOnlineSpecialists(data);
    });

    return () => {
      socket.off("update-specialists");
    };
  }, []);

  const categories = [...new Set(cards.map((card) => card.specialty))];

  const filteredCards = cards.filter(
    (card) =>
      card.content.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "" || card.specialty === selectedCategory)
  );

  const handleCategorySelect = (category, fromSelect = false) => {
    if (fromSelect) {
      setSelectedCategory(category);
    }

    const availableSpecialists = onlineSpecialists.filter(
      (sp) =>{ console.log(sp.category, category); return sp.category === category}
    );

    if (availableSpecialists.length > 0) {
      const selected = availableSpecialists[0];
      dispatch(setSpecialist(selected));
      setModalContent("pricingModal");
      setShowModal(true);
    } else {
      setSelectedCategory(category);
      setModalContent("findSpecialistModal");
      setShowModal(true);
    }
  };

  const openCheckoutModal = (price, duration) => {
    console.log(duration)
    dispatch(setPrice(price));
    dispatch(setDuration(duration));
    setModalContent("checkoutModal");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalContent(null);
    dispatch(resetBooking());
    setSelectedCategory("");
    setSearchTerm("");
  };

  return (
    <section className="min-h-screen bg-white-50 py-12 px-4 md:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Find Your Specialist
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with experienced healthcare professionals for personalized
            medical consultations
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search for specialists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-6 focus:ring-2 focus:ring-primary-6 focus:ring-opacity-20 transition-all duration-200"
              />
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategorySelect(e.target.value, true)}
                className="w-full md:w-48 pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-6 focus:ring-2 focus:ring-primary-6 focus:ring-opacity-20 transition-all duration-200 appearance-none"
              >
                <option value="">All Categories</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onClick={() => handleCategorySelect(card.specialty)}
              className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="relative h-56">
                <img
                  src={card.image.src}
                  alt={card.content}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {card.content}
                  </h3>
                  <div className="flex items-center text-white/90">
                    <FaUserMd className="mr-2" />
                    <span className="text-sm">Expert Consultation</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCards.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No specialists found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
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
              date={new Date(now)}
              consultMode="now"
            />
          }
        />
      )}

    </section>
  );
};

export default SpecialistPage;
