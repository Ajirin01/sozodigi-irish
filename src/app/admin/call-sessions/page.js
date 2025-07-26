"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/admin/ui/table";
import { fetchData } from "@/utils/api";
import { MoreVertical } from "lucide-react";
import Link from "next/link";

const VideoSessionsPage = () => {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);

  const token = session?.user?.jwt;

  useEffect(() => {
    if (token) {
      loadSessions(page, token);
    }
  }, [token, page]);

  const loadSessions = async (currentPage, token) => {
    setLoading(true);
    try {
      const endpoint = `video-sessions/get/all/paginated?page=${currentPage}`;
      const data = await fetchData(endpoint, token);
      setSessions(data.data);
      setTotalPages(data.pages || 1);
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = (id) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:text-gray-300 p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Video Sessions</h1>
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1000px]">
          {loading ? (
            <p>Loading sessions...</p>
          ) : (
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader>User</TableCell>
                  <TableCell isHeader>Specialist</TableCell>
                  <TableCell isHeader>Start Time</TableCell>
                  <TableCell isHeader>End Time</TableCell>
                  <TableCell isHeader>Duration</TableCell>
                  { session?.user?.role !== "user" && <TableCell isHeader>Action</TableCell>}
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {sessions.map((videoSession) => (
                  <TableRow key={videoSession._id}>
                    <TableCell>{videoSession.user?.firstName} {videoSession.user?.lastName}</TableCell>
                    <TableCell>{videoSession.specialist?.firstName} {videoSession.specialist?.lastName}</TableCell>
                    <TableCell>
                      {videoSession.startTime ? new Date(videoSession.startTime).toLocaleString() : "N/A"}
                    </TableCell>
                    <TableCell>
                      {videoSession.endTime ? new Date(videoSession.endTime).toLocaleString() : "N/A"}
                    </TableCell>
                    <TableCell>{videoSession.durationInMinutes || "N/A"}</TableCell>
                    { session?.user?.role !== "user" && <TableCell className="relative">
                      <button
                        onClick={() => toggleDropdown(videoSession._id)}
                        className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <MoreVertical size={18} />
                      </button>
                      {openDropdown === videoSession._id && (
                        <div className="absolute right-4 top-10 z-50 bg-white dark:bg-gray-800 shadow-lg border rounded w-48">
                          <ul className="text-sm py-2">
                            <li>
                              <Link
                                href={`/admin/call-sessions/${videoSession._id}`}
                                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                View &amp; Manage
                              </Link>
                            </li>
                          </ul>
                        </div>
                      )}
                    </TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <div className="mt-4 flex gap-2 justify-center">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 bg-indigo-600 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-3 py-1">{page} / {totalPages}</span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 bg-indigo-600 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default VideoSessionsPage;
