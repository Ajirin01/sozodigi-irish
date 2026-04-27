"use client";
import React, { useState, useEffect } from "react";
import { fetchData } from "@/utils/api";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FaSearch, FaUser, FaEnvelope, FaPhone } from "react-icons/fa";

const apiUrl = process.env.NEXT_PUBLIC_NODE_BASE_URL;

const PatientsListPage = () => {
  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const data = await fetchData("users/get-all/no-pagination?role=user", token);
        setPatients(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setError(e.message || "Failed to load patients. You might not have permission to view this page.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const filtered = patients.filter(p => {
    const name = `${p.firstName} ${p.lastName}`.toLowerCase();
    const email = (p.email || "").toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Patients</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and view patient records</p>
          </div>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white w-72"
            />
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-semibold">No patients found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(patient => (
              <Link key={patient._id} href={`/admin/patients/${patient._id}`}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4 mb-4">
                    {patient.profileImage ? (
                      <img
                        src={`${apiUrl}${patient.profileImage}`}
                        alt={patient.firstName}
                        className="w-14 h-14 rounded-full object-cover border-2 border-blue-100"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center border-2 border-blue-100">
                        <FaUser className="text-blue-400 text-xl" />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-blue-600 transition-colors">
                        {patient.firstName} {patient.lastName}
                      </p>
                      <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full">
                        Patient
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-sm text-gray-500 dark:text-gray-400">
                    {patient.email && (
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-gray-400 shrink-0" />
                        <span className="truncate">{patient.email}</span>
                      </div>
                    )}
                    {patient.phone && (
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-gray-400 shrink-0" />
                        <span>{patient.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 text-right">
                    <span className="text-blue-600 text-sm font-semibold group-hover:underline">View Records →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientsListPage;
