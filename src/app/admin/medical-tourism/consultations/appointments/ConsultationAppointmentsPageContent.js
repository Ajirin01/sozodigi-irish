"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { fetchData, deleteData } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/admin/ui/table";

const ConsultationAppointmentsPageContent  = () => {
  const [appointments, setAppointments] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1, currentPage: 1 });
  const [filters, setFilters] = useState({ status: "", dateFrom: "", dateTo: "" });
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const { addToast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const userRole = session?.user?.role

  const page = parseInt(searchParams.get("page") || "1", 10);

  const loadAppointments = async () => {
    try {
      const query = new URLSearchParams({
        page,
        ...filters,
      }).toString();

      const res = await fetchData(`consultation-appointments/all/paginated?${query}`, token);
      setAppointments(res.data || []);
      setPagination({ totalPages: res.totalPages, currentPage: res.currentPage });
    } catch (err) {
      console.error("Failed to load appointments", err);
    }
  };

  useEffect(() => {
    if (token) loadAppointments();
  }, [token, page, filters]);

  const handleDelete = async () => {
    try {
      await deleteData(`consultation-appointments/${itemToDelete._id}`, token);
      addToast("Appointment deleted successfully", "success");
      setAppointments((prev) => prev.filter((a) => a._id !== itemToDelete._id));
    } catch (error) {
      addToast("Failed to delete appointment", "error");
    } finally {
      setIsDialogOpen(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const applyFilters = () => {
    router.push("?page=1");
    loadAppointments();
  };

  const clearFilters = () => {
    setFilters({ status: "", dateFrom: "", dateTo: "" });
    router.push("?page=1");
  };

  const changePage = (newPage) => {
    router.push(`?page=${newPage}`);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:text-gray-300 p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Consultation Appointments</h1>
        { userRole === "user" && <Link
          href='/admin/consultation/book'
          className="bg-indigo-600 text-white px-4 py-2 rounded-full border border-indigo-400 shadow-lg shadow-indigo-500/50 ring-2 ring-indigo-300 hover:ring-4 transition-all duration-300"
        >
          + Book Appointment
        </Link>}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="p-2 rounded border border-gray-300"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Date From</label>
          <input
            type="date"
            name="dateFrom"
            value={filters.dateFrom}
            onChange={handleFilterChange}
            className="p-2 rounded border border-gray-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Date To</label>
          <input
            type="date"
            name="dateTo"
            value={filters.dateTo}
            onChange={handleFilterChange}
            className="p-2 rounded border border-gray-300"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={applyFilters}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[700px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-start">Patient</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-start">Consultant</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-start">Date</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-start">Status</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-start">Payment</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-start">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <TableRow key={appointment._id}>
                    <TableCell className="px-5 py-4">
                      {appointment.patient?.firstName} {appointment.patient?.lastName}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      {appointment.consultant?.firstName} {appointment.consultant?.lastName}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      {appointment.date ? format(new Date(appointment.date), "PPPp") : "-"}
                    </TableCell>
                    <TableCell className="px-5 py-4 capitalize">
                      {appointment.status}
                    </TableCell>
                    <TableCell className="px-5 py-4 capitalize">
                      {appointment.paymentStatus}
                    </TableCell>
                    <TableCell className="px-5 py-4 flex gap-3">
                      <Link href={`/admin/medical-tourism/consultations/appointments/edit/${appointment._id}`} className="text-blue-500">
                        <PencilSquareIcon className="w-5 h-5" />
                      </Link>
                      <button className="text-red-500" onClick={() => { setItemToDelete(appointment); setIsDialogOpen(true); }}>
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                    No appointments found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {[...Array(pagination.totalPages)].map((_, idx) => {
            const pg = idx + 1;
            return (
              <button
                key={pg}
                className={`px-3 py-1 rounded text-sm border ${
                  pg === pagination.currentPage
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
                onClick={() => changePage(pg)}
              >
                {pg}
              </button>
            );
          })}
        </div>
      )}

      <ConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Appointment"
        message="Are you sure you want to delete this appointment?"
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default ConsultationAppointmentsPageContent ;
