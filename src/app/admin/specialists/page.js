"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/context/ToastContext";
import { fetchData, deleteData } from "@/utils/api";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import Link from "next/link";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { useSession } from "next-auth/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/admin/ui/table";
import { Loader2 } from "lucide-react";

export default function SpecialistsPageContent() {
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const { addToast } = useToast();

  const loadSpecialists = async () => {
    setLoading(true);
    try {
      const res = await fetchData("users/get-all/no-pagination?role=specialist", token);
      setSpecialists(res);
    } catch (err) {
      addToast("Failed to load specialists", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(session?.user && token)
    loadSpecialists();
  }, [session, token]);

  const handleDelete = async () => {
    try {
      await deleteData(`/api/specialists/${deletingId}`);
      addToast("Specialist deleted successfully", "success");
      setSpecialists((prev) => prev.filter((specialist) => specialist._id !== deletingId));
    } catch {
      addToast("Failed to delete specialist", "error");
    } finally {
      setIsDialogOpen(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:text-gray-300 p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Specialists</h1>
        <Link
          href="/admin/specialists/create"
          className="bg-indigo-600 text-white px-4 py-2 rounded-full border border-indigo-400 shadow-lg shadow-indigo-500/50 ring-2 ring-indigo-300 hover:ring-4 transition-all duration-300"
        >
          + Add Specialist
        </Link>
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[800px]">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            </div>
          ) : (
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Full Name</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Email</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Specialty</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Approved</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {specialists.length > 0 ? (
                  specialists.map((specialist) => (
                    <TableRow key={specialist._id}>
                      <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">{specialist.firstName} {specialist.lastName}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">{specialist.email}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">{specialist.specialty || "-"}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">{specialist.isApproved ? "Yes" : "No"}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400 flex gap-3">
                        <Link href={`/admin/specialists/details/${specialist._id}`} className="text-blue-500">
                          <PencilIcon className="w-5 h-5" />
                        </Link>
                        <button className="text-red-500" onClick={() => {
                          setDeletingId(specialist._id);
                          setIsDialogOpen(true);
                        }}>
                          <Trash2Icon className="w-5 h-5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="px-5 py-4 text-start flex gap-3">
                      No specialists found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <ConfirmationDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            onConfirm={handleDelete}
            title="Delete Appointment"
            message="Are you sure you want to delete this specialist?"
            confirmText="Yes, Delete"
            cancelText="Cancel"
        />
    </div>
  );
}
