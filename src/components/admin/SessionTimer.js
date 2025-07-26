import { useEffect, useState } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const SessionTimer = ({
  appointment,
  setRemainingTime,
  setIsTimerRunning,
  setSessionEnded,
  handleEndSession,
  handleEndCall,
  addToast
}) => {
  const [localRemainingTime, setLocalRemainingTime] = useState(0);
  const [totalDurationSeconds, setTotalDurationSeconds] = useState(1); // Prevent divide-by-zero

  useEffect(() => {
    if (!appointment || !appointment.session.appointment.duration) return;

    const sessionKey = `sessionStartTime-${appointment.session.appointment._id}`;

    if (appointment.session.appointment.status === "completed") {
      localStorage.removeItem(sessionKey);
      setSessionEnded(true);
      setIsTimerRunning(false);
      return;
    }

    let startTime = parseInt(localStorage.getItem(sessionKey), 10);
    if ((!startTime || isNaN(startTime)) && appointment.session.appointment.status === "pending") {
      startTime = Date.now();
      localStorage.setItem(sessionKey, startTime);
    }

    const sessionStartTime = parseInt(startTime, 10) + 2 * 60 * 1000;
    const sessionDurationMs = (appointment.session.appointment.duration * 60 * 1000) / 60;
    const sessionEndTime = sessionStartTime + sessionDurationMs;

    setTotalDurationSeconds(Math.ceil(sessionDurationMs / 1000));

    let notified = { 70: false, 80: false, 90: false, 95: false };

    const updateTimer = () => {
      const now = Date.now();
      const elapsedTimeMs = now - sessionStartTime;
      const elapsedPercentage = (elapsedTimeMs / sessionDurationMs) * 100;

      const remainingTimeMs = Math.max(0, sessionEndTime - now);
      const remainingSeconds = Math.ceil(remainingTimeMs / 1000);

      setRemainingTime(remainingSeconds);
      setLocalRemainingTime(remainingSeconds);

      const remainingMinutes = Math.ceil(remainingSeconds / 60);

      if (elapsedPercentage >= 70 && !notified[70]) {
        notified[70] = true;
        addToast(`Only ${remainingMinutes} minute(s) left in your session`, 'error', 10000);
      } else if (elapsedPercentage >= 80 && !notified[80]) {
        notified[80] = true;
        addToast(`Only ${remainingMinutes} minute(s) left in your session`, 'error', 10000);
      } else if (elapsedPercentage >= 90 && !notified[90]) {
        notified[90] = true;
        addToast(`Only ${remainingMinutes} minute(s) left in your session`, 'error', 10000);
      } else if (elapsedPercentage >= 95 && !notified[95]) {
        notified[95] = true;
        addToast(`Only ${remainingMinutes} minute(s) left in your session`, 'error', 10000);
      }

      if (remainingTimeMs <= 0) {
        setIsTimerRunning(false);
        setSessionEnded(true);
        clearInterval(timerId);
        handleEndSession();
        handleEndCall();
      }
    };

    setIsTimerRunning(true);
    const timerId = setInterval(updateTimer, 1000);
    updateTimer();

    return () => clearInterval(timerId);
  }, [appointment]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const percentage = ((totalDurationSeconds - localRemainingTime) / totalDurationSeconds) * 100;

  return (
    <div style={{ width: 70, height: 70 }}>
      <CircularProgressbar
        value={percentage}
        text={formatTime(localRemainingTime)}
        styles={buildStyles({
          textColor: "#ff4d4f",
          pathColor: "#ff4d4f",
          trailColor: "#eee",
        })}
      />
    </div>
  );
};

export default SessionTimer;
