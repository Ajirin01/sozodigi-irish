import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useUser } from "@/context/UserContext";
import { getSocket } from "@/lib/socket";
import { postData, fetchData } from "@/utils/api";
import IncomingCallDialog from "@/components/IncomingCallDialog"; // ensure this component exists

export default function useSocketEmitOnline() {
  const { data: session } = useSession();
  const { user } = useUser();
  const socketRef = useRef(null);
  const ringtoneRef = useRef(null);

  const [showSoundPrompt, setShowSoundPrompt] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);

  const enableSoundNotifications = () => {
    const silentAudio = new Audio("/sounds/silence.mp3");
    silentAudio
      .play()
      .then(() => {
        setSoundEnabled(true);
        localStorage.setItem("soundEnabled", "true");
        localStorage.setItem("soundPromptShown", "true");
        console.log("🔊 Sound notifications enabled.");
      })
      .catch((err) => {
        console.warn("🔇 Silent audio play failed:", err);
      });
  };

  const handleAccept = async (appointmentId) => {
    socketRef.current.emit("accept-call", {
      specialistId: user._id,
      appointmentId,
    });

    try {
      const appointment = await fetchData(`consultation-appointments/${appointmentId}`);
      const payload = {
        appointment: appointmentId,
        specialist: user._id,
        user: appointment.patient,
      };

      console.log(payload)

      const res = await postData("video-sessions", payload, session?.user?.jwt);
      if (res.success) {
        const sessionData = res.session;
        const { specialistToken, patientToken } = sessionData;

        localStorage.setItem(
          "activeVideoSession",
          JSON.stringify({ session: sessionData, specialistToken, patientToken })
        );

        if (specialistToken && patientToken) {
          socketRef.current.emit("session-created", {
            appointmentId,
            session: sessionData,
            specialistToken,
            patientToken,
          });
        }

        window.location.href = `/admin/appointments/session/${sessionData._id}`;
      } else {
        console.error("❌ Failed to create session:", res.message);
      }
    } catch (err) {
      console.error("💥 Error creating session:", err);
    } finally {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }
      setIncomingCall(null);
    }
  };

  const handleReject = (appointmentId) => {
    socketRef.current.emit("reject-call", {
      specialistId: user._id,
      appointmentId,
    });
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
    setIncomingCall(null);
  };

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !session?.user ||
      !["specialist", "consultant"].includes(session.user.role) ||
      !user
    )
      return;

    socketRef.current = getSocket();

    if (!ringtoneRef.current) {
      ringtoneRef.current = new Audio("/sounds/ringtone.mp3");
      ringtoneRef.current.loop = true;
      ringtoneRef.current.preload = "auto";
    }

    const emitSpecialistOnline = () => {
      if (socketRef.current?.connected && user.role === "specialist") {
        socketRef.current.emit("specialist-online", user);
      }
    };

    socketRef.current.on("connect", () => {
      console.log("✅ Specialist socket connected:", socketRef.current.id);
      setTimeout(emitSpecialistOnline, 500);
    });

    socketRef.current.io.on("reconnect", () => {
      console.log("🔄 Reconnected. Re-emitting specialist-online...");
      emitSpecialistOnline();
    });

    socketRef.current.off("incoming-call");

    socketRef.current.on("incoming-call", async ({ appointmentId }) => {
      try {
        const appointment = await fetchData(`consultation-appointments/${appointmentId}`);

        if (soundEnabled && ringtoneRef.current) {
          ringtoneRef.current.play().catch((err) => {
            console.warn("🔇 Ringtone play error:", err);
          });
        }

        if (showSoundPrompt) return;

        setIncomingCall({ appointmentId, appointment });
      } catch (err) {
        console.error("Failed to fetch appointment:", err);
      }
    });

    return () => {
      setShowSoundPrompt(false);
      socketRef.current?.off("incoming-call");
    };
  }, [session, user, soundEnabled, showSoundPrompt]);

  const IncomingCallDialogWrapper =
    incomingCall && !showSoundPrompt ? (
      <IncomingCallDialog
        appointment={incomingCall}
        onAccept={() => handleAccept(incomingCall.appointmentId)}
        onReject={() => handleReject(incomingCall.appointmentId)}
      />
    ) : null;

  return {
    showSoundPrompt,
    setShowSoundPrompt,
    enableSoundNotifications,
    IncomingCallDialogWrapper,
  };
}