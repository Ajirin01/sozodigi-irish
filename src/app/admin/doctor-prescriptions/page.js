"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchData } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import { useUser } from "@/context/UserContext";

const PrescriptionsList = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const { data: session } = useSession();
  const { user } = useUser();
  const { addToast } = useToast();
  const token = session?.user?.jwt;

  const isDoctor = user?.role === "specialist";
  const isUser = user?.role === "user";
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const loadPrescriptions = async () => {
      setLoading(true);
      try {
        let endpoint= ""
        if(isDoctor){
          endpoint = `video-sessions/by-specialist/${user?._id}/prescriptions`
        }else if(isUser){
          endpoint = `video-sessions/by-user/${user?._id}/prescriptions`;
        }else if(isAdmin){
          endpoint = `video-sessions/by-user/${user?._id}/prescriptions`
        }

        const res = await fetchData(endpoint, token);
        console.log(res)
        setSessions(res?.sessions || []);
      } catch (error) {
        console.error(error);
        addToast("Failed to load prescriptions", "error");
      } finally {
        setLoading(false);
      }
    };

    if (user?._id && token) {
      loadPrescriptions();
    }
  }, [user, token]);

  if (loading) return <p className="text-center mt-8">Loading prescriptions...</p>;

  if (sessions.length === 0) {
    return <p className="text-center mt-8">No prescriptions found.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 dark:text-gray-300 p-6 rounded-xl shadow-md mt-6">
      <h2 className="text-2xl font-semibold text-center mb-4">
        {isDoctor ? "Prescriptions You've Issued" : "Your Prescriptions"}
      </h2>

      {sessions.map((session) => (
        <div
          key={session._id}
          className="mb-6 border p-4 rounded-lg bg-gray-100 dark:bg-gray-800"
        >
          <div className="mb-2">
            <p>
              <strong>Date:</strong>{" "}
              {new Date(session.createdAt).toLocaleString()}
            </p>
            {isDoctor && session.user?.fullName && (
              <p>
                <strong>Patient:</strong> {session.user.fullName}
              </p>
            )}
            {isUser && session.specialist?.fullName && (
              <p>
                <strong>Doctor:</strong> {session.specialist.fullName}
              </p>
            )}
          </div>
          <ul className="space-y-2 pl-4 border-l-2 border-indigo-500">
            {session.prescriptions.map((prescription, idx) => (
              <li
                key={prescription._id || idx}
                className="bg-white dark:bg-gray-700 p-3 rounded shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <p>
                    { prescription.medication } <small>({ prescription.dosage } { prescription.frequency })</small>
                  </p>
                </div>
              </li>
            ))}
          </ul>
          
          <div>
            {session && (
                <a
                    href={`/admin/doctor-prescriptions/${session._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                >
                    View
                </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PrescriptionsList;
