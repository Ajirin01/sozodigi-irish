"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback } from "react";
import ConfirmationDialog from "@/components/ConfirmationDialog";

import { useToast } from "@/context/ToastContext";
import { useUser } from "@/context/UserContext";

import VideoSection from "@/components/admin/VideoSection";
import RatingForm from "@/components/admin/RatingForm";
import SessionTimer from "@/components/admin/SessionTimer";
import NotesDialog from "@/components/admin/NotesDialog";
import PrescriptionDialog from "@/components/admin/PrescriptionDialog";
import LabReferralDialog from "@/components/admin/LabReferralDialog";
import MedicalCertificateDialog from "@/components/admin/MedicalCertificateDialog";

import QuestionsDialog from "@/components/admin/QuestionsDialog";

import useAppointment from "@/hooks/useAppointment";

import { postData, fetchData, updateData } from "@/utils/api";
import { getSocket } from "@/lib/socket";



const SessionPage = () => {
  const { id } = useParams();
  const router = useRouter();
  

  const videoUrl = `https://videowidget.sozodigicare.com/?room=${id}`

  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const userRole = session?.user?.role;
  const { user } = useUser();
  const { addToast } = useToast();

  const { appointment, loading } = useAppointment(id, token);
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);


  const iframeRef = useRef(null);

  const [remainingTime, setRemainingTime] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const [isFullScreen, setIsFullScreen] = useState(true);
  const [showOptions, setShowOptions] = useState(false);

  const [sessionEnded, setSessionEnded] = useState(false);
  const [endingSession, setEndingSession] = useState(false);

  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRatingField, setShowRatingField] = useState(false);

  const [sessionNotes, setSessionNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const [prescriptions, setPrescriptions] = useState([]);
  const [savingPrescription, setSavingPrescription] = useState(false);
  const [showCertDialog, setShowCertDialog] = useState(false);

  const [specialistToken, setSpecialistToken] = useState(null);
  const [patientToken, setPatientToken] = useState(null);

  const [showQuestions, setShowQuestions] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [showPrescriptions, setShowPrescriptions] = useState(false);
  const [healthQuestions, setHealthQuestions] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [showReferrals, setShowReferrals] = useState(false);
  const [labReferrals, setLabReferrals] = useState([]);
  const [newReferral, setNewReferral] = useState({
    testName: "",
    labName: "",
    note: "",
    status: "pending"
  });
  const [savingReferral, setSavingReferral] = useState(false);
  

  const [newPrescription, setNewPrescription] = useState({ medication: '', dosage: '', frequency: '' });

  const videoRef = useRef();
  const appointmentRef = useRef(appointment);
  const socketRef = useRef();
  
  useEffect(() => {
    socketRef.current = getSocket();
  }, []);

  useEffect(() => {
    appointmentRef.current = appointment;
  }, [appointment]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    
    const handlePatientEndRequest = ({ appointmentId }) => {
      const currentAppointment = appointmentRef.current;
      const isPatient = currentAppointment?.session?.user?._id === session?.user?.id;
      
      if (isPatient && userRole === "user" && currentAppointment?.session?.appointment?._id === appointmentId) {
        setShowConfirmEnd(true);
      }
    };

    const handlePatientRejected = ({ appointmentId }) => {
      if ((userRole === "specialist" || userRole === "consultant") && appointmentRef.current?.session?.appointment?._id === appointmentId) {
        addToast("Patient refused to end the session.", "error");
      }
    };

    socket.on("request-patient-end-session", handlePatientEndRequest);
    socket.on("patient-rejected-end-session", handlePatientRejected);

    return () => {
      socket.off("request-patient-end-session", handlePatientEndRequest);
      socket.off("patient-rejected-end-session", handlePatientRejected);
    };
  }, [userRole]);

  const handleRejectEndSession = () => {
    setShowConfirmEnd(false);
    
    if (userRole === "user") {
      const socket = getSocket();
      if (socket && appointmentRef.current?.session?.appointment?._id) {
        socket.emit("patient-rejected-end-session", {
          appointmentId: appointmentRef.current.session.appointment._id
        });
      }
    }
  };

  const handleRequestEndSession = () => {
    const currentAppointment = appointmentRef.current;
    if (!currentAppointment?.session?.appointment?._id) return;
    
    const isSpecialist = currentAppointment?.session?.specialist?._id === session?.user?.id || 
                         userRole === "specialist" || 
                         userRole === "consultant";

    if (isSpecialist) {
      socketRef.current.emit("request-patient-end-session", {
        appointmentId: currentAppointment.session.appointment._id
      });
      addToast("Awaiting patient's confirmation to end the session...", "info");
      setShowOptions(false);
    } else {
      // It's the patient requesting to end the session
      setShowConfirmEnd(true);
    }
  };

  const handleEndCall = () => {
    if (videoRef.current) {
      videoRef.current.endCall();
    }
  };

  useEffect(()=> {
    if(appointment?.session?.appointment?.status === "completed"){
      setIsTimerRunning(false)
      router.push(`/admin/appointments/session/completed/${id}`)
    }
  }, [appointment])

  useEffect(()=> {
    if(appointmentRef.current?.session && appointmentRef.current?.session?.appointment?.status === "pending"){
      setIsTimerRunning(true)
    }
  }, [appointmentRef.current])

  const handleEndSession = async () => {
    const currentAppointment = appointmentRef.current;
    if (!currentAppointment?.session._id || !token || currentAppointment.status === "completed") return;
    try {
      setEndingSession(true);
      socketRef.current.emit("session-ended", {
        specialist: user,
        appointmentId: currentAppointment.session.appointment._id
      });
      await updateData(`consultation-appointments/update/custom/${currentAppointment.session.appointment._id}`, { status: "completed" }, token);
      const endTime = new Date().toISOString();
      const startTime = new Date(currentAppointment.session.startTime);
      const durationInMinutes = Math.round((new Date() - startTime) / 60000);
      await updateData(`video-sessions/${currentAppointment.session._id}`, { endTime, durationInMinutes }, token);
    } catch (err) {
      console.error("Failed to end session", err);
    } finally {
      localStorage.removeItem(`sessionStartTime-${currentAppointment.session.appointment._id}`);
      setSessionEnded(true);
      handleEndCall();
      setIsTimerRunning(false);
      setEndingSession(false);
      router.push(`/admin/appointments/session/completed/${id}`)
    }
  };

   // load documentation when dialog is opened
   useEffect(() => {
    const fetchDocumentation = async () => {
      if (!appointmentRef.current?.session?._id || !token) return;
  
      try {
        setSessionNotes("loading...");
        const response = await fetchData(
          `video-sessions/${appointmentRef.current.session._id}`,
          token
        );
        // console.log(response.success && response.session)
        if (response.success && response.session) {
          setSessionNotes(response.session.sessionNotes || '');
        } else {
          setSessionNotes('');
        }
      } catch (error) {
        console.error('Failed to fetch documentation:', error);
        setSessionNotes('');
      }
    };
  
    if (showDocs) {
      fetchDocumentation();
    }
  }, [showDocs]);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!appointmentRef.current?.session?._id || !token) return;
  
      try {
        const response = await fetchData(
          `video-sessions/${appointmentRef.current.session._id}`,
          token
        );
        if (response.success && response.session) {
          setPrescriptions(response.session.prescriptions || []);
        } else {
          setPrescriptions([]);
        }
      } catch (error) {
        console.error('Failed to fetch prescriptions:', error);
        setPrescriptions([]);
      }
    };
  
    if (showPrescriptions) {
      fetchPrescriptions();
    }
  }, [showPrescriptions]);

  useEffect(() => {
    const storedSession = localStorage.getItem('activeVideoSession');
    if (storedSession) {
      const sessionData = JSON.parse(storedSession);
      setSpecialistToken(sessionData?.session?.specialistToken || sessionData?.specialistToken);
      setPatientToken(sessionData?.session?.patientToken || sessionData?.patientToken);
    }
  }, []);

  useEffect(() => {
    const fetchLabReferrals = async () => {
      if (!appointmentRef.current?.session?._id || !token) return;

      try {
        const response = await fetchData(
          `video-sessions/${appointmentRef.current.session._id}`,
          token
        );
        if (response.success && response.session) {
          setLabReferrals(response.session.labReferrals || []);
        } else {
          setLabReferrals([]);
        }
      } catch (error) {
        console.error('Failed to fetch lab referrals:', error);
        setLabReferrals([]);
      }
    };

    if (showReferrals) {
      fetchLabReferrals();
    }
  }, [showReferrals]);

  const handleSaveNotes = async () => {
    const currentAppointment = appointmentRef.current;
    if (!currentAppointment?.session?._id || !token) return;
  
    try {
      setSavingNotes(true);
      await updateData(
        `video-sessions/${currentAppointment.session._id}`,
        { sessionNotes },
        token
      );
      addToast("Notes saved successfully!", "success");
      setShowDocs(false);
    } catch (err) {
      console.error("Failed to save notes", err);
      addToast("Failed to save notes.", "error");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleAddPrescription = async () => {
    setSavingPrescription(true)
    if (
      !newPrescription.medication ||
      !newPrescription.dosage ||
      !newPrescription.frequency
    ) {
      alert('Please fill all fields');
      return;
    }
  
    const updatedPrescriptions = [...prescriptions, newPrescription];

    // console.log(updatedPrescriptions)
  
    try {
      await updateData(
        `video-sessions/${appointmentRef.current.session._id}`,
        { prescriptions: updatedPrescriptions },
        token
      );
      setPrescriptions(updatedPrescriptions);
      setNewPrescription({ medication: '', dosage: '', frequency: '' });
    } catch (error) {
      console.error('Failed to add prescription:', error);
    }finally{
      setSavingPrescription(false)
    }
  };
  
  const handleDeletePrescription = async (index) => {
    const updatedPrescriptions = prescriptions.filter((_, i) => i !== index);
  
    try {
      await updateData(
        `video-sessions/${appointmentRef.current.session._id}`,
        { prescriptions: updatedPrescriptions },
        token
      );
      setPrescriptions(updatedPrescriptions);
    } catch (error) {
      console.error('Failed to delete prescription:', error);
    }
  };

  const loadHealthQuestions = async (userId) => {
    try {
      setLoadingQuestions(true);
      const res = await fetchData(`health-questionnaires/user/${userId}`, token);
      setHealthQuestions(res);
    } catch (err) {
      console.error("Failed to fetch health questions", err);
    } finally {
      setLoadingQuestions(false);
    }
  };

 const handleAddReferral = async () => {
    if (!newReferral.testName.trim()) {
      addToast("Test name is required", "error");
      return;
    }

    setSavingReferral(true);
    const updated = [...labReferrals, newReferral];

    try {
      await updateData(
        `video-sessions/${appointmentRef.current.session._id}`,
        { labReferrals: updated },
        token
      );
      setLabReferrals(updated);
      setNewReferral({ testName: "", labName: "", note: "", status: "pending" });
    } catch (error) {
      console.error("Failed to add referral", error);
      addToast("Failed to add referral", "error");
    } finally {
      setSavingReferral(false);
    }
  };

  const handleDeleteReferral = async (index) => {
    const updated = labReferrals.filter((_, i) => i !== index);

    try {
      await updateData(
        `video-sessions/${appointmentRef.current.session._id}`,
        { labReferrals: updated },
        token
      );
      setLabReferrals(updated);
    } catch (error) {
      console.error("Failed to delete referral", error);
      addToast("Failed to delete referral", "error");
    }
  };



  const patient = appointment?.session?.user;
  const specialist = appointment?.session?.specialist;

  const handleSessionEnded = useCallback(({ specialist, appointmentId }) => {
    try {
      console.log("🔔 session-ended event received:", { specialist, appointmentId });
  
      const currentAppointment = appointmentRef.current;
      console.log("📋 Current appointment:", currentAppointment);
  
      const sessionIdMatch = currentAppointment?.session?.appointment?._id === appointmentId;
      
      const isPatient = currentAppointment?.session?.user?._id === session?.user?.id;
      const isSpecialist = currentAppointment?.session?.specialist?._id === session?.user?.id;
      const isParticipant = isPatient || isSpecialist;
  
      console.log("✅ sessionIdMatch:", sessionIdMatch);
      console.log("✅ isParticipant:", isParticipant);
  
      if (sessionIdMatch && isParticipant) {
        setSessionEnded(true);
        setIsTimerRunning(false);
        setShowRatingField(true);
        handleEndCall();
        if (specialist?.role === "user" || isSpecialist) {
          addToast("Patient has ended the session", "info", 5000);
        } else {
          addToast("Specialist has ended the session", "info", 5000);
        }
        router.push(`/admin/appointments/session/completed/${id}`)
      } else {
        console.warn("⚠️ session-ended received but session or user ID did not match");
      }
    } catch (error) {
      console.error("❌ Error in handleSessionEnded:", error);
    }
  }, [appointmentRef, session?.user?.id, handleEndSession, handleEndCall]); // Add only necessary dependencies
  

  const handleOpenQuestions = async () => {
    // console.log("Question clicked", appointment.session)
    if (appointment.session.appointment.patient) {
      await loadHealthQuestions(appointment.session.appointment.patient);
      setShowQuestions(true);
    }
  };

  if (loading) {
    return <div className="text-center mt-10 text-gray-600">Loading session...</div>;
  }

  if (!appointment) {
    return <div className="text-center mt-10 text-red-500">Appointment not found</div>;
  }

  

  return (
    <div className={`absolute top-0 left-0 w-full transition-all duration-300 z-9999999999`}>
      <div className="bg-black">
        <div className="absolute top-4 right-4 flex gap-2 z-9999999">
          {/* <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="bg-white dark:bg-gray-800 px-3 py-1 rounded text-sm shadow hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          </button> */}
          { isTimerRunning && userRole === "specialist" &&<button
            onClick={() => setShowOptions(!showOptions)}
            className="bg-white dark:bg-gray-800 border px-3 py-1 rounded-full text-xl font-bold shadow hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Options"
          >
            ⋮
          </button>}
        </div>
        
        {/* Timer */}
        <div className="absolute top-5 right-25 transform -translate-x-1/2 mb-6 z-999999">
          <SessionTimer
            appointment={appointment}
            setRemainingTime={setRemainingTime}
            setIsTimerRunning={setIsTimerRunning}
            setSessionEnded={setSessionEnded}
            handleEndSession={handleEndSession}
            handleEndCall={handleEndCall}
            addToast={addToast}
          />
        </div>

        <div className="absolute top-10 left-1/2 -translate-x-1/2 text-white z-[99999999] bg-black/60 backdrop-blur px-4 py-2 rounded">
           { userRole === "user" ? `Consultant: ${appointment.session.specialist.firstName} ${appointment.session.specialist.lastName}` : `Patient: ${appointment.session.user.firstName} ${appointment.session.user.lastName}`}
        </div>


        {/* Video Area */}
        <div className="mb-6">
          <VideoSection
            appointment={appointment}
            session={session}
            sessionEnded={sessionEnded}
            specialistToken={specialistToken}
            patientToken={patientToken}
            userRole={userRole}
            iframeRef={iframeRef}
            iframeUrl={videoUrl}
            id={id}
            videoRef={videoRef}
            handleSessionEnded={handleSessionEnded}
            handleEndUserSession={handleEndSession}
            handleRequestEndSession={handleRequestEndSession}
          />
        </div>

        {showOptions && (userRole === "specialist" || userRole === "consultant") &&
          appointment.session.appointment.status === "pending" &&
          !sessionEnded && (
            <div className="absolute top-16 right-4 bg-gray-800 rounded-xl shadow-xl p-4 w-60 z-[9999999] space-y-3 animate-fade-in border dark:border-gray-700">
              <button
                onClick={handleRequestEndSession}
                className="flex items-center gap-2 w-full border border-white text-white dark:text-white px-4 py-2 rounded-lg transition hover:text-gray-200"
                disabled={endingSession}
              >
                <span>🔚</span>
                {endingSession ? "Ending..." : "End Session"}
              </button>


              <button
                onClick={() => setShowDocs(true)}
                className="flex items-center gap-2 w-full border border-white text-white dark:text-white px-4 py-2 rounded-lg transition hover:text-gray-200"
              >
                <span>📄</span>
                Documentation
              </button>

              <button
                onClick={() => setShowPrescriptions(true)}
                className="flex items-center gap-2 w-full border border-white text-white dark:text-white px-4 py-2 rounded-lg transition hover:text-gray-200"
              >
                <span>💊</span>
                Prescriptions
              </button>

              <button
                onClick={() => setShowReferrals(true)}
                className="flex items-center gap-2 w-full border border-white text-white dark:text-white px-4 py-2 rounded-lg transition hover:text-gray-200"
              >
                <span>⚕️</span>
                Lab Referral
              </button>

              <button
                onClick={() => setShowCertDialog(true)}
                className="flex items-center gap-2 w-full border border-white text-white dark:text-white px-4 py-2 rounded-lg transition hover:text-gray-200"
              >
                <span>📜</span>
                Medical Certificate
              </button>
            </div>

        )}

        {/* Dialogs */}
        <NotesDialog
          showDocs={showDocs}
          setShowDocs={setShowDocs}
          sessionNotes={sessionNotes}
          setSessionNotes={setSessionNotes}
          handleSaveNotes={handleSaveNotes}
          savingNotes={savingNotes}
          patientId={appointment?.session?.user?._id || appointment?.session?.user}
          token={token}
        />

        <PrescriptionDialog
          showPrescriptions={showPrescriptions}
          setShowPrescriptions={setShowPrescriptions}
          prescriptions={prescriptions}
          handleDeletePrescription={handleDeletePrescription}
          newPrescription={newPrescription}
          setNewPrescription={setNewPrescription}
          handleAddPrescription={handleAddPrescription}
          savingPrescription={savingPrescription}
          patientId={appointment?.session?.user?._id || appointment?.session?.user}
          token={token}
        />

        <LabReferralDialog
          showReferrals={showReferrals}
          setShowReferrals={setShowReferrals}
          labReferrals={labReferrals}
          handleDeleteReferral={handleDeleteReferral}
          newReferral={newReferral}
          setNewReferral={setNewReferral}
          handleAddReferral={handleAddReferral}
          savingReferral={savingReferral}
          patientId={appointment?.session?.user?._id || appointment?.session?.user}
          token={token}
        />

        <MedicalCertificateDialog 
          show={showCertDialog}
          onClose={() => setShowCertDialog(false)}
          appointment={appointment.session.appointment}
          session={appointment.session}
          token={token}
          specialistEmail={session?.user?.email}
        />

        <ConfirmationDialog
          isOpen={showConfirmEnd}
          onClose={() => setShowConfirmEnd(false)}
          onCancel={handleRejectEndSession}
          onConfirm={handleEndSession}
          title={userRole === "user" ? "Doctor Requested to End Session" : "End Session?"}
          message={userRole === "user" ? "The doctor has requested to end the session. Please confirm to proceed, as this action cannot be undone." : "Are you sure you want to end this consultation session? This action cannot be undone."}
          confirmText="Yes, End Session"
          cancelText="Cancel"
          requireIndemnity={userRole === "user"}
          indemnityMessage="I agree for this session to be ended and understand that this action cannot be undone."
        />

        {/* <QuestionsDialog
          showQuestions={showQuestions}
          setShowQuestions={setShowQuestions}
          healthQuestions={healthQuestions}
          loadingQuestions={loadingQuestions}
        /> */}
      </div>
    </div>

  );
};

export default SessionPage;
