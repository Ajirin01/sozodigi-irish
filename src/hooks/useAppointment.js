import { useEffect, useState } from 'react';
import { fetchData, updateData } from '@/utils/api';

const useAppointment = (id, token) => {
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAppointment = async () => {
      try {
        const res = await fetchData(`video-sessions/${id}`, token);

        if (res.success && res.session && res.session.appointment.status === 'pending') {
          await updateData(`video-sessions/${id}`, { startTime: new Date().toISOString() }, token);
        }

        setAppointment(res);
      } catch (err) {
        console.error('Failed to fetch appointment', err);
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      loadAppointment();
    }
  }, [id, token]);

  return { appointment, loading };
};

export default useAppointment;
