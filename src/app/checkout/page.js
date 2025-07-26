"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { TrashIcon } from "@heroicons/react/24/outline";

export default function Checkout() {
  const { cart, updateCartItem, removeFromCart } = useCart();
  const cartItems = cart?.items || [];
  const [step, setStep] = useState(1);
  
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });
  
  const [paymentInfo, setPaymentInfo] = useState({
    cardName: "",
    cardNumber: "",
    expDate: "",
    cvv: "",
  });

  const subtotal = cartItems.reduce((total, item) => {
    return total + (Math.round(Number(item.price)) || 0) * (Number(item.quantity) || 0);
  }, 0);

  // Check for prescription statuses
  const pendingPrescription = cartItems.some(
    (item) => item.product.prescriptionRequired && item.prescriptionLinkStatus === "pending"
  );
  
  const rejectedPrescription = cartItems.some(
    (item) => item.product.prescriptionRequired && item.prescriptionLinkStatus === "rejected"
  );

  console.log("hello", pendingPrescription)

  const allApproved = !pendingPrescription && !rejectedPrescription;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 lg:py-12">
      {/* Check for prescription approval before proceeding */}
      {!allApproved ? (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg shadow-md mb-8">
          {pendingPrescription && (
            <p className="mb-2">
              🔄 Some prescription items are <strong>pending approval</strong>. Please wait until they are approved.
            </p>
          )}
          {rejectedPrescription && (
            <p className="mb-2">
              ❌ Some prescription items were <strong>rejected</strong>. Please link a valid prescription to proceed.
            </p>
          )}
          <p className="mt-2">
            If your prescription was rejected, you can re-upload or link another prescription from your cart.
          </p>
        </div>
      ) : (
      <>
        {/* Steps */}
        <div className="mb-8 flex justify-center space-x-4">
          {["Shipping", "Payment", "Review"].map((label, index) => (
            <div key={index} className={`px-4 py-2 rounded-full text-sm font-medium ${
              step === index + 1 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"
            }`}>
              {label}
            </div>
          ))}
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              {step === 1 ? "Shipping Information" : step === 2 ? "Payment Details" : "Review & Confirm"}
            </h2>

            {/* Step 1: Shipping Info */}
            {step === 1 && (
              <form className="space-y-4">
                {["fullName", "email", "phone", "address"].map((field, index) => (
                  <input
                    key={index}
                    type={field === "email" ? "email" : "text"}
                    placeholder={field.replace(/([A-Z])/g, " $1").trim()} // Format placeholder text
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={shippingInfo[field] || ""}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, [field]: e.target.value })}
                  />
                ))}
                <div className="grid grid-cols-2 gap-4">
                  {["city", "state"].map((field, index) => (
                    <input
                      key={index}
                      type="text"
                      placeholder={field.replace(/([A-Z])/g, " $1").trim()}
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={shippingInfo[field] || ""}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, [field]: e.target.value })}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition"
                >
                  Continue to Payment
                </button>
              </form>
            )}

            {/* Step 2: Payment Info */}
            {step === 2 && (
              <form className="space-y-4">
                {["cardName", "cardNumber"].map((field, index) => (
                  <input
                    key={index}
                    type="text"
                    placeholder={field.replace(/([A-Z])/g, " $1").trim()}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={paymentInfo[field] || ""}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, [field]: e.target.value })}
                  />
                ))}
                <div className="grid grid-cols-2 gap-4">
                  {["expDate", "cvv"].map((field, index) => (
                    <input
                      key={index}
                      type="text"
                      placeholder={field === "expDate" ? "Expiration Date (MM/YY)" : "CVV"}
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={paymentInfo[field] || ""}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, [field]: e.target.value })}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition"
                >
                  Review Order
                </button>
              </form>
            )}

            {/* Step 3: Review Order */}
            {step === 3 && (
              <div>
                <h3 className="text-lg font-semibold">Shipping Details</h3>
                <p className="text-gray-600">{shippingInfo.fullName}, {shippingInfo.address}, {shippingInfo.city}, {shippingInfo.state}</p>

                <h3 className="mt-4 text-lg font-semibold">Payment Details</h3>
                <p className="text-gray-600">Cardholder: {paymentInfo.cardName}</p>
                <p className="text-gray-600">Card Number: **** **** **** {paymentInfo.cardNumber.slice(-4)}</p>

                <button className="mt-4 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition">
                  Place Order
                </button>
              </div>
            )}

            {/* Back Button */}
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center text-indigo-600 hover:text-gray-900 mt-4 font-semibold"
              >
                <span className="mr-1">←</span> Back
              </button>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-gray-100 shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            {cartItems.map((item) => (
              <div key={item._id} className="flex justify-between py-4 border-b border-gray-300">
                <div className="flex items-center">
                  <img src={item.product.photo.startsWith("http")
                              ? item.product.photo
                              : `${process.env.NEXT_PUBLIC_NODE_BASE_URL}${item.product.photo}`} 
                            alt={item.product.name} className="w-16 h-16 rounded-md mr-4" />
                  <div>
                    <h3 className="text-sm font-medium">{item.product.name}</h3>
                    <p className="text-xs text-gray-500">₦{Math.round(item.price)} x {item.quantity}</p>
                  </div>
                </div>
                {/* <button onClick={() => removeFromCart(item._id)} className="text-red-500 hover:text-red-700">
                  <TrashIcon className="w-5 h-5" />
                </button> */}
              </div>
            ))}
            <div className="mt-4 flex justify-between text-lg font-semibold text-gray-600">
              <span>Subtotal</span>
              <span>₦{subtotal}</span>
            </div>
          </div>
        </div>
      </>
      )}
    </div>
  );
}
