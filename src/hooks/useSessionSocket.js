import { useEffect, useRef } from 'react';
import { getSocket } from "@/lib/socket";

const useSessionSocket = ({
  session,
  appointmentRef,
  setSessionEnded,
  setIsTimerRunning,
  setShowRatingField,
  handleEndSession,
  handleEndCall,
  addToast,
  router,
  sessionEnded
}) => {
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = getSocket();
    // return () => socketRef.current.disconnect();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (appointmentRef.current?.session?.appointment?.status === 'pending' && !sessionEnded) {
        socketRef.current.emit('session-ended', {
          appointmentId: appointmentRef.current.session.appointment._id,
          specialist: session.user
        });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [appointmentRef, sessionEnded]);

  useEffect(() => {
    const socket = socketRef.current;

    // socket.on('call-rejected', ({ appointmentId }) => {
    //   alert('The specialist rejected your consultation. Please choose another available specialist.');
    //   router.push(`/admin/available-specialists?appointmentId=${appointmentId}`);
    // });

    // socket.on('call-timeout', ({ appointmentId }) => {
    //   alert('Call timed out. The specialist did not respond.');
    //   router.push(`/admin/available-specialists?appointmentId=${appointmentId}`);
    // });

    socket.on('specialist-disconnected', ({ appointmentId }) => {
      alert('The specialist disconnected unexpectedly. Please try another.');
      router.push(`/admin/available-specialists?appointmentId=${appointmentId}`);
    });

    socket.on('session-ended', ({ specialist, appointmentId }) => {
      const currentAppointment = appointmentRef.current;
      if (
        currentAppointment?.session?.appointment?._id === appointmentId &&
        currentAppointment?.session?.appointment?.patient?._id === session?.user?.id
      ) {
        setSessionEnded(true);
        setIsTimerRunning(false);
        setShowRatingField(true);
        handleEndSession();
        handleEndCall();
        addToast('Specialist ended the session', 'info', 5000);
      }
    });

    return () => {
      // socket.off('call-rejected');
      // socket.off('call-timeout');
      socket.off('specialist-disconnected');
      socket.off('session-ended');
    };
  }, [appointmentRef, session]);

  return socketRef;
};

export default useSessionSocket;