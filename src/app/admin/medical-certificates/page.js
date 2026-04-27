"use client";
import React, { useState, useEffect } from "react";
import { fetchData, deleteData } from "@/utils/api";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FaPlus, FaSearch, FaFileAlt, FaTrash, FaEye, FaEnvelope } from "react-icons/fa";
import { useToast } from "@/context/ToastContext";
import DeleteCertificateModal from "@/components/admin/DeleteCertificateModal";

const MedicalCertificatesListPage = () => {
  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const userRole = session?.user?.role;
  const { addToast } = useToast();

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [certificateToDelete, setCertificateToDelete] = useState(null);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await fetchData("certificates/get-all/no-pagination", token);
      if (Array.isArray(res)) {
        setCertificates(res);
      }
    } catch (error) {
      console.error("Failed to fetch certificates:", error);
      addToast("Failed to load certificates.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && (userRole === "admin" || userRole === "specialist" || userRole === "user")) {
      fetchCertificates();
    }
  }, [token, userRole]);

  const handleSendEmail = async (certId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_NODE_BASE_URL}/medical-tourism/certificates/send-email/${certId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        addToast("Certificate sent to patient's email!", "success");
      } else {
        addToast(data.message || "Failed to send email.", "error");
      }
    } catch (error) {
      addToast("An error occurred while sending email.", "error");
    }
  };

  const filteredCertificates = certificates.filter(cert => 
    cert.certID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cert.patient?.firstName + " " + cert.patient?.lastName).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (cert) => {
    setCertificateToDelete(cert);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!certificateToDelete) return;
    try {
      await deleteData(`certificates/${certificateToDelete._id}`, token);
      addToast("Certificate deleted successfully.", "success");
      setCertificates(prev => prev.filter(c => c._id !== certificateToDelete._id));
    } catch (error) {
      addToast("Failed to delete certificate.", "error");
    } finally {
      setIsDeleteModalOpen(false);
      setCertificateToDelete(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>;

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Medical Certificates</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage and issue medical documentation.</p>
        </div>
        {(userRole === "specialist" || userRole === "admin") && (
          <Link 
            href="/admin/medical-certificates/create"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg active:scale-95"
          >
            <FaPlus /> Issue New Certificate
          </Link>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
           <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
           <input 
             type="text" 
             placeholder="Search by ID or Patient Name..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
           />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-extrabold tracking-widest border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-5">Certificate ID</th>
                <th className="px-6 py-5">Patient</th>
                <th className="px-6 py-5">Diagnosis</th>
                <th className="px-6 py-5">Issue Date</th>
                <th className="px-6 py-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {filteredCertificates.map((cert) => (
                <tr key={cert._id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600">
                         <FaFileAlt />
                       </div>
                       <span className="font-bold text-gray-900 dark:text-white uppercase">{cert.certID}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800 dark:text-gray-200">
                        {cert.patient?.firstName} {cert.patient?.lastName}
                      </span>
                      <span className="text-xs text-gray-500">{cert.patient?.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 max-w-xs truncate text-gray-600 dark:text-gray-400 italic">
                    "{cert.diagnosis}"
                  </td>
                  <td className="px-6 py-5 text-gray-600 dark:text-gray-400">
                    {new Date(cert.issueDate || cert.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                       <Link 
                         href={`/admin/medical-certificates/${cert._id}`}
                         className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                         title="View Certificate"
                       >
                         <FaEye />
                       </Link>
                       {(userRole === "admin" || userRole === "specialist" || userRole === "superAdmin") && (
                         <button 
                           onClick={() => handleSendEmail(cert._id)}
                           className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
                           title="Send to Patient Email"
                         >
                           <FaEnvelope />
                         </button>
                       )}
                       {userRole === "admin" && (
                         <button 
                           onClick={() => handleDeleteClick(cert)}
                           className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                           title="Delete Certificate"
                         >
                           <FaTrash />
                         </button>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCertificates.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                    No certificates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteCertificateModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        certID={certificateToDelete?.certID}
      />
    </div>
  );
};

export default MedicalCertificatesListPage;
