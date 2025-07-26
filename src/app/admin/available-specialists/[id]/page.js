"use client";

import { useEffect, useState, useRef } from "react";
import { fetchData, postData } from "@/utils/api";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { MapPin, GraduationCap } from "lucide-react";
import io from "socket.io-client";
import ConsultationRequestForm from "@/components/ConsultationRequestForm";
import { useUser } from "@/context/UserContext";
import { useSession } from "next-auth/react";
import { FaCalendarAlt, FaStar, FaExclamationTriangle, FaPhoneAlt } from 'react-icons/fa';
import dynamic from 'next/dynamic';
import { convertTo24Hour,  convertMillisecondsTo24HourFormat} from "@/utils/helperFunctions";

const LottieRinger = dynamic(() => import('@/components/LottieRinger'), {
  ssr: false,
});

export default function StartConsultationPage() {
  const [specialist, setSpecialist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);  // To track the invitation process
  const [sessionStarted, setSessionStarted] = useState(false); // To track when the session starts
  const [invitationRejected, setInvitationRejected] = useState(false); // To track rejection status

  const [appointment, setAppointment] = useState(null)

  const [busyMessage, setBusyMessage] = useState("");

  const { user } = useUser()

  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const socketRef = useRef(null);

  const { id: specialistId } = params;
  const appointmentId = searchParams.get("appointmentId");

  const { data: session } = useSession()
  const token = session?.user?.jwt

  // console.log("Appointment ID:", !JSON.parse(appointmentId))

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    preferredDate: "",
    duration: 0,  // Default duration
  });

  const COST_PER_MINUTE = 2

  useEffect(() => {
    setCalculatedCost(formData.duration * COST_PER_MINUTE)
  }, [formData.duration])

  useEffect( () => {
    if(user) setFormData({
                ...formData,
                name: user.firstName+" "+user.lastName,
                email: user.email,
                phone: user.phone,
              })
  }, [user])
  
  const [submitting, setSubmitting] = useState(false);
  const [calculatedCost, setCalculatedCost] = useState(30); // Base cost for 15 minutes

  useEffect(() => {
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      transports: ["websocket"],
    });
  
    // setup events...
  
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    const loadSpecialist = async () => {
      try {
        const data = await fetchData(`users/${specialistId}`);
        setSpecialist(data);
      } catch (err) {
        console.error("❌ Failed to fetch specialist:", err);
      } finally {
        setLoading(false);
      }
    };

    if (specialistId) loadSpecialist();
  }, [specialistId]);

  useEffect(() => {
    if (!socketRef.current || !appointmentId) return;

    fetchData(`consultation-appointments/${appointmentId}`)
    .then(( appointment ) => {
      setAppointment(appointment);
    })
    .catch((error) => {
      console.error("Failed to fetch appointment:", error);
      // Optionally show a toast or error message to user
    });

    const socket = socketRef.current;
  
    const handleSpecialistJoined = (data) => {
      if (data.appointmentId === appointmentId) {
        setSessionStarted(true);
    
        socketRef.current.on("session-created", ({ appointmentId, session, specialistToken, patientToken }) => {
          console.log("session-created");
    
          // Store the session and tokens in localStorage for future use
          const sessionData = { ...session, specialistToken, patientToken };
          localStorage.setItem("activeVideoSession", JSON.stringify(sessionData));

          console.log(appointmentId, session, specialistToken, patientToken)
    
          // Redirect to the session page after storing session and tokens
          window.location.href = `/admin/appointments/session/${session._id}`;
        });
      }
    };
    
  
    socket.on("call-accepted", handleSpecialistJoined);
  
    socket.on("call-rejected", (data) => {
      if (data.appointmentId === appointmentId) {
        setIsInviting(false);
        setInvitationRejected(true);
        alert("The specialist has rejected the call. Please try again later.");
      }
    });
  
    socket.on("call-timeout", (data) => {
      if (data.appointmentId === appointmentId) {
        setIsInviting(false);
        alert("The call has timed out. Please try again later.");
      }
    });
  
    return () => {
      socket.off("call-accepted", handleSpecialistJoined);
      socket.off("call-rejected");
      socket.off("call-timeout");
    };
  }, [appointmentId, router]);


  useEffect(() => {
    if (!socketRef.current || !appointmentId || !specialistId || !appointment) return;
    setIsInviting(true);

    // console.log(appointment.status)
  
    const socket = socketRef.current;
  
    // Listen for specialist busy
    socket.on("specialist-busy", ({ appointmentId: busyAppointmentId }) => {
      if (busyAppointmentId === appointmentId) {
        setIsInviting(false);
        setSessionStarted(false);
        setInvitationRejected(false);
        setBusyMessage("Specialist is currently on another call. Please wait a moment...");
      }
    });
  
    // Auto-trigger invite if not busy
    if(appointment.status === "pending"){
      socket.emit("invite-specialist-to-call", {
        specialistId,
        appointmentId,
      });
    }
  
    return () => {
      socket.off("specialist-busy");
    };
  }, [appointmentId, specialistId, specialist, appointment]);
  
  

  const handleStartCall = () => {
    if (!appointmentId || !specialist?._id) return alert("Missing info");

    if(appointment.status === "pending"){
      // Set the invitation state to true to show a waiting message
      setIsInviting(true);
      setInvitationRejected(false);  // Reset rejection status when retrying

      const socket = socketRef.current;

      socket.emit("invite-specialist-to-call", {
        specialistId: specialist._id,
        appointmentId,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    console.log(formData)
  };

  const handleConfirm = async () => {
    // Get the current date
    const selectedDate = new Date();

    // Get the current time (in milliseconds since epoch)
    const selectedTime = selectedDate.getTime();

    // Add 5 minutes to the current time (5 * 60 * 1000 milliseconds)
    const adjustedTime = selectedTime + 5 * 60 * 1000;

    event.preventDefault()
    if (!token || !session?.user?.id) return;
  
    setSubmitting(true);
    try {
      const appointmentData = {
        ...formData,
        date: selectedDate,
        timeSlot: convertMillisecondsTo24HourFormat(adjustedTime),
        cost: calculatedCost,
        consultMode: "now",
        type: "general"
      }
      
      const time24 = convertTo24Hour(appointmentData.timeSlot); // "11:00 AM" → "11:00"
      const dateTimeISO = new Date(`${appointmentData.date}`);
  
      if (isNaN(dateTimeISO.getTime())) {
        throw new Error('Invalid date format');
      }
  
      const payload = {
        patient: session.user.id,
        consultant: specialist._id,
        date: dateTimeISO,
        duration: appointmentData.duration,
        type: appointmentData.type || 'medicalTourism',
        paymentStatus: 'pending',
        consultMode: appointmentData.consultMode,
      };

      
  
      // Save appointment details to sessionStorage for later use
      sessionStorage.setItem('orderData', JSON.stringify(payload));

      // Initiate payment request to the backend
      const paymentPayload = {
        amount: calculatedCost, // Ensure the cost is in the correct unit (e.g., dollars)
        email: session.user.email,
        productName: `Consultation with ${specialist.firstName}`,
      };

      // console.log(paymentPayload)
      // return

      const paymentRes = await postData('/payments/initiate', paymentPayload, token);

      if (paymentRes?.url) {
        // Redirect to Stripe payment page
        window.location.href = paymentRes.url;
      } else {
        alertError('Failed to initiate payment');
      }
    } catch (err) {
      console.error(err);
      alertError('Something went wrong while booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!specialist) return <div>Specialist not found</div>;
  if(!appointmentId) return (<div>
    <ConsultationRequestForm
      handleSubmit={handleConfirm}
      handleChange={handleChange}
      formData={formData}
      submitting={submitting}
      calculatedCost={calculatedCost}
    />
  </div>);

  return (
    <div className="p-6 border border-gray-200 rounded-3xl dark:border-gray-800 bg-white dark:bg-gray-900 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row rounded-3xl overflow-hidden">
        {/* Left: Specialist Info */}
        <div className="md:w-1/3 bg-gradient-to-br from-[var(--color-primary-7)] to-[var(--color-primary-5)] p-6 text-white">
          <div className="flex flex-col items-center">
            <img
              src={specialist.profileImage 
                ? `${process.env.NEXT_PUBLIC_NODE_BASE_URL}${specialist.profileImage}` 
                : defaultUser?.src}
              alt={`Dr. ${specialist.firstName} ${specialist.lastName}`}
              className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border-4 border-white shadow-lg mb-4"
            />
            <h2 className="text-xl font-bold text-center">
              Dr. {specialist.firstName} {specialist.lastName}
            </h2>
            <p className="text-[var(--color-primary-1)] font-medium mb-2">{specialist.specialty}</p>

            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <FaStar 
                  key={i}
                  className={`h-5 w-5 ${i < (specialist.rating || 0) 
                    ? 'text-yellow-400' 
                    : 'text-white text-opacity-30'}`} 
                />
              ))}
              <span className="ml-2 font-medium">{specialist.rating || 0}</span>
            </div>

            <div className="mt-4 space-y-1 text-sm">
              <p><strong>Experience:</strong> {specialist.experience || "N/A"} years</p>
              <p><strong>Location:</strong> {specialist.address?.country || "Available Online"}</p>
            </div>
          </div>
        </div>

        {/* Right: Action Area */}
        <div className="md:w-2/3 p-6 space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">About</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {specialist.bio ||
                `Dr. ${specialist.firstName} ${specialist.lastName} is a dedicated specialist in ${specialist.specialty}. Known for their compassionate care and depth of knowledge, they help patients through personalized treatment and follow-up care.`}
            </p>
          </div>

          {(appointment && appointment.status !== "completed") && (invitationRejected || busyMessage) && (
            <button
              onClick={handleStartCall}
              className="w-full py-3 bg-[var(--color-primary-6)] hover:bg-[var(--color-primary-7)] text-white rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <FaPhoneAlt  className="mr-2" />
              Invite Specialist to session
            </button>
          )}

          {isInviting && !invitationRejected && !busyMessage && appointment?.status === "pending" && <LottieRinger />}

          {busyMessage && (
            <div className="text-center text-lg text-orange-500">
              {busyMessage}
            </div>
          )}

          {invitationRejected && (
            <div className="flex items-center justify-center gap-3 mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              <FaExclamationTriangle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">
                The specialist has <span className="font-semibold">rejected</span> the call. Please try again later.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>

  );
}
