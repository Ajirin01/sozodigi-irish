import dynamic from 'next/dynamic';
import Link from 'next/link';
import { RotateCcw, Star } from 'lucide-react';
import useSessionSocket from "@/hooks/useSessionSocket";
import { getSocket } from "@/lib/socket";
import { useState, useRef, useEffect } from 'react';
import ConfirmationDialog from "@/components/ConfirmationDialog";

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
  handleEndUserSession
}) => {
  const agoraAppId = process.env.NEXT_PUBLIC_VITE_AGORA_API_ID;

  const socketRef = useRef();

  const [showConfirmEnd, setShowConfirmEnd] = useState(false);

  const handleEndSession = () => {
    // emit to backend
    if (socketRef.current) {
      socketRef.current.emit("end-session", { sessionId: session.id });
    }

    setShowConfirmEnd(false);
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

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "requestEndCallConfirmation") {
        setShowConfirmEnd(true);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);
  

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

        <ConfirmationDialog
          isOpen={showConfirmEnd}
          onClose={() => setShowConfirmEnd(false)}
          onConfirm={handleEndUserSession}
          title="End Session?"
          message="Are you sure you want to end this consultation session? This action cannot be undone."
          confirmText="Yes, End Session"
          cancelText="Cancel"
        />

      </div>
    );
  }

  return null;
};

export default VideoSection;
