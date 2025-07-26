'use client'

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Dialog } from "@headlessui/react";
import Calendar from "react-calendar";
import { CheckCircle, X } from "lucide-react";
import 'react-calendar/dist/Calendar.css';
import { useSelector, useDispatch } from "react-redux";
import Illnesses from '@/components/Illnesses'

import LottieImage from '@/components/LottieBackground';

import { setPrice, setSpecialist, setDuration } from '@/store/specialistSlice';

import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

import { gpServices } from "@/data/gpServices";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

import ConsultationBookingPageContent from "@/components/BookingPage"
import {
  PricingModal,
  CheckoutModal,
  FindSpecialistModal,
} from "@/components/gabriel";
import ModalContainer from "@/components/gabriel/ModalContainer";

import io from 'socket.io-client';
const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

export default function CertificatesConsultationPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentStep, setCurrentStep] = useState(1);
  const [onlineGPs, setOnlineGPs] = useState([]);

  const dispatch = useDispatch();

  const services = gpServices;

  useEffect(() => {
    socket.emit("get-online-specialists");

    socket.on("update-specialists", (data) => {
        console.log(data)
        const gpsOnly = data.filter((specialist) => specialist.category === "General Practitioner");
        // console.log(gpsOnly)
        setOnlineGPs(gpsOnly);
    });

    return () => {
      socket.off("update-specialists");
    };
  }, []);

  // Utility function
    const baseDuration = 900; // 15 mins in seconds

    const getPrice = (duration, discountPercent = 0) => {
        const timeRatio = duration / baseDuration;
        const raw = selectedService.price * timeRatio;
        const discounted = raw - (raw * discountPercent) / 100;
        return Math.round(discounted);
    };

    const getOldPrice = (duration) => {
        const timeRatio = duration / baseDuration;
        const raw = selectedService.price * timeRatio;
        return Math.round(raw);
    };

  const openDialog = (service) => {
    setSelectedService(service);
    setIsOpen(true);
    setCurrentStep(1);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setSelectedService(null);
    setModalContent(null);
  };

  const steps = [
    "Select a date and time",
    "Enter your details",
    "Confirm and pay",
    "Receive your confirmation"
  ];

  return (
    <div className="min-h-screen px-6 bg-gray-50">
      <div className="relative bg-gradient-to-r from-[var(--color-primary-7)] to-[var(--color-primary-5)] text-white py-20 rounded-b-3xl shadow-lg">
        {/* <div className="absolute inset-0 w-full opacity-100 h-full z-15">
            <LottieImage
            src="/background1-2.json"
            style={{ width: '100%', height: '100%' }}
            />
        </div> */}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center px-4"
            >
                <h1 className="text-4xl font-bold mb-4">Online Consultation With Irish Registered Doctors</h1>
                <p className="text-lg opacity-90">Instant Video Consultations</p>

                <h4 className="text-2xl font-bold mb-4">From Just €20</h4>

                <a href="#services"
                    className="mt-4 w-full md:w-[30%] mx-auto text-center py-2 px-4 text-[var(--color-primary-6)] bg-white rounded-xl hover:text-[var(--color-primary-7)] transition"
                    >
                    Consult Now
                </a>
            </motion.div>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 py-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.4 }} 
          className="text-2xl font-bold text-gray-800 mb-8 text-center"
        >
          Typical Services | Online Doctor Consultation
        </motion.h2>

        <div id="services" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, idx) => {
            // const isOnline = onlineGPs.some(gp => gp.specialty === service.title);
            const isOnline = onlineGPs[0];

            return (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition-shadow flex flex-col relative"
                >
                    {/* Online/Offline Status Badge */}
                    <div className="absolute top-4 right-4">
                    <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                        isOnline ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        }`}
                    >
                        <span className="w-2 h-2 mr-1 rounded-full inline-block animate-pulse"
                        style={{ backgroundColor: isOnline ? "#16a34a" : "#dc2626" }}
                        ></span>
                        {isOnline ? "Online" : "Offline"}
                    </span>
                    </div>

                    <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-40 object-cover rounded-xl mb-4"
                    />
                    <h3 className="text-lg font-semibold text-center text-gray-800">{service.title}</h3>
                    <p className="text-sm text-gray-600 text-center">{service.description}</p>
                    <p className="text-lg font-bold text-center text-[var(--color-primary-7)] mt-4">€{service.price}</p>

                    <button
                    onClick={() => {
                        if (isOnline) {
                        const specialist = onlineGPs[0];
                        dispatch(setSpecialist(specialist));
                        setModalContent("pricingModal");
                        setSelectedService(service);
                        setIsOpen(true);
                        } else {
                        openDialog(service);
                        dispatch(setPrice(service.price));
                        }
                    }}
                    className={`mt-4 w-auto mx-auto text-center py-2 px-4 rounded-xl transform transition duration-300 ease-in-out hover:scale-105 ${
                        isOnline
                        ? "bg-[var(--color-primary-6)] hover:bg-[var(--color-primary-7)] text-white text-sm font-medium"
                        : "text-[var(--color-primary-6)] hover:text-[var(--color-primary-7)] border-2 border-[var(--color-primary-6)] hover:border-[var(--color-primary-9)] text-sm font-medium"
                    }`}
                    >
                    {isOnline ? "Call Now" : "Book Appointment"}
                    </button>
                </motion.div>
            );

          })}
        </div>

        <Illnesses />
      </section>

      {/* Booking Dialog */}
      <Dialog
        open={isOpen && modalContent === null}
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

      {/* Modals for Call Now */}
      {isOpen && modalContent === "pricingModal" && (
        <ModalContainer
          modal={
            <PricingModal
                closeModal={closeDialog}
                setPrice={(p) => dispatch(setPrice(p))}
                setDuration={(d) => dispatch(setDuration(d))}
                specialist={() => useSelector((state) => state.specialist.specialist)}
                currency="USD"
                plans={[
                    {
                        title: "Basic",
                        price: getPrice(900),
                        oldPrice: getOldPrice(900),
                        duration: 900,
                        features: ["Duration: 15 mins", "Quick call", "Summary"],
                    },
                    {
                        title: "Delux",
                        price: getPrice(2700, 10),
                        oldPrice: getOldPrice(2700),
                        duration: 2700,
                        features: [
                            "Duration: 45 mins",
                            "10% OFF",
                            "Report",
                            "Follow-up",
                            "Pharmacy Referral",
                        ],
                        isRecommended: true,
                    },
                    {
                        title: "Premium",
                        price: getPrice(3600, 20),
                        oldPrice: getOldPrice(3600),
                        duration: 3600,
                        features: [
                            "Duration: 60 mins",
                            "20% OFF",
                            "Report",
                            "Follow-up",
                            "Pharmacy Referral",
                            "Laboratory Referral",
                        ],
                    },
                ]}
            />
          }

        />
      )}

      {isOpen && modalContent === "checkoutModal" && (
        <ModalContainer
          modal={
            <CheckoutModal
              closeModal={closeDialog}
              currency="USD"
              duration={() => useSelector(state => state.specialist.duration)}
              date={new Date()}
              consultMode="now"
            />
          }
        />
      )}
    </div>
  );
}
