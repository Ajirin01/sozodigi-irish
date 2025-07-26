"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { IoCloseOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { toSmallestUnit } from "@/utils/helperFunctions";
import { useSession } from "next-auth/react";
import { postData } from "@/utils/api";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";

const CheckoutModal = ({
  closeModal,
  amount,
  currency = "EUR",
  duration,
  initiateCallAPI,
  date
}) => {
  const specialist = useSelector((state) =>  state.specialist.specialist);
  const appointmentDate = useSelector((state) => state.specialist.appointmentDate) || date;
  const consultMode = useSelector((state) => state.specialist.consultMode);
  const slot = useSelector((state) => state.specialist.slot);
  
  const { addToast } = useToast()

  console.log(appointmentDate)


  const { user } = useUser();

  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [callStatus, setCallStatus] = useState(null)

  const { data: session } = useSession();
  const token = session?.user?.jwt;
  
  const handleCallTimeout = useCallback(() => {
    console.log("Call timeout triggered");
    // setCallStatus("timeout");
    setError("Specialist did not respond. You can try again.");
    setCurrentCall(null);
  }, []);

  // Prefill name and email
  useEffect(() => {
    if (user) {
      setName(`${user.firstName} ${user.lastName}` || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // Fetch payment intent
  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        const numericAmount = Number(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
          throw new Error("Invalid amount");
        }
        const smallest = toSmallestUnit(numericAmount, currency);
        const response = await postData(
          "payments/create/intent",
          { amount: smallest, currency },
          token
        );
        setClientSecret(response.clientSecret);
      } catch (err) {
        console.error("Error fetching payment intent:", err.message);
        setError("Failed to initialize payment. Please try again.");
      }
    };

    if (amount && token) {
      fetchPaymentIntent();
    }
  }, [amount, currency, token]);

  const createAppointment = async (paymentData, orderData) => {
    try {
      if (!orderData) {
        throw new Error("No order data found");
      }

      // console.log(orderData)

      // return

      if (orderData.appointmentId) {
        if (orderData?.type === "general" && consultMode === "now") {

          window.location.href = `/admin/available-specialists/${orderData.consultant}?appointmentId=${orderData._id}`;
        } else {
          setCallStatus("booking")
          router.push(`/admin/appointments`);
        }
        return;
      }

      const payload = {
        patient: orderData.patient,
        consultant: orderData.consultant,
        date: orderData.date,
        mode: orderData.mode,
        price: amount,
        slot,
        duration: orderData.duration,
        type: orderData.type,
        paymentStatus: "paid",
        transactionId: paymentData?.transactionId,
        amountPaid: paymentData?.amount,
      };

      const res = await postData(
        "consultation-appointments/create/custom",
        payload,
        token
      );

      if (res.appointment) {
        const appointmentId = res.appointment._id;
        if (orderData?.type === "general" && consultMode === "now") {
          window.location.href = `/admin/available-specialists/${orderData.consultant}?appointmentId=${appointmentId}`;
        } else {
          setCallStatus("booking")
          window.location.href = `/admin/appointments`;
        }
      } else {
        throw new Error("Failed to book the appointment");
      }
    } catch (err) {
      addToast(err.message, 'error')
      setCallStatus(null)
      setError("Failed to book the appointment");
      console.error(err);
    } finally {
      if(consultMode ===  "appointment"){
        setCallStatus("booking")
      }else{
        setCallStatus("redirecting")
      }
      setProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    const payload = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: { name, email },
      },
    });

    if (payload.error) {
      setError(`Payment failed: ${payload.error.message}`);
      setProcessing(false);
    } else {
      setSucceeded(true);
      // setCallStatus("initiating");

      const paymentData = {
        transactionId: payload.paymentIntent.id,
        amount: payload.paymentIntent.amount,
      };

      let orderData = {
        patient: session?.user?.id,
        consultant: specialist?._id,
        date: appointmentDate,
        duration: duration,
        type: "general",
        mode: consultMode,
        paymentStatus: "paid",
        consultMode: consultMode,
      };
      
      // Add startTime and endTime only if consultMode is "appointment"
      if (consultMode === "appointment") {
        orderData = { ...orderData, startTime: slot.startTime, endTime: slot.endTime };
      }
      

      try {
        await createAppointment(paymentData, orderData);
      } catch (err) {
        console.error("Failed to initiate call:", err);
        setError("Payment successful, but failed to initiate call.");
        // setCallStatus("error");
      }
    }
  };

  const formatAmount = (value) => {
    const numeric = Number(value);
    return isNaN(numeric) ? "0.00" : numeric.toFixed(2);
  };

  return (
    <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        { callStatus !== "redirecting" && callStatus !== "booking" ? (
          <form onSubmit={handleSubmit}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Checkout</h2>
              <button onClick={closeModal} type="button" className="text-gray-500 hover:text-gray-700">
                <IoCloseOutline size={24} />
              </button>
            </div>

            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 w-full border rounded-md px-3 py-2"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full border rounded-md px-3 py-2"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="card-element" className="block text-sm font-medium">Card Details</label>
              <CardElement
                id="card-element"
                className="mt-1 p-2 border rounded-md"
                options={{
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#424770",
                      "::placeholder": { color: "#aab7c4" },
                    },
                    invalid: { color: "#9e2146" },
                  },
                }}
              />
            </div>

            <div className="mb-4 text-lg font-semibold">
              Total: {formatAmount(amount)} {currency}
            </div>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            <button
              type="submit"
              disabled={processing || !stripe}
              className={`w-full bg-indigo-600 text-white py-2 px-4 rounded-md ${processing ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-700"}`}
            >
              {processing
                ? "Processing..."
                // : callStatus === "timeout"
                // ? "Retry Call"
                : `Pay ${formatAmount(amount)} ${currency}`}
            </button>
          </form>
         ) : (
          <div className="text-center">
            { callStatus === "booking" ?
            <>
              <h2 className="text-2xl font-bold mb-4">
                Payment successful! Booking your appointment...
              </h2>
            </>
            : <>
              <h2 className="text-2xl font-bold mb-4">
                {callStatus === "initiating" ? "Initiating Call..." : "Waiting for Specialist..."}
              </h2>
              <p className="mb-4">
                {callStatus === "initiating"
                  ? "We're setting up your call. This may take a moment."
                  : "We've notified the specialist. Please wait..."}
              </p>
            </>
            }
            
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        )} 
      </div>
    </div>
  );
};

export default CheckoutModal;
