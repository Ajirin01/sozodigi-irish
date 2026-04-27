import React, { useState, useEffect } from 'react';
import { fetchData } from '@/utils/api';

const PatientHistory = ({ userId, token, type }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId && token) {
      fetchHistory();
    }
  }, [userId, token]);

  const fetchHistory = async () => {
    if (!userId || userId === 'undefined' || userId === null) return;
    setLoading(true);
    try {
      const res = await fetchData(`video-sessions/by-user/${userId}`, token);
      if (res?.success && res.sessions) {
        setHistory(res.sessions);
      }
    } catch (err) {
      console.error(`Failed to fetch ${type} history for user ${userId}:`, err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-gray-500 text-sm">Loading history...</p>;
  if (!history.length) return <p className="text-gray-500 text-sm">No past records found.</p>;

  return (
    <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
      {history.map((session) => {
        let content = null;
        if (type === 'notes') {
          content = session.sessionNotes ? (
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{session.sessionNotes}</p>
          ) : null;
        } else if (type === 'prescriptions') {
          content = session.prescriptions?.length > 0 ? (
            <div className="space-y-1">
              {session.prescriptions.map((p, i) => (
                <p key={i} className="text-sm text-gray-700">• {p.medication} ({p.dosage} - {p.frequency})</p>
              ))}
            </div>
          ) : null;
        } else if (type === 'referrals') {
          content = session.labReferrals?.length > 0 ? (
            <div className="space-y-1">
              {session.labReferrals.map((r, i) => (
                <p key={i} className="text-sm text-gray-700">• {r.testName} ({r.status})</p>
              ))}
            </div>
          ) : null;
        }

        if (!content) return null;

        return (
          <div key={session._id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-xs font-bold text-gray-500 mb-1 border-b pb-1">
              {new Date(session.createdAt).toLocaleDateString()} - Specialist: {session.specialist?.firstName} {session.specialist?.lastName}
            </p>
            {content}
          </div>
        );
      })}
    </div>
  );
};

export default PatientHistory;
