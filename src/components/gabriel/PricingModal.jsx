"use client";

import React, { useEffect, useState } from "react";
import { IoCloseOutline, IoCheckmarkOutline } from "react-icons/io5";
import ModalContainer from "@/components/gabriel/ModalContainer";
import { CheckoutModal } from "@/components/gabriel";
import StripeWrapper from "@/components/StripeWrapper";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";

const defaultPlans = [
  {
    title: "Basic",
    price: 20,
    duration: 900,
    features: ["Duration: 15 mins", "Quick call","Report",
      "Follow-up",
      "Pharmacy Referral",
      "Laboratory Referral"],
  },
  {
    title: "Delux",
    price: 40,
    duration: 2700,
    features: [
      "Duration: 45 mins",
      "10% OFF",
      "Report",
      "Follow-up",
      "Pharmacy Referral",
      "Laboratory Referral",
    ],
    isRecommended: true,
  },
  {
    title: "Premium",
    price: 70,
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
];

const PricingModal = ({
  closeModal,
  setPrice,
  setDuration,
  specialist,
  plans = defaultPlans,
  currency = "EUR",
}) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [showAcknowledgment, setShowAcknowledgment] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);

  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!session) {
      const callbackUrl = encodeURIComponent(pathname);
      router.push(`/login?callbackUrl=${callbackUrl}`);
    }
  }, [session]);

  const onSelected = (price, duration) => {
    const numericPrice = parseFloat(price);
    if (!isNaN(numericPrice) && numericPrice > 0) {
      setPrice(numericPrice);
      setDuration(duration);
      setSelectedPrice(numericPrice);
      setSelectedDuration(duration);
      setShowAcknowledgment(true); // Show acknowledgment first
    } else {
      console.error("Invalid price or duration selected");
    }
  };

  const handleAcknowledgmentProceed = () => {
    setShowAcknowledgment(false);
    setShowCheckout(true);
  };

  const handleAcknowledgmentCancel = () => {
    setShowAcknowledgment(false);
    setSelectedPrice(null);
    setSelectedDuration(null);
  };

  const formatPrice = (amount, currency = "EUR") =>
    new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const PricingCard = ({
    title,
    price,
    oldPrice,
    duration,
    features,
    isRecommended = false,
  }) => (
    <div
      className={`relative bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg ${
        isRecommended ? "ring-2 ring-indigo-400 transform scale-[1.02]" : ""
      }`}
    >
      {isRecommended && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className="bg-indigo-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
            Recommended
          </span>
        </div>
      )}

      <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
        {title}
      </h3>

      <div className="text-center mb-4">
        {oldPrice && oldPrice !== price && (
          <span className="block text-sm text-gray-400 line-through mb-1">
            {formatPrice(oldPrice, currency)}
          </span>
        )}
        <span className="text-3xl font-extrabold text-indigo-600">
          {formatPrice(price, currency)}
        </span>
        <span className="text-sm font-normal text-gray-500"> /session</span>
      </div>

      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-sm text-gray-600">
            <IoCheckmarkOutline
              className="text-green-500 mr-2 flex-shrink-0"
              size={16}
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transform hover:scale-105 active:scale-95"
        onClick={() => onSelected(price, duration)}
      >
        Get Started
      </button>
    </div>
  );

  return (
    <>
      {/* Pricing Modal */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Choose Your Plan
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition duration-300"
              >
                <IoCloseOutline size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan, idx) => (
                <PricingCard key={idx} {...plan} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Acknowledgment Modal */}
      {showAcknowledgment && (
        <ModalContainer
          modal={
            <div className="bg-white p-6 rounded-xl max-w-md mx-auto shadow-lg">
              <h2 className="text-lg font-bold mb-4 text-gray-800">
                Consultation Terms
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                By proceeding with consultation, users acknowledge that
                time-based sessions may conclude early upon mutual consent,
                and SozoDigiCare holds no responsibility for time not used
                after such agreement.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleAcknowledgmentCancel}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAcknowledgmentProceed}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  Proceed
                </button>
              </div>
            </div>
          }
        />
      )}

      {/* Checkout Modal */}
      {showCheckout && selectedPrice && selectedDuration && (
        <ModalContainer
          modal={
            <StripeWrapper>
              <CheckoutModal
                closeModal={() => setShowCheckout(false)}
                amount={selectedPrice}
                currency={currency}
                specialist={specialist}
                duration={selectedDuration}
              />
            </StripeWrapper>
          }
        />
      )}
    </>
  );
};

export default PricingModal;
