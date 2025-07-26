"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
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

const AvailabilityListPage = () => {
  const [availabilities, setAvailabilities] = useState([]);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const userId = session?.user?.id;
  const { addToast } = useToast();

  const loadAvailabilities = async () => {
    try {
      const res = await fetchData(`availabilities/user/${userId}`, token);
      setAvailabilities(res || []);
    } catch (err) {
      console.error("Failed to load availabilities", err);
      addToast("Error loading availabilities", "error");
    }
  };

  useEffect(() => {
    if (token && userId) loadAvailabilities();
  }, [token, userId]);

  const handleDelete = async () => {
    try {
      await deleteData(`availabilities/${itemToDelete._id}`, token);
      addToast("Availability deleted successfully", "success");
      setAvailabilities((prev) => prev.filter((a) => a._id !== itemToDelete._id));
    } catch (error) {
      addToast("Failed to delete availability", "error");
    } finally {
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:text-gray-300 p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">My Availabilities</h1>
        <Link
          href="/admin/availabilities/create"
          className="bg-indigo-600 text-white px-4 py-2 rounded-full border border-indigo-400 shadow-lg shadow-indigo-500/50 ring-2 ring-indigo-300 hover:ring-4 transition-all duration-300"
        >
          + Add Slot
        </Link>
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[700px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-start">Type</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-start">category</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-start">Date / Day</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-start">Time Range</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-start">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {availabilities.length > 0 ? (
                availabilities.map((slot) => (
                  <TableRow key={slot._id}>
                    <TableCell className="px-5 py-4 capitalize">{slot.type}</TableCell>
                    <TableCell className="px-5 py-4 capitalize">{slot.category}</TableCell>
                    <TableCell className="px-5 py-4">
                      {slot.type === "recurring" ? slot.dayOfWeek : format(new Date(slot.date), "PPP")}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      {slot.startTime} - {slot.endTime}
                    </TableCell>
                    <TableCell className="px-5 py-4 flex gap-3">
                      {/* <Link
                        href={`/admin/medical-tourism/availabilities/edit/${slot._id}`}
                        className="text-blue-500"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </Link> */}
                      <button
                        className="text-red-500"
                        onClick={() => {
                          setItemToDelete(slot);
                          setIsDialogOpen(true);
                        }}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                    No availability slots found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Availability"
        message="Are you sure you want to delete this slot?"
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default AvailabilityListPage;
