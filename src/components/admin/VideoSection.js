import dynamic from 'next/dynamic';
import Link from 'next/link';
import { RotateCcw, Star } from 'lucide-react';
import useSessionSocket from "@/hooks/useSessionSocket";
import { getSocket } from "@/lib/socket";
import { useRef, useEffect } from 'react';

const AgoraVideoChat = dynamic(() => import('@/components/AgoraVideoChat'), { ssr: false });

const VideoSection = ({
  appointment,
  session,
  sessionEnded,
  specialistToken,
  patientToken,
  userRole,
  id,
  videoRef,
  iframeRef,
  iframeUrl,
  handleSessionEnded,
  handleEndUserSession,
  handleRequestEndSession
}) => {
  const agoraAppId = process.env.NEXT_PUBLIC_VITE_AGORA_API_ID;

  const socketRef = useRef();

  const handleEndSession = () => {
    // emit to backend
    if (socketRef.current) {
      socketRef.current.emit("end-session", { sessionId: session.id });
    }

    handleSessionEnded(); // optionally call this directly
  };


  useEffect(() => {
    socketRef.current = getSocket();
  }, []);
  
  useEffect(() => {
    if (!socketRef.current) return;
  
    socketRef.current.on("session-ended", handleSessionEnded);
  
    return () => {
      socketRef.current.off("session-ended", handleSessionEnded);
    };
  }, [handleSessionEnded]);

  const handleRequestEndSessionLocal = () => {
    if (userRole === "specialist" || userRole === "consultant") {
      if (socketRef.current) {
        socketRef.current.emit("request-patient-end-session", {
          appointmentId: appointment.session.appointment._id
        });
      }
    } else {
      handleRequestEndSession(); // Notify parent to show confirmation with indemnity
    }
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "requestEndCallConfirmation") {
        handleRequestEndSessionLocal();
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [userRole, appointment, handleRequestEndSessionLocal]);
  

  if (appointment.session.appointment.status === "pending" && !sessionEnded) {
    return (
    //   <div className="relative w-full h-[80vh] rounded-xl overflow-hidden shadow-lg border border-gray-300">
    //     <AgoraVideoChat
    //       ref={videoRef}
    //       agoraAppId={agoraAppId}
    //       agoraToken={userRole === "specialist" ? specialistToken : patientToken}
    //       agoraChannelName={id}
    //     />
    //   </div>

    <div className="relative z-99999 w-full h-[100vh] rounded-xl overflow-hidden shadow-lg">
        <iframe
          ref={iframeRef}
          src={iframeUrl}
          title="Consultation Video Chat"
          className="w-full h-full"
          allow="camera; microphone; fullscreen; speaker; display-capture"
        />

      </div>
    );
  }

  return null;
};

export default VideoSection;
