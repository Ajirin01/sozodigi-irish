"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchData, deleteData } from "@/utils/api";
import { useSession } from "next-auth/react";
import { PencilSquareIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
import { useToast } from "@/context/ToastContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/admin/ui/table";
import ConfirmationDialog from "@/components/ConfirmationDialog";

const ConsultationDocumentationList = () => {
  const [docs, setDocs] = useState([]);
  const [filters, setFilters] = useState({
    appointment: "",
    patientName: "",
    startDate: "",
    endDate: "",
  });
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const { addToast } = useToast();

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (filters.appointment) params.append("appointment", filters.appointment);
    if (filters.patientName) params.append("patientName", filters.patientName);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    return params.toString();
  };

  const loadDocs = async () => {
    const query = buildQuery();
    const url = `consultation-documents/get/all/custom${query ? `?${query}` : ""}`;
    const res = await fetchData(url, token);
    setDocs(res.data || []);
  };

  useEffect(() => {
    if (token) loadDocs();
  }, [token]);

  const handleDelete = async () => {
    try {
      await deleteData(`consultation-documents/delete/custom/${itemToDelete._id}`, token);
      addToast("Documentation deleted successfully", "success");
      setDocs((prev) => prev.filter((doc) => doc._id !== itemToDelete._id));
    } catch {
      addToast("Failed to delete documentation", "error");
    } finally {
      setIsDialogOpen(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    loadDocs();
  };

  const handleClearFilters = () => {
    setFilters({
      appointment: "",
      patientName: "",
      startDate: "",
      endDate: "",
    });
    loadDocs();
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:bg-gray-900 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Consultation Documentation
        </h1>
        <Link
          href="/admin/medical-tourism/consultations/documentations/create"
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-full shadow hover:bg-indigo-700 transition"
        >
          + Add Documentation
        </Link>
      </div>

      {/* Filters */}
      <form
        onSubmit={handleFilterSubmit}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Appointment ID
          </label>
          <input
            type="text"
            name="appointment"
            value={filters.appointment}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
            placeholder="e.g. 653bc49f7..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Patient Name
          </label>
          <input
            type="text"
            name="patientName"
            value={filters.patientName}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
            placeholder="e.g. John"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start Date
          </label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            End Date
          </label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
          />
        </div>
        <div className="col-span-full flex gap-3 mt-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded shadow"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-4 py-2 rounded shadow"
          >
            Clear Filters
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Patient</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Notes</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {docs.length > 0 ? (
              docs.map((doc) => (
                <TableRow key={doc._id}>
                    <TableCell className="px-5 py-4 text-start">
                        {doc.appointment?.patient?.firstName}{" "}
                        {doc.appointment?.patient?.lastName}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">{doc.notes || "-"}</TableCell>
                    <TableCell className="px-5 py-4 text-start flex gap-3">
                        {/* Edit Icon */}
                        <Link
                            href={`/admin/medical-tourism/consultations/documentations/edit/${doc._id}`}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            <PencilSquareIcon className="w-5 h-5" />
                        </Link>

                        {/* View Icon */}
                        <Link
                            href={`/admin/medical-tourism/consultations/documentations/view/${doc._id}`}
                            className="text-green-600 hover:text-green-800"
                        >
                            <EyeIcon className="w-5 h-5" />
                        </Link>

                        {/* Delete Icon */}
                        <button
                            onClick={() => {
                            setItemToDelete(doc);
                            setIsDialogOpen(true);
                            }}
                            className="text-red-600 hover:text-red-800"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </TableCell>

                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                  No documentation found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Documentation"
        message="Are you sure you want to delete this documentation?"
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default ConsultationDocumentationList;
