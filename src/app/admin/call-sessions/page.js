"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/admin/ui/table";
import { fetchData, postData } from "@/utils/api";
import { MoreVertical, Search, RefreshCw, Filter, Calendar, Monitor } from "lucide-react";
import Link from "next/link";
import Badge from "@/components/admin/ui/badge/Badge";
import { useToast } from "@/context/ToastContext";

const VideoSessionsPage = () => {
  const { data: session } = useSession();
  const { addToast } = useToast();
  const [sessions, setSessions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);

  // Filters State
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(""); // active | ended
  const [platform, setPlatform] = useState(""); // global | irish
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const token = session?.user?.jwt;

  const loadSessions = useCallback(async (currentPage, token) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(search && { search }),
        ...(status && { status }),
        ...(platform && { platform }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      });

      const endpoint = `video-sessions/get/all/paginated?${query.toString()}`;
      const data = await fetchData(endpoint, token);
      if (data.success) {
        setSessions(data.data);
        setTotalPages(data.pages || 1);
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
      addToast("Failed to load sessions", "error");
    } finally {
      setLoading(false);
    }
  }, [search, status, platform, dateFrom, dateTo, addToast]);

  useEffect(() => {
    if (token) {
      loadSessions(page, token);
    }
  }, [token, page, loadSessions]);

  const handleReactivate = async (id) => {
    try {
      const res = await postData(`video-sessions/reactivate/${id}`, {}, token);
      if (res.success) {
        addToast("Session reactivated successfully", "success");
        loadSessions(page, token);
      }
    } catch (error) {
      console.error("Reactivation error:", error);
      addToast(error.message || "Failed to reactivate session", "error");
    } finally {
      setOpenDropdown(null);
    }
  };

  const toggleDropdown = (id) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setPlatform("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Video Sessions</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and monitor all video consultation calls</p>
        </div>
        
        <div className="flex items-center gap-2">
            <button 
                onClick={() => loadSessions(page, token)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
            >
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
        </div>
      </div>

      {/* Modern Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search names..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500/20 text-sm transition-all"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dropdown-icon" size={18} />
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500/20 text-sm appearance-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="active">Ongoing / Active</option>
            <option value="ended">Ended / Completed</option>
          </select>
        </div>

        <div className="relative">
          <Monitor className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select
            value={platform}
            onChange={(e) => { setPlatform(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500/20 text-sm appearance-none cursor-pointer"
          >
            <option value="">All Platforms</option>
            <option value="global">Global Portal</option>
            <option value="irish">Irish Portal</option>
          </select>
        </div>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500/20 text-sm transition-all"
          />
        </div>

        <button
          onClick={clearFilters}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 py-2 rounded-lg transition-colors border border-indigo-100 dark:border-indigo-800/30"
        >
          Clear All Filters
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="min-w-[1000px]">
            <Table>
              <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50">
                <TableRow>
                  <TableCell isHeader className="font-semibold text-gray-600 dark:text-gray-300">User / Patient</TableCell>
                  <TableCell isHeader className="font-semibold text-gray-600 dark:text-gray-300">Specialist</TableCell>
                  <TableCell isHeader className="font-semibold text-gray-600 dark:text-gray-300">Platform</TableCell>
                  <TableCell isHeader className="font-semibold text-gray-600 dark:text-gray-300">Time Segment</TableCell>
                  <TableCell isHeader className="font-semibold text-gray-600 dark:text-gray-300">Status</TableCell>
                  <TableCell isHeader className="font-semibold text-gray-600 dark:text-gray-300 text-right">Actions</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-50 dark:divide-gray-800">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell colSpan={6} className="py-6">
                        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : sessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                            <Monitor size={48} className="text-gray-200" />
                            <p>No video sessions found matching your criteria</p>
                        </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sessions.map((videoSession) => (
                    <TableRow key={videoSession._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                        <div className="flex flex-col">
                            <span>{videoSession.user?.firstName} {videoSession.user?.lastName}</span>
                            <span className="text-xs text-gray-400 font-normal">{videoSession.user?.email || "No email"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 text-xs font-bold">
                                {videoSession.specialist?.firstName?.charAt(0)}{videoSession.specialist?.lastName?.charAt(0)}
                             </div>
                             <span>{videoSession.specialist?.firstName} {videoSession.specialist?.lastName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="light" color="info" className="capitalize">
                            {videoSession.platform || "global"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {videoSession.startTime ? new Date(videoSession.startTime).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }) : "Not started"}
                          </span>
                          <span className="text-xs text-gray-400">
                            {videoSession.durationInMinutes ? `${videoSession.durationInMinutes} mins duration` : "Ongoing..."}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {videoSession.endTime ? (
                          <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 border-none">Ended</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500 hover:bg-green-200 border-none animate-pulse">Live Now</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => toggleDropdown(videoSession._id)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            <MoreVertical size={18} />
                          </button>
                          {openDropdown === videoSession._id && (
                            <div className="absolute right-0 top-10 z-50 bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 rounded-xl w-56 overflow-hidden animate-in fade-in zoom-in duration-200">
                              <div className="py-2">
                                <Link
                                  href={`/admin/call-sessions/${videoSession._id}`}
                                  className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                  View Session Details
                                </Link>
                                {videoSession.endTime && session?.user?.role !== "user" && (
                                  <button
                                    onClick={() => handleReactivate(videoSession._id)}
                                    className="w-full text-left px-4 py-2.5 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center gap-2"
                                  >
                                    <RefreshCw size={14} />
                                    Reactivate Session
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="p-6 bg-gray-50/30 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoSessionsPage;
