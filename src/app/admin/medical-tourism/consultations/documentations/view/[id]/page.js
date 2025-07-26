"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetchData, updateData, postData } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import {
  TrashIcon,
  DocumentIcon,
  EyeIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import ConfirmationDialog from "@/components/ConfirmationDialog";

const ViewConsultationDocumentation = () => {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const { addToast } = useToast();

  const [documentation, setDocumentation] = useState(null);
  const [newFile, setNewFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFilePath, setSelectedFilePath] = useState(null);

  const loadDocumentation = async () => {
    const docRes = await fetchData(
      `consultation-documents/get/custom/${id}`,
      token
    );
    setDocumentation(docRes);
  };

  useEffect(() => {
    if (token && id) loadDocumentation();
  }, [token, id]);

  const handleFileChange = (e) => setNewFile(e.target.files[0]);

  const handleAddFile = async () => {
    if (!newFile) {
      addToast("Please select a file to upload", "error");
      return;
    }

    const formData = new FormData();
    formData.append("document", newFile);

    try {
      setLoading(true);
      await updateData(
        `consultation-documents/add/file/custom/${id}`,
        formData,
        token,
        true
      );
      addToast("File added successfully", "success");
      setNewFile(null);
      await loadDocumentation();
    } catch {
      addToast("Failed to add file", "error");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (filePath) => {
    setSelectedFilePath(filePath);
    setDialogOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!selectedFilePath) return;
    try {
      setLoading(true);
      await postData(
        `consultation-documents/delete/file/custom/${id}`,
        { filePath: selectedFilePath },
        token
      );
      addToast("File deleted successfully", "success");
      await loadDocumentation();
    } catch {
      addToast("Failed to delete file", "error");
    } finally {
      setLoading(false);
      setDialogOpen(false);
      setSelectedFilePath(null);
    }
  };

  const handleViewFile = (filePath) => {
    window.open(`${process.env.NEXT_PUBLIC_NODE_BASE_URL}/${filePath}`, "_blank");
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-md p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Consultation Documentation
        </h1>
        <button
          onClick={() =>
            router.push("/admin/medical-tourism/consultations/documentations")
          }
          className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          Back to List
        </button>
      </div>

      {documentation ? (
        <>
          {/* Appointment Info */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Appointment Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
              <p>
                <span className="font-medium">Patient:</span>{" "}
                {documentation.appointment?.patient?.firstName}{" "}
                {documentation.appointment?.patient?.lastName}
              </p>
              <p>
                <span className="font-medium">Consultant:</span>{" "}
                {documentation.appointment?.consultant?.firstName}{" "}
                {documentation.appointment?.consultant?.lastName}
              </p>
              <p>
                <span className="font-medium">Date:</span>{" "}
                {new Date(documentation.appointment?.date).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Notes
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {documentation.notes || (
                <em className="text-gray-400">No notes available</em>
              )}
            </p>
          </div>

          {/* Uploaded Files */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Uploaded Files
            </h2>
            {documentation.documents?.length ? (
              <ul className="space-y-3">
                {documentation.documents.map((file, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <div className="flex items-center gap-3 text-sm text-gray-800 dark:text-gray-200">
                      <DocumentIcon className="w-5 h-5 text-indigo-500" />
                      <span>File {index + 1}</span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleViewFile(file)}
                        className="text-blue-600 hover:text-blue-800 transition"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openDeleteDialog(file)}
                        className="text-red-600 hover:text-red-800 transition"
                        disabled={loading}
                      >
                        {loading && selectedFilePath === file ? (
                          <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        ) : (
                          <TrashIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 italic">No files uploaded yet.</p>
            )}
          </div>

          {/* Upload File */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Add New File
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full sm:w-auto border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 text-sm text-gray-800 dark:text-gray-200 dark:bg-gray-900"
              />
              <button
                onClick={handleAddFile}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition flex items-center gap-2"
                disabled={loading}
              >
                {loading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : null}
                Upload
              </button>
            </div>
          </div>
        </>
      ) : (
        <p className="text-gray-600 dark:text-gray-300">Loading documentation...</p>
      )}

      {/* Shared-style Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleDeleteConfirmed}
        title="Delete File"
        message="Are you sure you want to delete this file? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        loading={loading}
      />
    </div>
  );
};

export default ViewConsultationDocumentation;
