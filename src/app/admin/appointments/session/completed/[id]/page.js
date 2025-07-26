"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { RotateCcw, Star } from 'lucide-react';
import { LoadingSpinner } from "@/components/gabriel";
import LoadingOverlay from "@/components/LoadingOverlay";


import { useToast } from "@/context/ToastContext";
import { useUser } from "@/context/UserContext";

import useAppointment from "@/hooks/useAppointment";

import { postData, fetchData, updateData } from "@/utils/api";
const SessionPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const userRole = session?.user?.role;
  const { user } = useUser();
  const { addToast } = useToast();

  const { appointment, loading } = useAppointment(id, token);

  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRatingField, setShowRatingField] = useState(false);

  const appointmentRef = useRef(appointment);

  useEffect(() => {
    appointmentRef.current = appointment;
  }, [appointment]);

  useEffect(()=> {
    if(appointmentRef.current?.session?.appointment?.status === "completed" && !appointmentRef.current?.session?.feedback){
      setShowRatingField(true)
    }
  }, [appointment])

  const renderStars = (rating, setRating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= rating;
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setRating(i)}
          className="text-yellow-500 hover:scale-110 transition transform"
          aria-label={`Rate ${i} star${i > 1 ? 's' : ''}`}
        >
          <Star
            className={`w-6 h-6 ${isFilled ? 'fill-yellow-500' : 'fill-none stroke-current'}`}
          />
        </button>
      );
    }
    return stars;
  };
  

  const handleRateSession = async () => {
    const session = appointmentRef.current?.session || null;
    setIsSubmitting(true);
    try {
      const payload = {
        session: session._id,
        user: session.user._id,
        rating,
        feedbackText: comment
      };
      await postData('session-feedback', payload, token);
      addToast('Thank you for your feedback!', 'success');
      setShowRatingField(false);
      router.push('/admin')
    } catch (err) {
      console.error(err);
      addToast('Failed to submit feedback', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const patient = appointment?.session?.user;
  const specialist = appointment?.session?.specialist;

  if (loading) {
    // return <LoadingOverlay isLoading={true} />;
    return <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-10"><LoadingSpinner /></div>
  }

  if (!appointment) {
    return <div className="text-center mt-10 text-red-500">Appointment not found</div>;
  }

  if ((appointment.session.appointment.status === "completed" || sessionEnded) && session?.user?.role === "user") {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] mt-4 px-6 py-10 bg-white dark:bg-gray-800 rounded-xl shadow-xl text-center transition-all">
          <div className="flex items-center justify-center w-12 h-12 mb-4 bg-yellow-100 rounded-full">
            <Star className="w-6 h-6 text-yellow-500" />
          </div>
      
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-3">
            Session Ended
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
            Thank you for attending the consultation. Please rate your experience or book a follow-up session.
          </p>

          {(appointment.session.prescriptions?.length > 0 || appointment.session.labReferrals?.length > 0) && (
            <div className="w-full bg-blue-50 border border-blue-200 text-blue-800 px-6 py-4 rounded-lg mb-6 shadow-sm">
              <h4 className="font-semibold mb-1">You have a new update</h4>
              <ul className="list-disc list-inside text-sm">
                {appointment.session.prescriptions?.length > 0 && (
                  <li>
                    Your doctor has issued a prescription. View it in your{" "}
                    <Link href="/admin/doctor-prescriptions" className="text-blue-600 underline hover:text-blue-800">
                      Prescription List
                    </Link>.
                  </li>
                )}
                {appointment.session.labReferrals?.length > 0 && (
                  <li>
                    A lab referral has been provided. Visit your{" "}
                    <Link href="/admin/lab-referrals" className="text-blue-600 underline hover:text-blue-800">
                      Lab Referrals
                    </Link>{" "}
                    to view it.
                  </li>
                )}
              </ul>
            </div>
          )}

      
          <div className="w-full max-w-lg space-y-6">
            {showRatingField && (
              !showRatingForm ? (
                <button
                  onClick={() => setShowRatingForm(true)}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-6 rounded-lg shadow transition"
                >
                  Rate This Session
                </button>
              ) : (
                <div className="space-y-4 text-left">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Your Rating:
                  </label>
                  <div className="flex gap-1">
                    {renderStars(rating, setRating)}
                  </div>
      
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Comment:
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      placeholder="Tell us how it went..."
                      className="mt-1 w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </label>
      
                  <button
                    onClick={handleRateSession}
                    disabled={isSubmitting}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg shadow transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                  </button>
                </div>
              )
            )}
      
            <Link
              href={`/admin/appointments/retake/${appointment.session.appointment._id}`}
              className="inline-flex justify-center items-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow transition"
            >
              <RotateCcw className="w-5 h-5" />
              Retake Session
            </Link>
          </div>
        </div>
      );
  }

  if ((appointment.session.appointment.status === "completed" || sessionEnded) && (session?.user?.role === "specialist" || session?.user?.role === "consultant")) {
    return (
      <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Session Ended</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Thank you for attending the consultation.
        </p>
      </div>
    );
  }
  

  return null
};

export default SessionPage;
