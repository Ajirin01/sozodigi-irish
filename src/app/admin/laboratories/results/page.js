"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrashIcon,
  EyeIcon,
  PencilIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";

import { fetchData, deleteData } from "@/utils/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/admin/ui/table";

import { useToast } from "@/context/ToastContext";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import Badge from "@/components/admin/ui/badge/Badge";

import { saveAs } from 'file-saver';

export default function LabResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const { addToast } = useToast();
  const alertSuccess = (msg) => addToast(msg, "success");
  const alertError = (msg) => addToast(msg, "error");

  const { data: session } = useSession();
  const token = session?.user?.jwt;

  useEffect(() => {
    const loadResults = async () => {
      try {
        const data = await fetchData("/lab-results/get-all/no-pagination");
        setResults(data);
      } catch (err) {
        console.error("Error fetching lab results:", err);
        alertError("Failed to load lab results");
      } finally {
        setLoading(false);
      }
    };
    loadResults();
  }, []);

  const deleteResult = async () => {
    if (!itemToDelete) return;

    try {
      await deleteData(`/lab-results/${itemToDelete._id}`, token);
      setResults((prev) =>
        prev.filter((result) => result._id !== itemToDelete._id)
      );
      alertSuccess("Lab result deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      alertError("Failed to delete result");
    } finally {
      setIsDialogOpen(false);
    }
  };

  const handleDownload = (filePath) => {
    const url = `${process.env.NEXT_PUBLIC_NODE_BASE_URL}${filePath}`;
    saveAs(url); // Automatically triggers a download
  };
  
  

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:text-gray-300 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Lab Results</h1>
        <Link
          href="/admin/laboratories/results/add"
          className="bg-indigo-600 text-white px-4 py-2 rounded-full border border-indigo-400 shadow-lg shadow-indigo-500/50 ring-2 ring-indigo-300 hover:ring-4 transition-all duration-300"
        >
          Upload New Result
        </Link>
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[800px]">
          {loading ? (
            <p className="text-gray-600">Loading lab results...</p>
          ) : (
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400">Patient</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400">Date</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400">Order ID</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400">Status</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400">Result</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {results.map((result) => (
                  <TableRow key={result._id}>
                    <TableCell className="px-5 py-4 text-start">
                      {result.user?.firstName + " " + result.user?.lastName || "N/A"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                      {new Date(result.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                      {result.order || "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Badge
                        size="sm"
                        color={
                          result.status === "completed"
                            ? "success"
                            : result.status === "pending"
                            ? "warning"
                            : "primary"
                        }
                      >
                        {result.status || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                      <div className="flex items-center gap-4">
                        <Link
                          href={`${process.env.NEXT_PUBLIC_NODE_BASE_URL}${result.resultFile}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 underline"
                        >
                          View
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 flex gap-3">
                        <button
                          onClick={() => handleDownload(result.resultFile)}
                          className="flex items-center gap-1 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4 text-sm" />
                        </button>
                      <Link href={`/admin/laboratories/results/edit/${result._id}`}>
                        <PencilIcon className="w-5 h-5 text-indigo-500 hover:text-indigo-700" />
                      </Link>
                      <button
                        onClick={() => {
                          setItemToDelete(result);
                          setIsDialogOpen(true);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={deleteResult}
        title="Delete Result"
        message={`Are you sure you want to delete the result for "${itemToDelete?.user?.firstName || "this patient"}"? This cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="No, Cancel"
      />
    </div>
  );
}
