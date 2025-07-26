"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchData } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import { useUser } from "@/context/UserContext";

const LabReferralsList = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const { data: session } = useSession();
  const { user } = useUser();
  const { addToast } = useToast();
  const token = session?.user?.jwt;

  const isDoctor = user?.role === "specialist";
  const isUser = user?.role === "user";
  const isAdmin = user?.role === "admin";
  const isLabAdmin = user?.role === "labAdmin"

  useEffect(() => {
    const loadLabReferrals = async () => {
      setLoading(true);
      let endpoint
      try {
        if(isUser){
          endpoint = `lab-results/by-user/${user._id}/referrals`;
        }else if(isDoctor || isLabAdmin){
          endpoint = `lab-results/referrals/get-all/no-pagination`;
        }else if(isAdmin){
          endpoint = `lab-results/referrals/get-all/no-pagination`;
        }

        console.log(endpoint)

        const res = await fetchData(endpoint, token);
        console.log(res.sessions || res || [])
        setSessions(res.sessions || res || []);
      } catch (error) {
        console.error(error);
        addToast("Failed to load lab referrals", "error");
      } finally {
        setLoading(false);
      }
    };

    if (user?._id && token) {
      loadLabReferrals();
    }
  }, [user, token]);

  if (loading) return <p className="text-center mt-8">Loading lab referrals...</p>;

  if (sessions.length === 0) {
    return <p className="text-center mt-8">No lab referrals found.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 dark:text-gray-300 p-6 rounded-xl shadow-md mt-6">
      <h2 className="text-2xl font-semibold text-center mb-4">
        {isDoctor ? "Lab Referrals You've Made" : "Your Lab Referrals"}
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

          <ul className="space-y-2 pl-4 border-l-2 border-amber-500">
            {session.labReferrals?.map((ref, idx) => (
              <li
                key={idx}
                className="bg-white dark:bg-gray-700 p-3 rounded shadow-sm"
              >
                <div className="flex justify-between items-start flex-col sm:flex-row">
                  <p>
                    <strong>{ref.testName}</strong>{" "}
                    {ref.labName && <span>→ {ref.labName}</span>}
                    <br />
                    <small>Status: {ref.status}</small>
                    {ref.note && (
                      <div className="mt-1 italic text-sm opacity-80">
                        {ref.note}
                      </div>
                    )}
                  </p>
                  <p className="text-sm text-right mt-2 sm:mt-0">
                    {new Date(ref.referralDate).toLocaleDateString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div>
            <a
              href={`/admin/lab-referrals/${isUser ? session._id : session.session._id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline mt-2 inline-block"
            >
              View Referral
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LabReferralsList;
